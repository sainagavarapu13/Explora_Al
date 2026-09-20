import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, GenerateContentResponse } from '@google/genai';
import OpenAI from 'openai';
import { createServer as createViteServer } from 'vite';

dotenv.config({ path: '.env.local' });

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Body parser with 50mb limit for base64 images (landmark recognition, photo sharing)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Track OpenAI quota exhaustion state
let isOpenAIQuotaExhausted = false;

// Initialize OpenAI client (Server-Side only)
let openAIClient: OpenAI | null = null;
function getOpenAIClient(): OpenAI | null {
  if (isOpenAIQuotaExhausted) return null;
  if (!openAIClient && process.env.OPENAI_API_KEY) {
    openAIClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openAIClient;
}

// Initialize GoogleGenAI client (Server-Side only)
let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Utility: Sleep for backoff
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper to convert any image payload (URL or base64 data URI) into inlineData for Gemini API
async function resolveImageToInlineData(input: string): Promise<{ data: string; mimeType: string } | null> {
  if (!input || typeof input !== 'string') return null;

  const trimmed = input.trim();

  // If it's a remote URL (e.g. Unsplash, CDN, etc.)
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    try {
      const response = await fetch(trimmed, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      if (!response.ok) {
        console.warn(`Failed to fetch image from URL: ${trimmed} - Status: ${response.status}`);
        return null;
      }
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const base64 = buffer.toString('base64');
      const contentType = response.headers.get('content-type') || 'image/jpeg';
      const cleanMimeType = contentType.split(';')[0].trim() || 'image/jpeg';
      return {
        data: base64,
        mimeType: cleanMimeType.startsWith('image/') ? cleanMimeType : 'image/jpeg'
      };
    } catch (err: any) {
      console.error('Error fetching remote image URL:', err?.message || err);
      return null;
    }
  }

  // If it's a data URI or raw base64 string
  let mimeType = 'image/jpeg';
  let cleanBase64 = trimmed;

  const match = trimmed.match(/^data:(image\/[a-zA-Z0-9.+_-]+);base64,(.+)$/);
  if (match) {
    mimeType = match[1];
    cleanBase64 = match[2];
  } else {
    // If it starts with data: but wasn't matched properly
    cleanBase64 = trimmed.replace(/^data:image\/[a-zA-Z0-9.+_-]+;base64,/, '');
  }

  // Remove any whitespace/newlines
  cleanBase64 = cleanBase64.replace(/\s/g, '');
  if (!cleanBase64) return null;

  return {
    data: cleanBase64,
    mimeType
  };
}

// Robust Gemini execution helper with model fallback and exponential retry
async function generateContentWithFallback(params: {
  contents: any;
  config?: any;
  models?: string[];
}): Promise<GenerateContentResponse> {
  const ai = getAIClient();
  if (!ai) {
    throw new Error('Gemini API client not initialized (GEMINI_API_KEY missing)');
  }

  // Model fallback chain: gemini-3.7-flash -> gemini-flash-latest -> gemini-3.1-flash-lite
  const candidateModels = params.models || [
    'gemini-3.7-flash',
    'gemini-flash-latest',
    'gemini-3.1-flash-lite',
  ];

  let lastError: any = null;

  for (const model of candidateModels) {
    // Retry up to 2 times per model for transient 503/429
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: params.contents,
          config: params.config,
        });
        return response;
      } catch (err: any) {
        lastError = err;
        const errMsg = err?.message || String(err);
        const isTransient =
          errMsg.includes('503') ||
          errMsg.includes('UNAVAILABLE') ||
          errMsg.includes('high demand') ||
          errMsg.includes('429') ||
          errMsg.includes('RESOURCE_EXHAUSTED') ||
          errMsg.includes('overloaded');

        if (isTransient && attempt === 0) {
          // Wait 600ms before retry
          await sleep(600);
          continue;
        }
        // If not transient or second attempt failed, break to next model in fallback list
        break;
      }
    }
  }

  throw lastError || new Error('All model candidates failed');
}

// Clean JSON text returned by model (strips markdown codeblocks)
function cleanJsonString(rawText: string): string {
  if (!rawText) return '{}';
  let cleaned = rawText.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  return cleaned.trim();
}

// 1. Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    openaiConfigured: Boolean(process.env.OPENAI_API_KEY),
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
  });
});

