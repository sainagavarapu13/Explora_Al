import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Globe2, ArrowRightLeft, Volume2, VolumeX, Mic, Copy, Check, Sparkles, BookOpen, MessageSquareQuote } from 'lucide-react';
import { CityInfo } from '../types';

interface LanguageTranslatorProps {
  currentCity: CityInfo;
}

export const LanguageTranslator: React.FC<LanguageTranslatorProps> = ({ currentCity }) => {
  const [sourceLang, setSourceLang] = useState('English');
  const [targetLang, setTargetLang] = useState('Hindi');
  const [sourceText, setSourceText] = useState('How much does a ticket to the palace cost?');
  const [translatedResult, setTranslatedResult] = useState({
    translation: 'महल का टिकट कितने का है? (Mahal ka ticket kitne ka hai?)',
    detectedSource: 'English',
    phonetic: 'Mahal ka ticket kitne ka hai?',
    contextTip: 'In North India, you can also politely ask "Bhaiya, entry ticket kitna hai?"'
  });
  const [isTranslating, setIsTranslating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListeningMic, setIsListeningMic] = useState(false);

  const supportedLanguages = [
    'Hindi', 'English', 'French', 'Spanish', 'Japanese', 'German', 'Italian', 
    'Arabic', 'Mandarin Chinese', 'Russian', 'Portuguese', 'Korean', 'Thai', 
    'Vietnamese', 'Bengali', 'Tamil', 'Telugu', 'Marathi', 'Gujarati'
  ];

  const travelPhrases = [
    { en: 'Where is the nearest restroom / washroom?', category: 'Essentials' },
    { en: 'Can you please make it less spicy and vegetarian?', category: 'Dining' },
    { en: 'Is the meter turned on? What is the fixed fare?', category: 'Taxi / Transit' },
    { en: 'Can you give a small discount if I take two?', category: 'Bargaining' },
    { en: 'I need immediate medical help / hospital.', category: 'Emergency' }
  ];

  const handleSwapLanguages = () => {
    const temp = sourceLang;
    setSourceLang(targetLang);
    setTargetLang(temp);
  };

  const handleTranslate = async (textToTranslate?: string) => {
    const text = textToTranslate || sourceText;
    if (!text.trim()) return;

    setIsTranslating(true);
    try {
      const response = await fetch('/api/ai/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          sourceLang,
          targetLang,
          cityContext: currentCity.name,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();
      if (data && data.translation) {
        setTranslatedResult(data);
      }
    } catch (err: any) {
      console.warn('Translation handled fallback:', err?.message || err);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSpeechInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser. You can type in the box!');
      return;
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListeningMic(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setSourceText(transcript);
      setIsListeningMic(false);
      handleTranslate(transcript);
    };
    recognition.onerror = () => setIsListeningMic(false);
    recognition.onend = () => setIsListeningMic(false);
    recognition.start();
  };

  const handleSpeakOutput = () => {
    if (!('speechSynthesis' in window) || !translatedResult?.translation) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(translatedResult.translation);
    utterance.rate = 0.9;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const handleCopy = () => {
    if (!translatedResult?.translation) return;
    navigator.clipboard.writeText(translatedResult.translation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header Info */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-500 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/25">
            <Globe2 className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white font-heading">Language Recognition & Live Translator</h2>
              <span className="px-2.5 py-0.5 text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-full">
                40+ LANGUAGES & AUDIO
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Break language barriers instantly with speech recognition, phonetic guides, and cultural context tips.
            </p>
          </div>
        </div>
      </div>

      {/* Language Selector Bar */}
      <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex-1 min-w-[180px]">
          <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">From Language</label>
          <select
            value={sourceLang}
            onChange={(e) => setSourceLang(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-purple-500"
          >
            {supportedLanguages.map((lang) => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={handleSwapLanguages}
          className="p-3 rounded-2xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-purple-400 hover:text-white transition-all shadow-md mt-4 sm:mt-0"
          title="Swap Languages"
        >
          <ArrowRightLeft className="w-4 h-4" />
        </button>

        <div className="flex-1 min-w-[180px]">
          <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">To Destination Language</label>
          <select
            value={targetLang}
            onChange={(e) => setTargetLang(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-purple-500"
          >
            {supportedLanguages.map((lang) => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Dual Translation Canvas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Source Text Input */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-slate-200">Enter / Speak Phrase ({sourceLang})</span>
              <button
                type="button"
                onClick={handleSpeechInput}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition-colors ${
                  isListeningMic
                    ? 'bg-rose-600 text-white animate-pulse'
                    : 'bg-slate-950 hover:bg-slate-800 text-purple-400 border border-slate-800'
                }`}
              >
                <Mic className="w-3.5 h-3.5" />
                <span>{isListeningMic ? 'Listening...' : 'Voice Mic'}</span>
              </button>
            </div>

            <textarea
              rows={5}
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              placeholder="Type anything you want to say to locals, taxi drivers, hotel staff, or shopkeepers..."
              className="w-full p-3 rounded-2xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-all resize-none"
            />
          </div>

          <button
            type="button"
            disabled={isTranslating || !sourceText.trim()}
            onClick={() => handleTranslate()}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-md shadow-purple-500/20 transition-all disabled:opacity-50"
          >
            {isTranslating ? (
              <Sparkles className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            <span>{isTranslating ? 'Translating with AI...' : `Translate into ${targetLang}`}</span>
          </button>
        </div>

        {/* Translation Output Card */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-purple-300">Translated Result ({targetLang})</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSpeakOutput}
                  className="p-1.5 rounded-lg bg-slate-950 text-purple-400 hover:text-white border border-slate-800 transition-colors"
                  title="Play pronunciation"
                >
                  {isSpeaking ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="p-1.5 rounded-lg bg-slate-950 text-slate-400 hover:text-white border border-slate-800 transition-colors"
                  title="Copy to clipboard"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 min-h-[120px] space-y-2">
              <p className="text-base sm:text-lg font-bold text-white leading-relaxed">
                {translatedResult?.translation || 'Translation will appear here...'}
              </p>
              {translatedResult?.phonetic && (
                <p className="text-xs text-purple-400 font-mono">
                  Phonetic: {translatedResult.phonetic}
                </p>
              )}
            </div>
          </div>

          {/* Local Etiquette Context Tip */}
          {translatedResult?.contextTip && (
            <div className="p-3 rounded-2xl bg-purple-950/30 border border-purple-500/20 text-xs text-purple-200/90 space-y-1">
              <p className="font-bold flex items-center gap-1 text-[11px] text-purple-300">
                <MessageSquareQuote className="w-3.5 h-3.5" />
                <span>Local Cultural Tip:</span>
              </p>
              <p className="text-[11px] text-slate-300">{translatedResult.contextTip}</p>
            </div>
          )}
        </div>

      </div>

      {/* Quick Tourist Phrasebook */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
        <h3 className="font-bold text-sm text-white uppercase tracking-wider flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-purple-400" />
          <span>Common Traveler Essential Phrases (1-Click Translate)</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {travelPhrases.map((phrase, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setSourceText(phrase.en);
                handleTranslate(phrase.en);
              }}
              className="p-3.5 rounded-2xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-left space-y-1 group transition-all"
            >
              <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider block">
                {phrase.category}
              </span>
              <p className="text-xs text-slate-200 group-hover:text-white transition-colors">
                "{phrase.en}"
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
