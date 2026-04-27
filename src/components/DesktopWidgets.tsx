"use client";

import { Search, Settings, MoreHorizontal } from "lucide-react";
import SuggestedConnections from "./SuggestedConnections";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

export default function DesktopWidgets() {
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getUser() {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', authUser.id).single();
        setUser(profile);
      }
      setLoading(false);
    }
    getUser();
  }, [supabase]);

  return (
    <div className="hidden lg:block w-[350px] xl:w-[400px] px-8 py-4 space-y-6">
      {/* Search Bar */}
      <div className="sticky top-0 z-10 pt-1 pb-4 bg-white dark:bg-black">
        <div className="relative group">
          <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
            <Search size={18} className="text-zinc-400 group-focus-within:text-[#E5FF66] transition-colors" />
          </div>
          <input 
            type="text" 
            placeholder="Search Univas"
            className="w-full bg-zinc-100 dark:bg-zinc-900 rounded-full py-3.5 pl-14 pr-6 text-sm font-medium outline-none border border-transparent focus:border-[#E5FF66] focus:bg-white dark:focus:bg-black transition-all"
          />
        </div>
      </div>

      {/* Subscribe/Premium Placeholder */}
      <div className="bg-zinc-50 dark:bg-zinc-900 rounded-[24px] p-5 border border-zinc-100 dark:border-zinc-800 space-y-3">
        <h3 className="text-xl font-black italic tracking-tighter">Univas Premium</h3>
        <p className="text-sm font-medium text-zinc-500 leading-relaxed">
          Unlock exclusive academic tools and community features.
        </p>
        <button className="bg-black dark:bg-white text-white dark:text-black px-5 py-2.5 rounded-full font-black text-sm hover:opacity-90 transition-opacity">
          Subscribe
        </button>
      </div>

      {/* Suggested Connections */}
      <div className="bg-zinc-50 dark:bg-zinc-900 rounded-[24px] overflow-hidden border border-zinc-100 dark:border-zinc-800">
        <div className="px-5 py-4">
            <h3 className="text-xl font-black tracking-tight">Who to follow</h3>
        </div>
        <div className="px-1 pb-2">
          {loading ? (
            <div className="py-8 flex justify-center">
              <Loader2 className="animate-spin text-zinc-300" />
            </div>
          ) : user ? (
            <SuggestedConnections userId={user.id} universityId={user.university_id} />
          ) : null}
        </div>
        <button className="w-full text-left px-5 py-4 text-[#E5FF66] text-sm font-bold hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors border-t border-zinc-100 dark:border-zinc-800">
          Show more
        </button>
      </div>

      {/* Trends / What's happening */}
      <div className="bg-zinc-50 dark:bg-zinc-900 rounded-[24px] overflow-hidden border border-zinc-100 dark:border-zinc-800">
        <div className="px-5 py-4">
            <h3 className="text-xl font-black tracking-tight">What's happening</h3>
        </div>
        <div className="space-y-0">
            {[
                { category: "Trending in Nigeria", title: "ASUU Strike", posts: "42.5K Posts" },
                { category: "Academic • Trending", title: "JAMB Results", posts: "12.1K Posts" },
                { category: "University Life", title: "#CampusVibes", posts: "8,432 Posts" },
            ].map((trend, i) => (
                <div key={i} className="px-5 py-3 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer group">
                    <div className="flex justify-between">
                        <span className="text-[11px] font-medium text-zinc-500">{trend.category}</span>
                        <MoreHorizontal size={16} className="text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <p className="font-black text-sm mt-0.5">{trend.title}</p>
                    <p className="text-[11px] font-medium text-zinc-500 mt-0.5">{trend.posts}</p>
                </div>
            ))}
        </div>
        <button className="w-full text-left px-5 py-4 text-[#E5FF66] text-sm font-bold hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
          Show more
        </button>
      </div>

      {/* Footer Links */}
      <div className="px-5 py-2 flex flex-wrap gap-x-4 gap-y-1">
          {["Terms of Service", "Privacy Policy", "Cookie Policy", "Accessibility", "Ads info", "More ...", "© 2026 Univas Corp."].map((link, i) => (
              <span key={i} className="text-[12px] text-zinc-500 hover:underline cursor-pointer">{link}</span>
          ))}
      </div>
    </div>
  );
}
