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
  const isCampus = pathname === "/campus";

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white/80 dark:bg-black/80 backdrop-blur-xl border-t border-zinc-100/50 dark:border-zinc-800/50 z-50 pb-[env(safe-area-inset-bottom)] transition-colors">
      <div className="flex items-center justify-between w-full px-6 h-[72px]">
        
        {/* Home */}
        <Link 
          href="/" 
          prefetch={true}
          className={`flex flex-col items-center justify-center gap-1.5 w-12 transition-all duration-300 ${isHome ? "text-zinc-900 dark:text-zinc-100 scale-110" : "text-zinc-400 hover:text-zinc-600"}`}
        >
          <Home size={22} strokeWidth={isHome ? 2.5 : 2} />
          <div className={`h-1 w-1 rounded-full bg-zinc-900 dark:bg-zinc-100 transition-all duration-300 ${isHome ? "opacity-100 scale-100" : "opacity-0 scale-0"}`}></div>
        </Link>

        {/* Search */}
        <Link 
          href="/search" 
          prefetch={true}
          className={`flex flex-col items-center justify-center gap-1.5 w-12 transition-all duration-300 ${isSearch ? "text-zinc-900 dark:text-zinc-100 scale-110" : "text-zinc-400 hover:text-zinc-600"}`}
        >
          <Search size={22} strokeWidth={isSearch ? 2.5 : 2} />
          <div className={`h-1 w-1 rounded-full bg-zinc-900 dark:bg-zinc-100 transition-all duration-300 ${isSearch ? "opacity-100 scale-100" : "opacity-0 scale-0"}`}></div>
        </Link>

        {/* Campus */}
        <Link 
          href="/campus" 
          prefetch={true}
          className={`flex flex-col items-center justify-center gap-1.5 w-12 transition-all duration-300 ${isCampus ? "text-zinc-900 dark:text-zinc-100 scale-110" : "text-zinc-400 hover:text-zinc-600"}`}
        >
          <BookOpen size={22} strokeWidth={isCampus ? 2.5 : 2} />
          <div className={`h-1 w-1 rounded-full bg-zinc-900 dark:bg-zinc-100 transition-all duration-300 ${isCampus ? "opacity-100 scale-100" : "opacity-0 scale-0"}`}></div>
        </Link>

        {/* Messages */}
        <Link 
          href="/messages" 
          prefetch={true}
          className={`flex flex-col items-center justify-center gap-1.5 w-12 transition-all duration-300 ${isMessages ? "text-zinc-900 dark:text-zinc-100 scale-110" : "text-zinc-400 hover:text-zinc-600"}`}
        >
          <MessageSquare size={22} strokeWidth={isMessages ? 2.5 : 2} />
          <div className={`h-1 w-1 rounded-full bg-zinc-900 dark:bg-zinc-100 transition-all duration-300 ${isMessages ? "opacity-100 scale-100" : "opacity-0 scale-0"}`}></div>
        </Link>
        
        {/* Profile */}
        <Link 
          href="/profile" 
          prefetch={true}
          className={`flex flex-col items-center justify-center gap-1.5 w-12 transition-all duration-300 ${isProfile ? "text-zinc-900 dark:text-zinc-100 scale-110" : "text-zinc-400 hover:text-zinc-600"}`}
        >
          <User size={22} strokeWidth={isProfile ? 2.5 : 2} />
          <div className={`h-1 w-1 rounded-full bg-zinc-900 dark:bg-zinc-100 transition-all duration-300 ${isProfile ? "opacity-100 scale-100" : "opacity-0 scale-0"}`}></div>
        </Link>
      </div>
    </div>
  );
}
