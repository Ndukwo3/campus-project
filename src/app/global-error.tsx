"use client";

import { motion } from "framer-motion";
import { RefreshCw, AlertTriangle } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="bg-black text-white font-sans selection:bg-[#E5FF66] selection:text-black">
        <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
          {/* Neon Error Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-500/10 rounded-full blur-[120px] pointer-events-none" />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md w-full relative z-10"
          >
            {/* Status Code Badge */}
            <div className="inline-flex items-center justify-center px-6 py-2 bg-red-500/10 rounded-full border border-red-500/20 mb-8 shadow-xl">
              <span className="text-[12px] font-black text-red-500 uppercase tracking-[0.3em] italic flex items-center gap-2">
                <AlertTriangle size={14} />
                Critical Error
              </span>
            </div>

            <div className="space-y-6 mb-12">
              <h1 className="text-[54px] font-[900] text-white leading-[0.9] uppercase italic tracking-tighter mb-4">
                Universe <br/> Overload
              </h1>
              <p className="text-zinc-500 font-bold text-sm leading-relaxed px-8 uppercase tracking-widest opacity-80">
                A catastrophic error occurred in our core systems. We're sorry for the interruption.
              </p>
            </div>

            <button 
              onClick={() => reset()}
              className="w-full py-6 bg-white text-black rounded-[32px] font-black text-[14px] uppercase italic tracking-[0.2em] shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-all group"
            >
              <RefreshCw size={20} className="group-active:rotate-180 transition-transform duration-500" />
              Reset Universe
            </button>

            <div className="mt-12 flex flex-col items-center gap-3 opacity-20">
               <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
                  <span className="text-red-500 font-black italic">U</span>
               </div>
               <p className="text-[10px] font-black uppercase tracking-[0.2em]">{error.digest || 'ROOT-SYNC-FAIL'}</p>
            </div>
          </motion.div>
        </div>
      </body>
    </html>
  );
}
