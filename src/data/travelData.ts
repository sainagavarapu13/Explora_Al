import { CityInfo, Place, Voucher, CommunityPost, TravelBuddy, TravelMemory, GeneratedItinerary } from '../types';

export const POPULAR_CITIES: CityInfo[] = [
  {
    id: 'jaipur',
    name: 'Jaipur',
    country: 'India',
    tagline: 'The Pink City of Royalty, Forts & Vibrant Bazaars',
    currency: 'INR',
    currencySymbol: '₹',
    lat: 26.9124,
    lng: 75.7873,
    heroImage: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80',
    weather: { temp: '28°C', condition: 'Sunny & Pleasant', icon: 'Sun', humidity: '42%' },
    safetyRating: '4.7 / 5',
    bestSeason: 'Oct - March',
    emergencyNumbers: { police: '100', ambulance: '108', touristHelpline: '1363' },
    suggestedLanguage: 'Hindi / English',
    isVillageOrTown: false
  },
  {
    id: 'mawlynnong',
    name: 'Mawlynnong',
    country: 'India',
    state: 'Meghalaya',
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
    isVillageOrTown: true
  },
  {
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
    bestSeason: 'May - Oct / Dec - Feb',
    emergencyNumbers: { police: '133', ambulance: '144', touristHelpline: '112' },
    suggestedLanguage: 'German',
    isVillageOrTown: true
  },
  {
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
    bestSeason: 'June - Sept / Dec - April',
    emergencyNumbers: { police: '117', ambulance: '144', touristHelpline: '112' },
    suggestedLanguage: 'German / French',
    isVillageOrTown: true
  },
  {
    id: 'hampi',
    name: 'Hampi',
    country: 'India',
    state: 'Karnataka',
    tagline: 'UNESCO World Heritage Boulder Paradise & Ancient Vijayanagara Empire Ruins',
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
    isVillageOrTown: true
  },
  {
    id: 'paris',
    name: 'Paris',
    country: 'France',
    tagline: 'The City of Light, Haute Cuisine & Timeless Art',
    currency: 'EUR',
    currencySymbol: '€',
    lat: 48.8566,
    lng: 2.3522,
    heroImage: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80',
    weather: { temp: '19°C', condition: 'Mild Breeze', icon: 'CloudSun', humidity: '58%' },
    safetyRating: '4.6 / 5',
    bestSeason: 'April - Oct',
    emergencyNumbers: { police: '17', ambulance: '15', touristHelpline: '112' },
    suggestedLanguage: 'French',
    isVillageOrTown: false
  },
  {
    id: 'tokyo',
    name: 'Tokyo',
    country: 'Japan',
    tagline: 'Ultra-Modern Neon Metropolises & Serene Ancient Shrines',
    currency: 'JPY',
    currencySymbol: '¥',
    lat: 35.6762,
    lng: 139.6503,
    heroImage: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80',
    weather: { temp: '22°C', condition: 'Clear Sky', icon: 'Sun', humidity: '50%' },
    safetyRating: '4.9 / 5',
    bestSeason: 'March - May, Sept - Nov',
    emergencyNumbers: { police: '110', ambulance: '119', touristHelpline: '03-3201-3331' },
    suggestedLanguage: 'Japanese',
    isVillageOrTown: false
  },
  {
    id: 'rome',
    name: 'Rome',
    country: 'Italy',
    tagline: 'The Eternal City of Gladiators, Piazzas & Gelato',
    currency: 'EUR',
    currencySymbol: '€',
    lat: 41.9028,
    lng: 12.4964,
    heroImage: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1200&q=80',
    weather: { temp: '24°C', condition: 'Warm & Sunny', icon: 'Sun', humidity: '45%' },
    safetyRating: '4.5 / 5',
    bestSeason: 'May - June, Sept - Oct',
    emergencyNumbers: { police: '112', ambulance: '118', touristHelpline: '060608' },
    suggestedLanguage: 'Italian',
    isVillageOrTown: false
  },
  {
    id: 'barcelona',
    name: 'Barcelona',
    country: 'Spain',
    tagline: 'Gaudí Architecture, Mediterranean Beaches & Tapas',
    currency: 'EUR',
    currencySymbol: '€',
    lat: 41.3879,
    lng: 2.1699,
    heroImage: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=1200&q=80',
    weather: { temp: '26°C', condition: 'Sunny Coastal Breeze', icon: 'Sun', humidity: '55%' },
    safetyRating: '4.4 / 5',
    bestSeason: 'May - Oct',
    emergencyNumbers: { police: '112', ambulance: '061', touristHelpline: '112' },
    suggestedLanguage: 'Spanish / Catalan',
    isVillageOrTown: false
  },
  {
    id: 'dubai',
    name: 'Dubai',
    country: 'UAE',
    tagline: 'Futuristic Skyscrapers, Luxury Desert Safaris & Souks',
    currency: 'AED',
    currencySymbol: 'AED',
    lat: 25.2048,
    lng: 55.2708,
    heroImage: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80',
    weather: { temp: '34°C', condition: 'Clear & Sunny', icon: 'Sun', humidity: '35%' },
    safetyRating: '4.9 / 5',
    bestSeason: 'Nov - April',
    emergencyNumbers: { police: '999', ambulance: '998', touristHelpline: '800-4888' },
    suggestedLanguage: 'Arabic / English',
    isVillageOrTown: false
  },
  {
    id: 'london',
    name: 'London',
    country: 'United Kingdom',
    tagline: 'Historic Monarchy, West End Theatres & Iconic Pubs',
    currency: 'GBP',
    currencySymbol: '£',
    lat: 51.5074,
    lng: -0.1278,
    heroImage: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1200&q=80',
    weather: { temp: '17°C', condition: 'Partly Cloudy', icon: 'CloudSun', humidity: '64%' },
    safetyRating: '4.6 / 5',
    bestSeason: 'May - Sept',
    emergencyNumbers: { police: '999', ambulance: '999', touristHelpline: '101' },
    suggestedLanguage: 'English',
    isVillageOrTown: false
  },
  {
    id: 'newyork',
    name: 'New York',
    country: 'USA',
    tagline: 'The City That Never Sleeps, Broadway & Skyline Views',
    currency: 'USD',
    currencySymbol: '$',
    lat: 40.7128,
    lng: -74.0060,
    heroImage: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=1200&q=80',
    weather: { temp: '23°C', condition: 'Breezy & Sunny', icon: 'Sun', humidity: '48%' },
    safetyRating: '4.5 / 5',
    bestSeason: 'Sept - Nov, April - June',
    emergencyNumbers: { police: '911', ambulance: '911', touristHelpline: '311' },
    suggestedLanguage: 'English',
    isVillageOrTown: false
  }
];

