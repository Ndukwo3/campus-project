"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, Info, X, AlertCircle } from "lucide-react";
import { useEffect } from "react";

export type ToastType = "success" | "error" | "info" | "warning";

interface ToastProps {
  message: string;
  type: ToastType;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, type, isVisible, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
    error: <XCircle className="w-5 h-5 text-rose-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />,
    warning: <AlertCircle className="w-5 h-5 text-amber-500" />,
  };

  const colors = {
    success: "bg-emerald-50 border-emerald-100/50 shadow-emerald-100/20",
    error: "bg-rose-50 border-rose-100/50 shadow-rose-100/20",
    info: "bg-blue-50 border-blue-100/50 shadow-blue-100/20",
    warning: "bg-amber-50 border-amber-100/50 shadow-amber-100/20",
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
          className="fixed top-6 left-1/2 -translate-x-1/2 z-[1000] w-[90%] max-w-sm pointer-events-auto"
        >
          <div className={`flex items-center gap-3 px-4 py-4 rounded-3xl border shadow-xl backdrop-blur-md ${colors[type]}`}>
            <div className={`p-2 rounded-2xl bg-white shadow-sm flex items-center justify-center`}>
              {icons[type]}
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-bold text-zinc-900 leading-tight">
                {message}
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 hover:bg-black/5 rounded-full transition-colors text-zinc-400"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