// Comprehensive Heuristic Database for Top Global Cities & Scenic Villages (Fallback & Instant Resolution)
const GLOBAL_EXPLORATION_PRESETS: Record<string, { city: any; places: any[] }> = {
  'mawlynnong': {
    city: {
      id: 'mawlynnong',
      name: 'Mawlynnong',
      country: 'India',
      tagline: "Asia's Cleanest Village, Living Root Bridges & Bamboo Skywalks",
      currency: 'INR',
      currencySymbol: '₹',
      lat: 25.2017,
      lng: 91.8797,
      heroImage: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
      weather: { temp: '21°C', condition: 'Misty & Lush Green', icon: 'CloudRain', humidity: '78%' },
      safetyRating: '5.0 / 5',
      bestSeason: 'June - Nov (Monsoon & Autumn)',
      emergencyNumbers: { police: '100', ambulance: '108', touristHelpline: '1363' },
      suggestedLanguage: 'Khasi / English',
      isVillageOrTown: true,
    },
    places: [
      {
        id: 'maw-1',
        name: 'Single Decker Living Root Bridge (Riwai)',
        city: 'Mawlynnong',
        country: 'India',
        category: 'nature',
        rating: 4.9,
        reviewCount: 8400,
        approxCost: '₹30 entry',
        description: 'Spectacular botanical engineering created over centuries by intertwining aerial roots of Ficus elastica trees across rushing jungle streams.',
        bestTimeToVisit: 'Morning 8:00 AM',
        openingHours: '7:00 AM - 5:30 PM',
        lat: 25.2045,
        lng: 91.8830,
        image: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=800&q=80',
        tags: ['LivingRootBridge', 'Meghalaya', 'BioEngineering', 'Nature'],
        isTrending: true
      },
      {
        id: 'maw-2',
        name: 'Sky View Bamboo Machan (Bangladesh Plains Viewpoint)',
        city: 'Mawlynnong',
        country: 'India',
        category: 'viewpoint',
        rating: 4.7,
        reviewCount: 3200,
        approxCost: '₹20',
        description: 'An 85-foot-high tree-top platform hand-crafted entirely from local bamboo, offering sweeping 360-degree vistas extending into Bangladesh.',
        bestTimeToVisit: '4:00 PM - 5:30 PM Sunset',
        openingHours: '6:30 AM - 6:00 PM',
        lat: 25.2025,
        lng: 91.8790,
        image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
        tags: ['Skywalk', 'Bamboo', 'Panoramic', 'BorderView'],
        isTrending: true
      },
      {
        id: 'maw-3',
        name: 'Church of the Epiphany (100-Year Heritage)',
        city: 'Mawlynnong',
        country: 'India',
        category: 'culture',
        rating: 4.8,
        reviewCount: 1900,
        approxCost: 'Free entry',
        description: 'Black-stone European styled church built in 1902 surrounded by lush orange and betel nut groves and manicured floral gardens.',
        bestTimeToVisit: 'Morning light',
        openingHours: 'Open Daily',
        lat: 25.2010,
        lng: 91.8805,
        image: 'https://images.unsplash.com/photo-1548625361-195fe20a9a40?auto=format&fit=crop&w=800&q=80',
        tags: ['HeritageChurch', 'Architecture', 'Peaceful'],
        isTrending: false
      },
      {
        id: 'maw-4',
        name: 'Local Khasi Homestay & Bamboo Kitchen',
        city: 'Mawlynnong',
        country: 'India',
        category: 'restaurant',
        rating: 4.8,
        reviewCount: 2100,
        approxCost: '₹150 - ₹300 per meal',
        description: 'Savor traditional Khasi organic meal with local red rice, bamboo shoot chicken, fresh garden herbs, and hand-plucked wild berries.',
        bestTimeToVisit: 'Lunch 1:00 PM',
        openingHours: '11:00 AM - 8:30 PM',
        lat: 25.2020,
        lng: 91.8785,
        image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
        tags: ['KhasiFood', 'Organic', 'Homestay', 'Authentic'],
        isTrending: true
      }
    ]
  },
  'hallstatt': {
    city: {
      id: 'hallstatt',
      name: 'Hallstatt',
      country: 'Austria',
      tagline: 'Fairy Tale Alpine Village on Lake Hallstatt with 7,000 Years of Salt Mining History',
      currency: 'EUR',
      currencySymbol: '€',
      lat: 47.5622,
      lng: 13.6493,
      heroImage: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&w=1200&q=80',
      weather: { temp: '16°C', condition: 'Crisp Mountain Breeze', icon: 'Sun', humidity: '52%' },
      safetyRating: '4.9 / 5',
      bestSeason: 'May - Oct (Summer) or Dec - Feb (Snow Magic)',
      emergencyNumbers: { police: '133', ambulance: '144', touristHelpline: '112' },
      suggestedLanguage: 'German',
      isVillageOrTown: true,
    },
    places: [
      {
        id: 'hall-1',
        name: 'Classic Hallstatt Postcard Viewpoint',
        city: 'Hallstatt',
        country: 'Austria',
        category: 'viewpoint',
        rating: 4.9,
        reviewCount: 38000,
        approxCost: 'Free access',
        description: 'The world-famous vantage point overlooking 16th-century pastel wooden chalets and the spire of the Evangelical Church against the calm alpine lake.',
        bestTimeToVisit: 'Early morning 7:00 AM before day-trippers arrive',
        openingHours: 'Open 24 Hours',
        lat: 47.5646,
        lng: 13.6489,
        image: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&w=800&q=80',
        tags: ['PostcardView', 'Photography', 'AlpineLake', 'Iconic'],
        isTrending: true
      },
      {
        id: 'hall-2',
        name: 'Hallstatt Salt Mine (Salzwelten & Skywalk)',
        city: 'Hallstatt',
        country: 'Austria',
        category: 'attraction',
        rating: 4.8,
        reviewCount: 19500,
        approxCost: '€36 (Funicular + Mine Tour)',
        description: 'The oldest known salt mine in the world with subterranean wooden slides, prehistoric mining artifacts, and a floating cantilevered panoramic skywalk.',
        bestTimeToVisit: '10:00 AM',
        openingHours: '9:00 AM - 5:00 PM',
        lat: 47.5583,
        lng: 13.6420,
        image: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=800&q=80',
        tags: ['SaltMine', 'Skywalk', 'UNESCO', 'Prehistoric'],
        isTrending: true
      },
      {
        id: 'hall-3',
        name: 'Hallstatt Beinhaus (Charnel Bone House)',
        city: 'Hallstatt',
        country: 'Austria',
        category: 'culture',
        rating: 4.6,
        reviewCount: 7800,
        approxCost: '€2 entry',
        description: 'Intriguing 12th-century chapel cave housing over 600 hand-painted decorative human skulls inscribed with floral motifs and family monograms.',
        bestTimeToVisit: 'Afternoon',
        openingHours: '10:00 AM - 6:00 PM',
        lat: 47.5629,
        lng: 13.6485,
        image: 'https://images.unsplash.com/photo-1548625361-195fe20a9a40?auto=format&fit=crop&w=800&q=80',
        tags: ['HistoricChapel', 'FolkArt', 'Unique'],
        isTrending: false
      },
      {
        id: 'hall-4',
        name: 'Seehotel Gruner Baum Lakeside Terrace',
        city: 'Hallstatt',
        country: 'Austria',
        category: 'restaurant',
        rating: 4.7,
        reviewCount: 4200,
        approxCost: '€25 - €45 per person',
        description: 'Historic lakeside dining serving freshly caught Reinanke fish from Lake Hallstatt paired with Austrian Grüner Veltliner wine.',
        bestTimeToVisit: 'Sunset Dinner 6:30 PM',
        openingHours: '12:00 PM - 9:30 PM',
        lat: 47.5620,
        lng: 13.6492,
        image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
        tags: ['LakeDining', 'FreshFish', 'AustrianCuisine', 'Romantic'],
        isTrending: true
      }
    ]
  },
  'zermatt': {
    city: {
      id: 'zermatt',
      name: 'Zermatt',
      country: 'Switzerland',
      tagline: 'Car-Free Alpine Wonder at the Foot of the Majestic Matterhorn',
      currency: 'CHF',
      currencySymbol: 'CHF',
      lat: 45.9765,
      lng: 7.7491,
      heroImage: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=1200&q=80',
      weather: { temp: '14°C', condition: 'Crisp Alpine Sun', icon: 'Sun', humidity: '45%' },
      safetyRating: '5.0 / 5',
      bestSeason: 'June - Sept (Hiking) or Dec - April (Skiing)',
      emergencyNumbers: { police: '117', ambulance: '144', touristHelpline: '112' },
      suggestedLanguage: 'German / French',
      isVillageOrTown: true,
    },
    places: [
      {
        id: 'zer-1',
        name: 'Gornergrat Cogwheel Railway & Observation Platform',
        city: 'Zermatt',
        country: 'Switzerland',
        category: 'viewpoint',
        rating: 4.9,
        reviewCount: 41000,
        approxCost: 'CHF 88 return',
        description: 'Ascend to 3,089m on Europe’s highest open-air cogwheel railway offering unmatched panoramas of 29 four-thousand-meter mountain peaks and the Matterhorn.',
        bestTimeToVisit: '8:30 AM first train for clear mountain skies',
        openingHours: '7:00 AM - 7:00 PM',
        lat: 45.9839,
        lng: 7.7844,
        image: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=800&q=80',
        tags: ['Matterhorn', 'CogwheelTrain', 'Glaciers', 'Panoramic'],
        isTrending: true
      },
      {
        id: 'zer-2',
        name: 'Riffelsee Mirror Reflection Lake',
        city: 'Zermatt',
        country: 'Switzerland',
        category: 'nature',
        rating: 4.9,
        reviewCount: 15200,
        approxCost: 'Free trail access',
        description: 'Crystal-clear alpine lake perfectly mirroring the pyramid silhouette of the Matterhorn in calm early morning conditions.',
        bestTimeToVisit: 'Morning 9:00 AM',
        openingHours: 'Open during hiking season',
        lat: 45.9830,
        lng: 7.7660,
        image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
        tags: ['MirrorLake', 'MatterhornReflection', 'AlpineHike'],
        isTrending: true
      },
      {
        id: 'zer-3',
        name: 'Hinterdorf (Old Village Wood Barns)',
        city: 'Zermatt',
        country: 'Switzerland',
        category: 'culture',
        rating: 4.7,
        reviewCount: 6500,
        approxCost: 'Free stroll',
        description: 'Narrow historic alley lined with 30 ancient larchwood barns and storehouses built between the 16th and 18th centuries on circular stone slabs to keep mice away.',
        bestTimeToVisit: 'Late afternoon',
        openingHours: 'Open 24 Hours',
        lat: 45.9770,
        lng: 7.7485,
        image: 'https://images.unsplash.com/photo-1548625361-195fe20a9a40?auto=format&fit=crop&w=800&q=80',
        tags: ['OldVillage', 'WoodenChalets', 'History'],
        isTrending: false
      },
      {
        id: 'zer-4',
        name: 'Chez Vrony (Alpine Gourmet Mountain Chalet)',
        city: 'Zermatt',
        country: 'Switzerland',
        category: 'restaurant',
        rating: 4.9,
        reviewCount: 8900,
        approxCost: 'CHF 40 - CHF 70',
        description: 'Legendary organic mountain restaurant in Findeln serving dry-cured beef, traditional cheese fondue, and alpine lamb with front-row Matterhorn terrace sunbeds.',
        bestTimeToVisit: 'Lunch 12:30 PM (Reservation essential)',
        openingHours: '10:00 AM - 5:00 PM',
        lat: 46.0080,
        lng: 7.7710,
        image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
        tags: ['Fondue', 'MountainChalet', 'Organic', 'Gourmet'],
        isTrending: true
      }
    ]
  },
  'hampi': {
    city: {
      id: 'hampi',
      name: 'Hampi',
      country: 'India',
      tagline: 'UNESCO World Heritage Bolder Paradise & Ancient Vijayanagara Empire Ruins',
      currency: 'INR',
      currencySymbol: '₹',
      lat: 15.3350,
      lng: 76.4600,
      heroImage: 'https://images.unsplash.com/photo-1600100397608-f010e42e47e5?auto=format&fit=crop&w=1200&q=80',
      weather: { temp: '29°C', condition: 'Sunny & Warm Breeze', icon: 'Sun', humidity: '40%' },
      safetyRating: '4.8 / 5',
      bestSeason: 'Oct - March',
      emergencyNumbers: { police: '100', ambulance: '108', touristHelpline: '1363' },
      suggestedLanguage: 'Kannada / Hindi / English',
      isVillageOrTown: true,
    },
    places: [
      {
        id: 'hampi-1',
        name: 'Vijaya Vittala Temple & Stone Chariot',
        city: 'Hampi',
        country: 'India',
        category: 'attraction',
        rating: 4.9,
        reviewCount: 32000,
        approxCost: '₹40 Indians / ₹600 Foreigners',
        description: 'The monumental stone chariot shrine and 56 musical stone pillars (SaReGaMa pillars) resonating with melodic tones when tapped.',
        bestTimeToVisit: 'Morning 8:00 AM',
        openingHours: '8:30 AM - 5:30 PM',
        lat: 15.3370,
        lng: 76.4770,
        image: 'https://images.unsplash.com/photo-1600100397608-f010e42e47e5?auto=format&fit=crop&w=800&q=80',
        tags: ['StoneChariot', 'UNESCO', 'AncientRuins', 'Architecture'],
        isTrending: true
      },
      {
        id: 'hampi-2',
        name: 'Matanga Hill Sunrise Vantage',
        city: 'Hampi',
        country: 'India',
        category: 'viewpoint',
        rating: 4.9,
        reviewCount: 14200,
        approxCost: 'Free trek',
        description: 'The highest summit in Hampi offering an awe-inspiring 360-degree panorama of giant granite boulders, lush banana plantations, and the Tungabhadra River.',
        bestTimeToVisit: '5:45 AM for golden sunrise',
        openingHours: 'Open 24 Hours',
        lat: 15.3320,
        lng: 76.4650,
        image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
        tags: ['SunriseHike', 'PanoramicView', 'Boulders', 'Nature'],
        isTrending: true
      },
      {
        id: 'hampi-3',
        name: 'Virupaksha Temple Complex',
        city: 'Hampi',
        country: 'India',
        category: 'culture',
        rating: 4.8,
        reviewCount: 27000,
        approxCost: '₹25 entry',
        description: 'One of India’s oldest continuously functioning Hindu temples dating back to the 7th century AD with a 160-foot multi-tiered gopuram tower.',
        bestTimeToVisit: 'Early morning or evening aarti',
        openingHours: '6:00 AM - 8:00 PM',
        lat: 15.3353,
        lng: 76.4590,
        image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80',
        tags: ['AncientTemple', 'LivingHeritage', 'Gopuram'],
        isTrending: true
      },
      {
        id: 'hampi-4',
        name: 'Mango Tree River Cafe',
        city: 'Hampi',
        country: 'India',
        category: 'cafe',
        rating: 4.7,
        reviewCount: 11000,
        approxCost: '₹200 - ₹400 per person',
        description: 'Chilled bohemian open-air cafe with floor cushions, iced banana lassies, wood-fired thalis, and Israeli shakshuka.',
        bestTimeToVisit: 'Lunch or sunset dinner',
        openingHours: '8:00 AM - 10:00 PM',
        lat: 15.3340,
        lng: 76.4560,
        image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80',
        tags: ['BohemianCafe', 'Thali', 'Lassi', 'Chillout'],
        isTrending: true
      }
    ]
  }
};

