"use client";

import { Home, MessageSquare, Plus, Film, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNavigation() {
  const pathname = usePathname();

  const isHome = pathname === "/";
  const isMessages = pathname === "/messages";
  const isProfile = pathname === "/profile";

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-zinc-100 z-50 pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-between w-full px-8 h-[68px]">
        
        {/* Home */}
        <Link 
          href="/" 
          className={`flex flex-col items-center justify-center gap-1.5 w-12 transition ${isHome ? "text-black" : "text-zinc-400 hover:text-black"}`}
        >
          <Home size={24} strokeWidth={isHome ? 2.5 : 2} />
          {isHome && <div className="h-1 w-1 rounded-full bg-black"></div>}
        </Link>

        {/* Messages */}
        <Link 
          href="/messages" 
          className={`flex flex-col items-center justify-center gap-1.5 w-12 transition ${isMessages ? "text-black" : "text-zinc-400 hover:text-black"}`}
        >
          <MessageSquare size={24} strokeWidth={isMessages ? 2.5 : 2} />
          {isMessages && <div className="h-1 w-1 rounded-full bg-black"></div>}
        </Link>

        {/* Create Post (Center FAB) - Just a button for now */}
        <button className="flex items-center justify-center w-14 h-10 rounded-2xl bg-[#E5FF66] text-black hover:bg-[#d4f936] transition shadow-sm mb-1 z-10">
          <Plus size={24} strokeWidth={2.5} />
        </button>

        {/* Video - Placeholder for now */}
        <button className="flex flex-col items-center justify-center gap-1.5 w-12 text-zinc-400 hover:text-black transition">
          <Film size={24} strokeWidth={2} />
        </button>

        {/* Profile */}
        <Link 
          href="/profile" 
          className={`flex flex-col items-center justify-center gap-1.5 w-12 transition ${isProfile ? "text-black" : "text-zinc-400 hover:text-black"}`}
        >
          <User size={24} strokeWidth={isProfile ? 2.5 : 2} />
          {isProfile && <div className="h-1 w-1 rounded-full bg-black"></div>}
        </Link>
      </div>
    </div>
  );
}
