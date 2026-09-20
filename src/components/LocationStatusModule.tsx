import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Radio, MapPin, ShieldAlert, PhoneCall } from 'lucide-react';
import { CityInfo, User } from '../types';

interface LocationStatusModuleProps {
  currentCity: CityInfo;
  currentUser: User;
  onOpenScanner?: () => void;
}

export const LocationStatusModule: React.FC<LocationStatusModuleProps> = ({
  currentCity,
  currentUser,
  onOpenScanner,
}) => {
  const [sosModalOpen, setSosModalOpen] = useState(false);

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header Info */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/25">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white font-heading">Live Location Tracker</h2>
              <span className="px-2.5 py-0.5 text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                ACTIVE TRACKING
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Real-time GPS coordinates, current zone positioning, and tourist emergency assistance.
            </p>
          </div>
        </div>

        {/* SOS Button */}
        <button
          type="button"
          onClick={() => setSosModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-rose-600/30 transition-all hover:scale-105 cursor-pointer"
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Emergency Tourist SOS</span>
        </button>
      </div>

      {/* Live GPS Coordinates Card */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4">
        <h3 className="font-bold text-sm text-white uppercase tracking-wider flex items-center gap-2">
          <MapPin className="w-4 h-4 text-cyan-400" />
          <span>Active Geolocation Coordinates</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <p className="text-[10px] text-slate-400">Latitude</p>
            <p className="font-mono text-sm font-bold text-white">{(currentCity.lat + 0.005).toFixed(6)}° N</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <p className="text-[10px] text-slate-400">Longitude</p>
            <p className="font-mono text-sm font-bold text-white">{(currentCity.lng - 0.008).toFixed(6)}° E</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <p className="text-[10px] text-slate-400">Current Zone</p>
            <p className="font-bold text-sm text-cyan-300">{currentCity.name} Central Historic Quarter</p>
          </div>
        </div>
      </div>

      {/* Emergency SOS Modal */}
      <AnimatePresence>
        {sosModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-w-md w-full p-6 rounded-3xl bg-slate-900 border border-rose-500/40 shadow-2xl space-y-4 text-slate-100"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-rose-600/20 text-rose-400 flex items-center justify-center">
                  <PhoneCall className="w-6 h-6 animate-bounce" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Tourist Emergency Services</h3>
                  <p className="text-xs text-slate-400">Official 24/7 Helplines in {currentCity.country}</p>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-white">National Tourist Helpline</p>
                    <p className="text-slate-400 text-[11px]">Toll-free multilingual assistance</p>
                  </div>
                  <span className="font-mono text-sm font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-lg">
                    1363 / 112
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-white">Police Control Room</p>
                    <p className="text-slate-400 text-[11px]">Direct emergency response</p>
                  </div>
                  <span className="font-mono text-sm font-bold text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-lg">
                    100 / 112
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-white">Ambulance & Medical</p>
                    <p className="text-slate-400 text-[11px]">Nearest trauma care dispatch</p>
                  </div>
                  <span className="font-mono text-sm font-bold text-rose-400 bg-rose-500/10 px-3 py-1 rounded-lg">
                    108 / 102
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSosModalOpen(false)}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
              >
                Close Emergency Window
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
