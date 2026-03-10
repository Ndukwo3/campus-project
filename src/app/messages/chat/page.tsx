"use client";

import { ChevronLeft, MoreVertical, Phone, Video, Send, Mic, Image as ImageIcon, Smile, Plus, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

function ChatContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const partnerId = searchParams.get("id");
  const supabase = createClient();
  
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [partner, setPartner] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

      if (partnerId) {
        // Fetch partner profile
        const { data: partnerData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', partnerId)
          .single();
        
        setPartner(partnerData);

        // Fetch message history
        const { data: history } = await supabase
          .from('messages')
          .select('*')
          .or(`and(sender_id.eq.${authUser.id},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${authUser.id})`)
          .order('created_at', { ascending: true });

        if (history) setMessages(history);
      }
      setIsLoading(false);
      setTimeout(scrollToBottom, 100);
    }

    initChat();
  }, [partnerId, supabase, router]);

  useEffect(() => {
    if (!user || !partnerId) return;

    // Real-time subscription
    const channel = supabase
      .channel('realtime_messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.new.sender_id === partnerId) {
            setMessages((prev) => [...prev, payload.new]);
            setTimeout(scrollToBottom, 50);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, partnerId, supabase]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !user || !partnerId) return;

    const newMessage = {
      sender_id: user.id,
      receiver_id: partnerId,
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
            <div className="relative">
              <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-[#E5FF66]">
                <Image 
                  src={partner?.avatar_url || "/dummy/nigerian_avatar_2_1772720155980.png"} 
                  alt={partner?.full_name || "User"} 
                  width={44} 
                  height={44} 
                  className="object-cover w-full h-full" 
                />
              </div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#4ADE80] rounded-full border-2 border-white"></div>
            </div>
            <div>
              <h3 className="font-bold text-[15px] text-zinc-900 leading-tight">
                {partner?.full_name || partner?.username || "Chidi Obi"}
              </h3>
              <p className="text-[11px] font-medium text-[#4ADE80]">Online</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 text-zinc-600">
          <Phone size={20} className="hover:text-zinc-900 cursor-pointer" />
          <Video size={20} className="hover:text-zinc-900 cursor-pointer" />
          <MoreVertical size={20} className="hover:text-zinc-900 cursor-pointer" />
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-8 flex flex-col gap-6 scrollbar-hide">
        <div className="flex justify-center mb-4">
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 bg-zinc-100 px-3 py-1 rounded-full">Conversation Started</span>
        </div>
        
        {messages.map((msg) => {
          const isMe = msg.sender_id === user?.id;
          return (
            <div 
              key={msg.id} 
              className={`flex ${isMe ? "justify-end" : "justify-start"} items-end gap-2`}
            >
              {!isMe && (
                <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 mb-1">
                  <Image 
                    src={partner?.avatar_url || "/dummy/nigerian_avatar_2_1772720155980.png"} 
                    alt="Avatar" 
                    width={32} 
                    height={32} 
                    className="object-cover w-full h-full" 
                  />
                </div>
              )}
              <div 
                className={`max-w-[78%] px-4 py-3 rounded-[22px] text-[14px] leading-relaxed shadow-sm ${
                  isMe 
                    ? "bg-zinc-900 text-white rounded-br-none" 
                    : "bg-white text-zinc-800 rounded-bl-none border border-zinc-100/50"
                }`}
              >
                <p>{msg.content}</p>
                <span className={`block text-[9px] mt-1.5 font-medium ${isMe ? "text-zinc-400 text-right" : "text-zinc-400"}`}>
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} className="h-4" />
      </div>

      {/* Chat Input Area */}
      <form 
        onSubmit={handleSendMessage}
        className="sticky bottom-0 flex-none p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] bg-white border-t border-zinc-100 z-30"
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-zinc-400">
            <button type="button" className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-zinc-50 transition-colors">
              <Plus size={22} />
            </button>
          </div>
          <div className="flex-1 relative flex items-center">
            <input 
              type="text" 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type a message..." 
              className="w-full bg-zinc-100 rounded-full py-3.5 pl-5 pr-12 outline-none text-sm font-medium placeholder:text-zinc-400 focus:ring-2 focus:ring-[#E5FF66]/30 transition-all border-none"
            />
            <button type="button" className="absolute right-2.5 w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-zinc-600 transition-colors">
              <Smile size={20} />
            </button>
          </div>
          <button 
            type="submit"
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
              inputText.trim() 
                ? "bg-zinc-900 text-[#E5FF66] shadow-[0_4px_15px_rgba(0,0,0,0.15)] scale-105" 
                : "bg-zinc-100 text-zinc-400"
            }`}
          >
            {inputText.trim() ? <Send size={20} strokeWidth={2.5} /> : <Mic size={20} />}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function ChatDetailPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col h-dvh bg-[#F8F9FA] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-900" />
      </div>
    }>
      <ChatContent />
    </Suspense>
  );
}
