import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Heart,
  Camera,
  Plus,
  MapPin,
  Calendar,
  Star,
  Trash2,
  Tag,
  Share2,
  Sparkles,
  Image as ImageIcon,
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Search,
  Download,
  Check,
  CheckCircle2,
  FolderHeart,
  Layers,
  Edit3,
  SlidersHorizontal,
  Upload,
  Link as LinkIcon
} from 'lucide-react';
import { TravelMemory, User, CityInfo } from '../types';

interface TravelMemoriesProps {
  currentUser: User;
  currentCity: CityInfo;
  memories: TravelMemory[];
  onAddMemory: (memory: TravelMemory) => void;
  onUpdateMemory?: (memory: TravelMemory) => void;
  onDeleteMemory: (id: string) => void;
}

export const TravelMemories: React.FC<TravelMemoriesProps> = ({
  currentUser,
  currentCity,
  memories,
  onAddMemory,
  onUpdateMemory,
  onDeleteMemory,
}) => {
  // Modal States
  const [modalOpen, setModalOpen] = useState(false);
  const [addPhotosModalMemory, setAddPhotosModalMemory] = useState<TravelMemory | null>(null);
  const [lightboxMemory, setLightboxMemory] = useState<TravelMemory | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Filter & Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCityFilter, setSelectedCityFilter] = useState('All');
  const [minRatingFilter, setMinRatingFilter] = useState(0);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'rating' | 'photos'>('newest');

  // Form States for New Memory
  const [title, setTitle] = useState('');
  const [city, setCity] = useState(currentCity.name);
  const [landmarkName, setLandmarkName] = useState('');
  const [description, setDescription] = useState('');
  const [rating, setRating] = useState(5);
  const [tags, setTags] = useState('Sunset, Architecture, Heritage');
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([
    'https://images.unsplash.com/photo-1603288967341-a67554988771?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80'
  ]);
  const [coverPhotoIndex, setCoverPhotoIndex] = useState(0);
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);

  // States for Appending Photos to Existing Memory
  const [extraPhotos, setExtraPhotos] = useState<string[]>([]);
  const [extraUrlInput, setExtraUrlInput] = useState('');

  // Toast / Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const extraFileInputRef = useRef<HTMLInputElement>(null);

  // Reset city input when current city changes
  useEffect(() => {
    setCity(currentCity.name);
  }, [currentCity]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!lightboxMemory) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const photos = getMemoryPhotos(lightboxMemory);
      if (e.key === 'Escape') {
        setLightboxMemory(null);
      } else if (e.key === 'ArrowLeft') {
        setLightboxIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
      } else if (e.key === 'ArrowRight') {
        setLightboxIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxMemory]);

  // Helper to extract all photos from a memory (supports both `images` array & single `image`)
  const getMemoryPhotos = (mem: TravelMemory): string[] => {
    if (mem.images && mem.images.length > 0) {
      return mem.images;
    }
    return mem.image ? [mem.image] : ['https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80'];
  };

  // Handle uploading multiple images at once (Unlimited)
  const handleMultipleImageFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newPhotos: string[] = [];
    let processed = 0;
    const fileCount = files.length;

    for (let i = 0; i < fileCount; i++) {
      const file = files[i];
      if (!file) continue;
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          newPhotos.push(reader.result as string);
        }
        processed++;
        if (processed === fileCount) {
          setUploadedPhotos((prev) => [...prev, ...newPhotos]);
          showToast(`Added ${fileCount} photo${fileCount > 1 ? 's' : ''}!`);
        }
      };
      reader.readAsDataURL(file);
    }

    // Reset input so same files can be re-selected if desired
    e.target.value = '';
  };

  // Handle uploading multiple extra images for existing memory
  const handleExtraImageFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newPhotos: string[] = [];
    let processed = 0;
    const fileCount = files.length;

    for (let i = 0; i < fileCount; i++) {
      const file = files[i];
      if (!file) continue;
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          newPhotos.push(reader.result as string);
        }
        processed++;
        if (processed === fileCount) {
          setExtraPhotos((prev) => [...prev, ...newPhotos]);
        }
      };
      reader.readAsDataURL(file);
    }

    e.target.value = '';
  };

  // Add photo via direct URL
  const handleAddPhotoUrl = () => {
    if (!customUrlInput.trim()) return;
    setUploadedPhotos((prev) => [...prev, customUrlInput.trim()]);
    setCustomUrlInput('');
    setShowUrlInput(false);
    showToast('Photo URL added successfully!');
  };

  // Add extra photo URL to existing memory
  const handleAddExtraUrl = () => {
    if (!extraUrlInput.trim()) return;
    setExtraPhotos((prev) => [...prev, extraUrlInput.trim()]);
    setExtraUrlInput('');
  };

  // Remove photo from pending new memory
  const handleRemovePhoto = (index: number) => {
    setUploadedPhotos((prev) => {
      const filtered = prev.filter((_, i) => i !== index);
      if (coverPhotoIndex >= filtered.length) {
        setCoverPhotoIndex(Math.max(0, filtered.length - 1));
      }
      return filtered;
    });
  };

  // Remove extra photo from pending edit
  const handleRemoveExtraPhoto = (index: number) => {
    setExtraPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  // Quick preset photos for quick inspiration
  const sampleInspirations = [
    'https://images.unsplash.com/photo-1603288967341-a67554988771?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1514890547357-a9ee288728e0?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&w=1200&q=80'
  ];

  // Submit New Memory
  const handleSubmitMemory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const allPhotos = uploadedPhotos.length > 0
      ? uploadedPhotos
      : ['https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80'];

    const coverPhoto = allPhotos[coverPhotoIndex] || allPhotos[0];

    const newMemory: TravelMemory = {
      id: `mem-${Date.now()}`,
      userId: currentUser.id,
      title: title.trim(),
      city: city.trim() || currentCity.name,
      landmarkName: landmarkName.trim() || title.trim(),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      image: coverPhoto,
      images: allPhotos,
      story: description.trim() || 'A magical travel experience captured in photos.',
      rating,
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      likesCount: 1,
      commentsCount: 0,
    };

    onAddMemory(newMemory);
    setModalOpen(false);
    showToast(`Stored new memory with ${allPhotos.length} photo${allPhotos.length > 1 ? 's' : ''}!`);

    // Reset Form
    setTitle('');
    setLandmarkName('');
    setDescription('');
    setUploadedPhotos([
      'https://images.unsplash.com/photo-1603288967341-a67554988771?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200&q=80'
    ]);
    setCoverPhotoIndex(0);
  };

  // Submit Appending Extra Photos to Existing Memory
  const handleSaveExtraPhotos = () => {
    if (!addPhotosModalMemory || extraPhotos.length === 0) {
      setAddPhotosModalMemory(null);
      return;
    }

    const currentPhotos = getMemoryPhotos(addPhotosModalMemory);
    const updatedPhotos = [...currentPhotos, ...extraPhotos];

    const updatedMemory: TravelMemory = {
      ...addPhotosModalMemory,
      images: updatedPhotos,
      image: addPhotosModalMemory.image || updatedPhotos[0]
    };

    if (onUpdateMemory) {
      onUpdateMemory(updatedMemory);
    } else {
      onDeleteMemory(addPhotosModalMemory.id);
      onAddMemory(updatedMemory);
    }

    // If lightbox is currently open on this memory, update it
    if (lightboxMemory?.id === addPhotosModalMemory.id) {
      setLightboxMemory(updatedMemory);
    }

    showToast(`Added ${extraPhotos.length} new photos to "${addPhotosModalMemory.title}"!`);
    setAddPhotosModalMemory(null);
    setExtraPhotos([]);
  };

  // Copy shareable link or text
  const handleShareMemory = (mem: TravelMemory) => {
    const text = `🌟 Travel Memory: "${mem.title}" in ${mem.city} (${mem.date}) - ⭐ ${mem.rating}/5 stars!\n${mem.story}`;
    navigator.clipboard.writeText(text);
    showToast('Memory details copied to clipboard!');
  };

  // Download photo
  const handleDownloadPhoto = (photoUrl: string, titleStr: string) => {
    const a = document.createElement('a');
    a.href = photoUrl;
    a.download = `${titleStr.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_memory.jpg`;
    a.target = '_blank';
    a.click();
    showToast('Photo download triggered!');
  };

  // Calculate unique cities and total stored photos count
  const allCities = Array.from(new Set(['All', ...memories.map((m) => m.city), currentCity.name]));
  const totalPhotosCount = memories.reduce((acc, mem) => acc + getMemoryPhotos(mem).length, 0);

  // Filtered and Sorted Memories
  const filteredMemories = memories.filter((mem) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      mem.title.toLowerCase().includes(query) ||
      mem.city.toLowerCase().includes(query) ||
      (mem.landmarkName && mem.landmarkName.toLowerCase().includes(query)) ||
      mem.story.toLowerCase().includes(query) ||
      mem.tags.some((t) => t.toLowerCase().includes(query));

    const matchesCity = selectedCityFilter === 'All' || mem.city.toLowerCase() === selectedCityFilter.toLowerCase();
    const matchesRating = minRatingFilter === 0 || mem.rating >= minRatingFilter;

    return matchesSearch && matchesCity && matchesRating;
  });

  const sortedMemories = [...filteredMemories].sort((a, b) => {
    if (sortBy === 'newest') return b.id.localeCompare(a.id);
    if (sortBy === 'oldest') return a.id.localeCompare(b.id);
    if (sortBy === 'rating') return b.rating - a.rating;
    if (sortBy === 'photos') return getMemoryPhotos(b).length - getMemoryPhotos(a).length;
    return 0;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-6 z-50 px-4 py-3 rounded-2xl bg-slate-900/95 backdrop-blur-md text-white text-xs font-semibold shadow-2xl border border-rose-500/40 flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Banner & Analytics Header */}
      <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800/80 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-600 flex items-center justify-center text-white shadow-lg shadow-rose-500/30">
                <Heart className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-white font-heading">
                    Stored Memories & Photo Albums
                  </h1>
                  <span className="px-2.5 py-0.5 text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-full uppercase tracking-wider">
                    Unlimited Photos
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-400">
                  Relive your travel journeys, explore full photo galleries, and upload as many travel photos as you want.
                </p>
              </div>
            </div>

            {/* Quick Stats Strip */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs">
                <FolderHeart className="w-3.5 h-3.5 text-rose-400" />
                <span className="text-slate-300 font-medium">{memories.length} Memories Stored</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs">
                <Camera className="w-3.5 h-3.5 text-pink-400" />
                <span className="text-slate-300 font-medium">{totalPhotosCount} Photos Uploaded</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-slate-300 font-medium">{allCities.length - 1} Destinations</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-rose-600 via-pink-600 to-rose-500 hover:from-rose-500 hover:to-pink-400 text-white text-xs sm:text-sm font-semibold flex items-center gap-2.5 shadow-xl shadow-rose-500/25 transition-all hover:scale-[1.02] active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Memory / Upload Photos</span>
            </button>
          </div>
        </div>
      </div>

      {/* Search, Filter & Sort Controls */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search stored memories by title, landmark, story, tags or city..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
              >
                Clear
              </button>
            )}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 whitespace-nowrap">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-rose-500 cursor-pointer"
            >
              <option value="newest">📅 Newest First</option>
              <option value="oldest">📅 Oldest First</option>
              <option value="rating">⭐ Highest Rated</option>
              <option value="photos">📸 Most Photos Uploaded</option>
            </select>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800/80">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-400 mr-1 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-rose-400" /> City:
            </span>
            {allCities.map((cName) => (
              <button
                key={cName}
                type="button"
                onClick={() => setSelectedCityFilter(cName)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  selectedCityFilter.toLowerCase() === cName.toLowerCase()
                    ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {cName}
              </button>
            ))}
          </div>

          {/* Star Filter */}
          <div className="flex items-center gap-1">
            <span className="text-[11px] font-semibold text-slate-400 mr-1">Rating:</span>
            {[
              { label: 'All', value: 0 },
              { label: '5 ⭐', value: 5 },
              { label: '4+ ⭐', value: 4 },
            ].map((rf) => (
              <button
                key={rf.label}
                type="button"
                onClick={() => setMinRatingFilter(rf.value)}
                className={`px-2.5 py-0.5 rounded-lg text-xs font-medium transition-all ${
                  minRatingFilter === rf.value
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {rf.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Memories Grid View */}
      {sortedMemories.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
            <Camera className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">No Stored Memories Found</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              {searchQuery || selectedCityFilter !== 'All' || minRatingFilter > 0
                ? 'Try adjusting your search query or city filters to find your memories.'
                : 'You have not uploaded any trip memories yet. Start building your personal photo album now!'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedCityFilter('All');
              setMinRatingFilter(0);
              setModalOpen(true);
            }}
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold inline-flex items-center gap-2 shadow-lg shadow-rose-500/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Upload Your First Travel Memory</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedMemories.map((mem) => {
            const photos = getMemoryPhotos(mem);
            const coverImage = mem.image || photos[0];

            return (
              <MemoryCard
                key={mem.id}
                memory={mem}
                photos={photos}
                coverImage={coverImage}
                currentUser={currentUser}
                onOpenLightbox={(idx) => {
                  setLightboxMemory(mem);
                  setLightboxIndex(idx);
                }}
                onAddExtraPhotos={() => {
                  setAddPhotosModalMemory(mem);
                  setExtraPhotos([]);
                }}
                onDelete={() => {
                  if (window.confirm(`Delete memory "${mem.title}"?`)) {
                    onDeleteMemory(mem.id);
                    showToast(`Deleted "${mem.title}"`);
                  }
                }}
                onShare={() => handleShareMemory(mem)}
              />
            );
          })}
        </div>
      )}

      {/* CREATE NEW MEMORY MODAL (Unlimited Multi-Photo Upload) */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="max-w-2xl w-full my-8 p-6 sm:p-7 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-5 text-slate-100 max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-500 to-pink-600 flex items-center justify-center text-white">
                    <Camera className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white font-heading">
                      Save New Travel Memory & Photos
                    </h3>
                    <p className="text-xs text-slate-400">
                      Upload unlimited photos, notes, and favorite highlights from your travels.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitMemory} className="space-y-4">
                {/* Title & Landmark */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Memory Title *</label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Sunset over Hawa Mahal rooftop cafe"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Landmark / Place Name</label>
                    <input
                      type="text"
                      value={landmarkName}
                      onChange={(e) => setLandmarkName(e.target.value)}
                      placeholder="e.g. Wind View Cafe / Amber Fort"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-all"
                    />
                  </div>
                </div>

                {/* City & Rating */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Destination City / Village</label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Jaipur, Venice, Kyoto, Mawlynnong"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Experience Rating</label>
                    <select
                      value={rating}
                      onChange={(e) => setRating(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-rose-500 cursor-pointer"
                    >
                      <option value={5}>⭐⭐⭐⭐⭐ (5 - Unforgettable & Magical)</option>
                      <option value={4}>⭐⭐⭐⭐ (4 - Great Experience)</option>
                      <option value={3}>⭐⭐⭐ (3 - Decent / Average)</option>
                      <option value={2}>⭐⭐ (2 - Below Expectations)</option>
                      <option value={1}>⭐ (1 - Disappointing)</option>
                    </select>
                  </div>
                </div>

                {/* PHOTO UPLOAD ZONE (Multi-Photo / Unlimited) */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5 text-rose-400" />
                      <span>Upload Photos ({uploadedPhotos.length} Selected - Unlimited)</span>
                    </label>
                    <span className="text-[11px] text-rose-300 font-medium">
                      Select multiple files at once
                    </span>
                  </div>

                  {/* Hidden Multi-File Input */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    multiple
                    accept="image/*"
                    onChange={handleMultipleImageFiles}
                    className="hidden"
                  />

                  {/* Action Buttons: Multi-Upload & URL */}
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600/20 to-pink-600/20 hover:from-rose-600/30 hover:to-pink-600/30 border border-rose-500/40 text-xs text-rose-300 font-semibold flex items-center gap-2 transition-all hover:scale-[1.02]"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Upload Photos from Device (Multi-Select)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowUrlInput(!showUrlInput)}
                      className="px-3 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 flex items-center gap-1.5 transition-colors"
                    >
                      <LinkIcon className="w-3.5 h-3.5 text-slate-400" />
                      <span>{showUrlInput ? 'Hide URL Input' : 'Add via Image URL'}</span>
                    </button>
                  </div>

                  {/* Optional URL Input Field */}
                  {showUrlInput && (
                    <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-950 border border-slate-800">
                      <input
                        type="url"
                        value={customUrlInput}
                        onChange={(e) => setCustomUrlInput(e.target.value)}
                        placeholder="Paste image URL (https://...)"
                        className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500"
                      />
                      <button
                        type="button"
                        onClick={handleAddPhotoUrl}
                        className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold"
                      >
                        Add URL
                      </button>
                    </div>
                  )}

                  {/* Uploaded Photos Preview Thumbnails Grid */}
                  {uploadedPhotos.length > 0 && (
                    <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>Click any photo to set it as the cover image.</span>
                        <span className="text-rose-400 font-semibold">{uploadedPhotos.length} Photos</span>
                      </div>

                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5 max-h-48 overflow-y-auto pr-1">
                        {uploadedPhotos.map((pUrl, idx) => (
                          <div
                            key={idx}
                            onClick={() => setCoverPhotoIndex(idx)}
                            className={`relative h-20 rounded-xl overflow-hidden cursor-pointer group border-2 transition-all ${
                              coverPhotoIndex === idx
                                ? 'border-rose-500 ring-2 ring-rose-500/30'
                                : 'border-slate-800 hover:border-slate-600'
                            }`}
                          >
                            <img src={pUrl} alt={`preview-${idx}`} className="w-full h-full object-cover" />

                            {coverPhotoIndex === idx && (
                              <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-rose-600 text-[9px] font-bold text-white shadow">
                                Cover
                              </span>
                            )}

                            {/* Delete thumbnail */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemovePhoto(idx);
                              }}
                              className="absolute top-1 right-1 p-1 rounded-full bg-slate-950/80 text-slate-300 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Remove photo"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}

                        {/* Quick Add More Tile */}
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className="h-20 rounded-xl border border-dashed border-slate-700 hover:border-rose-500 bg-slate-900/50 flex flex-col items-center justify-center text-slate-400 hover:text-rose-300 cursor-pointer transition-all"
                        >
                          <Plus className="w-5 h-5" />
                          <span className="text-[10px] font-semibold mt-0.5">Add More</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Preset photo suggestions */}
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 font-medium">Or pick sample travel shots:</span>
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                      {sampleInspirations.map((insp, i) => (
                        <img
                          key={i}
                          src={insp}
                          alt="sample"
                          onClick={() => {
                            setUploadedPhotos((prev) => [...prev, insp]);
                            showToast('Added sample photo to album!');
                          }}
                          className="w-12 h-12 rounded-lg object-cover border border-slate-800 hover:border-rose-400 cursor-pointer flex-shrink-0 transition-transform hover:scale-105"
                          title="Click to add to your photos"
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Story / Travel Notes */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Your Travel Story & Highlights</label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe what made this place special, the food, the vibe, golden hour tips, or hidden spots..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-all resize-none"
                  />
                </div>

                {/* Tags */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Tags (comma separated)</label>
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="Sunset, Chai, Heritage, Photography, HiddenGem"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-all"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-semibold text-xs shadow-lg shadow-rose-500/25 transition-all flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    <span>Save Travel Memory ({uploadedPhotos.length} Photos)</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* APPEND MORE PHOTOS MODAL (To Existing Memory) */}
      <AnimatePresence>
        {addPhotosModalMemory && (
          <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="max-w-lg w-full p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4 text-slate-100"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Camera className="w-5 h-5 text-rose-400" />
                  <h3 className="text-base font-bold text-white">
                    Add Photos to "{addPhotosModalMemory.title}"
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setAddPhotosModalMemory(null)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                <p className="text-xs text-slate-300">
                  This memory currently has{' '}
                  <strong className="text-rose-300">
                    {getMemoryPhotos(addPhotosModalMemory).length} photos
                  </strong>
                  . Upload additional photos to expand this album.
                </p>

                <input
                  type="file"
                  ref={extraFileInputRef}
                  multiple
                  accept="image/*"
                  onChange={handleExtraImageFiles}
                  className="hidden"
                />

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => extraFileInputRef.current?.click()}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Select Device Photos</span>
                  </button>

                  <div className="flex-1 flex items-center gap-1.5">
                    <input
                      type="url"
                      value={extraUrlInput}
                      onChange={(e) => setExtraUrlInput(e.target.value)}
                      placeholder="Or paste photo URL..."
                      className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddExtraUrl}
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-200"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Extra Photos Preview */}
                {extraPhotos.length > 0 && (
                  <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="text-[11px] text-rose-300 font-semibold">
                      {extraPhotos.length} New Photo{extraPhotos.length > 1 ? 's' : ''} Ready to Add:
                    </div>
                    <div className="grid grid-cols-4 gap-2 max-h-36 overflow-y-auto">
                      {extraPhotos.map((url, i) => (
                        <div key={i} className="relative h-16 rounded-lg overflow-hidden group">
                          <img src={url} alt="extra" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => handleRemoveExtraPhoto(i)}
                            className="absolute top-1 right-1 p-1 rounded-full bg-slate-950/80 text-white"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAddPhotosModalMemory(null)}
                  className="flex-1 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveExtraPhotos}
                  disabled={extraPhotos.length === 0}
                  className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Save {extraPhotos.length} Extra Photos</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FULLSCREEN PHOTO LIGHTBOX / ALBUM VIEWER */}
      <AnimatePresence>
        {lightboxMemory && (
          <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex flex-col justify-between p-4 sm:p-6">
            {/* Lightbox Top Bar */}
            <div className="flex items-center justify-between text-white z-10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-rose-600/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm sm:text-base text-white">{lightboxMemory.title}</h4>
                  <p className="text-xs text-slate-400 flex items-center gap-2">
                    <span>{lightboxMemory.city}</span>
                    <span>•</span>
                    <span>{lightboxMemory.date}</span>
                    <span>•</span>
                    <span className="text-rose-400">
                      Photo {lightboxIndex + 1} of {getMemoryPhotos(lightboxMemory).length}
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const photos = getMemoryPhotos(lightboxMemory);
                    handleDownloadPhoto(photos[lightboxIndex], lightboxMemory.title);
                  }}
                  className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors"
                  title="Download Photo"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAddPhotosModalMemory(lightboxMemory);
                    setExtraPhotos([]);
                  }}
                  className="px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Photos</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLightboxMemory(null)}
                  className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors"
                  title="Close (Esc)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Lightbox Center Image Stage */}
            <div className="relative flex-1 flex items-center justify-center my-4 overflow-hidden">
              {/* Previous Photo Arrow */}
              <button
                type="button"
                onClick={() => {
                  const photos = getMemoryPhotos(lightboxMemory);
                  setLightboxIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
                }}
                className="absolute left-2 sm:left-6 z-20 p-3 rounded-full bg-slate-900/80 hover:bg-rose-600 text-white backdrop-blur-md border border-white/10 transition-all hover:scale-110 shadow-2xl"
                title="Previous Photo (Left Arrow)"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              {/* Main Photo */}
              <div className="relative max-h-full max-w-5xl w-full h-full flex items-center justify-center p-2">
                <img
                  src={getMemoryPhotos(lightboxMemory)[lightboxIndex]}
                  alt={`${lightboxMemory.title} - photo ${lightboxIndex + 1}`}
                  className="max-h-[70vh] sm:max-h-[75vh] w-auto max-w-full object-contain rounded-2xl shadow-2xl border border-white/10"
                />
              </div>

              {/* Next Photo Arrow */}
              <button
                type="button"
                onClick={() => {
                  const photos = getMemoryPhotos(lightboxMemory);
                  setLightboxIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
                }}
                className="absolute right-2 sm:right-6 z-20 p-3 rounded-full bg-slate-900/80 hover:bg-rose-600 text-white backdrop-blur-md border border-white/10 transition-all hover:scale-110 shadow-2xl"
                title="Next Photo (Right Arrow)"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            {/* Lightbox Bottom Strip: Thumbnails & Story */}
            <div className="space-y-3 z-10">
              {/* Story Narrative */}
              {lightboxMemory.story && (
                <div className="max-w-3xl mx-auto px-4 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
                  <p className="text-xs text-slate-300 italic line-clamp-2">
                    "{lightboxMemory.story}"
                  </p>
                </div>
              )}

              {/* Thumbnail Filmstrip */}
              <div className="flex items-center justify-center gap-2 overflow-x-auto py-1 max-w-4xl mx-auto">
                {getMemoryPhotos(lightboxMemory).map((pUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setLightboxIndex(idx)}
                    className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${
                      lightboxIndex === idx
                        ? 'border-rose-500 scale-105 shadow-lg shadow-rose-500/30'
                        : 'border-slate-800 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={pUrl} alt={`thumb-${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Extracted Subcomponent for Memory Card
interface MemoryCardProps {
  memory: TravelMemory;
  photos: string[];
  coverImage: string;
  currentUser: User;
  onOpenLightbox: (photoIndex: number) => void;
  onAddExtraPhotos: () => void;
  onDelete: () => void;
  onShare: () => void;
}

const MemoryCard: React.FC<MemoryCardProps> = ({
  memory,
  photos,
  coverImage,
  currentUser,
  onOpenLightbox,
  onAddExtraPhotos,
  onDelete,
  onShare,
}) => {
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);

  return (
    <div className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-2xl flex flex-col justify-between group hover:border-rose-500/40 transition-all hover:shadow-rose-500/10">
      {/* Photo Stage / Carousel Header */}
      <div className="relative h-56 w-full overflow-hidden bg-slate-950">
        <img
          src={photos[activePhotoIdx] || coverImage}
          alt={memory.title}
          onClick={() => onOpenLightbox(activePhotoIdx)}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent pointer-events-none" />

        {/* Top Badges & Actions */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-[10px] font-bold text-rose-300 border border-rose-500/30 flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              <span>{memory.city}</span>
            </span>

            {/* Multi-Photo Count Badge */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenLightbox(0);
              }}
              className="px-2.5 py-1 rounded-full bg-rose-600/90 hover:bg-rose-500 backdrop-blur-md text-[10px] font-bold text-white shadow-lg flex items-center gap-1 transition-transform hover:scale-105"
            >
              <Camera className="w-3 h-3" />
              <span>{photos.length} Photo{photos.length > 1 ? 's' : ''}</span>
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onShare}
              className="p-1.5 rounded-full bg-slate-950/80 text-slate-300 hover:text-white transition-colors"
              title="Share / Copy"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={onDelete}
              className="p-1.5 rounded-full bg-slate-950/80 text-slate-400 hover:text-rose-400 transition-colors"
              title="Delete memory"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Card Photo Navigation Arrows (if multiple photos) */}
        {photos.length > 1 && (
          <div className="absolute inset-y-0 left-2 right-2 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActivePhotoIdx((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
              }}
              className="p-1.5 rounded-full bg-slate-950/80 hover:bg-rose-600 text-white pointer-events-auto transition-transform hover:scale-110 shadow-lg"
              title="Previous photo"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActivePhotoIdx((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
              }}
              className="p-1.5 rounded-full bg-slate-950/80 hover:bg-rose-600 text-white pointer-events-auto transition-transform hover:scale-110 shadow-lg"
              title="Next photo"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Bottom Card Bar: Rating & Date */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white">
          <div className="flex items-center gap-1 text-amber-400 font-bold bg-slate-950/80 px-2 py-0.5 rounded-lg border border-amber-500/20">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{memory.rating} / 5</span>
          </div>

          <div className="flex items-center gap-1.5">
            {photos.length > 1 && (
              <span className="text-[10px] text-slate-300 bg-slate-950/80 px-2 py-0.5 rounded-lg">
                {activePhotoIdx + 1}/{photos.length}
              </span>
            )}
            <span className="text-[10px] text-slate-300 bg-slate-950/80 px-2 py-0.5 rounded-lg">
              {memory.date}
            </span>
          </div>
        </div>
      </div>

      {/* Card Content & Narrative */}
      <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          <h3
            onClick={() => onOpenLightbox(0)}
            className="font-bold text-base text-white group-hover:text-rose-300 transition-colors cursor-pointer"
          >
            {memory.title}
          </h3>

          <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
            {memory.story}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {memory.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-[10px] text-rose-300/80 font-medium"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom Interactive Strip */}
        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={() => onOpenLightbox(0)}
            className="text-rose-400 hover:text-rose-300 font-semibold text-xs flex items-center gap-1.5 transition-colors"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>View {photos.length} Photos</span>
          </button>

          <button
            type="button"
            onClick={onAddExtraPhotos}
            className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-[11px] font-medium flex items-center gap-1 transition-colors"
          >
            <Plus className="w-3 h-3 text-rose-400" />
            <span>Add Photos</span>
          </button>
        </div>
      </div>
    </div>
  );
};
