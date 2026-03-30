"use client";

import { useTheme } from "next-themes";
import { 
  ChevronLeft, 
  Sun, 
  Moon, 
  Monitor, 
  Check,
  Palette
} from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export default function AppearancePage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const themes = [
    { 
      id: "light", 
      name: "Light Mode", 
      icon: Sun, 
      desc: "Warm and bright, perfect for sunny days.",
      preview: "bg-white border-zinc-200"
    },
    { 
      id: "dark", 
      name: "Dark Mode", 
      icon: Moon, 
      desc: "Deep and focused, easy on the eyes.",
      preview: "bg-[#0A0A0A] border-zinc-800"
    },
    { 
      id: "system", 
      name: "System Sync", 
      icon: Monitor, 
      desc: "Synchronize with your device's global settings.",
      preview: "bg-gradient-to-br from-white via-zinc-100 to-zinc-900 border-zinc-200"
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-black pb-[100px] max-w-md mx-auto relative font-sans transition-colors duration-300">
      {/* Premium Header */}
      <div className="sticky top-0 z-40 w-full bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-zinc-100/50 dark:border-zinc-800/50 px-6 py-4 flex items-center justify-between">
        <button 
          onClick={() => router.back()}
          className="w-10 h-10 flex items-center justify-center rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 transition-all active:scale-90"
        >
          <ChevronLeft size={20} strokeWidth={2.5} />
        </button>
        <h1 className="text-[17px] font-black tracking-tight text-zinc-900 dark:text-zinc-100 uppercase tracking-widest text-xs">Appearance</h1>
        <div className="w-10" />
      </div>

      <main className="px-6 pt-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-12"
        >
          <div className="space-y-2">
            <h2 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight">Display Themes</h2>
            <p className="text-zinc-400 dark:text-zinc-500 text-sm font-medium">Personalize your Univas experience with a theme that fits your vibe.</p>
          </div>

          <div className="space-y-3">
            {themes.map((t) => {
              const Icon = t.icon;
              const isActive = theme === t.id;

              return (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={`w-full group relative flex items-center gap-5 p-5 rounded-[32px] transition-all duration-300 active:scale-[0.98] border-2 ${
                    isActive 
                      ? "bg-[#E5FF66] border-[#E5FF66] shadow-[0_20px_40px_-12px_rgba(229,255,102,0.4)]" 
                      : "bg-zinc-50 dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
                  }`}
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm transition-all duration-500 ${
                    isActive ? "bg-black text-[#E5FF66]" : "bg-white dark:bg-black text-zinc-900 dark:text-zinc-100"
                  }`}>
                    <Icon size={28} strokeWidth={2.5} />
                  </div>

                  <div className="flex-1 text-left">
                    <p className={`font-black text-lg tracking-tight leading-none mb-1.5 ${
                      isActive ? "text-black" : "text-zinc-900 dark:text-zinc-100"
                    }`}>
                      {t.name}
                    </p>
                    <p className={`text-xs font-medium leading-tight opacity-70 ${
                      isActive ? "text-black/60" : "text-zinc-500"
                    }`}>
                      {t.desc}
                    </p>
                  </div>

                  {isActive && (
                    <motion.div 
                      layoutId="check"
                      className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-[#E5FF66]"
                    >
                      <Check size={16} strokeWidth={4} />
                    </motion.div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Theme Preview Cards */}
          <div className="pt-10 space-y-6">
             <div className="flex items-center gap-3 px-2">
                <Palette size={18} className="text-[#E5FF66]" />
                <h3 className="text-[11px] font-black text-zinc-300 dark:text-zinc-700 uppercase tracking-[0.3em]">Theme Previews</h3>
             </div>

             <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setTheme('light')}
                  className={`aspect-[4/3] bg-white border rounded-[32px] p-4 flex flex-col gap-2 shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] ${theme === 'light' ? 'border-[#E5FF66] ring-4 ring-[#E5FF66]/20' : 'border-zinc-100'}`}
                >
                   <div className="flex items-center gap-2 mb-1">
                      <div className="w-5 h-5 rounded-lg bg-zinc-100" />
                      <div className="w-12 h-2 bg-zinc-100 rounded-full" />
                   </div>
                   <div className="w-full h-2 bg-zinc-50 rounded-full" />
                   <div className="w-[80%] h-2 bg-zinc-50 rounded-full" />
                   <div className="mt-auto w-full h-10 bg-zinc-900 rounded-2xl flex items-center justify-center">
                      <div className="w-8 h-1.5 bg-white/20 rounded-full" />
                   </div>
                </button>
                <button 
                  onClick={() => setTheme('dark')}
                  className={`aspect-[4/3] bg-[#0A0A0A] border rounded-[32px] p-4 flex flex-col gap-2 shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] ${theme === 'dark' ? 'border-[#E5FF66] ring-4 ring-[#E5FF66]/20' : 'border-zinc-800'}`}
                >
                   <div className="flex items-center gap-2 mb-1">
                      <div className="w-5 h-5 rounded-lg bg-zinc-800" />
                      <div className="w-12 h-2 bg-zinc-800 rounded-full" />
                   </div>
                   <div className="w-full h-2 bg-zinc-900 rounded-full" />
                   <div className="w-[80%] h-2 bg-zinc-900 rounded-full" />
                   <div className="mt-auto w-full h-10 bg-[#E5FF66] rounded-2xl flex items-center justify-center">
                      <div className="w-8 h-1.5 bg-black/20 rounded-full" />
                   </div>
                </button>
             </div>
          </div>
          
          <div className="bg-[#1A1A24] dark:bg-[#E5FF66] p-8 rounded-[40px] flex items-center justify-between group overflow-hidden relative">
            <div className="relative z-10">
              <p className="text-white/40 dark:text-black/40 text-[10px] font-black uppercase tracking-widest mb-1">Coming Soon</p>
              <h4 className="text-white dark:text-black font-black text-xl italic tracking-tight">OLED Black</h4>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-white/10 dark:bg-black/10 flex items-center justify-center text-white dark:text-black relative z-10 transition-transform group-hover:rotate-12">
               <Monitor size={24} strokeWidth={2.5} />
            </div>
            {/* Abstract shape */}
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/5 dark:bg-black/5 rounded-full blur-2xl" />
          </div>
        </motion.div>
      </main>
    </div>
  );
}
