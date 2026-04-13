"use client";

import { useSessionTracker } from "@/hooks/useSessionTracker";
import { AlertCircle, MapPin, RefreshCw, LogOut } from "lucide-react";
import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function SessionTracker() {
  const { isLocationMandatory, locationStatus, errorMsg, requestLocation } = useSessionTracker();
  const [isRetrying, setIsRetrying] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  const handleRetry = async () => {
    setIsRetrying(true);
    await requestLocation();
    setIsRetrying(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  if (isLocationMandatory || locationStatus === "denied") {
    return (
      <div className="fixed inset-0 z-[9999] bg-white dark:bg-[#0A0A0A] flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500 overflow-y-auto">
        <div className="w-20 h-20 bg-red-50 dark:bg-red-500/10 rounded-[32px] flex items-center justify-center mb-8 shadow-xl">
          <MapPin size={36} className="text-red-500 animate-pulse" />
        </div>
        
        <h1 className="text-2xl font-black text-black dark:text-white mb-2 uppercase tracking-tighter italic">
          Location Required
        </h1>
        
        <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed max-w-[320px] mb-8 font-medium">
          Univas requires location access to secure your account and sync your campus experience.
        </p>

        {errorMsg && (
          <div className="mb-8 p-4 bg-red-50 dark:bg-red-500/10 rounded-2xl border border-red-100 dark:border-red-900/30 flex items-start gap-3 text-left max-w-[320px]">
            <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
            <span className="text-xs font-bold text-red-600 dark:text-red-400 leading-tight">
              {errorMsg}
            </span>
          </div>
        )}

        <div className="flex flex-col gap-4 w-full max-w-[300px]">
          <button 
            onClick={handleRetry}
            disabled={isRetrying}
            className="w-full bg-black dark:bg-[#E2FF3D] text-white dark:text-black h-14 rounded-2xl font-black text-[13px] uppercase tracking-[0.2em] shadow-lg shadow-black/10 active:scale-95 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
          >
            <RefreshCw size={16} className={`${isRetrying ? 'animate-pulse scale-110' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
            {isRetrying ? 'Synchronizing...' : 'Allow Location Access'}
          </button>

          <button 
            onClick={handleLogout}
            className="w-full bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 h-14 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <LogOut size={14} />
            Logout Account
          </button>
        </div>

        <div className="mt-12 max-w-[300px]">
          <h3 className="text-[10px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-widest mb-4">
            How to enable?
          </h3>
          <div className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium leading-relaxed space-y-2">
            <p>1. Chrome: Tap ⋮ Menu &gt; Settings &gt; Site settings &gt; Location</p>
            <p>2. iPhone: Settings &gt; Privacy &gt; Location Services &gt; Safari</p>
            <p>3. Reset site permissions and try again.</p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
