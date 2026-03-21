"use client";

import { Home, MessageSquare, Plus, Search, User, BookOpen } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNavigation() {
  const pathname = usePathname();

  const isHome = pathname === "/";
  const isMessages = pathname === "/messages";
  const isProfile = pathname === "/profile";
  const isSearch = pathname === "/search";
  const isGroups = pathname === "/groups";

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white/80 backdrop-blur-xl border-t border-zinc-100/50 z-50 pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-between w-full px-6 h-[72px]">
        
        {/* Home */}
        <Link 
          href="/" 
          className={`flex flex-col items-center justify-center gap-1.5 w-12 transition-all duration-300 ${isHome ? "text-zinc-900 scale-110" : "text-zinc-400 hover:text-zinc-600"}`}
        >
          <Home size={22} strokeWidth={isHome ? 2.5 : 2} />
          <div className={`h-1 w-1 rounded-full bg-zinc-900 transition-all duration-300 ${isHome ? "opacity-100 scale-100" : "opacity-0 scale-0"}`}></div>
        </Link>

        {/* Search */}
        <Link 
          href="/search" 
          className={`flex flex-col items-center justify-center gap-1.5 w-12 transition-all duration-300 ${isSearch ? "text-zinc-900 scale-110" : "text-zinc-400 hover:text-zinc-600"}`}
        >
          <Search size={22} strokeWidth={isSearch ? 2.5 : 2} />
          <div className={`h-1 w-1 rounded-full bg-zinc-900 transition-all duration-300 ${isSearch ? "opacity-100 scale-100" : "opacity-0 scale-0"}`}></div>
        </Link>

        {/* Groups */}
        <Link 
          href="/groups" 
          className={`flex flex-col items-center justify-center gap-1.5 w-12 transition-all duration-300 ${isGroups ? "text-zinc-900 scale-110" : "text-zinc-400 hover:text-zinc-600"}`}
        >
          <BookOpen size={22} strokeWidth={isGroups ? 2.5 : 2} />
          <div className={`h-1 w-1 rounded-full bg-zinc-900 transition-all duration-300 ${isGroups ? "opacity-100 scale-100" : "opacity-0 scale-0"}`}></div>
        </Link>

        {/* Center Action Button */}
        <Link 
          href="/create"
          className="flex items-center justify-center w-14 h-11 rounded-2xl bg-[#E5FF66] text-black shadow-[0_4px_15px_rgba(229,255,102,0.4)] hover:bg-[#d4f936] active:scale-90 transition-all mb-4"
        >
          <Plus size={24} strokeWidth={3} />
        </Link>

        {/* Messages */}
        <Link 
          href="/messages" 
          className={`flex flex-col items-center justify-center gap-1.5 w-12 transition-all duration-300 ${isMessages ? "text-zinc-900 scale-110" : "text-zinc-400 hover:text-zinc-600"}`}
        >
          <MessageSquare size={22} strokeWidth={isMessages ? 2.5 : 2} />
          <div className={`h-1 w-1 rounded-full bg-zinc-900 transition-all duration-300 ${isMessages ? "opacity-100 scale-100" : "opacity-0 scale-0"}`}></div>
        </Link>
        
        {/* Profile */}
        <Link 
          href="/profile" 
          className={`flex flex-col items-center justify-center gap-1.5 w-12 transition-all duration-300 ${isProfile ? "text-zinc-900 scale-110" : "text-zinc-400 hover:text-zinc-600"}`}
        >
          <User size={22} strokeWidth={isProfile ? 2.5 : 2} />
          <div className={`h-1 w-1 rounded-full bg-zinc-900 transition-all duration-300 ${isProfile ? "opacity-100 scale-100" : "opacity-0 scale-0"}`}></div>
        </Link>
      </div>
    </div>
  );
}
