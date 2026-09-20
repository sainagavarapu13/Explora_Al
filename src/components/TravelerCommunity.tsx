import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users,
  Heart,
  MessageCircle,
  Share2,
  Sparkles,
  MapPin,
  Plus,
  Star,
  Send,
  X,
  Camera,
  Upload,
  Link as LinkIcon,
  ChevronLeft,
  ChevronRight,
  Download,
  Check,
  CheckCircle2,
  Layers,
  Image as ImageIcon,
  Search,
  Filter
} from 'lucide-react';
import { CommunityPost, User, CityInfo } from '../types';
import { SAMPLE_COMMUNITY_POSTS } from '../data/travelData';

interface TravelerCommunityProps {
  currentUser: User;
  currentCity: CityInfo;
}

export const TravelerCommunity: React.FC<TravelerCommunityProps> = ({
  currentUser,
  currentCity,
}) => {
  const [posts, setPosts] = useState<CommunityPost[]>(SAMPLE_COMMUNITY_POSTS);
  const [newPostModalOpen, setNewPostModalOpen] = useState(false);
  const [addPhotosModalPost, setAddPhotosModalPost] = useState<CommunityPost | null>(null);
  const [lightboxPost, setLightboxPost] = useState<CommunityPost | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Active carousel slide index per post in feed
  const [postSlideIndices, setPostSlideIndices] = useState<Record<string, number>>({});

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCityFilter, setSelectedCityFilter] = useState('All');

  // Form States for New Story
  const [postTitle, setPostTitle] = useState('');
  const [postCity, setPostCity] = useState(currentCity.name);
  const [postStory, setPostStory] = useState('');
  const [postRating, setPostRating] = useState(5);
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([
    'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80'
  ]);
  const [coverPhotoIndex, setCoverPhotoIndex] = useState(0);
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);

  // States for Adding Extra Photos to Existing Story
  const [extraPhotos, setExtraPhotos] = useState<string[]>([]);
  const [extraUrlInput, setExtraUrlInput] = useState('');

  // Comment input per post
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  // Toast message
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const extraFileInputRef = useRef<HTMLInputElement>(null);

  // Sync city with active selection
  useEffect(() => {
    setPostCity(currentCity.name);
  }, [currentCity]);

  // Keyboard navigation for Lightbox
  useEffect(() => {
    if (!lightboxPost) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const photos = getPostPhotos(lightboxPost);
      if (e.key === 'Escape') {
        setLightboxPost(null);
      } else if (e.key === 'ArrowLeft') {
        setLightboxIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
      } else if (e.key === 'ArrowRight') {
        setLightboxIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxPost]);

  // Helper to extract all photos from a community story
  const getPostPhotos = (post: CommunityPost): string[] => {
    if (post.images && post.images.length > 0) {
      return post.images;
    }
    return post.image ? [post.image] : ['https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80'];
  };

  // Handle uploading multiple images from device (Unlimited)
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
          showToast(`Added ${fileCount} photo${fileCount > 1 ? 's' : ''} to your story!`);
        }
      };
      reader.readAsDataURL(file);
    }

    e.target.value = '';
  };

  // Handle uploading multiple extra images for an existing post
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
    showToast('Photo URL added to story!');
  };

  // Add extra photo URL to existing story
  const handleAddExtraUrl = () => {
    if (!extraUrlInput.trim()) return;
    setExtraPhotos((prev) => [...prev, extraUrlInput.trim()]);
    setExtraUrlInput('');
  };

  // Remove photo from pending new story
  const handleRemovePhoto = (index: number) => {
    setUploadedPhotos((prev) => {
      const filtered = prev.filter((_, i) => i !== index);
      if (coverPhotoIndex >= filtered.length) {
        setCoverPhotoIndex(Math.max(0, filtered.length - 1));
      }
      return filtered;
    });
  };

  // Quick preset photos for quick inspiration
  const sampleInspirations = [
    'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1603288967341-a67554988771?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1514890547357-a9ee288728e0?auto=format&fit=crop&w=1200&q=80'
  ];

  const handleLikePost = (postId: string) => {
    setPosts(
      posts.map((p) => {
        if (p.id === postId) {
          return {
            ...p,
            hasLiked: !p.hasLiked,
            likesCount: p.hasLiked ? p.likesCount - 1 : p.likesCount + 1,
          };
        }
        return p;
      })
    );
  };

  const handleAddComment = (postId: string) => {
    const text = commentInputs[postId];
    if (!text?.trim()) return;

    setPosts(
      posts.map((p) => {
        if (p.id === postId) {
          return {
            ...p,
            comments: [
              ...p.comments,
              {
                id: `c-${Date.now()}`,
                userName: currentUser.name,
                userAvatar: currentUser.avatar,
                text: text.trim(),
                timestamp: 'Just now',
              },
            ],
          };
        }
        return p;
      })
    );

    setCommentInputs({ ...commentInputs, [postId]: '' });
    showToast('Comment posted!');
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle.trim()) return;

    const allPhotos =
      uploadedPhotos.length > 0
        ? uploadedPhotos
        : ['https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80'];

    const coverPhoto = allPhotos[coverPhotoIndex] || allPhotos[0];

    const newPost: CommunityPost = {
      id: `post-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      userHome: currentUser.homeCountry,
      city: postCity.trim() || currentCity.name,
      title: postTitle.trim(),
      content: postStory.trim() || 'A wonderful travel experience shared with the community.',
      image: coverPhoto,
      images: allPhotos,
      rating: postRating,
      timestamp: 'Just now',
      likesCount: 1,
      hasLiked: true,
      comments: [],
    };

    setPosts([newPost, ...posts]);
    setNewPostModalOpen(false);
    showToast(`Published travel story with ${allPhotos.length} photo${allPhotos.length > 1 ? 's' : ''}!`);

    // Reset Form
    setPostTitle('');
    setPostStory('');
    setUploadedPhotos([
      'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80'
    ]);
    setCoverPhotoIndex(0);
  };

  // Append extra photos to existing post
  const handleSaveExtraPhotos = () => {
    if (!addPhotosModalPost || extraPhotos.length === 0) {
      setAddPhotosModalPost(null);
      return;
    }

    const currentPhotos = getPostPhotos(addPhotosModalPost);
    const updatedPhotos = [...currentPhotos, ...extraPhotos];

    setPosts(
      posts.map((p) => {
        if (p.id === addPhotosModalPost.id) {
          return {
            ...p,
            images: updatedPhotos,
            image: p.image || updatedPhotos[0],
          };
        }
        return p;
      })
    );

    if (lightboxPost?.id === addPhotosModalPost.id) {
      setLightboxPost({
        ...addPhotosModalPost,
        images: updatedPhotos,
      });
    }

    showToast(`Added ${extraPhotos.length} photos to "${addPhotosModalPost.title}"!`);
    setAddPhotosModalPost(null);
    setExtraPhotos([]);
  };

  const handleShareStory = (post: CommunityPost) => {
    const text = `📖 Travel Story: "${post.title}" by ${post.userName} in ${post.city}\n${post.content}`;
    navigator.clipboard.writeText(text);
    showToast('Story details copied to clipboard!');
  };

  // Download photo
  const handleDownloadPhoto = (photoUrl: string, titleStr: string) => {
    const a = document.createElement('a');
    a.href = photoUrl;
    a.download = `${titleStr.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_story_photo.jpg`;
    a.target = '_blank';
    a.click();
    showToast('Photo download triggered!');
  };

  // Cities filter list
  const allCities = Array.from(new Set(['All', ...posts.map((p) => p.city), currentCity.name]));

  // Filtered stories
  const filteredPosts = posts.filter((post) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      post.title.toLowerCase().includes(query) ||
      post.content.toLowerCase().includes(query) ||
      post.city.toLowerCase().includes(query) ||
      post.userName.toLowerCase().includes(query);

    const matchesCity =
      selectedCityFilter === 'All' || post.city.toLowerCase() === selectedCityFilter.toLowerCase();

    return matchesSearch && matchesCity;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-6 z-50 px-4 py-3 rounded-2xl bg-slate-900/95 backdrop-blur-md text-white text-xs font-semibold shadow-2xl border border-blue-500/40 flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Info & Hero Action */}
      <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
                <Users className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold text-white font-heading">
                    Experiences & travel stories Feed
                  </h2>
                  <span className="px-2.5 py-0.5 text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-full uppercase tracking-wider">
                    Photo Stories
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-400">
                  Share travel narratives, upload multiple high-res photos, and discover insider recommendations from real explorers worldwide.
                </p>
              </div>
            </div>

            {/* Stats bar */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="px-3 py-1 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 font-medium">
                📖 {posts.length} Stories Published
              </span>
              <span className="px-3 py-1 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 font-medium">
                📸 {posts.reduce((acc, p) => acc + getPostPhotos(p).length, 0)} Photos in Feed
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setNewPostModalOpen(true)}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-semibold flex items-center gap-2.5 shadow-xl shadow-blue-500/25 transition-all hover:scale-[1.02] active:scale-95"
          >
            <Camera className="w-4 h-4" />
            <span>Share Story & Upload Photos</span>
          </button>
        </div>
      </div>

      {/* Search & City Filter Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search stories by title, city, tips, author, or experience..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all"
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
        </div>

        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-800/80">
          <span className="text-[11px] font-semibold text-slate-400 mr-1 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-blue-400" /> Filter by City:
          </span>
          {allCities.map((cName) => (
            <button
              key={cName}
              type="button"
              onClick={() => setSelectedCityFilter(cName)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                selectedCityFilter.toLowerCase() === cName.toLowerCase()
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {cName}
            </button>
          ))}
        </div>
      </div>

      {/* Stories Feed */}
      <div className="space-y-6">
        {filteredPosts.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="w-16 h-16 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto">
              <Camera className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">No Travel Stories Found</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                No stories match your current filters. Be the first to share an experience and photo gallery for this destination!
              </p>
            </div>
            <button
              type="button"
              onClick={() => setNewPostModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold inline-flex items-center gap-2 shadow-lg shadow-blue-500/25 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Share a Travel Story with Photos</span>
            </button>
          </div>
        ) : (
          filteredPosts.map((post) => {
            const photos = getPostPhotos(post);
            const activeIndex = postSlideIndices[post.id] || 0;
            const currentPhoto = photos[activeIndex] || photos[0];

            return (
              <div
                key={post.id}
                className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4 hover:border-slate-700 transition-colors"
              >
                {/* Author Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={post.userAvatar}
                      alt={post.userName}
                      className="w-10 h-10 rounded-full object-cover border-2 border-indigo-500/80 shadow-md"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-white">{post.userName}</h4>
                        <span className="text-[10px] text-slate-400">from {post.userHome}</span>
                      </div>
                      <p className="text-[11px] text-indigo-400 flex items-center gap-1 font-medium">
                        <MapPin className="w-3 h-3" />
                        <span>Explored {post.city}</span>
                        <span className="text-slate-500">• {post.timestamp}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-amber-400 bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-800 text-xs font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span>{post.rating} / 5</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleShareStory(post)}
                      className="p-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
                      title="Share Story"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Story Title & Content */}
                <div className="space-y-1.5">
                  <h3 className="font-bold text-base text-slate-100">{post.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                    {post.content}
                  </p>
                </div>

                {/* PHOTOS GALLERY & CAROUSEL */}
                {photos.length > 0 && (
                  <div className="space-y-2">
                    <div className="relative rounded-2xl overflow-hidden border border-slate-800 max-h-96 bg-slate-950 group">
                      {/* Main Active Image */}
                      <img
                        src={currentPhoto}
                        alt={`${post.title} photo`}
                        onClick={() => {
                          setLightboxPost(post);
                          setLightboxIndex(activeIndex);
                        }}
                        className="w-full h-80 sm:h-96 object-cover cursor-pointer transition-transform duration-300 group-hover:scale-[1.01]"
                      />

                      {/* Photo Counter Pill */}
                      <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-white/10 text-white text-[11px] font-semibold flex items-center gap-1.5 shadow-lg">
                        <Camera className="w-3.5 h-3.5 text-blue-400" />
                        <span>
                          {activeIndex + 1} / {photos.length} Photo{photos.length > 1 ? 's' : ''}
                        </span>
                      </div>

                      {/* Fullscreen Expand Button */}
                      <button
                        type="button"
                        onClick={() => {
                          setLightboxPost(post);
                          setLightboxIndex(activeIndex);
                        }}
                        className="absolute top-3 right-3 p-2 rounded-xl bg-slate-950/80 backdrop-blur-md hover:bg-blue-600 text-white border border-white/10 opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                        title="View Fullscreen Photo Album"
                      >
                        <Layers className="w-4 h-4" />
                      </button>

                      {/* Carousel Navigation Arrows if multiple photos */}
                      {photos.length > 1 && (
                        <>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPostSlideIndices({
                                ...postSlideIndices,
                                [post.id]: activeIndex > 0 ? activeIndex - 1 : photos.length - 1,
                              });
                            }}
                            className="absolute left-2.5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-950/80 hover:bg-blue-600 text-white backdrop-blur-md border border-white/10 opacity-0 group-hover:opacity-100 transition-all shadow-xl"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPostSlideIndices({
                                ...postSlideIndices,
                                [post.id]: activeIndex < photos.length - 1 ? activeIndex + 1 : 0,
                              });
                            }}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-950/80 hover:bg-blue-600 text-white backdrop-blur-md border border-white/10 opacity-0 group-hover:opacity-100 transition-all shadow-xl"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>

                    {/* Thumbnail Filmstrip & Add Extra Photos Button */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                        {photos.map((pUrl, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() =>
                              setPostSlideIndices({
                                ...postSlideIndices,
                                [post.id]: idx,
                              })
                            }
                            className={`relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${
                              activeIndex === idx
                                ? 'border-blue-500 scale-105 shadow-md shadow-blue-500/30'
                                : 'border-slate-800 opacity-60 hover:opacity-100'
                            }`}
                          >
                            <img src={pUrl} alt={`thumb-${idx}`} className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setAddPhotosModalPost(post);
                          setExtraPhotos([]);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1.5 transition-colors flex-shrink-0"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Add Photos</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Interactions Bar */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => handleLikePost(post.id)}
                      className={`flex items-center gap-1.5 transition-colors ${
                        post.hasLiked ? 'text-rose-400 font-semibold' : 'hover:text-rose-400'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${post.hasLiked ? 'fill-rose-400' : ''}`} />
                      <span>{post.likesCount} Helpful</span>
                    </button>

                    <div className="flex items-center gap-1.5 text-slate-400">
                      <MessageCircle className="w-4 h-4" />
                      <span>{post.comments?.length || 0} Comments</span>
                    </div>
                  </div>

                  <span className="text-[11px] text-slate-500">
                    {photos.length} Photo{photos.length > 1 ? 's' : ''} uploaded
                  </span>
                </div>

                {/* Comments List & Add Comment */}
                <div className="pt-2 space-y-2">
                  {post.comments && post.comments.length > 0 && (
                    <div className="space-y-1.5 p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80 text-xs">
                      {post.comments.map((comm) => (
                        <div key={comm.id} className="flex items-start gap-2 text-slate-300">
                          <img
                            src={comm.userAvatar}
                            alt={comm.userName}
                            className="w-5 h-5 rounded-full object-cover mt-0.5 border border-slate-700"
                          />
                          <div>
                            <span className="font-bold text-white text-[11px] mr-1.5">{comm.userName}:</span>
                            <span className="text-[11px] text-slate-300">{comm.text}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Comment Input */}
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={commentInputs[post.id] || ''}
                      onChange={(e) =>
                        setCommentInputs({ ...commentInputs, [post.id]: e.target.value })
                      }
                      placeholder="Leave a comment or ask for advice..."
                      className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddComment(post.id)}
                      className="p-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-colors shadow-md shadow-blue-500/20"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* SHARE TRAVEL STORY MODAL (With Multi-Photo Upload) */}
      <AnimatePresence>
        {newPostModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="max-w-2xl w-full my-8 p-6 sm:p-7 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-5 text-slate-100 max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white">
                    <Camera className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white font-heading">
                      Share Travel Story with Photos
                    </h3>
                    <p className="text-xs text-slate-400">
                      Upload photos and share your travel advice with fellow explorers.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setNewPostModalOpen(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreatePost} className="space-y-4">
                {/* Title */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Story Title *</label>
                  <input
                    type="text"
                    required
                    value={postTitle}
                    onChange={(e) => setPostTitle(e.target.value)}
                    placeholder="e.g. Hidden stepwell you MUST visit before tourist crowds wake up"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* City & Rating */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Destination City / Place</label>
                    <input
                      type="text"
                      required
                      value={postCity}
                      onChange={(e) => setPostCity(e.target.value)}
                      placeholder="e.g. Jaipur, Paris, Venice"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Overall Rating</label>
                    <select
                      value={postRating}
                      onChange={(e) => setPostRating(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-blue-500 cursor-pointer"
                    >
                      <option value={5}>⭐⭐⭐⭐⭐ (5 - Must Visit / Unforgettable)</option>
                      <option value={4}>⭐⭐⭐⭐ (4 - Highly Recommended)</option>
                      <option value={3}>⭐⭐⭐ (3 - Decent Experience)</option>
                      <option value={2}>⭐⭐ (2 - Average)</option>
                    </select>
                  </div>
                </div>

                {/* PHOTO UPLOAD ZONE (Multi-Photo / Unlimited) */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5 text-blue-400" />
                      <span>Upload Photos ({uploadedPhotos.length} Selected)</span>
                    </label>
                    <span className="text-[11px] text-blue-300 font-medium">
                      Multi-select supported
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
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600/20 to-indigo-600/20 hover:from-blue-600/30 hover:to-indigo-600/30 border border-blue-500/40 text-xs text-blue-300 font-semibold flex items-center gap-2 transition-all hover:scale-[1.02]"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Upload Device Photos (Multi-Select)</span>
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

                  {/* Optional URL Input */}
                  {showUrlInput && (
                    <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-950 border border-slate-800">
                      <input
                        type="url"
                        value={customUrlInput}
                        onChange={(e) => setCustomUrlInput(e.target.value)}
                        placeholder="Paste image URL (https://...)"
                        className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={handleAddPhotoUrl}
                        className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
                      >
                        Add URL
                      </button>
                    </div>
                  )}

                  {/* Uploaded Photos Preview Thumbnails */}
                  {uploadedPhotos.length > 0 && (
                    <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>Click any photo to make it the story cover image.</span>
                        <span className="text-blue-400 font-semibold">{uploadedPhotos.length} Photos</span>
                      </div>

                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5 max-h-48 overflow-y-auto pr-1">
                        {uploadedPhotos.map((pUrl, idx) => (
                          <div
                            key={idx}
                            onClick={() => setCoverPhotoIndex(idx)}
                            className={`relative h-20 rounded-xl overflow-hidden cursor-pointer group border-2 transition-all ${
                              coverPhotoIndex === idx
                                ? 'border-blue-500 ring-2 ring-blue-500/30'
                                : 'border-slate-800 hover:border-slate-600'
                            }`}
                          >
                            <img src={pUrl} alt={`preview-${idx}`} className="w-full h-full object-cover" />

                            {coverPhotoIndex === idx && (
                              <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-blue-600 text-[9px] font-bold text-white shadow">
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
                          className="h-20 rounded-xl border border-dashed border-slate-700 hover:border-blue-500 bg-slate-900/50 flex flex-col items-center justify-center text-slate-400 hover:text-blue-300 cursor-pointer transition-all"
                        >
                          <Plus className="w-5 h-5" />
                          <span className="text-[10px] font-semibold mt-0.5">Add More</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Sample suggestions */}
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
                            showToast('Added sample photo to story!');
                          }}
                          className="w-12 h-12 rounded-lg object-cover border border-slate-800 hover:border-blue-400 cursor-pointer flex-shrink-0 transition-transform hover:scale-105"
                          title="Click to add photo to story"
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Experience Story Content */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Your Experience Story & Tips *</label>
                  <textarea
                    rows={4}
                    required
                    value={postStory}
                    onChange={(e) => setPostStory(e.target.value)}
                    placeholder="Share your tips, recommended visiting hours, local food spots, scenic viewpoints, or budget hacks..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
                  />
                </div>

                {/* Buttons */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setNewPostModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    <span>Publish Story ({uploadedPhotos.length} Photos)</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* APPEND MORE PHOTOS MODAL (To Existing Story) */}
      <AnimatePresence>
        {addPhotosModalPost && (
          <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="max-w-lg w-full p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4 text-slate-100"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Camera className="w-5 h-5 text-blue-400" />
                  <h3 className="text-base font-bold text-white">
                    Add Photos to "{addPhotosModalPost.title}"
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setAddPhotosModalPost(null)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                <p className="text-xs text-slate-300">
                  This story currently has{' '}
                  <strong className="text-blue-300">
                    {getPostPhotos(addPhotosModalPost).length} photos
                  </strong>
                  . Upload additional photos from your device or image URLs.
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
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-2"
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
                      className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
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
                    <div className="text-[11px] text-blue-300 font-semibold">
                      {extraPhotos.length} New Photo{extraPhotos.length > 1 ? 's' : ''} Ready to Add:
                    </div>
                    <div className="grid grid-cols-4 gap-2 max-h-36 overflow-y-auto">
                      {extraPhotos.map((url, i) => (
                        <div key={i} className="relative h-16 rounded-lg overflow-hidden group">
                          <img src={url} alt="extra" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setExtraPhotos(extraPhotos.filter((_, idx) => idx !== i))}
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
                  onClick={() => setAddPhotosModalPost(null)}
                  className="flex-1 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveExtraPhotos}
                  disabled={extraPhotos.length === 0}
                  className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Save {extraPhotos.length} Extra Photos</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FULLSCREEN PHOTO LIGHTBOX VIEWER FOR STORIES */}
      <AnimatePresence>
        {lightboxPost && (
          <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex flex-col justify-between p-4 sm:p-6">
            {/* Top Bar */}
            <div className="flex items-center justify-between text-white z-10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm sm:text-base text-white">{lightboxPost.title}</h4>
                  <p className="text-xs text-slate-400 flex items-center gap-2">
                    <span>by {lightboxPost.userName}</span>
                    <span>•</span>
                    <span>{lightboxPost.city}</span>
                    <span>•</span>
                    <span className="text-blue-400">
                      Photo {lightboxIndex + 1} of {getPostPhotos(lightboxPost).length}
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const photos = getPostPhotos(lightboxPost);
                    handleDownloadPhoto(photos[lightboxIndex], lightboxPost.title);
                  }}
                  className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors"
                  title="Download Photo"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAddPhotosModalPost(lightboxPost);
                    setExtraPhotos([]);
                  }}
                  className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Photos</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLightboxPost(null)}
                  className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors"
                  title="Close (Esc)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Center Stage */}
            <div className="relative flex-1 flex items-center justify-center my-4 overflow-hidden">
              <button
                type="button"
                onClick={() => {
                  const photos = getPostPhotos(lightboxPost);
                  setLightboxIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
                }}
                className="absolute left-2 sm:left-6 z-20 p-3 rounded-full bg-slate-900/80 hover:bg-blue-600 text-white backdrop-blur-md border border-white/10 transition-all hover:scale-110 shadow-2xl"
                title="Previous Photo (Left Arrow)"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <div className="relative max-h-full max-w-5xl w-full h-full flex items-center justify-center p-2">
                <img
                  src={getPostPhotos(lightboxPost)[lightboxIndex]}
                  alt={`${lightboxPost.title} - photo ${lightboxIndex + 1}`}
                  className="max-h-[70vh] sm:max-h-[75vh] w-auto max-w-full object-contain rounded-2xl shadow-2xl border border-white/10"
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  const photos = getPostPhotos(lightboxPost);
                  setLightboxIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
                }}
                className="absolute right-2 sm:right-6 z-20 p-3 rounded-full bg-slate-900/80 hover:bg-blue-600 text-white backdrop-blur-md border border-white/10 transition-all hover:scale-110 shadow-2xl"
                title="Next Photo (Right Arrow)"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            {/* Bottom Filmstrip & Story Summary */}
            <div className="space-y-3 z-10">
              {lightboxPost.content && (
                <div className="max-w-3xl mx-auto px-4 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
                  <p className="text-xs text-slate-300 italic line-clamp-2">
                    "{lightboxPost.content}"
                  </p>
                </div>
              )}

              <div className="flex items-center justify-center gap-2 overflow-x-auto py-1 max-w-4xl mx-auto">
                {getPostPhotos(lightboxPost).map((pUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setLightboxIndex(idx)}
                    className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${
                      lightboxIndex === idx
                        ? 'border-blue-500 scale-105 shadow-lg shadow-blue-500/30'
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
