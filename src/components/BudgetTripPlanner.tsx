import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Route, Sparkles, Download, Calendar, DollarSign, Clock, MapPin, Compass, ShieldCheck, Check, Coffee, Sun, Moon, ArrowRight, Share2, Layers } from 'lucide-react';
import { CityInfo, GeneratedItinerary, User } from '../types';
import { exportItineraryToPDF } from '../utils/pdfExport';
import { SAMPLE_JAIPUR_ITINERARY } from '../data/travelData';

interface BudgetTripPlannerProps {
  currentCity: CityInfo;
  currentUser: User;
  onSelectPlaceForMap?: (placeName: string) => void;
}

export const BudgetTripPlanner: React.FC<BudgetTripPlannerProps> = ({
  currentCity,
  currentUser,
  onSelectPlaceForMap,
}) => {
  const [destinationCity, setDestinationCity] = useState(currentCity.name);
  const [days, setDays] = useState<number>(3);
  const [budgetTier, setBudgetTier] = useState<string>('budget');
  const [budgetAmount, setBudgetAmount] = useState<string>('₹8,000');
  const [travelStyle, setTravelStyle] = useState<string>('Balanced Culture & Food');
  const [pace, setPace] = useState<string>('moderate');
  const [interests, setInterests] = useState<string[]>(['Heritage Forts', 'Local Cafes', 'Sunset Viewpoints']);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [itinerary, setItinerary] = useState<GeneratedItinerary | null>(
    currentCity.name.toLowerCase() === 'jaipur' ? SAMPLE_JAIPUR_ITINERARY : null
  );
  const [activeDayTab, setActiveDayTab] = useState<number>(1);

  const availableInterests = [
    'Heritage Forts',
    'Local Cafes',
    'Sunset Viewpoints',
    'Street Food',
    'Photography',
    'Art & Handicrafts',
    'Nightlife & Bars',
    'Temples & Spirituality',
    'Museums'
  ];

  const toggleInterest = (item: string) => {
    if (interests.includes(item)) {
      setInterests(interests.filter((i) => i !== item));
    } else {
      setInterests([...interests, item]);
    }
  };

  const handleGenerateItinerary = async (e: React.FormEvent) => {
    e.preventDefault();
    const effectiveDays = Math.max(1, Math.min(30, Number(days) || 1));
    if (days !== effectiveDays) {
      setDays(effectiveDays);
    }
    setIsGenerating(true);

    try {
      const response = await fetch('/api/ai/plan-trip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          city: destinationCity,
          days: effectiveDays,
          budgetTier,
          budgetAmount,
          travelStyle,
          interests,
          pace,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();
      if (data && data.days) {
        setItinerary(data);
        setActiveDayTab(1);
      }
    } catch (err: any) {
      console.warn('Itinerary planner handled fallback:', err?.message || err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!itinerary || isExporting) return;
    setIsExporting(true);
    try {
      exportItineraryToPDF(itinerary);
    } finally {
      setTimeout(() => {
        setIsExporting(false);
      }, 1200);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header Info */}
      <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-lg shadow-amber-500/25">
            <Route className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white font-heading">AI Budget Trip Planner</h2>
              <span className="px-2.5 py-0.5 text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full">
                DAY-WISE ITINERARY & PDF EXPORT
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Generate fully customized day-by-day itineraries matching your exact budget, pace, and interests.
            </p>
          </div>
        </div>

        {itinerary && (
          <button
            id="download-pdf-top-btn"
            type="button"
            onClick={handleDownloadPDF}
            disabled={isExporting}
            className="relative z-10 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-500/25 transition-all hover:scale-105 disabled:opacity-75 cursor-pointer"
          >
            {isExporting ? (
              <>
                <Check className="w-4 h-4 text-emerald-300 animate-bounce" />
                <span>Generating Clean PDF...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download PDF Itinerary</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Input Parameters Configuration Card */}
      <form onSubmit={handleGenerateItinerary} className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Destination City */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Destination City</label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={destinationCity}
                onChange={(e) => setDestinationCity(e.target.value)}
                placeholder="e.g. Jaipur, Paris, Tokyo"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Number of Days (Enterable input with stepper and quick presets) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="trip-days-input" className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span>Duration (Days)</span>
              </label>
              <span className="text-[11px] font-bold text-amber-400">
                {days || 1} {days === 1 ? 'Day' : 'Days'}
              </span>
            </div>

            {/* Direct Number Input + Stepper Controls */}
            <div className="flex items-center bg-slate-950 rounded-xl border border-slate-800 focus-within:border-amber-500 focus-within:ring-1 focus-within:ring-amber-500/20 transition-all overflow-hidden">
              <button
                type="button"
                id="decrease-days-btn"
                onClick={() => setDays((prev) => Math.max(1, (Number(prev) || 1) - 1))}
                title="Decrease 1 day"
                aria-label="Decrease days"
                className="px-3 py-2 text-slate-400 hover:text-amber-400 hover:bg-slate-900 transition-colors font-bold text-sm select-none"
              >
                -
              </button>

              <div className="relative flex-1 flex items-center justify-center">
                <input
                  id="trip-days-input"
                  type="number"
                  min={1}
                  max={30}
                  required
                  value={days === 0 ? '' : days}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '') {
                      setDays(0);
                    } else {
                      const parsed = parseInt(val, 10);
                      if (!isNaN(parsed)) {
                        setDays(Math.max(1, Math.min(30, parsed)));
                      }
                    }
                  }}
                  onBlur={() => {
                    if (!days || days < 1) setDays(1);
                    if (days > 30) setDays(30);
                  }}
                  placeholder="e.g. 5"
                  className="w-full text-center py-2 bg-transparent text-xs sm:text-sm font-bold text-slate-100 placeholder-slate-600 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <span className="text-[11px] text-slate-500 font-medium pr-2 select-none pointer-events-none">
                  days
                </span>
              </div>

              <button
                type="button"
                id="increase-days-btn"
                onClick={() => setDays((prev) => Math.min(30, (Number(prev) || 0) + 1))}
                title="Increase 1 day"
                aria-label="Increase days"
                className="px-3 py-2 text-slate-400 hover:text-amber-400 hover:bg-slate-900 transition-colors font-bold text-sm select-none"
              >
                +
              </button>
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-1 pt-0.5">
              {[1, 2, 3, 5, 7, 10, 14].map((num) => (
                <button
                  key={num}
                  type="button"
                  id={`preset-day-${num}`}
                  onClick={() => setDays(num)}
                  className={`flex-1 py-1 text-[10px] font-bold rounded-lg border transition-all ${
                    days === num
                      ? 'bg-amber-500 text-slate-950 border-amber-500 font-extrabold shadow-sm'
                      : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  {num}D
                </button>
              ))}
            </div>
          </div>

          {/* Budget Tier */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Budget Tier</label>
            <select
              value={budgetTier}
              onChange={(e) => setBudgetTier(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-amber-500"
            >
              <option value="backpacker">Backpacker / Ultra-Saver</option>
              <option value="budget">Budget-Friendly (₹500-₹1500/day)</option>
              <option value="moderate">Moderate / Balanced Comfort</option>
              <option value="luxury">Luxury & Premium Heritage</option>
            </select>
          </div>

          {/* Target Total Budget */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Target Budget Amount</label>
            <div className="relative">
              <DollarSign className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={budgetAmount}
                onChange={(e) => setBudgetAmount(e.target.value)}
                placeholder="e.g. ₹5,000 or $300"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Interests & Travel Style Multi-Select */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
            <span>What do you want to explore? (Select Interests)</span>
            <span className="text-[11px] text-amber-400">{interests.length} Selected</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {availableInterests.map((item) => {
              const isSelected = interests.includes(item);
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => toggleInterest(item)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950 font-semibold shadow-md shadow-amber-500/20'
                      : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800'
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  <span>{item}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Submit Generate Button */}
        <div className="flex justify-end pt-2 border-t border-slate-800/80">
          <button
            id="generate-itinerary-btn"
            type="submit"
            disabled={isGenerating}
            className="w-full sm:w-auto px-8 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-pink-500 hover:from-amber-400 hover:to-pink-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 transition-transform hover:scale-105 disabled:opacity-50 cursor-pointer"
          >
            {isGenerating ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin text-slate-950" />
                <span>Crafting Intelligent Itinerary...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>Generate Smart {days || 1}-Day Itinerary</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Generated Itinerary Display */}
      {itinerary && (
        <div className="space-y-6">
          
          {/* Trip Summary Header & Budget Breakdown Card */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold">
                  {itinerary.totalDays} DAYS • {itinerary.budgetTier.toUpperCase()} TRIP
                </span>
                <h3 className="text-2xl font-extrabold text-white font-heading mt-2">
                  {itinerary.city}, {itinerary.country} Custom Plan
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Estimated Total Budget: <b className="text-emerald-400">{itinerary.totalEstimatedBudget}</b> | Style: {itinerary.travelStyle}
                </p>
              </div>

              <button
                id="download-pdf-inline-btn"
                type="button"
                onClick={handleDownloadPDF}
                disabled={isExporting}
                className="px-4 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-colors disabled:opacity-75 cursor-pointer"
              >
                {isExporting ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400 animate-bounce" />
                    <span>Preparing PDF...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 text-amber-400" />
                    <span>Export PDF Itinerary</span>
                  </>
                )}
              </button>
            </div>

            {/* Budget Allocation Progress Bars */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-3">
              <p className="text-xs font-bold text-slate-300">Smart Budget Allocation Breakdown:</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Accommodations</span>
                    <span className="font-bold text-indigo-400">{itinerary.budgetBreakdown?.stay || 35}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500" style={{ width: `${itinerary.budgetBreakdown?.stay || 35}%` }} />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Food & Dining</span>
                    <span className="font-bold text-pink-400">{itinerary.budgetBreakdown?.food || 25}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-pink-500" style={{ width: `${itinerary.budgetBreakdown?.food || 25}%` }} />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Sightseeing & Tickets</span>
                    <span className="font-bold text-amber-400">{itinerary.budgetBreakdown?.sightseeing || 25}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400" style={{ width: `${itinerary.budgetBreakdown?.sightseeing || 25}%` }} />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Local Transport</span>
                    <span className="font-bold text-emerald-400">{itinerary.budgetBreakdown?.transit || 15}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-400" style={{ width: `${itinerary.budgetBreakdown?.transit || 15}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Day Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {itinerary.days.map((day) => (
              <button
                key={day.dayNumber}
                type="button"
                onClick={() => setActiveDayTab(day.dayNumber)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                  activeDayTab === day.dayNumber
                    ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Day {day.dayNumber}</span>
              </button>
            ))}
          </div>

          {/* Active Day Activities Timeline */}
          {itinerary.days
            .filter((d) => d.dayNumber === activeDayTab)
            .map((day) => (
              <div key={day.dayNumber} className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-base text-white">{day.title}</h4>
                    <p className="text-xs text-amber-300 mt-0.5">
                      Food Highlight: <span className="text-slate-300">{day.foodSpecialty}</span>
                    </p>
                  </div>
                  <div className="px-3 py-1 rounded-xl bg-slate-950 border border-slate-800 text-xs text-emerald-400 font-bold">
                    Est. Day Cost: {day.totalDayEstimatedCost}
                  </div>
                </div>

                <div className="space-y-3">
                  {day.activities.map((act, idx) => (
                    <div
                      key={idx}
                      className="p-5 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4 hover:border-amber-500/40 transition-all text-slate-100"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[11px] font-bold tracking-wide">
                            {act.timeSlot.toUpperCase()} • {act.time}
                          </span>
                          <span className="px-2.5 py-1 rounded-full bg-slate-950 text-slate-300 border border-slate-800 text-[11px] font-medium">
                            {act.category}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-xs">
                          <span className="px-3 py-1 rounded-xl bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 font-extrabold text-xs">
                            {act.estimatedCost}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <h5 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                          <span>{act.placeName}</span>
                          {onSelectPlaceForMap && (
                            <button
                              type="button"
                              onClick={() => onSelectPlaceForMap(act.placeName)}
                              className="text-xs text-indigo-400 hover:text-indigo-300 underline font-medium ml-1"
                            >
                              (View on Map)
                            </button>
                          )}
                        </h5>
                        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                          {act.description}
                        </p>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/90 flex flex-wrap items-center justify-between gap-3 text-xs">
                        <p className="text-amber-300 text-xs font-semibold flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
                          <span><b className="text-amber-200">Insider Secret:</b> <span className="text-slate-200 font-normal">{act.localTip}</span></span>
                        </p>
                        <p className="text-slate-400 text-xs flex items-center gap-1.5">
                          <span className="font-semibold text-slate-300">Transit:</span>
                          <span className="text-slate-200">{act.transportRecommendation}</span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};
