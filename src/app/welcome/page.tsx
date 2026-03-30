"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function WelcomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-black text-zinc-900 dark:text-white font-sans relative overflow-hidden transition-colors">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[120%] bg-gradient-to-br from-[#E5FF66]/20 dark:from-[#E5FF66]/10 via-transparent to-transparent pointer-events-none blur-3xl z-0" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#E5FF66]/20 dark:bg-[#E5FF66]/10 rounded-full blur-3xl pointer-events-none z-0" />
      
      <div className="flex-1 flex flex-col justify-between max-w-md mx-auto w-full px-6 py-12 z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center mt-12"
        >
          {/* Logo or Icon */}
          <motion.div 
            initial={{ scale: 0.8, rotate: -10 }}
            animate={{ scale: 1, rotate: -3 }}
            transition={{ duration: 1, type: "spring", bounce: 0.5, delay: 0.2 }}
            className="w-28 h-28 bg-[#1A1A24] dark:bg-zinc-900 rounded-[32px] flex items-center justify-center mb-10 shadow-2xl shadow-zinc-200/50 dark:shadow-none border border-transparent dark:border-zinc-800 relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-[#E5FF66]/20 to-transparent rounded-[32px] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <span className="text-[#E5FF66] font-black text-5xl italic tracking-tighter mix-blend-difference z-10">U</span>
            <span className="text-white font-black text-5xl italic tracking-tighter mix-blend-difference z-10">-v</span>
          </motion.div>

          <h1 className="text-[42px] font-black text-center leading-[1.1] tracking-tighter mb-8 uppercase mt-6">
            Welcome to <br />
            <motion.span 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="text-zinc-900 dark:text-[#E2FF3D] italic relative inline-block mt-2"
            >
              Univas
              <svg className="absolute w-full h-3 -bottom-1 top-auto left-0 text-[#E5FF66] -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                <motion.path 
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: 0.8, duration: 0.8, ease: "easeOut" }}
                  d="M0 5 Q 50 10 100 5" 
                  stroke="currentColor" 
                  strokeWidth="8" 
                  fill="none" 
                  strokeLinecap="round"
                />
              </svg>
            </motion.span>
          </h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="text-center text-zinc-500 dark:text-zinc-400 font-bold text-[12.5px] uppercase tracking-[0.16em] leading-[1.9] max-w-[290px] mt-4"
          >
            The largest student network in Nigeria. Connect, collaborate, and grow with your peers.
          </motion.p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col gap-4 mt-auto w-full"
        >
          <Link
            href="/signup"
            className="w-full bg-[#1A1A24] dark:bg-[#E2FF3D] text-white dark:text-black rounded-[24px] py-5 font-black text-[15px] uppercase tracking-[0.15em] hover:bg-black dark:hover:bg-white transition-all shadow-[0_10px_30px_rgba(26,26,36,0.2)] dark:shadow-[0_10px_30px_rgba(226,255,61,0.2)] hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-3 group active:scale-[0.98]"
          >
            Create an account
            <div className="w-6 h-6 rounded-full bg-white/10 dark:bg-black/10 flex items-center justify-center group-hover:bg-white/20 dark:group-hover:bg-black/20 transition-colors">
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>

          <Link
            href="/login"
            className="w-full bg-white dark:bg-black border-2 border-zinc-100 dark:border-zinc-800 text-zinc-900 dark:text-white rounded-[24px] py-5 font-black text-[15px] hover:bg-zinc-50 dark:hover:bg-zinc-900/50 hover:border-zinc-200 dark:hover:border-zinc-700 transition-all flex items-center justify-center uppercase tracking-[0.15em] active:scale-[0.98]"
          >
            Log in
          </Link>
          
          <p className="text-center text-[10px] text-zinc-400 dark:text-zinc-500 mt-6 mx-auto font-black uppercase tracking-[0.15em] max-w-[260px] leading-wider">
            By continuing, you agree to Univas's <br/>
            <a href="#" className="underline decoration-zinc-300 dark:decoration-zinc-700 underline-offset-4 hover:text-zinc-900 dark:hover:text-white transition-colors">Terms</a> and <a href="#" className="underline decoration-zinc-300 dark:decoration-zinc-700 underline-offset-4 hover:text-zinc-900 dark:hover:text-white transition-colors">Privacy</a>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
