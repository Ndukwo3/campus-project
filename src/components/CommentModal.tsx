"use client";

import { useState, useEffect } from "react";
import { X, Send, User, Loader2 } from "lucide-react";
import Image from "next/image";
import { createClient } from "@/lib/supabase";

interface CommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
  postAuthor: string;
  postContent: string;
}

export default function CommentModal({
  isOpen,
  onClose,
  postId,
  postAuthor,
  postContent,
}: CommentModalProps) {
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (isOpen) {
      fetchComments();
      // Subscribe to new comments
      const channel = supabase
        .channel(`post-comments-${postId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "comments",
            filter: `post_id=eq.${postId}`,
          },
          () => {
            fetchComments();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [isOpen, postId]);

  const fetchComments = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("comments")
      .select(`
        *,
        profiles:user_id (username, full_name, avatar_url)
      `)
      .eq("post_id", postId)
      .order("created_at", { ascending: true });

    if (data) {
      setComments(data);
    }
    setIsLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setIsSubmitting(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { error } = await supabase.from("comments").insert({
        post_id: postId,
        user_id: user.id,
        content: comment.trim(),
      });

      if (!error) {
        setComment("");
        // Realtime will pick up the change
      }
    }
    setIsSubmitting(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm transition-opacity">
      <div 
        className="w-full max-w-md bg-white rounded-t-[32px] sm:rounded-[32px] overflow-hidden flex flex-col max-h-[90vh] shadow-2xl animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 flex items-center justify-between border-b border-zinc-100/80">
          <div className="flex flex-col">
            <h3 className="font-extrabold text-[16px] text-zinc-900 leading-none mb-1">Comments</h3>
            <p className="text-[12px] text-zinc-400 font-medium">Post by {postAuthor}</p>
          </div>
          <button 
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-zinc-50 hover:bg-zinc-100 text-zinc-400 hover:text-zinc-900 transition-all active:scale-90"
          >
            <X size={18} />
          </button>
        </div>

        {/* Post Preview (Sticky-ish) */}
        <div className="px-6 py-4 bg-zinc-50/50 border-b border-zinc-100/50">
          <p className="text-zinc-600 text-[14px] line-clamp-2 italic leading-relaxed">
            "{postContent}"
          </p>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto px-6 py-4 min-h-[300px] flex flex-col gap-5">
          {isLoading && comments.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-zinc-300" />
            </div>
          ) : comments.length > 0 ? (
            comments.map((c) => (
              <div key={c.id} className="flex gap-3 items-start animate-in fade-in slide-in-from-left-2 duration-300">
                <div className="h-9 w-9 rounded-full ring-1 ring-zinc-100 shrink-0 bg-zinc-50 flex items-center justify-center overflow-hidden">
                  {c.profiles?.avatar_url ? (
                    <Image
                      src={c.profiles.avatar_url}
                      alt={c.profiles.username}
                      width={36}
                      height={36}
                      className="rounded-full object-cover w-full h-full"
                    />
                  ) : (
                    <User className="w-4 h-4 text-zinc-300" />
                  )}
                </div>
                <div className="flex flex-col gap-1 max-w-[85%]">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[13px] text-zinc-900">{c.profiles?.full_name || c.profiles?.username}</span>
                    <span className="text-[10px] text-zinc-400 font-medium">
                      {new Date(c.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="bg-zinc-50 px-4 py-2.5 rounded-[20px] rounded-tl-none border border-zinc-100/50">
                    <p className="text-zinc-700 text-[14px] leading-relaxed">{c.content}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-10 opacity-60">
               <div className="w-12 h-12 bg-zinc-50 rounded-full flex items-center justify-center mb-3">
                 <Send className="w-5 h-5 text-zinc-300" />
               </div>
               <p className="text-zinc-400 text-sm font-medium">No comments yet. Start the conversation!</p>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-zinc-100/80 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          <form 
            onSubmit={handleSubmit}
            className="flex items-center gap-2 bg-zinc-50 p-1.5 rounded-full border border-zinc-100 focus-within:ring-2 ring-[#E5FF66]/30 transition-all"
          >
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 bg-transparent border-none outline-none px-4 py-2 text-[14px] text-zinc-900 placeholder:text-zinc-400 font-medium"
            />
            <button
              type="submit"
              disabled={!comment.trim() || isSubmitting}
              className={`w-10 h-10 flex items-center justify-center rounded-full transition-all active:scale-90 ${
                comment.trim() 
                ? "bg-[#E5FF66] text-zinc-900 shadow-sm" 
                : "bg-zinc-200 text-zinc-400"
              }`}
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send size={18} fill={comment.trim() ? "currentColor" : "none"} strokeWidth={comment.trim() ? 1 : 2} />
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
