export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  bio?: string;
  homeCountry?: string;
  phone?: string;
  languages?: string[];
  interests?: string[];
  travelStyle?: 'budget' | 'balanced' | 'luxury' | 'backpacker' | 'foodie';
  currentCity?: string;
  joinedDate?: string;
}

export interface Place {
  id: string;
  name: string;
  city: string;
  country: string;
  category: 'attraction' | 'hidden_gem' | 'cafe' | 'restaurant' | 'stay' | 'nature' | 'culture' | 'nightlife' | 'viewpoint';
  rating: number;
  reviewCount: number;
  priceRange?: string;
  approxCost: string;
  description: string;
  highlights?: string[];
  bestTimeToVisit?: string;
  openingHours?: string;
  lat: number;
  lng: number;
  image: string;
  tags: string[];
  address?: string;
  isWishlisted?: boolean;
  isTrending?: boolean;
}

export interface CityInfo {
  id: string;
  name: string;
  country: string;
  state?: string;
  tagline: string;
  currency: string;
  currencySymbol: string;
  lat: number;
  lng: number;
  heroImage: string;
  weather: {
    temp: string;
    condition: string;
    icon: string;
    humidity: string;
  };
  safetyRating: string;
  bestSeason: string;
  emergencyNumbers: {
    police: string;
    ambulance: string;
    touristHelpline: string;
  };
  suggestedLanguage?: string;
  isVillageOrTown?: boolean;
}

export interface LandmarkAnalysis {
  name: string;
  confidence: number;
  city: string;
  country: string;
  category: string;
  architecturalStyle?: string;
  historicalPeriod?: string;
  shortOverview: string;
  keyFacts: string[];
  bestTimeToVisit: string;
  ticketPrice: string;
  timings: string[];
  proTips: string[];
  nearbyRecommendations: {
    name: string;
    type: string;
    distance: string;
    description: string;
  }[];
  audioGuideScript: string;
  detectedVisualFeatures?: string[];
}

export interface ItineraryActivity {
  timeSlot: 'Morning' | 'Afternoon' | 'Evening' | 'Night';
  time: string;
  placeName: string;
  category: string;
  description: string;
  estimatedCost: string;
  duration: string;
  transportRecommendation: string;
  localTip: string;
  lat?: number;
  lng?: number;
}

export interface ItineraryDay {
  dayNumber: number;
  title: string;
  theme: string;
  activities: ItineraryActivity[];
  totalDayEstimatedCost: string;
  foodSpecialty: string;
}

export interface GeneratedItinerary {
  id: string;
  city: string;
  country: string;
  totalDays: number;
  travelStyle: string;
  budgetTier: string;
  totalEstimatedBudget: string;
  currency: string;
  days: ItineraryDay[];
  budgetBreakdown: {
    stay: number;
    food: number;
    sightseeing: number;
    transit: number;
    buffer: number;
  };
  packingTips: string[];
  safetyAdvisory: string[];
  createdAt: string;
}

export interface TravelMemory {
  id: string;
  userId: string;
  title: string;
  city: string;
  landmarkName?: string;
  date: string;
  image: string;
  images?: string[];
  story: string;
  rating: number;
  tags: string[];
  likesCount: number;
  commentsCount: number;
}

export interface WishlistItem {
  id: string;
  placeId?: string;
  title: string;
  city: string;
  category: string;
  image: string;
  notes: string;
  isVisited: boolean;
  priority: 'High' | 'Medium' | 'Low';
  addedAt: string;
}

export interface Voucher {
  id: string;
  partner: string;
  title: string;
  discount: string;
  code: string;
  description: string;
  category: string;
  expiryDate: string;
  minSpend: string;
}

export interface TravelBuddy {
  id: string;
  name: string;
  avatar: string;
  country: string;
  currentCity: string;
  travelStyle: string;
  bio: string;
  interests: string[];
  languages: string[];
  datesInCity: string;
  isFriend?: boolean;
}

export interface FriendRequest {
  id: string;
  fromUser: {
    id: string;
    name: string;
    avatar: string;
    country: string;
    currentCity: string;
    travelStyle: string;
    bio: string;
    interests: string[];
  };
  sentAt: string;
  status: 'pending' | 'accepted' | 'declined';
  note?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai' | 'friend';
  senderName?: string;
  senderAvatar?: string;
  text: string;
  imageUrl?: string;
  audioVoice?: boolean;
  timestamp: string;
  recommendations?: {
    title: string;
    type: string;
    cost: string;
  }[];
}

export interface CommunityPost {
  id: string;
  userId?: string;
  userName: string;
  userAvatar: string;
  userHome: string;
  city: string;
  title: string;
  content: string;
  image?: string;
  images?: string[];
  rating: number;
  timestamp: string;
  likesCount: number;
  hasLiked?: boolean;
  comments: {
    id: string;
    userName: string;
    userAvatar: string;
    text: string;
    timestamp: string;
  }[];
}
