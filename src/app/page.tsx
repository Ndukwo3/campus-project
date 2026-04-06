"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { formatRelativeTime } from "@/lib/utils";
import TopNavigation from "@/components/TopNavigation";
import StoriesBar from "@/components/StoriesBar";
import FeedCard from "@/components/FeedCard";
import BottomNavigation from "@/components/BottomNavigation";
import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";
import FeedCardSkeleton from "@/components/skeletons/FeedCardSkeleton";
import { Loader2, Sparkles, Plus } from "lucide-react";
import Toast from "@/components/Toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import SuggestedConnections from "@/components/SuggestedConnections";
import Link from "next/link";

export default function Home() {
  const router = useRouter();
  const supabase = createClient();
  const queryClient = useQueryClient();
  const [user, setUser] = useState<any>(null);
  
  // States
  const [hasClickedContinue, setHasClickedContinue] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedPostForDelete, setSelectedPostForDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" | "warning"; isVisible: boolean }>({
    message: "",
    type: "success",
    isVisible: false,
  });

  const showToast = (message: string, type: "success" | "error" | "info" | "warning" = "success") => {
    setToast({ message, type, isVisible: true });
  };

  const [userUniId, setUserUniId] = useState<string | undefined>(undefined);
  const [connectionCount, setConnectionCount] = useState(0);

  // Auto-save loop complete flag as soon as they hit 5 connections
  useEffect(() => {
    if (user?.id && connectionCount >= 5) {
      localStorage.setItem(`loop_complete_${user.id}`, 'true');
    }
  }, [connectionCount, user?.id]);

  // 1. Initial State Sync
  useEffect(() => {
    async function init() {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        router.push("/welcome");
        return;
      }
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', authUser.id).single();
      if (profile) {
        setUser(profile);
        setUserUniId(profile.university_id);
        // If user has previously completed onboarding, skip loop builder
        const loopDone = localStorage.getItem(`loop_complete_${authUser.id}`);
        if (loopDone) setHasClickedContinue(true);
      }
    }
    init();
  }, [supabase, router]);


  // 2. Fetch Posts
  const { data: postsData, isLoading: isLoadingPosts } = useQuery({
    queryKey: ['posts', user?.id, userUniId],
    queryFn: async () => {
      const { data: dbPosts, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles:user_id (username, full_name, avatar_url)
        `)
        .order('created_at', { ascending: false });


      if (error) return [];

      const [userLikes, userBookmarks, userReposts] = await Promise.all([
        supabase.from('likes').select('post_id').eq('user_id', user.id),
        supabase.from('bookmarks').select('post_id').eq('user_id', user.id),
        supabase.from('reposts').select('post_id').eq('user_id', user.id)
      ]);

      const likedPostIds = new Set(userLikes.data?.map((l: any) => l.post_id) || []);
      const bookmarkedPostIds = new Set(userBookmarks.data?.map((b: any) => b.post_id) || []);
      const repostedPostIds = new Set(userReposts.data?.map((r: any) => r.post_id) || []);

      return (dbPosts || []).map((post: any) => ({
        ...post,
        isLiked: likedPostIds.has(post.id),
        isBookmarked: bookmarkedPostIds.has(post.id),
        isReposted: repostedPostIds.has(post.id)
      }));


    },
    enabled: !!user?.id,
    refetchOnWindowFocus: false, // 🚫 Prevent accidental jumps during interactions
  });

  const userLoading = isLoadingPosts || !user;

  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <Loader2 className="w-8 h-8 animate-spin text-[#E5FF66]" />
      </div>
    );
  }


  const posts = postsData || [];

  const updatePostCache = (postId: string, updater: (post: any) => any) => {
    queryClient.setQueryData(['posts', user?.id, userUniId], (old: any) => {
      if (!old) return old;
      return old.map((p: any) => p.id === postId ? updater(p) : p);
    });
  };

  const handleLike = async (postId: string) => {
    if (!user) return;
    const post = posts.find((p: any) => p.id === postId);
    if (!post) return;

    const wasLiked = post.isLiked;
    
    // Optimistic Update
    updatePostCache(postId, (p) => ({
      ...p,
      isLiked: !wasLiked,
      likes_count: wasLiked ? Math.max(0, (p.likes_count || 0) - 1) : (p.likes_count || 0) + 1
    }));

    if (wasLiked) { 
      await supabase.from('likes').delete().match({ post_id: postId, user_id: user.id }); 
    } else { 
      await supabase.from('likes').insert({ post_id: postId, user_id: user.id }); 
    }
  };
  
  const handleCommentClick = (postId: string) => {
    const post = posts.find((p: any) => p.id === postId);
    if (!post) return;
    window.dispatchEvent(new CustomEvent('open-comment', { detail: { id: postId, authorName: post.profiles?.full_name || post.profiles?.username, authorImage: post.profiles?.avatar_url, description: post.content }}));
  };

  const handleShare = (postId: string) => {
    const post = posts.find((p: any) => p.id === postId);
    if (!post) return;
    window.dispatchEvent(new CustomEvent('open-share', { detail: { id: postId, authorName: post.profiles?.full_name, description: post.content }}));
  };

  const handleBookmark = async (postId: string) => {
    if (!user) return;
    const post = posts.find((p: any) => p.id === postId);
    if (!post) return;

    const wasBookmarked = post.isBookmarked;

    // Optimistic Update
    updatePostCache(postId, (p) => ({
      ...p,
      isBookmarked: !wasBookmarked
    }));

    if (wasBookmarked) { 
      await supabase.from('bookmarks').delete().match({ post_id: postId, user_id: user.id }); 
    } else { 
      await supabase.from('bookmarks').insert({ post_id: postId, user_id: user.id }); 
    }
  };

  const handleRepost = async (postId: string) => {
    if (!user) return;
    const post = posts.find((p: any) => p.id === postId);
    if (!post) return;

    const wasReposted = post.isReposted;

    // Optimistic Update
    updatePostCache(postId, (p) => ({
      ...p,
      isReposted: !wasReposted
    }));

    if (wasReposted) { 
      await supabase.from('reposts').delete().match({ post_id: postId, user_id: user.id }); 
    } else { 
      await supabase.from('reposts').insert({ post_id: postId, user_id: user.id }); 
    }
  };

  const openDeleteModal = (postId: string) => { setSelectedPostForDelete(postId); setIsDeleteModalOpen(true); };

  const confirmDeletePost = async () => {
    if (!selectedPostForDelete) return;
    setIsDeleting(true);
    await supabase.from('posts').delete().eq('id', selectedPostForDelete);
    queryClient.invalidateQueries({ queryKey: ['posts'] });
    setIsDeleteModalOpen(false);
    setIsDeleting(false);
  };

  // 🏆 DETERMINING THE VIEW STATE
  const showBuildYourLoop = posts.length === 0 && !hasClickedContinue && !!user?.id && !!userUniId;

  if (showBuildYourLoop) {
    return (
      <div className="min-h-screen bg-black flex flex-col font-sans overflow-hidden">
        {/* Header Section */}
        <div className="pt-16 pb-8 px-8 flex flex-col items-center">
          <div className="w-24 h-24 bg-zinc-900 rounded-[32px] flex items-center justify-center mb-10 shadow-[0_0_30px_rgba(229,255,102,0.1)] relative group">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#E5FF66]/20 to-transparent rounded-[32px]" />
            <span className="text-[#E5FF66] font-[900] text-4xl italic tracking-tighter z-10">U</span>
            <span className="text-white font-[900] text-4xl italic tracking-tighter z-10">-v</span>
          </div>

          
          <h1 className="text-[38px] leading-[0.95] font-[900] text-white text-center mb-4 tracking-tighter italic uppercase">
            CONNECT WITH<br/>PEOPLE
          </h1>
          <p className="text-zinc-500 text-center text-[12px] leading-relaxed max-w-[280px] font-bold uppercase tracking-widest italic opacity-80">
            Follow at least 5 students to fuel your feed and start your Univas experience.
          </p>

          
          {/* Progress Banner */}
          <div className="mt-8 w-full max-w-[240px] bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-4 flex flex-col items-center gap-3">
             <div className="flex gap-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className={`h-2 w-8 rounded-full transition-all duration-500 ${i < connectionCount ? 'bg-[#E5FF66] shadow-[0_0_10px_rgba(229,255,102,0.4)]' : 'bg-zinc-800'}`} />
                ))}
             </div>
             <span className="text-[10px] font-black text-[#E5FF66] uppercase tracking-[0.2em]">
               {connectionCount < 5 ? `${5 - connectionCount} more to go` : "Loop Synchronized"}
             </span>

          </div>
        </div>



        {/* Scrollable Connections List */}
        <div className="flex-1 overflow-y-auto px-6 pb-24 space-y-4 custom-scrollbar">
          <SuggestedConnections userId={user.id} universityId={userUniId} onCountChange={setConnectionCount} />
          
          <div className="pt-4 pb-8 text-center">
            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">
              DISCOVER YOUR NETWORK
            </p>
          </div>
        </div>

        {/* Bottom Button Action */}
        <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black to-transparent pt-12">
          <button 
            onClick={() => {
              localStorage.setItem(`loop_complete_${user.id}`, 'true');
              setHasClickedContinue(true);
            }}

            disabled={connectionCount < 5}
            className={`w-full py-5 rounded-full text-[13px] font-black uppercase tracking-[0.2em] transition-all active:scale-[0.95] ${
              connectionCount >= 5 
              ? 'bg-[#E5FF66] text-black shadow-lg shadow-[#E5FF66]/20' 
              : 'bg-zinc-800 text-zinc-500 cursor-not-allowed opacity-50'
            }`}
          >
            {connectionCount >= 5 ? "Enter the Feed" : "Go to Feed"}
          </button>
        </div>
      </div>
    );
  }

  // STANDARD FEED VIEW
  return (
    <div className="min-h-screen bg-white dark:bg-black pb-[100px] max-w-md mx-auto relative font-sans overflow-hidden transition-colors">
      <Toast message={toast.message} type={toast.type} isVisible={toast.isVisible} onClose={() => setToast({ ...toast, isVisible: false })} />
      <TopNavigation />
      
      <main className="px-5 py-2">
        <StoriesBar />
        <div className="mt-6 flex flex-col gap-4">
          {isLoadingPosts ? (
            <div className="flex flex-col gap-6">
              <FeedCardSkeleton /><FeedCardSkeleton />
            </div>
          ) : posts.length > 0 ? (
            posts.map((post: any) => (
              <FeedCard key={post.id} id={post.id} authorId={post.user_id} currentUserId={user?.id} authorName={post.profiles?.full_name || post.profiles?.username || "Anonymous"} authorImage={post.profiles?.avatar_url || null} timePosted={formatRelativeTime(new Date(post.created_at))} postImage={post.image_url || null} likes={post.likes_count || 0} comments={post.comments_count || 0} description={post.content} isLiked={post.isLiked} isBookmarked={post.isBookmarked} isReposted={post.isReposted} onLike={handleLike} onComment={handleCommentClick} onDelete={openDeleteModal} onShare={handleShare} onBookmark={handleBookmark} onRepost={handleRepost} />

            ))
          ) : null}

        </div>
      </main>

      <BottomNavigation />

      {/* Floating Action Button - Enhanced Centering */}
      <div className="fixed inset-x-0 bottom-[92px] flex justify-center pointer-events-none z-[70] px-6">
        <div className="w-full max-w-md flex justify-end">
          <Link 
            href="/create" 
            className="w-14 h-14 bg-[#E5FF66] text-black rounded-2xl flex items-center justify-center shadow-[0_8px_30px_rgb(229,255,102,0.4)] hover:shadow-[0_12px_40px_rgb(229,255,102,0.5)] active:scale-90 transition-all duration-300 pointer-events-auto border-2 border-white dark:border-black group relative"
          >
            <Plus className="w-8 h-8 group-hover:rotate-90 transition-transform duration-300" strokeWidth={3} />
            <div className="absolute inset-0 bg-[#E5FF66] rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity pointer-events-none" />
          </Link>
        </div>
      </div>

      <DeleteConfirmationModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={confirmDeletePost} isLoading={isDeleting} />
    </div>
  );
}
