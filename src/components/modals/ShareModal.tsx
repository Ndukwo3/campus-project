"use client";

import { useState } from "react";
import { X, Copy, Share, MessageSquare, Check, Link2, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
  postContent: string;
  onShowToast: (message: string, type?: "success" | "error") => void;
}

export default function ShareModal({
  isOpen,
  onClose,
  postId,
  postContent,
  onShowToast,
}: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const shareUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/post/${postId}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      onShowToast("Link copied to clipboard!", "success");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      onShowToast("Failed to copy link", "error");
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Check out this post on Univas",
          text: postContent,
          url: shareUrl,
        });
      } catch (err) {
        // User cancelled or error
      }
    } else {
      handleCopyLink();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-md bg-white rounded-t-[32px] sm:rounded-[32px] overflow-hidden flex flex-col shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-5 flex items-center justify-between border-b border-zinc-100">
            <h3 className="font-black text-lg text-zinc-900">Share Post</h3>
            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-zinc-50 text-zinc-400 hover:text-zinc-900 active:scale-90 transition-all"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-6 grid grid-cols-2 gap-4">
            {/* Share to Chat (Placeholder) */}
            <button className="flex flex-col items-center gap-3 p-5 rounded-3xl bg-zinc-50 border border-zinc-100/50 hover:bg-zinc-100 transition-all group active:scale-95">
              <div className="w-12 h-12 rounded-2xl bg-[#E5FF66] flex items-center justify-center text-black shadow-lg shadow-[#E5FF66]/20 group-hover:scale-110 transition-transform">
                <MessageSquare size={24} strokeWidth={2.5} />
              </div>
              <span className="text-xs font-black text-zinc-600 uppercase tracking-widest">Chat</span>
            </button>

            {/* Copy Link */}
            <button 
              onClick={handleCopyLink}
              className="flex flex-col items-center gap-3 p-5 rounded-3xl bg-zinc-50 border border-zinc-100/50 hover:bg-zinc-100 transition-all group active:scale-95"
            >
              <div className="w-12 h-12 rounded-2xl bg-zinc-900 flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110">
                {copied ? <Check size={24} /> : <Link2 size={24} strokeWidth={2.5} />}
              </div>
              <span className="text-xs font-black text-zinc-600 uppercase tracking-widest">{copied ? "Copied" : "Link"}</span>
            </button>

            {/* Native Share */}
            <button 
              onClick={handleNativeShare}
              className="col-span-2 flex items-center justify-center gap-3 p-5 rounded-3xl bg-[#1A1A24] text-white border border-zinc-100/10 hover:bg-black transition-all group active:scale-[0.98]"
            >
              <Share size={20} strokeWidth={2.5} className="text-[#E5FF66]" />
              <span className="text-sm font-black uppercase tracking-widest">Share to other apps</span>
              <ExternalLink size={14} className="opacity-40" />
            </button>
          </div>

          <div className="px-6 pb-8 text-center">
            <p className="text-[10px] text-zinc-400 font-black uppercase tracking-[0.2em]">Spread the vibes</p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
