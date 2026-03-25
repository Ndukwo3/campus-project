"use client";

import Link from "next/link";
import { ArrowRight, ArrowLeft } from "lucide-react";

export default function WelcomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-black text-zinc-900 dark:text-white font-sans relative overflow-hidden transition-colors">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[120%] bg-gradient-to-br from-[#E5FF66]/20 dark:from-[#E5FF66]/10 via-transparent to-transparent pointer-events-none blur-3xl z-0" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#E5FF66]/20 dark:bg-[#E5FF66]/10 rounded-full blur-3xl pointer-events-none z-0" />
      
      <div className="flex-1 flex flex-col justify-between max-w-md mx-auto w-full px-6 py-12 z-10">
        <div className="flex flex-col items-center mt-12">
          {/* Logo or Icon */}
          <div className="w-24 h-24 bg-[#1A1A24] dark:bg-zinc-900 rounded-3xl flex items-center justify-center mb-8 shadow-xl shadow-zinc-200/50 dark:shadow-none transform -rotate-3 border border-transparent dark:border-zinc-800">
            <span className="text-[#E5FF66] font-bold text-4xl italic">U</span>
            <span className="text-white font-bold text-4xl italic">-v</span>
          </div>

          <h1 className="text-4xl font-black text-center tracking-tight mb-4 uppercase">
            Welcome to <br />
            <span className="text-zinc-900 dark:text-[#E2FF3D] italic underline decoration-[#E5FF66] decoration-4 underline-offset-4">Uni-verse</span>
          </h1>
          
          <p className="text-center text-zinc-500 dark:text-zinc-400 font-bold text-[13px] uppercase tracking-widest leading-relaxed max-w-[280px]">
            The largest student network in Nigeria. Connect, collaborate, and grow with your peers.
          </p>
        </div>

        <div className="flex flex-col gap-4 mt-auto w-full">
          <Link
            href="/signup"
            className="w-full bg-[#1A1A24] dark:bg-[#E2FF3D] text-white dark:text-black rounded-2xl py-5 font-black text-[15px] uppercase tracking-widest hover:bg-black dark:hover:bg-white transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2 group"
          >
            Create an account
            <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            href="/login"
            className="w-full bg-white dark:bg-black border-2 border-zinc-100 dark:border-zinc-800 text-zinc-900 dark:text-white rounded-2xl py-5 font-black text-[15px] hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all flex items-center justify-center uppercase tracking-widest"
          >
            Log in
          </Link>
          
          <p className="text-center text-[12px] text-zinc-400 dark:text-zinc-600 mt-6 max-w-xs mx-auto font-bold uppercase tracking-widest">
            By continuing, you agree to Uni-verse's <a href="#" className="underline hover:text-zinc-600 dark:hover:text-zinc-400">Terms of Service</a> and <a href="#" className="underline hover:text-zinc-600 dark:hover:text-zinc-400">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
}
