"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowLeft, Home, RefreshCw } from "lucide-react";

interface ErrorLayoutProps {
  statusCode: string;
  title: string;
  message: string;
  onRetry?: () => void;
  showHome?: boolean;
  children?: React.ReactNode;
}

export default function ErrorLayout({
  statusCode,
  title,
  message,
  onRetry,
  showHome = true,
  children
}: ErrorLayoutProps) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white dark:bg-black flex flex-col items-center justify-center p-6 text-center font-sans overflow-hidden relative">
      {/* Background Orbs */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-[#E5FF66]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-zinc-900/10 dark:bg-zinc-100/5 rounded-full blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-md w-full relative z-10"
      >
        {/* Status Code Badge */}
        <motion.div
           initial={{ scale: 0.8 }}
           animate={{ scale: 1 }}
           className="inline-flex items-center justify-center px-6 py-2 bg-zinc-100 dark:bg-zinc-900 rounded-full border border-zinc-200 dark:border-zinc-800 mb-8 shadow-xl"
        >
          <span className="text-[12px] font-black text-zinc-900 dark:text-[#E5FF66] uppercase tracking-[0.3em] italic">
            Error {statusCode}
          </span>
        </motion.div>

        <div className="space-y-4 mb-12">
          <h1 className="text-[54px] font-[900] text-zinc-900 dark:text-white leading-[0.9] uppercase italic tracking-tighter mb-4 pr-2">
            {title}
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 font-bold text-sm leading-relaxed px-8 uppercase tracking-widest opacity-80">
            {message}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-4 w-full">
          {onRetry && (
            <button 
              onClick={onRetry}
              className="w-full py-5 bg-zinc-900 dark:bg-[#E5FF66] text-white dark:text-black rounded-[28px] font-black text-[13px] uppercase italic tracking-widest shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-all group"
            >
              <RefreshCw size={18} className="group-active:rotate-180 transition-transform duration-500" />
              Try Again
            </button>
          )}

          {showHome && (
            <button 
              onClick={() => router.push("/")}
              className="w-full py-5 bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-800 rounded-[28px] font-black text-[13px] uppercase italic tracking-widest shadow-lg flex items-center justify-center gap-3 active:scale-95 transition-all"
            >
              <Home size={18} />
              Back to Feed
            </button>
          )}
        </div>

        {children && <div className="mt-12">{children}</div>}
      </motion.div>

      {/* Footer Branding */}
      <div className="absolute bottom-10 flex items-center gap-2 opacity-20 group">
        <div className="w-8 h-8 bg-black dark:bg-white rounded-lg flex items-center justify-center overflow-hidden transition-transform group-hover:rotate-12">
          <span className="text-white dark:text-black font-black italic text-xs">U</span>
        </div>
        <span className="text-[10px] font-black text-zinc-900 dark:text-white uppercase tracking-[0.2em]">Univas</span>
      </div>
    </div>
  );
}
