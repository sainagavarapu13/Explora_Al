/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, CityInfo, Place, TravelMemory, FriendRequest, TravelBuddy } from './types';
import { POPULAR_CITIES, SAMPLE_PLACES, SAMPLE_MEMORIES, SAMPLE_BUDDIES } from './data/travelData';
import { INITIAL_FRIEND_REQUESTS } from './data/sampleFriendRequests';
import { WelcomeAuth } from './components/WelcomeAuth';
import { Sidebar, NavModule } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { DashboardHome } from './components/DashboardHome';
import { AiChatbotVoice } from './components/AiChatbotVoice';
import { CameraLandmarkScanner } from './components/CameraLandmarkScanner';
import { BudgetTripPlanner } from './components/BudgetTripPlanner';
import { MapNavigation } from './components/MapNavigation';
import { LocationStatusModule } from './components/LocationStatusModule';
import { LanguageTranslator } from './components/LanguageTranslator';
import { TravelMemories } from './components/TravelMemories';
import { Wishlist } from './components/Wishlist';
import { Vouchers } from './components/Vouchers';
import { TravelerCommunity } from './components/TravelerCommunity';
import { MakeAFriendChat } from './components/MakeAFriendChat';
import { ProfileModule } from './components/ProfileModule';

export default function App() {
  // Authentication State
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('explora_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Active City
  const [currentCity, setCurrentCity] = useState<CityInfo>(() => {
    return POPULAR_CITIES[0]; // Jaipur default
  });

  // Places database
  const [places, setPlaces] = useState<Place[]>(SAMPLE_PLACES);

  // Active Navigation Module
  const [activeModule, setActiveModule] = useState<NavModule>('dashboard');

  // Selected Place for Map navigation
  const [selectedPlaceForMap, setSelectedPlaceForMap] = useState<Place | null>(null);

  // Wishlist Places IDs
  const [wishlistIds, setWishlistIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('explora_wishlist');
    return saved ? JSON.parse(saved) : ['place-1', 'place-3', 'place-4'];
  });

  // Memories collection
  const [memories, setMemories] = useState<TravelMemory[]>(() => {
    const saved = localStorage.getItem('explora_memories');
    return saved ? JSON.parse(saved) : SAMPLE_MEMORIES;
  });

  // Travel Buddies & Friends state
  const [buddies, setBuddies] = useState<TravelBuddy[]>(() => {
    const saved = localStorage.getItem('explora_buddies');
    return saved ? JSON.parse(saved) : SAMPLE_BUDDIES;
  });

  // Friend Requests state
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>(() => {
    const saved = localStorage.getItem('explora_friend_requests');
    return saved ? JSON.parse(saved) : INITIAL_FRIEND_REQUESTS;
  });

  const [isSearchingAI, setIsSearchingAI] = useState(false);
  const [isExploringLocation, setIsExploringLocation] = useState(false);
  const [locationNotification, setLocationNotification] = useState<string | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const mainContentRef = useRef<HTMLDivElement>(null);

  // Universal City/Village Exploration via AI & Geocoding
  const handleExploreLocation = async (query: string) => {
    if (!query.trim()) return;
    setIsExploringLocation(true);
    try {
      const response = await fetch('/api/ai/explore-location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        throw new Error(`Location exploration error (status ${response.status})`);
      }

      const data = await response.json();
      if (data.city) {
        setCurrentCity(data.city);

        if (data.places && data.places.length > 0) {
          setPlaces((prev) => {
            const others = prev.filter(
              (p) => p.city.toLowerCase() !== data.city.name.toLowerCase()
            );
            return [...data.places, ...others];
          });
          setSelectedPlaceForMap(data.places[0]);
        } else {
          setSelectedPlaceForMap(null);
        }

        setLocationNotification(`Loaded ${data.city.name} (${data.city.country}) with live weather, landmarks & routes!`);
        setTimeout(() => setLocationNotification(null), 5000);
      }
    } catch (err) {
      console.error('Explore location error:', err);
      // Fallback: search popular presets
      const queryLower = query.toLowerCase();
      const match = POPULAR_CITIES.find(
        (c) =>
          c.name.toLowerCase().includes(queryLower) ||
          queryLower.includes(c.name.toLowerCase()) ||
          c.country.toLowerCase().includes(queryLower)
      );

      if (match) {
        setCurrentCity(match);
        setSelectedPlaceForMap(null);
      } else {
        // Fallback dynamic place
        const customFallback: CityInfo = {
          id: `city-${Date.now()}`,
          name: query.split(',')[0].trim(),
          country: query.includes(',') ? query.split(',').slice(1).join(',').trim() : 'Global Destination',
          tagline: `Experience the captivating sights, heritage, and local hospitality of ${query}.`,
          heroImage: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1600&q=80',
          lat: 20.5937,
          lng: 78.9629,
          safetyRating: 'Verified',
          bestSeason: 'Year-Round',
          currency: 'Local',
          currencySymbol: '¤',
          weather: { temp: '24°C', condition: 'Pleasant & Clear', icon: 'sun', humidity: '55%' },
          emergencyNumbers: { police: '112', ambulance: '108', touristHelpline: '1363' }
        };
        setCurrentCity(customFallback);
        setSelectedPlaceForMap(null);
      }
    } finally {
      setIsExploringLocation(false);
    }
  };

  // Save to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('explora_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('explora_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('explora_wishlist', JSON.stringify(wishlistIds));
  }, [wishlistIds]);

  useEffect(() => {
    localStorage.setItem('explora_memories', JSON.stringify(memories));
  }, [memories]);

  useEffect(() => {
    localStorage.setItem('explora_buddies', JSON.stringify(buddies));
  }, [buddies]);

  useEffect(() => {
    localStorage.setItem('explora_friend_requests', JSON.stringify(friendRequests));
  }, [friendRequests]);

  // Profile update handler
  const handleUpdateProfile = (updatedUser: Partial<User>) => {
    if (!currentUser) return;
    const merged = { ...currentUser, ...updatedUser };
    setCurrentUser(merged);
  };

  // Friend Request Handlers (users only become friends when accepted)
  const handleAcceptFriendRequest = (requestId: string) => {
    const req = friendRequests.find((r) => r.id === requestId);
    if (!req) return;

    // 1. Mark request as accepted
    setFriendRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: 'accepted' } : r))
    );

    // 2. Make them friends in the buddies list
    setBuddies((prev) => {
      const exists = prev.some((b) => b.id === req.fromUser.id);
      if (exists) {
        return prev.map((b) => (b.id === req.fromUser.id ? { ...b, isFriend: true } : b));
      } else {
        const newBuddy: TravelBuddy = {
          id: req.fromUser.id,
          name: req.fromUser.name,
          avatar: req.fromUser.avatar,
          country: req.fromUser.country,
          currentCity: req.fromUser.currentCity,
          travelStyle: req.fromUser.travelStyle,
          bio: req.fromUser.bio,
          interests: req.fromUser.interests,
          languages: ['English'],
          datesInCity: 'In Town Now',
          isFriend: true
        };
        return [newBuddy, ...prev];
      }
    });

    setLocationNotification(`You and ${req.fromUser.name} are now friends! You can now chat together.`);
    setTimeout(() => setLocationNotification(null), 4000);
  };

  const handleDeclineFriendRequest = (requestId: string) => {
    setFriendRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: 'declined' } : r))
    );
  };

  const handleSendFriendRequest = (buddyId: string) => {
    const buddy = buddies.find((b) => b.id === buddyId);
    if (!buddy) return;
    setLocationNotification(`Friend request sent to ${buddy.name}! They will become friends when accepted.`);
    setTimeout(() => setLocationNotification(null), 4000);
  };

  // Wishlist toggle handler
  const handleToggleWishlist = (place: Place) => {
    if (wishlistIds.includes(place.id)) {
      setWishlistIds(wishlistIds.filter((id) => id !== place.id));
    } else {
      setWishlistIds([...wishlistIds, place.id]);
    }
  };

  const handleRemoveFromWishlist = (placeId: string) => {
    setWishlistIds(wishlistIds.filter((id) => id !== placeId));
  };

  // Add Memory handler
  const handleAddMemory = (newMem: TravelMemory) => {
    setMemories([newMem, ...memories]);
  };

  const handleDeleteMemory = (id: string) => {
    setMemories(memories.filter((m) => m.id !== id));
  };

  const handleUpdateMemory = (updatedMem: TravelMemory) => {
    setMemories(memories.map((m) => (m.id === updatedMem.id ? updatedMem : m)));
  };

  // Save landmark scan directly to memories
  const handleSaveScannedLandmarkToMemories = (landmarkName: string, city: string, image: string, description: string) => {
    const newMemory: TravelMemory = {
      id: `mem-${Date.now()}`,
      userId: currentUser?.id || 'guest',
      title: `${landmarkName} Exploration`,
      city: city,
      landmarkName: landmarkName,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      image: image,
      images: [image],
      story: description,
      rating: 5,
      tags: ['LandmarkScan', 'GeminiVision', city],
      likesCount: 1,
      commentsCount: 0
    };
    handleAddMemory(newMemory);
  };

  // Natural Language AI Search Query
  const handleSearchQuerySubmit = async (query: string) => {
    setIsSearchingAI(true);
    try {
      const response = await fetch('/api/ai/search-places', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          city: currentCity.name,
        }),
      });

      const data = await response.json();
      if (data.results && data.results.length > 0) {
        // If results match, append or focus
        const first = data.results[0];
        const match = places.find((p) => p.name.toLowerCase().includes(first.name?.toLowerCase() || ''));
        if (match) {
          setSelectedPlaceForMap(match);
          setActiveModule('map');
        } else {
          // Switch to chat or map
          setActiveModule('chatbot');
        }
      } else {
        setActiveModule('chatbot');
      }
    } catch (err) {
      console.error('Search error:', err);
      setActiveModule('chatbot');
    } finally {
      setIsSearchingAI(false);
    }
  };

  // Navigate to Map with place preselected
  const handleSelectPlaceForMap = (place: Place) => {
    setSelectedPlaceForMap(place);
    setActiveModule('map');
  };

  // If user is not logged in, render Welcome & Auth page
  if (!currentUser) {
    return <WelcomeAuth onLoginSuccess={(user) => setCurrentUser(user)} />;
  }

  const wishlistPlaces = places.filter((p) => wishlistIds.includes(p.id));

  return (
    <div className="h-screen w-full bg-[#F8FAFC] bg-abstract-mesh text-slate-800 flex overflow-hidden relative font-sans selection:bg-indigo-500 selection:text-white">
      {/* Background Ambient Multi-Blend Colorful Blobs */}
      <div className="fixed -top-24 -left-24 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40 pointer-events-none z-0" />
      <div className="fixed top-1/2 -right-24 w-80 h-80 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40 pointer-events-none z-0" />
      <div className="fixed bottom-0 left-1/3 w-64 h-64 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 pointer-events-none z-0" />

      {/* Notification Toast for Explored Location */}
      {locationNotification && (
        <div className="fixed top-20 right-6 z-50 animate-in fade-in slide-in-from-top-3 duration-300">
          <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-indigo-900/95 backdrop-blur-md text-white text-xs font-semibold shadow-2xl border border-indigo-500/50">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>{locationNotification}</span>
          </div>
        </div>
      )}

      {/* 1. Left Side Column-Wise Navigation Sidebar */}
      <Sidebar
        currentUser={currentUser}
        currentCity={currentCity}
        activeModule={activeModule}
        onSelectModule={(mod) => {
          setActiveModule(mod);
          mainContentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onLogout={() => setCurrentUser(null)}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        wishlistCount={wishlistIds.length}
        pendingRequestsCount={friendRequests.filter((r) => r.status === 'pending').length}
      />

      {/* 2. Main Right Column Area (Top Header + Active Content + Footer) - Scrollable */}
      <div
        ref={mainContentRef}
        className="flex-1 h-screen overflow-y-auto overflow-x-hidden flex flex-col min-w-0 scroll-smooth relative z-10"
      >
        {/* Top Header Bar for City switcher, Search, Weather, Alerts & Profile */}
        <TopHeader
          currentUser={currentUser}
          currentCity={currentCity}
          onSelectCity={(city) => {
            setCurrentCity(city);
            setSelectedPlaceForMap(null);
          }}
          onExploreLocation={handleExploreLocation}
          isExploringLocation={isExploringLocation}
          activeModule={activeModule}
          onSelectModule={(mod) => {
            setActiveModule(mod);
            mainContentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onLogout={() => setCurrentUser(null)}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
        />

        {/* Main Module Content Area */}
        <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-6 z-10">
          <AnimatePresence mode="wait">
            {activeModule === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
              >
                <DashboardHome
                  currentUser={currentUser}
                  currentCity={currentCity}
                  places={places}
                  onSelectModule={setActiveModule}
                  onSelectPlaceForMap={handleSelectPlaceForMap}
                  onToggleWishlist={handleToggleWishlist}
                  wishlistIds={wishlistIds}
                  onSearchQuerySubmit={handleSearchQuerySubmit}
                  isSearchingAI={isSearchingAI}
                />
              </motion.div>
            )}

            {activeModule === 'chatbot' && (
              <motion.div
                key="chatbot"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
              >
                <AiChatbotVoice
                  currentCity={currentCity}
                  currentUser={currentUser}
                  onAddPlaceToWishlist={(title, category) => {
                    const newPlace: Place = {
                      id: `custom-p-${Date.now()}`,
                      city: currentCity.name,
                      country: currentCity.country,
                      name: title,
                      category: 'attraction',
                      rating: 4.8,
                      reviewCount: 350,
                      approxCost: 'Moderate',
                      image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80',
                      lat: currentCity.lat + 0.003,
                      lng: currentCity.lng + 0.004,
                      description: `Recommended by ExploraAI copilot in ${currentCity.name}.`,
                      tags: ['Recommended', 'ExploraAI', category],
                      isTrending: true,
                    };
                    setPlaces([newPlace, ...places]);
                    setWishlistIds([...wishlistIds, newPlace.id]);
                    alert(`Added "${title}" to your Wishlist!`);
                  }}
                />
              </motion.div>
            )}

            {activeModule === 'scanner' && (
              <motion.div
                key="scanner"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
              >
                <CameraLandmarkScanner
                  currentCity={currentCity}
                  currentUser={currentUser}
                  onSaveToMemories={handleSaveScannedLandmarkToMemories}
                  onAddToWishlist={(title, cat, img) => {
                    const newPlace: Place = {
                      id: `scanned-${Date.now()}`,
                      city: currentCity.name,
                      country: currentCity.country,
                      name: title,
                      category: 'attraction',
                      rating: 4.9,
                      reviewCount: 1200,
                      approxCost: 'Ticket required',
                      image: img || 'https://images.unsplash.com/photo-1603288967341-a67554988771?auto=format&fit=crop&w=800&q=80',
                      lat: currentCity.lat,
                      lng: currentCity.lng,
                      description: `Identified with Gemini Landmark Vision in ${currentCity.name}.`,
                      tags: ['Monument', 'Historic', cat],
                      isTrending: true
                    };
                    setPlaces([newPlace, ...places]);
                    setWishlistIds([...wishlistIds, newPlace.id]);
                  }}
                />
              </motion.div>
            )}

            {activeModule === 'map' && (
              <motion.div
                key="map"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
              >
                <MapNavigation
                  currentCity={currentCity}
                  places={places}
                  selectedPlace={selectedPlaceForMap}
                  onToggleWishlist={handleToggleWishlist}
                  wishlistIds={wishlistIds}
                />
              </motion.div>
            )}

            {activeModule === 'planner' && (
              <motion.div
                key="planner"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
              >
                <BudgetTripPlanner
                  currentCity={currentCity}
                  currentUser={currentUser}
                  onSelectPlaceForMap={(placeName) => {
                    const found = places.find((p) => p.name.toLowerCase().includes(placeName.toLowerCase()));
                    if (found) {
                      handleSelectPlaceForMap(found);
                    } else {
                      setActiveModule('map');
                    }
                  }}
                />
              </motion.div>
            )}

            {activeModule === 'location' && (
              <motion.div
                key="location"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
              >
                <LocationStatusModule
                  currentCity={currentCity}
                  currentUser={currentUser}
                  onOpenScanner={() => setActiveModule('scanner')}
                />
              </motion.div>
            )}

            {activeModule === 'translator' && (
              <motion.div
                key="translator"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
              >
                <LanguageTranslator currentCity={currentCity} />
              </motion.div>
            )}

            {activeModule === 'memories' && (
              <motion.div
                key="memories"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
              >
                <TravelMemories
                  currentUser={currentUser}
                  currentCity={currentCity}
                  memories={memories}
                  onAddMemory={handleAddMemory}
                  onUpdateMemory={handleUpdateMemory}
                  onDeleteMemory={handleDeleteMemory}
                />
              </motion.div>
            )}

            {activeModule === 'wishlist' && (
              <motion.div
                key="wishlist"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
              >
                <Wishlist
                  currentUser={currentUser}
                  wishlistPlaces={wishlistPlaces}
                  onRemoveFromWishlist={handleRemoveFromWishlist}
                  onSelectPlaceForMap={handleSelectPlaceForMap}
                />
              </motion.div>
            )}

            {activeModule === 'vouchers' && (
              <motion.div
                key="vouchers"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
              >
                <Vouchers
                  currentUser={currentUser}
                />
              </motion.div>
            )}

            {activeModule === 'community' && (
              <motion.div
                key="community"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
              >
                <TravelerCommunity
                  currentUser={currentUser}
                  currentCity={currentCity}
                />
              </motion.div>
            )}

            {activeModule === 'friends' && (
              <motion.div
                key="friends"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
              >
                <MakeAFriendChat
                  currentUser={currentUser}
                  currentCity={currentCity}
                  buddies={buddies}
                  onSendFriendRequest={handleSendFriendRequest}
                  onSelectProfileModule={() => {
                    setActiveModule('profile');
                    mainContentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  pendingRequestsCount={friendRequests.filter((r) => r.status === 'pending').length}
                />
              </motion.div>
            )}

            {activeModule === 'profile' && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
              >
                <ProfileModule
                  currentUser={currentUser}
                  currentCity={currentCity}
                  friendRequests={friendRequests}
                  buddies={buddies}
                  onUpdateProfile={handleUpdateProfile}
                  onAcceptFriendRequest={handleAcceptFriendRequest}
                  onDeclineFriendRequest={handleDeclineFriendRequest}
                  onSelectModule={(mod) => {
                    setActiveModule(mod);
                    mainContentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  memoriesCount={memories.length}
                  wishlistCount={wishlistIds.length}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Footer */}
        <footer className="w-full border-t border-slate-200/90 bg-white/80 backdrop-blur-md py-6 mt-12 z-10 shadow-sm">
          <div className="w-full px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700">ExploraAI</span>
              <span>• Smart Tourism & AI Travel Companion</span>
            </div>
            <p>© 2026 ExploraAI. Powered by Google Gemini AI & OpenStreetMap.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
