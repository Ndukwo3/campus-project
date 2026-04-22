import Image from "next/image";
import Link from "next/link";
import { MoreVertical, Heart, MessageCircle, Share2, User, Flag, AlertTriangle, Trash2, Bookmark, BookmarkCheck, Repeat2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { usePresenceStore } from "@/store/presenceStore";
import { createClient } from "@/lib/supabase";
import ActiveText from "./ActiveText";
import { capitalizeName } from "@/lib/utils";

interface FeedCardProps {
  id: string;
  authorName: string;
  authorImage: string | null;
  timePosted: string;
  postImage: string | null;
  likes: number;
  comments: number;
  description: string;
  isLiked?: boolean;
  isBookmarked?: boolean;
  authorId: string;
  currentUserId?: string | null;
  onLike?: (id: string) => void;
  onComment?: (id: string) => void;
  onReport?: (id: string) => void;
  onDelete?: (id: string) => void;
  onShare?: (id: string) => void;
  onBookmark?: (id: string) => void;
  onRepost?: (id: string) => void;
  isReposted?: boolean;
  onNotInterested?: (id: string) => void;
}

export default function FeedCard({
  id,
  authorName,
  authorImage,
  timePosted,
  postImage,
  likes,
  comments,
  description,
  isLiked = false,
  isBookmarked = false,
  isReposted = false,
  authorId,
  currentUserId,
  onLike,
  onComment,
  onReport,
  onDelete,
  onShare,
  onBookmark,
  onRepost,
  onNotInterested,
}: FeedCardProps) {
  const [localIsLiked, setLocalIsLiked] = useState(isLiked);
  const [localLikesCount, setLocalLikesCount] = useState(likes);
  const [localIsBookmarked, setLocalIsBookmarked] = useState(isBookmarked);
  const [localIsReposted, setLocalIsReposted] = useState(isReposted);
  const [isHidden, setIsHidden] = useState(false);

  useEffect(() => {
    setLocalIsLiked(isLiked);
  }, [isLiked]);

  useEffect(() => {
    setLocalIsBookmarked(isBookmarked);
  }, [isBookmarked]);

  useEffect(() => {
    setLocalLikesCount(likes);
  }, [likes]);

  useEffect(() => {
    setLocalIsReposted(isReposted);
  }, [isReposted]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`post_updates_${id}`)
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'posts', 
        filter: `id=eq.${id}` 
      }, (payload: { new: { likes_count?: number } }) => {
        if (payload.new && typeof payload.new.likes_count === 'number') {
          setLocalLikesCount(payload.new.likes_count);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isOwner = authorId === (currentUserId || "");

  const handleDelete = () => {
    onDelete?.(id);
    setIsMenuOpen(false);
  };

  const handleLikeClick = () => {
    if (onLike) {
      onLike(id);
      // Optimistic update
      setLocalIsLiked(!localIsLiked);
      setLocalLikesCount(prev => localIsLiked ? prev - 1 : prev + 1);
    }
  };

  const { onlineUsers } = usePresenceStore();
  const isOnline = onlineUsers.has(authorId);

  if (isHidden) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="bg-white dark:bg-zinc-900/40 p-5 rounded-[32px] border border-zinc-100/60 dark:border-zinc-800/40 shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex flex-col gap-4 mb-4 hover:shadow-[0_15px_40px_rgb(0,0,0,0.04)] dark:hover:shadow-[0_15px_40px_rgb(0,0,0,0.2)] transition-all duration-500"
    >
      {/* User Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-3">
          <Link 
            href={`/profile/${authorId}`}
            className="w-12 h-12 rounded-2xl overflow-hidden bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 flex items-center justify-center p-[1px] shadow-sm hover:scale-105 active:scale-95 transition-transform relative"
          >
            {authorImage ? (
              <Image 
                src={authorImage} 
                alt={authorName} 
                width={48} 
                height={48} 
                className="object-cover w-full h-full rounded-2xl"
              />
            ) : (
              <User className="text-zinc-300 dark:text-zinc-600 w-6 h-6" />
            )}
          </Link>
          <div className="flex flex-col space-y-1">
            <Link 
              href={`/profile/${authorId}`}
              className="font-bold text-[15px] text-zinc-900 dark:text-zinc-100 tracking-tight leading-none hover:text-black dark:hover:text-white cursor-pointer"
            >
              {capitalizeName(authorName)}
            </Link>
            <span className="text-[10px] font-black uppercase tracking-[0.05em] text-zinc-400 dark:text-zinc-500 opacity-80">{timePosted}</span>
          </div>
        </div>
        <div className="relative" ref={menuRef}>
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="w-10 h-10 flex items-center justify-center rounded-2xl bg-zinc-50/50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700"
          >
            <MoreVertical size={18} className="text-zinc-400 dark:text-zinc-500" />
          </button>
          
          {isMenuOpen && (
            <div className="absolute right-0 top-12 w-48 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-zinc-100/50 dark:border-zinc-800/50 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden">
              <Link 
                href={`/profile/${authorId}`}
                className="w-full px-4 py-3 text-left text-[13px] font-bold text-zinc-900 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center gap-3 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <User size={16} />
                View Profile
              </Link>

              {isOwner ? (
                <button 
                  onClick={handleDelete}
                  className="w-full px-4 py-3 text-left text-[13px] font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center gap-3 transition-colors"
                >
                  <Trash2 size={16} />
                  Delete Post
                </button>
              ) : (
                <>
                  <button 
                    onClick={() => {
                      onReport?.(id);
                      setIsMenuOpen(false);
                    }}
                    className="w-full px-4 py-3 text-left text-[13px] font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center gap-3 transition-colors"
                  >
                    <Flag size={16} />
                    Report Post
                  </button>
                  <button 
                    onClick={() => {
                      setIsHidden(true);
                      onNotInterested?.(id);
                      setIsMenuOpen(false);
                    }}
                    className="w-full px-4 py-3 text-left text-[13px] font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center gap-3 transition-colors border-t border-zinc-100 dark:border-zinc-800"
                  >
                    <AlertTriangle size={16} />
                    Not Interested
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      {description && description !== "[[USER_PROFILE_UPDATE]]" && description !== "Just updated my profile photo!" && (
        <ActiveText 
          text={description} 
          className="text-zinc-700 dark:text-zinc-300 text-[15.5px] leading-relaxed font-medium px-1 tracking-tight" 
        />
      )}

      {/* Image Content (Optional) */}
      {postImage && (
        <div className="w-full relative rounded-[28px] overflow-hidden aspect-[4/5] sm:aspect-square bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-800 shadow-sm group">
          <Image
            src={postImage}
            alt="Post content"
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-700"
          />
        </div>
      )}

      {/* Action Bar */}
      <div className="flex items-center justify-between mt-1 px-1">
        <div className="flex items-center gap-3">
          <button 
            onClick={handleLikeClick}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all text-[13px] font-black active:scale-90 ${
              localIsLiked 
              ? "bg-red-50 dark:bg-red-500/10 text-red-500 shadow-sm shadow-red-100 dark:shadow-none" 
              : "bg-zinc-50 dark:bg-zinc-800/50 text-zinc-700 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700"
            }`}
          >
            <Heart 
              size={18} 
              fill={localIsLiked ? "currentColor" : "none"} 
              strokeWidth={localIsLiked ? 0 : 2.5}
            />
            {localLikesCount}
          </button>
          
          <button 
            onClick={() => onComment?.(id)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 text-zinc-700 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700 transition-all text-[13px] font-black active:scale-90"
          >
            <MessageCircle size={18} strokeWidth={2.5} />
            {comments}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => {
              if (onBookmark) {
                onBookmark(id);
                setLocalIsBookmarked(!localIsBookmarked);
              }
            }}
            className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all active:scale-90 ${
              localIsBookmarked 
              ? "bg-zinc-900 dark:bg-[#E5FF66] text-[#E5FF66] dark:text-black shadow-lg shadow-black/10" 
              : "bg-zinc-50 dark:bg-zinc-800 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-600"
            }`}
          >
            {localIsBookmarked ? <BookmarkCheck size={18} /> : <Bookmark size={18} strokeWidth={2.5} />}
          </button>

          <button 
            onClick={() => {
              if (onRepost) {
                onRepost(id);
                setLocalIsReposted(!localIsReposted);
              }
            }}
            className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all active:scale-90 ${
              localIsReposted 
              ? "bg-[#E5FF66] text-black shadow-lg shadow-[#E5FF66]/20" 
              : "bg-zinc-50 dark:bg-zinc-800 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-600"
            }`}
          >
            <Repeat2 size={18} strokeWidth={2.5} />
          </button>

          <button 
            onClick={() => onShare?.(id)}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-zinc-50 dark:bg-zinc-800 text-zinc-400 hover:bg-zinc-900 hover:text-white dark:hover:bg-white dark:hover:text-black transition-all active:scale-90 border border-transparent hover:border-zinc-800 dark:hover:border-zinc-700"
          >
            <Share2 size={18} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
