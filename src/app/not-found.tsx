"use client";

import ErrorLayout from "@/components/ErrorLayout";
import { motion } from "framer-motion";
import { Search } from "lucide-react";

export default function NotFound() {
  return (
    <ErrorLayout
      statusCode="404"
      title="Lost in Transit?"
      message="This page seems to have graduated and moved on. We couldn't find what you were looking for."
    >
      <div className="flex flex-col items-center gap-6 mt-12 opacity-40">
        <div className="w-16 h-16 rounded-3xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center border border-zinc-200 dark:border-zinc-800 animate-bounce">
          <Search size={32} strokeWidth={3} className="text-zinc-500" />
        </div>
        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] max-w-[200px] leading-relaxed">
          Maybe a typo or a broken link? Try searching for something else.
        </p>
      </div>
    </ErrorLayout>
  );
}
