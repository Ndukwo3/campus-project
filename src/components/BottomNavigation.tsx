"use client";

import { Home, MessageSquare, Plus, Search, User, BookOpen } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export default function BottomNavigation() {
  const pathname = usePathname();
  const supabase = createClient();
  const queryClient = useQueryClient();

  // 🏛️ The "Instant-Alert" Engine
  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['unread-messages'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) return 0;

      // 🛡️ Proactive Filter: only count messages from user's own conversations
      // This prevents "ghost" badges for new users from unconfigured RLS
      const { data: convs } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', user.id);
      
      if (!convs || convs.length === 0) return 0;
      const conversationIds = convs.map((c: any) => c.conversation_id);

      // Fetch unread messages NOT from this user within those conversations
      const { count, error } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .in('conversation_id', conversationIds)
        .eq('is_read', false)
        .neq('sender_id', user.id);

      if (error) {
        console.error("Unread count error:", error);
        return 0;
      }
      return count || 0;
    },
    refetchInterval: 30000, 
  });

  // 🛰️ Real-time Listener for the badge
  useEffect(() => {
    const channel = supabase.channel('unread-badge')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => {
        queryClient.invalidateQueries({ queryKey: ['unread-messages'] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, queryClient]);

  const isHome = pathname === "/";
  const isMessages = pathname === "/messages";
  const isProfile = pathname === "/profile";
  const isSearch = pathname === "/search";
  const isUnivas = pathname === "/univas";

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white/80 dark:bg-black/80 backdrop-blur-xl border-t border-zinc-100/50 dark:border-zinc-800/50 z-50 pb-[env(safe-area-inset-bottom)] transition-colors">
      <div className="flex items-center justify-between w-full px-4 h-[84px]">
        
        {/* Home/Feed */}
        <Link 
          href="/" 
          prefetch={true}
          className={`flex flex-col items-center justify-center gap-1 w-14 transition-all duration-300 ${isHome ? "text-zinc-900 dark:text-zinc-100 scale-105" : "text-zinc-400 hover:text-zinc-600"}`}
        >
          <Home size={20} strokeWidth={isHome ? 2.5 : 2} />
          <span className={`text-[9px] font-black uppercase tracking-tight transition-all duration-300 ${isHome ? "opacity-100" : "opacity-60"}`}>Feed</span>
          <div className={`h-1 w-1 rounded-full bg-zinc-900 dark:bg-zinc-100 transition-all duration-300 ${isHome ? "opacity-100 scale-100" : "opacity-0 scale-0"}`}></div>
        </Link>

        {/* Search */}
        <Link 
          href="/search" 
          prefetch={true}
          className={`flex flex-col items-center justify-center gap-1 w-14 transition-all duration-300 ${isSearch ? "text-zinc-900 dark:text-zinc-100 scale-105" : "text-zinc-400 hover:text-zinc-600"}`}
        >
          <Search size={20} strokeWidth={isSearch ? 2.5 : 2} />
          <span className={`text-[9px] font-black uppercase tracking-tight transition-all duration-300 ${isSearch ? "opacity-100" : "opacity-60"}`}>Search</span>
          <div className={`h-1 w-1 rounded-full bg-zinc-900 dark:bg-zinc-100 transition-all duration-300 ${isSearch ? "opacity-100 scale-100" : "opacity-0 scale-0"}`}></div>
        </Link>

        {/* Univas */}
        <Link 
          href="/univas" 
          prefetch={true}
          className={`flex flex-col items-center justify-center gap-1 w-14 transition-all duration-300 ${isUnivas ? "text-zinc-900 dark:text-zinc-100 scale-105" : "text-zinc-400 hover:text-zinc-600"}`}
        >
          <BookOpen size={20} strokeWidth={isUnivas ? 2.5 : 2} />
          <span className={`text-[9px] font-black uppercase tracking-tight transition-all duration-300 ${isUnivas ? "opacity-100" : "opacity-60"}`}>Univas</span>
          <div className={`h-1 w-1 rounded-full bg-zinc-900 dark:bg-zinc-100 transition-all duration-300 ${isUnivas ? "opacity-100 scale-100" : "opacity-0 scale-0"}`}></div>
        </Link>

        {/* Messages/Chat */}
        <Link 
          href="/messages" 
          prefetch={true}
          className={`flex flex-col items-center justify-center gap-1 w-14 transition-all duration-300 relative ${isMessages ? "text-zinc-900 dark:text-zinc-100 scale-105" : "text-zinc-400 hover:text-zinc-600"}`}
        >
          <div className="relative">
            <MessageSquare size={20} strokeWidth={isMessages ? 2.5 : 2} />
            {unreadCount > 0 && (
              <div className="absolute -top-1.5 -right-1.5 min-w-[16px] h-[16px] px-1 bg-black dark:bg-zinc-100 rounded-full flex items-center justify-center border-2 border-white dark:border-black animate-in zoom-in duration-300">
                <span className="text-[8px] font-black text-[#E5FF66] dark:text-black leading-none">{unreadCount}</span>
              </div>
            )}
          </div>
          <span className={`text-[9px] font-black uppercase tracking-tight transition-all duration-300 ${isMessages ? "opacity-100" : "opacity-60"}`}>Chat</span>
          <div className={`h-1 w-1 rounded-full bg-zinc-900 dark:bg-zinc-100 transition-all duration-300 ${isMessages ? "opacity-100 scale-100" : "opacity-0 scale-0"}`}></div>
        </Link>
        
        {/* Profile */}
        <Link 
          href="/profile" 
          prefetch={true}
          className={`flex flex-col items-center justify-center gap-1 w-14 transition-all duration-300 ${isProfile ? "text-zinc-900 dark:text-zinc-100 scale-105" : "text-zinc-400 hover:text-zinc-600"}`}
        >
          <User size={20} strokeWidth={isProfile ? 2.5 : 2} />
          <span className={`text-[9px] font-black uppercase tracking-tight transition-all duration-300 ${isProfile ? "opacity-100" : "opacity-60"}`}>Profile</span>
          <div className={`h-1 w-1 rounded-full bg-zinc-900 dark:bg-zinc-100 transition-all duration-300 ${isProfile ? "opacity-100 scale-100" : "opacity-0 scale-0"}`}></div>
        </Link>
      </div>
    </div>
  );
}
