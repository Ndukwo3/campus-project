"use client";

import { MessageSquare, Plus } from "lucide-react";
import Link from "next/link";
import ChatSidebar from "@/components/ChatSidebar";
import BottomNavigation from "@/components/BottomNavigation";

export default function MessagesPage() {
  return (
    <>
      {/* Mobile Only: Show the sidebar list directly here */}
      <div className="lg:hidden h-full">
        <ChatSidebar />
        <BottomNavigation />
      </div>

      {/* Desktop Only: Show the "Select a conversation" placeholder */}
      <div className="hidden lg:flex flex-col items-center justify-center w-full h-full bg-[#FDFDFD] dark:bg-black p-10 text-center animate-in fade-in duration-500">
        <div className="w-20 h-20 bg-zinc-50 dark:bg-zinc-900 rounded-full flex items-center justify-center mb-6 shadow-sm border border-zinc-100 dark:border-zinc-800">
          <MessageSquare size={36} className="text-zinc-300 dark:text-zinc-600" />
        </div>
        <h2 className="text-3xl font-black text-zinc-900 dark:text-zinc-100 mb-3 tracking-tight">Select a message</h2>
        <p className="text-[15px] font-medium text-zinc-500 dark:text-zinc-500 max-w-[320px] leading-relaxed">
          Choose from your existing conversations, or start a new one to connect with your peers.
        </p>
        <Link href="/search" className="mt-8 px-8 py-3.5 bg-black dark:bg-white text-white dark:text-black rounded-full font-black text-sm uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl">
          New chat
        </Link>
      </div>
    </>
  );
}
