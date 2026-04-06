"use client";

import { useSessionTracker } from "@/hooks/useSessionTracker";
import { AlertTriangle, MapPin } from "lucide-react";

export default function SessionTracker() {
  const { isLocationMandatory, locationStatus } = useSessionTracker();

  if (isLocationMandatory || locationStatus === "denied") {
    return (
      <div className="fixed inset-0 z-[9999] bg-white dark:bg-black flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
        <div className="w-20 h-20 bg-red-50 dark:bg-red-500/10 rounded-[32px] flex items-center justify-center mb-8 shadow-xl">
          <MapPin size={36} className="text-red-500 animate-bounce" />
        </div>
        
        <h1 className="text-2xl font-black text-black dark:text-white mb-4 uppercase tracking-tighter italic">
          Location Required
        </h1>
        
        <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed max-w-[300px] mb-10 font-bold uppercase tracking-widest opacity-80">
          Univas requires location access to secure your account and sync your campus experience.
        </p>

        <button 
          onClick={() => window.location.reload()}
          className="bg-black dark:bg-[#E2FF3D] text-white dark:text-black px-10 py-5 rounded-full font-black text-[13px] uppercase tracking-[0.2em] shadow-lg shadow-black/10 active:scale-95 transition-transform"
        >
          Enable Location
        </button>

        <div className="mt-12 flex items-center gap-2 px-6 py-3 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800">
           <AlertTriangle size={14} className="text-orange-500" />
           <span className="text-[10px] font-black text-zinc-600 dark:text-zinc-400 uppercase tracking-widest">
             Security Protocol Active
           </span>
        </div>
      </div>
    );
  }

  return null;
}
