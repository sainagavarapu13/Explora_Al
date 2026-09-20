import React, { useState } from 'react';
import { 
  MapPin, 
  Trees, 
  Building2, 
  Mountain, 
  Sparkles, 
  Search, 
  Loader2, 
  ChevronDown, 
  Sun, 
  Bell, 
  Tag, 
  Heart, 
  Users, 
  UserCheck, 
  LogOut, 
  Menu,
  Compass,
  User as UserIcon
} from 'lucide-react';
import { User, CityInfo } from '../types';
import { POPULAR_CITIES } from '../data/travelData';
import { NavModule } from './Sidebar';

interface TopHeaderProps {
  currentUser: User;
  currentCity: CityInfo;
  onSelectCity: (city: CityInfo) => void;
  onExploreLocation?: (query: string) => Promise<void>;
  isExploringLocation?: boolean;
  activeModule: NavModule;
  onSelectModule: (module: NavModule) => void;
  onLogout: () => void;
  unreadCount?: number;
  onOpenMobileSidebar?: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  currentUser,
  currentCity,
  onSelectCity,
  onExploreLocation,
  isExploringLocation = false,
  activeModule,
  onSelectModule,
  onLogout,
  unreadCount = 2,
  onOpenMobileSidebar,
}) => {
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [citySearchQuery, setCitySearchQuery] = useState('');
  const [cityCategoryTab, setCityCategoryTab] = useState<'all' | 'villages' | 'metropolises'>('all');

  const filteredCities = POPULAR_CITIES.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(citySearchQuery.toLowerCase()) ||
      c.country.toLowerCase().includes(citySearchQuery.toLowerCase()) ||
      (c.state && c.state.toLowerCase().includes(citySearchQuery.toLowerCase()));

    if (!matchesSearch) return false;
    if (cityCategoryTab === 'villages') return c.isVillageOrTown;
    if (cityCategoryTab === 'metropolises') return !c.isVillageOrTown;
    return true;
  });

  const handleCustomLocationSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!citySearchQuery.trim() || !onExploreLocation) return;
    await onExploreLocation(citySearchQuery.trim());
    setCityDropdownOpen(false);
    setCitySearchQuery('');
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-white/90 backdrop-blur-md border-b border-slate-200/90 shadow-sm transition-all">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Left: Mobile Sidebar Hamburger & Destination Picker */}
          <div className="flex items-center gap-2.5 sm:gap-3.5">
            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={onOpenMobileSidebar}
              className="lg:hidden p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors focus:outline-none"
              title="Open Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Mobile Brand Logo */}
            <button
              type="button"
              onClick={() => onSelectModule('dashboard')}
              className="flex lg:hidden items-center gap-1.5 focus:outline-none"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-pink-500 flex items-center justify-center text-white shadow-sm font-bold text-sm">
                <Compass className="w-4 h-4 animate-spin-slow" />
              </div>
            </button>

            {/* City & Village Selector Dropdown Pill */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setCityDropdownOpen(!cityDropdownOpen);
                  setProfileDropdownOpen(false);
                  setNotificationsOpen(false);
                }}
                className="flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200/90 border border-slate-200 text-xs text-slate-800 transition-all shadow-sm group"
              >
                <div className="flex items-center gap-1.5">
                  {currentCity.isVillageOrTown ? (
                    <Trees className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  ) : (
                    <MapPin className="w-3.5 h-3.5 text-pink-500 shrink-0" />
                  )}
                  <span className="font-bold text-slate-900 truncate max-w-[120px] sm:max-w-[180px]">
                    {currentCity.name}
                  </span>
                  <span className="text-slate-500 hidden md:inline text-[11px]">({currentCity.country})</span>
                  {currentCity.isVillageOrTown && (
                    <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      Village/Gem
                    </span>
                  )}
                </div>
                {isExploringLocation ? (
                  <Loader2 className="w-3.5 h-3.5 text-indigo-600 animate-spin" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-600 transition-colors" />
                )}
              </button>

              {/* Enhanced Global Location & Village Dropdown Explorer */}
              {cityDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white border border-slate-200 shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  {/* Search Bar for ANY City, Village, or Region */}
                  <form onSubmit={handleCustomLocationSubmit} className="space-y-2 pb-2.5 border-b border-slate-100">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                      <span className="flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-indigo-600" />
                        Explore Any City, Village, or Place
                      </span>
                    </div>

                    <div className="relative flex items-center">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={citySearchQuery}
                        onChange={(e) => setCitySearchQuery(e.target.value)}
                        placeholder="e.g. Mawlynnong, Hallstatt, Zermatt, Hampi..."
                        className="w-full pl-9 pr-20 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                        autoFocus
                      />
                      <button
                        type="submit"
                        disabled={!citySearchQuery.trim() || isExploringLocation}
                        className="absolute right-1.5 px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold shadow-sm disabled:opacity-40 transition-colors flex items-center gap-1"
                      >
                        {isExploringLocation ? <Loader2 className="w-3 h-3 animate-spin" /> : <span>Explore</span>}
                      </button>
                    </div>

                    {/* Category Filter Tabs */}
                    <div className="flex items-center gap-1 pt-1">
                      <button
                        type="button"
                        onClick={() => setCityCategoryTab('all')}
                        className={`flex-1 py-1 px-2 rounded-lg text-[10px] font-bold transition-colors ${
                          cityCategoryTab === 'all'
                            ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        All Places
                      </button>
                      <button
                        type="button"
                        onClick={() => setCityCategoryTab('villages')}
                        className={`flex-1 py-1 px-2 rounded-lg text-[10px] font-bold transition-colors flex items-center justify-center gap-1 ${
                          cityCategoryTab === 'villages'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        <Trees className="w-3 h-3 text-emerald-600" />
                        <span>Villages & Gems</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setCityCategoryTab('metropolises')}
                        className={`flex-1 py-1 px-2 rounded-lg text-[10px] font-bold transition-colors flex items-center justify-center gap-1 ${
                          cityCategoryTab === 'metropolises'
                            ? 'bg-purple-100 text-purple-700 border border-purple-200'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        <Building2 className="w-3 h-3 text-purple-600" />
                        <span>Metropolises</span>
                      </button>
                    </div>
                  </form>

                  {/* List of Curated Destinations */}
                  <div className="max-h-60 overflow-y-auto py-1.5 space-y-1 scrollbar-thin">
                    {filteredCities.map((city) => (
                      <button
                        key={city.id}
                        type="button"
                        onClick={() => {
                          onSelectCity(city);
                          setCityDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition-colors ${
                          currentCity.id === city.id
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-100 font-bold'
                            : 'text-slate-700 hover:bg-slate-50 hover:text-indigo-600'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs ${
                            city.isVillageOrTown ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-100 text-indigo-700'
                          }`}>
                            {city.isVillageOrTown ? <Trees className="w-3.5 h-3.5" /> : <Building2 className="w-3.5 h-3.5" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-slate-900">{city.name}</span>
                              {city.isVillageOrTown && (
                                <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-100 font-bold">
                                  Village
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-500">{city.country} {city.state ? `• ${city.state}` : ''}</span>
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-600 font-mono font-semibold bg-slate-100 px-2 py-0.5 rounded-md">
                          {city.weather.temp}
                        </span>
                      </button>
                    ))}

                    {filteredCities.length === 0 && (
                      <div className="p-4 text-center space-y-2">
                        <p className="text-xs text-slate-500">No preset found for "{citySearchQuery}".</p>
                        <button
                          type="button"
                          onClick={() => handleCustomLocationSubmit()}
                          className="w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Explore & Geocode "{citySearchQuery}" with AI</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Quick Preset Village Chips */}
                  <div className="pt-2 border-t border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                      <Mountain className="w-3 h-3 text-emerald-600" />
                      Popular Scenic Villages & Towns
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { name: 'Mawlynnong', country: 'India' },
                        { name: 'Hallstatt', country: 'Austria' },
                        { name: 'Zermatt', country: 'Switzerland' },
                        { name: 'Hampi', country: 'India' },
                        { name: 'Giethoorn', country: 'Netherlands' },
                        { name: 'Santorini', country: 'Greece' }
                      ].map((v) => (
                        <button
                          key={v.name}
                          type="button"
                          onClick={() => {
                            if (onExploreLocation) {
                              onExploreLocation(`${v.name}, ${v.country}`);
                              setCityDropdownOpen(false);
                            }
                          }}
                          className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-[10px] text-slate-600 font-medium border border-slate-200 transition-colors"
                        >
                          {v.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Live City Weather Badge */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50/80 border border-amber-200 text-xs text-amber-900 shadow-sm">
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span className="font-semibold">{currentCity.weather.temp}</span>
              <span className="text-amber-300">•</span>
              <span className="text-[11px] text-amber-800">{currentCity.weather.condition}</span>
            </div>
          </div>

          {/* Right Action Menu: Vouchers, Notifications & Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Vouchers Quick Badge */}
            <button
              type="button"
              onClick={() => onSelectModule('vouchers')}
              className="flex items-center space-x-1.5 bg-yellow-100 hover:bg-yellow-200/90 px-3 py-1.5 rounded-full border border-yellow-200 shadow-sm transition-all hover:scale-105 cursor-pointer"
            >
              <span className="text-xs font-bold text-yellow-800">🎫 5 Vouchers</span>
            </button>

            {/* Notifications Button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setNotificationsOpen(!notificationsOpen);
                  setProfileDropdownOpen(false);
                  setCityDropdownOpen(false);
                }}
                className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200/80 border border-slate-200 flex items-center justify-center text-slate-700 relative transition-colors shadow-sm"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-pink-500 ring-2 ring-white" />
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 rounded-2xl bg-white border border-slate-200 shadow-2xl p-3 z-50">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Travel Alerts</span>
                    <span className="text-[10px] text-indigo-600 font-semibold bg-indigo-50 px-2 py-0.5 rounded-full">2 New</span>
                  </div>
                  <div className="py-2 space-y-2">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Travel Advisory for {currentCity.name}</span>
                      </div>
                      <p className="text-[11px] text-slate-600">
                        {currentCity.tagline}
                      </p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700">
                        <Tag className="w-3.5 h-3.5 text-amber-600" />
                        <span>Exclusive Travel Voucher Active</span>
                      </div>
                      <p className="text-[11px] text-slate-600">
                        Enjoy discounted sightseeing & cab rentals in {currentCity.name}!
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Avatar & Menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setProfileDropdownOpen(!profileDropdownOpen);
                  setNotificationsOpen(false);
                  setCityDropdownOpen(false);
                }}
                className="flex items-center gap-2 p-1 pl-2.5 rounded-full bg-slate-100 hover:bg-slate-200/80 border border-slate-200 transition-all shadow-sm"
              >
                <div className="text-right hidden sm:block">
                  <p className="text-[10px] font-semibold text-slate-500 leading-tight">Welcome,</p>
                  <p className="text-xs font-bold text-slate-800 leading-tight">{currentUser.name}</p>
                </div>
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm"
                />
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl bg-white border border-slate-200 shadow-2xl p-3 z-50 space-y-2">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-xs font-bold text-slate-800">{currentUser.name}</p>
                    <p className="text-[10px] text-slate-500 truncate">{currentUser.email}</p>
                    <div className="mt-2 flex items-center gap-1 text-[10px] text-indigo-700 bg-indigo-50 font-bold px-2 py-0.5 rounded-full w-fit border border-indigo-100">
                      <span>{currentUser.travelStyle?.toUpperCase()} TRAVELER</span>
                    </div>
                  </div>

                  <div className="space-y-0.5 text-xs">
                    <button
                      type="button"
                      onClick={() => { onSelectModule('profile' as any); setProfileDropdownOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-indigo-700 bg-indigo-50/70 hover:bg-indigo-100 font-bold transition-colors"
                    >
                      <UserIcon className="w-4 h-4 text-indigo-600" />
                      <span>View Profile & Friends</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => { onSelectModule('memories'); setProfileDropdownOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                    >
                      <Heart className="w-4 h-4 text-pink-500" />
                      <span>Trip Memories & Journal</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => { onSelectModule('wishlist'); setProfileDropdownOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                    >
                      <Heart className="w-4 h-4 text-rose-500" />
                      <span>Saved Wishlist</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => { onSelectModule('vouchers'); setProfileDropdownOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:bg-amber-50 hover:text-amber-600 transition-colors"
                    >
                      <Tag className="w-4 h-4 text-amber-500" />
                      <span>Deals & Vouchers</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => { onSelectModule('community'); setProfileDropdownOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                    >
                      <Users className="w-4 h-4 text-blue-500" />
                      <span>Experiences & travel stories</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => { onSelectModule('friends'); setProfileDropdownOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                    >
                      <UserCheck className="w-4 h-4 text-emerald-600" />
                      <span>Make a Friend & Chat</span>
                    </button>
                  </div>

                  <div className="pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={onLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </header>
  );
};
