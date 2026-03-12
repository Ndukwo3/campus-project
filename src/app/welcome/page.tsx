"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function WelcomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#F8F9FA] text-zinc-900 font-sans relative overflow-hidden max-w-md mx-auto shadow-sm border-x border-zinc-100">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[120%] bg-gradient-to-br from-[#E5FF66]/20 via-transparent to-transparent pointer-events-none blur-3xl z-0" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#E5FF66]/20 rounded-full blur-3xl pointer-events-none z-0" />
      
      <div className="flex-1 flex flex-col justify-between max-w-md mx-auto w-full px-6 py-12 z-10">
        <div className="flex flex-col items-center mt-12">
          {/* Logo or Icon */}
          <div className="w-24 h-24 bg-[#1A1A24] rounded-3xl flex items-center justify-center mb-8 shadow-xl shadow-zinc-200/50 transform -rotate-3">
            <span className="text-[#E5FF66] font-bold text-4xl italic">U</span>
            <span className="text-white font-bold text-4xl italic">-v</span>
          </div>

          <h1 className="text-4xl font-extrabold text-center tracking-tight mb-4">
            Welcome to <br />
            <span className="text-zinc-900 italic underline decoration-[#E5FF66] decoration-4 underline-offset-4">Uni-verse</span>
          </h1>
          
          <p className="text-center text-zinc-500 font-medium text-[15px] leading-relaxed max-w-[280px]">
            The largest student network in Nigeria. Connect, collaborate, and grow with your peers.
          </p>
        </div>

        <div className="flex flex-col gap-4 mt-auto w-full">
          <Link
            href="/signup"
            className="w-full bg-[#1A1A24] text-white rounded-2xl py-4.5 font-medium text-[15px] hover:bg-black transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2 group"
          >
            Create an account
            <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            href="/login"
            className="w-full bg-white border-2 border-zinc-100 text-zinc-900 rounded-2xl py-4.5 font-bold text-[15px] hover:bg-zinc-50 hover:border-zinc-200 transition-all flex items-center justify-center"
          >
            Log in
          </Link>
          
          <p className="text-center text-[12px] text-zinc-400 mt-6 max-w-xs mx-auto">
            By continuing, you agree to Uni-verse's <a href="#" className="underline">Terms of Service</a> and <a href="#" className="underline">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
