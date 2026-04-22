"use client";

import { useEffect, useState, use } from "react";
import { ArrowLeft, Heart, MessageCircle, Share2, User, Bookmark, MoreVertical, Loader2, Repeat2 } from "lucide-react";
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { createClient } from "@/lib/supabase";
import { formatRelativeTime } from "@/lib/utils";
import BottomNavigation from "@/components/BottomNavigation";
import CommentModal from "@/components/CommentModal";
import { motion, AnimatePresence } from "framer-motion";
import Toast from "@/components/Toast";

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
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" | "warning"; isVisible: boolean }>({
    message: "",
    type: "success",
    isVisible: false,
  });

  const showToast = (message: string, type: "success" | "error" | "info" | "warning" = "success") => {
    setToast({ message, type, isVisible: true });
  };

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
          supabase.from('likes').select('*').match({ user_id: user.id, post_id: postId }).maybeSingle(),
          supabase.from('bookmarks').select('*').match({ user_id: user.id, post_id: postId }).maybeSingle()
        ]);
        setIsLiked(!!like);
        setIsBookmarked(!!bookmark);
      }

      // Fetch comments
      const { data: commentsData } = await supabase
        .from('comments')
        .select(`
          *,
          profiles (id, full_name, username, avatar_url)
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
    const wasLiked = isLiked;
    setIsLiked(!wasLiked);
    setPost({ ...post, likes_count: wasLiked ? Math.max(0, post.likes_count - 1) : post.likes_count + 1 });
    
    await supabase.rpc('toggle_post_like', { post_id_input: postId, user_id_input: currentUser.id });
    
    // Send notification if now liked
    if (!wasLiked && post.user_id !== currentUser.id) {
       await supabase.from('notifications').insert({
         user_id: post.user_id,
         sender_id: currentUser.id,
         type: 'like',
         content: `liked your post: "${post.content?.substring(0, 50)}${post.content?.length > 50 ? '...' : ''}"`,
         is_read: false
       });
    }
  };

  const handleRepost = async () => {
    if (!currentUser) return;
    
    const { data: existingRepost } = await supabase
      .from('reposts')
      .select('id')
      .match({ user_id: currentUser.id, post_id: postId })
      .maybeSingle();

    if (existingRepost) {
      await supabase.from('reposts').delete().eq('id', existingRepost.id);
      showToast("Repost removed");
    } else {
      await supabase.from('reposts').insert({ user_id: currentUser.id, post_id: postId });
      
      // Notify author
      if (post.user_id !== currentUser.id) {
        await supabase.from('notifications').insert({
          user_id: post.user_id,
          sender_id: currentUser.id,
          type: 'repost',
          content: `reposted your post: "${post.content?.substring(0, 50)}${post.content?.length > 50 ? '...' : ''}"`,
          is_read: false
        });
      }
      showToast("Post reposted!");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-900" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black pb-[100px] max-w-md mx-auto relative font-sans transition-colors">
      {/* Header */}
      <div className="flex items-center px-6 py-4 sticky top-0 bg-white/80 dark:bg-black/80 backdrop-blur-xl z-30 border-b border-zinc-100/50 dark:border-zinc-800/50">
        <button onClick={() => router.back()} className="mr-4 w-10 h-10 -ml-2 rounded-full flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors active:scale-90">
          <ArrowLeft size={20} className="text-zinc-900 dark:text-white" />
        </button>
        <div className="flex flex-col">
          <span className="font-black text-xl text-zinc-900 dark:text-white uppercase italic leading-none">Post</span>
          <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.2em] mt-0.5">Details</span>
        </div>
      </div>

      <div className="px-6 pt-6 pb-20">
        {/* Author info */}
        <div className="flex items-center justify-between mb-6">
          <Link href={`/profile/${post.profiles.id}`} className="flex items-center gap-3 group active:scale-[0.98] transition-all">
             <div className="w-14 h-14 rounded-[20px] overflow-hidden bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center border border-zinc-100 dark:border-zinc-800 shadow-sm group-hover:shadow-md transition-shadow">
               {post.profiles.avatar_url ? (
                 <Image src={post.profiles.avatar_url} alt={post.profiles.full_name} width={56} height={56} className="object-cover w-full h-full" />
               ) : (
                 <User className="w-6 h-6 text-zinc-300 dark:text-zinc-700" />
               )}
             </div>
             <div className="flex flex-col justify-center">
               <p className="font-bold text-[16px] text-zinc-900 dark:text-white leading-tight tracking-tight group-hover:underline underline-offset-2">{post.profiles.full_name}</p>
               <p className="text-[11px] text-zinc-400 dark:text-zinc-500 font-black uppercase tracking-[0.1em] mt-0.5">@{post.profiles.username}</p>
             </div>
          </Link>
          <button className="w-10 h-10 rounded-2xl flex items-center justify-center hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-400 dark:text-zinc-500 transition-colors">
             <MoreVertical size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="mb-6">
          <p className="text-[17px] text-zinc-800 dark:text-zinc-200 leading-[1.6] font-medium mb-5 tracking-tight">
            {post.content === "[[USER_PROFILE_UPDATE]]" ? "Just updated my profile photo!" : post.content}
          </p>
          
          {post.image_url && (
            <div className="rounded-[32px] overflow-hidden border border-zinc-100/50 dark:border-zinc-800/50 shadow-sm bg-zinc-50 dark:bg-zinc-900 mb-5 relative">
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
          
          <div className="flex items-center gap-2 text-zinc-400 dark:text-zinc-600">
            <p className="text-[11px] font-black uppercase tracking-[0.1em]">
              {new Date(post.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
            <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
            <p className="text-[11px] font-black uppercase tracking-[0.1em]">
               {new Date(post.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="py-5 border-y border-zinc-100 dark:border-zinc-800/50 flex flex-wrap items-center gap-x-8 gap-y-3 mb-2">
           <div className="flex items-baseline gap-1.5">
             <span className="font-black text-xl text-zinc-900 dark:text-white leading-none">{post.likes_count}</span>
             <span className="text-zinc-400 text-[10px] font-black uppercase tracking-[0.15em]">Likes</span>
           </div>
           <div className="flex items-baseline gap-1.5">
             <span className="font-black text-xl text-zinc-900 dark:text-white leading-none">{post.comments_count}</span>
             <span className="text-zinc-400 text-[10px] font-black uppercase tracking-[0.15em]">Comments</span>
           </div>
        </div>

        {/* Actions Row */}
        <div className="flex items-center justify-between py-3 mb-6">
           <button onClick={handleLike} className={`w-12 h-12 flex items-center justify-center rounded-2xl transition-colors active:scale-95 ${isLiked ? 'bg-red-50 dark:bg-red-500/10 text-red-500' : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}>
             <Heart size={22} fill={isLiked ? "currentColor" : "none"} strokeWidth={isLiked ? 2 : 2.5} />
           </button>
           <button onClick={() => setShowCommentModal(true)} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 transition-colors active:scale-95">
             <MessageCircle size={22} strokeWidth={2.5} />
           </button>
           <button onClick={handleRepost} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 transition-colors active:scale-95">
             <Repeat2 size={22} strokeWidth={2.5} />
           </button>
           <button onClick={() => setIsBookmarked(!isBookmarked)} className={`w-12 h-12 flex items-center justify-center rounded-2xl transition-colors active:scale-95 ${isBookmarked ? 'bg-emerald-50 dark:bg-[#E5FF66]/10 text-emerald-500 dark:text-[#E2FF3D]' : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}>
             <Bookmark size={22} fill={isBookmarked ? "currentColor" : "none"} strokeWidth={isBookmarked ? 2 : 2.5} />
           </button>
           <button className="w-12 h-12 flex items-center justify-center rounded-2xl bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 transition-colors active:scale-95">
             <Share2 size={22} strokeWidth={2.5} />
           </button>
        </div>

        {/* Comments List */}
        <div className="space-y-6 pb-6">
           {comments.map((comment) => (
             <div key={comment.id} className="flex gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <Link href={`/profile/${comment.profiles?.id || ''}`} className="w-[42px] h-[42px] rounded-2xl overflow-hidden bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 flex-shrink-0 flex items-center justify-center shrink-0">
                   {comment.profiles?.avatar_url ? (
                     <Image src={comment.profiles.avatar_url} alt={comment.profiles.full_name || 'User'} width={42} height={42} className="object-cover w-full h-full" />
                   ) : (
                     <User className="w-5 h-5 text-zinc-300 dark:text-zinc-700" />
                   )}
                </Link>
                <div className="flex-1">
                   <div className="flex items-baseline gap-2 mb-1">
                      <span className="font-bold text-[14px] text-zinc-900 dark:text-white leading-none">{comment.profiles?.full_name || 'Anonymous User'}</span>
                      <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-[0.05em]">{formatRelativeTime(comment.created_at)}</span>
                   </div>
                   <p className="text-zinc-700 dark:text-zinc-300 text-[14.5px] font-medium leading-[1.5] mt-1.5">{comment.content}</p>
                </div>
             </div>
           ))}
           {comments.length === 0 && (
             <div className="py-12 flex flex-col items-center justify-center text-center bg-zinc-50/50 dark:bg-zinc-900/20 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800">
                <MessageCircle size={32} className="text-zinc-300 dark:text-zinc-700 mb-3" />
                <p className="text-zinc-900 dark:text-white font-bold text-sm mb-1">No comments yet</p>
                <p className="text-zinc-400 text-xs tracking-wide">Be the first to share your thoughts.</p>
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
            postAuthorId={post.user_id}
            postContent={post.content}
            showToast={showToast}
          />
        )}
      </AnimatePresence>

      <Toast 
        message={toast.message} 
        type={toast.type} 
        isVisible={toast.isVisible} 
        onClose={() => setToast({ ...toast, isVisible: false })} 
      />

      <BottomNavigation />
    </div>
  );
}
