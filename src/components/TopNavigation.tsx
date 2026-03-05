import { Bell, Search } from "lucide-react";
import AuthLogo from "./AuthLogo";

export default function TopNavigation() {
  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white">
      <AuthLogo />
      <div className="flex items-center gap-3">
        <button className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 text-black hover:bg-zinc-200 transition">
          <Bell size={20} strokeWidth={1.5} />
        </button>
        <button className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 text-black hover:bg-zinc-200 transition">
          <Search size={20} strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
}
