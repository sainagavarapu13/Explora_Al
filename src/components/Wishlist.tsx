import React from 'react';
import { motion } from 'motion/react';
import { Heart, Trash2, MapPin, Star, Sparkles } from 'lucide-react';
import { Place, User } from '../types';

interface WishlistProps {
  currentUser: User;
  wishlistPlaces: Place[];
  onRemoveFromWishlist: (placeId: string) => void;
  onSelectPlaceForMap?: (place: Place) => void;
}

export const Wishlist: React.FC<WishlistProps> = ({
  currentUser,
  wishlistPlaces,
  onRemoveFromWishlist,
  onSelectPlaceForMap,
}) => {
  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header Info */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-600 flex items-center justify-center text-white shadow-lg shadow-rose-500/25">
            <Heart className="w-6 h-6 animate-pulse fill-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white font-heading">My Saved Travel Wishlist</h2>
              <span className="px-2.5 py-0.5 text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-full">
                {wishlistPlaces.length} {wishlistPlaces.length === 1 ? 'PLACE' : 'PLACES'} SAVED
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Curated collection of bucket-list attractions, hidden spots, cafes, and viewpoints for {currentUser.name}.
            </p>
          </div>
        </div>

        {wishlistPlaces.length > 0 && (
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300">
            <Sparkles className="w-3.5 h-3.5 text-rose-400" />
            <span>Ready for your next journey</span>
          </div>
        )}
      </div>

      {/* Wishlist Items Grid */}
      {wishlistPlaces.length === 0 ? (
        <div className="p-14 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
            <Heart className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white">Your Bucket Wishlist is Empty</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            Explore the Dashboard, Explore Map, or AI Assistant to discover and bookmark attractions, cafes, viewpoints, and hidden gems to your wishlist.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {wishlistPlaces.map((place) => (
            <motion.div
              key={place.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-2xl flex flex-col justify-between group hover:border-rose-500/40 transition-all"
            >
              <div className="relative h-48 w-full overflow-hidden">
                <img
                  src={place.image}
                  alt={place.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                
                <button
                  type="button"
                  onClick={() => onRemoveFromWishlist(place.id)}
                  className="absolute top-3 right-3 p-2 rounded-full bg-slate-950/80 text-slate-300 hover:text-rose-400 hover:bg-slate-900 transition-colors shadow-lg"
                  title="Remove from wishlist"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs">
                  <span className="px-2.5 py-0.5 rounded-full bg-rose-600/90 text-white font-bold text-[10px] uppercase tracking-wide">
                    {place.category.replace('_', ' ')}
                  </span>
                  <div className="flex items-center gap-1 bg-slate-950/80 px-2 py-0.5 rounded-lg text-amber-400 font-bold text-xs">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{place.rating}</span>
                  </div>
                </div>
              </div>

              <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs text-rose-400 font-medium">
                    <MapPin className="w-3 h-3" />
                    <span>{place.city}, {place.country}</span>
                  </div>
                  <h3 className="font-bold text-base text-white group-hover:text-rose-300 transition-colors">
                    {place.name}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {place.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-slate-300">
                    Est: <span className="text-white">{place.approxCost}</span>
                  </span>

                  {onSelectPlaceForMap && (
                    <button
                      type="button"
                      onClick={() => onSelectPlaceForMap(place)}
                      className="py-1.5 px-3 rounded-xl bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span>View on Map</span>
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