// Global Location Geocoder & Curated Intelligence API
app.post('/api/ai/explore-location', async (req, res) => {
  const { query = '' } = req.body || {};
  const cleanedQuery = (query || '').trim();

  if (!cleanedQuery) {
    return res.status(400).json({ error: 'Location query is required' });
  }

  const queryKey = cleanedQuery.toLowerCase();

  // Check preset library for instantaneous rich responses
  for (const [key, data] of Object.entries(GLOBAL_EXPLORATION_PRESETS)) {
    if (queryKey.includes(key)) {
      return res.json(data);
    }
  }

  // Generate real-time exploration intelligence via Gemini AI
  try {
    const ai = getAIClient();
    if (!ai) {
      // Heuristic generic fallback for any place
      const fallbackCity = {
        id: `loc-${Date.now()}`,
        name: cleanedQuery,
        country: 'Global Destination',
        tagline: `Discover the breathtaking sights, cultural heritage, and local treasures of ${cleanedQuery}`,
        currency: 'USD',
        currencySymbol: '$',
        lat: 20.5937,
        lng: 78.9629,
        heroImage: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80',
        weather: { temp: '23°C', condition: 'Pleasant & Clear', icon: 'Sun', humidity: '50%' },
        safetyRating: '4.8 / 5',
        bestSeason: 'Year-Round',
        emergencyNumbers: { police: '911 / 112', ambulance: '911 / 112', touristHelpline: '112' },
        suggestedLanguage: 'English',
        isVillageOrTown: true
      };

      const fallbackPlaces = [
        {
          id: `p-${Date.now()}-1`,
          name: `${cleanedQuery} Historic Old Town & Heritage Square`,
          city: cleanedQuery,
          country: 'Destination',
          category: 'attraction',
          rating: 4.9,
          reviewCount: 5400,
          approxCost: 'Free / Low Cost',
          description: `The heart of ${cleanedQuery}, rich with architectural character, local markets, and century-old stone walkways.`,
          bestTimeToVisit: 'Morning 9:00 AM',
          openingHours: 'Open Daily',
          lat: 20.5937,
          lng: 78.9629,
          image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=80',
          tags: ['HistoricSquare', 'Culture', 'MustVisit'],
          isTrending: true
        },
        {
          id: `p-${Date.now()}-2`,
          name: `${cleanedQuery} Scenic Ridge Viewpoint`,
          city: cleanedQuery,
          country: 'Destination',
          category: 'viewpoint',
          rating: 4.8,
          reviewCount: 3200,
          approxCost: 'Free',
          description: `Panoramic vantage point overlooking ${cleanedQuery} with breathtaking golden hour lighting and tranquil natural scenery.`,
          bestTimeToVisit: 'Sunset 5:30 PM',
          openingHours: 'Open 24 Hours',
          lat: 20.5960,
          lng: 78.9650,
          image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
          tags: ['Sunset', 'Viewpoint', 'Photography'],
          isTrending: true
        }
      ];

      return res.json({ city: fallbackCity, places: fallbackPlaces });
    }

    const prompt = `The user wants to explore the following city, village, town, or location anywhere in the world: "${cleanedQuery}".
Analyze this place in depth. Whether it is a tiny remote village (e.g. Mawlynnong, Hallstatt, Giethoorn, Zermatt), a cultural valley, a mountain town, or a metropolis, generate accurate geocoding and rich tourism recommendations.

Return a strict JSON object with this exact schema:
{
  "city": {
    "id": "slug-name",
    "name": "Canonical Name (e.g. Mawlynnong / Zermatt / Kyoto)",
    "country": "Country Name",
    "state": "State or Province if applicable",
    "tagline": "Inspiring, poetic 1-line description capturing the destination's unique magic",
    "currency": "Currency ISO (e.g. INR, EUR, CHF, JPY, USD)",
    "currencySymbol": "Symbol (e.g. ₹, €, CHF, ¥, $)",
    "lat": exact_latitude_number,
    "lng": exact_longitude_number,
    "heroImage": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
    "weather": {
      "temp": "e.g. 22°C",
      "condition": "e.g. Clear & Pleasant / Crisp Alpine Breeze",
      "icon": "Sun",
      "humidity": "55%"
    },
    "safetyRating": "e.g. 4.9 / 5",
    "bestSeason": "e.g. Oct - March / May - Sept",
    "emergencyNumbers": {
      "police": "local police number",
      "ambulance": "local ambulance number",
      "touristHelpline": "tourist helpline or general emergency"
    },
    "suggestedLanguage": "Primary regional language spoken here (e.g. Hindi, French, German, Khasi, Japanese, Italian, Greek, Spanish)",
    "isVillageOrTown": true_or_false
  },
  "places": [
    {
      "id": "place-1",
      "name": "Exact Real Place / Landmark / Trail / Viewpoint / Cafe Name",
      "city": "Place Name",
      "country": "Country Name",
      "category": "attraction | hidden_gem | cafe | restaurant | nature | viewpoint | culture | stay",
      "rating": 4.8,
      "reviewCount": 12500,
      "approxCost": "Cost estimate in local currency and USD",
      "description": "Engaging 2-sentence description highlighting history, views, or delicacies",
      "highlights": ["highlight 1", "highlight 2", "highlight 3"],
      "bestTimeToVisit": "Best time of day",
      "openingHours": "Operating hours",
      "lat": exact_latitude_near_city,
      "lng": exact_longitude_near_city,
      "image": "https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=800&q=80",
      "tags": ["Tag1", "Tag2", "Tag3"],
      "isTrending": true
    }
  ]
}

Provide 4 to 5 highly authentic places for this location (mix of top monument/trail, hidden gem, viewpoint, and local authentic cafe/eatery). Ensure exact coordinates are valid numbers for Google Maps navigation.`;

    const response = await generateContentWithFallback({
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const cleaned = cleanJsonString(response.text || '{}');
    const result = JSON.parse(cleaned);

    // Validate coordinates
    if (result.city) {
      result.city.lat = Number(result.city.lat) || 20.5937;
      result.city.lng = Number(result.city.lng) || 78.9629;
      if (!result.city.heroImage || !result.city.heroImage.startsWith('http')) {
        result.city.heroImage = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80';
      }
    }

    if (Array.isArray(result.places)) {
      result.places.forEach((p: any, i: number) => {
        p.id = p.id || `place-dyn-${i}-${Date.now()}`;
        p.lat = Number(p.lat) || (result.city?.lat ? result.city.lat + (i * 0.002) : 20.5937);
        p.lng = Number(p.lng) || (result.city?.lng ? result.city.lng + (i * 0.002) : 78.9629);
        if (!p.image || !p.image.startsWith('http')) {
          p.image = 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=800&q=80';
        }
      });
    }

    return res.json(result);
  } catch (error: any) {
    console.error('Explore Location AI Error:', error?.message || error);
    // Fallback response
    const safeCity = {
      id: `loc-${Date.now()}`,
      name: cleanedQuery,
      country: 'Global Destination',
      tagline: `Experience the unique culture, scenic landmarks, and local flavors of ${cleanedQuery}`,
      currency: 'USD',
      currencySymbol: '$',
      lat: 20.5937,
      lng: 78.9629,
      heroImage: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80',
      weather: { temp: '22°C', condition: 'Pleasant Breeze', icon: 'Sun', humidity: '48%' },
      safetyRating: '4.8 / 5',
      bestSeason: 'Year-Round',
      emergencyNumbers: { police: '112', ambulance: '112', touristHelpline: '112' },
      suggestedLanguage: 'English',
      isVillageOrTown: true
    };
    return res.json({ city: safeCity, places: [] });
  }
});

// Strict Travel-Only AI System Instruction
const TRAVEL_ONLY_SYSTEM_PROMPT = `You are ExploraAI, an intelligent, enthusiastic AI Smart Travel Copilot and Destination Guide.

CRITICAL INSTRUCTION - STRICT TRAVEL-ONLY DOMAIN BOUNDARY:
- You MUST ONLY answer questions related to travel, tourism, vacation planning, city and village exploration, itineraries, sightseeing, landmarks, monuments, cultural heritage, local food & dining, accommodations, packing lists, budget calculations for trips, transportation/flights/trains/cabs, visa guidance, and tourist safety.
- If the user asks ANY question that is NOT related to travel, tourism, or destination exploration (such as writing computer code, debugging software, math equations, school homework, politics, non-travel history, general medicine/prescriptions, technical coding tutorials, or arbitrary non-travel topics), YOU MUST POLITELY AND FIRMLY DECLINE and guide the user back to travel:
"I am ExploraAI, your dedicated AI Travel Copilot! ✈️🌍 I can only assist with travel-related questions such as destination guides, custom itineraries, sightseeing landmarks, local food recommendations, and travel advice for your journeys. How can I assist with your travels today?"

When answering travel questions:
- Provide rich, structured markdown with bullet points and bold highlights.
- Mention budget estimates in the local currency or standard currency when helpful.
- Offer actionable local tips, hidden gems, and safety pointers for the destination.`;

// 2. Multimodal AI Chatbot (Image Sharing + Voice/Text questions)
app.post('/api/ai/chat', async (req, res) => {
  const { message, imageBase64, cityContext, city, history = [] } = req.body || {};
  const activeCity = cityContext || city || 'your destination';
  const userText = (message || '').trim();

  // Guardrail check: if explicitly requested non-travel topics, redirect immediately
  const nonTravelKeywords = [
    'write code', 'write a function', 'write script', 'javascript', 'python', 'c++', 'html', 'css', 'react component',
    'debug code', 'programming', 'binary search', 'fibonacci', 'solve math', 'equation', 'quantum physics',
    'election results', 'write an essay', 'homework', 'medical prescription', 'crypto trading', 'stock market analysis'
  ];
  const lowerQuery = userText.toLowerCase();
  const isExplicitlyNonTravel = nonTravelKeywords.some(kw => lowerQuery.includes(kw)) || /^(solve|debug|write code|code a|calculate \d+)/i.test(userText);

  if (isExplicitlyNonTravel) {
    return res.json({
      text: `I am ExploraAI, your dedicated AI Travel Copilot! ✈️🌍 I am designed exclusively to assist with travel-related questions such as destination guides, custom itineraries, sightseeing landmarks, local food recommendations, and travel tips for **${activeCity}** or anywhere around the world.\n\nHow can I help you plan your journey or explore **${activeCity}** today?`
    });
  }

  // 1. Try OpenAI API first (with provided OpenAI API key)
  const openai = getOpenAIClient();
  if (openai) {
    try {
      const messages: any[] = [
        { role: 'system', content: TRAVEL_ONLY_SYSTEM_PROMPT }
      ];

      if (imageBase64) {
        const cleanBase64 = imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`;
        messages.push({
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Destination context: ${activeCity}\nUser Travel Question / Photo: ${userText || 'Analyze this travel landmark or destination photo for ' + activeCity}`
            },
            {
              type: 'image_url',
              image_url: { url: cleanBase64 }
            }
          ]
        });
      } else {
        messages.push({
          role: 'user',
          content: `Destination context: ${activeCity}\nUser Travel Question: ${userText || 'What are the top must-visit places and travel tips for ' + activeCity + '?'}`
        });
      }

      const completion = await openai.chat.completions.create(
        {
          model: 'gpt-4o-mini',
          messages,
          temperature: 0.7,
          max_tokens: 1200,
        },
        { timeout: 8000 }
      );

      const replyText = completion.choices[0]?.message?.content;
      if (replyText) {
        return res.json({ text: replyText });
      }
    } catch (openaiErr: any) {
      const errMsg = openaiErr?.message || String(openaiErr);
      if (errMsg.includes('429') || errMsg.includes('credits') || errMsg.includes('quota') || errMsg.includes('billing')) {
        isOpenAIQuotaExhausted = true;
        console.warn('OpenAI quota exhausted (429), smoothly transitioning to Gemini engine.');
      } else {
        console.warn('OpenAI Chat error, falling back to Gemini:', errMsg);
      }
    }
  }

  // 2. Fallback to Gemini
  try {
    const ai = getAIClient();
    if (ai) {
      const parts: any[] = [];
      if (imageBase64) {
        const inlineImg = await resolveImageToInlineData(imageBase64);
        if (inlineImg) {
          parts.push({
            inlineData: {
              mimeType: inlineImg.mimeType,
              data: inlineImg.data,
            },
          });
        }
      }
      parts.push({
        text: `Destination context: ${activeCity}\nUser Question: ${userText || 'What do you recommend doing in this city?'}`
      });

      const response = await generateContentWithFallback({
        contents: { parts },
        config: {
          systemInstruction: TRAVEL_ONLY_SYSTEM_PROMPT,
          temperature: 0.7,
        },
      });

      const replyText = response.text;
      if (replyText) {
        return res.json({ text: replyText });
      }
    }
  } catch (geminiErr: any) {
    console.error('Gemini Chat Error:', geminiErr?.message || geminiErr);
  }

  // 3. Fallback curated travel guide
  return res.json({
    text: `🌟 **ExploraAI Travel Guide for ${activeCity}**:\n\n- **Must-Visit**: Explore the central historic quarter, local heritage palaces, and cultural stepwells.\n- **Culinary Tip**: Don't miss authentic regional street delicacies and heritage rooftop tea lounges.\n- **Budget Hack**: Take shared transit or official day passes to save up to 40% on transportation.\n- **Photo Angle**: Visit viewpoints 45 minutes before sunset for the best lighting!`,
    recommendations: [
      { title: `${activeCity} Iconic Landmark`, type: 'Attraction', cost: '₹150' },
      { title: 'Traditional Heritage Eatery', type: 'Dining', cost: '₹300 - ₹500' },
      { title: 'City Panoramic Viewpoint', type: 'Scenic Spot', cost: 'Free' }
    ]
  });
});

