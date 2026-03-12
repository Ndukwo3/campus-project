import Image from "next/image";
import { MoreVertical, Heart, MessageCircle, Share, User } from "lucide-react";
import { useState } from "react";

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
  onLike?: (id: string) => void;
  onComment?: (id: string) => void;
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
  onLike,
  onComment,
}: FeedCardProps) {
  const [localIsLiked, setLocalIsLiked] = useState(isLiked);
  const [localLikesCount, setLocalLikesCount] = useState(likes);

  const handleLikeClick = () => {
    if (onLike) {
      onLike(id);
      // Optimistic update
      setLocalIsLiked(!localIsLiked);
      setLocalLikesCount(prev => localIsLiked ? prev - 1 : prev + 1);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4 bg-white rounded-[24px] mb-4 shadow-sm border border-zinc-100 transition-all hover:shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-full ring-2 ring-offset-2 ring-[#E5FF66] shrink-0 bg-zinc-50 flex items-center justify-center overflow-hidden">
            {authorImage ? (
              <Image
                src={authorImage}
                alt={authorName}
                width={44}
                height={44}
                className="rounded-full object-cover w-full h-full"
              />
            ) : (
              <User className="w-5 h-5 text-zinc-300" />
            )}
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-[15px] text-zinc-900 tracking-tight">{authorName}</span>
            <span className="text-[12px] text-zinc-400 font-medium">{timePosted}</span>
          </div>
        </div>
        <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-zinc-50 text-zinc-400 hover:text-zinc-900 transition-all">
          <MoreVertical size={18} />
        </button>
      </div>

      {/* Description */}
      <p className="text-zinc-700 text-[15px] leading-[1.6] font-medium px-1">
        {description}
      </p>

      {/* Image Content (Optional) */}
      {postImage && (
        <div className="w-full relative rounded-2xl overflow-hidden aspect-[4/5] sm:aspect-square bg-zinc-50 border border-zinc-100">
          <Image
            src={postImage}
            alt="Post content"
            fill
            className="object-cover"
          />
        </div>
      )}

      {/* Action Bar */}
      <div className="flex items-center justify-between mt-1 px-1">
        <div className="flex items-center gap-2">
          <button 
            onClick={handleLikeClick}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-full transition-all text-[13px] font-bold active:scale-90 ${
              localIsLiked 
              ? "bg-red-50 text-red-500" 
              : "bg-zinc-50 text-zinc-600 hover:bg-zinc-100"
            }`}
          >
            <Heart 
              size={18} 
              fill={localIsLiked ? "currentColor" : "none"} 
              className={localIsLiked ? "animate-pulse" : ""}
            />
            {localLikesCount}
          </button>
          <button 
            onClick={() => onComment?.(id)}
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-zinc-50 hover:bg-zinc-100 transition-all text-[13px] font-bold text-zinc-600 active:scale-95"
          >
            <MessageCircle size={18} />
            {comments}
          </button>
        </div>
        <button className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-zinc-50 hover:bg-zinc-100 transition-all text-[13px] font-bold text-zinc-600 active:scale-95">
          <Share size={18} />
          <span>Share</span>
        </button>
      </div>
    </div>
  );
}
