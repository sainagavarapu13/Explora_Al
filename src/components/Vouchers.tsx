import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Tag, Copy, Check, Sparkles, ExternalLink, Gift, Search, Percent, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Voucher, User } from '../types';
import { SAMPLE_VOUCHERS } from '../data/travelData';

interface VouchersProps {
  currentUser: User;
}

export const Vouchers: React.FC<VouchersProps> = ({ currentUser }) => {
  const [vouchers] = useState<Voucher[]>(SAMPLE_VOUCHERS);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = [
    { id: 'all', label: 'All Vouchers' },
    { id: 'Hotels', label: 'Hotels & Haveli' },
    { id: 'Flights & Hotels', label: 'Combos & Flights' },
    { id: 'Cabs & Transit', label: 'Cabs & Transport' },
    { id: 'Experiences', label: 'Tours & Culture' },
    { id: 'Monuments & Sightseeing', label: 'Monuments' },
  ];

  const filteredVouchers = vouchers.filter((v) => {
    const matchesCategory =
      selectedCategory === 'all' ||
      (v.category && v.category.toLowerCase().includes(selectedCategory.toLowerCase()));
    const matchesSearch =
      v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.partner.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);

    // Confetti celebration effect
    confetti({
      particleCount: 65,
      spread: 60,
      origin: { y: 0.75 },
      colors: ['#f59e0b', '#10b981', '#6366f1', '#ec4899'],
    });

    setTimeout(() => setCopiedCode(null), 2500);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header Info Banner */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-600 flex items-center justify-center text-white shadow-lg shadow-amber-500/25">
            <Tag className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white font-heading">Travel Deals & Vouchers</h2>
              <span className="px-2.5 py-0.5 text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full">
                VERIFIED PARTNER PERKS
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Exclusive discount vouchers on flights, stays, cabs, guided tours, and museum passes.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold">
          <ShieldCheck className="w-4 h-4 text-amber-400" />
          <span>Active Explorer Privilege</span>
        </div>
      </div>

      {/* Value Proposition Callout */}
      <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/30 flex items-center gap-3 text-xs text-amber-200">
        <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
        <span>
          <b>ExploraAI Direct Partner Coupons:</b> Copy and paste these coupon codes at checkout on official booking portals to save up to 25% or ₹4,500!
        </span>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search brand or deal..."
            className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
          />
        </div>
      </div>

      {/* Vouchers Grid */}
      {filteredVouchers.length === 0 ? (
        <div className="p-12 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-3">
          <Gift className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No Vouchers Found</h3>
          <p className="text-xs text-slate-400">
            No active discount vouchers match your filter criteria. Try resetting the category or search terms.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredVouchers.map((voucher) => (
            <motion.div
              key={voucher.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-col justify-between space-y-4 hover:border-amber-500/40 transition-all group relative overflow-hidden"
            >
              {/* Subtle background glow */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-950 text-[10px] font-bold text-slate-300 border border-slate-800">
                    {voucher.partner}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-extrabold border border-amber-500/30 flex items-center gap-1">
                    <Percent className="w-3 h-3" />
                    {voucher.discount}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-base text-white group-hover:text-amber-300 transition-colors">
                    {voucher.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {voucher.description}
                  </p>
                </div>

                <div className="text-[11px] text-slate-500">
                  Min Spend: <span className="text-slate-400">{voucher.minSpend}</span> • Valid till {voucher.expiryDate}
                </div>
              </div>

              {/* Promo Code Box */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                <div className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-dashed border-slate-700 text-xs font-mono font-bold text-amber-400 text-center tracking-wider">
                  {voucher.code}
                </div>

                <button
                  type="button"
                  onClick={() => handleCopyCode(voucher.code)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    copiedCode === voucher.code
                      ? 'bg-emerald-600 text-white'
                      : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md font-bold'
                  }`}
                >
                  {copiedCode === voucher.code ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
