"use client";

import { Search, MoreVertical, Edit, Circle } from "lucide-react";
import Image from "next/image";
import BottomNavigation from "@/components/BottomNavigation";

const chats = [
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
  return (
    <div className="min-h-screen bg-white pb-[100px] max-w-md mx-auto relative font-sans">
      {/* Header */}
      <div className="px-6 pt-8 pb-4 flex items-center justify-between sticky top-0 bg-white z-20">
        <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
        <div className="flex gap-2">
          <button className="w-10 h-10 flex items-center justify-center rounded-full bg-zinc-100 hover:bg-zinc-200 transition">
            <Edit size={20} className="text-zinc-800" />
          </button>
          <button className="w-10 h-10 flex items-center justify-center rounded-full bg-zinc-100 hover:bg-zinc-200 transition">
            <MoreVertical size={20} className="text-zinc-800" />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-6 mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search messages..." 
            className="w-full bg-zinc-100 rounded-2xl py-3.5 pl-12 pr-4 outline-none placeholder:text-zinc-400 font-medium text-sm focus:ring-2 focus:ring-[#E5FF66]/50 transition"
          />
        </div>
      </div>

      {/* Active Users Horizontal Scroll */}
      <div className="mb-8">
        <h2 className="px-6 text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4">Active Now</h2>
        <div className="flex gap-4 overflow-x-auto px-6 scrollbar-hide py-2">
          {activeUsers.map((user) => (
            <div key={user.id} className="flex flex-col items-center gap-2 shrink-0">
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl ring-2 ring-[#E5FF66] ring-offset-2 overflow-hidden">
                  <Image src={user.image} alt={user.name} width={56} height={56} className="object-cover w-full h-full" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#4ADE80] rounded-full border-2 border-white"></div>
              </div>
              <span className="text-[11px] font-bold text-zinc-600">{user.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Chat List */}
      <div className="px-6 flex flex-col gap-2">
        <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Recent Chats</h2>
        {chats.map((chat) => (
          <div key={chat.id} className="flex items-center gap-4 py-3 hover:bg-zinc-50 rounded-2xl transition overflow-hidden group">
            <div className="relative shrink-0">
              <div className="w-16 h-16 rounded-2xl overflow-hidden bg-zinc-100 group-hover:scale-95 transition-transform">
                <Image src={chat.avatar} alt={chat.name} width={64} height={64} className="object-cover w-full h-full" />
              </div>
              {chat.online && (
                <div className="absolute top-0 right-0 w-3 h-3 bg-[#4ADE80] rounded-full border-2 border-white"></div>
              )}
            </div>
            
            <div className="flex-1 min-w-0 pr-2">
              <div className="flex justify-between items-center mb-1">
                <h3 className="font-bold text-zinc-900 truncate">{chat.name}</h3>
                <span className="text-[11px] font-medium text-zinc-400">{chat.time}</span>
              </div>
              <div className="flex justify-between items-center">
                <p className={`text-sm truncate pr-4 ${chat.unread > 0 ? "text-zinc-900 font-bold" : "text-zinc-500 font-medium"}`}>
                  {chat.lastMessage}
                </p>
                {chat.unread > 0 && (
                  <div className="w-5 h-5 bg-[#E5FF66] rounded-full flex items-center justify-center shrink-0">
                    <span className="text-[10px] font-bold text-black">{chat.unread}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <BottomNavigation />
    </div>
  );
}
