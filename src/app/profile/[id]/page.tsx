"use client";

import { useEffect, useState, use } from "react";
import { ArrowLeft, User, CheckCircle2, Loader2, Grid, MessageSquare, UserPlus, Check } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import BottomNavigation from "@/components/BottomNavigation";
import { createClient } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import Toast from "@/components/Toast";
import FeedCard from "@/components/FeedCard";

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

  // Toast State
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

      // Fetch user's likes and bookmarks for interaction states
      if (authUser) {
        const [ { data: likesData }, { data: bookmarksData } ] = await Promise.all([
          supabase.from('post_likes').select('post_id').eq('user_id', authUser.id),
          supabase.from('bookmarks').select('post_id').eq('user_id', authUser.id)
        ]);
        if (likesData) setCurrentUserLikes(new Set(likesData.map(l => l.post_id)));
        if (bookmarksData) setCurrentUserBookmarks(new Set(bookmarksData.map(b => b.post_id)));
      }

      setIsLoading(false);
    }

    fetchData();
  }, [userId, router, supabase]);

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
        const { data: sharedConvo } = await supabase
          .from('conversation_participants')
          .select('conversation_id')
          .in('conversation_id', convoIds)
          .eq('user_id', userId)
          .limit(1)
          .maybeSingle();

        if (sharedConvo) {
          return router.push(`/messages/${sharedConvo.conversation_id}`);
        }
      }

      // 2. If no conversation exists, create one
      const { data: newConvo, error: convoError } = await supabase
        .from('conversations')
        .insert({})
        .select('id')
        .single();
        
      if (newConvo && !convoError) {
        // Create participants
        await supabase.from('conversation_participants').insert([
          { conversation_id: newConvo.id, user_id: currentUser.id },
          { conversation_id: newConvo.id, user_id: userId }
        ]);
        
        router.push(`/messages/${newConvo.id}`);
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
    <div className="min-h-screen bg-white pb-[100px] max-w-md mx-auto relative font-sans overflow-x-hidden">
      <Toast 
        message={toast.message} 
        type={toast.type} 
        isVisible={toast.isVisible} 
        onClose={() => setToast({ ...toast, isVisible: false })} 
      />

      {/* Header Bar */}
      <div className="flex items-center justify-between px-6 py-4 sticky top-0 bg-white/80 backdrop-blur-xl z-30 border-b border-zinc-50">
        <button onClick={() => router.back()} className="w-10 h-10 flex items-center justify-center rounded-full bg-zinc-50 hover:bg-zinc-100 transition active:scale-90">
          <ArrowLeft size={20} className="text-black" />
        </button>
        <span className="font-black text-sm tracking-[0.1em] uppercase text-zinc-400">Student Profile</span>
        <div className="w-10" />
      </div>

      <div className="px-6 pt-8 pb-6">
        <div className="flex flex-col items-center">
          <div className="relative mb-6">
            <div className="w-32 h-32 rounded-[40px] overflow-hidden bg-zinc-50 border-4 border-zinc-100 shadow-2xl flex items-center justify-center">
              {profile?.avatar_url ? (
                <Image src={profile.avatar_url} alt={profile.full_name} fill className="object-cover" />
              ) : (
                <User className="w-12 h-12 text-zinc-200" />
              )}
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-2 mb-1">
            <h2 className="text-2xl font-black text-black leading-tight">{profile?.full_name}</h2>
            <CheckCircle2 size={18} className="fill-black text-white shrink-0" />
          </div>
          <p className="text-zinc-400 text-[14px] font-bold mb-8">{profile?.username}</p>
          
          <div className="flex gap-4 w-full px-6 mb-8">
            <button 
              onClick={handleConnect}
              disabled={isActionLoading}
              className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-[24px] text-[15px] font-black transition-all active:scale-95 shadow-lg ${
                connectionStatus === 'connected' || connectionStatus === 'pending_sent'
                ? "bg-zinc-100 text-zinc-500 shadow-zinc-100/50 hover:bg-zinc-200" 
                : connectionStatus === 'pending_received'
                ? "bg-[#E5FF66] text-black shadow-black/10 hover:brightness-95"
                : "bg-[#1A1A24] text-white shadow-black/20 hover:bg-black"
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
                className="w-16 flex items-center justify-center rounded-[24px] bg-zinc-50 text-black hover:bg-zinc-100 transition active:scale-95 border border-zinc-100 shadow-sm disabled:opacity-50"
              >
                {isActionLoading ? <Loader2 size={22} className="animate-spin text-zinc-400" /> : <MessageSquare size={22} strokeWidth={2.5} />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="flex justify-between py-10 px-14 bg-zinc-50/50 rounded-[40px] mx-6 mb-8 border border-zinc-100/50">
        <div className="flex flex-col items-center gap-1.5 w-1/2">
          <span className="text-2xl font-black text-black">{posts.length}</span>
          <span className="text-[10px] text-zinc-400 font-black uppercase tracking-[0.2em]">Posts</span>
        </div>
        <div className="h-10 w-[1px] bg-zinc-200/50 mt-2" />
        <div className="flex flex-col items-center gap-1.5 w-1/2">
          <span className="text-2xl font-black text-black">{connectionCount}</span>
          <span className="text-[10px] text-zinc-400 font-black uppercase tracking-[0.2em]">Connections</span>
        </div>
      </div>

      <div className="px-8 flex flex-col gap-6 mb-10">
        <div className="flex flex-col gap-2">
          <h3 className="font-black text-[11px] text-zinc-400 uppercase tracking-widest">About</h3>
          <p className="text-[15px] font-medium text-zinc-800 leading-relaxed italic">
            "{profile?.bio || `A student at ${profile?.universities?.name}`}"
          </p>
        </div>
        
        <div className="flex flex-col gap-2">
          <h3 className="font-black text-[11px] text-zinc-400 uppercase tracking-widest">University</h3>
          <div className="bg-white p-5 rounded-[28px] border border-zinc-100 shadow-sm">
            <p className="text-[14px] font-black text-black mb-1">{profile?.universities?.name}</p>
            <p className="text-[13px] font-bold text-zinc-500">{profile?.departments?.name} • {profile?.level}</p>
          </div>
        </div>
      </div>

      {/* Tab Separator */}
      <div className="px-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Grid size={18} className="text-black" />
          <h3 className="font-black text-xs uppercase tracking-widest text-black">Insights & Shared Content</h3>
        </div>
        <div className="h-[2px] w-full bg-zinc-50 rounded-full" />
      </div>

      {/* Posts Section */}
      <div className="px-6 flex flex-col gap-4">
        {posts.length > 0 ? (
          posts.map((post) => (
            <FeedCard 
              key={post.id}
              id={post.id}
              authorName={profile?.full_name || "User"}
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
          <div className="py-12 flex flex-col items-center text-center">
            <p className="text-zinc-300 font-black text-xs uppercase tracking-widest">No shared content yet</p>
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
}
