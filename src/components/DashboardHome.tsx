import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Mic, Sparkles, MapPin, Camera, Route, MessageSquare, Radio, Globe2, Heart, Tag, Users, UserCheck, Star, Clock, Compass, ArrowRight, Shield, Flame, Filter, ChevronRight, Check } from 'lucide-react';
import { User, CityInfo, Place } from '../types';
import { NavModule } from './Navbar';

interface DashboardHomeProps {
  currentUser: User;
  currentCity: CityInfo;
  places: Place[];
  onSelectModule: (module: NavModule) => void;
  onSelectPlaceForMap: (place: Place) => void;
  onToggleWishlist: (place: Place) => void;
  wishlistIds: string[];
  onSearchQuerySubmit: (query: string) => void;
  isSearchingAI: boolean;
}

export const DashboardHome: React.FC<DashboardHomeProps> = ({
  currentUser,
  currentCity,
  places,
  onSelectModule,
  onSelectPlaceForMap,
  onToggleWishlist,
  wishlistIds,
  onSearchQuerySubmit,
  isSearchingAI
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isListening, setIsListening] = useState(false);

  const samplePrompts = [
    'Best cafes under ₹500',
    'Hidden sunset viewpoints',
    'Historical monuments with low crowd',
    'Vegetarian street food stalls',
    'Royal haveli boutique stays'
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    onSearchQuerySubmit(searchQuery);
  };

  const handleVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser. You can type in the search bar!');
      return;
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setSearchQuery(transcript);
      setIsListening(false);
      onSearchQuerySubmit(transcript);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  // Filter city places
  const cityPlaces = places.filter(
    (p) => p.city.toLowerCase() === currentCity.name.toLowerCase()
  );

  const filteredPlaces = cityPlaces.filter((p) => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'attraction') return p.category === 'attraction' || p.category === 'culture';
    if (selectedCategory === 'hidden_gem') return p.category === 'hidden_gem';
    if (selectedCategory === 'cafe') return p.category === 'cafe' || p.category === 'restaurant';
    return p.category === selectedCategory;
  });

  return (
    <div className="space-y-8 pb-16">
      
      {/* City Hero & AI Search Canvas */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-200 shadow-xl bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900">
        {/* Background Image with Ambient Gradient Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-all duration-700 opacity-25 scale-105"
          style={{ backgroundImage: `url(${currentCity.heroImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-indigo-950/95 via-indigo-950/70 to-indigo-900/40" />

        {/* Floating Abstract Accents */}
        <div className="absolute top-4 right-4 w-72 h-72 bg-pink-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-4 left-4 w-72 h-72 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 p-6 sm:p-10 lg:p-12 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-indigo-200 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>ExploraAI Personalized City Guide</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white font-heading tracking-tight">
                Discover {currentCity.name},{' '}
                <span className="bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-300 bg-clip-text text-transparent">
                  {currentCity.country}
                </span>
              </h1>
              <p className="text-sm sm:text-base text-slate-200 max-w-2xl font-normal">
                {currentCity.tagline}
              </p>
            </div>

            {/* Quick Metrics Capsule */}
            <div className="flex items-center gap-2.5 bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/15 text-xs shadow-lg">
              <div className="px-3 py-1.5 rounded-xl bg-white/90 text-center shadow-sm">
                <p className="text-[10px] text-slate-500 font-semibold uppercase">Safety</p>
                <p className="font-bold text-emerald-700">{currentCity.safetyRating}</p>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-white/90 text-center shadow-sm">
                <p className="text-[10px] text-slate-500 font-semibold uppercase">Season</p>
                <p className="font-bold text-amber-600">{currentCity.bestSeason}</p>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-white/90 text-center shadow-sm">
                <p className="text-[10px] text-slate-500 font-semibold uppercase">Currency</p>
                <p className="font-bold text-indigo-700">{currentCity.currency} ({currentCity.currencySymbol})</p>
              </div>
            </div>
          </div>

          {/* AI Natural Language Search Bar */}
          <div className="pt-2 max-w-3xl">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <div className="absolute left-4 text-indigo-500">
                <Search className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Ask anything about ${currentCity.name}... (e.g., "best rooftop cafes under ₹500")`}
                className="w-full pl-12 pr-28 sm:pr-36 py-4 rounded-2xl bg-white border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-2xl transition-all font-medium"
              />
              <div className="absolute right-2.5 flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleVoiceSearch}
                  title="Voice Search"
                  className={`p-2.5 rounded-xl transition-all ${
                    isListening
                      ? 'bg-rose-500 text-white animate-bounce'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-indigo-600'
                  }`}
                >
                  <Mic className="w-4 h-4" />
                </button>
                <button
                  type="submit"
                  disabled={isSearchingAI}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-300 transition-all hover:scale-105 disabled:opacity-50"
                >
                  {isSearchingAI ? (
                    <Sparkles className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>Search AI</span>
                      <ArrowRight className="w-3.5 h-3.5 hidden sm:inline" />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Suggested Prompt Chips */}
            <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1 no-scrollbar text-xs">
              <span className="text-slate-300 shrink-0 font-semibold flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-300" />
                Try:
              </span>
              {samplePrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => {
                    setSearchQuery(prompt);
                    onSearchQuerySubmit(prompt);
                  }}
                  className="px-3 py-1 rounded-full bg-white/20 hover:bg-white text-white hover:text-indigo-900 font-medium backdrop-blur-sm border border-white/20 shrink-0 transition-colors shadow-sm"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 8 Primary Modules Feature Hub (Responsive Bento Grid) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-800 font-heading">ExploraAI Smart Travel Modules</h2>
            <p className="text-xs text-slate-500">All tools integrated for complete smart tourism navigation & planning</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* 1. Camera Landmark Scanner */}
          <div
            onClick={() => onSelectModule('scanner')}
            className="p-5 rounded-3xl bg-white border border-slate-100 shadow-md hover:shadow-xl hover:shadow-indigo-100/40 hover:border-pink-300 cursor-pointer group space-y-3 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-500 to-rose-600 flex items-center justify-center text-white shadow-md shadow-pink-200 group-hover:scale-110 transition-transform">
                <Camera className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold bg-pink-50 text-pink-600 px-2 py-0.5 rounded-full border border-pink-100">
                Gemini Vision AI
              </span>
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-800 group-hover:text-pink-600 transition-colors">
                Camera Landmark Scanner
              </h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                Snap or upload photo of any monument. Identifies history, ticket pricing, opening hours & audio guide.
              </p>
            </div>
            <div className="flex items-center text-xs font-bold text-pink-600 pt-1 gap-1">
              <span>Scan Landmark</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* 2. AI Chatbot & Voice */}
          <div
            onClick={() => onSelectModule('chatbot')}
            className="p-5 rounded-3xl bg-white border border-slate-100 shadow-md hover:shadow-xl hover:shadow-indigo-100/40 hover:border-indigo-300 cursor-pointer group space-y-3 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-200 group-hover:scale-110 transition-transform">
                <MessageSquare className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full border border-indigo-100">
                Voice & Multimodal
              </span>
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-800 group-hover:text-indigo-600 transition-colors">
                AI Assistant
              </h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                Upload image menus/tickets, talk via mic, and get immediate personalized travel intelligence.
              </p>
            </div>
            <div className="flex items-center text-xs font-bold text-indigo-600 pt-1 gap-1">
              <span>Talk to AI Assistant</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* 3. Budget Trip Planner & PDF */}
          <div
            onClick={() => onSelectModule('planner')}
            className="p-5 rounded-3xl bg-white border border-slate-100 shadow-md hover:shadow-xl hover:shadow-indigo-100/40 hover:border-amber-300 cursor-pointer group space-y-3 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-md shadow-amber-200 group-hover:scale-110 transition-transform">
                <Route className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full border border-amber-100">
                Download PDF
              </span>
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-800 group-hover:text-amber-600 transition-colors">
                Budget Itinerary Planner
              </h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                Generates day-wise custom schedules (morning to night) tailored to your exact budget and travel style.
              </p>
            </div>
            <div className="flex items-center text-xs font-bold text-amber-600 pt-1 gap-1">
              <span>Plan Custom Trip</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* 4. Map-Based Interface & Navigation */}
          <div
            onClick={() => onSelectModule('map')}
            className="p-5 rounded-3xl bg-white border border-slate-100 shadow-md hover:shadow-xl hover:shadow-indigo-100/40 hover:border-emerald-300 cursor-pointer group space-y-3 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md shadow-emerald-200 group-hover:scale-110 transition-transform">
                <MapPin className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-100">
                Interactive Pins
              </span>
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-800 group-hover:text-emerald-600 transition-colors">
                Explore Map
              </h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                Explore nearby attractions, cafes, and hotels on interactive Leaflet maps with turn-by-turn routing.
              </p>
            </div>
            <div className="flex items-center text-xs font-bold text-emerald-600 pt-1 gap-1">
              <span>Open Map</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* 5. Location Status & Live GPS */}
          <div
            onClick={() => onSelectModule('location')}
            className="p-5 rounded-3xl bg-white border border-slate-100 shadow-md hover:shadow-xl hover:shadow-indigo-100/40 hover:border-cyan-300 cursor-pointer group space-y-3 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-200 group-hover:scale-110 transition-transform">
                <Radio className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold bg-cyan-50 text-cyan-700 px-2 py-0.5 rounded-full border border-cyan-100">
                Live Radar
              </span>
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-800 group-hover:text-cyan-600 transition-colors">
                Location Tracker & SOS
              </h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                Real-time geolocation coordinates, current zone tracking, and tourist emergency SOS.
              </p>
            </div>
            <div className="flex items-center text-xs font-bold text-cyan-600 pt-1 gap-1">
              <span>View Live Status</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* 6. Language Recognition & Translator */}
          <div
            onClick={() => onSelectModule('translator')}
            className="p-5 rounded-3xl bg-white border border-slate-100 shadow-md hover:shadow-xl hover:shadow-indigo-100/40 hover:border-purple-300 cursor-pointer group space-y-3 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-500 to-violet-600 flex items-center justify-center text-white shadow-md shadow-purple-200 group-hover:scale-110 transition-transform">
                <Globe2 className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full border border-purple-100">
                40+ Languages
              </span>
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-800 group-hover:text-purple-600 transition-colors">
                Language Recognition
              </h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                Convert one language to another with audio pronunciation, phrasebooks, and local slang decoder.
              </p>
            </div>
            <div className="flex items-center text-xs font-bold text-purple-600 pt-1 gap-1">
              <span>Translate Now</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* 7. Trip Memories & Wishlist */}
          <div
            onClick={() => onSelectModule('memories')}
            className="p-5 rounded-3xl bg-white border border-slate-100 shadow-md hover:shadow-xl hover:shadow-indigo-100/40 hover:border-rose-300 cursor-pointer group space-y-3 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 to-pink-600 flex items-center justify-center text-white shadow-md shadow-rose-200 group-hover:scale-110 transition-transform">
                <Heart className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold bg-rose-50 text-rose-700 px-2 py-0.5 rounded-full border border-rose-100">
                Journal & Photos
              </span>
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-800 group-hover:text-rose-600 transition-colors">
                Stored Memories & Photo Albums
              </h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                Store unlimited trip photos, view high-res photo albums, document travel stories & relive your journeys.
              </p>
            </div>
            <div className="flex items-center text-xs font-bold text-rose-600 pt-1 gap-1">
              <span>Open Journal</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* 8. Experiences & travel stories */}
          <div
            onClick={() => onSelectModule('community')}
            className="p-5 rounded-3xl bg-white border border-slate-100 shadow-md hover:shadow-xl hover:shadow-indigo-100/40 hover:border-blue-300 cursor-pointer group space-y-3 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-200 group-hover:scale-110 transition-transform">
                <Users className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-100">
                Photo Feed
              </span>
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-800 group-hover:text-blue-600 transition-colors">
                Experiences & travel stories
              </h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                Share travel narratives with multi-photo uploads, view traveler photo albums, and read insider reviews.
              </p>
            </div>
            <div className="flex items-center text-xs font-bold text-blue-600 pt-1 gap-1">
              <span>Explore Stories</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* 9. Saved Wishlist */}
          <div
            onClick={() => onSelectModule('wishlist')}
            className="p-5 rounded-3xl bg-white border border-slate-100 shadow-md hover:shadow-xl hover:shadow-indigo-100/40 hover:border-rose-300 cursor-pointer group space-y-3 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 to-pink-600 flex items-center justify-center text-white shadow-md shadow-rose-200 group-hover:scale-110 transition-transform">
                <Heart className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold bg-rose-50 text-rose-700 px-2 py-0.5 rounded-full border border-rose-100">
                {wishlistIds.length} Saved
              </span>
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-800 group-hover:text-rose-600 transition-colors">
                Saved Wishlist
              </h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                Your personal bucket list of bookmarked attractions, hidden cafes, viewpoints, and stays.
              </p>
            </div>
            <div className="flex items-center text-xs font-bold text-rose-600 pt-1 gap-1">
              <span>View Wishlist</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* 10. Discount Vouchers */}
          <div
            onClick={() => onSelectModule('vouchers')}
            className="p-5 rounded-3xl bg-white border border-slate-100 shadow-md hover:shadow-xl hover:shadow-indigo-100/40 hover:border-amber-300 cursor-pointer group space-y-3 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-400 to-yellow-600 flex items-center justify-center text-white shadow-md shadow-amber-200 group-hover:scale-110 transition-transform">
                <Tag className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full border border-yellow-200">
                Up to 50% OFF
              </span>
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-800 group-hover:text-amber-600 transition-colors">
                Deals & Vouchers
              </h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                Exclusive promo codes for flights, hotels & monuments on MakeMyTrip, Booking.com & Uber.
              </p>
            </div>
            <div className="flex items-center text-xs font-bold text-amber-600 pt-1 gap-1">
              <span>Claim Vouchers</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

        </div>
      </div>

      {/* Places & Recommendations Grid for Current City */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-800 font-heading">
              Top Recommendations in {currentCity.name}
            </h2>
            <p className="text-xs text-slate-500">
              Personalized based on your travel style ({currentUser.travelStyle || 'Balanced Explorer'})
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`px-3.5 py-1.5 rounded-xl font-semibold transition-all ${
                selectedCategory === 'all'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                  : 'bg-white text-slate-600 hover:text-indigo-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              All Places
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('attraction')}
              className={`px-3.5 py-1.5 rounded-xl font-semibold transition-all ${
                selectedCategory === 'attraction'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                  : 'bg-white text-slate-600 hover:text-indigo-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              Attractions
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('hidden_gem')}
              className={`px-3.5 py-1.5 rounded-xl font-semibold transition-all ${
                selectedCategory === 'hidden_gem'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                  : 'bg-white text-slate-600 hover:text-indigo-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              Hidden Gems
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('cafe')}
              className={`px-3.5 py-1.5 rounded-xl font-semibold transition-all ${
                selectedCategory === 'cafe'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                  : 'bg-white text-slate-600 hover:text-indigo-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              Food & Cafes
            </button>
          </div>
        </div>

        {/* Places Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPlaces.map((place) => {
            const isSaved = wishlistIds.includes(place.id);
            return (
              <div
                key={place.id}
                className="rounded-3xl bg-white border border-slate-100 overflow-hidden flex flex-col justify-between group hover:border-indigo-300 transition-all shadow-md hover:shadow-xl hover:shadow-indigo-100/50"
              >
                {/* Image Container */}
                <div className="relative h-48 w-full overflow-hidden">
                  <img
                    src={place.image}
                    alt={place.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-black/20" />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-[10px] font-bold text-indigo-700 border border-white/50 uppercase tracking-wider shadow-sm">
                      {place.category.replace('_', ' ')}
                    </span>
                    <button
                      type="button"
                      onClick={() => onToggleWishlist(place)}
                      className={`w-8 h-8 rounded-full backdrop-blur-md flex items-center justify-center transition-all shadow-sm ${
                        isSaved
                          ? 'bg-rose-500 text-white scale-110 shadow-md shadow-rose-500/30'
                          : 'bg-white/80 text-slate-600 hover:text-rose-500 hover:bg-white'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${isSaved ? 'fill-white' : ''}`} />
                    </button>
                  </div>

                  {/* Bottom Image Stats */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1 bg-white/90 px-2.5 py-1 rounded-lg backdrop-blur-md border border-white/40 text-amber-600 font-bold shadow-sm">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      <span>{place.rating}</span>
                      <span className="text-[10px] text-slate-500">({(place.reviewCount / 1000).toFixed(1)}k)</span>
                    </div>
                    <div className="bg-white/90 px-2.5 py-1 rounded-lg backdrop-blur-md border border-white/40 text-indigo-700 font-bold text-[11px] shadow-sm">
                      {place.approxCost}
                    </div>
                  </div>
                </div>

                {/* Place Details */}
                <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <h3 className="font-bold text-base text-slate-800 group-hover:text-indigo-600 transition-colors">
                      {place.name}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                      {place.description}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {place.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-100 text-[10px] text-slate-500 font-semibold"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => onSelectPlaceForMap(place)}
                      className="flex-1 py-2 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white border border-indigo-100 text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span>View on Map</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onSelectModule('planner')}
                      className="py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold flex items-center gap-1 transition-colors"
                      title="Add to Day-Wise Itinerary"
                    >
                      <Route className="w-3.5 h-3.5 text-amber-500" />
                      <span>Plan</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
