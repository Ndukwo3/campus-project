"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import TopNavigation from "@/components/TopNavigation";
import StoriesBar from "@/components/StoriesBar";
import FeedCard from "@/components/FeedCard";
import BottomNavigation from "@/components/BottomNavigation";
import { Loader2 } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const supabase = createClient();
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function checkUserAndFetchPosts() {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (!authUser) {
        router.push("/login");
        return;
      }

      setUser(authUser);

      // Fetch posts from Supabase
      const { data: dbPosts, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles:user_id (username, full_name, avatar_url),
          universities:university_id (name)
        `)
        .order('created_at', { ascending: false });

      if (dbPosts && dbPosts.length > 0) {
        setPosts(dbPosts);
      }
      
      setIsLoading(false);
    }

    checkUserAndFetchPosts();
  }, [router, supabase]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-900" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-[100px] max-w-md mx-auto relative shadow-sm h-full">
      <TopNavigation />
      <StoriesBar />
      
      <main className="px-4 mt-2 mb-8">
        {posts.length > 0 ? (
          posts.map((post) => (
            <FeedCard
              key={post.id}
              authorName={post.profiles?.full_name || post.profiles?.username || "Anonymous"}
              authorImage={post.profiles?.avatar_url || "/dummy/nigerian_avatar_2_1772720155980.png"}
              timePosted={new Date(post.created_at).toLocaleDateString()}
              postImage={post.image_url || "/dummy/nigerian_post_image_1772720254070.png"}
              likes={post.likes_count || 0}
              comments={post.comments_count || 0}
              description={post.content}
            />
          ))
        ) : (
          <>
            <FeedCard
              authorName="Chidi Obi"
              authorImage="/dummy/nigerian_avatar_2_1772720155980.png"
              timePosted="12 minutes"
              postImage="/dummy/nigerian_post_image_1772720254070.png"
              likes={212}
              comments={20}
              description="Group study under the shade at faculty! Setting things up before the GST exam next week. Wishing everyone success! 🙏"
            />
            
            <FeedCard
              authorName="Zainab Ibrahim"
              authorImage="/dummy/nigerian_avatar_6_1772720236907.png"
              timePosted="2 hours"
              postImage="/dummy/nigerian_avatar_4_1772720200827.png"
              likes={84}
              comments={5}
              description="Enjoying the beautiful campus scenery today. Keep pushing guys, we almost there!"
            />
          </>
        )}
      </main>

      <div className="h-6"></div>
      <BottomNavigation />
    </div>
  );
}
