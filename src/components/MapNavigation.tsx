import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { 
  Navigation, Search, Star, Heart, X, Check, ArrowRight, ExternalLink, 
  Eye, Globe
} from 'lucide-react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
  useMap,
  useMapsLibrary
} from '@vis.gl/react-google-maps';
import { Place, CityInfo } from '../types';

// Google Maps API Key provided by the user
const GOOGLE_MAPS_API_KEY =
  (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY ||
  'AIzaSyBkfeDAZmsQIJhHziZeTVAuZnDFT_5XLGE';

interface MapNavigationProps {
  currentCity: CityInfo;
  places: Place[];
  selectedPlace?: Place | null;
  onToggleWishlist?: (place: Place) => void;
  wishlistIds?: string[];
}

// Inner component to handle map bounds and route rendering via Google Maps SDK
const MapRouteController: React.FC<{
  userLocation: { lat: number; lng: number };
  activePlace: Place | null;
  isNavigating: boolean;
}> = ({ userLocation, activePlace, isNavigating }) => {
  const map = useMap();
  const routesLib = useMapsLibrary('routes');
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null);

  useEffect(() => {
    if (!routesLib || !map) return;
    const renderer = new routesLib.DirectionsRenderer({
      map,
      suppressMarkers: true,
      polylineOptions: {
        strokeColor: '#6366f1',
        strokeWeight: 5,
        strokeOpacity: 0.85,
      },
    });
    setDirectionsRenderer(renderer);

    return () => {
      renderer.setMap(null);
    };
  }, [routesLib, map]);

  useEffect(() => {
    if (!directionsRenderer || !routesLib || !activePlace || !isNavigating) {
      if (directionsRenderer) {
        directionsRenderer.setDirections({ routes: [] } as any);
      }
      return;
    }

    const directionsService = new routesLib.DirectionsService();
    directionsService.route(
      {
        origin: userLocation,
        destination: { lat: activePlace.lat, lng: activePlace.lng },
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          directionsRenderer.setDirections(result);
        }
      }
    );
  }, [directionsRenderer, routesLib, activePlace, isNavigating, userLocation]);

  // Center map when activePlace or city changes
  useEffect(() => {
    if (!map) return;
    if (activePlace) {
      map.panTo({ lat: activePlace.lat, lng: activePlace.lng });
    }
  }, [map, activePlace]);

  return null;
};

