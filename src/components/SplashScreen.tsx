"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const BRAND_NAME = "Peerza";

export default function SplashScreen() {
  const [visible, setVisible] = useState(false);
  const [phase, setPhase] = useState<"pulse" | "type" | "exit">("pulse");
  const [typedCount, setTypedCount] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem("peerza_splash_shown")) return;

    sessionStorage.setItem("peerza_splash_shown", "true");
    setVisible(true);

    // Phase 1: Logo fade-in, fade-out, fade-in, fade-out, final fade-in (~1.9s)
    const typeTimer = setTimeout(() => {
      setPhase("type");
    }, 1900);

    return () => clearTimeout(typeTimer);
  }, []);

  useEffect(() => {
    if (phase !== "type") return;

    if (typedCount < BRAND_NAME.length) {
      const charTimer = setTimeout(() => {
        setTypedCount((c) => c + 1);
      }, 95);
      return () => clearTimeout(charTimer);
    } else {
      // Hold briefly after typing completes, then fade out to home page
      const exitTimer = setTimeout(() => {
        setPhase("exit");
        setTimeout(() => setVisible(false), 450);
      }, 600);
      return () => clearTimeout(exitTimer);
    }
  }, [phase, typedCount]);

  if (!visible) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: phase === "exit" ? 0 : 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-white dark:bg-black select-none"
        >
          <div className="flex items-center justify-center">
            {/* Logo: fades in -> out -> in -> out -> in, then slides left */}
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={
                phase === "pulse"
                  ? {
                      opacity: [0, 1, 0.15, 1, 0.15, 1],
                      scale: [0.9, 1, 0.97, 1, 0.97, 1],
                    }
                  : { opacity: 1, scale: 1 }
              }
              transition={
                phase === "pulse"
                  ? { duration: 1.9, times: [0, 0.2, 0.4, 0.6, 0.8, 1], ease: "easeInOut" }
                  : { type: "spring", stiffness: 320, damping: 28 }
              }
              className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center p-3 shadow-[0_0_35px_rgba(229,255,102,0.18)] border border-zinc-800 shrink-0"
            >
              <img src="/logo.png" alt="Peerza" className="w-full h-full object-contain" />
            </motion.div>

            {/* Typed "Peerza" text */}
            {phase !== "pulse" && (
              <motion.div
                initial={{ opacity: 0, width: 0, marginLeft: 0 }}
                animate={{ opacity: 1, width: "auto", marginLeft: 14 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="overflow-hidden flex items-center"
              >
                <span className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white whitespace-nowrap">
                  {BRAND_NAME.slice(0, typedCount)}
                </span>
                {typedCount < BRAND_NAME.length && (
                  <span className="inline-block w-[3px] h-7 bg-[#E5FF66] ml-0.5 animate-pulse rounded-full" />
                )}
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
