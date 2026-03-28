"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Hash, MessageSquare, Loader2, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase";

interface CreateChannelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  groupId: string;
}

export default function CreateChannelModal({ isOpen, onClose, onSuccess, groupId }: CreateChannelModalProps) {
  const supabase = createClient();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    setError(null);

    const formattedName = name.trim().toLowerCase().replace(/\s+/g, '-');

    try {
      const { error: createError } = await supabase
        .from('channels')
        .insert({
          group_id: groupId,
          name: formattedName,
          description: description.trim() || null
        });

      if (createError) throw createError;

      onSuccess();
      setName("");
      setDescription("");
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to create channel");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-md"
          />

          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md bg-white dark:bg-zinc-950 rounded-t-[40px] sm:rounded-[44px] shadow-2xl overflow-hidden border border-zinc-100 dark:border-zinc-800/50"
          >
            {/* Design Element */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-[#E5FF66] to-emerald-500 opacity-50" />

            <div className="p-8 pb-10">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-[20px] bg-emerald-50/50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <Hash size={24} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-zinc-900 dark:text-white uppercase italic leading-none">New Channel</h2>
                    <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 mt-1 uppercase tracking-widest">Expansion & Management</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-full bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center text-zinc-400 hover:text-zinc-600 dark:hover:text-white transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.2em] ml-1">Channel Name</label>
                  <div className="relative group">
                     <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-zinc-400 group-focus-within:text-emerald-500 transition-colors">#</span>
                     <input
                      required
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. general-hub"
                      className="w-full h-14 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl pl-8 pr-4 text-sm font-bold uppercase tracking-wider border border-zinc-100 dark:border-zinc-800 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.2em] ml-1">Description (Optional)</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What should people discuss here?"
                    rows={3}
                    className="w-full bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl p-4 text-sm font-medium border border-zinc-100 dark:border-zinc-800 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none"
                  />
                </div>

                {error && (
                  <motion.div 
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="p-4 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 text-red-600 dark:text-red-400 text-xs font-bold leading-relaxed"
                  >
                    {error}
                  </motion.div>
                )}

                <button
                  disabled={isSubmitting || !name.trim()}
                  type="submit"
                  className="w-full h-14 bg-zinc-900 dark:bg-[#E5FF66] disabled:opacity-50 disabled:grayscale rounded-2xl text-white dark:text-black font-black uppercase tracking-widest text-[13px] shadow-xl shadow-zinc-900/10 dark:shadow-emerald-500/10 flex items-center justify-center gap-3 active:scale-95 transition-all group"
                >
                  {isSubmitting ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <>
                      <Sparkles size={18} className="group-hover:scale-125 transition-transform" />
                      Manifest Channel
                    </>
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