// 3. Camera-based Landmark & Monument Recognition
app.post('/api/ai/landmark-recognize', async (req, res) => {
  const { imageBase64, cityContext, city } = req.body || {};
  const activeCity = cityContext || city || 'Jaipur';

  const defaultLandmarkFallback = {
    name: activeCity.toLowerCase().includes('jaipur') ? 'Hawa Mahal (Palace of Winds)' : activeCity.toLowerCase().includes('paris') ? 'Eiffel Tower' : 'Famous Cultural Landmark',
    confidence: 96,
    city: activeCity,
    country: activeCity.toLowerCase().includes('paris') ? 'France' : 'India',
    category: 'Monument & Palace',
    architecturalStyle: 'Heritage Regional Architecture',
    historicalPeriod: 'Built in 1799 by Royal Patronage',
    shortOverview: 'A magnificent heritage facade featuring intricately carved windows and airy balconies, allowing visitors to enjoy panoramic street views and traditional cooling architecture.',
    keyFacts: [
      'Engineered with natural air-circulation windows for summer comfort.',
      'One of the most photographed architectural wonders in the region.',
      'Represents a harmonious blend of royal culture and artistry.'
    ],
    bestTimeToVisit: '8:30 AM - 11:00 AM (best lighting for photography)',
    ticketPrice: '₹50 for domestic visitors | ₹200 for international tourists',
    timings: ['Open Daily: 9:00 AM - 5:00 PM', 'Night illumination: 7:00 PM - 10:00 PM'],
    proTips: [
      'Visit the opposite rooftop cafes for the iconic unobstructed frontal photograph.',
      'Arrive early morning to beat the afternoon crowds and heat.',
      'Check if a composite heritage ticket is available for multiple nearby monuments.'
    ],
    nearbyRecommendations: [
      { name: `${activeCity} Royal Palace Museum`, type: 'Royal Residence', distance: '500m', description: 'Museum with royal textiles, armory, and courtyards.' },
      { name: 'Heritage Astronomical Observatory', type: 'UNESCO Site', distance: '450m', description: 'World-famous geometric stone instruments.' },
      { name: 'Rooftop Heritage Cafe', type: 'Cafe & Viewpoint', distance: '60m', description: 'Direct eye-level terrace view of the monument facade.' }
    ],
    audioGuideScript: `Welcome to this majestic historic landmark in ${activeCity}. Built as an architectural jewel of the region, this structure allowed observers to view festive street celebrations while remaining protected. Notice the intricate geometric carvings and specialized wind corridors that keep the interior remarkably cool even in peak summer.`
  };

  try {
    if (!imageBase64) {
      return res.json(defaultLandmarkFallback);
    }

    const ai = getAIClient();
    if (!ai) {
      return res.json(defaultLandmarkFallback);
    }

    const resolvedImage = await resolveImageToInlineData(imageBase64);
    if (!resolvedImage) {
      return res.json(defaultLandmarkFallback);
    }

    const prompt = `Analyze this landmark / tourist attraction photo.
If it's a known monument, palace, museum, natural wonder, temple, statue, or street, identify it precisely.
Context city (if known): ${activeCity}.
Return a JSON object strictly adhering to this structure:
{
  "name": "Full Name of Landmark",
  "confidence": 95,
  "city": "City Name",
  "country": "Country Name",
  "category": "e.g. Palace / Fortress / Museum / Cathedral / Natural Wonder",
  "architecturalStyle": "Architectural style",
  "historicalPeriod": "Era or year built",
  "shortOverview": "2-3 sentences concise engaging summary",
  "keyFacts": ["fact 1", "fact 2", "fact 3"],
  "bestTimeToVisit": "Best time of day or season",
  "ticketPrice": "Ticket price range in local currency and approx USD",
  "timings": ["Opening hours and days"],
  "proTips": ["insider tip 1", "photo angle tip 2", "crowd avoidance tip 3"],
  "nearbyRecommendations": [
    { "name": "Nearby Spot 1", "type": "Attraction / Cafe / Market", "distance": "300m", "description": "Quick description" },
    { "name": "Nearby Spot 2", "type": "Attraction / Cafe / Market", "distance": "700m", "description": "Quick description" }
  ],
  "audioGuideScript": "A captivating 40-second audio guide script that can be read aloud to the tourist explaining the story behind this landmark."
}`;

    const response = await generateContentWithFallback({
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: resolvedImage.mimeType,
              data: resolvedImage.data,
            },
          },
          { text: prompt },
        ],
      },
      config: {
        responseMimeType: 'application/json',
      },
    });

    const cleaned = cleanJsonString(response.text || '{}');
    const parsed = JSON.parse(cleaned);
    return res.json(parsed);
  } catch (error: any) {
    console.error('Landmark Recognition (Graceful Fallback):', error?.message || error);
    return res.json(defaultLandmarkFallback);
  }
});

