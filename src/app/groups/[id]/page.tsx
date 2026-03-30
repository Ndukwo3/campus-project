"use client";

import { ChevronLeft, MoreVertical, Users, User, Plus, Loader2, Info, MessageSquare, ChevronRight, LayoutGrid, Sparkles, PenLine, ArrowLeft, Lock, Globe } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef, use } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import CreateChannelModal from "@/components/modals/CreateChannelModal";
import Toast from "@/components/Toast";
import FeedCard from "@/components/FeedCard";
import { formatRelativeTime } from "@/lib/utils";

export default function GroupDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: groupId } = use(params);
  const router = useRouter();
  const supabase = createClient();
  
  const [group, setGroup] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [channels, setChannels] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPostsLoading, setIsPostsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"feed" | "channels" | "info">("feed");
  const [isChannelModalOpen, setIsChannelModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" | "warning"; isVisible: boolean }>({
    message: "",
    type: "success",
    isVisible: false,
  });

  const showToast = (message: string, type: "success" | "error" | "info" | "warning" = "success") => {
    setToast({ message, type, isVisible: true });
  };

  useEffect(() => {
    async function initGroup() {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        router.push("/login");
        return;
      }
      setUser(authUser);

      if (groupId) {
        // 1. Fetch group details
        const { data: groupData } = await supabase
          .from('groups')
          .select('*')
          .eq('id', groupId)
          .single();
        
        if (groupData) setGroup(groupData);

        // 2. Fetch members
        const { data: memberData } = await supabase
          .from('group_members')
          .select('*, profiles (id, username, full_name, avatar_url)')
          .eq('group_id', groupId);
        
        if (memberData) setMembers(memberData);

        // 3. Fetch channels
        const { data: channelsData } = await supabase
          .from('channels')
          .select('*')
          .eq('group_id', groupId)
          .order('name', { ascending: true });

        if (channelsData) setChannels(channelsData);

        // 4. Fetch group posts
        const { data: groupPosts } = await supabase
          .from('posts')
          .select(`
            *,
            profiles:user_id (username, full_name, avatar_url),
            universities:university_id (name)
          `)
          .eq('group_id', groupId)
          .order('created_at', { ascending: false });

        if (groupPosts) setPosts(groupPosts);
      }
      setIsLoading(false);
      setIsPostsLoading(false);
    }

    initGroup();
  }, [groupId, supabase, router]);

  const fetchPosts = async () => {
    setIsPostsLoading(true);
    const { data: groupPosts } = await supabase
      .from('posts')
      .select(`
        *,
        profiles:user_id (username, full_name, avatar_url),
        universities:university_id (name)
      `)
      .eq('group_id', groupId)
      .order('created_at', { ascending: false });

    if (groupPosts) setPosts(groupPosts);
    setIsPostsLoading(false);
  };

  const fetchChannels = async () => {
    const { data: channelsData } = await supabase
      .from('channels')
      .select('*')
      .eq('group_id', groupId)
      .order('name', { ascending: true });

    if (channelsData) setChannels(channelsData);
  };

  const handleLeaveGroup = async () => {
    if (!user || !groupId) return;
    try {
      const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', user.id);

      if (error) throw error;
      
      showToast("You have left the community.");
      router.push("/communities");
    } catch (err: any) {
      showToast(err.message || "Failed to leave community", "error");
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-dvh bg-white dark:bg-black items-center justify-center font-sans tracking-tight transition-colors">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-900 dark:text-[#E5FF66]" />
      </div>
    );
  }

  if (!group) return <div className="p-10 text-center font-sans text-zinc-500">Group not found</div>;

  return (
    <div className="flex flex-col h-dvh bg-white dark:bg-black max-w-md mx-auto relative font-sans overflow-hidden overscroll-none transition-colors">
      <Toast 
        message={toast.message} 
        type={toast.type} 
        isVisible={toast.isVisible} 
        onClose={() => setToast({ ...toast, isVisible: false })} 
      />
      {/* Premium Header */}
      <div className="sticky top-0 z-30 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-zinc-100/50 dark:border-zinc-800/50">
        <div className="px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => router.back()}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all text-zinc-800 dark:text-white"
            >
              <ChevronLeft size={24} />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center relative shrink-0 border border-zinc-100 dark:border-zinc-800">
                {group.image_url ? (
                  <Image src={group.image_url} alt={group.name} fill className="object-cover" />
                ) : (
                  <Users className="text-zinc-300 dark:text-zinc-700 w-6 h-6" />
                )}
              </div>
              <div className="min-w-0">
                <h1 className="font-extrabold text-[17px] text-zinc-900 dark:text-white truncate leading-none">{group.name}</h1>
                <p className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 mt-1 uppercase tracking-widest">{members.length} Members</p>
              </div>
            </div>
          </div>
          <div className="relative" ref={menuRef}>
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all text-zinc-500 dark:text-zinc-400"
            >
              <MoreVertical size={20} />
            </button>

            <AnimatePresence>
              {isMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  className="absolute right-0 mt-2 w-48 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-100 dark:border-zinc-800 p-2 z-50"
                >
                  <button 
                    onClick={() => { setActiveTab("info"); setIsMenuOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 text-[13px] font-bold text-zinc-700 dark:text-zinc-300 transition-colors"
                  >
                    <Info size={16} />
                    Hub Information
                  </button>
                  {members.find(m => m.user_id === user?.id)?.role === 'admin' && (
                    <button 
                      onClick={() => setIsMenuOpen(false)}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 text-[13px] font-bold text-zinc-700 dark:text-zinc-300 transition-colors"
                    >
                      <PenLine size={16} />
                      Edit Settings
                    </button>
                  )}
                  <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-1 mx-2" />
                  <button 
                    onClick={handleLeaveGroup}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 text-[13px] font-bold text-red-500 transition-colors"
                  >
                    <ArrowLeft size={16} className="rotate-180" />
                    Leave Community
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Action Tabs */}
        <div className="flex border-t border-zinc-100/50 dark:border-zinc-800/50">
          <button 
            onClick={() => setActiveTab("feed")}
            className={`flex-1 py-3 flex items-center justify-center gap-2 transition-all ${activeTab === "feed" ? "border-b-2 border-zinc-900 dark:border-[#E5FF66]" : "text-zinc-400"}`}
          >
            <LayoutGrid size={18} className={activeTab === "feed" ? "text-zinc-900 dark:text-[#E5FF66]" : ""} />
            <span className={`text-[13px] font-bold ${activeTab === "feed" ? "text-zinc-900 dark:text-[#E5FF66]" : ""}`}>Feed</span>
          </button>
          <button 
            onClick={() => setActiveTab("channels")}
            className={`flex-1 py-3 flex items-center justify-center gap-2 transition-all ${activeTab === "channels" ? "border-b-2 border-zinc-900 dark:border-[#E5FF66]" : "text-zinc-400"}`}
          >
            <MessageSquare size={18} className={activeTab === "channels" ? "text-zinc-900 dark:text-[#E5FF66]" : ""} />
            <span className={`text-[13px] font-bold ${activeTab === "channels" ? "text-zinc-900 dark:text-[#E5FF66]" : ""}`}>Channels</span>
          </button>
          <button 
            onClick={() => setActiveTab("info")}
            className={`flex-1 py-3 flex items-center justify-center gap-2 transition-all ${activeTab === "info" ? "border-b-2 border-zinc-900 dark:border-[#E5FF66]" : "text-zinc-400"}`}
          >
            <Info size={18} className={activeTab === "info" ? "text-zinc-900 dark:text-[#E5FF66]" : ""} />
            <span className={`text-[13px] font-bold ${activeTab === "info" ? "text-zinc-900 dark:text-[#E5FF66]" : ""}`}>Info</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {activeTab === "feed" && (
          <div className="p-4 space-y-6">
            {/* Create Post Bar */}
            <Link 
              href={`/create?group_id=${groupId}`}
              className="flex items-center gap-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-full p-3 px-4 border border-zinc-100 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all group"
            >
              <div className="w-10 h-10 rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                {user?.user_metadata?.avatar_url ? (
                  <Image src={user.user_metadata.avatar_url} alt="You" width={40} height={40} className="object-cover" />
                ) : (
                  <User className="w-full h-full p-2 text-zinc-400" />
                )}
              </div>
              <span className="text-[14px] font-medium text-zinc-400 dark:text-zinc-500 flex-1">Write something to the community...</span>
              <div className="w-10 h-10 rounded-full bg-[#E5FF66] flex items-center justify-center text-black shadow-lg shadow-[#E5FF66]/10 group-hover:scale-110 transition-transform">
                <PenLine size={20} />
              </div>
            </Link>

            {/* Posts List */}
            <div className="space-y-4">
              {isPostsLoading ? (
                <div className="flex flex-col items-center py-10 opacity-50">
                   <Loader2 className="w-6 h-6 animate-spin mb-2" />
                   <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Syncing Feed...</p>
                </div>
              ) : posts.length > 0 ? (
                posts.map((post) => (
                  <FeedCard
                    key={post.id}
                    id={post.id}
                    authorId={post.user_id}
                    currentUserId={user?.id}
                    authorName={post.profiles?.full_name || post.profiles?.username || "Anonymous"}
                    authorImage={post.profiles?.avatar_url || null}
                    timePosted={formatRelativeTime(new Date(post.created_at))}
                    postImage={post.image_url || null}
                    likes={post.likes_count || 0}
                    comments={post.comments_count || 0}
                    description={post.content}
                    isLiked={false}
                    isBookmarked={false}
                    isReposted={false}
                    onLike={() => {}} 
                    onComment={() => {}}
                    onReport={() => {}}
                    onDelete={() => {}}
                    onShare={() => {}}
                    onBookmark={() => {}}
                    onRepost={() => {}}
                  />
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-20 px-10 text-center">
                  <div className="w-16 h-16 bg-zinc-50 dark:bg-zinc-900 rounded-[24px] flex items-center justify-center mb-6 shadow-sm border border-zinc-100 dark:border-zinc-800">
                    <Sparkles className="w-8 h-8 text-[#E5FF66]" />
                  </div>
                  <h3 className="text-[15px] font-black italic uppercase tracking-tight text-zinc-900 dark:text-white mb-2 leading-none">The wall is quiet</h3>
                  <p className="text-zinc-500 dark:text-zinc-400 text-[12px] font-medium leading-relaxed uppercase tracking-tighter">
                    Be the first to spark a conversation in this hub!
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "channels" && (
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between px-2 pt-2">
              <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-600">Text Channels</h2>
              {members.find(m => m.user_id === user?.id)?.role === 'admin' && (
                <button 
                  onClick={() => setIsChannelModalOpen(true)}
                  className="text-zinc-400 hover:text-black dark:hover:text-white transition-all p-1 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg"
                >
                  <Plus size={16} strokeWidth={3} />
                </button>
              )}
            </div>
            
            <div className="flex flex-col gap-2">
              {channels.map((channel) => (
                <Link 
                  key={channel.id} 
                  href={`/groups/${groupId}/channels/${channel.id}`}
                  className="group flex items-center justify-between p-4 rounded-[24px] bg-zinc-50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-900 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800 transition-all active:scale-[0.98]"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-black border border-zinc-100 dark:border-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-black dark:group-hover:text-white transition-colors shadow-sm">
                      <span className="font-black text-lg">#</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-[15px] text-zinc-900 dark:text-white tracking-tight leading-none group-hover:underline underline-offset-2">{channel.name}</h3>
                      {channel.description && <p className="text-[11px] font-medium text-zinc-400 mt-1">{channel.description}</p>}
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-zinc-300 dark:text-zinc-700 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              ))}
              
              {channels.length === 0 && (
                 <div className="py-10 text-center flex flex-col items-center">
                   <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-900 rounded-2xl flex items-center justify-center mb-3 text-zinc-400">
                     <MessageSquare size={20} />
                   </div>
                   <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest">No Channels Yet</p>
                 </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "info" && (
          <div className="p-6 space-y-8">
            <section className="space-y-4">
              <h2 className="text-xs font-black uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-600 mb-1 px-1">Deep Dive</h2>
              <div className="grid grid-cols-2 gap-3">
                 <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-[24px] border border-zinc-100/50 dark:border-zinc-800/50">
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Born On</p>
                    <p className="text-[13px] font-bold text-zinc-900 dark:text-white">
                      {new Date(group.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                 </div>
                 <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-[24px] border border-zinc-100/50 dark:border-zinc-800/50">
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Privacy</p>
                    <div className="flex items-center gap-1.5">
                       {group.is_private ? <Lock size={12} className="text-[#E5FF66]" /> : <Globe size={12} className="text-[#E5FF66]" />}
                       <p className="text-[13px] font-bold text-zinc-900 dark:text-white">{group.is_private ? 'Closed' : 'Open'}</p>
                    </div>
                 </div>
              </div>
              
              <div className="bg-white dark:bg-zinc-900 p-5 rounded-[32px] border border-zinc-100 dark:border-zinc-800 shadow-sm space-y-4">
                 <div>
                   <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.15em] mb-2">The Purpose</p>
                   <p className="text-[15px] font-medium text-zinc-700 dark:text-zinc-300 leading-relaxed italic">
                     "{group.description || "Building a stronger Univas together."}"
                   </p>
                 </div>
                 <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                       <Sparkles size={18} className="text-emerald-500" />
                    </div>
                    <div>
                       <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Ownership</p>
                       <p className="text-[13px] font-bold text-zinc-900 dark:text-white">Founding Member Hub</p>
                    </div>
                 </div>
              </div>
            </section>

            <section>
              <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex flex-col">
                  <h2 className="text-xs font-black uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-600">The Residents</h2>
                  <p className="text-[10px] font-bold text-zinc-300 dark:text-zinc-700 uppercase tracking-tighter">Approved Stakeholders</p>
                </div>
                <span className="text-[11px] font-black text-zinc-900 bg-[#E5FF66] px-2.5 py-1 rounded-full uppercase tracking-tighter shadow-sm">
                  {members.length} Total
                </span>
              </div>
              
              <div className="flex flex-col gap-2">
                {members.map((member: any) => (
                  <Link 
                    key={member.user_id}
                    href={`/profile/${member.profiles?.id}`}
                    className="flex items-center justify-between p-3.5 rounded-3xl bg-white dark:bg-zinc-900/50 border border-transparent hover:border-zinc-100 dark:hover:border-zinc-800 hover:bg-zinc-50/50 dark:hover:bg-zinc-800 transition-all active:scale-[0.98]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center border border-zinc-100 dark:border-zinc-800">
                        {member.profiles?.avatar_url ? (
                          <Image src={member.profiles.avatar_url} alt={member.profiles.username} width={48} height={48} className="object-cover" />
                        ) : (
                          <User className="text-zinc-300 dark:text-zinc-700 w-6 h-6" />
                        )}
                      </div>
                      <div>
                        <p className="text-[15px] font-bold text-zinc-900 dark:text-white leading-tight">{member.profiles?.full_name}</p>
                        <p className="text-[11px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-tighter mt-1">{member.role === 'admin' ? 'Community Founder' : 'Member'}</p>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-zinc-300 dark:text-zinc-700" />
                  </Link>
                ))}
              </div>
            </section>
            
            <button 
              onClick={handleLeaveGroup}
              className="w-full py-5 rounded-[32px] border-2 border-red-50 dark:border-red-500/10 text-red-500 font-black text-xs uppercase tracking-[0.15em] hover:bg-red-50 dark:hover:bg-red-500/5 transition-colors active:scale-95"
            >
               Leave Community
            </button>
          </div>
        )}
      </div>

      {group && (
        <CreateChannelModal 
          isOpen={isChannelModalOpen} 
          onClose={() => setIsChannelModalOpen(false)} 
          onSuccess={() => {
            fetchChannels();
            showToast("Channel materialized successfully!");
          }}
          groupId={group.id}
        />
      )}
    </div>
  );
}
