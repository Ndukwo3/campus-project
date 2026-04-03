"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function FloatingCreateButton() {
  const pathname = usePathname();
  const showOnPaths = ["/profile"]; // Removed "/" from global show. We will handle it on the pages directly if needed, or refine.
  const shouldShow = showOnPaths.includes(pathname);


  return (
    <AnimatePresence>
      {shouldShow && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-full max-w-md pointer-events-none z-[60] px-5 flex justify-end">
          <motion.div
            initial={{ scale: 0, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
          >
            <Link 
              href="/create"
              className="pointer-events-auto flex items-center justify-center w-14 h-14 rounded-full bg-[#E5FF66] text-black shadow-[0_8px_30px_rgba(229,255,102,0.4)] dark:shadow-[0_8px_40px_rgba(0,0,0,0.6)] border border-white/20 dark:border-black/20 hover:scale-110 active:scale-95 transition-transform group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity" />
              <Plus size={28} strokeWidth={3} className="relative z-10" />
            </Link>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