// 4. Natural Language Place Search (e.g. "best cafes under ₹500")
app.post('/api/ai/search-places', async (req, res) => {
  const { query = '', cityContext, city } = req.body || {};
  const activeCity = cityContext || city || 'Jaipur';

  const defaultPlaces = [
    {
      id: `place-ai-1`,
      name: `${activeCity} Rooftop Artisan Cafe`,
      city: activeCity,
      country: activeCity.toLowerCase().includes('paris') ? 'France' : 'India',
      category: 'cafe',
      rating: 4.8,
      reviewCount: 3200,
      priceRange: '₹',
      approxCost: '₹350 - ₹550 for two',
      description: `Scenic spot matching "${query || 'local cafe'}" with panoramic skyline views, artisan coffees, and local bites.`,
      highlights: ['Under ₹500', 'Rooftop seating', 'High-Speed Wi-Fi'],
      bestTimeToVisit: '5:00 PM - 8:00 PM',
      openingHours: '8:30 AM - 11:00 PM',
      lat: 26.915,
      lng: 75.815,
      image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80',
      tags: ['Budget Friendly', 'Cafe', 'Scenic View'],
      address: `${activeCity} Historic Center`
    },
    {
      id: `place-ai-2`,
      name: `${activeCity} Heritage Culinary Walk & Bites`,
      city: activeCity,
      country: activeCity.toLowerCase().includes('paris') ? 'France' : 'India',
      category: 'hidden_gem',
      rating: 4.9,
      reviewCount: 4800,
      priceRange: '₹',
      approxCost: '₹150 - ₹300 per person',
      description: 'Authentic regional street food vendors, century-old sweet shops, and heritage alleyways.',
      highlights: ['Authentic recipes', 'Pocket friendly', 'High hygiene standards'],
      bestTimeToVisit: 'Morning 9:00 AM or Evening 6:00 PM',
      openingHours: '7:30 AM - 9:30 PM',
      lat: 26.920,
      lng: 75.820,
      image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
      tags: ['Street Food', 'Authentic', 'Must Try'],
      address: `${activeCity} Bazaar Main Lane`
    },
    {
      id: `place-ai-3`,
      name: `${activeCity} Sunset Ridge Viewpoint`,
      city: activeCity,
      country: activeCity.toLowerCase().includes('paris') ? 'France' : 'India',
      category: 'hidden_gem',
      rating: 4.9,
      reviewCount: 6100,
      priceRange: 'Free',
      approxCost: 'Free / ₹50 for tea',
      description: 'Golden hour vantage point overlooking the entire cityscape and historic fort walls.',
      highlights: ['Free access', 'Unobstructed sunset', 'Great for photography'],
      bestTimeToVisit: '5:30 PM - 7:00 PM',
      openingHours: 'Open 24 Hours',
      lat: 26.935,
      lng: 75.825,
      image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
      tags: ['Sunset', 'Photography', 'Nature'],
      address: `${activeCity} Hilltop Ridge`
    }
  ];

  try {
    const ai = getAIClient();
    if (!ai) {
      return res.json({ places: defaultPlaces, results: defaultPlaces });
    }

    const prompt = `Search and curate 4-5 realistic, high-quality places in "${activeCity}" matching the user's query: "${query}".
Return a JSON array of objects with the following schema:
[
  {
    "id": "unique-slug",
    "name": "Place Name",
    "city": "${activeCity}",
    "country": "Country",
    "category": "attraction | hidden_gem | cafe | restaurant | stay | nature | culture | nightlife",
    "rating": 4.8,
    "reviewCount": 12400,
    "priceRange": "₹ | ₹₹ | $ | $$ | Free",
    "approxCost": "e.g. ₹300 - ₹500 for two",
    "description": "2 sentence description explaining why it matches the query",
    "highlights": ["highlight 1", "highlight 2", "highlight 3"],
    "bestTimeToVisit": "time window",
    "openingHours": "timings",
    "lat": 26.9124,
    "lng": 75.7873,
    "image": "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80",
    "tags": ["Tag1", "Tag2", "Tag3"],
    "address": "Locality address"
  }
]`;

    const response = await generateContentWithFallback({
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const cleaned = cleanJsonString(response.text || '[]');
    const places = JSON.parse(cleaned);
    const placeList = Array.isArray(places) && places.length > 0 ? places : defaultPlaces;
    return res.json({ places: placeList, results: placeList });
  } catch (error: any) {
    console.error('Search Places (Graceful Fallback):', error?.message || error);
    return res.json({ places: defaultPlaces, results: defaultPlaces });
  }
});

// Helper: Build dynamic itinerary fallback
function generateFallbackItinerary(params: any) {
  const {
    city = 'Jaipur',
    country = 'India',
    days = 3,
    budgetTier = 'Moderate',
    budgetAmount = '₹8,000',
    currency = 'INR',
    currencySymbol = '₹',
    travelStyle = 'Balanced Explorer',
    interests = ['Heritage', 'Cafes', 'Sunset Points']
  } = params;

  const totalNumDays = Math.max(1, Math.min(Number(days) || 3, 30));
  const numericBudget = parseInt(String(budgetAmount).replace(/\D/g, '') || '8000', 10);
  const costPerDay = Math.round(numericBudget / totalNumDays);

  const dayThemesList = [
    { title: 'Royal Forts & Iconic Palaces', theme: 'Historic Fortresses & Royal Palaces', food: 'Authentic Thali & Fresh Kulhad Lassi' },
    { title: 'Historic Bazaars, Stepwells & Artisan Cafes', theme: 'Local Crafts, Stepwells & Cuisine', food: 'Artisan Wood-Fired Pizza & Chai' },
    { title: 'Panoramic Sunsets & Street Food Feast', theme: 'Scenic Overlooks & Night Markets', food: 'Sizzling Local Kebabs & Sweets' },
    { title: 'Hidden Alleyways, Art & Architectural Gems', theme: 'Old Town Heritage & Hidden Shrines', food: 'Traditional Sweets & Herbal Infusions' },
    { title: 'Nature Trails, Valley Views & Scenic Lakes', theme: 'Serene Landscapes & Outdoor Walks', food: 'Lakeview Cafe Delicacies & Fresh Fruit Platters' },
    { title: 'Spiritual Shrines, Monasteries & Peace Gardens', theme: 'Sacred Architecture & Mindfulness', food: 'Sattvic Pure Vegetarian Delights' },
    { title: 'Local Workshops, Pottery & Textile Immersion', theme: 'Master Craftsmen & Cultural Immersion', food: 'Clay-Oven Delicacies & Local Snacks' },
    { title: 'Countryside Day Trip & Rural Village Culture', theme: 'Offbeat Village Trails & Organic Orchards', food: 'Rustic Farm-to-Table Lunch' },
    { title: 'Museums, Royal Armories & Vintage Gallerias', theme: 'Historical Collections & Relics', food: 'Classic Royal Tea Room Treats' },
    { title: 'Botanical Conservatories & Hidden Courtyards', theme: 'Quiet Oases & Floral Pavilions', food: 'Herbal Blends & Organic Pastries' },
    { title: 'Local Music, Folklore & Evening Amphitheater', theme: 'Traditional Performing Arts & Storytelling', food: 'Regional Spiced Broths & Crisps' },
    { title: 'Architectural Ruins & Astronomy Observatories', theme: 'Celestial History & Ancient Masonry', food: 'Heritage Courtyard Dining' },
    { title: 'Culinary Masterclass & Spice Trail Walk', theme: 'Gastronomy, Farmers Markets & Tastings', food: 'Chef-Tasting Regional Sampler' },
    { title: 'Riverside Walkways & Lantern Illumination', theme: 'Twilight Promenades & Reflections', food: 'Riverfront Grilled Specialties' },
  ];

  const fallbackDays = [];
  for (let i = 1; i <= totalNumDays; i++) {
    const themeObj = dayThemesList[(i - 1) % dayThemesList.length];
    fallbackDays.push({
      dayNumber: i,
      title: `Day ${i}: ${themeObj.title}`,
      theme: themeObj.theme,
      foodSpecialty: themeObj.food,
      totalDayEstimatedCost: `${currencySymbol}${costPerDay}`,
      activities: [
        {
          timeSlot: 'Morning',
          time: '08:30 AM - 11:30 AM',
          placeName: i === 1 ? `${city} Royal Fort & Palace Complex` : `${city} Landmark #${i} - Morning Exploration`,
          category: 'Heritage Sightseeing',
          description: `Beat the daytime crowds and capture the best golden morning light across ${city}'s ancient architecture.`,
          estimatedCost: `${currencySymbol}150 entry`,
          duration: '3 hours',
          transportRecommendation: 'Metro or Auto Rickshaw (15 mins)',
          localTip: 'Wear comfortable walking shoes and bring sunglasses.'
        },
        {
          timeSlot: 'Afternoon',
          time: '01:00 PM - 03:30 PM',
          placeName: `${city} Artisan Crafts Center & Courtyard Cafe`,
          category: 'Culinary & Culture',
          description: 'Savor regional specialties followed by browsing handmade crafts, textiles, and local spices.',
          estimatedCost: `${currencySymbol}350 lunch`,
          duration: '2.5 hours',
          transportRecommendation: 'Short walking tour',
          localTip: 'Polite bargaining is customary in traditional street markets.'
        },
        {
          timeSlot: 'Evening',
          time: '05:00 PM - 07:30 PM',
          placeName: `Sunset Hilltop Overlook at ${city}`,
          category: 'Scenic Viewpoint',
          description: 'Watch the sun sink beneath the horizon as the historic city illuminates beneath you.',
          estimatedCost: `${currencySymbol}50 tea & snacks`,
          duration: '2.5 hours',
          transportRecommendation: 'Shared cab or scenic ridge ride',
          localTip: 'Arrive 40 minutes before sunset to secure prime balcony seating.'
        },
        {
          timeSlot: 'Night',
          time: '08:30 PM - 10:30 PM',
          placeName: `${city} Night Market & Street Food Square`,
          category: 'Dining & Nightlife',
          description: 'Taste authentic sizzling street foods, traditional sweets, and festive night ambiance.',
          estimatedCost: `${currencySymbol}250 dinner`,
          duration: '2 hours',
          transportRecommendation: 'Tuk-tuk or short walk',
          localTip: 'Follow the stalls with the longest local queues for peak freshness.'
        }
      ]
    });
  }

  return {
    id: `itin-${Date.now()}`,
    city,
    country,
    totalDays: totalNumDays,
    travelStyle,
    budgetTier,
    totalEstimatedBudget: budgetAmount,
    currency,
    currencySymbol,
    days: fallbackDays,
    budgetBreakdown: {
      stay: 40,
      food: 25,
      sightseeing: 18,
      transit: 12,
      buffer: 5
    },
    packingTips: [
      'Light breathable cottons & light layer for cool evenings',
      'Comfortable cushioned walking shoes for cobbled paths',
      'Universal power adapter and portable 10,000mAh battery pack',
      'Sun protection: SPF 50+ sunscreen & UV sunglasses'
    ],
    safetyAdvisory: [
      'Negotiate auto/cab fare beforehand or use standard ride apps.',
      'Keep copies of digital IDs stored offline in ExploraAI.',
      'Drink bottled or purified water.'
    ],
    createdAt: new Date().toLocaleDateString()
  };
}

// 5. Day-Wise Budget Trip Planner Generator (Supports both /api/ai/itinerary-planner and /api/ai/plan-trip)
const handleItineraryRequest = async (req: express.Request, res: express.Response) => {
  const {
    city = 'Jaipur',
    country = 'India',
    days = 3,
    budgetTier = 'Moderate',
    budgetAmount = '₹8,000',
    currency = 'INR',
    currencySymbol = '₹',
    travelStyle = 'Solo Explorer',
    pace = 'Balanced',
    interests = ['Heritage', 'Food', 'Photography']
  } = req.body || {};

  const requestedDays = Math.max(1, Math.min(Number(days) || 3, 30));

  try {
    const ai = getAIClient();
    if (!ai) {
      return res.json(generateFallbackItinerary({ ...req.body, days: requestedDays }));
    }

    const prompt = `Generate an exceptional, realistic, day-wise budget travel itinerary for:
City: ${city}
Country: ${country || 'Destination'}
Duration: ${requestedDays} days (IMPORTANT: Provide complete, distinct schedules for ALL ${requestedDays} days, from Day 1 to Day ${requestedDays})
Budget Tier: ${budgetTier} (Target Total Budget: ${budgetAmount} ${currency})
Travel Style: ${travelStyle}
Pace: ${pace}
Interests: ${Array.isArray(interests) ? interests.join(', ') : 'Heritage, Food'}

Return a strict JSON object with this exact schema:
{
  "id": "itin-generated",
  "city": "${city}",
  "country": "${country || 'Destination'}",
  "totalDays": ${requestedDays},
  "travelStyle": "${travelStyle}",
  "budgetTier": "${budgetTier}",
  "totalEstimatedBudget": "${budgetAmount}",
  "currency": "${currency}",
  "budgetBreakdown": {
    "stay": 40,
    "food": 25,
    "sightseeing": 18,
    "transit": 12,
    "buffer": 5
  },
  "packingTips": ["tip 1", "tip 2", "tip 3", "tip 4"],
  "safetyAdvisory": ["safety advice 1", "safety advice 2", "safety advice 3"],
  "days": [
    {
      "dayNumber": 1,
      "title": "Day 1: Catchy Day Theme",
      "theme": "Theme description",
      "totalDayEstimatedCost": "${currencySymbol}...",
      "foodSpecialty": "Recommended local dish for this day",
      "activities": [
        {
          "timeSlot": "Morning",
          "time": "08:30 AM - 11:30 AM",
          "placeName": "Real Attraction Name",
          "category": "Heritage / Sightseeing / Nature / Cafe",
          "description": "2 sentences describing what to see and experience",
          "estimatedCost": "${currencySymbol}...",
          "duration": "2.5 hours",
          "transportRecommendation": "Metro / Cab / Walk",
          "localTip": "Practical insider tip"
        },
        {
          "timeSlot": "Afternoon",
          "time": "12:30 PM - 03:30 PM",
          "placeName": "Real Place Name",
          "category": "Dining & Culture",
          "description": "Afternoon exploration and lunch",
          "estimatedCost": "${currencySymbol}...",
          "duration": "3 hours",
          "transportRecommendation": "Walk",
          "localTip": "Insider food or crowd tip"
        },
        {
          "timeSlot": "Evening",
          "time": "05:00 PM - 07:30 PM",
          "placeName": "Sunset Spot or Scenic Area",
          "category": "Scenic Viewpoint",
          "description": "Evening golden hour highlights",
          "estimatedCost": "${currencySymbol}...",
          "duration": "2.5 hours",
          "transportRecommendation": "Cab / Metro",
          "localTip": "Best view angle or time"
        },
        {
          "timeSlot": "Night",
          "time": "08:00 PM - 10:30 PM",
          "placeName": "Night Bazaar or Dinner Spot",
          "category": "Dining & Nightlife",
          "description": "Dinner experience and night stroll",
          "estimatedCost": "${currencySymbol}...",
          "duration": "2 hours",
          "transportRecommendation": "Walk / Cab",
          "localTip": "Signature dish to order"
        }
      ]
    }
  ]
}`;

    const response = await generateContentWithFallback({
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const cleaned = cleanJsonString(response.text || '{}');
    const parsed = JSON.parse(cleaned);
    parsed.id = `itin-${Date.now()}`;
    parsed.createdAt = new Date().toLocaleDateString();
    return res.json(parsed);
  } catch (error: any) {
    console.error('Itinerary Planner (Graceful Fallback):', error?.message || error);
    return res.json(generateFallbackItinerary(req.body));
  }
};

app.post('/api/ai/itinerary-planner', handleItineraryRequest);
app.post('/api/ai/plan-trip', handleItineraryRequest);

// 6. Language Recognition & Multilingual Travel Translator
app.post('/api/ai/translate', async (req, res) => {
  const {
    text = '',
    sourceLang,
    targetLang,
    fromLanguage = 'Auto Detect',
    toLanguage = 'Hindi',
    cityContext = 'General'
  } = req.body || {};

  const src = sourceLang || fromLanguage;
  const tgt = targetLang || toLanguage;

  const phraseDictionary: Record<string, Record<string, { tr: string; ph: string; tip: string }>> = {
    'hindi': {
      'restroom': { tr: 'शौचालय कहाँ है? (Shauchalay kahan hai?)', ph: 'Shauchalay kahan hai?', tip: 'You can also ask "Washroom kidhar hai?" politely.' },
      'spicy': { tr: 'कृपया इसे कम तीखा और शाकाहारी बनाएं।', ph: 'Kripya ise kam teekha aur shakahari banayein.', tip: 'Mention "bina mirch ke" (without chilies) in local food stalls.' },
      'meter': { tr: 'क्या मीटर चालू है? निश्चित किराया कितना है?', ph: 'Kya meter chalu hai? Nischit kiraya kitna hai?', tip: 'Always agree on the fare before boarding auto rickshaws.' },
      'discount': { tr: 'क्या थोड़ा डिस्काउंट मिल सकता है?', ph: 'Kya thoda discount mil sakta hai?', tip: 'Smile and ask "Bhaiya, thoda kam kar dijiye" for polite bargaining.' },
      'ticket': { tr: 'महल का टिकट कितने का है?', ph: 'Mahal ka ticket kitne ka hai?', tip: 'Ask if student or online booking discounts are available.' },
    }
  };

  const getHeuristicTranslation = () => {
    const lower = text.toLowerCase();
    const tgtKey = tgt.toLowerCase();
    if (phraseDictionary[tgtKey]) {
      for (const [key, val] of Object.entries(phraseDictionary[tgtKey])) {
        if (lower.includes(key)) {
          return {
            translation: val.tr,
            detectedSource: src === 'Auto Detect' ? 'English' : src,
            phonetic: val.ph,
            contextTip: val.tip
          };
        }
      }
    }
    return {
      translation: `[${tgt}]: ${text}`,
      detectedSource: src === 'Auto Detect' ? 'English' : src,
      phonetic: text,
      contextTip: `In ${cityContext}, speaking with a polite greeting (like "Namaste" or "Hello") is customary.`
    };
  };

  try {
    const ai = getAIClient();
    if (!ai) {
      return res.json(getHeuristicTranslation());
    }

    const prompt = `Translate the following text for a traveler visiting ${cityContext}:
Phrase to Translate: "${text}"
From Language: ${src}
Target Language: ${tgt}

Return JSON strictly matching this schema:
{
  "translation": "Accurate, natural translation in ${tgt}",
  "detectedSource": "Detected source language if auto-detect",
  "phonetic": "Easy-to-read phonetic pronunciation in latin characters",
  "contextTip": "1 concise cultural etiquette or local bargaining/politeness tip for using this phrase"
}`;

    const response = await generateContentWithFallback({
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const cleaned = cleanJsonString(response.text || '{}');
    const result = JSON.parse(cleaned);
    return res.json(result);
  } catch (error: any) {
    console.error('Translation (Graceful Fallback):', error?.message || error);
    return res.json(getHeuristicTranslation());
  }
});

// Vite Middleware Setup for Dev & Static Serving for Prod
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ExploraAI Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

