import Image from "next/image";
import { MoreVertical, Heart, MessageCircle, Share2, User, Flag, AlertTriangle, Trash2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";

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
  authorId: string;
  currentUserId?: string | null;
  onLike?: (id: string) => void;
  onComment?: (id: string) => void;
  onReport?: (id: string) => void;
  onDelete?: (id: string) => void;
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
  authorId,
  currentUserId,
  onLike,
  onComment,
  onReport,
  onDelete,
}: FeedCardProps) {
  const [localIsLiked, setLocalIsLiked] = useState(isLiked);
  const [localLikesCount, setLocalLikesCount] = useState(likes);

  useEffect(() => {
    setLocalIsLiked(isLiked);
  }, [isLiked]);

  useEffect(() => {
    setLocalLikesCount(likes);
  }, [likes]);

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

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-5 rounded-[32px] border border-zinc-100/60 shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex flex-col gap-4 mb-4 hover:shadow-[0_15px_40px_rgb(0,0,0,0.04)] transition-all duration-500"
    >
      {/* User Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl overflow-hidden bg-zinc-50 border border-zinc-100 flex items-center justify-center p-[1px] shadow-sm">
            {authorImage ? (
              <Image 
                src={authorImage} 
                alt={authorName} 
                width={48} 
                height={48} 
                className="object-cover w-full h-full rounded-2xl"
              />
            ) : (
              <User className="text-zinc-300 w-6 h-6" />
            )}
          </div>
          <div className="flex flex-col space-y-1">
            <h3 className="font-bold text-[15px] text-zinc-900 tracking-tight leading-none">{authorName}</h3>
            <span className="text-[10px] font-black uppercase tracking-[0.05em] text-zinc-400 opacity-80">{timePosted}</span>
          </div>
        </div>
        <div className="relative" ref={menuRef}>
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="w-10 h-10 flex items-center justify-center rounded-2xl bg-zinc-50/50 hover:bg-zinc-100 transition-colors border border-transparent hover:border-zinc-200"
          >
            <MoreVertical size={18} className="text-zinc-400" />
          </button>
          
          {isMenuOpen && (
            <div className="absolute right-0 top-12 w-48 bg-white/90 backdrop-blur-xl border border-zinc-100/50 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              {isOwner ? (
                <button 
                  onClick={handleDelete}
                  className="w-full px-4 py-3 text-left text-[13px] font-bold text-red-500 hover:bg-red-50 flex items-center gap-3 transition-colors"
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
                    className="w-full px-4 py-3 text-left text-[13px] font-bold text-red-500 hover:bg-red-50 flex items-center gap-3 transition-colors"
                  >
                    <Flag size={16} />
                    Report Post
                  </button>
                  <button 
                    onClick={() => setIsMenuOpen(false)}
                    className="w-full px-4 py-3 text-left text-[13px] font-bold text-zinc-600 hover:bg-zinc-50 flex items-center gap-3 transition-colors"
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
      <p className="text-zinc-700 text-[15.5px] leading-relaxed font-medium px-1 tracking-tight">
        {description === "[[USER_PROFILE_UPDATE]]" 
          ? (isOwner ? "You have updated your profile photo." : `${authorName} updated their profile photo.`)
          : description
        }
      </p>

      {/* Image Content (Optional) */}
      {postImage && (
        <div className="w-full relative rounded-[28px] overflow-hidden aspect-[4/5] sm:aspect-square bg-zinc-50 border border-zinc-100 shadow-sm group">
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
            className={`flex items-center gap-2.5 px-6 py-3.5 rounded-2xl transition-all text-sm font-black active:scale-90 ${
              localIsLiked 
              ? "bg-red-50 text-red-500 shadow-sm shadow-red-100" 
              : "bg-zinc-50 text-zinc-700 hover:bg-zinc-100 border border-transparent hover:border-zinc-200"
            }`}
          >
            <Heart 
              size={20} 
              fill={localIsLiked ? "currentColor" : "none"} 
              strokeWidth={localIsLiked ? 0 : 2.5}
            />
            {localLikesCount}
          </button>
          
          <button 
            onClick={() => onComment?.(id)}
            className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-zinc-50 text-zinc-700 hover:bg-zinc-100 border border-transparent hover:border-zinc-200 transition-all text-sm font-black active:scale-90"
          >
            <MessageCircle size={20} strokeWidth={2.5} />
            {comments}
          </button>
        </div>

        <button className="w-12 h-12 flex items-center justify-center rounded-2xl bg-zinc-50 text-zinc-400 hover:bg-[#E5FF66] hover:text-black hover:shadow-lg hover:shadow-[#E5FF66]/20 transition-all active:scale-90">
          <Share2 size={20} strokeWidth={2.5} />
        </button>
      </div>
    </motion.div>
  );
}
