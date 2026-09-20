import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, Upload, Sparkles, Volume2, VolumeX, MapPin, Clock, Tag, Compass, CheckCircle, Info, RefreshCw, Layers, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { LandmarkAnalysis, CityInfo, User } from '../types';

interface CameraLandmarkScannerProps {
  currentCity: CityInfo;
  currentUser: User;
  onSaveToMemories?: (landmarkName: string, city: string, image: string, description: string) => void;
  onAddToWishlist?: (title: string, category: string, image: string) => void;
}

export const CameraLandmarkScanner: React.FC<CameraLandmarkScannerProps> = ({
  currentCity,
  currentUser,
  onSaveToMemories,
  onAddToWishlist,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [analysis, setAnalysis] = useState<LandmarkAnalysis | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isSpeakingAudio, setIsSpeakingAudio] = useState(false);
  const [savedStatus, setSavedStatus] = useState(false);
  const [uploadWarning, setUploadWarning] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Camera stream handler
  const startCamera = async () => {
    try {
      setUploadWarning(null);
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.warn('Camera access error:', err);
      alert('Unable to access camera. Please upload an image file using the Upload Photo button.');
      setIsCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setSelectedImage(dataUrl);
        setUploadWarning(null);
        stopCamera();
        runLandmarkRecognition(dataUrl);
      }
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadWarning(null);
    const reader = new FileReader();
    reader.onload = () => {
      const imgData = reader.result as string;
      setSelectedImage(imgData);
      runLandmarkRecognition(imgData);
    };
    reader.readAsDataURL(file);
  };

  const handleRecognizeClick = () => {
    if (!selectedImage) {
      setUploadWarning('Please upload or snap a landmark photo first before recognizing.');
      fileInputRef.current?.click();
      return;
    }
    setUploadWarning(null);
    runLandmarkRecognition(selectedImage);
  };

  const runLandmarkRecognition = async (imgData: string) => {
    if (!imgData) {
      setUploadWarning('Please upload or snap a photo of the landmark.');
      return;
    }

    setUploadWarning(null);
    setIsScanning(true);
    setAnalysis(null);
    setSavedStatus(false);

    try {
      const res = await fetch('/api/ai/landmark-recognize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: imgData,
          cityContext: currentCity.name,
        }),
      });

      const data = await res.json();
      setAnalysis(data);
    } catch (err: any) {
      console.error('Scan error:', err);
    } finally {
      setIsScanning(false);
    }
  };

  const handleAudioGuide = () => {
    if (!('speechSynthesis' in window) || !analysis?.audioGuideScript) return;

    if (isSpeakingAudio) {
      window.speechSynthesis.cancel();
      setIsSpeakingAudio(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(analysis.audioGuideScript);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.onstart = () => setIsSpeakingAudio(true);
    utterance.onend = () => setIsSpeakingAudio(false);
    utterance.onerror = () => setIsSpeakingAudio(false);

    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-md space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-600 flex items-center justify-center text-white shadow-md shadow-pink-200">
              <Camera className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-800 font-heading">Camera Landmark Recognition</h2>
                <span className="px-2.5 py-0.5 text-[10px] font-bold bg-pink-50 text-pink-700 border border-pink-200 rounded-full">
                  GEMINI VISION 2.0
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Snap or upload any tourist monument to identify history, timings, ticket prices & nearby recommendations.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isCameraActive ? (
              <button
                type="button"
                onClick={startCamera}
                className="px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-pink-200 transition-all hover:scale-105"
              >
                <Camera className="w-4 h-4" />
                <span>Open Live Camera</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={stopCamera}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all"
              >
                <span>Close Camera</span>
              </button>
            )}

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
              className="px-4 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-2 transition-colors shadow-sm"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Photo</span>
            </button>
          </div>
        </div>

        {/* Warning Banner if user tries to recognize without uploading */}
        <AnimatePresence>
          {uploadWarning && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="pt-2"
            >
              <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl flex items-center justify-between gap-3 text-xs shadow-sm">
                <div className="flex items-center gap-2 font-medium">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{uploadWarning}</span>
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-[11px] shrink-0 transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Now</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main Scanner Stage & Results Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Live Stream / Image Preview Stage with Laser Scan */}
        <div className="lg:col-span-5 space-y-4">
          <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-200 aspect-[4/3] shadow-lg flex items-center justify-center group">
            
            {/* Live Camera View */}
            {isCameraActive ? (
              <div className="relative w-full h-full">
                <video
                  ref={videoRef}
                  playsInline
                  autoPlay
                  muted
                  className="w-full h-full object-cover"
                />
                <canvas ref={canvasRef} className="hidden" />

                {/* Shutter Button Overlay */}
                <div className="absolute bottom-4 inset-x-0 flex justify-center z-20">
                  <button
                    type="button"
                    onClick={capturePhoto}
                    className="w-14 h-14 rounded-full bg-white text-slate-900 font-bold flex items-center justify-center shadow-2xl ring-4 ring-pink-500/50 hover:scale-105 active:scale-95 transition-all"
                  >
                    <Camera className="w-6 h-6 text-pink-600" />
                  </button>
                </div>
              </div>
            ) : selectedImage ? (
              <img
                src={selectedImage}
                alt="Selected Landmark"
                className="w-full h-full object-cover"
              />
            ) : (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="text-center p-6 space-y-2 cursor-pointer hover:opacity-80 transition-opacity"
              >
                <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto text-pink-400 border border-slate-700">
                  <Upload className="w-6 h-6" />
                </div>
                <p className="text-xs font-semibold text-slate-200">No Photo Uploaded Yet</p>
                <p className="text-[11px] text-slate-400">Click to upload a photo of any tourist place</p>
              </div>
            )}

            {/* Futuristic Scanning Overlay Laser Line */}
            {isScanning && (
              <div className="absolute inset-0 bg-indigo-950/40 pointer-events-none flex flex-col justify-between p-4">
                <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-pink-400 to-transparent shadow-[0_0_15px_#f43f5e] animate-scan-laser" />
                <div className="flex items-center justify-between text-xs font-mono text-pink-200 bg-slate-900/90 px-3 py-1 rounded-full border border-pink-500/30 w-fit">
                  <Sparkles className="w-3.5 h-3.5 animate-spin text-pink-300" />
                  <span>AI VISION SCANNING IN PROGRESS...</span>
                </div>
              </div>
            )}

            {/* Camera Viewfinder Corners */}
            <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-pink-400 rounded-tl pointer-events-none" />
            <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-pink-400 rounded-tr pointer-events-none" />
            <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-pink-400 rounded-bl pointer-events-none" />
            <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-pink-400 rounded-br pointer-events-none" />
          </div>

          {/* Action Trigger Button */}
          {!isCameraActive && (
            <button
              type="button"
              disabled={isScanning}
              onClick={handleRecognizeClick}
              className="w-full py-3.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 transition-all hover:scale-[1.01] disabled:opacity-50"
            >
              {isScanning ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Analyzing Visual Features...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{selectedImage ? 'Identify & Analyze Landmark With AI' : 'Recognize Landmark (Upload Photo Required)'}</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Right Column: AI Analysis & Intelligence Results */}
        <div className="lg:col-span-7 space-y-4">
          <AnimatePresence mode="wait">
            {analysis ? (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-4"
              >
                {/* Identified Landmark Card */}
                <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-xl space-y-4 relative overflow-hidden">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 text-emerald-600" />
                          <span>{analysis.confidence || 95}% MATCH CONFIDENCE</span>
                        </span>
                        <span className="px-2.5 py-0.5 text-[10px] font-semibold bg-slate-100 text-slate-700 rounded-full">
                          {analysis.category}
                        </span>
                      </div>

                      <h3 className="text-2xl font-black text-slate-800 font-heading mt-2">
                        {analysis.name}
                      </h3>
                      <p className="text-xs text-pink-600 font-semibold flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{analysis.city}, {analysis.country}</span>
                        {analysis.historicalPeriod && <span className="text-slate-400">• {analysis.historicalPeriod}</span>}
                      </p>
                    </div>

                    {/* Audio Guide Reader */}
                    <button
                      type="button"
                      onClick={handleAudioGuide}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
                        isSpeakingAudio
                          ? 'bg-rose-600 text-white animate-pulse'
                          : 'bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white border border-indigo-100'
                      }`}
                    >
                      {isSpeakingAudio ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                      <span>{isSpeakingAudio ? 'Pause Audio Guide' : 'Play Audio Guide'}</span>
                    </button>
                  </div>

                  {/* Short Overview */}
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                    {analysis.shortOverview}
                  </p>

                  {/* Highlights & Architecture */}
                  {analysis.keyFacts && analysis.keyFacts.length > 0 && (
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                      <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Info className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Architectural & Historical Facts:</span>
                      </p>
                      <ul className="space-y-1.5 text-xs text-slate-600">
                        {analysis.keyFacts.map((fact, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-pink-500 font-bold">•</span>
                            <span>{fact}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Timings, Best Time & Ticket Cost Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                      <p className="text-[10px] text-slate-500 font-semibold uppercase">Ticket Price</p>
                      <p className="text-xs font-bold text-emerald-700">{analysis.ticketPrice || 'Standard entry'}</p>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                      <p className="text-[10px] text-slate-500 font-semibold uppercase">Best Time to Visit</p>
                      <p className="text-xs font-bold text-amber-700">{analysis.bestTimeToVisit || 'Morning / Sunset'}</p>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                      <p className="text-[10px] text-slate-500 font-semibold uppercase">Opening Hours</p>
                      <p className="text-xs font-bold text-indigo-700">{analysis.timings?.[0] || 'Open Daily'}</p>
                    </div>
                  </div>

                  {/* Pro Tips */}
                  {analysis.proTips && analysis.proTips.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-xs font-bold text-amber-700 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>Insider Travel Hacks & Photo Angles:</span>
                      </p>
                      <div className="space-y-1">
                        {analysis.proTips.map((tip, idx) => (
                          <p key={idx} className="text-xs text-slate-600 flex items-start gap-2">
                            <span className="text-amber-500 font-bold">✓</span>
                            <span>{tip}</span>
                          </p>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons: Save to Memories / Wishlist */}
                  <div className="pt-3 border-t border-slate-100 flex flex-wrap gap-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        if (onSaveToMemories && selectedImage) {
                          onSaveToMemories(analysis.name, analysis.city, selectedImage, analysis.shortOverview);
                          setSavedStatus(true);
                        }
                      }}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-pink-200 transition-all"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>{savedStatus ? 'Saved to Trip Memories!' : 'Save Photo as Trip Memory'}</span>
                    </button>

                    {onAddToWishlist && (
                      <button
                        type="button"
                        onClick={() => {
                          onAddToWishlist(analysis.name, analysis.category, selectedImage || '');
                          alert(`Added ${analysis.name} to your Wishlist!`);
                        }}
                        className="py-2.5 px-4 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-2 transition-colors"
                      >
                        <Compass className="w-4 h-4 text-indigo-600" />
                        <span>Add to Wishlist</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Nearby Places Curated by AI */}
                {analysis.nearbyRecommendations && analysis.nearbyRecommendations.length > 0 && (
                  <div className="p-5 rounded-3xl bg-white border border-slate-100 shadow-md space-y-3">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-pink-600" />
                      <span>Nearby Recommendations from this Landmark:</span>
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {analysis.nearbyRecommendations.map((rec, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1 hover:border-pink-200 transition-colors shadow-sm"
                        >
                          <div className="flex items-center justify-between">
                            <h5 className="font-bold text-xs text-slate-800">{rec.name}</h5>
                            <span className="text-[10px] text-pink-600 font-bold">{rec.distance}</span>
                          </div>
                          <p className="text-[10px] text-slate-500">{rec.type} • {rec.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="p-10 rounded-3xl bg-white border border-slate-100 text-center space-y-3 flex flex-col items-center justify-center min-h-[350px] shadow-sm">
                <div className="w-14 h-14 rounded-2xl bg-pink-50 text-pink-600 flex items-center justify-center border border-pink-100 shadow-sm">
                  <Sparkles className="w-7 h-7" />
                </div>
                <h3 className="text-base font-bold text-slate-800">Ready to Scan Landmark</h3>
                <p className="text-xs text-slate-500 max-w-md">
                  Select any photo or capture live with your camera. ExploraAI’s vision engine will identify the historical structure and generate local tips.
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
};
