"use client";

import { useState, useEffect } from "react";
import { X, Send, User, Loader2, Heart, MessageCircle, CornerDownRight } from "lucide-react";
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
  const [replyingTo, setReplyingTo] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    };
    getUser();
  }, [supabase]);

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
        profiles:user_id (username, full_name, avatar_url),
        comment_likes (user_id)
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
    if (currentUser) {
      const { error } = await supabase.from("comments").insert({
        post_id: postId,
        user_id: currentUser.id,
        content: comment.trim(),
        parent_id: replyingTo?.id || null,
      });

      if (!error) {
        setComment("");
        setReplyingTo(null);
        // Realtime will pick up the change
      }
    }
    setIsSubmitting(false);
  };

  const handleLikeComment = async (commentId: string, isLiked: boolean) => {
    if (!currentUser) return;

    // 🚀 Optimistic local update
    setComments(prev => 
      prev.map(c => 
        c.id === commentId 
          ? { 
              ...c, 
              comment_likes: isLiked 
                ? c.comment_likes?.filter((l: any) => l.user_id !== currentUser.id) 
                : [...(c.comment_likes || []), { user_id: currentUser.id }] 
            } 
          : c
      )
    );

    if (isLiked) {
      await supabase
        .from("comment_likes")
        .delete()
        .match({ comment_id: commentId, user_id: currentUser.id });
    } else {
      await supabase
        .from("comment_likes")
        .insert({ comment_id: commentId, user_id: currentUser.id });
    }
    // Deep sync eventually (optional since user has optimistic state)
    // fetchComments(); 
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
        {postContent && (
          <div className="px-6 py-4 bg-zinc-50/50 border-b border-zinc-100/50">
            <p className="text-zinc-600 text-[14px] line-clamp-2 italic leading-relaxed">
              "{postContent}"
            </p>
          </div>
        )}

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto px-6 py-4 min-h-[300px] flex flex-col gap-5">
          {isLoading && comments.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-zinc-300" />
            </div>
          ) : comments.length > 0 ? (
            <div className="flex flex-col gap-6">
              {comments.filter(c => !c.parent_id).map((c) => {
                const replies = comments.filter(r => r.parent_id === c.id);
                const isLiked = c.comment_likes?.some((l: any) => l.user_id === currentUser?.id);
                const likesCount = c.comment_likes?.length || 0;

                return (
                  <div key={c.id} className="flex flex-col gap-3">
                    <div className="flex gap-3 items-start animate-in fade-in slide-in-from-left-2 duration-300">
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
                      <div className="flex-1 flex flex-col gap-1.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[13px] text-zinc-900">{c.profiles?.full_name || c.profiles?.username}</span>
                            <span className="text-[10px] text-zinc-400 font-medium">
                              {new Date(c.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                        <div className="bg-zinc-50 px-4 py-2.5 rounded-[22px] rounded-tl-none border border-zinc-100/50">
                          <p className="text-zinc-700 text-[14px] leading-relaxed">{c.content}</p>
                        </div>
                        <div className="flex items-center gap-4 px-1 mt-0.5">
                          <button 
                            onClick={() => handleLikeComment(c.id, !!isLiked)}
                            className={`flex items-center gap-1.5 text-[11px] font-bold transition-colors ${isLiked ? 'text-red-500' : 'text-zinc-400 hover:text-zinc-600'}`}
                          >
                            <Heart size={14} fill={isLiked ? "currentColor" : "none"} strokeWidth={isLiked ? 0 : 2.5} />
                            {likesCount > 0 && likesCount} Like
                          </button>
                          <button 
                            onClick={() => {
                              setReplyingTo(c);
                              const input = document.getElementById('comment-input');
                              if (input) input.focus();
                            }}
                            className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-400 hover:text-zinc-600 transition-colors"
                          >
                            <MessageCircle size={14} strokeWidth={2.5} />
                            Reply
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Replies */}
                    {replies.length > 0 && (
                      <div className="ml-12 flex flex-col gap-4 mt-1 border-l-2 border-zinc-50 pl-4">
                        {replies.map(reply => {
                          const replyIsLiked = reply.comment_likes?.some((l: any) => l.user_id === currentUser?.id);
                          const replyLikesCount = reply.comment_likes?.length || 0;
                          return (
                            <div key={reply.id} className="flex gap-3 items-start animate-in fade-in slide-in-from-left-1 duration-300">
                               <div className="h-7 w-7 rounded-full ring-1 ring-zinc-50 shrink-0 bg-zinc-50 flex items-center justify-center overflow-hidden">
                                {reply.profiles?.avatar_url ? (
                                  <Image
                                    src={reply.profiles.avatar_url}
                                    alt={reply.profiles.username}
                                    width={28}
                                    height={28}
                                    className="rounded-full object-cover w-full h-full"
                                  />
                                ) : (
                                  <User className="w-3 h-3 text-zinc-300" />
                                )}
                              </div>
                              <div className="flex-1 flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-[12px] text-zinc-900">{reply.profiles?.full_name || reply.profiles?.username}</span>
                                  <span className="text-[9px] text-zinc-400 font-medium">
                                    {new Date(reply.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                                <div className="bg-zinc-50/80 px-3 py-2 rounded-[18px] rounded-tl-none border border-zinc-100/30">
                                  <p className="text-zinc-700 text-[13px] leading-relaxed">{reply.content}</p>
                                </div>
                                <div className="flex items-center gap-3 px-1 mt-0.5">
                                  <button 
                                    onClick={() => handleLikeComment(reply.id, !!replyIsLiked)}
                                    className={`flex items-center gap-1 text-[10px] font-bold transition-colors ${replyIsLiked ? 'text-red-500' : 'text-zinc-400 hover:text-zinc-600'}`}
                                  >
                                    <Heart size={12} fill={replyIsLiked ? "currentColor" : "none"} strokeWidth={replyIsLiked ? 0 : 2.5} />
                                    {replyLikesCount > 0 && replyLikesCount}
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
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
          {replyingTo && (
            <div className="flex items-center justify-between px-4 py-2 bg-zinc-50 rounded-t-2xl border-x border-t border-zinc-100 mb-0 animate-in slide-in-from-bottom-2">
              <p className="text-[11px] font-bold text-zinc-500 flex items-center gap-1.5">
                <CornerDownRight size={12} className="text-zinc-400" />
                Replying to <span className="text-zinc-900">{replyingTo.profiles?.full_name || replyingTo.profiles?.username}</span>
              </p>
              <button 
                onClick={() => setReplyingTo(null)}
                className="text-[11px] font-black uppercase tracking-widest text-zinc-400 hover:text-red-500 transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
          <form 
            onSubmit={handleSubmit}
            className={`flex items-center gap-2 bg-zinc-50 p-1.5 rounded-full border border-zinc-100 focus-within:ring-2 ring-[#E5FF66]/30 transition-all ${replyingTo ? 'rounded-t-none' : ''}`}
          >
            <input
              id="comment-input"
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={replyingTo ? "Write a reply..." : "Write a comment..."}
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
