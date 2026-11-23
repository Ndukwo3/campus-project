"use client";

import { BookOpen, ArrowRight, Users, Sparkles, Loader2 } from "lucide-react";
import SuggestedConnections from "./SuggestedConnections";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import Link from "next/link";

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
    <aside className="hidden lg:flex flex-col w-[340px] shrink-0 sticky top-22 space-y-5">
      {/* Campus Library Quick Access */}
      <Link
        href="/library"
        className="group block bg-zinc-900 dark:bg-zinc-900/90 text-white rounded-3xl p-5 border border-zinc-800 shadow-sm hover:border-[#E5FF66]/60 transition-all"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="w-10 h-10 rounded-2xl bg-[#E5FF66] text-black flex items-center justify-center">
            <BookOpen size={20} strokeWidth={2.5} />
          </div>
          <ArrowRight size={18} className="text-zinc-400 group-hover:text-[#E5FF66] group-hover:translate-x-1 transition-all" />
        </div>
        <h3 className="text-base font-black tracking-tight">Campus Library</h3>
        <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
          Access past questions, lecture notes, and department resources.
        </p>
      </Link>

      {/* Campus Connections */}
      <div className="bg-white dark:bg-[#0A0A0A] rounded-3xl overflow-hidden border border-zinc-200/70 dark:border-zinc-800/70 shadow-sm">
        <div className="px-5 py-4 flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800/60">
          <Users size={17} className="text-[#E5FF66]" />
          <h3 className="text-sm font-black uppercase tracking-wider text-zinc-900 dark:text-white">
            Campus Connections
          </h3>
        </div>
        <div className="px-2 py-2">
          {loading ? (
            <div className="py-8 flex justify-center">
              <Loader2 className="animate-spin text-zinc-300" />
            </div>
          ) : user ? (
            <SuggestedConnections userId={user.id} universityId={user.university_id} />
          ) : null}
        </div>
      </div>

      {/* Peerza Campus Tip */}
      <div className="bg-white dark:bg-[#0A0A0A] rounded-3xl p-5 border border-zinc-200/70 dark:border-zinc-800/70 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
          <Sparkles size={14} className="text-[#E5FF66]" />
          <span>Peerza v0.1.1</span>
        </div>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
          Built for Nigerian students to connect, share campus moments, and study smarter together.
        </p>
      </div>
    </aside>
  );
}