export const SAMPLE_PLACES: Place[] = [
  {
    id: 'place-1',
    name: 'Hawa Mahal (Palace of Winds)',
    city: 'Jaipur',
    country: 'India',
    category: 'attraction',
    rating: 4.8,
    reviewCount: 42500,
    approxCost: '₹50 Indians / ₹200 Foreigners',
    description: 'Iconic five-story pink sandstone palace built with 953 ornate latticework jharokha windows allowing cool breeze circulation.',
    bestTimeToVisit: '9:00 AM - 11:00 AM & Golden Sunset',
    lat: 26.9239,
    lng: 75.8267,
    image: 'https://images.unsplash.com/photo-1603288967341-a67554988771?auto=format&fit=crop&w=800&q=80',
    tags: ['Architecture', 'Iconic', 'Palace', 'Photography'],
    isTrending: true
  },
  {
    id: 'place-2',
    name: 'The Wind View Cafe (Rooftop Secret)',
    city: 'Jaipur',
    country: 'India',
    category: 'cafe',
    rating: 4.7,
    reviewCount: 3890,
    approxCost: '₹250 - ₹450 per person',
    description: 'Boutique rooftop terrace directly opposite Hawa Mahal offering front-row sunset vantage points, masala chai, and artisanal cold brews.',
    bestTimeToVisit: '4:30 PM - 6:30 PM',
    lat: 26.9242,
    lng: 75.8263,
    image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80',
    tags: ['Rooftop', 'Sunset View', 'Cafe', 'Masala Chai'],
    isTrending: true
  },
  {
    id: 'place-3',
    name: 'Amer Fort & Sheesh Mahal',
    city: 'Jaipur',
    country: 'India',
    category: 'attraction',
    rating: 4.9,
    reviewCount: 56000,
    approxCost: '₹100 entry / ₹500 foreigner',
    description: 'Majestic 16th-century hilltop fortress featuring the breathtaking Hall of Mirrors (Sheesh Mahal), ramparts, and Maota Lake reflection.',
    bestTimeToVisit: '8:30 AM before tourist coaches arrive',
    lat: 26.9855,
    lng: 75.8513,
    image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80',
    tags: ['Heritage Fort', 'Royal', 'Mirrors', 'Hilltop'],
    isTrending: true
  },
  {
    id: 'place-4',
    name: 'Panna Meena Ka Kund (Hidden Stepwell)',
    city: 'Jaipur',
    country: 'India',
    category: 'hidden_gem',
    rating: 4.6,
    reviewCount: 2950,
    approxCost: 'Free entry',
    description: 'An architectural marvel 16th-century symmetrical geometric stepwell tucked quietly behind Amer Fort, virtually free of commercial crowds.',
    bestTimeToVisit: 'Early morning 7:30 AM',
    lat: 26.9881,
    lng: 75.8562,
    image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800&q=80',
    tags: ['Stepwell', 'Hidden Gem', 'Geometry', 'Ancient'],
    isTrending: false
  },
  {
    id: 'place-5',
    name: 'Nahargarh Fort Sunset Point',
    city: 'Jaipur',
    country: 'India',
    category: 'viewpoint',
    rating: 4.8,
    reviewCount: 22100,
    approxCost: '₹50 entry',
    description: 'Highest panoramic perch overlooking the entire pink city illuminated under twilight. Popular hangout spot for sunset lovers.',
    bestTimeToVisit: '5:00 PM - 7:00 PM',
    lat: 26.9372,
    lng: 75.8155,
    image: 'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?auto=format&fit=crop&w=800&q=80',
    tags: ['Sunset', 'Panoramic', 'Night View', 'Fort'],
    isTrending: true
  },
  {
    id: 'place-6',
    name: 'Laxmi Mishthan Bhandar (LMB 1727)',
    city: 'Jaipur',
    country: 'India',
    category: 'restaurant',
    rating: 4.7,
    reviewCount: 18400,
    approxCost: '₹350 - ₹600 per person',
    description: 'Famous historic sweet shop & vegetarian restaurant in Johari Bazaar celebrated for Rajasthani Ghewar, Pyaaz Kachori, and Royal Thali.',
    bestTimeToVisit: 'Lunch 12:30 PM or Evening Snack',
    lat: 26.9212,
    lng: 75.8239,
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80',
    tags: ['Rajasthani Food', 'Ghewar', 'Pyaaz Kachori', 'Authentic'],
    isTrending: false
  },
  {
    id: 'place-7',
    name: 'Eiffel Tower & Champ de Mars',
    city: 'Paris',
    country: 'France',
    category: 'attraction',
    rating: 4.9,
    reviewCount: 98000,
    approxCost: '€18 - €29 summit ticket',
    description: 'Gustave Eiffel’s wrought-iron lattice monument rising 330m over Paris with sparkling hourly night illuminations.',
    bestTimeToVisit: 'Sunset or night light sparkle',
    lat: 48.8584,
    lng: 2.2945,
    image: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&w=800&q=80',
    tags: ['Iconic', 'Landmark', 'Paris', 'Summit View'],
    isTrending: true
  },
  {
    id: 'place-8',
    name: 'Senso-ji Temple (Asakusa)',
    city: 'Tokyo',
    country: 'Japan',
    category: 'attraction',
    rating: 4.9,
    reviewCount: 65000,
    approxCost: 'Free entry',
    description: 'Tokyo’s oldest Buddhist temple founded in 645 AD, famed for the dramatic red Kaminarimon Thunder Gate and Nakamise food street.',
    bestTimeToVisit: 'Early morning 7:00 AM',
    lat: 35.7148,
    lng: 139.7967,
    image: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?auto=format&fit=crop&w=800&q=80',
    tags: ['Temple', 'Historic', 'Culture', 'Asakusa'],
    isTrending: true
  }
];

