"use client";

import { Home, Search, MessageSquare, User, Bell, BookOpen, PlusSquare, MoreHorizontal, LogOut, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import AuthLogo from "./AuthLogo";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import { capitalizeName } from "@/lib/utils";
import Image from "next/image";

export default function DesktopSidebar() {
  const pathname = usePathname();
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);

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
    { label: "Home", href: "/", icon: Home },
    { label: "Explore", href: "/search", icon: Search },
    { label: "Notifications", href: "/notifications", icon: Bell },
    { label: "Messages", href: "/messages", icon: MessageSquare, badge: unreadCount },
    { label: "Univas", href: "/univas", icon: BookOpen },
    { label: "Profile", href: "/profile", icon: User },
    { label: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <div className="hidden lg:flex flex-col h-screen sticky top-0 w-[275px] px-4 py-4 border-r border-zinc-100 dark:border-zinc-800">
      <div className="mb-8 px-4">
        <AuthLogo />
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`flex items-center gap-4 px-4 py-3 rounded-full text-xl transition-all hover:bg-zinc-100 dark:hover:bg-zinc-900 group ${isActive ? "font-black" : "font-medium"}`}
            >
              <div className="relative">
                <item.icon size={26} strokeWidth={isActive ? 2.5 : 2} />
                {item.badge ? (
                  <div className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-[#E5FF66] dark:bg-[#E5FF66] text-black rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-white dark:border-black">
                    {item.badge}
                  </div>
                ) : null}
              </div>
              <span className="hidden xl:block">{item.label}</span>
            </Link>
          );
        })}
        
        <Link href="/create" className="block w-full mt-4">
          <button className="w-full bg-[#E5FF66] text-black py-4 rounded-full font-black text-lg shadow-lg hover:brightness-95 transition-all active:scale-95 hidden xl:block">
            Post
          </button>
        </Link>
        <Link href="/create" className="block mx-auto mt-4 xl:hidden">
          <button className="w-14 h-14 bg-[#E5FF66] text-black rounded-full flex items-center justify-center shadow-lg hover:brightness-95 transition-all active:scale-95">
            <PlusSquare size={26} strokeWidth={2.5} />
          </button>
        </Link>
      </nav>

      {user && (
        <div className="mt-auto mb-4">
          <div className="flex items-center justify-between p-3 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all cursor-pointer group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-zinc-200 dark:bg-zinc-800 shrink-0">
                {user.avatar_url ? (
                  <Image src={user.avatar_url} alt="" width={40} height={40} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User size={20} className="text-zinc-400" />
                  </div>
                )}
              </div>
              <div className="hidden xl:block min-w-0">
                <p className="font-bold text-sm truncate">{capitalizeName(user.full_name)}</p>
                <p className="text-zinc-500 text-xs truncate">{user.username}</p>
              </div>
            </div>
            <MoreHorizontal size={18} className="hidden xl:block text-zinc-500" />
          </div>
        </div>
      )}
    </div>
  );
}
