"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { formatRelativeTime, capitalizeName } from "@/lib/utils";
import TopNavigation from "@/components/TopNavigation";
import FeedCard from "@/components/FeedCard";
import BottomNavigation from "@/components/BottomNavigation";
import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";
import FeedCardSkeleton from "@/components/skeletons/FeedCardSkeleton";
import { Loader2, Sparkles, Plus } from "lucide-react";
import Toast from "@/components/Toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";

export default function Home() {
  const router = useRouter();
  const supabase = createClient();
  const queryClient = useQueryClient();
  const [user, setUser] = useState<any>(null);
  
  // States
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
          profiles:user_id (username, full_name, avatar_url, is_verified)
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
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black transition-colors duration-500">
        <div className="relative flex items-center justify-center">
          <div className="absolute w-16 h-16 bg-[#E5FF66]/20 rounded-full animate-ping" />
          <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center p-3 shadow-[0_0_30px_rgba(229,255,102,0.15)] animate-pulse relative z-10">
            <img src="/logo.png" alt="Peerza" className="w-full h-full object-contain" />
          </div>
        </div>
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
      
      // Send notification to post author
      if (post.user_id !== user.id) {
        await supabase.from('notifications').insert({
          user_id: post.user_id,
          sender_id: user.id,
          type: 'like',
          content: `liked your post: "${post.content?.substring(0, 50)}${post.content?.length > 50 ? '...' : ''}"`,
          is_read: false
        });
      }
    }
  };
  
  const handleCommentClick = (postId: string) => {
    const post = posts.find((p: any) => p.id === postId);
    if (!post) return;
    window.dispatchEvent(new CustomEvent('open-comment', { detail: { id: postId, authorName: capitalizeName(post.profiles?.full_name || post.profiles?.username), authorId: post.user_id, authorImage: post.profiles?.avatar_url, description: post.content }}));
  };

  const handleShare = (postId: string) => {
    const post = posts.find((p: any) => p.id === postId);
    if (!post) return;
    window.dispatchEvent(new CustomEvent('open-share', { detail: { id: postId, authorName: capitalizeName(post.profiles?.full_name), description: post.content }}));
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
      
      // Notify the post author
      if (post.user_id !== user.id) {
        await supabase.from('notifications').insert({
          user_id: post.user_id,
          sender_id: user.id,
          type: 'repost',
          content: `reposted your post: "${post.content?.substring(0, 50)}${post.content?.length > 50 ? '...' : ''}"`,
          is_read: false
        });
      }
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

  // STANDARD FEED VIEW
  return (
    <div className="min-h-screen bg-white dark:bg-black pb-[100px] lg:pb-0 relative font-sans overflow-hidden transition-colors">
      <Toast message={toast.message} type={toast.type} isVisible={toast.isVisible} onClose={() => setToast({ ...toast, isVisible: false })} />
      <TopNavigation />
      
      {/* Desktop Header */}
      <div className="sticky top-0 z-40 hidden lg:block bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-zinc-100 dark:border-zinc-800">
        <div className="px-5 py-4">
          <h1 className="text-xl font-black tracking-tight">Home</h1>
        </div>
        <div className="flex border-b border-zinc-100 dark:border-zinc-800">
          <button className="flex-1 py-4 text-sm font-black text-zinc-900 dark:text-zinc-100 border-b-4 border-[#E5FF66]">For you</button>
          <button className="flex-1 py-4 text-sm font-bold text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">Following</button>
        </div>
      </div>

      <main className="px-5 py-2">
        <div className="mt-4 flex flex-col gap-4">
          {isLoadingPosts ? (
            <div className="flex flex-col gap-6">
              <FeedCardSkeleton /><FeedCardSkeleton />
            </div>
          ) : posts.length > 0 ? (
            posts.map((post: any) => (
              <FeedCard key={post.id} id={post.id} authorId={post.user_id} authorUsername={post.profiles?.username} currentUserId={user?.id} authorName={capitalizeName(post.profiles?.full_name || post.profiles?.username || "Anonymous")} authorImage={post.profiles?.avatar_url || null} timePosted={formatRelativeTime(new Date(post.created_at))} postImage={post.image_url || null} likes={post.likes_count || 0} comments={post.comments_count || 0} description={post.content} isLiked={post.isLiked} isBookmarked={post.isBookmarked} isReposted={post.isReposted} isVerified={post.profiles?.is_verified} onLike={handleLike} onComment={handleCommentClick} onDelete={openDeleteModal} onShare={handleShare} onBookmark={handleBookmark} onRepost={handleRepost} />

            ))
          ) : null}

        </div>
      </main>

      <BottomNavigation />

      {/* Floating Action Button - Enhanced Centering */}
      <div className="fixed inset-x-0 bottom-[92px] flex justify-center pointer-events-none z-[70] px-6 lg:hidden">
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