export const SAMPLE_VOUCHERS: Voucher[] = [
  {
    id: 'vouch-1',
    partner: 'MakeMyTrip',
    title: 'Flat ₹1,500 OFF Flight & Hotel Combo',
    discount: '₹1,500 OFF',
    code: 'MMTEXPLORA',
    description: 'Applicable on domestic and international hotel + flight bookings above ₹6,000.',
    category: 'Flights & Hotels',
    expiryDate: 'Dec 31, 2026',
    minSpend: '₹6,000'
  },
  {
    id: 'vouch-2',
    partner: 'Booking.com',
    title: 'Instant 25% OFF Heritage Haveli Stays',
    discount: '25% OFF',
    code: 'HAVELI25',
    description: 'Valid on hand-picked boutique hotels, palatial stays and traveler guesthouses.',
    category: 'Hotels',
    expiryDate: 'Nov 30, 2026',
    minSpend: '₹3,500'
  },
  {
    id: 'vouch-3',
    partner: 'Uber',
    title: '₹200 OFF City Tourist Sightseeing Rides',
    discount: '₹200 OFF',
    code: 'UBERTOUR200',
    description: 'Valid on first 3 Premier and Hourly rental rides in selected tourist cities.',
    category: 'Cabs & Transit',
    expiryDate: 'Oct 31, 2026',
    minSpend: '₹400'
  },
  {
    id: 'vouch-4',
    partner: 'Airbnb',
    title: '$50 OFF Verified Cultural Experiences',
    discount: '$50 OFF',
    code: 'AIRBNBEXP50',
    description: 'Get discount on guided culinary walks, pottery workshops, and heritage walking tours.',
    category: 'Experiences',
    expiryDate: 'Dec 15, 2026',
    minSpend: '$80'
  },
  {
    id: 'vouch-5',
    partner: 'Viator / Tripadvisor',
    title: '20% OFF Skip-the-Line Monument Passes',
    discount: '20% OFF',
    code: 'SKIPLINE20',
    description: 'Instant barcode entry for palaces, museums, and historical archaeological forts.',
    category: 'Tickets',
    expiryDate: 'Jan 15, 2027',
    minSpend: '₹1,200'
  }
];

