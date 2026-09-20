import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Image, Mic, MicOff, Volume2, VolumeX, Sparkles, Bot, User as UserIcon, Trash2, MapPin, Plus, Paperclip, X, AlertCircle } from 'lucide-react';
import { ChatMessage, CityInfo, User } from '../types';

interface AiChatbotVoiceProps {
  currentCity: CityInfo;
  currentUser: User;
  onAddPlaceToWishlist?: (title: string, category: string) => void;
}

export const AiChatbotVoice: React.FC<AiChatbotVoiceProps> = ({
  currentCity,
  currentUser,
  onAddPlaceToWishlist
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      sender: 'ai',
      text: `Hello ${currentUser.name}! 🌟 I am your **ExploraAI Smart Travel AI Assistant** for **${currentCity.name}, ${currentCity.country}**.\n\nI specialize strictly in **travel, destinations, and exploration**:\n- Ask travel questions (e.g. *"What are hidden cafes under ₹500 near the city palace?"* or *"What is the best 2-day itinerary?"*)\n- Upload a photo of a landmark, monument, or local dish\n- Speak via the microphone button for hands-free travel guidance!`,
      timestamp: 'Just now',
      recommendations: [
        { title: `${currentCity.name} Heritage Quarter`, type: 'Attraction', cost: 'Free entry' },
        { title: 'Local Artisan Coffee Roaster', type: 'Cafe', cost: '₹250 - ₹450' }
      ]
    }
  ]);

  const [inputPrompt, setInputPrompt] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const quickQuestions = [
    `Best budget cafes under ₹500 in ${currentCity.name}`,
    `Hidden photo spots for sunrise with no crowds`,
    `Local transportation hacks & metro fare guide`,
    `Must-try authentic delicacies & where to eat them`
  ];

  // Speech Recognition
  const handleToggleVoiceRecording = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser environment. You can type your question!');
      return;
    }

    if (isRecordingVoice) {
      setIsRecordingVoice(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    recognition.onstart = () => setIsRecordingVoice(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputPrompt(transcript);
      setIsRecordingVoice(false);
    };
    recognition.onerror = () => setIsRecordingVoice(false);
    recognition.onend = () => setIsRecordingVoice(false);
    recognition.start();
  };

  // Text-To-Speech
  const handleSpeakText = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    // Clean markdown characters for pleasant speech
    const cleanText = text.replace(/[*#_`]/g, '').replace(/\[.*?\]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputPrompt;
    if (!textToSend.trim() && !selectedImage) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      text: textToSend,
      imageUrl: selectedImage || undefined,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputPrompt('');
    const imagePayload = selectedImage;
    setSelectedImage(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          imageBase64: imagePayload,
          cityContext: currentCity.name,
        })
      });

      const data = await response.json();

      const aiReply: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: data.text || 'I have found great recommendations for your travel in ' + currentCity.name,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        recommendations: data.recommendations
      };

      setMessages((prev) => [...prev, aiReply]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: 'ai',
          text: `Here are my top curated suggestions for **${currentCity.name}**:\n- **Morning**: Visit the royal landmark and historic bazaar.\n- **Lunch**: Enjoy regional specialties at traditional cafes.\n- **Sunset**: Catch the panoramic golden hour from elevated viewpoints!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      {/* Header Info Banner */}
      <div className="p-4 sm:p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
            <Bot className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white font-heading">AI Assistant & Voice</h2>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                ONLINE • {currentCity.name.toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-slate-400">Multimodal assistance: share photos, talk via voice, and get tailored local tips.</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setMessages([messages[0]])}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-slate-400 hover:text-slate-200 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear Chat</span>
        </button>
      </div>

      {/* Main Chat Conversation Container */}
      <div className="rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl flex flex-col h-[580px] overflow-hidden">
        
        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((msg) => {
            const isAI = msg.sender === 'ai';
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${isAI ? 'justify-start' : 'justify-end'}`}
              >
                {/* AI Avatar */}
                {isAI && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shrink-0 mt-1 shadow-md shadow-indigo-500/20">
                    <Sparkles className="w-4 h-4" />
                  </div>
                )}

                {/* Message Bubble */}
                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed space-y-3 ${
                    isAI
                      ? 'bg-slate-950/90 border border-slate-800 text-slate-100 shadow-md'
                      : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/20 ml-auto'
                  }`}
                >
                  {/* Attached Image if any */}
                  {msg.imageUrl && (
                    <div className="rounded-xl overflow-hidden border border-white/10 max-h-56 max-w-sm">
                      <img src={msg.imageUrl} alt="Uploaded attachment" className="w-full h-full object-cover" />
                    </div>
                  )}

                  {/* Message Content */}
                  <div className="whitespace-pre-wrap">
                    {msg.text}
                  </div>

                  {/* Recommendations Pills if returned */}
                  {msg.recommendations && msg.recommendations.length > 0 && (
                    <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                      <p className="text-[11px] font-semibold text-indigo-300">Suggested Spots:</p>
                      <div className="flex flex-wrap gap-2">
                        {msg.recommendations.map((rec, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-indigo-500/20 text-xs"
                          >
                            <div>
                              <p className="font-semibold text-white">{rec.title}</p>
                              <p className="text-[10px] text-slate-400">{rec.type} • {rec.cost}</p>
                            </div>
                            {onAddPlaceToWishlist && (
                              <button
                                type="button"
                                onClick={() => onAddPlaceToWishlist(rec.title, rec.type)}
                                className="p-1 rounded bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white transition-colors"
                                title="Save to wishlist"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Timestamp and Speech button */}
                  <div className="flex items-center justify-between gap-2 text-[10px] text-slate-400 pt-1">
                    <span>{msg.timestamp}</span>
                    {isAI && (
                      <button
                        type="button"
                        onClick={() => handleSpeakText(msg.text)}
                        className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 transition-colors"
                        title="Read aloud"
                      >
                        {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                        <span>Listen</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* User Avatar */}
                {!isAI && (
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-8 h-8 rounded-xl object-cover border border-indigo-400 shrink-0 mt-1"
                  />
                )}
              </motion.div>
            );
          })}

          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3 items-center"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shrink-0">
                <Sparkles className="w-4 h-4 animate-spin" />
              </div>
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-indigo-300 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce delay-100" />
                <div className="w-2 h-2 rounded-full bg-pink-400 animate-bounce delay-200" />
                <span>ExploraAI is analyzing local insights...</span>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2 border-t border-slate-800/80 bg-slate-950/60 flex items-center gap-2 overflow-x-auto no-scrollbar text-xs">
          <span className="text-slate-500 shrink-0 text-[11px] font-medium">Suggestions:</span>
          {quickQuestions.map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(q)}
              className="px-3 py-1 rounded-full bg-slate-900 hover:bg-indigo-600/20 border border-slate-800 hover:border-indigo-500/30 text-slate-300 hover:text-indigo-200 shrink-0 transition-colors"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Upload Preview Bar if image is chosen */}
        {selectedImage && (
          <div className="px-4 py-2 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src={selectedImage} alt="Preview" className="w-10 h-10 rounded-lg object-cover border border-indigo-500/40" />
              <div>
                <p className="text-xs font-semibold text-white">Attached Photo</p>
                <p className="text-[10px] text-slate-400">Ready to analyze with Gemini Vision</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSelectedImage(null)}
              className="p-1 rounded-full bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Input Bar */}
        <div className="p-3 sm:p-4 border-t border-slate-800 bg-slate-950/90">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            {/* File Upload Trigger */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Share an image / menu / landmark photo"
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-indigo-400 border border-slate-800 transition-colors"
            >
              <Image className="w-5 h-5" />
            </button>

            {/* Voice Recording Mic Trigger */}
            <button
              type="button"
              onClick={handleToggleVoiceRecording}
              title={isRecordingVoice ? 'Stop Recording' : 'Voice Input (Talk to AI)'}
              className={`p-2.5 rounded-xl border transition-all ${
                isRecordingVoice
                  ? 'bg-rose-600 text-white border-rose-500 animate-pulse'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-purple-400 border-slate-800'
              }`}
            >
              {isRecordingVoice ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            {/* Text Input */}
            <input
              type="text"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              placeholder={isRecordingVoice ? 'Listening to your voice...' : `Ask travel questions about ${currentCity.name}...`}
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={(!inputPrompt.trim() && !selectedImage) || isLoading}
              className="p-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-md shadow-indigo-500/25 transition-transform hover:scale-105 disabled:opacity-40"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
