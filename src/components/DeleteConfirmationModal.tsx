"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Trash2, X, AlertCircle } from "lucide-react";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export default function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}: DeleteConfirmationModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 flex items-center justify-center z-[101] p-6 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-sm bg-white rounded-[32px] overflow-hidden shadow-2xl pointer-events-auto"
            >
              <div className="p-8 flex flex-col items-center text-center">
                {/* Icon Circle */}
                <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-6">
                  <Trash2 className="text-red-500 w-8 h-8" />
                </div>

                <h3 className="text-xl font-black text-zinc-900 mb-2">Delete post?</h3>
                <p className="text-zinc-500 text-sm font-medium leading-relaxed px-4">
                  This action cannot be undone. This post will be permanently removed from your profile and the feed.
                </p>

                <div className="w-full mt-10 flex flex-col gap-3">
                  <button
                    onClick={onConfirm}
                    disabled={isLoading}
                    className="w-full py-4 rounded-2xl bg-red-500 text-white font-black text-sm uppercase tracking-widest hover:bg-red-600 transition-all active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-red-200"
                  >
                    {isLoading ? "Deleting..." : "Yes, Delete Post"}
                  </button>
                  <button
                    onClick={onClose}
                    disabled={isLoading}
                    className="w-full py-4 rounded-2xl bg-zinc-100 text-zinc-600 font-bold text-sm tracking-tight hover:bg-zinc-200 transition-all active:scale-[0.98]"
                  >
                    Keep Post
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
