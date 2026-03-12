"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import TopNavigation from "@/components/TopNavigation";
import StoriesBar from "@/components/StoriesBar";
import FeedCard from "@/components/FeedCard";
import BottomNavigation from "@/components/BottomNavigation";
import { Loader2, Sparkles } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const supabase = createClient();
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isPostingOptimistic, setIsPostingOptimistic] = useState(false);

  const fetchPosts = async (userId: string) => {
    // Fetch posts with author info
    const { data: dbPosts, error } = await supabase
      .from('posts')
      .select(`
        *,
        profiles:user_id (username, full_name, avatar_url),
        universities:university_id (name)
      `)
      .order('created_at', { ascending: false });

    if (dbPosts) {
      // Fetch user's likes to determine isLiked status
      const { data: userLikes } = await supabase
        .from('likes')
        .select('post_id')
        .eq('user_id', userId);

      const likedPostIds = new Set(userLikes?.map(l => l.post_id) || []);

      const processedPosts = dbPosts.map(post => ({
        ...post,
        isLiked: likedPostIds.has(post.id)
      }));

      setPosts(processedPosts);
    }
  };

  useEffect(() => {
    async function checkUserAndInit() {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (!authUser) {
        router.push("/welcome");
        return;
      }

      setUser(authUser);
      await fetchPosts(authUser.id);
      setIsLoading(false);

      // Check for optimistic posting state
      const checkPostingState = () => {
        const isPosting = sessionStorage.getItem('isPosting');
        if (isPosting === 'true') {
          setIsPostingOptimistic(true);
        }
      };
      checkPostingState();

      // 1. Subscribe to new posts
      const postsSubscription = supabase
        .channel('public:posts')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, async (payload) => {
          // A new post just arrived! Remove the optimistic loading slate
          if (payload.new) {
             sessionStorage.removeItem('isPosting');
             setIsPostingOptimistic(false);
          }
          // Re-fetch or manually add to get profile info
          await fetchPosts(authUser.id);
        })
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'posts' }, (payload) => {
          setPosts(prev => prev.map(p => p.id === payload.new.id ? { ...p, ...payload.new } : p));
        })
        .subscribe();

      // 2. Subscribe to like changes for live counts
      const likesSubscription = supabase
        .channel('public:likes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'likes' }, async () => {
          // Simplest is to re-sync counts/status, or we could handle locally
          await fetchPosts(authUser.id);
        })
        .subscribe();

    return () => {
        supabase.removeChannel(postsSubscription);
        supabase.removeChannel(likesSubscription);
      };
    }

    checkUserAndInit();
  }, [router, supabase]);

  const handleLike = async (postId: string) => {
    if (!user) return;

    const post = posts.find(p => p.id === postId);
    if (!post) return;

    if (post.isLiked) {
      // Unlike
      await supabase
        .from('likes')
        .delete()
        .match({ post_id: postId, user_id: user.id });
    } else {
      // Like
      await supabase
        .from('likes')
        .insert({ post_id: postId, user_id: user.id });
    }
    // State is handled by Realtime subscription or local optimistic UI if we want it faster
  };

  // Removed blocking loading screen to allow instant optimistic UI

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-[100px] max-w-md mx-auto relative shadow-sm border-x border-zinc-100/50 h-full">
      <TopNavigation />
      <StoriesBar />
      
      {/* Optimistic UI: Posting Banner */}
      {isPostingOptimistic && (
        <div className="px-5 mb-4">
          <div className="bg-white rounded-3xl p-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-zinc-100 flex items-center gap-3 animate-pulse">
            <div className="w-10 h-10 rounded-full bg-zinc-100 relative overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-tr from-zinc-200 to-zinc-100 animate-[spin_2s_linear_infinite]" />
            </div>
            <div className="flex-1">
              <div className="w-24 h-4 bg-zinc-200 rounded-full mb-2"></div>
              <div className="w-48 h-3 bg-zinc-100 rounded-full"></div>
            </div>
            <p className="text-[13px] font-bold text-zinc-400">Posting...</p>
          </div>
        </div>
      )}

      <main className="px-4 mt-2 mb-8">
        {posts.length > 0 ? (
          posts.map((post) => (
            <FeedCard
              key={post.id}
              id={post.id}
              authorName={post.profiles?.full_name || post.profiles?.username || "Anonymous"}
              authorImage={post.profiles?.avatar_url || null}
              timePosted={new Date(post.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              postImage={post.image_url || null}
              likes={post.likes_count || 0}
              comments={post.comments_count || 0}
              description={post.content}
              isLiked={post.isLiked}
              onLike={handleLike}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 px-10 text-center">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm border border-zinc-100">
              <Sparkles className="w-10 h-10 text-[#E5FF66]" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 mb-2">Welcome to the Feed!</h3>
            <p className="text-zinc-500 text-sm leading-relaxed">
              There aren't any posts from your university yet. Be the first to share something amazing!
            </p>
          </div>
        )}
      </main>

      <BottomNavigation />
    </div>
  );
}
