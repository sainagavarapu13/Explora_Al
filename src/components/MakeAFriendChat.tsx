import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserCheck, MessageSquare, Send, Sparkles, MapPin, UserPlus, Check, Globe2, ShieldCheck, Heart, Coffee, Compass } from 'lucide-react';
import { TravelBuddy, User, CityInfo } from '../types';
import { SAMPLE_BUDDIES } from '../data/travelData';

interface MakeAFriendChatProps {
  currentUser: User;
  currentCity: CityInfo;
  buddies: TravelBuddy[];
  onSendFriendRequest: (buddyId: string) => void;
  onSelectProfileModule?: () => void;
  pendingRequestsCount?: number;
}

export const MakeAFriendChat: React.FC<MakeAFriendChatProps> = ({
  currentUser,
  currentCity,
  buddies,
  onSendFriendRequest,
  onSelectProfileModule,
  pendingRequestsCount = 0,
}) => {
  const [activeChatBuddy, setActiveChatBuddy] = useState<TravelBuddy | null>(() => {
    return buddies.find((b) => b.isFriend) || buddies[0];
  });
  const [sentRequestIds, setSentRequestIds] = useState<string[]>([]);
  const [chatMessages, setChatMessages] = useState<Record<string, Array<{ sender: 'me' | 'them'; text: string; time: string }>>>({
    'buddy-1': [
      { sender: 'them', text: 'Hey there! I am heading to Hawa Mahal rooftop cafe around 5:30 PM for sunset photos. Are you in Jaipur right now?', time: '2:15 PM' },
      { sender: 'me', text: 'Hey Maya! Yes, I just checked in. That rooftop cafe sounds fantastic, would love to join!', time: '2:18 PM' }
    ],
    'buddy-2': [
      { sender: 'them', text: 'Bonjour! Are you looking to split a cab for the Amer Fort and Nahargarh sunset tour tomorrow?', time: '11:30 AM' }
    ]
  });
  const [messageInput, setMessageInput] = useState('');

  const handleConnectClick = (buddyId: string) => {
    onSendFriendRequest(buddyId);
    setSentRequestIds([...sentRequestIds, buddyId]);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeChatBuddy) return;

    const buddyId = activeChatBuddy.id;
    const currentList = chatMessages[buddyId] || [];
    const newMsg = {
      sender: 'me' as const,
      text: messageInput,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages({
      ...chatMessages,
      [buddyId]: [...currentList, newMsg]
    });
    setMessageInput('');

    // Simulate friendly instant reply after 1.5s
    setTimeout(() => {
      setChatMessages((prev) => ({
        ...prev,
        [buddyId]: [
          ...(prev[buddyId] || []),
          {
            sender: 'them',
            text: `Awesome! Let's meet at the main archway. I know a great local tea stall right nearby too! ☕`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]
      }));
    }, 1500);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header Info */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/25">
            <UserCheck className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white font-heading">Make a Friend & Travel Together</h2>
              <span className="px-2.5 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full">
                MUTUAL ACCEPTANCE REQUIRED
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Explore fellow travelers in {currentCity.name}. Travelers only become confirmed friends once requests are accepted in your Profile.
            </p>
          </div>
        </div>

        {pendingRequestsCount > 0 && onSelectProfileModule && (
          <button
            type="button"
            onClick={onSelectProfileModule}
            className="px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-500/20 transition-all hover:scale-105"
          >
            <UserPlus className="w-4 h-4" />
            <span>{pendingRequestsCount} Pending Requests in Profile</span>
          </button>
        )}
      </div>

      {/* Main Grid: Buddies List & 1-on-1 Chat Messenger */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Explorer Matches in City */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs text-white uppercase tracking-wider">
                Travelers in {currentCity.name}
              </h3>
              <span className="text-[10px] text-emerald-400 font-semibold">{buddies.length} Active Now</span>
            </div>

            <div className="space-y-3">
              {buddies.map((buddy) => {
                const isSelected = activeChatBuddy?.id === buddy.id;
                return (
                  <div
                    key={buddy.id}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-3 ${
                      isSelected
                        ? 'bg-slate-950 border-emerald-500/50 shadow-md'
                        : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700'
                    }`}
                    onClick={() => setActiveChatBuddy(buddy)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img
                            src={buddy.avatar}
                            alt={buddy.name}
                            className="w-11 h-11 rounded-full object-cover border border-emerald-500"
                          />
                          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-950" />
                        </div>
                        <div>
                          <h4 className="font-bold text-xs text-white">{buddy.name}</h4>
                          <p className="text-[10px] text-slate-400">{buddy.country} • {buddy.travelStyle}</p>
                        </div>
                      </div>

                      {buddy.isFriend ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold border border-emerald-500/30 flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          <span>Friends</span>
                        </span>
                      ) : sentRequestIds.includes(buddy.id) ? (
                        <span className="px-2.5 py-1 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-semibold flex items-center gap-1">
                          <span>Request Sent</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleConnectClick(buddy.id);
                          }}
                          className="px-2.5 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-semibold flex items-center gap-1 transition-colors shadow-sm"
                        >
                          <UserPlus className="w-3 h-3" />
                          <span>Add Friend</span>
                        </button>
                      )}
                    </div>

                    <p className="text-xs text-slate-300 line-clamp-2 font-light">{buddy.bio}</p>

                    {/* Interests tags */}
                    <div className="flex flex-wrap gap-1">
                      {buddy.interests.map((it) => (
                        <span key={it} className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-[9px] text-emerald-300">
                          {it}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Active 1-on-1 Chat Messenger */}
        <div className="lg:col-span-7">
          {activeChatBuddy ? (
            <div className="rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-col h-[520px] overflow-hidden">
              
              {/* Chat Header */}
              <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={activeChatBuddy.avatar}
                    alt={activeChatBuddy.name}
                    className="w-10 h-10 rounded-full object-cover border border-emerald-400"
                  />
                  <div>
                    <h4 className="font-bold text-xs text-white">{activeChatBuddy.name}</h4>
                    <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span>Visiting {activeChatBuddy.currentCity} ({activeChatBuddy.datesInCity})</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 bg-slate-900 px-2.5 py-1 rounded-full border border-slate-800">
                    Speaks: {activeChatBuddy.languages.join(', ')}
                  </span>
                </div>
              </div>

              {/* Messages Area or Friend Request Pending Screen */}
              {activeChatBuddy.isFriend ? (
                <>
                  <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-950/40">
                    {(chatMessages[activeChatBuddy.id] || []).map((msg, idx) => {
                      const isMe = msg.sender === 'me';
                      return (
                        <div
                          key={idx}
                          className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[78%] p-3 rounded-2xl text-xs leading-relaxed space-y-1 ${
                              isMe
                                ? 'bg-emerald-600 text-white rounded-tr-none shadow-md'
                                : 'bg-slate-950 border border-slate-800 text-slate-100 rounded-tl-none'
                            }`}
                          >
                            <p>{msg.text}</p>
                            <p className={`text-[9px] text-right ${isMe ? 'text-emerald-200' : 'text-slate-500'}`}>
                              {msg.time}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Send Bar */}
                  <form onSubmit={handleSendMessage} className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
                    <input
                      type="text"
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      placeholder={`Send message to ${activeChatBuddy.name}...`}
                      className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      type="submit"
                      disabled={!messageInput.trim()}
                      className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-colors disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4 bg-slate-950/60">
                  <div className="w-14 h-14 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-400">
                    <ShieldCheck className="w-7 h-7 text-emerald-400" />
                  </div>
                  <div className="max-w-md space-y-1.5">
                    <h4 className="text-sm font-bold text-white">Friend Request Required</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      For traveler privacy and safety, direct 1-on-1 messaging unlocks once you and {activeChatBuddy.name} become friends through an accepted friend request.
                    </p>
                  </div>

                  {sentRequestIds.includes(activeChatBuddy.id) ? (
                    <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                      <span>Friend request is pending {activeChatBuddy.name}&apos;s acceptance.</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleConnectClick(activeChatBuddy.id)}
                      className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>Send Friend Request to {activeChatBuddy.name}</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-3">
              <UserCheck className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-white">Select a Travel Explorer</h3>
              <p className="text-xs text-slate-400">Choose a fellow traveler from the left to start a direct message conversation.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
