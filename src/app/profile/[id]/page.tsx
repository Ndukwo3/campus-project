"use client";

import { useEffect, useState, use } from "react";
import { ArrowLeft, User, CheckCircle2, Loader2, Grid, Bookmark, MessageSquare, UserPlus, Check, Maximize2, Repeat2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import BottomNavigation from "@/components/BottomNavigation";
import { createClient } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import Toast from "@/components/Toast";
import FeedCard from "@/components/FeedCard";
import ConnectionsModal from "@/components/ConnectionsModal";
import { capitalizeName } from "@/lib/utils";

export default function UserProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: userId } = use(params);
  const router = useRouter();
  const supabase = createClient();
  
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'none' | 'pending_sent' | 'pending_received' | 'connected'>('none');
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [connectionCount, setConnectionCount] = useState(0);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentUserLikes, setCurrentUserLikes] = useState<Set<string>>(new Set());
  const [currentUserBookmarks, setCurrentUserBookmarks] = useState<Set<string>>(new Set());
  const [currentUserReposts, setCurrentUserReposts] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<"posts" | "reposts">("posts");
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [reposts, setReposts] = useState<any[]>([]);
  const [isConnectionsOpen, setIsConnectionsOpen] = useState(false);

  const [hasStories, setHasStories] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" | "warning"; isVisible: boolean }>({
    message: "",
    type: "success",
    isVisible: false,
  });

  const showToast = (message: string, type: "success" | "error" | "info" | "warning" = "success") => {
    setToast({ message, type, isVisible: true });
  };

  useEffect(() => {
    async function fetchData() {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      setCurrentUser(authUser);

      if (authUser && authUser.id === userId) {
        router.push("/profile");
        return;
      }

      // Fetch profile safely without strict nested relations
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (!profileData) {
        router.push("/");
        return;
      }
      
      // Attempt to load relations manually
      if (profileData.university_id) {
        const { data: uni } = await supabase.from('universities').select('name').eq('id', profileData.university_id).maybeSingle();
        if (uni) profileData.universities = uni;
      }
      if (profileData.department_id) {
        const { data: dept } = await supabase.from('departments').select('name').eq('id', profileData.department_id).maybeSingle();
        if (dept) profileData.departments = dept;
      }

      setProfile(profileData);

      // Fetch posts
      const { data: postsData } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      setPosts(postsData || []);

      // Check connection status
      if (authUser) {
        const { data: friendData } = await supabase
          .from('friends')
          .select('*')
          .or(`and(user_id1.eq.${authUser.id},user_id2.eq.${userId}),and(user_id1.eq.${userId},user_id2.eq.${authUser.id})`)
          .single();
        
        if (friendData) {
          setConnectionStatus('connected');
        } else {
          const { data: reqData } = await supabase
            .from('friend_requests')
            .select('*')
            .or(`and(sender_id.eq.${authUser.id},receiver_id.eq.${userId}),and(sender_id.eq.${userId},receiver_id.eq.${authUser.id})`)
            .eq('status', 'pending')
            .maybeSingle();
            
          if (reqData) {
            setConnectionStatus(reqData.sender_id === authUser.id ? 'pending_sent' : 'pending_received');
          } else {
            setConnectionStatus('none');
          }
        }
      }

      // Fetch connection count
      const { count: connections } = await supabase
        .from('friends')
        .select('*', { count: 'exact', head: true })
        .or(`user_id1.eq.${userId},user_id2.eq.${userId}`);
      
      setConnectionCount(connections || 0);

      // Fetch active stories count
      const now = new Date().toISOString();
      const { count: storiesCount } = await supabase
        .from('stories')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gt('expires_at', now);
      
      setHasStories(!!storiesCount && storiesCount > 0);

      // Fetch user's likes and bookmarks for interaction states
      if (authUser) {
        const [ { data: likesData }, { data: bookmarksData }, { data: repostsData } ] = await Promise.all([
          supabase.from('likes').select('post_id').eq('user_id', authUser.id),
          supabase.from('bookmarks').select('post_id').eq('user_id', authUser.id),
          supabase.from('reposts').select('post_id').eq('user_id', authUser.id)
        ]);
        if (likesData) setCurrentUserLikes(new Set(likesData.map((l: any) => l.post_id)));
        if (bookmarksData) setCurrentUserBookmarks(new Set(bookmarksData.map((b: any) => b.post_id)));
        if (repostsData) setCurrentUserReposts(new Set(repostsData.map((r: any) => r.post_id)));
      }

      setIsLoading(false);
    }
    fetchData();
  }, [userId, router, supabase]);

  useEffect(() => {
    async function fetchUserReposts() {
      if (activeTab !== "reposts") return;
      
      const { data, error } = await supabase
        .from('reposts')
        .select(`
          id,
          post_id,
          created_at,
          posts (
            *,
            profiles:user_id (username, full_name, avatar_url)
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (data) setReposts(data);
    }
    fetchUserReposts();
  }, [activeTab, userId, supabase]);

  const handleRepost = async (postId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return router.push("/login");

    if (currentUserReposts.has(postId)) {
      await supabase.from('reposts').delete().match({ user_id: user.id, post_id: postId });
      setCurrentUserReposts(prev => {
        const next = new Set(prev);
        next.delete(postId);
        return next;
      });
      showToast("Repost removed");
    } else {
      await supabase.from('reposts').insert({ user_id: user.id, post_id: postId });
      setCurrentUserReposts(prev => {
        const next = new Set(prev);
        next.add(postId);
        return next;
      });

      // Notify the post author
      if (userId !== user.id) {
        await supabase.from('notifications').insert({
          user_id: userId,
          sender_id: user.id,
          type: 'repost',
          content: `reposted your post.`,
          is_read: false
        });
      }
      showToast("Post reposted!");
    }
  };

  const handleConnect = async () => {
    if (!currentUser) return router.push("/login");

    setIsActionLoading(true);
    try {
      if (connectionStatus === 'connected') {
        const { error } = await supabase.from('friends').delete()
          .or(`and(user_id1.eq.${currentUser.id},user_id2.eq.${userId}),and(user_id1.eq.${userId},user_id2.eq.${currentUser.id})`);
        if (error) throw error;
        setConnectionStatus('none');
        setConnectionCount(prev => prev - 1);
      } else if (connectionStatus === 'pending_sent') {
        const { error: fErr } = await supabase.from('friend_requests').delete()
          .match({ sender_id: currentUser.id, receiver_id: userId, status: 'pending' });
        if (fErr) throw fErr;
          
        const { error: nErr } = await supabase.from('notifications').delete()
          .match({ user_id: userId, sender_id: currentUser.id, type: 'connect_request' });
        if (nErr) throw nErr;
          
        setConnectionStatus('none');
      } else if (connectionStatus === 'pending_received') {
        const { error: fErr } = await supabase.from('friend_requests').update({ status: 'accepted' })
          .match({ sender_id: userId, receiver_id: currentUser.id, status: 'pending' });
        if (fErr) throw fErr;

        // Delete the corresponding connect_request notification as it's now handled
        await supabase.from('notifications').delete()
          .match({ user_id: currentUser.id, sender_id: userId, type: 'connect_request' });

        setConnectionStatus('connected');
        setConnectionCount(prev => prev + 1);
        
        const { error: nErr } = await supabase.from('notifications').insert({
          user_id: userId,
          sender_id: currentUser.id,
          type: 'connect_accepted',
          content: 'accepted your connect request!',
          is_read: false
        });
        if (nErr) throw nErr;
      } else if (connectionStatus === 'none') {
        const { error: fErr } = await supabase.from('friend_requests').insert({
          sender_id: currentUser.id,
          receiver_id: userId,
          status: 'pending'
        });
        if (fErr) throw fErr;
        setConnectionStatus('pending_sent');
        
        // Clean up any old ghost notifications before inserting the new one to prevent stacking
        await supabase.from('notifications').delete()
          .match({ user_id: userId, sender_id: currentUser.id, type: 'connect_request' });

        await supabase.from('notifications').insert({
          user_id: userId,
          sender_id: currentUser.id,
          type: 'connect_request',
          content: 'wants to connect with you.',
          is_read: false
        });
      }
    } catch (err) {
      showToast("Operation failed", "error");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleMessageClick = async () => {
    if (!currentUser) return router.push("/login");
    setIsActionLoading(true);

    try {
      // 1. Check if conversation already exists between these two users
      const { data: myConvos } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', currentUser.id);
        
      if (myConvos && myConvos.length > 0) {
        const convoIds = myConvos.map((c: any) => c.conversation_id);
        const { data: sharedConvos } = await supabase
          .from('conversation_participants')
          .select('conversation_id')
          .in('conversation_id', convoIds)
          .eq('user_id', userId);

        if (sharedConvos && sharedConvos.length > 0) {
          const sharedIds = sharedConvos.map((c: any) => c.conversation_id);
          const { data: latestMsg } = await supabase
            .from('messages')
            .select('conversation_id')
            .in('conversation_id', sharedIds)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          const targetConvoId = latestMsg?.conversation_id || sharedIds[0];
          setIsActionLoading(false);
          return router.push(`/messages/${targetConvoId}`);
        }
      }

      // 2. If no conversation exists, create one
      const newConvoId = crypto.randomUUID();
      const { error: convoError } = await supabase
        .from('conversations')
        .insert({ id: newConvoId });
        
      if (!convoError) {
        // Create participants
        await supabase.from('conversation_participants').insert([
          { conversation_id: newConvoId, user_id: currentUser.id },
          { conversation_id: newConvoId, user_id: userId }
        ]);
        
        setIsActionLoading(false);
        router.push(`/messages/${newConvoId}`);
      } else {
        throw convoError;
      }
    } catch(err) {
      showToast("Could not start conversation", "error");
      setIsActionLoading(false); 
    }
  };


  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-6">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#E5FF66] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-zinc-400 font-bold text-sm tracking-widest uppercase">Loading Profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black pb-[100px] max-w-md mx-auto relative font-sans overflow-x-hidden transition-colors">
      <Toast 
        message={toast.message} 
        type={toast.type} 
        isVisible={toast.isVisible} 
        onClose={() => setToast({ ...toast, isVisible: false })} 
      />

      {/* Header Bar */}
      <div className="flex items-center justify-between px-6 py-4 sticky top-0 bg-white/80 dark:bg-black/80 backdrop-blur-xl z-30 border-b border-zinc-100/50 dark:border-zinc-800/50">
        <button onClick={() => router.back()} className="w-10 h-10 flex items-center justify-center rounded-full bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition active:scale-90">
          <ArrowLeft size={20} className="text-black dark:text-white" />
        </button>
        <span className="font-black text-xs tracking-[0.1em] uppercase text-zinc-400 dark:text-zinc-600">Profile</span>
        <div className="w-10" />
      </div>

      {/* Profile Info Section */}
      <div className="px-6 pt-2 pb-6">
        <div className="flex flex-col items-center">
          {/* Avatar with Ring */}
          <div className="relative">
            <div 
              onClick={() => profile?.avatar_url && setShowImageViewer(true)}
              className={`w-28 h-28 rounded-full ring-4 ${hasStories ? "ring-[#E5FF66] cursor-pointer" : "ring-zinc-200 dark:ring-zinc-800"} ring-offset-4 ring-offset-white dark:ring-offset-black overflow-hidden mb-4 shadow-lg transition-all flex items-center justify-center bg-zinc-50 dark:bg-zinc-900 relative group`}
            >
              {profile?.avatar_url ? (
                <>
                  <Image 
                    src={profile.avatar_url} 
                    alt="Profile" 
                    width={112} 
                    height={112} 
                    className="object-cover w-full h-full"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Maximize2 size={24} className="text-white" />
                  </div>
                </>
              ) : (
                <User className="w-12 h-12 text-zinc-300 dark:text-zinc-700" />
              )}
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-1.5 mb-1 w-full max-w-[280px] mx-auto">
            <h2 className="text-2xl font-black text-black dark:text-white leading-tight truncate">{capitalizeName(profile?.full_name)}</h2>
            <CheckCircle2 size={18} className="fill-black dark:fill-[#E5FF66] text-white dark:text-black shrink-0" />
          </div>
          <p className="text-zinc-500 dark:text-zinc-400 text-[14px] font-medium mb-4">{profile?.username} • {profile?.level || "Undergraduate"}</p>
          
          <div className="flex gap-4 w-full">
            <button 
              onClick={handleConnect}
              disabled={isActionLoading}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-[15px] font-bold transition-all active:scale-95 shadow-[0_4px_10px_rgba(26,26,36,0.1)] ${
                connectionStatus === 'connected' || connectionStatus === 'pending_sent'
                ? "bg-zinc-100 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 shadow-none hover:bg-zinc-200 dark:hover:bg-zinc-800" 
                : connectionStatus === 'pending_received'
                ? "bg-[#E5FF66] text-black hover:brightness-95"
                : "bg-[#1A1A24] dark:bg-zinc-800 text-white dark:text-white hover:bg-black dark:hover:bg-zinc-700"
              }`}
            >
              {isActionLoading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : connectionStatus === 'connected' ? (
                <>
                  <Check size={18} strokeWidth={3} />
                  Connected
                </>
              ) : connectionStatus === 'pending_sent' ? (
                <>
                  <Check size={18} strokeWidth={3} />
                  Request Sent
                </>
              ) : connectionStatus === 'pending_received' ? (
                <>
                  <UserPlus size={18} strokeWidth={2.5} />
                  Accept Request
                </>
              ) : (
                <>
                  <UserPlus size={18} strokeWidth={2.5} />
                  Connect
                </>
              )}
            </button>
            {connectionStatus === 'connected' && (
              <button 
                onClick={handleMessageClick}
                disabled={isActionLoading}
                className="w-12 h-[48px] flex items-center justify-center rounded-2xl bg-zinc-50 dark:bg-zinc-900 text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition active:scale-95 border border-zinc-100 dark:border-zinc-800 shadow-sm disabled:opacity-50"
              >
                {isActionLoading ? <Loader2 size={20} className="animate-spin text-zinc-400" /> : <MessageSquare size={20} strokeWidth={2.5} />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats Section - Modern Look */}
      <div className="flex justify-around py-8 px-10 bg-white dark:bg-black mx-0 border-b border-zinc-50 dark:border-zinc-800/50">
        <div className="flex flex-col items-center gap-1 group cursor-pointer w-1/2">
          <span className="text-2xl font-black text-black dark:text-white group-hover:scale-110 transition-transform">{posts.length}</span>
          <span className="text-[10px] text-zinc-400 dark:text-zinc-600 font-black uppercase tracking-[0.2em]">Posts</span>
        </div>
        <div className="w-[1px] h-10 bg-zinc-100 dark:bg-zinc-800/50" />
        <div 
          onClick={() => setIsConnectionsOpen(true)}
          className="flex flex-col items-center gap-1 group cursor-pointer w-1/2"
        >
          <span className="text-2xl font-black text-black dark:text-white group-hover:scale-110 transition-transform">{connectionCount}</span>
          <span className="text-[10px] text-zinc-400 dark:text-zinc-600 font-black uppercase tracking-[0.2em]">Connections</span>
        </div>
      </div>

      {/* Bio / University Section */}
      <div className="px-6 py-6 flex flex-col gap-4">
        <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center mb-2">
            <h3 className="font-bold text-sm text-black dark:text-white">University</h3>
          </div>
          <p className="text-sm font-normal text-black dark:text-zinc-300">{profile?.universities?.name || "Select University"}</p>
          <p className="text-sm text-black dark:text-zinc-300 font-normal mt-1">{profile?.departments?.name || "Select Department"}</p>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="font-bold text-base text-black dark:text-white px-1">About Me</h3>
          {profile?.bio ? (
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed px-1 font-normal">
              {profile.bio}
            </p>
          ) : (
            <p className="text-sm text-zinc-400 dark:text-zinc-600 italic px-1 font-normal">
              This student hasn't added a bio yet.
            </p>
          )}
        </div>
      </div>

      {/* Tabs - Sleek Apple-style */}
      <div className="px-6 flex items-center mb-6 sticky top-[72px] bg-white/80 dark:bg-black/80 backdrop-blur-md z-10 py-2">
        <div className="flex-1 flex bg-zinc-50 dark:bg-zinc-900/50 p-1 rounded-2xl relative">
          <button 
            onClick={() => setActiveTab("posts")}
            className={`flex-1 py-3.5 flex items-center justify-center gap-2 rounded-xl transition-all relative z-10 ${activeTab === "posts" ? "text-black dark:text-white font-black" : "text-zinc-400 font-bold hover:text-zinc-600 dark:hover:text-zinc-200"}`}
          >
            <Grid size={18} />
            <span className="text-xs">Posts</span>
          </button>
          <button 
            onClick={() => setActiveTab("reposts")}
            className={`flex-1 py-3.5 flex items-center justify-center gap-2 rounded-xl transition-all relative z-10 ${activeTab === "reposts" ? "text-black dark:text-white font-black" : "text-zinc-400 font-bold hover:text-zinc-600 dark:hover:text-zinc-200"}`}
          >
            <Repeat2 size={18} />
            <span className="text-xs">Reposts</span>
          </button>
          
          {/* Active indicator pill */}
          <motion.div 
            layoutId="tab-pill-other-user"
            className="absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-zinc-100 dark:border-zinc-700"
            animate={{ x: activeTab === "posts" ? 0 : "100%" }}
            transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
          />
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-6 flex flex-col gap-4">
        {activeTab === "posts" && (
          <div className="flex flex-col gap-4">
            {posts.length > 0 ? (
              posts.map((post) => (
                <FeedCard 
                  key={post.id}
                  id={post.id}
                  authorName={capitalizeName(profile?.full_name || "User")}
                  authorImage={profile?.avatar_url}
                  timePosted={new Date(post.created_at).toLocaleDateString()}
                  postImage={post.image_url}
                  likes={post.likes_count || 0}
                  comments={post.comments_count || 0}
                  description={post.content}
                  authorId={post.user_id}
                  currentUserId={currentUser?.id}
                  isLiked={currentUserLikes.has(post.id)}
                  isBookmarked={currentUserBookmarks.has(post.id)}
                  isReposted={currentUserReposts.has(post.id)}
                  onLike={async (id: string) => {
                    const { data: { user } } = await supabase.auth.getUser();
                    if (!user) return;
                    await supabase.rpc('toggle_post_like', { post_id_input: id, user_id_input: user.id });
                    
                    setCurrentUserLikes(prev => {
                      const next = new Set(prev);
                      if (next.has(id)) next.delete(id);
                      else next.add(id);
                      return next;
                    });
                  }}
                  onRepost={handleRepost}
                  onBookmark={async (id: string) => {
                    const { data: { user } } = await supabase.auth.getUser();
                    if (!user) return;
                    
                    const isBookmarked = currentUserBookmarks.has(id);
                    if (isBookmarked) {
                      await supabase.from('bookmarks').delete().match({ user_id: user.id, post_id: id });
                      setCurrentUserBookmarks(prev => {
                        const next = new Set(prev);
                        next.delete(id);
                        return next;
                      });
                      showToast("Bookmark removed");
                    } else {
                      await supabase.from('bookmarks').insert({ user_id: user.id, post_id: id });
                      setCurrentUserBookmarks(prev => {
                        const next = new Set(prev);
                        next.add(id);
                        return next;
                      });
                      showToast("Post bookmarked!");
                    }
                  }}
                  onComment={(id: string) => {
                    const postData = {
                      id,
                      authorName: profile?.full_name || "User",
                      authorId: userId,
                      authorImage: profile?.avatar_url,
                      description: post.content
                    };
                    window.dispatchEvent(new CustomEvent('open-comment', { detail: postData }));
                  }}
                  onShare={(id: string) => {
                    const postData = {
                      id,
                      authorName: profile?.full_name || "User",
                      authorImage: profile?.avatar_url,
                      description: post.content
                    };
                    window.dispatchEvent(new CustomEvent('open-share', { detail: postData }));
                  }}
                />
              ))
            ) : (
              <div className="py-16 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mb-4">
                  <Grid className="text-zinc-400 w-8 h-8" />
                </div>
                <p className="font-bold text-lg text-black mb-1">No Posts Yet</p>
                <p className="text-zinc-500 text-sm">This student hasn't shared any posts yet.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "reposts" && (
          <div className="flex flex-col gap-4">
            {reposts.length > 0 ? (
              reposts.map((repost) => (
                <FeedCard 
                  key={repost.id}
                  id={repost.post_id}
                  authorName={capitalizeName(repost.posts.profiles?.full_name || "User")}
                  authorImage={repost.posts.profiles?.avatar_url}
                  timePosted={new Date(repost.posts.created_at).toLocaleDateString()}
                  postImage={repost.posts.image_url}
                  likes={repost.posts.likes_count || 0}
                  comments={repost.posts.comments_count || 0}
                  description={repost.posts.content}
                  authorId={repost.posts.user_id}
                  currentUserId={currentUser?.id}
                  isLiked={currentUserLikes.has(repost.post_id)}
                  isBookmarked={currentUserBookmarks.has(repost.post_id)}
                  isReposted={currentUserReposts.has(repost.post_id)}
                  onLike={async (id: string) => {
                    const { data: { user } } = await supabase.auth.getUser();
                    if (!user) return;
                    await supabase.rpc('toggle_post_like', { post_id_input: id, user_id_input: user.id });
                    
                    setCurrentUserLikes(prev => {
                      const next = new Set(prev);
                      if (next.has(id)) next.delete(id);
                      else next.add(id);
                      return next;
                    });
                  }}
                  onRepost={handleRepost}
                  onBookmark={async (id: string) => {
                    const { data: { user } } = await supabase.auth.getUser();
                    if (!user) return;
                    
                    const isBookmarked = currentUserBookmarks.has(id);
                    if (isBookmarked) {
                      await supabase.from('bookmarks').delete().match({ user_id: user.id, post_id: id });
                      setCurrentUserBookmarks(prev => {
                        const next = new Set(prev);
                        next.delete(id);
                        return next;
                      });
                      showToast("Bookmark removed");
                    } else {
                      await supabase.from('bookmarks').insert({ user_id: user.id, post_id: id });
                      setCurrentUserBookmarks(prev => {
                        const next = new Set(prev);
                        next.add(id);
                        return next;
                      });
                      showToast("Post bookmarked!");
                    }
                  }}
                />
              ))
            ) : (
              <div className="py-16 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mb-4">
                  <Repeat2 className="text-zinc-400 w-8 h-8" />
                </div>
                <p className="font-bold text-lg text-black mb-1">No Reposts</p>
                <p className="text-zinc-500 text-sm">This student hasn't reposted any content yet.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Image Viewer Modal */}
      <AnimatePresence>
        {showImageViewer && profile?.avatar_url && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black flex flex-col"
          >
            <div className="p-6 flex items-center justify-between">
              <button onClick={() => setShowImageViewer(false)} className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white transition-colors">
                <ArrowLeft size={24} />
              </button>
            </div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="flex-1 relative flex items-center justify-center p-4"
            >
               <div className="w-full max-w-sm aspect-square relative rounded-[40px] overflow-hidden shadow-2xl">
                 <Image 
                   src={profile.avatar_url} 
                   alt="Enlarged profile" 
                   fill 
                   className="object-cover"
                   unoptimized
                 />
               </div>
            </motion.div>
            
            <div className="p-10 flex justify-center">
               <p className="text-zinc-500 text-sm font-medium">Profile Preview</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConnectionsModal 
        isOpen={isConnectionsOpen}
        onClose={() => setIsConnectionsOpen(false)}
        userId={userId}
        userName={capitalizeName(profile?.full_name || "User")}
      />

      <BottomNavigation />
    </div>
  );
}
