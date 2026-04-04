"use client";

import { ChevronLeft, MoreVertical, Send, Mic, Smile, Plus, Loader2, User, Edit, ChevronDown, Trash2, Globe, Eye, Check } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { memo, useState, useEffect, useRef, use, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

// Separate memoized component for each message to prevent unnecessary re-renders
const MessageItem = memo(({ 
  msg, 
  user, 
  partner, 
  isMe, 
  isImage, 
  isVoiceNote, 
  isViewOnce, 
  hasBeenViewed,
  showMenu, 
  contextMenuMsgId,
  setContextMenuMsgId, 
  setShowDeleteConfirm, 
  setMenuDirection,
  longPressTimeoutRef,
  setSelectedImage,
  handleViewOnceMessage,
  handleDeleteMessage,
  handleEditMessage,
  showDeleteConfirm,
  menuDirection
}: any) => {
  return (
    <div 
      className={`flex ${isMe ? "justify-end" : "justify-start"} items-end gap-2 relative group ${showMenu ? "z-[50]" : "z-10"}`}
    >
      {!isMe && (
        <div className={`w-8 h-8 rounded-full overflow-hidden shrink-0 mb-1 bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center transition-opacity duration-300 ${showMenu ? "opacity-40" : "opacity-100"}`}>
          {partner?.avatar_url ? (
            <Image 
              src={partner.avatar_url} 
              alt="Avatar" 
              width={32} 
              height={32} 
              className="object-cover w-full h-full" 
            />
          ) : (
            <User className="w-5 h-5 text-zinc-400 dark:text-zinc-600" />
          )}
        </div>
      )}
      
      <motion.div 
        animate={showMenu ? { 
          scale: 1.04,
          y: -8,
          zIndex: 100,
        } : { 
          scale: 1,
          y: 0,
          zIndex: 10
        }}
        transition={{ type: "spring", damping: 20, stiffness: 350, mass: 0.5 }}
        className={`max-w-[82%] rounded-[22px] relative touch-none select-none will-change-transform ${
          isImage && !isViewOnce ? "shadow-md active:scale-[0.98] cursor-pointer" : "shadow-sm px-4 py-3"
        } ${
          isMe 
            ? isImage && !isViewOnce ? "" : "bg-zinc-900 dark:bg-zinc-800 text-white rounded-br-none" 
            : isImage && !isViewOnce ? "" : "bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 rounded-bl-none border border-zinc-100/50 dark:border-zinc-800"
        } ${showMenu ? "shadow-2xl" : ""}`}
        onPointerDown={(e) => {
          const clientY = e.clientY;
          longPressTimeoutRef.current = setTimeout(() => {
            setMenuDirection(clientY > window.innerHeight * 0.6 ? 'top' : 'bottom');
            setContextMenuMsgId(msg.id);
            setShowDeleteConfirm(null);
            if (window.navigator.vibrate) window.navigator.vibrate(10);
          }, 500);
        }}
        onPointerUp={() => {
          if (longPressTimeoutRef.current) clearTimeout(longPressTimeoutRef.current);
        }}
        onPointerLeave={() => {
          if (longPressTimeoutRef.current) clearTimeout(longPressTimeoutRef.current);
        }}
        onContextMenu={(e) => e.preventDefault()}
      >
        {/* Tiny Arrow Dropdown Toggle */}
        <div className="absolute top-0 right-0 p-1">
          <button 
            type="button"
            onClick={(e) => { 
              e.stopPropagation(); 
              const clientY = e.clientY;
              if (contextMenuMsgId !== msg.id) {
                setMenuDirection(clientY > window.innerHeight * 0.6 ? 'top' : 'bottom');
                setShowDeleteConfirm(null);
                setContextMenuMsgId(msg.id);
              } else {
                setContextMenuMsgId(null);
              }
            }}
            className={`msg-menu-toggle h-6 w-6 flex items-center justify-center rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 backdrop-blur-md shadow-lg border border-white/20 active:scale-90 ${isMe && !isImage ? "bg-[#E5FF66] text-black" : "bg-black/20 text-white"}`}
          >
            <ChevronDown size={12} className={isMe && !isImage ? "text-white dark:text-black" : "text-white"} />
          </button>
        </div>

        {/* Multi-view Dropdown Menu (Simplified version for mobile performance) */}
        <AnimatePresence>
          {showMenu && (
            <motion.div 
              key="dropdown"
              initial={{ opacity: 0, scale: 0.9, y: menuDirection === 'bottom' ? 5 : -5 }}
              animate={{ opacity: 1, scale: 1, y: menuDirection === 'bottom' ? 20 : -20 }}
              exit={{ opacity: 0, scale: 0.9, y: menuDirection === 'bottom' ? 5 : -5 }}
              transition={{ type: "spring", damping: 20, stiffness: 350, mass: 0.5 }}
              onClick={(e) => e.stopPropagation()}
              className={`msg-menu-container absolute ${isMe ? 'right-0' : 'left-0'} w-[130px] bg-white dark:bg-zinc-950 rounded-[18px] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] border border-black/5 dark:border-white/10 p-1 z-50 overflow-hidden ring-1 ring-black/5 dark:ring-white/5 will-change-transform ${
                 menuDirection === 'bottom' ? 'top-full mt-1' : 'bottom-full mb-1'
              }`}
            >
              <AnimatePresence mode="wait">
                {showDeleteConfirm === msg.id ? (
                  <motion.div 
                    key="delete-confirm"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex flex-col gap-0.5"
                  >
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDeleteMessage(msg.id, 'me'); }}
                      className="w-full flex items-center justify-center py-2 text-[12px] font-bold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-xl transition-all active:scale-[0.98]"
                    >
                        <span>For Me</span>
                    </button>

                    {isMe && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDeleteMessage(msg.id, 'everyone'); }}
                        className="w-full flex items-center justify-center py-2 text-[12px] font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all active:scale-[0.98]"
                      >
                          <span>For Everyone</span>
                      </button>
                    )}

                    <button 
                      onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(null); }}
                      className="w-full py-1 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-900 transition-colors text-center"
                    >
                       Back
                    </button>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="main-menu"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex flex-col gap-0.5"
                  >
                    {isMe && !isImage && !isVoiceNote && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleEditMessage(msg); }}
                        className="w-full flex items-center justify-between px-3 py-2 text-[13px] font-bold text-zinc-800 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-xl transition-all active:scale-[0.98]"
                      >
                         <span>Edit</span>
                         <Edit size={14} className="text-zinc-400" />
                      </button>
                    )}
                    
                    <button 
                      onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(msg.id); }}
                      className="w-full flex items-center justify-between px-3 py-2 text-[13px] font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all active:scale-[0.98]"
                    >
                        <span>Delete</span>
                        <Trash2 size={14} className="text-red-400" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {isVoiceNote ? (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 mb-1">
              <Mic size={14} className={isMe ? (isMe ? "text-[#E5FF66] dark:text-blue-500" : "text-[#E5FF66]") : "text-zinc-500"} />
              <span className="font-semibold text-xs tracking-wide">Voice Note</span>
            </div>
            <audio 
              src={(msg.content || "").replace('[VOICE_NOTE]', '')} 
              controls 
              controlsList="nodownload"
              onContextMenu={(e) => e.preventDefault()}
              className={`h-8 w-48 custom-audio ${isMe ? 'invert dark:invert-0' : 'dark:invert'}`}
            />
          </div>
        ) : isImage ? (
           isViewOnce ? (
             <div 
                onClick={(e) => { e.stopPropagation(); !isMe && !msg.has_been_viewed && handleViewOnceMessage(msg); }}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-full transition-all ${
                  msg.has_been_viewed 
                    ? 'opacity-40 cursor-default bg-zinc-100 dark:bg-zinc-800 text-zinc-500' 
                    : isMe 
                      ? 'bg-zinc-800 text-[#E5FF66] cursor-default' 
                      : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-800'
                }`}
             >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${msg.has_been_viewed ? 'bg-zinc-200 dark:bg-zinc-700' : 'bg-[#E5FF66]/10 text-[#E5FF66]'}`}>
                  {msg.has_been_viewed ? <Check size={14} className="text-zinc-400" /> : <Eye size={14} />}
                </div>
                <span className="text-[13px] font-bold tracking-tight">
                   {msg.has_been_viewed ? 'Opened' : 'Photo'}
                </span>
             </div>
           ) : (
            <div 
              onClick={(e) => { e.stopPropagation(); !showMenu && setSelectedImage((msg.content || "").replace('[IMAGE]', '')); }}
              className="relative bg-zinc-100 dark:bg-zinc-900 flex flex-col items-stretch justify-center rounded-[18px] overflow-hidden"
            >
               <img 
                 src={(msg.content || "").replace('[IMAGE]', '').split('\n\n')[0]} 
                 alt="Shared image" 
                 className="w-full h-auto max-h-[220px] object-cover" 
               />
               {(msg.content || "").split('\n\n')[1] && (
                 <div className={`w-full p-4 text-[14px] leading-relaxed ${isMe ? 'bg-zinc-900 dark:bg-zinc-800 text-white' : 'bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 border-t border-zinc-100 dark:border-zinc-800'}`}>
                    {(msg.content || "").split('\n\n')[1]}
                 </div>
               )}
               <div className="absolute bottom-2 right-3">
                  <span className="text-[9px] font-bold text-white/90 drop-shadow-md bg-black/20 px-1.5 py-0.5 rounded-full backdrop-blur-sm">
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
               </div>
            </div>
           )
        ) : (
          <>
            <p className="text-[14.5px] leading-relaxed font-medium pr-4">{msg.content}</p>
            <div className="flex items-center justify-between gap-2 mt-1.5">
              {msg.is_edited && <span className="text-[9px] font-bold italic text-white/40 dark:text-black/40">(edited)</span>}
              <div className="flex items-center gap-1.5 ml-auto">
                <span className={`block text-[9px] font-black uppercase tracking-widest ${isMe ? "text-white/40 dark:text-black/40" : "text-zinc-400 dark:text-zinc-600"}`}>
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                {isMe && (
                  <div className="flex items-center">
                    {msg.is_read ? (
                      <div className="flex -space-x-1.5">
                        <Check size={10} className="text-[#E5FF66]" strokeWidth={4} />
                        <Check size={10} className="text-[#E5FF66]" strokeWidth={4} />
                      </div>
                    ) : (
                      <Check size={10} className="text-white/30 dark:text-black/20" strokeWidth={4} />
                    )}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
});

export default function ChatDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: conversationId } = use(params);
  const router = useRouter();
  const supabase = createClient();
  
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [partnerIsTyping, setPartnerIsTyping] = useState(false);
  const channelRef = useRef<any>(null);

  // Voice recording & Emojis
  const [showEmojis, setShowEmojis] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const commonEmojis = ['ðŸ˜‚', 'â¤ï¸', 'ðŸ”¥', 'ðŸ‘', 'ðŸ˜Š', 'ðŸ˜', 'ðŸ˜­', 'ðŸ¥º', 'ðŸ™', 'âœ¨', 'ðŸ’¯', 'ðŸ‘', 'ðŸ‘€', 'ðŸ™Œ', 'ðŸŽ‰'];
  const [partner, setPartner] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [pendingImage, setPendingImage] = useState<{ file: File, preview: string } | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [contextMenuMsgId, setContextMenuMsgId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null); 
  const [menuDirection, setMenuDirection] = useState<'top' | 'bottom'>('bottom');
  const longPressTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isLongPressActive, setIsLongPressActive] = useState(false);
  const [isViewOnceEnabled, setIsViewOnceEnabled] = useState(false);

  const [partnerIsOnline, setPartnerIsOnline] = useState(false);

  useEffect(() => {
    if (!partner) return;
    const presenceChannel = supabase.channel('online-users');

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState();
        const activeIds = Object.values(state).flat().map((p: any) => p.user_id);
        setPartnerIsOnline(activeIds.includes(partner.id));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(presenceChannel);
    };
  }, [supabase, partner]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    async function initChat() {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (!authUser) {
          router.push("/login");
          return;
        }
        setUser(authUser);

        if (conversationId) {
          // Fetch partner profile from conversation_participants
          const { data: participantData } = await supabase
            .from('conversation_participants')
            .select('profiles (id, username, full_name, avatar_url)')
            .eq('conversation_id', conversationId)
            .neq('user_id', authUser.id)
            .single();
          
          if (participantData && participantData.profiles) {
            const profile = Array.isArray(participantData.profiles) ? participantData.profiles[0] : participantData.profiles;
            setPartner(profile);
          }

          // Fetch message history
          const { data: history } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: true });

          if (history) {
             const visibleHistory = history.filter((m: any) => {
               const deletedBy = m.deleted_by || [];
               return !deletedBy.includes(authUser.id);
             });
             setMessages(visibleHistory);
             
             // Mark unread messages from partner as read
             const unreadIds = history.filter((m: any) => !m.is_read && m.sender_id !== authUser.id).map((m: any) => m.id);
             if (unreadIds.length > 0) {
                await supabase.from('messages').update({ is_read: true }).in('id', unreadIds);
             }
          }
        }
        setIsLoading(false);
        setTimeout(scrollToBottom, 100);
      } catch (err: any) {
        if (err.name !== 'AbortError' && !err.message?.includes('Lock broken')) {
          console.error("Init chat error:", err);
        }
      }
    }

    initChat();
  }, [conversationId, supabase, router]);

  // Click outside to close message menu
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Close if clicking outside both the toggle and the menu container
      if (!target.closest('.msg-menu-container') && !target.closest('.msg-menu-toggle')) {
        setContextMenuMsgId(null);
        setShowDeleteConfirm(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [contextMenuMsgId]);

  useEffect(() => {
    if (!user || !conversationId) return;

    // Real-time subscription for messages and presence
    const channel = supabase.channel(`chat_${conversationId}`, {
      config: {
        presence: {
          key: user.id,
        },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const otherTyping = Object.values(state).some((presences: any) => 
          presences.some((p: any) => p.isTyping && p.user_id !== user.id)
        );
        setPartnerIsTyping(otherTyping);
      })
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
        },
        async (payload: any) => {
          // Robust real-time syncing for all message actions
          if (payload.eventType === 'DELETE') {
            // For DELETE events, conversation_id is usually null in the payload.
            // We find the message by ID in our local list and remove it.
            setMessages((prev) => prev.filter(m => m.id !== payload.old.id));
            return;
          }

          if (payload.new?.conversation_id === conversationId || payload.old?.conversation_id === conversationId) {
            if (payload.eventType === 'INSERT') {
              // Only add messages not sent by current user and not deleted for current user
              if (payload.new.sender_id !== user.id) {
                const isDeletedForMe = payload.new.deleted_by?.includes(user.id);
                if (!isDeletedForMe) {
                  setMessages((prev) => {
                    if (prev.find(m => m.id === payload.new.id)) return prev; // Prevent duplicates
                    return [...prev, payload.new];
                  });
                  setTimeout(scrollToBottom, 100);
                  // Ensure the mark-as-read update is awaited for consistency
                  await supabase.from('messages').update({ is_read: true }).eq('id', payload.new.id);
                }
              }
            } else if (payload.eventType === 'UPDATE') {
              const isDeletedForMe = payload.new.deleted_by?.includes(user.id);
              if (isDeletedForMe) {
                setMessages((prev) => prev.filter(m => m.id !== payload.new.id));
              } else {
                setMessages((prev) => prev.map(m => m.id === payload.new.id ? payload.new : m));
              }
            }
          }
        }
      )
      .subscribe(async (status: string) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ user_id: user.id, isTyping: false });
        }
      });

    channelRef.current = channel;

    // Safety fallback: Poll the database every 5 seconds in case Realtime WebSockets drop 
    // or the 'supabase_realtime' table publication isn't properly configured yet.
    const pollInterval = setInterval(async () => {
      const { data: latestHistory } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (latestHistory) {
        setMessages(prev => {
           // Only update if there is a difference to avoid resetting scrolling unpredictably
           if (prev.length !== latestHistory.length) {
              const visibleHistory = latestHistory.filter((m: any) => {
                 const deletedBy = m.deleted_by || [];
                 return !deletedBy.includes(user.id);
              });
              
              // Mark new arriving unread messages as read
              const unreadIds = visibleHistory.filter((m: any) => !m.is_read && m.sender_id !== user.id).map((m: any) => m.id);
              if (unreadIds.length > 0) supabase.from('messages').update({ is_read: true }).in('id', unreadIds);
              
              return visibleHistory;
           }
           return prev;
        });
      }
    }, 5000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(pollInterval);
    };
  }, [user, conversationId, supabase]);

  // Track local typing status
  useEffect(() => {
    if (channelRef.current && user) {
      channelRef.current.track({ user_id: user.id, isTyping: inputText.length > 0 });
    }
  }, [inputText, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (longPressTimeoutRef.current) clearTimeout(longPressTimeoutRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const startRecording = async () => {
    // Check if the browser supports media devices and if it's a secure context
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      if (!window.isSecureContext) {
        alert("Voice recording requires a secure (HTTPS) connection. If you are accessing via an IP address, please use 'localhost' or an HTTPS tunnel (like ngrok).");
      } else {
        alert("Your browser does not support voice recording.");
      }
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
           const base64Audio = reader.result as string;
           sendAudioMessage(base64Audio);
        };
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setIsPaused(false);
      setRecordingTime(0);
      timerIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Mic access denied", err);
      alert("Please allow microphone access in your browser settings to record voice notes.");
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      timerIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && (mediaRecorderRef.current.state === 'recording' || mediaRecorderRef.current.state === 'paused')) {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    setIsPaused(false);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
  };

  const sendAudioMessage = async (base64Audio: string) => {
    if (!user || !conversationId) return;
    
    const newMessage = {
      conversation_id: conversationId,
      sender_id: user.id,
      content: `[VOICE_NOTE]${base64Audio}`,
    };

    const tempId = Math.random().toString();
    const optimisticMsg = { ...newMessage, id: tempId, created_at: new Date().toISOString() };
    setMessages((prev) => [...prev, optimisticMsg]);

    const { data, error } = await supabase.from('messages').insert(newMessage).select().single();
    if (error) setMessages((prev) => prev.filter(m => m.id !== tempId));
    else if (data) setMessages((prev) => prev.map(m => m.id === tempId ? data : m));
  };

  const handleDeleteMessage = async (messageId: string, strategy: 'me' | 'everyone') => {
    try {
      if (strategy === 'everyone') {
         const { error } = await supabase
           .from('messages')
           .delete()
           .eq('id', messageId);

         if (error) throw error;
         setMessages(prev => prev.filter(m => m.id !== messageId));
      } else {
         // Delete for ME
         const { data: currentMsg } = await supabase
           .from('messages')
           .select('deleted_by')
           .eq('id', messageId)
           .single();

         const deletedBy = currentMsg?.deleted_by || [];
         if (!deletedBy.includes(user.id)) {
            const { error } = await supabase
              .from('messages')
              .update({ deleted_by: [...deletedBy, user.id] })
              .eq('id', messageId);
            
            if (error) throw error;
            setMessages(prev => prev.filter(m => m.id !== messageId));
         }
      }
      setContextMenuMsgId(null);
      setShowDeleteConfirm(null);
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const handleEditMessage = (message: any) => {
    setEditingMessageId(message.id);
    setInputText(message.content);
    setContextMenuMsgId(null);
  };

  const onFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPendingImage({
      file: file,
      preview: URL.createObjectURL(file)
    });
    
    // Clear input so same file can be selected again if cancelled
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const uploadPendingImage = async (captionText?: string) => {
    if (!pendingImage || !user || !conversationId) return;

    setIsUploading(true);
    try {
      const file = pendingImage.file;
      const fileExt = file.name.split('.').pop() || 'jpg';
      const fileName = `chat-${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `${conversationId}/${fileName}`;

      // 1. Try storage upload
      const { error: uploadError } = await supabase.storage
        .from('posts')
        .upload(filePath, file);

      if (uploadError) {
        // Fallback to data-url
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = () => {
           sendImageMessage(reader.result as string, captionText);
           setPendingImage(null);
        };
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('posts')
        .getPublicUrl(filePath);
      
      sendImageMessage(publicUrl, captionText);
      setPendingImage(null);
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSendAction = async () => {
    if (pendingImage) {
      await uploadPendingImage(inputText.trim() || undefined);
      setInputText("");
    } else {
      handleSendMessage();
    }
  };

  const sendImageMessage = async (imageUrl: string, caption?: string) => {
    if (!user || !conversationId) return;
    
    const newMessage = {
      conversation_id: conversationId,
      sender_id: user.id,
      content: `[IMAGE]${imageUrl}${caption ? `\n\n${caption}` : ""}`,
      is_view_once: isViewOnceEnabled
    };

    const tempId = Math.random().toString();
    const optimisticMsg = { ...newMessage, id: tempId, created_at: new Date().toISOString() };
    setMessages((prev) => [...prev, optimisticMsg]);
    setIsViewOnceEnabled(false);

    const { data, error } = await supabase.from('messages').insert(newMessage).select().single();
    if (error) setMessages((prev) => prev.filter(m => m.id !== tempId));
    else if (data) setMessages((prev) => prev.map(m => m.id === tempId ? data : m));
  };

  const handleViewOnceMessage = async (msg: any) => {
    if (!msg.is_view_once || msg.has_been_viewed) return;
    
    // Open viewer
    setSelectedImage(msg.content.replace('[IMAGE]', '').split('\n\n')[0]);
    
    // Mark as viewed in DB immediately
    if (msg.sender_id !== user.id) {
      setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, has_been_viewed: true } : m));
      await supabase.from('messages').update({ has_been_viewed: true }).eq('id', msg.id);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !user || !conversationId) return;

    if (editingMessageId) {
      const msgId = editingMessageId;
      const newContent = inputText.trim();
      setMessages((prev) => prev.map(m => m.id === msgId ? { ...m, content: newContent, is_edited: true } : m));
      setInputText("");
      setEditingMessageId(null);

      await supabase.from('messages').update({ content: newContent, is_edited: true }).eq('id', msgId);
      return;
    }

    const newMessage = {
      conversation_id: conversationId,
      sender_id: user.id,
      content: inputText.trim(),
    };

    // Optimistic update
    const tempId = Math.random().toString();
    const optimisticMsg = { ...newMessage, id: tempId, created_at: new Date().toISOString() };
    setMessages((prev) => [...prev, optimisticMsg]);
    setInputText("");

    const { data, error } = await supabase
      .from('messages')
      .insert(newMessage)
      .select()
      .single();

    if (error) {
      console.error("Error sending message:", error);
      // Remove optimistic message on error
      setMessages((prev) => prev.filter(m => m.id !== tempId));
    } else if (data) {
      // Replace optimistic message with real data
      setMessages((prev) => prev.map(m => m.id === tempId ? data : m));
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-dvh bg-[#F8F9FA] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-900" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-dvh bg-[#F8F9FA] dark:bg-black max-w-md mx-auto relative font-sans overflow-hidden overscroll-none transition-colors">
      {/* Premium Chat Header */}
      <div className="sticky top-0 flex-none bg-white/90 dark:bg-black/90 backdrop-blur-xl border-b border-zinc-100/80 dark:border-zinc-800/50 px-4 py-4 flex items-center justify-between shadow-sm z-30">
        <div className="flex items-center gap-3">
          <Link href="/messages" className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors">
            <ChevronLeft size={24} className="text-zinc-800 dark:text-zinc-200" />
          </Link>
          <div className="flex items-center gap-3">
            <Link href={partner?.id ? `/profile/${partner.id}` : '#'} className="relative cursor-pointer transition active:scale-95 block">
              <div className={`w-11 h-11 rounded-full overflow-hidden border-2 transition-colors ${partnerIsOnline ? 'border-[#E5FF66]' : 'border-transparent'} bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center`}>
                {partner?.avatar_url ? (
                  <Image 
                    src={partner.avatar_url} 
                    alt={partner.full_name || "User"} 
                    width={44} 
                    height={44} 
                    className={`object-cover w-full h-full transition-opacity ${partnerIsOnline ? 'opacity-100' : 'opacity-80'}`} 
                  />
                ) : (
                  <User className="w-6 h-6 text-zinc-400 dark:text-zinc-600" />
                )}
              </div>
              <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-[#09090b] transition-colors ${partnerIsOnline ? 'bg-[#4ADE80]' : 'bg-zinc-300 dark:bg-zinc-700'}`}></div>
            </Link>
            <div>
              <Link href={partner?.id ? `/profile/${partner.id}` : '#'} className="font-bold text-[15px] text-zinc-900 dark:text-zinc-100 leading-tight hover:underline cursor-pointer block">
                {partner?.full_name || partner?.username || "Loading..."}
              </Link>
              <p className={`text-[11px] font-medium transition-colors ${partnerIsTyping ? "text-primary" : (partnerIsOnline ? "text-[#4ADE80]" : "text-zinc-500 dark:text-zinc-500")}`}>
                {partnerIsTyping ? "Typing..." : (partnerIsOnline ? "Online" : "Offline")}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 text-zinc-600 dark:text-zinc-400 relative">
          <MoreVertical 
            size={20} 
            className="hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer" 
            onClick={() => setShowDropdown(!showDropdown)}
          />
          
          {showDropdown && (
            <div className="absolute top-8 right-0 w-48 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-100 dark:border-zinc-800 py-2 z-50 overflow-hidden">
              <Link href={partner?.id ? `/profile/${partner.id}` : '#'} className="w-full text-left px-4 py-2.5 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 block font-bold">View Profile</Link>
              <button className="w-full text-left px-4 py-2.5 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 block font-bold">Mute Notifications</button>
              <button className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 block font-bold border-t border-zinc-50 dark:border-zinc-800">Block User</button>
            </div>
          )}
        </div>
      </div>

      {/* Single Optimized Blur Overlay */}
      <AnimatePresence>
        {contextMenuMsgId && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: "linear" }}
            onClick={() => { setContextMenuMsgId(null); setShowDeleteConfirm(null); }}
            className="fixed inset-0 bg-black/60 z-[45] cursor-pointer will-change-opacity"
          />
        )}
      </AnimatePresence>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-8 flex flex-col gap-6 scrollbar-hide relative">
        {/* Subtle Wallpaper Pattern */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05] grayscale" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #000 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        
        <div className="flex justify-center mb-4 relative z-10">
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-600 bg-zinc-100 dark:bg-zinc-900/50 px-3 py-1 rounded-full backdrop-blur-sm border border-black/5 dark:border-white/5">Conversation Started</span>
        </div>
        
        {(() => {
          let lastDate = "";
          return messages.map((msg, index) => {
            const msgDate = new Date(msg.created_at).toLocaleDateString(undefined, { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            });
            const today = new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
            const yesterday = new Date(Date.now() - 86400000).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
            
            let dateLabel = msgDate;
            if (msgDate === today) dateLabel = "Today";
            else if (msgDate === yesterday) dateLabel = "Yesterday";

            const showDate = msgDate !== lastDate;
            lastDate = msgDate;

            return (
              <div key={msg.id} className={`relative ${contextMenuMsgId === msg.id ? "z-50" : "z-10"}`}>
                {showDate && (
                  <div className="flex justify-center my-6 first:mt-0">
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 bg-zinc-100/50 dark:bg-zinc-900/40 px-3 py-1.5 rounded-xl border border-black/[0.03] dark:border-white/[0.03] backdrop-blur-[2px]">
                      {dateLabel}
                    </span>
                  </div>
                )}
                <MessageItem 
                  msg={msg}
                  user={user}
                  partner={partner}
                  isMe={msg.sender_id === user?.id}
                  isImage={(msg.content || "").startsWith('[IMAGE]')}
                  isVoiceNote={(msg.content || "").startsWith('[VOICE_NOTE]')}
                  isViewOnce={msg.is_view_once}
                  showMenu={contextMenuMsgId === msg.id}
                  contextMenuMsgId={contextMenuMsgId}
                  setContextMenuMsgId={setContextMenuMsgId}
                  setShowDeleteConfirm={setShowDeleteConfirm}
                  setMenuDirection={setMenuDirection}
                  longPressTimeoutRef={longPressTimeoutRef}
                  setSelectedImage={setSelectedImage}
                  handleViewOnceMessage={handleViewOnceMessage}
                  handleDeleteMessage={handleDeleteMessage}
                  handleEditMessage={handleEditMessage}
                  showDeleteConfirm={showDeleteConfirm}
                  menuDirection={menuDirection}
                />
              </div>
            );
          });
        })()}

        {partnerIsTyping && (
           <div className="flex justify-start items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-300 relative z-10">
             <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center shrink-0">
               <User className="w-4 h-4 text-zinc-400 dark:text-zinc-600" />
             </div>
             <div className="bg-white dark:bg-zinc-900 px-4 py-2.5 rounded-2xl rounded-bl-none shadow-sm border border-zinc-100 dark:border-zinc-800 flex items-center gap-1.5">
               <div className="w-1.5 h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full animate-bounce [animation-delay:-0.3s]" />
               <div className="w-1.5 h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full animate-bounce [animation-delay:-0.15s]" />
               <div className="w-1.5 h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full animate-bounce" />
             </div>
           </div>
        )}
        <div ref={messagesEndRef} className="h-4" />
      </div>

      {/* Chat Input Area */}
      <div className="sticky bottom-0 flex-none bg-white dark:bg-black border-t border-zinc-100 dark:border-zinc-800 z-30 transition-colors">
        {/* Pending Image Preview */}
        {pendingImage && (
          <div className="absolute bottom-full left-4 right-4 mb-4 p-2 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-100 dark:border-zinc-800 animate-in slide-in-from-bottom-4 duration-300">
             <div className="relative rounded-xl overflow-hidden aspect-video bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800">
               <img src={pendingImage.preview} alt="Upload preview" className="w-full h-full object-contain" />
               <button 
                 onClick={() => setPendingImage(null)}
                 className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full bg-black/60 dark:bg-black/80 text-white backdrop-blur-md hover:bg-black/80 transition-all shadow-lg active:scale-95"
               >
                 <span className="text-xl leading-none">&times;</span>
               </button>
             </div>
             <div className="mt-2 text-[11px] font-black text-zinc-400 dark:text-zinc-600 px-1 uppercase tracking-tight">Ready to send</div>
          </div>
        )}

        {showEmojis && (
           <div className="absolute bottom-full left-4 right-16 mb-2 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-[0_-10px_40px_rgba(0,0,0,0.08)] rounded-2xl p-3 grid grid-cols-5 gap-2 z-40 transform origin-bottom-right transition-all">
             {commonEmojis.map(emoji => (
               <button 
                 key={emoji} 
                 type="button" 
                 onClick={() => { setInputText(prev => prev + emoji); setShowEmojis(false); }}
                 className="text-2xl hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-xl p-2 transition-colors flex items-center justify-center active:scale-90"
               >
                 {emoji}
               </button>
             ))}
           </div>
        )}
        
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSendAction(); }}
          className="p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] flex items-center gap-3 relative"
        >
          {editingMessageId && (
            <div className="absolute bottom-full left-0 right-0 bg-white dark:bg-zinc-900 border-t border-zinc-100 dark:border-zinc-800 px-4 py-2 flex items-center justify-between animate-in slide-in-from-bottom-2 duration-200">
               <div className="flex items-center gap-2">
                 <div className="w-1 h-8 bg-[#E5FF66] rounded-full" />
                 <div>
                   <p className="text-xs font-black uppercase text-zinc-400 tracking-wider">Editing Message</p>
                   <p className="text-[11px] text-zinc-500 truncate max-w-[250px]">Press X to cancel</p>
                 </div>
               </div>
               <button 
                 type="button" 
                 onClick={() => { setEditingMessageId(null); setInputText(""); }}
                 className="w-8 h-8 flex items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500"
               >
                 &times;
               </button>
            </div>
          )}
          <input 
            type="file" 
            ref={fileInputRef} 
            hidden 
            accept="image/*" 
            onChange={onFileSelected}
          />
          <div className="flex items-center gap-2 text-zinc-400">
            <button 
              type="button" 
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading || !!pendingImage || !!editingMessageId}
              className={`w-10 h-10 flex items-center justify-center rounded-full hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors ${(isUploading || pendingImage || editingMessageId) ? 'opacity-30 cursor-not-allowed' : ''}`}
            >
              <Plus size={22} />
            </button>
          </div>
          <div className="flex-1 relative flex items-center">
            {isRecording ? (
              <div className="w-full bg-zinc-900 dark:bg-zinc-800 text-white rounded-full py-2.5 pl-4 pr-2 flex items-center justify-between font-medium shadow-lg animate-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-center gap-3">
                   <div className="flex items-center gap-1 h-4">
                      {[1, 2, 3, 4, 5, 6].map(i => (
                        <div 
                          key={i} 
                          className={`w-0.5 bg-[#E5FF66] rounded-full transition-all duration-300 ${isPaused ? 'h-1.5' : 'animate-wave'}`} 
                          style={{ animationDelay: `${i * 0.1}s`, height: isPaused ? '6px' : undefined }}
                        />
                      ))}
                   </div>
                   <span className="text-[13px] font-black tracking-tight w-12 tabular-nums">{formatTime(recordingTime)}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <button 
                    type="button" 
                    onClick={isPaused ? resumeRecording : pauseRecording}
                    className="h-9 px-4 rounded-full bg-white/10 hover:bg-white/20 transition-all text-xs font-black uppercase tracking-wider flex items-center justify-center border border-white/5"
                  >
                    {isPaused ? "Resume" : "Pause"}
                  </button>
                  <button 
                    type="button" 
                    onClick={stopRecording}
                    className="h-9 w-9 rounded-full bg-[#E5FF66] text-black flex items-center justify-center shadow-[0_0_20px_rgba(229,255,102,0.4)] active:scale-90 transition-all"
                  >
                    <Send size={16} strokeWidth={3} />
                  </button>
                </div>
              </div>
            ) : (
              <>
                <input 
                  type="text" 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={pendingImage ? "Add a caption..." : editingMessageId ? "Edit your message..." : "Type a message..."} 
                  className="w-full bg-zinc-100 dark:bg-zinc-900 rounded-full py-3.5 pl-5 pr-12 outline-none text-[15px] font-bold text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:ring-2 focus:ring-[#E5FF66]/30 transition-all border-none" 
                />
                <button 
                  type="button" 
                  onClick={() => setShowEmojis(!showEmojis)}
                  className="absolute right-2.5 w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                >
                  <Smile size={20} className={showEmojis ? "text-zinc-800 dark:text-white" : ""} />
                </button>
              </>
            )}
          </div>
          <button 
            type={isRecording ? "button" : (inputText.trim() || pendingImage ? "submit" : "button")}
            onClick={!inputText.trim() && !pendingImage ? (isRecording ? stopRecording : startRecording) : undefined}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shrink-0 ${
              inputText.trim() || pendingImage
                ? "bg-zinc-900 dark:bg-white text-[#E5FF66] dark:text-zinc-900 shadow-xl scale-105 active:scale-95" 
                : isRecording
                  ? "bg-red-500 text-white shadow-[0_4px_15px_rgba(239,68,68,0.3)] animate-pulse"
                  : "bg-zinc-100 dark:bg-zinc-900 text-zinc-400 dark:text-zinc-600 hover:bg-zinc-200 dark:hover:bg-zinc-800"
            }`}
          >
            {isUploading ? <Loader2 className="w-5 h-5 animate-spin text-[#E5FF66]" /> : (inputText.trim() || pendingImage ? <Send size={20} strokeWidth={3} /> : <Mic size={20} strokeWidth={isRecording ? 3 : 2} />)}
          </button>
          
          {pendingImage && (
            <button
               type="button"
               onClick={() => setIsViewOnceEnabled(!isViewOnceEnabled)}
               className={`absolute bottom-full right-4 mb-16 w-11 h-11 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 z-50 border ${
                 isViewOnceEnabled 
                   ? 'bg-[#E5FF66] text-black border-[#E5FF66] scale-110 shadow-[0_0_25px_rgba(229,255,102,0.5)]' 
                   : 'bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl text-zinc-500 border-zinc-100 dark:border-zinc-800'
               }`}
            >
               <div className={`relative w-6 h-6 rounded-full border-2 flex items-center justify-center text-[11px] font-black transition-colors ${isViewOnceEnabled ? 'border-black' : 'border-zinc-400'}`}>
                 1
               </div>
               {!isViewOnceEnabled && <span className="absolute top-11 text-[9px] font-black uppercase tracking-widest text-zinc-400 whitespace-nowrap">View Once</span>}
            </button>
          )}
        </form>
      </div>

      {/* Full Screen Image Viewer Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center animate-in fade-in duration-300"
          onClick={() => setSelectedImage(null)}
        >
          <div className="absolute top-0 w-full p-4 flex items-center justify-between z-10">
            <button 
              onClick={() => setSelectedImage(null)}
              className="w-12 h-12 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-all backdrop-blur-md border border-white/10"
            >
              <ChevronLeft size={28} />
            </button>
            <div className="text-white text-center">
               <div className="font-black text-sm tracking-tight uppercase tracking-[0.2em]">{partner?.full_name || "Shared Photo"}</div>
            </div>
            <div className="w-12 h-12" /> {/* Spacer */}
          </div>
          <div className="w-full h-full flex flex-col items-center justify-center p-4">
             <img 
               src={selectedImage} 
               alt="Full view" 
               className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl border border-white/5 active:scale-105 transition-transform" 
             />
          </div>
        </div>
      )}
    </div>
  );
}
