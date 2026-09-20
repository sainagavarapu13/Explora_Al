import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  FriendRequest, 
  TravelBuddy, 
  CityInfo, 
  TravelMemory 
} from '../types';
import { 
  Camera, 
  Upload, 
  Check, 
  X, 
  UserCheck, 
  UserPlus, 
  Clock, 
  ShieldCheck, 
  MapPin, 
  Mail, 
  Phone, 
  Globe2, 
  Sparkles, 
  Heart, 
  Edit3, 
  Save, 
  MessageSquare, 
  AlertCircle, 
  CheckCircle2, 
  Compass, 
  Bookmark, 
  Calendar,
  Share2,
  RefreshCw
} from 'lucide-react';

interface ProfileModuleProps {
  currentUser: User;
  currentCity: CityInfo;
  friendRequests: FriendRequest[];
  buddies: TravelBuddy[];
  onUpdateProfile: (updatedUser: Partial<User>) => void;
  onAcceptFriendRequest: (requestId: string) => void;
  onDeclineFriendRequest: (requestId: string) => void;
  onSelectModule: (module: any) => void;
  memoriesCount?: number;
  wishlistCount?: number;
}

export const ProfileModule: React.FC<ProfileModuleProps> = ({
  currentUser,
  currentCity,
  friendRequests,
  buddies,
  onUpdateProfile,
  onAcceptFriendRequest,
  onDeclineFriendRequest,
  onSelectModule,
  memoriesCount = 0,
  wishlistCount = 0,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'requests' | 'friends' | 'edit'>('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form states for editing profile details
  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [phone, setPhone] = useState(currentUser.phone || '+91 98765 43210');
  const [homeCountry, setHomeCountry] = useState(currentUser.homeCountry || 'India');
  const [bio, setBio] = useState(currentUser.bio || '');
  const [travelStyle, setTravelStyle] = useState(currentUser.travelStyle || 'balanced');
  const [languagesInput, setLanguagesInput] = useState(currentUser.languages?.join(', ') || 'English, Hindi');
  const [interestsInput, setInterestsInput] = useState(currentUser.interests?.join(', ') || 'Forts, Cafes, Photography, Architecture');

  // Avatar changer modal / direct upload
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const curatedAvatars = [
    {
      id: 'av-1',
      url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
      label: 'Explorer Girl'
    },
    {
      id: 'av-2',
      url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      label: 'Backpacker'
    },
    {
      id: 'av-3',
      url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      label: 'Photographer'
    },
    {
      id: 'av-4',
      url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
      label: 'Culture Lover'
    },
    {
      id: 'av-5',
      url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80',
      label: 'Mountain Hiker'
    },
    {
      id: 'av-6',
      url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=300&q=80',
      label: 'Nomad Soul'
    },
  ];

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      onUpdateProfile({ avatar: dataUrl });
      setShowAvatarModal(false);
      triggerToast('Display picture updated successfully!');
    };
    reader.readAsDataURL(file);
  };

  const handleSaveDetails = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedLanguages = languagesInput.split(',').map(s => s.trim()).filter(Boolean);
    const parsedInterests = interestsInput.split(',').map(s => s.trim()).filter(Boolean);

    onUpdateProfile({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      homeCountry: homeCountry.trim(),
      bio: bio.trim(),
      travelStyle: travelStyle as any,
      languages: parsedLanguages,
      interests: parsedInterests
    });

    setIsEditing(false);
    triggerToast('Profile details saved successfully!');
  };

  // Accepted friends count
  const acceptedFriends = buddies.filter(b => b.isFriend);
  const pendingRequests = friendRequests.filter(r => r.status === 'pending');

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-6 z-50 p-4 rounded-2xl bg-emerald-600 text-white shadow-xl flex items-center gap-3 border border-emerald-500 font-medium text-xs sm:text-sm"
          >
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile Header Hero Card */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-xl">
        {/* Cover Graphic Banner */}
        <div className="h-44 sm:h-52 w-full bg-gradient-to-r from-indigo-900 via-purple-900 to-pink-900 relative">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/10 via-transparent to-black/60" />
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-black/40 backdrop-blur-md text-[11px] font-bold text-white border border-white/20 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Explora Verified Member</span>
            </span>
          </div>
        </div>

        {/* Profile Info Overlay Row */}
        <div className="px-6 pb-6 pt-0 relative -mt-16 sm:-mt-20">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            
            {/* Avatar with DP Change Trigger */}
            <div className="flex items-end gap-4">
              <div className="relative group">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover ring-4 ring-slate-900 bg-slate-800 shadow-2xl transition-all"
                />
                
                {/* Change DP Camera Button overlay */}
                <button
                  type="button"
                  onClick={() => setShowAvatarModal(true)}
                  className="absolute inset-0 rounded-3xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[11px] font-bold gap-1 cursor-pointer"
                  title="Change Display Picture"
                >
                  <Camera className="w-6 h-6 text-pink-400" />
                  <span>Change DP</span>
                </button>

                {/* Corner quick camera badge */}
                <button
                  type="button"
                  onClick={() => setShowAvatarModal(true)}
                  className="absolute -bottom-1 -right-1 p-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg border-2 border-slate-900 transition-all hover:scale-110"
                  title="Change Display Picture"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Identity & Badges */}
              <div className="space-y-1 mb-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-black text-white font-heading tracking-tight">
                    {currentUser.name}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    Verified Traveler
                  </span>
                </div>
                
                <p className="text-xs text-slate-400 flex items-center gap-2 flex-wrap">
                  <span className="flex items-center gap-1">
                    <Mail className="w-3 h-3 text-slate-400" />
                    {currentUser.email}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-slate-300">
                    <Globe2 className="w-3 h-3 text-indigo-400" />
                    {currentUser.homeCountry || 'Global'}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-emerald-400">
                    <MapPin className="w-3 h-3 text-emerald-400" />
                    Currently in {currentCity.name}
                  </span>
                </p>
              </div>
            </div>

            {/* Quick Actions in Header */}
            <div className="flex items-center gap-2.5 self-start sm:self-end">
              <button
                type="button"
                onClick={() => setShowAvatarModal(true)}
                className="px-3.5 py-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
              >
                <Camera className="w-3.5 h-3.5 text-pink-400" />
                <span>Change DP</span>
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setIsEditing(!isEditing);
                  setActiveTab('overview');
                }}
                className={`px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md ${
                  isEditing 
                    ? 'bg-amber-600 hover:bg-amber-500 text-white' 
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/25'
                }`}
              >
                {isEditing ? (
                  <>
                    <X className="w-3.5 h-3.5" />
                    <span>Cancel Edit</span>
                  </>
                ) : (
                  <>
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Profile Details</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-6 pt-5 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div 
              onClick={() => setActiveTab('friends')} 
              className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 cursor-pointer hover:border-emerald-500/40 transition-colors"
            >
              <div className="flex items-center justify-between text-slate-400 text-[11px]">
                <span>Accepted Friends</span>
                <UserCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-xl font-bold text-white mt-1">{acceptedFriends.length}</p>
              <p className="text-[10px] text-emerald-400 font-medium">Ready to travel together</p>
            </div>

            <div 
              onClick={() => setActiveTab('requests')} 
              className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 cursor-pointer hover:border-indigo-500/40 transition-colors relative"
            >
              <div className="flex items-center justify-between text-slate-400 text-[11px]">
                <span>Friend Requests</span>
                <UserPlus className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-xl font-bold text-white">{pendingRequests.length}</p>
                {pendingRequests.length > 0 && (
                  <span className="px-2 py-0.5 text-[9px] font-extrabold bg-indigo-500 text-white rounded-full animate-pulse">
                    Action needed
                  </span>
                )}
              </div>
              <p className="text-[10px] text-indigo-300 font-medium">Accept to connect</p>
            </div>

            <div 
              onClick={() => onSelectModule('memories')} 
              className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 cursor-pointer hover:border-pink-500/40 transition-colors"
            >
              <div className="flex items-center justify-between text-slate-400 text-[11px]">
                <span>Travel Memories</span>
                <Sparkles className="w-4 h-4 text-pink-400" />
              </div>
              <p className="text-xl font-bold text-white mt-1">{memoriesCount}</p>
              <p className="text-[10px] text-slate-400">Captured journeys</p>
            </div>

            <div 
              onClick={() => onSelectModule('wishlist')} 
              className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 cursor-pointer hover:border-rose-500/40 transition-colors"
            >
              <div className="flex items-center justify-between text-slate-400 text-[11px]">
                <span>Saved Wishlist</span>
                <Heart className="w-4 h-4 text-rose-400" />
              </div>
              <p className="text-xl font-bold text-white mt-1">{wishlistCount}</p>
              <p className="text-[10px] text-slate-400">Dream destinations</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => { setActiveTab('overview'); setIsEditing(false); }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'overview' && !isEditing
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Profile Details</span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab('requests'); setIsEditing(false); }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 relative ${
            activeTab === 'requests'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <UserPlus className="w-4 h-4" />
          <span>Friend Requests</span>
          {pendingRequests.length > 0 && (
            <span className={`px-2 py-0.2 rounded-full text-[10px] font-extrabold ${
              activeTab === 'requests' ? 'bg-white text-indigo-700' : 'bg-indigo-600 text-white'
            }`}>
              {pendingRequests.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab('friends'); setIsEditing(false); }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'friends'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Accepted Friends ({acceptedFriends.length})</span>
        </button>

        <button
          type="button"
          onClick={() => { setIsEditing(true); setActiveTab('overview'); }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            isEditing
              ? 'bg-amber-600 text-white shadow-md shadow-amber-200'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Edit3 className="w-4 h-4 text-amber-500" />
          <span>Edit Profile</span>
        </button>
      </div>

      {/* TAB CONTENT: 1. OVERVIEW & DETAILS VIEW */}
      {activeTab === 'overview' && !isEditing && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Bio & Travel Persona Card */}
          <div className="lg:col-span-2 space-y-6">
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Compass className="w-5 h-5 text-indigo-600" />
                  <h2 className="text-base font-bold text-slate-900 font-heading">Traveler Persona & Bio</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Details</span>
                </button>
              </div>

              <div className="space-y-3">
                <p className="text-sm text-slate-700 leading-relaxed font-normal">
                  {currentUser.bio || 'Passionate explorer exploring hidden architectures, cultural heritages, viewpoints, and mouthwatering local street specialties.'}
                </p>

                <div className="pt-2 flex flex-wrap gap-2">
                  <span className="px-3 py-1 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold text-xs uppercase tracking-wide">
                    Style: {currentUser.travelStyle || 'Balanced'}
                  </span>
                  <span className="px-3 py-1 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 font-bold text-xs">
                    Home Base: {currentUser.homeCountry || 'India'}
                  </span>
                  <span className="px-3 py-1 rounded-xl bg-purple-50 border border-purple-100 text-purple-700 font-bold text-xs">
                    Current Destination: {currentCity.name}
                  </span>
                </div>
              </div>

              {/* Interests & Specialties */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Passions & Interests</p>
                <div className="flex flex-wrap gap-2">
                  {(currentUser.interests || ['Forts', 'Heritage', 'Cafes', 'Photography', 'Chai Trails']).map((interest, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      <span>{interest}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Spoken Languages */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Spoken Languages</p>
                <div className="flex flex-wrap gap-2">
                  {(currentUser.languages || ['English', 'Hindi']).map((lang, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-xl bg-slate-50 text-slate-600 text-xs font-medium border border-slate-200"
                    >
                      🗣️ {lang}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Safety & Travel Preferences */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm font-heading">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h3>Verified Traveler Security & Contact Card</h3>
              </div>
              <p className="text-xs text-slate-500">
                Only accepted friends have access to connect with you in travel chats and coordinate meetups.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Account Email</p>
                    <p className="text-xs font-bold text-slate-800 truncate">{currentUser.email}</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Emergency Phone</p>
                    <p className="text-xs font-bold text-slate-800 truncate">{currentUser.phone || '+91 98765 43210'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Mini Requests Widget & Quick Nav */}
          <div className="space-y-6">
            
            {/* Friend Requests Quick Callout */}
            <div className="p-5 rounded-3xl bg-indigo-50/70 border border-indigo-100 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-indigo-950 font-bold text-sm font-heading">
                  <UserPlus className="w-4 h-4 text-indigo-600" />
                  <h4>Pending Requests</h4>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-extrabold">
                  {pendingRequests.length} New
                </span>
              </div>

              {pendingRequests.length === 0 ? (
                <div className="text-center py-4 space-y-2">
                  <UserCheck className="w-8 h-8 text-indigo-400 mx-auto" />
                  <p className="text-xs text-indigo-800 font-medium">All caught up!</p>
                  <p className="text-[11px] text-indigo-600">No pending friend requests at this time.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {pendingRequests.slice(0, 2).map((req) => (
                    <div key={req.id} className="p-3 rounded-2xl bg-white border border-indigo-100 shadow-sm space-y-2.5">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={req.fromUser.avatar}
                          alt={req.fromUser.name}
                          className="w-10 h-10 rounded-full object-cover border border-indigo-200 shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-900 truncate">{req.fromUser.name}</p>
                          <p className="text-[10px] text-slate-500 truncate">{req.fromUser.country} • {req.fromUser.travelStyle}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            onAcceptFriendRequest(req.id);
                            triggerToast(`You are now friends with ${req.fromUser.name}!`);
                          }}
                          className="flex-1 py-1.5 px-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1 shadow-sm transition-colors"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Accept</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onDeclineFriendRequest(req.id);
                            triggerToast(`Declined request from ${req.fromUser.name}`);
                          }}
                          className="py-1.5 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-medium transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {pendingRequests.length > 2 && (
                    <button
                      type="button"
                      onClick={() => setActiveTab('requests')}
                      className="w-full py-2 text-center text-xs font-bold text-indigo-700 hover:text-indigo-900 transition-colors"
                    >
                      View all {pendingRequests.length} requests →
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Quick Trip Shortcuts */}
            <div className="p-5 rounded-3xl bg-white border border-slate-200 space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Quick Actions</h4>
              
              <button
                type="button"
                onClick={() => setShowAvatarModal(true)}
                className="w-full p-3 rounded-2xl bg-slate-50 hover:bg-indigo-50/70 border border-slate-100 hover:border-indigo-200 flex items-center justify-between text-left transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-pink-100 text-pink-700 flex items-center justify-center">
                    <Camera className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 group-hover:text-indigo-700">Update Profile DP</p>
                    <p className="text-[10px] text-slate-500">Upload or pick travel avatar</p>
                  </div>
                </div>
                <Sparkles className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
              </button>

              <button
                type="button"
                onClick={() => onSelectModule('friends')}
                className="w-full p-3 rounded-2xl bg-slate-50 hover:bg-emerald-50/70 border border-slate-100 hover:border-emerald-200 flex items-center justify-between text-left transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 group-hover:text-emerald-700">Chat with Friends</p>
                    <p className="text-[10px] text-slate-500">Talk to accepted travel buddies</p>
                  </div>
                </div>
                <Check className="w-4 h-4 text-slate-400 group-hover:text-emerald-600" />
              </button>
            </div>

          </div>
        </div>
      )}

      {/* TAB CONTENT: 2. FRIEND REQUESTS TAB */}
      {activeTab === 'requests' && !isEditing && (
        <div className="space-y-4">
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900 font-heading">Friend Requests</h2>
                <p className="text-xs text-slate-500">
                  Explorers requesting to connect with you. Unless you accept their request, they do not become friends and cannot chat or share private itineraries.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold text-xs">
                {pendingRequests.length} Pending
              </span>
            </div>
          </div>

          {/* Pending Requests List */}
          {pendingRequests.length === 0 ? (
            <div className="p-12 rounded-3xl bg-white border border-slate-200 text-center space-y-4 shadow-sm">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">No Pending Requests</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  You have reviewed all incoming connection requests. You can explore the "Make a Friend" tab to discover more verified travelers in {currentCity.name}.
                </p>
              </div>
              <button
                type="button"
                onClick={() => onSelectModule('friends')}
                className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-colors"
              >
                Find Travel Buddies in {currentCity.name}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingRequests.map((request) => (
                <div
                  key={request.id}
                  className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4 hover:border-indigo-200 transition-all"
                >
                  <div className="flex items-start gap-3.5">
                    <img
                      src={request.fromUser.avatar}
                      alt={request.fromUser.name}
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-indigo-100 shadow-sm shrink-0"
                    />
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-sm font-bold text-slate-900 truncate font-heading">{request.fromUser.name}</h4>
                        <span className="text-[10px] text-slate-400 font-medium shrink-0 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {request.sentAt}
                        </span>
                      </div>
                      <p className="text-xs text-indigo-700 font-semibold">{request.fromUser.travelStyle}</p>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-emerald-500 shrink-0" />
                        <span>{request.fromUser.country} • Exploring {request.fromUser.currentCity}</span>
                      </p>
                    </div>
                  </div>

                  {/* Personal note / bio */}
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Introduction / Note</p>
                    <p className="text-xs text-slate-700 italic">
                      "{request.note || request.fromUser.bio}"
                    </p>
                  </div>

                  {/* Interests */}
                  <div className="flex flex-wrap gap-1.5">
                    {request.fromUser.interests.map((interest, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 text-[10px] font-medium">
                        {interest}
                      </span>
                    ))}
                  </div>

                  {/* Action Buttons: Accept / Decline */}
                  <div className="pt-2 border-t border-slate-100 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        onAcceptFriendRequest(request.id);
                        triggerToast(`Request accepted! You and ${request.fromUser.name} are now friends.`);
                      }}
                      className="flex-1 py-2.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-200 transition-all hover:scale-[1.02]"
                    >
                      <Check className="w-4 h-4" />
                      <span>Accept & Become Friends</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onDeclineFriendRequest(request.id);
                        triggerToast(`Declined request from ${request.fromUser.name}`);
                      }}
                      className="py-2.5 px-4 rounded-2xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 font-semibold text-xs transition-colors flex items-center gap-1"
                    >
                      <X className="w-4 h-4" />
                      <span>Decline</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: 3. ACCEPTED FRIENDS TAB */}
      {activeTab === 'friends' && !isEditing && (
        <div className="space-y-4">
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 font-heading">Accepted Friends ({acceptedFriends.length})</h2>
              <p className="text-xs text-slate-500">
                These travelers are verified friends who accepted your request or whose request you accepted. You can message them directly.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onSelectModule('friends')}
              className="px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Open Friend Messenger</span>
            </button>
          </div>

          {acceptedFriends.length === 0 ? (
            <div className="p-12 rounded-3xl bg-white border border-slate-200 text-center space-y-3">
              <UserCheck className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">No Accepted Friends Yet</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Once you accept pending requests from other travelers, they will appear here as confirmed travel friends.
              </p>
              {pendingRequests.length > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveTab('requests')}
                  className="mt-2 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-2xl"
                >
                  Review {pendingRequests.length} Pending Requests
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {acceptedFriends.map((friend) => (
                <div
                  key={friend.id}
                  className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3 hover:border-emerald-200 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={friend.avatar}
                          alt={friend.name}
                          className="w-12 h-12 rounded-2xl object-cover border-2 border-emerald-500"
                        />
                        <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1">
                          <h4 className="text-xs font-bold text-slate-900 truncate">{friend.name}</h4>
                          <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 text-[9px] font-bold">
                            Friend
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate">{friend.country}</p>
                        <p className="text-[10px] text-indigo-600 font-semibold">{friend.travelStyle}</p>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2">{friend.bio}</p>

                    <div className="flex flex-wrap gap-1">
                      {friend.interests.slice(0, 3).map((tag, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px]">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onSelectModule('friends')}
                      className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Chat with {friend.name.split(' ')[0]}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: 4. EDIT PROFILE DETAILS */}
      {isEditing && (
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900 font-heading">Edit Your Profile Details</h2>
              <p className="text-xs text-slate-500">Update your public traveler persona, contact credentials, and travel style.</p>
            </div>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSaveDetails} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              
              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Display Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none"
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none"
                />
              </div>

              {/* Emergency Phone */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Contact / Emergency Phone</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none"
                />
              </div>

              {/* Home Country */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Home Country / City</label>
                <input
                  type="text"
                  value={homeCountry}
                  onChange={(e) => setHomeCountry(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none"
                />
              </div>

              {/* Travel Style */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-slate-700">Travel Style Persona</label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  {(['budget', 'balanced', 'luxury', 'backpacker', 'foodie'] as const).map((style) => (
                    <button
                      key={style}
                      type="button"
                      onClick={() => setTravelStyle(style)}
                      className={`p-3 rounded-2xl border text-center text-xs font-bold capitalize transition-all ${
                        travelStyle === style
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-slate-700">Bio & Traveler Intro</label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Share a short intro, what sights you love seeing, and what kind of travel buddy you are looking for..."
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-normal focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none resize-none"
                />
              </div>

              {/* Languages Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Spoken Languages (comma separated)</label>
                <input
                  type="text"
                  value={languagesInput}
                  onChange={(e) => setLanguagesInput(e.target.value)}
                  placeholder="e.g. English, Hindi, French"
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none"
                />
              </div>

              {/* Interests Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Interests & Hobbies (comma separated)</label>
                <input
                  type="text"
                  value={interestsInput}
                  onChange={(e) => setInterestsInput(e.target.value)}
                  placeholder="e.g. Forts, Cafes, Photography, Street Food"
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none"
                />
              </div>
            </div>

            {/* Save Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-lg shadow-indigo-200 flex items-center gap-1.5 transition-all hover:scale-[1.02]"
              >
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: CHANGE DISPLAY PICTURE (DP) */}
      <AnimatePresence>
        {showAvatarModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 space-y-5"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Camera className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-base font-bold text-slate-900 font-heading">Change Display Picture</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAvatarModal(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Upload Custom Image File */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-700">Option 1: Upload from Device</p>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-4 px-4 rounded-2xl border-2 border-dashed border-indigo-200 hover:border-indigo-400 bg-indigo-50/50 hover:bg-indigo-50 text-indigo-700 font-bold text-xs flex flex-col items-center justify-center gap-1.5 transition-all"
                >
                  <Upload className="w-6 h-6 text-indigo-600" />
                  <span>Click to choose photo from your phone or computer</span>
                  <span className="text-[10px] text-slate-500 font-normal">Supports JPG, PNG, WebP</span>
                </button>
              </div>

              {/* Choose from Curated Avatars */}
              <div className="space-y-2 pt-2">
                <p className="text-xs font-bold text-slate-700">Option 2: Select Curated Traveler Avatar</p>
                <div className="grid grid-cols-3 gap-3">
                  {curatedAvatars.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        onUpdateProfile({ avatar: item.url });
                        setShowAvatarModal(false);
                        triggerToast('Display picture updated!');
                      }}
                      className={`p-2 rounded-2xl border transition-all text-center space-y-1.5 group ${
                        currentUser.avatar === item.url
                          ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-500/30'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <img
                        src={item.url}
                        alt={item.label}
                        className="w-16 h-16 rounded-xl object-cover mx-auto shadow-sm group-hover:scale-105 transition-transform"
                      />
                      <p className="text-[10px] font-bold text-slate-700 truncate">{item.label}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowAvatarModal(false)}
                  className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
