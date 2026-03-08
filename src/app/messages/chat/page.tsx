"use client";

import { ChevronLeft, MoreVertical, Phone, Video, Send, Mic, Image as ImageIcon, Smile, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const messages = [
  {
    id: 1,
    text: "Hey! Are you coming for the GST tutorial tomorrow?",
    sender: "them",
    time: "12:30 PM",
  },
  {
    id: 2,
    text: "Yeah, definitely. What time is it starting?",
    sender: "me",
    time: "12:32 PM",
  },
  {
    id: 3,
    text: "The class rep said 10:00 AM sharp at the Faculty of Science lecture theatre area.",
    sender: "them",
    time: "12:33 PM",
  },
  {
    id: 4,
    text: "Abeg, tell him to make it 10:30. You know how traffic is on Monday morning.",
    sender: "me",
    time: "12:35 PM",
  },
  {
    id: 5,
    text: "Lol, you know that man. He doesn't wait for anyone! Just try to leave early.",
    sender: "them",
    time: "12:36 PM",
  },
  {
    id: 6,
    text: "Omo, I'll try my best. Thanks for the heads up!",
    sender: "me",
    time: "12:38 PM",
  },
  {
    id: 7,
    text: "No p. See ya!",
    sender: "them",
    time: "12:40 PM",
  },
];

export default function ChatDetailPage() {
  const [inputText, setInputText] = useState("");

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
                  src="/dummy/nigerian_avatar_2_1772720155980.png" 
                  alt="Chidi Obi" 
                  width={44} 
                  height={44} 
                  className="object-cover w-full h-full" 
                />
              </div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#4ADE80] rounded-full border-2 border-white"></div>
            </div>
            <div>
              <h3 className="font-bold text-[15px] text-zinc-900 leading-tight">Chidi Obi</h3>
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

      {/* Messages Area - Only this part scrolls */}
      <div className="flex-1 overflow-y-auto px-4 py-8 flex flex-col gap-6 scrollbar-hide">
        <div className="flex justify-center mb-4">
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 bg-zinc-100 px-3 py-1 rounded-full">Today</span>
        </div>
        
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"} items-end gap-2`}
          >
            {msg.sender === "them" && (
              <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 mb-1">
                <Image 
                  src="/dummy/nigerian_avatar_2_1772720155980.png" 
                  alt="Avatar" 
                  width={32} 
                  height={32} 
                  className="object-cover w-full h-full" 
                />
              </div>
            )}
            <div 
              className={`max-w-[78%] px-4 py-3 rounded-[22px] text-[14px] leading-relaxed shadow-sm ${
                msg.sender === "me" 
                  ? "bg-zinc-900 text-white rounded-br-none" 
                  : "bg-white text-zinc-800 rounded-bl-none border border-zinc-100/50"
              }`}
            >
              <p>{msg.text}</p>
              <span className={`block text-[9px] mt-1.5 font-medium ${msg.sender === "me" ? "text-zinc-400 text-right" : "text-zinc-400"}`}>
                {msg.time}
              </span>
            </div>
          </div>
        ))}
        {/* Extra padding to prevent last message from being hidden by input bar */}
        <div className="h-4"></div>
      </div>

      {/* Chat Input Area - Fixed at bottom */}
      <div className="sticky bottom-0 flex-none p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] bg-white border-t border-zinc-100 z-30">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-zinc-400">
            <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-zinc-50 transition-colors">
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
            <button className="absolute right-2.5 w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-zinc-600 transition-colors">
              <Smile size={20} />
            </button>
          </div>
          <button 
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
              inputText.trim() 
                ? "bg-zinc-900 text-[#E5FF66] shadow-[0_4px_15px_rgba(0,0,0,0.15)] scale-105" 
                : "bg-zinc-100 text-zinc-400"
            }`}
          >
            {inputText.trim() ? <Send size={20} strokeWidth={2.5} /> : <Mic size={20} />}
          </button>
      </div>
    </div>
    </div>
  );
}
