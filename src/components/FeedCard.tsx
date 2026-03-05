import Image from "next/image";
import { MoreVertical, Heart, MessageCircle, Share } from "lucide-react";

interface FeedCardProps {
  authorName: string;
  authorImage: string;
  timePosted: string;
  postImage: string;
  likes: number;
  comments: number;
  description: string;
}

export default function FeedCard({
  authorName,
  authorImage,
  timePosted,
  postImage,
  likes,
  comments,
  description,
}: FeedCardProps) {
  return (
    <div className="flex flex-col gap-4 p-4 bg-white rounded-[24px] mb-4 shadow-sm border border-zinc-100">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full ring-2 ring-offset-2 ring-[#E5FF66] shrink-0">
            <Image
              src={authorImage}
              alt={authorName}
              width={48}
              height={48}
              className="rounded-full object-cover w-full h-full"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-black">{authorName}</span>
            <span className="text-sm text-zinc-500">{timePosted}</span>
          </div>
        </div>
        <button className="text-zinc-500 hover:text-black transition">
          <MoreVertical size={20} />
        </button>
      </div>

      {/* Description */}
      <p className="text-zinc-600 text-[15px] leading-relaxed mb-1 mt-1">
        {description}
      </p>

      {/* Image Content */}
      <div className="w-full relative rounded-2xl overflow-hidden aspect-[4/5] sm:aspect-square">
        <Image
          src={postImage}
          alt="Post content"
          fill
          className="object-cover"
        />
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between mt-1">
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-50 hover:bg-zinc-100 transition text-sm font-medium text-black">
            <Heart size={18} fill="#ef4444" stroke="none" />
            {likes}
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-50 hover:bg-zinc-100 transition text-sm font-medium text-black">
            <MessageCircle size={18} />
            {comments}
          </button>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-50 hover:bg-zinc-100 transition text-sm font-medium text-black">
          <Share size={18} />
          Share
        </button>
      </div>
    </div>
  );
}