export const SAMPLE_MEMORIES: TravelMemory[] = [
  {
    id: 'mem-1',
    userId: 'user-demo',
    title: 'Golden Sunset at Hawa Mahal Rooftop',
    city: 'Jaipur',
    landmarkName: 'Hawa Mahal',
    date: 'August 18, 2026',
    image: 'https://images.unsplash.com/photo-1603288967341-a67554988771?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1603288967341-a67554988771?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80'
    ],
    story: 'Sat at the Wind View cafe opposite Hawa Mahal around 5:45 PM. The sandstone turned into deep glowing amber. Best masala chai I had in Rajasthan!',
    rating: 5,
    tags: ['Sunset', 'HawaMahal', 'Chai', 'Photography'],
    likesCount: 24,
    commentsCount: 3
  },
  {
    id: 'mem-2',
    userId: 'user-demo',
    title: 'Amer Fort Hall of Mirrors (Sheesh Mahal)',
    city: 'Jaipur',
    landmarkName: 'Amer Fort',
    date: 'August 19, 2026',
    image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1603288967341-a67554988771?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80'
    ],
    story: 'Hired a local audio guide who demonstrated how a single candle light flickers across thousand convex mirrors. Truly magical royal architecture.',
    rating: 5,
    tags: ['AmerFort', 'RoyalHeritage', 'SheeshMahal'],
    likesCount: 19,
    commentsCount: 2
  },
  {
    id: 'mem-3',
    userId: 'user-demo',
    title: 'Serene Gondola Ride & Rialto Sunset',
    city: 'Venice',
    landmarkName: 'Grand Canal',
    date: 'August 10, 2026',
    image: 'https://images.unsplash.com/photo-1514890547357-a9ee288728e0?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1514890547357-a9ee288728e0?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1534113414509-0eec2bfb493f?auto=format&fit=crop&w=800&q=80'
    ],
    story: 'Gliding along the quiet back-canals in Venice right before twilight. The pastel facades reflecting in calm water was pure poetry.',
    rating: 5,
    tags: ['Venice', 'Canals', 'Romantic', 'Architecture'],
    likesCount: 31,
    commentsCount: 5
  }
];

