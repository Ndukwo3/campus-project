import { Bell, Search } from "lucide-react";
import Link from "next/link";
import AuthLogo from "./AuthLogo";

export default function TopNavigation() {
  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white">
      <AuthLogo />
      <div className="flex items-center gap-3">
        <Link href="/notifications" className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 text-black hover:bg-zinc-200 transition relative">
          <Bell size={20} strokeWidth={1.5} />
          <div className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-[#E5FF66] border border-white"></div>
        </Link>
        <Link href="/search" className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 text-black hover:bg-zinc-200 transition">
          <Search size={20} strokeWidth={1.5} />
        </Link>
      </div>
    </div>
  );
}
