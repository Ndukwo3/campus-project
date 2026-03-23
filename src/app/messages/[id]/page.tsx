"use client";

import { ChevronLeft, MoreVertical, Send, Mic, Smile, Plus, Loader2, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef, use } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

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

  const commonEmojis = ['😂', '❤️', '🔥', '👍', '😊', '😍', '😭', '🥺', '🙏', '✨', '💯', '👏', '👀', '🙌', '🎉'];
  const [partner, setPartner] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [pendingImage, setPendingImage] = useState<{ file: File, preview: string } | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    async function initChat() {
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
           setMessages(history);
           
           // Mark unread messages from partner as read
           const unreadIds = history.filter(m => !m.is_read && m.sender_id !== authUser.id).map(m => m.id);
           if (unreadIds.length > 0) {
              await supabase.from('messages').update({ is_read: true }).in('id', unreadIds);
           }
        }
      }
      setIsLoading(false);
      setTimeout(scrollToBottom, 100);
    }

    initChat();
  }, [conversationId, supabase, router]);

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
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          // Verify conversation ID in the callback for better reliability
          if (payload.new.conversation_id === conversationId && payload.new.sender_id !== user.id) {
            setMessages((prev) => {
              if (prev.find(m => m.id === payload.new.id)) return prev;
              const newMsgs = [...prev, payload.new];
              return newMsgs;
            });
            setTimeout(scrollToBottom, 50);
            supabase.from('messages').update({ is_read: true }).eq('id', payload.new.id);
          }
        }
      )
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ user_id: user.id, isTyping: false });
        }
      });

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
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
      alert("Please allow microphone access to record voice notes.");
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
    
    // If there is a caption, we send it as a separate or combined message
    // For now let's combine if possible or just send caption after
    const newMessage = {
      conversation_id: conversationId,
      sender_id: user.id,
      content: `[IMAGE]${imageUrl}${caption ? `\n\n${caption}` : ""}`,
    };

    const tempId = Math.random().toString();
    const optimisticMsg = { ...newMessage, id: tempId, created_at: new Date().toISOString() };
    setMessages((prev) => [...prev, optimisticMsg]);

    const { data, error } = await supabase.from('messages').insert(newMessage).select().single();
    if (error) setMessages((prev) => prev.filter(m => m.id !== tempId));
    else if (data) setMessages((prev) => prev.map(m => m.id === tempId ? data : m));
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !user || !conversationId) return;

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
    <div className="flex flex-col h-dvh bg-[#F8F9FA] max-w-md mx-auto relative font-sans overflow-hidden overscroll-none">
      {/* Premium Chat Header */}
      <div className="sticky top-0 flex-none bg-white/90 backdrop-blur-xl border-b border-zinc-100/80 px-4 py-4 flex items-center justify-between shadow-sm z-30">
        <div className="flex items-center gap-3">
          <Link href="/messages" className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-zinc-100 transition-colors">
            <ChevronLeft size={24} className="text-zinc-800" />
          </Link>
          <div className="flex items-center gap-3">
            <Link href={partner?.id ? `/profile/${partner.id}` : '#'} className="relative cursor-pointer transition active:scale-95 block">
              <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-[#E5FF66] bg-zinc-100 flex items-center justify-center">
                {partner?.avatar_url ? (
                  <Image 
                    src={partner.avatar_url} 
                    alt={partner.full_name || "User"} 
                    width={44} 
                    height={44} 
                    className="object-cover w-full h-full" 
                  />
                ) : (
                  <User className="w-6 h-6 text-zinc-400" />
                )}
              </div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#4ADE80] rounded-full border-2 border-white"></div>
            </Link>
            <div>
              <Link href={partner?.id ? `/profile/${partner.id}` : '#'} className="font-bold text-[15px] text-zinc-900 leading-tight hover:underline cursor-pointer block">
                {partner?.full_name || partner?.username || "Loading..."}
              </Link>
              <p className={`text-[11px] font-medium transition-colors ${partnerIsTyping ? "text-primary" : "text-[#4ADE80]"}`}>
                {partnerIsTyping ? "Typing..." : "Online"}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 text-zinc-600 relative">
          <MoreVertical 
            size={20} 
            className="hover:text-zinc-900 cursor-pointer" 
            onClick={() => setShowDropdown(!showDropdown)}
          />
          
          {showDropdown && (
            <div className="absolute top-8 right-0 w-48 bg-white rounded-2xl shadow-xl border border-zinc-100 py-2 z-50">
              <Link href={partner?.id ? `/profile/${partner.id}` : '#'} className="w-full text-left px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 block">View Profile</Link>
              <button className="w-full text-left px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 block">Mute Notifications</button>
              <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 block">Block User</button>
            </div>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-8 flex flex-col gap-6 scrollbar-hide">
        <div className="flex justify-center mb-4">
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 bg-zinc-100 px-3 py-1 rounded-full">Conversation Started</span>
        </div>
        
        {messages.map((msg) => {
          const isMe = msg.sender_id === user?.id;
          const isImage = msg.content.startsWith('[IMAGE]');
          return (
            <div 
              key={msg.id} 
              className={`flex ${isMe ? "justify-end" : "justify-start"} items-end gap-2`}
            >
              {!isMe && (
                <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 mb-1 bg-zinc-100 flex items-center justify-center">
                  {partner?.avatar_url ? (
                    <Image 
                      src={partner.avatar_url} 
                      alt="Avatar" 
                      width={32} 
                      height={32} 
                      className="object-cover w-full h-full" 
                    />
                  ) : (
                    <User className="w-5 h-5 text-zinc-400" />
                  )}
                </div>
              )}
              
              <div 
                className={`max-w-[82%] rounded-[22px] transition-all overflow-hidden ${
                  isImage ? "shadow-md active:scale-[0.98] cursor-pointer" : "shadow-sm px-4 py-3"
                } ${
                  isMe 
                    ? isImage ? "" : "bg-zinc-900 text-white rounded-br-none" 
                    : isImage ? "" : "bg-white text-zinc-800 rounded-bl-none border border-zinc-100/50"
                }`}
              >
                {msg.content.startsWith('[VOICE_NOTE]') ? (
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Mic size={14} className={isMe ? "text-[#E5FF66]" : "text-zinc-500"} />
                      <span className="font-semibold text-xs tracking-wide">Voice Note</span>
                    </div>
                    <audio 
                      src={msg.content.replace('[VOICE_NOTE]', '')} 
                      controls 
                      controlsList="nodownload"
                      onContextMenu={(e) => e.preventDefault()}
                      className={`h-8 w-48 custom-audio ${isMe ? 'invert' : ''}`}
                    />
                  </div>
                ) : isImage ? (
                   <div 
                     onClick={() => setSelectedImage(msg.content.replace('[IMAGE]', ''))}
                     className="relative bg-zinc-100 flex items-center justify-center"
                   >
                      <img 
                        src={msg.content.replace('[IMAGE]', '').split('\n\n')[0]} 
                        alt="Shared image" 
                        className="w-full h-auto max-h-[220px] object-cover" 
                      />
                      {msg.content.split('\n\n')[1] && (
                        <div className={`p-4 text-[14px] leading-relaxed ${isMe ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-800 border-t border-zinc-100'}`}>
                           {msg.content.split('\n\n')[1]}
                        </div>
                      )}
                      <div className="absolute bottom-2 right-3">
                         <span className="text-[9px] font-bold text-white/90 drop-shadow-md bg-black/20 px-1.5 py-0.5 rounded-full backdrop-blur-sm">
                           {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                         </span>
                      </div>
                   </div>
                ) : (
                  <>
                    <p>{msg.content}</p>
                    <span className={`block text-[9px] mt-1.5 font-medium ${isMe ? "text-zinc-400 text-right" : "text-zinc-400"}`}>
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </>
                )}
              </div>
            </div>
          );
        })}
        {partnerIsTyping && (
           <div className="flex justify-start items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-300">
             <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center shrink-0">
               <User className="w-4 h-4 text-zinc-400" />
             </div>
             <div className="bg-white px-4 py-2 rounded-2xl rounded-bl-none shadow-sm border border-zinc-100 flex items-center gap-1.5">
               <div className="w-1.5 h-1.5 bg-zinc-300 rounded-full animate-bounce [animation-delay:-0.3s]" />
               <div className="w-1.5 h-1.5 bg-zinc-300 rounded-full animate-bounce [animation-delay:-0.15s]" />
               <div className="w-1.5 h-1.5 bg-zinc-300 rounded-full animate-bounce" />
             </div>
           </div>
        )}
        <div ref={messagesEndRef} className="h-4" />
      </div>

      {/* Chat Input Area */}
      <div className="sticky bottom-0 flex-none bg-white border-t border-zinc-100 z-30">
        {/* Pending Image Preview */}
        {pendingImage && (
          <div className="absolute bottom-full left-4 right-4 mb-4 p-2 bg-white rounded-2xl shadow-xl border border-zinc-100 animate-in slide-in-from-bottom-4 duration-300">
             <div className="relative rounded-xl overflow-hidden aspect-video bg-zinc-50 border border-zinc-100">
               <img src={pendingImage.preview} alt="Upload preview" className="w-full h-full object-contain" />
               <button 
                 onClick={() => setPendingImage(null)}
                 className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md hover:bg-black/80 transition-all shadow-lg active:scale-95"
               >
                 <span className="text-xl leading-none">&times;</span>
               </button>
             </div>
             <div className="mt-2 text-[11px] font-bold text-zinc-400 px-1 uppercase tracking-tight">Ready to send</div>
          </div>
        )}

        {showEmojis && (
           <div className="absolute bottom-full left-4 right-16 mb-2 bg-white border border-zinc-100 shadow-[0_-10px_40px_rgba(0,0,0,0.08)] rounded-2xl p-3 grid grid-cols-5 gap-2 z-40 transform origin-bottom-right transition-all">
             {commonEmojis.map(emoji => (
               <button 
                 key={emoji} 
                 type="button" 
                 onClick={() => { setInputText(prev => prev + emoji); setShowEmojis(false); }}
                 className="text-2xl hover:bg-zinc-50 rounded-xl p-2 transition-colors flex items-center justify-center active:scale-90"
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
              disabled={isUploading || !!pendingImage}
              className={`w-10 h-10 flex items-center justify-center rounded-full hover:bg-zinc-50 transition-colors ${(isUploading || pendingImage) ? 'opacity-30 cursor-not-allowed' : ''}`}
            >
              <Plus size={22} />
            </button>
          </div>
          <div className="flex-1 relative flex items-center">
            {isRecording ? (
              <div className="w-full bg-zinc-900 text-white rounded-full py-2.5 pl-4 pr-2 flex items-center justify-between font-medium shadow-lg animate-in slide-in-from-bottom-2 duration-300">
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
                   <span className="text-[13px] font-bold tracking-tight w-12 tabular-nums">{formatTime(recordingTime)}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <button 
                    type="button" 
                    onClick={isPaused ? resumeRecording : pauseRecording}
                    className="h-9 px-4 rounded-full bg-white/10 hover:bg-white/20 transition-all text-xs font-bold uppercase tracking-wider flex items-center justify-center border border-white/5"
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
                  placeholder={pendingImage ? "Add a caption..." : "Type a message..."} 
                  className="w-full bg-zinc-100 rounded-full py-3.5 pl-5 pr-12 outline-none text-[15px] font-medium text-zinc-900 placeholder:text-zinc-400 focus:ring-2 focus:ring-[#E5FF66]/30 transition-all border-none" 
                />
                <button 
                  type="button" 
                  onClick={() => setShowEmojis(!showEmojis)}
                  className="absolute right-2.5 w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-zinc-600 transition-colors"
                >
                  <Smile size={20} className={showEmojis ? "text-zinc-800" : ""} />
                </button>
              </>
            )}
          </div>
          <button 
            type={isRecording ? "button" : (inputText.trim() || pendingImage ? "submit" : "button")}
            onClick={!inputText.trim() && !pendingImage ? (isRecording ? stopRecording : startRecording) : undefined}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shrink-0 ${
              inputText.trim() || pendingImage
                ? "bg-zinc-900 text-[#E5FF66] shadow-[0_4px_15px_rgba(0,0,0,0.15)] scale-105" 
                : isRecording
                  ? "bg-red-500 text-white shadow-[0_4px_15px_rgba(239,68,68,0.3)] animate-pulse"
                  : "bg-zinc-100 text-zinc-400 hover:bg-zinc-200"
            }`}
          >
            {isUploading ? <Loader2 className="w-5 h-5 animate-spin text-[#E5FF66]" /> : (inputText.trim() || pendingImage ? <Send size={20} strokeWidth={2.5} /> : <Mic size={20} strokeWidth={isRecording ? 2.5 : 2} />)}
          </button>
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
              className="w-12 h-12 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-all backdrop-blur-md"
            >
              <ChevronLeft size={28} />
            </button>
            <div className="text-white text-center">
               <div className="font-bold text-sm tracking-tight">{partner?.full_name || "Photo"}</div>
            </div>
            <div className="w-12 h-12" /> {/* Spacer */}
          </div>
          <div className="w-full h-full flex flex-col items-center justify-center p-4">
             <img 
               src={selectedImage} 
               alt="Full view" 
               className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl" 
             />
          </div>
        </div>
      )}
    </div>
  );
}
