"use client";

import { Home, MessageSquare, User, Bell, BookOpen, Plus, Settings, Search } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import AuthLogo from "./AuthLogo";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import { capitalizeName } from "@/lib/utils";
import Image from "next/image";

export default function DesktopSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function getUser() {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', authUser.id).single();
        setUser(profile);
      }
    }
    getUser();
  }, [supabase]);

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['unread-messages'],
    queryFn: async () => {
      if (!user) return 0;
      const { data: convs } = await supabase.from('conversation_participants').select('conversation_id').eq('user_id', user.id);
      if (!convs || convs.length === 0) return 0;
      const conversationIds = convs.map((c: any) => c.conversation_id);
      const { count } = await supabase.from('messages').select('*', { count: 'exact', head: true }).in('conversation_id', conversationIds).eq('is_read', false).neq('sender_id', user.id);
      return count || 0;
    },
    enabled: !!user,
  });

  const navItems = [
    { label: "Feed", href: "/", icon: Home },
    { label: "Library", href: "/library", icon: BookOpen },
    { label: "Messages", href: "/messages", icon: MessageSquare, badge: unreadCount },
    { label: "Activity", href: "/notifications", icon: Bell },
    { label: "Profile", href: "/profile", icon: User },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/search');
    }
  };

  return (
    <header className="hidden lg:block sticky top-0 z-50 w-full bg-white/80 dark:bg-[#0A0A0A]/80 backdrop-blur-xl border-b border-zinc-200/70 dark:border-zinc-800/70">
      <div className="max-w-[1440px] mx-auto px-6 h-16 flex items-center justify-between gap-6">
        {/* Left: Brand */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <AuthLogo />
        </Link>

        {/* Center: Floating Pill Navigation */}
        <nav className="flex items-center gap-1 bg-zinc-100/80 dark:bg-zinc-900/80 p-1.5 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/60">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all ${
                  isActive
                    ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white font-bold shadow-sm"
                    : "text-zinc-500 dark:text-zinc-400 font-medium hover:text-zinc-900 dark:hover:text-white"
                }`}
              >
                <div className="relative">
                  <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                  {item.badge ? (
                    <span className="absolute -top-1.5 -right-2 min-w-[16px] h-[16px] px-1 bg-[#E5FF66] text-black rounded-full flex items-center justify-center text-[9px] font-black">
                      {item.badge}
                    </span>
                  ) : null}
                </div>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right: Search, Create, Settings, Avatar */}
        <div className="flex items-center gap-3 shrink-0">
          <form onSubmit={handleSearch} className="relative hidden xl:block w-56">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search campus..."
              className="w-full bg-zinc-100 dark:bg-zinc-900 rounded-xl py-2 pl-9 pr-3 text-xs font-medium outline-none border border-transparent focus:border-[#E5FF66] transition-all"
            />
          </form>

          <Link href="/create">
            <button className="flex items-center gap-1.5 bg-[#E5FF66] text-black px-4 py-2 rounded-xl font-black text-xs uppercase tracking-wider shadow-sm hover:brightness-95 active:scale-95 transition-all">
              <Plus size={16} strokeWidth={3} />
              <span>Create</span>
            </button>
          </Link>

          <Link
            href="/settings"
            className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
            title="Settings"
          >
            <Settings size={17} />
          </Link>

          {user && (
            <Link href="/profile" className="flex items-center gap-2 pl-1">
              <div className="w-9 h-9 rounded-xl overflow-hidden bg-zinc-200 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                {user.avatar_url ? (
                  <Image src={user.avatar_url} alt={capitalizeName(user.full_name)} width={36} height={36} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User size={16} className="text-zinc-400" />
                  </div>
                )}
              </div>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
