"use client";

import { Search, MoreVertical, Edit, Plus, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import BottomNavigation from "@/components/BottomNavigation";
import { createClient } from "@/lib/supabase";

const mockChats = [
  {
    id: 1,
    name: "Chidi Obi",
    avatar: "/dummy/nigerian_avatar_2_1772720155980.png",
    lastMessage: "Are you coming for the GST tutorial tomorrow?",
    time: "12:30 PM",
    unread: 2,
    online: true,
  },
  {
    id: 2,
    name: "Ngozi Okafor",
    avatar: "/dummy/nigerian_avatar_4_1772720200827.png",
    lastMessage: "I just sent the notes to your email.",
    time: "11:45 AM",
    unread: 0,
    online: false,
  },
  {
    id: 3,
    name: "Ayo Balogun",
    avatar: "/dummy/nigerian_avatar_3_1772720174186.png",
    lastMessage: "Let's meet at the Faculty of Science.",
    time: "10:15 AM",
    unread: 0,
    online: true,
  },
  {
    id: 4,
    name: "Zainab Ibrahim",
    avatar: "/dummy/nigerian_avatar_6_1772720236907.png",
    lastMessage: "Happy Birthday bro! Have a blast 🎂",
    time: "Yesterday",
    unread: 0,
    online: true,
  },
  {
    id: 5,
    name: "Emeka John",
    avatar: "/dummy/nigerian_avatar_5_1772720218967.png",
    lastMessage: "Bro, did you see the result yet?",
    time: "Wednesday",
    unread: 1,
    online: false,
  },
];

const activeUsers = [
  { id: 1, name: "Ayo", image: "/dummy/nigerian_avatar_3_1772720174186.png" },
  { id: 2, name: "Ngozi", image: "/dummy/nigerian_avatar_4_1772720200827.png" },
  { id: 3, name: "Chidi", image: "/dummy/nigerian_avatar_2_1772720155980.png" },
  { id: 4, name: "Zainab", image: "/dummy/nigerian_avatar_6_1772720236907.png" },
  { id: 5, name: "Emeka", image: "/dummy/nigerian_avatar_5_1772720218967.png" },
];

export default function MessagesPage() {
  const supabase = createClient();
  const [chats, setChats] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchMessages() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      // Fetch latest messages for each conversation
      // This is a simplified query for MVP. Usually, a more robust join is needed.
      const { data: recentMessages, error } = await supabase
        .from('messages')
        .select(`
          id, content, created_at, is_read, sender_id, receiver_id,
          sender:sender_id (full_name, avatar_url, username),
          receiver:receiver_id (full_name, avatar_url, username)
        `)
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (recentMessages && recentMessages.length > 0) {
        // Group by conversation partner
        const conversationMap = new Map();
        recentMessages.forEach((msg: any) => {
          const partner = msg.sender_id === user.id ? msg.receiver : msg.sender;
          const partnerData = Array.isArray(partner) ? partner[0] : partner;
          const partnerId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
          
          if (!conversationMap.has(partnerId) && partnerData) {
            conversationMap.set(partnerId, {
              id: partnerId,
              name: partnerData.full_name || partnerData.username,
              avatar: partnerData.avatar_url || "/dummy/nigerian_avatar_2_1772720155980.png",
              lastMessage: msg.content,
              time: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              unread: msg.is_read ? 0 : (msg.receiver_id === user.id ? 1 : 0),
              online: true, // Placeholder online status
            });
          }
        });
        setChats(Array.from(conversationMap.values()));
      } else {
        setChats(mockChats); // Fallback to mock data if no messages
      }
      setIsLoading(false);
    }
    fetchMessages();
  }, [supabase]);

  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-[110px] max-w-md mx-auto relative font-sans">
      {/* Premium Header with Backdrop Blur */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-zinc-100/50">
        <div className="px-6 pt-10 pb-5 flex items-center justify-between">
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900">Messages</h1>
          <div className="flex gap-3">
            <button className="w-10 h-10 flex items-center justify-center rounded-2xl bg-zinc-50 border border-zinc-100 text-zinc-800 active:scale-95 transition-all">
              <Search size={20} />
            </button>
            <button className="w-10 h-10 flex items-center justify-center rounded-2xl bg-zinc-50 border border-zinc-100 text-zinc-800 active:scale-95 transition-all">
              <MoreVertical size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Active Users Section - Horizontal Scroll */}
      <div className="py-6 overflow-hidden">
        <div className="px-6 flex items-center justify-between mb-4">
          <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-zinc-400">Active Now</h2>
          <span className="w-2 h-2 bg-[#4ADE80] rounded-full animate-pulse"></span>
        </div>
        <div className="flex gap-5 overflow-x-auto px-6 pb-2 scrollbar-hide">
          {activeUsers.map((user) => (
            <div key={user.id} className="flex flex-col items-center gap-3 shrink-0 group">
              <div className="relative">
                <div className="w-16 h-16 rounded-full overflow-hidden p-[2.5px] bg-gradient-to-tr from-[#E5FF66] to-[#4ADE80] ring-1 ring-zinc-100/50">
                  <div className="w-full h-full rounded-full overflow-hidden bg-white">
                    <Image 
                      src={user.image} 
                      alt={user.name} 
                      width={64} 
                      height={64} 
                      className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110" 
                    />
                  </div>
                </div>
                <div className="absolute bottom-0 right-0 w-4.5 h-4.5 bg-[#4ADE80] rounded-full border-[3px] border-white shadow-sm"></div>
              </div>
              <span className="text-[11px] font-bold text-zinc-600 tracking-tight">{user.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Chat List Section */}
      <div className="px-5 mt-2">
        <div className="flex items-center justify-between mb-5 px-1">
          <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-zinc-400">Recent Chats</h2>
          <button className="text-[11px] font-bold text-[#222] bg-zinc-100 px-3 py-1 rounded-full active:scale-95 transition-all">Mark Read</button>
        </div>
        
        <div className="flex flex-col gap-1">
          {isLoading ? (
            <div className="flex justify-center p-20">
              <Loader2 className="w-8 h-8 animate-spin text-zinc-200" />
            </div>
          ) : chats.map((chat) => (
            <Link 
              key={chat.id} 
              href={`/messages/chat?id=${chat.id}`}
              className="flex items-center gap-4 p-3 rounded-[28px] hover:bg-white hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] active:scale-[0.98] transition-all cursor-pointer group"
            >
              <div className="relative shrink-0">
                <div className="w-[60px] h-[60px] rounded-full overflow-hidden bg-zinc-100 ring-4 ring-transparent group-hover:ring-[#E5FF66]/30 transition-all">
                  <Image 
                    src={chat.avatar} 
                    alt={chat.name} 
                    width={60} 
                    height={60} 
                    className="object-cover w-full h-full" 
                  />
                </div>
                {chat.online && (
                  <div className="absolute bottom-0 right-0 w-4 h-4 bg-[#4ADE80] rounded-full border-2 border-white shadow-sm"></div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-0.5">
                  <h3 className="font-bold text-[15px] text-zinc-900 truncate">{chat.name}</h3>
                  <span className={`text-[11px] font-medium ${chat.unread > 0 ? "text-zinc-900 font-bold" : "text-zinc-400"}`}>
                    {chat.time}
                  </span>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <p className={`text-[13.5px] truncate flex-1 ${chat.unread > 0 ? "text-zinc-900 font-semibold" : "text-zinc-500 font-medium"}`}>
                    {chat.lastMessage}
                  </p>
                  {chat.unread > 0 && (
                    <div className="min-w-[20px] h-5 px-1.5 bg-[#E5FF66] rounded-full flex items-center justify-center shrink-0 shadow-[0_2px_10px_rgba(229,255,102,0.4)]">
                      <span className="text-[10px] font-black text-black">{chat.unread}</span>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Floating Action Button */}
      <button className="fixed bottom-28 right-6 w-14 h-14 bg-zinc-900 text-[#E5FF66] rounded-2xl flex items-center justify-center shadow-2xl active:scale-90 transition-transform z-20">
        <Plus size={28} strokeWidth={2.5} />
      </button>

      <BottomNavigation />
    </div>
  );
}
