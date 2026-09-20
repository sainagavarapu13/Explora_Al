import React from 'react';
import { 
  Compass, 
  MessageSquare, 
  Camera, 
  MapPin, 
  Route, 
  Radio, 
  Globe2, 
  Heart, 
  Users, 
  UserCheck, 
  Tag, 
  LogOut, 
  X,
  Sparkles,
  ChevronRight,
  User as UserIcon
} from 'lucide-react';
import { User, CityInfo } from '../types';

export type NavModule = 
  | 'dashboard'
  | 'chatbot'
  | 'scanner'
  | 'map'
  | 'planner'
  | 'location'
  | 'translator'
  | 'memories'
  | 'wishlist'
  | 'vouchers'
  | 'community'
  | 'friends'
  | 'profile';

interface SidebarProps {
  currentUser: User;
  currentCity: CityInfo;
  activeModule: NavModule;
  onSelectModule: (module: NavModule) => void;
  onLogout: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  wishlistCount?: number;
  pendingRequestsCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentUser,
  currentCity,
  activeModule,
  onSelectModule,
  onLogout,
  isOpenMobile,
  onCloseMobile,
  wishlistCount = 0,
  pendingRequestsCount = 0,
}) => {
  const navSections = [
    {
      title: 'EXPLORE & DISCOVER',
      items: [
        {
          id: 'dashboard' as NavModule,
          label: 'Dashboard',
          icon: Compass,
          color: 'text-indigo-600',
          activeBg: 'bg-indigo-600 text-white shadow-indigo-200',
          badge: null,
        },
        {
          id: 'chatbot' as NavModule,
          label: 'AI Assistant',
          icon: MessageSquare,
          color: 'text-purple-600',
          activeBg: 'bg-purple-600 text-white shadow-purple-200',
          badge: 'Gemini AI',
          badgeColor: 'bg-purple-100 text-purple-700 border-purple-200',
        },
        {
          id: 'scanner' as NavModule,
          label: 'Landmark Scanner',
          icon: Camera,
          color: 'text-pink-600',
          activeBg: 'bg-pink-600 text-white shadow-pink-200',
          badge: 'Vision',
          badgeColor: 'bg-pink-100 text-pink-700 border-pink-200',
        },
        {
          id: 'map' as NavModule,
          label: 'Explore Map',
          icon: MapPin,
          color: 'text-emerald-600',
          activeBg: 'bg-emerald-600 text-white shadow-emerald-200',
          badge: null,
        },
      ],
    },
    {
      title: 'PLAN & NAVIGATE',
      items: [
        {
          id: 'planner' as NavModule,
          label: 'Trip Planner',
          icon: Route,
          color: 'text-amber-600',
          activeBg: 'bg-amber-600 text-white shadow-amber-200',
          badge: 'Day-Wise',
          badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
        },
        {
          id: 'location' as NavModule,
          label: 'Live Tracker',
          icon: Radio,
          color: 'text-teal-600',
          activeBg: 'bg-teal-600 text-white shadow-teal-200',
          badge: 'Live',
          badgeColor: 'bg-teal-100 text-teal-700 border-teal-200',
        },
        {
          id: 'translator' as NavModule,
          label: 'Translator',
          icon: Globe2,
          color: 'text-blue-600',
          activeBg: 'bg-blue-600 text-white shadow-blue-200',
          badge: null,
        },
      ],
    },
    {
      title: 'COMMUNITY & SOCIAL',
      items: [
        {
          id: 'memories' as NavModule,
          label: 'Memories & Albums',
          icon: Heart,
          color: 'text-rose-600',
          activeBg: 'bg-rose-600 text-white shadow-rose-200',
          badge: null,
        },
        {
          id: 'community' as NavModule,
          label: 'Experiences & travel stories',
          icon: Users,
          color: 'text-sky-600',
          activeBg: 'bg-sky-600 text-white shadow-sky-200',
          badge: 'Feed',
          badgeColor: 'bg-sky-100 text-sky-700 border-sky-200',
        },
        {
          id: 'friends' as NavModule,
          label: 'Make a Friend & Chat',
          icon: UserCheck,
          color: 'text-violet-600',
          activeBg: 'bg-violet-600 text-white shadow-violet-200',
          badge: null,
        },
      ],
    },
    {
      title: 'SAVED & OFFERS',
      items: [
        {
          id: 'wishlist' as NavModule,
          label: 'Saved Wishlist',
          icon: Heart,
          color: 'text-rose-600',
          activeBg: 'bg-rose-600 text-white shadow-rose-200',
          badge: wishlistCount > 0 ? `${wishlistCount}` : null,
          badgeColor: 'bg-rose-100 text-rose-700 border-rose-200',
        },
        {
          id: 'vouchers' as NavModule,
          label: 'Deals & Vouchers',
          icon: Tag,
          color: 'text-amber-600',
          activeBg: 'bg-amber-600 text-white shadow-amber-200',
          badge: 'Perks',
          badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
        },
      ],
    },
    {
      title: 'ACCOUNT',
      items: [
        {
          id: 'profile' as NavModule,
          label: 'My Profile & Friends',
          icon: UserIcon,
          color: 'text-indigo-600',
          activeBg: 'bg-indigo-600 text-white shadow-indigo-200',
          badge: pendingRequestsCount && pendingRequestsCount > 0 ? `${pendingRequestsCount} New` : null,
          badgeColor: 'bg-indigo-100 text-indigo-700 border-indigo-200 font-bold',
        },
      ],
    },
  ];

  const handleModuleClick = (modId: NavModule) => {
    onSelectModule(modId);
    onCloseMobile();
  };

  const sidebarContent = (
    <div className="flex flex-col h-full w-full bg-white/95 backdrop-blur-xl text-slate-800 select-none">
      {/* Sidebar Header Brand Logo */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between shrink-0">
        <button
          type="button"
          onClick={() => handleModuleClick('dashboard')}
          className="flex items-center gap-3 text-left group focus:outline-none"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-200 group-hover:scale-105 transition-transform text-white shrink-0">
            <Compass className="w-5 h-5 animate-spin-slow" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-black tracking-tight bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent font-heading">
                ExploraAI
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium tracking-wide truncate">Smart Travel Companion</p>
          </div>
        </button>

        {/* Mobile Close Button */}
        <button
          type="button"
          onClick={onCloseMobile}
          className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Active Destination Quick Snippet */}
      <div className="px-4 py-2.5 bg-gradient-to-r from-indigo-50/80 via-purple-50/50 to-pink-50/80 border-b border-slate-100 shrink-0">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 truncate">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Exploring:</span>
            <span className="font-bold text-indigo-900 truncate">{currentCity.name}</span>
          </div>
          <span className="text-[10px] font-semibold text-slate-500 bg-white/80 px-1.5 py-0.5 rounded-md border border-slate-200/60 shrink-0">
            {currentCity.weather.temp}
          </span>
        </div>
      </div>

      {/* Vertical Navigation Columns */}
      <div className="flex-1 overflow-y-auto overscroll-contain px-3 py-3 space-y-4 scrollbar-thin scrollbar-thumb-slate-200 hover:scrollbar-thumb-indigo-200">
        {navSections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              {section.title}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeModule === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleModuleClick(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-2xl text-xs font-semibold transition-all group text-left ${
                      isActive
                        ? `${item.activeBg} shadow-md`
                        : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-100/90'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-100 group-hover:bg-indigo-50 group-hover:scale-105'
                        }`}
                      >
                        <Icon
                          className={`w-3.5 h-3.5 ${
                            isActive ? 'text-white' : item.color
                          }`}
                        />
                      </div>
                      <span className="truncate">{item.label}</span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {item.badge && (
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${
                            isActive
                              ? 'bg-white/25 text-white border-white/40'
                              : item.badgeColor || 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                      {!isActive && (
                        <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Sidebar Footer / User Profile */}
      <div className="p-3.5 border-t border-slate-200/80 bg-slate-50/90 shrink-0">
        <div className="flex items-center justify-between gap-2.5">
          <button
            type="button"
            onClick={() => handleModuleClick('profile')}
            className={`flex items-center gap-2 min-w-0 text-left p-1 rounded-xl transition-all hover:bg-slate-200/60 flex-1 ${
              activeModule === 'profile' ? 'ring-2 ring-indigo-500 bg-indigo-50/50' : ''
            }`}
            title="View Profile Module"
          >
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm shrink-0"
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-800 truncate leading-tight">{currentUser.name}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-[9px] text-indigo-700 bg-indigo-100/80 font-bold px-1.5 py-0.2 rounded-full border border-indigo-200 truncate">
                  {currentUser.travelStyle || 'Explorer'}
                </span>
                {pendingRequestsCount && pendingRequestsCount > 0 ? (
                  <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping" />
                ) : null}
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={onLogout}
            title="Sign Out"
            className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Left Sidebar Column */}
      <aside className="hidden lg:flex w-64 xl:w-72 h-screen sticky top-0 shrink-0 z-40 bg-white border-r border-slate-200/90 shadow-sm">
        {sidebarContent}
      </aside>

      {/* Mobile Slide-Over Left Drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop Overlay */}
          <div
            onClick={onCloseMobile}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
          />
          {/* Drawer Panel */}
          <div className="fixed inset-y-0 left-0 w-72 sm:w-80 h-full max-h-screen shadow-2xl z-50 animate-in slide-in-from-left duration-200 bg-white border-r border-slate-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
