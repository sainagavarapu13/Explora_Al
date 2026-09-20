import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Compass, Sparkles, MapPin, ShieldCheck, ArrowRight, Camera, Route, MessageSquareQuote, CheckCircle, Mail, Lock, User as UserIcon, Globe2, Eye, EyeOff } from 'lucide-react';
import { User } from '../types';

interface WelcomeAuthProps {
  onLoginSuccess: (user: User) => void;
}

export const WelcomeAuth: React.FC<WelcomeAuthProps> = ({ onLoginSuccess }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'signup' | 'forgot'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [homeCountry, setHomeCountry] = useState('India');
  const [travelStyle, setTravelStyle] = useState<'budget' | 'balanced' | 'luxury' | 'backpacker' | 'foodie'>('balanced');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const loggedInUser: User = {
      id: `user-${Date.now()}`,
      name: name.trim() || (email ? email.split('@')[0] : 'Vrindu Bhargavi'),
      email: email || 'vrindu.traveler@explora.ai',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
      bio: 'Avid explorer passionate about architecture, sunset viewpoints, and local street cuisine.',
      homeCountry: homeCountry,
      languages: ['English', 'Hindi'],
      interests: ['Heritage Forts', 'Local Cafes', 'Photography', 'Budget Travel'],
      travelStyle: travelStyle,
      currentCity: 'Jaipur',
      joinedDate: 'August 2026'
    };
    onLoginSuccess(loggedInUser);
  };

  const handleQuickDemoLogin = (profileName: string, avatarUrl: string, city: string, style: 'budget' | 'balanced' | 'luxury' | 'backpacker' | 'foodie') => {
    const demoUser: User = {
      id: `demo-${Date.now()}`,
      name: profileName,
      email: `${profileName.toLowerCase().replace(/\s+/g, '.')}@explora.ai`,
      avatar: avatarUrl,
      bio: `Smart explorer exploring ${city} with ExploraAI real-time assistance.`,
      homeCountry: 'India',
      languages: ['English', 'Hindi', 'French'],
      interests: ['Architecture', 'Food & Cafes', 'Hidden Gems', 'Cultural Trails'],
      travelStyle: style,
      currentCity: city,
      joinedDate: 'August 2026'
    };
    onLoginSuccess(demoUser);
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotSuccess(true);
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 bg-abstract-mesh text-slate-100 flex flex-col justify-between relative overflow-hidden">
      {/* Abstract Glowing Orbs */}
      <div className="absolute top-[-10%] left-[-5%] w-[450px] h-[450px] rounded-full bg-indigo-600/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-pink-600/15 blur-[140px] pointer-events-none" />
      <div className="absolute top-[40%] right-[15%] w-[350px] h-[350px] rounded-full bg-amber-500/10 blur-[100px] pointer-events-none" />

      {/* Top Header */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 border border-white/20">
            <Compass className="w-6 h-6 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent font-heading">
                Explora<span className="text-indigo-400">AI</span>
              </span>
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full">
                SMART TRAVEL 2.0
              </span>
            </div>
            <p className="text-xs text-slate-400">Intelligent Personalized City Explorer</p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-6 text-xs text-slate-300">
          <div className="flex items-center gap-1.5 bg-slate-900/60 px-3 py-1.5 rounded-full border border-slate-800">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Gemini Vision & NLP Powered</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-900/60 px-3 py-1.5 rounded-full border border-slate-800">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span>Interactive Map & Live GPS</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="w-full max-w-7xl mx-auto px-6 py-6 lg:py-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center z-10 flex-1">
        {/* Left Column: Value Proposition & Interactive Highlights */}
        <div className="lg:col-span-7 space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 border border-indigo-500/30 text-xs font-medium text-indigo-300">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Next-Gen Smart Tourism Ecosystem</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight font-heading leading-tight text-white">
              Explore Any City With{' '}
              <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
                Personalized AI Intelligence
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl font-light">
              ExploraAI is a smart travel assistant application that helps users explore any city in a personalized and intelligent way. Discover tourist attractions, hidden gems, and nearby places tailored to your budget and interests.
            </p>
          </motion.div>

          {/* 4 Feature Badges Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 hover:border-indigo-500/40 transition-colors shadow-lg">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <Camera className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-sm text-slate-100">Camera Landmark Recognition</h3>
              <p className="text-xs text-slate-400 leading-normal">
                Snap a photo of any monument or palace to instantly identify its history, tickets, hours & tips.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 hover:border-pink-500/40 transition-colors shadow-lg">
              <div className="w-9 h-9 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center">
                <Route className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-sm text-slate-100">Day-Wise Budget Planner & PDF</h3>
              <p className="text-xs text-slate-400 leading-normal">
                Generate custom morning-to-night itineraries matching your exact budget and export clean PDF vouchers.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 hover:border-emerald-500/40 transition-colors shadow-lg">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <MapPin className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-sm text-slate-100">Live GPS Navigation & Status</h3>
              <p className="text-xs text-slate-400 leading-normal">
                Track your live position on interactive maps with turn-by-turn routing and emergency tourist assistance.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 hover:border-amber-500/40 transition-colors shadow-lg">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <MessageSquareQuote className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-sm text-slate-100">Voice Assistant & Chatbot</h3>
              <p className="text-xs text-slate-400 leading-normal">
                Multilingual AI translator, voice conversation, image sharing, travel friends chat & discount vouchers.
              </p>
            </div>
          </motion.div>

          {/* Quick Demo Login Pills */}
          <div className="pt-2">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Instant 1-Click Demo Profiles (Ready to Test):
            </p>
            <div className="flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('Vrindu Bhargavi', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80', 'Jaipur', 'balanced')}
                className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-slate-900/80 hover:bg-indigo-600/20 border border-slate-700/80 hover:border-indigo-500/50 transition-all text-xs text-slate-200 group"
              >
                <img
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80"
                  alt="Vrindu"
                  className="w-6 h-6 rounded-full object-cover border border-indigo-400"
                />
                <span className="font-medium group-hover:text-indigo-300">Vrindu (Jaipur Explorer)</span>
                <ArrowRight className="w-3 h-3 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('Alex Rivera', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80', 'Paris', 'budget')}
                className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-slate-900/80 hover:bg-pink-600/20 border border-slate-700/80 hover:border-pink-500/50 transition-all text-xs text-slate-200 group"
              >
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80"
                  alt="Alex"
                  className="w-6 h-6 rounded-full object-cover border border-pink-400"
                />
                <span className="font-medium group-hover:text-pink-300">Alex (Paris Backpacker)</span>
                <ArrowRight className="w-3 h-3 text-slate-500 group-hover:text-pink-400 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('Sarah Chen', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80', 'Tokyo', 'luxury')}
                className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-slate-900/80 hover:bg-emerald-600/20 border border-slate-700/80 hover:border-emerald-500/50 transition-all text-xs text-slate-200 group"
              >
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
                  alt="Sarah"
                  className="w-6 h-6 rounded-full object-cover border border-emerald-400"
                />
                <span className="font-medium group-hover:text-emerald-300">Sarah (Tokyo Foodie)</span>
                <ArrowRight className="w-3 h-3 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Authentication Card (Login / Signup / Forgot) */}
        <div className="lg:col-span-5">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="p-6 sm:p-8 rounded-3xl bg-glass border border-white/10 shadow-2xl shadow-black/60 relative overflow-hidden"
          >
            {/* Ambient edge highlight */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/30 rounded-full blur-3xl pointer-events-none" />

            {/* Auth Tab Switcher */}
            <div className="flex rounded-xl bg-slate-900/90 p-1 mb-6 border border-slate-800">
              <button
                type="button"
                onClick={() => { setActiveTab('login'); setForgotSuccess(false); }}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === 'login'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab('signup'); setForgotSuccess(false); }}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === 'signup'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Create Account
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('forgot')}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === 'forgot'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Forgot?
              </button>
            </div>

            <AnimatePresence mode="wait">
              {/* LOGIN TAB */}
              {activeTab === 'login' && (
                <motion.form
                  key="login"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  onSubmit={handleLoginSubmit}
                  className="space-y-4"
                >
                  <div className="space-y-1">
                    <h2 className="text-xl font-bold text-white font-heading">Welcome Back, Traveler!</h2>
                    <p className="text-xs text-slate-400">Sign in to access your city itineraries, memories & wishlist.</p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-300">Email Address</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="vrindu@explora.ai"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium text-slate-300">Password</label>
                      <button
                        type="button"
                        onClick={() => setActiveTab('forgot')}
                        className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white text-sm font-semibold shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                  >
                    <span>Launch ExploraAI Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </motion.form>
              )}

              {/* SIGNUP TAB */}
              {activeTab === 'signup' && (
                <motion.form
                  key="signup"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  onSubmit={handleLoginSubmit}
                  className="space-y-3.5"
                >
                  <div className="space-y-1">
                    <h2 className="text-xl font-bold text-white font-heading">Create Explorer Profile</h2>
                    <p className="text-xs text-slate-400">Join the smart travel revolution and personalize your discovery.</p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-300">Full Name</label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Vrindu Bhargavi"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-300">Email Address</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="vrindu@explora.ai"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-300">Home Country</label>
                      <input
                        type="text"
                        value={homeCountry}
                        onChange={(e) => setHomeCountry(e.target.value)}
                        placeholder="India"
                        className="w-full px-3 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-300">Travel Style</label>
                      <select
                        value={travelStyle}
                        onChange={(e) => setTravelStyle(e.target.value as any)}
                        className="w-full px-3 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                      >
                        <option value="budget">Budget Backpacker</option>
                        <option value="balanced">Balanced Explorer</option>
                        <option value="luxury">Luxury & Comfort</option>
                        <option value="foodie">Culinary & Cafes</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-300">Create Password</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Minimum 8 characters"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white text-sm font-semibold shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                  >
                    <span>Create Account & Start Exploring</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </motion.form>
              )}

              {/* FORGOT PASSWORD TAB */}
              {activeTab === 'forgot' && (
                <motion.form
                  key="forgot"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  onSubmit={handleForgotSubmit}
                  className="space-y-4"
                >
                  <div className="space-y-1">
                    <h2 className="text-xl font-bold text-white font-heading">Reset Your Password</h2>
                    <p className="text-xs text-slate-400">Enter your registered email address and we'll send a secure recovery link.</p>
                  </div>

                  {forgotSuccess ? (
                    <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 space-y-2">
                      <div className="flex items-center gap-2 font-semibold text-sm">
                        <CheckCircle className="w-5 h-5 text-emerald-400" />
                        <span>Reset Link Dispatched!</span>
                      </div>
                      <p className="text-xs text-emerald-200/80 leading-relaxed">
                        We sent a password reset token to <b>{email || 'your email'}</b>. Please check your inbox and spam folders.
                      </p>
                      <button
                        type="button"
                        onClick={() => { setActiveTab('login'); setForgotSuccess(false); }}
                        className="mt-2 text-xs font-semibold text-white bg-emerald-600/40 px-3 py-1.5 rounded-lg hover:bg-emerald-600/60 transition-colors"
                      >
                        Return to Sign In
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-300">Registered Email</label>
                        <div className="relative">
                          <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="vrindu@explora.ai"
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-semibold shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all"
                      >
                        <span>Send Password Reset Instructions</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </motion.form>
              )}
            </AnimatePresence>

            {/* Security Guarantee */}
            <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-center gap-2 text-[11px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              <span>End-to-End Encrypted & Privacy Protected Travel Identity</span>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-4 text-center text-xs text-slate-500 z-10">
        <p>© 2026 ExploraAI Smart Travel Assistant. Powered by Google Gemini AI & OpenStreetMap.</p>
      </footer>
    </div>
  );
};
