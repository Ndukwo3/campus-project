"use client";

import { useEffect, useState, use } from "react";
import { ArrowLeft, Heart, MessageCircle, Share2, User, Bookmark, MoreVertical, Loader2 } from "lucide-react";
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { createClient } from "@/lib/supabase";
import { formatRelativeTime } from "@/lib/utils";
import BottomNavigation from "@/components/BottomNavigation";
import CommentModal from "@/components/CommentModal";
import { motion, AnimatePresence } from "framer-motion";

export default function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: postId } = use(params);
  const router = useRouter();
  const supabase = createClient();
  
  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showCommentModal, setShowCommentModal] = useState(false);

  useEffect(() => {
    async function fetchPostDetail() {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);

      const { data: postData } = await supabase
        .from('posts')
        .select(`
          *,
          profiles (id, full_name, username, avatar_url)
        `)
        .eq('id', postId)
        .single();

      if (!postData) {
        router.push('/');
        return;
      }

      setPost(postData);

      // Check like/bookmark status
      if (user) {
        const [{ data: like }, { data: bookmark }] = await Promise.all([
          supabase.from('post_likes').select('*').match({ user_id: user.id, post_id: postId }).maybeSingle(),
          supabase.from('bookmarks').select('*').match({ user_id: user.id, post_id: postId }).maybeSingle()
        ]);
        setIsLiked(!!like);
        setIsBookmarked(!!bookmark);
      }

      // Fetch comments (if you have a comments table)
      const { data: commentsData } = await supabase
        .from('post_comments')
        .select(`
          *,
          profiles (full_name, username, avatar_url)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      setComments(commentsData || []);
      setIsLoading(false);
    }

    fetchPostDetail();
  }, [postId, supabase, router]);

  const handleLike = async () => {
    if (!currentUser) return;
    setIsLiked(!isLiked);
    setPost({ ...post, likes_count: isLiked ? post.likes_count - 1 : post.likes_count + 1 });
    await supabase.rpc('toggle_post_like', { post_id_input: postId, user_id_input: currentUser.id });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-900" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-[100px] max-w-md mx-auto relative font-sans">
      {/* Header */}
      <div className="flex items-center px-6 py-4 sticky top-0 bg-white/80 backdrop-blur-md z-30 border-b border-zinc-50">
        <button onClick={() => router.back()} className="mr-4 p-2 -ml-2 rounded-full hover:bg-zinc-100 transition">
          <ArrowLeft size={20} className="text-black" />
        </button>
        <span className="font-black text-lg text-black">Post</span>
      </div>

      <div className="p-6">
        {/* Author info */}
        <div className="flex items-center justify-between mb-4">
          <Link href={`/profile/${post.profiles.id}`} className="flex items-center gap-3">
             <div className="w-12 h-12 rounded-2xl overflow-hidden bg-zinc-100 flex items-center justify-center border border-zinc-100">
               {post.profiles.avatar_url ? (
                 <Image src={post.profiles.avatar_url} alt={post.profiles.full_name} width={48} height={48} className="object-cover" />
               ) : (
                 <User className="w-6 h-6 text-zinc-300" />
               )}
             </div>
             <div>
               <p className="font-black text-black leading-tight">{post.profiles.full_name}</p>
               <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest">{post.profiles.username}</p>
             </div>
          </Link>
          <button className="p-2 rounded-full hover:bg-zinc-50 text-zinc-400">
             <MoreVertical size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="mb-6">
          <p className="text-lg text-zinc-800 leading-relaxed font-medium mb-4">
            {post.content === "[[USER_PROFILE_UPDATE]]" ? "Just updated my profile photo!" : post.content}
          </p>
          
          {post.image_url && (
            <div className="rounded-3xl overflow-hidden border border-zinc-100 shadow-sm bg-zinc-50 mb-4">
              <Image 
                src={post.image_url} 
                alt="Post content" 
                layout="responsive" 
                width={100} 
                height={125} 
                className="object-cover" 
              />
            </div>
          )}
          
          <p className="text-zinc-400 text-sm font-bold tracking-tight">
            {new Date(post.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {new Date(post.created_at).toLocaleDateString()}
          </p>
        </div>

        {/* Stats Row */}
        <div className="py-4 border-y border-zinc-50 flex items-center gap-6 mb-4">
           <div className="flex items-center gap-1.5">
             <span className="font-black text-black">{post.likes_count}</span>
             <span className="text-zinc-400 text-sm font-bold">Likes</span>
           </div>
           <div className="flex items-center gap-1.5">
             <span className="font-black text-black">{post.comments_count}</span>
             <span className="text-zinc-400 text-sm font-bold">Comments</span>
           </div>
        </div>

        {/* Actions Row */}
        <div className="flex items-center justify-between px-2 mb-8">
           <button onClick={handleLike} className={`${isLiked ? 'text-red-500' : 'text-zinc-400'} flex items-center gap-2 p-2`}>
             <Heart size={24} fill={isLiked ? "currentColor" : "none"} strokeWidth={2.5} />
           </button>
           <button onClick={() => setShowCommentModal(true)} className="text-zinc-400 flex items-center gap-2 p-2">
             <MessageCircle size={24} strokeWidth={2.5} />
           </button>
           <button onClick={() => setIsBookmarked(!isBookmarked)} className={`${isBookmarked ? 'text-[#E5FF66]' : 'text-zinc-400'} flex items-center gap-2 p-2`}>
             <Bookmark size={24} fill={isBookmarked ? "currentColor" : "none"} strokeWidth={2.5} />
           </button>
           <button className="text-zinc-400 flex items-center gap-2 p-2">
             <Share2 size={24} strokeWidth={2.5} />
           </button>
        </div>

        {/* Comments List */}
        <div className="space-y-6">
           {comments.map((comment) => (
             <div key={comment.id} className="flex gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="w-10 h-10 rounded-xl overflow-hidden bg-zinc-50 border border-zinc-100 flex-shrink-0">
                   {comment.profiles.avatar_url ? (
                     <Image src={comment.profiles.avatar_url} alt={comment.profiles.full_name} width={40} height={40} className="object-cover" />
                   ) : (
                     <User className="p-2 text-zinc-200" />
                   )}
                </div>
                <div>
                   <div className="flex items-center gap-2 mb-1">
                      <span className="font-black text-sm text-black">{comment.profiles.full_name}</span>
                      <span className="text-xs text-zinc-400 font-bold">{formatRelativeTime(comment.created_at)}</span>
                   </div>
                   <p className="text-zinc-700 text-[15px] font-medium leading-relaxed">{comment.content}</p>
                </div>
             </div>
           ))}
           {comments.length === 0 && (
             <div className="py-10 text-center">
                <p className="text-zinc-400 text-sm font-bold tracking-widest uppercase">No comments yet</p>
             </div>
           )}
        </div>
      </div>

      <AnimatePresence>
        {showCommentModal && (
          <CommentModal 
            isOpen={true}
            onClose={() => setShowCommentModal(false)}
            postId={postId}
            postAuthor={post.profiles.full_name}
            postContent={post.content}
          />
        )}
      </AnimatePresence>

      <BottomNavigation />
    </div>
  );
}