export const SAMPLE_COMMUNITY_POSTS: CommunityPost[] = [
  {
    id: 'post-1',
    userId: 'u-1',
    userName: 'Rohan Deshmukh',
    userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    userHome: 'Mumbai, India',
    city: 'Jaipur',
    title: 'Hidden stepwell you MUST visit before tourist crowds wake up',
    content: 'Panna Meena Ka Kund is only 5 minutes behind Amer Fort, but almost everyone skips it. Go at 7:30 AM when the morning light creates incredible zig-zag shadow patterns on the stone stairs.',
    image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1603288967341-a67554988771?auto=format&fit=crop&w=800&q=80'
    ],
    rating: 5,
    timestamp: '2 hours ago',
    likesCount: 42,
    hasLiked: true,
    comments: [
      {
        id: 'c1',
        userName: 'Elena Rostova',
        userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        text: 'Thanks for this tip! Visited this morning and had the entire place to myself!',
        timestamp: '1 hour ago'
      }
    ]
  },
  {
    id: 'post-2',
    userId: 'u-2',
    userName: 'Camille Dubois',
    userAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    userHome: 'Lyon, France',
    city: 'Paris',
    title: 'The best €4 espresso & pistachio croissant near Canal Saint-Martin',
    content: 'Skip the overpriced tourist cafes near Notre-Dame. Head towards Canal Saint-Martin where local bakeries bake fresh sourdough pastries twice daily.',
    image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&w=800&q=80'
    ],
    rating: 5,
    timestamp: '5 hours ago',
    likesCount: 67,
    hasLiked: false,
    comments: []
  }
];

