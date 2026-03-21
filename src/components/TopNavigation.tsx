import { Bell, Search, Menu } from "lucide-react";
import Link from "next/link";
import AuthLogo from "./AuthLogo";
import { useNotificationStore } from "@/store/notificationStore";

export default function TopNavigation() {
  const { hasUnread } = useNotificationStore();
  
  return (
    <div className="sticky top-0 z-40 w-full max-w-md mx-auto px-6 py-4 flex items-center justify-between bg-white/80 backdrop-blur-xl border-b border-zinc-100/50">
      <div className="flex items-center gap-2 group cursor-pointer transition-transform active:scale-95">
        <AuthLogo />
      </div>
      
      <div className="flex items-center gap-3">
        <Link href="/search" className="w-11 h-11 flex items-center justify-center rounded-2xl bg-zinc-50 border border-zinc-100 text-zinc-900 shadow-sm hover:bg-zinc-100 hover:scale-105 active:scale-95 transition-all">
          <Search size={22} strokeWidth={2.5} />
        </Link>
        <Link href="/notifications" className="w-11 h-11 flex items-center justify-center rounded-2xl bg-zinc-50 border border-zinc-100 text-zinc-900 shadow-sm hover:bg-zinc-100 hover:scale-105 active:scale-95 transition-all relative">
          <Bell size={22} strokeWidth={2.5} />
          <div className={`absolute top-2.5 right-2.5 h-2.5 w-2.5 rounded-full border-2 border-white shadow-sm ${hasUnread ? "bg-red-500" : "bg-zinc-300"}`} />
        </Link>
      </div>
    </div>
  );
}
