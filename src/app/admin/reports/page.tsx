"use client";

import { ShieldAlert } from "lucide-react";

export default function ReportsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-black italic uppercase tracking-tight text-zinc-900 dark:text-white">Reported Content</h2>
        <p className="text-sm font-bold text-zinc-500 dark:text-zinc-400 mt-2">Global moderation queue for flagged user posts and stories.</p>
      </div>

      <div className="bg-white dark:bg-black border border-zinc-100 dark:border-zinc-900 rounded-[32px] p-6 lg:p-12 text-center flex flex-col items-center">
        <div className="w-20 h-20 rounded-[32px] bg-red-50 dark:bg-red-500/10 flex items-center justify-center mb-6 text-red-500">
           <ShieldAlert size={32} />
        </div>
        <h3 className="text-xl font-black uppercase italic text-zinc-900 dark:text-white">Queue is Empty</h3>
        <p className="text-sm font-bold text-zinc-500 max-w-sm mt-2">Amazing! The community is upholding the guidelines. No content has been reported recently.</p>
      </div>
    </div>
  );
}