export const SAMPLE_BUDDIES: TravelBuddy[] = [
  {
    id: 'buddy-1',
    name: 'Maya Sharma',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    country: 'India (Bengaluru)',
    currentCity: 'Jaipur',
    travelStyle: 'Solo Cultural Backpacker',
    bio: 'Photographer & architecture enthusiast exploring Rajasthan forts. Looking for travel buddies to split cabs and capture sunrise/sunset shots!',
    interests: ['Photography', 'Heritage Forts', 'Chai', 'Boutique Cafes'],
    languages: ['English', 'Hindi', 'Kannada'],
    datesInCity: 'Aug 28 - Sept 2',
    isFriend: true
  },
  {
    id: 'buddy-2',
    name: 'Lucas Bernard',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    country: 'France (Paris)',
    currentCity: 'Jaipur',
    travelStyle: 'Culinary & History Explorer',
    bio: 'Food blogger exploring authentic Indian street food & royal thalis. Excited to explore bazaar food trails together!',
    interests: ['Street Food', 'Bazaars', 'Night Walks', 'History'],
    languages: ['French', 'English'],
    datesInCity: 'Aug 26 - Aug 31',
    isFriend: false
  },
  {
    id: 'buddy-3',
    name: 'Aiko Tanaka',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
    country: 'Japan (Kyoto)',
    currentCity: 'Jaipur',
    travelStyle: 'Art & Handicrafts Explorer',
    bio: 'Textile designer learning block printing and blue pottery in Jaipur. Love quiet cafes and historical palaces.',
    interests: ['Handicrafts', 'Textiles', 'Pottery', 'Museums'],
    languages: ['Japanese', 'English'],
    datesInCity: 'Aug 29 - Sept 4',
    isFriend: false
  }
];