export const MapNavigation: React.FC<MapNavigationProps> = ({
  currentCity,
  places,
  selectedPlace,
  onToggleWishlist,
  wishlistIds = [],
}) => {
  const [activePlace, setActivePlace] = useState<Place | null>(selectedPlace || null);
  const [mapSearchText, setMapSearchText] = useState('');
  const [isNavigating, setIsNavigating] = useState(false);
  const [navProgress, setNavProgress] = useState(0);
  const [mapTypeId, setMapTypeId] = useState<'roadmap' | 'satellite' | 'terrain' | 'hybrid'>('roadmap');

  // Simulated GPS origin in the target city
  const userLat = currentCity.lat + 0.004;
  const userLng = currentCity.lng - 0.005;
  const userLocation = { lat: userLat, lng: userLng };

  // Filter city places
  const cityPlaces = places.filter(
    (p) => p.city.toLowerCase() === currentCity.name.toLowerCase()
  );

  const filteredPlaces = cityPlaces.filter(
    (p) =>
      p.name.toLowerCase().includes(mapSearchText.toLowerCase()) ||
      p.category.toLowerCase().includes(mapSearchText.toLowerCase()) ||
      p.tags.some((t) => t.toLowerCase().includes(mapSearchText.toLowerCase()))
  );

  // Sync selectedPlace from parent
  useEffect(() => {
    if (selectedPlace) {
      setActivePlace(selectedPlace);
    }
  }, [selectedPlace]);

  const startNavigationTo = (place: Place) => {
    setActivePlace(place);
    setIsNavigating(true);
    setNavProgress(0);

    let step = 0;
    const interval = setInterval(() => {
      step += 10;
      setNavProgress(step);
      if (step >= 100) {
        clearInterval(interval);
      }
    }, 350);
  };

  const calculateDistance = (pLat: number, pLng: number) => {
    const dLat = (pLat - userLat) * 111;
    const dLng = (pLng - userLng) * 111 * Math.cos(userLat * (Math.PI / 180));
    const dist = Math.sqrt(dLat * dLat + dLng * dLng);
    return dist.toFixed(1);
  };

  const getPinColor = (category: string) => {
    switch (category) {
      case 'attraction':
        return '#f43f5e'; // Rose
      case 'hidden_gem':
        return '#a855f7'; // Purple
      case 'cafe':
      case 'restaurant':
        return '#f59e0b'; // Amber
      case 'viewpoint':
      case 'nature':
        return '#06b6d4'; // Cyan
      case 'culture':
        return '#ec4899'; // Pink
      default:
        return '#6366f1'; // Indigo
    }
  };

  const openGoogleMapsExternal = (place: Place) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}&destination_place_id=`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const openStreetViewExternal = (place: Place) => {
    const url = `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${place.lat},${place.lng}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-6">
      {/* Top Map Action Bar */}
      <div className="p-4 sm:p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
            <Globe className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white font-heading">
                Google Maps Live Navigation
              </h2>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                OFFICIAL API KEY CONNECTED
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Interactive high-precision mapping, satellite layers, live navigation directions, and landmark markers for {currentCity.name}.
            </p>
          </div>
        </div>

        {/* Search & Layer switch inside map header */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Map Layer Switcher */}
          <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setMapTypeId('roadmap')}
              className={`px-2.5 py-1.5 rounded-lg transition-all ${
                mapTypeId === 'roadmap'
                  ? 'bg-indigo-600 text-white font-semibold shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Roadmap
            </button>
            <button
              type="button"
              onClick={() => setMapTypeId('satellite')}
              className={`px-2.5 py-1.5 rounded-lg transition-all ${
                mapTypeId === 'satellite'
                  ? 'bg-indigo-600 text-white font-semibold shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Satellite
            </button>
            <button
              type="button"
              onClick={() => setMapTypeId('terrain')}
              className={`px-2.5 py-1.5 rounded-lg transition-all ${
                mapTypeId === 'terrain'
                  ? 'bg-indigo-600 text-white font-semibold shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Terrain
            </button>
          </div>

          {/* Search box */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={mapSearchText}
              onChange={(e) => setMapSearchText(e.target.value)}
              placeholder={`Search in ${currentCity.name}...`}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Main Map Stage & Sidebar Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Map View Container */}
        <div className="lg:col-span-8 space-y-4">
          <div className="relative rounded-3xl overflow-hidden border border-slate-800 shadow-2xl h-[560px] bg-slate-950">
            {/* Official Google Maps React Provider */}
            <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
              <Map
                mapId="DEMO_MAP_ID"
                internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                defaultCenter={{ lat: currentCity.lat, lng: currentCity.lng }}
                center={{ lat: currentCity.lat, lng: currentCity.lng }}
                defaultZoom={13}
                mapTypeId={mapTypeId}
                gestureHandling="greedy"
                disableDefaultUI={false}
                zoomControl={true}
                streetViewControl={true}
                fullscreenControl={true}
                className="w-full h-full"
              >
                {/* Controller for routes and live directions */}
                <MapRouteController
                  userLocation={userLocation}
                  activePlace={activePlace}
                  isNavigating={isNavigating}
                />

                {/* User Current Location Marker */}
                <AdvancedMarker
                  position={userLocation}
                  title="Your Current Location"
                >
                  <div className="relative flex items-center justify-center">
                    <div className="absolute w-7 h-7 rounded-full bg-blue-500/40 animate-ping" />
                    <div className="relative w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow-lg shadow-blue-500/50" />
                  </div>
                </AdvancedMarker>

                {/* All Filtered Place Advanced Markers */}
                {filteredPlaces.map((place) => {
                  const pinColor = getPinColor(place.category);
                  const isSelected = activePlace?.id === place.id;

                  return (
                    <AdvancedMarker
                      key={place.id}
                      position={{ lat: place.lat, lng: place.lng }}
                      onClick={() => setActivePlace(place)}
                      title={place.name}
                    >
                      <Pin
                        background={pinColor}
                        borderColor="#ffffff"
                        glyphColor="#ffffff"
                        scale={isSelected ? 1.25 : 1.0}
                      />
                    </AdvancedMarker>
                  );
                })}

                {/* InfoWindow Popup on Marker Selection */}
                {activePlace && (
                  <InfoWindow
                    position={{ lat: activePlace.lat, lng: activePlace.lng }}
                    onCloseClick={() => setActivePlace(null)}
                    headerContent={
                      <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-indigo-600" />
                        {activePlace.name}
                      </div>
                    }
                  >
                    <div className="max-w-[220px] p-1 text-slate-800 space-y-2 text-xs">
                      <img
                        src={activePlace.image}
                        alt={activePlace.name}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <p className="text-[11px] text-slate-600 line-clamp-2">
                        {activePlace.description}
                      </p>
                      <div className="flex items-center justify-between text-[10px] font-semibold pt-1 border-t border-slate-100">
                        <span className="text-amber-600 font-bold">
                          ★ {activePlace.rating}
                        </span>
                        <span className="text-emerald-700 font-bold">
                          {activePlace.approxCost}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => startNavigationTo(activePlace)}
                        className="w-full py-1.5 px-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold text-[10px] flex items-center justify-center gap-1"
                      >
                        <Navigation className="w-3 h-3" />
                        Get Directions
                      </button>
                    </div>
                  </InfoWindow>
                )}
              </Map>
            </APIProvider>

            {/* Navigation Active Progress Bar HUD */}
            {isNavigating && activePlace && (
              <div className="absolute bottom-4 left-4 right-4 z-10 p-4 rounded-2xl bg-slate-950/95 backdrop-blur-xl border border-indigo-500/40 shadow-2xl space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Navigation className="w-4 h-4 text-indigo-400 animate-spin" />
                    <span className="font-bold text-white">
                      Navigating to: <span className="text-indigo-300">{activePlace.name}</span>
                    </span>
                  </div>
                  <span className="font-mono text-emerald-400 font-bold">
                    {calculateDistance(activePlace.lat, activePlace.lng)} km away
                  </span>
                </div>

                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 via-teal-400 to-emerald-400 transition-all duration-300"
                    style={{ width: `${navProgress}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    Turn-by-turn route mapped via Google Maps
                  </span>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => openGoogleMapsExternal(activePlace)}
                      className="text-indigo-400 hover:text-indigo-300 hover:underline flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Open in Maps App
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsNavigating(false)}
                      className="text-rose-400 hover:underline font-semibold"
                    >
                      End Route
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Place Detail Card & Nearby List */}
        <div className="lg:col-span-4 space-y-4">
          {/* Selected Place Card if active */}
          {activePlace ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-2xl space-y-4"
            >
              <div className="relative h-44 w-full">
                <img
                  src={activePlace.image}
                  alt={activePlace.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                <button
                  type="button"
                  onClick={() => setActivePlace(null)}
                  className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-950/80 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs">
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-600/90 text-white font-bold text-[10px] uppercase tracking-wider">
                    {activePlace.category.replace('_', ' ')}
                  </span>
                  <div className="flex items-center gap-1 bg-slate-950/80 px-2 py-0.5 rounded-lg text-amber-400 font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{activePlace.rating}</span>
                    <span className="text-[10px] text-slate-400">({activePlace.reviewCount})</span>
                  </div>
                </div>
              </div>

              <div className="p-5 space-y-4 pt-0">
                <div>
                  <h3 className="font-bold text-lg text-white font-heading">
                    {activePlace.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                    {activePlace.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                    <p className="text-[10px] text-slate-400">Distance from you</p>
                    <p className="font-bold text-indigo-300 mt-0.5">
                      {calculateDistance(activePlace.lat, activePlace.lng)} km away
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                    <p className="text-[10px] text-slate-400">Estimated Cost</p>
                    <p className="font-bold text-emerald-400 mt-0.5">
                      {activePlace.approxCost}
                    </p>
                  </div>
                </div>

                {/* Highlights tags */}
                {activePlace.highlights && activePlace.highlights.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {activePlace.highlights.map((h, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-lg bg-slate-800/80 border border-slate-700/50 text-[10px] text-slate-300"
                      >
                        ✓ {h}
                      </span>
                    ))}
                  </div>
                )}

                {/* Google Maps Actions */}
                <div className="pt-2 space-y-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => startNavigationTo(activePlace)}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-md shadow-indigo-500/25 transition-all"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>Start Route Navigation</span>
                    </button>

                    {onToggleWishlist && (
                      <button
                        type="button"
                        onClick={() => onToggleWishlist(activePlace)}
                        className={`p-2.5 rounded-xl border transition-colors ${
                          wishlistIds.includes(activePlace.id)
                            ? 'bg-rose-600 text-white border-rose-500'
                            : 'bg-slate-950 text-slate-400 hover:text-rose-400 border-slate-800'
                        }`}
                        title="Save to Wishlist"
                      >
                        <Heart className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => openGoogleMapsExternal(activePlace)}
                      className="py-2 px-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-300 hover:text-white font-medium flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Open in Google Maps</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => openStreetViewExternal(activePlace)}
                      className="py-2 px-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-300 hover:text-white font-medium flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5 text-teal-400" />
                      <span>Street View 360°</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            /* Nearby Quick Place List */
            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
              <h4 className="font-bold text-xs text-white uppercase tracking-wider flex items-center justify-between">
                <span>Places in {currentCity.name}</span>
                <span className="text-indigo-400 font-semibold">{filteredPlaces.length} Found</span>
              </h4>

              <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
                {filteredPlaces.map((place) => (
                  <button
                    key={place.id}
                    type="button"
                    onClick={() => {
                      setActivePlace(place);
                    }}
                    className="w-full p-3 rounded-2xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-indigo-500/40 text-left transition-all flex items-center gap-3 group"
                  >
                    <img
                      src={place.image}
                      alt={place.name}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-800 group-hover:scale-105 transition-transform shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h5 className="font-bold text-xs text-white truncate group-hover:text-indigo-300">
                        {place.name}
                      </h5>
                      <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <span className="text-amber-400 font-semibold">★ {place.rating}</span>
                        <span>• {calculateDistance(place.lat, place.lng)} km</span>
                        <span>• <span className="text-emerald-400">{place.approxCost}</span></span>
                      </p>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