export const SAMPLE_JAIPUR_ITINERARY: GeneratedItinerary = {
  id: 'itin-sample-1',
  city: 'Jaipur',
  country: 'India',
  totalDays: 3,
  travelStyle: 'Balanced Culture & Food',
  budgetTier: 'Budget Explorer',
  totalEstimatedBudget: '₹8,400 per person',
  currency: 'INR',
  createdAt: 'August 2026',
  budgetBreakdown: {
    stay: 35,
    food: 25,
    sightseeing: 25,
    transit: 15,
    buffer: 0
  },
  packingTips: [
    'Breathable cotton clothes and comfortable walking footwear for fort cobblestones',
    'Sun protection hat, UV sunglasses, and reusable water flask',
    'Modest scarf/shawl for temple visits and palace courtyards'
  ],
  safetyAdvisory: [
    'Always agree on auto-rickshaw fare or use Uber Auto for upfront fixed pricing',
    'Official composite ticket allows entry to 8 monuments for 2 consecutive days at huge savings'
  ],
  days: [
    {
      dayNumber: 1,
      title: 'Day 1: Royal Palaces, Wind Towers & Walled City Bazaars',
      theme: 'Heritage Architecture & Royal Splendor',
      totalDayEstimatedCost: '₹2,600',
      foodSpecialty: 'Pyaaz Kachori & Lassi at Lassiwala MI Road',
      activities: [
        {
          timeSlot: 'Morning',
          time: '8:30 AM - 11:00 AM',
          placeName: 'Hawa Mahal & City Palace Complex',
          category: 'Historic Monument',
          description: 'Explore the 953-window honeycomb facade in soft morning light followed by the royal courtyards and Chandra Mahal museum.',
          estimatedCost: '₹350 (Entry + Audio Guide)',
          duration: '2.5 Hours',
          transportRecommendation: 'Metro to Badi Chaupar Station, 2 min walk',
          localTip: 'Take photos from the second floor balcony inside the palace courtyard for zero crowd obstruction.'
        },
        {
          timeSlot: 'Afternoon',
          time: '12:30 PM - 2:30 PM',
          placeName: 'LMB Johari Bazaar Royal Thali',
          category: 'Dining Experience',
          description: 'Relish an authentic Rajasthani vegetarian Thali featuring Dal Baati Churma, Gatte ki Sabzi, and hot Ghewar.',
          estimatedCost: '₹600',
          duration: '1.5 Hours',
          transportRecommendation: '5 min walk through Johari Bazaar',
          localTip: 'Try the fresh hot Mawa Kachori for dessert!'
        },
        {
          timeSlot: 'Evening',
          time: '4:30 PM - 7:00 PM',
          placeName: 'Jantar Mantar & Wind View Rooftop Sunset',
          category: 'UNESCO Observatory & Sunset Cafe',
          description: 'Visit the world’s largest stone sundial followed by chilled masala chai on the rooftop directly facing illuminated Hawa Mahal.',
          estimatedCost: '₹450',
          duration: '2.5 Hours',
          transportRecommendation: 'Short walking distance',
          localTip: 'Arrive at the rooftop by 5:15 PM to grab the front balcony seats for sunset.'
        }
      ]
    },
    {
      dayNumber: 2,
      title: 'Day 2: Mighty Hilltop Forts, Mirrors & Stepwells',
      theme: 'Fortress Defense & Ancient Engineering',
      totalDayEstimatedCost: '₹2,900',
      foodSpecialty: 'Authentic Ker Sangri & Bajre ki Roti',
      activities: [
        {
          timeSlot: 'Morning',
          time: '8:00 AM - 12:00 PM',
          placeName: 'Amer Fort & Sheesh Mahal',
          category: 'UNESCO Fort',
          description: 'Walk up the grand cobblestone ramparts into the Hall of Thousand Mirrors and Diwan-e-Aam.',
          estimatedCost: '₹500',
          duration: '3.5 Hours',
          transportRecommendation: 'Cab / Auto to Amer (11 km from city center)',
          localTip: 'Enter through the rear Suraj Pol gate to skip tour group ticket queues.'
        },
        {
          timeSlot: 'Afternoon',
          time: '12:30 PM - 2:00 PM',
          placeName: 'Panna Meena Ka Kund (Hidden Stepwell)',
          category: 'Ancient Architecture',
          description: 'Discover the secluded 16th-century geometric stepwell free of commercial noise.',
          estimatedCost: 'Free Entry',
          duration: '1 Hour',
          transportRecommendation: '5 min walk behind Amer Fort',
          localTip: 'The symmetry looks stunning when shot from the southwest corner.'
        },
        {
          timeSlot: 'Evening',
          time: '4:30 PM - 7:30 PM',
          placeName: 'Nahargarh Fort Sunset Point & Padao Cafe',
          category: 'Hilltop Sunset',
          description: 'Catch the twilight glow over the entire city of Jaipur from the highest ramparts.',
          estimatedCost: '₹400',
          duration: '3 Hours',
          transportRecommendation: 'Auto / Cab up Nahargarh hill road',
          localTip: 'Stay until 7:00 PM when the city streetlights turn into a golden carpet.'
        }
      ]
    },
    {
      dayNumber: 3,
      title: 'Day 3: Block Printing Craft, Blue Pottery & Sunset Lake Palace',
      theme: 'Artisans, Crafts & Water Palaces',
      totalDayEstimatedCost: '₹2,900',
      foodSpecialty: 'Mirchi Bada & Makhaniya Lassi',
      activities: [
        {
          timeSlot: 'Morning',
          time: '9:00 AM - 12:00 PM',
          placeName: 'Anokhi Museum of Hand Printing & Blue Pottery',
          category: 'Artisanal Workshop',
          description: 'Witness live woodblock carvers and try stamping your own organic cotton scarf.',
          estimatedCost: '₹400',
          duration: '2.5 Hours',
          transportRecommendation: 'Cab to Kripal Kumbh / Amber Artisan quarter',
          localTip: 'You get a complimentary hand-printed souvenir card at the exit.'
        },
        {
          timeSlot: 'Evening',
          time: '5:00 PM - 7:30 PM',
          placeName: 'Jal Mahal Lake Promenade & Bapu Bazaar Shopping',
          category: 'Water Palace & Night Market',
          description: 'Stroll along the Man Sagar lake promenade watching the floating palace glow under golden floodlights, followed by handicraft shopping.',
          estimatedCost: '₹800 (Food & Small Souvenirs)',
          duration: '2.5 Hours',
          transportRecommendation: 'Auto Rickshaw to Jal Mahal',
          localTip: 'Shopkeepers in Bapu Bazaar expect friendly bargaining—start at ~60% of quoted price.'
        }
      ]
    }
  ]
};
