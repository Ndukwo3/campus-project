"use client";

import { Search, ArrowLeft, X, Filter, Users, Hash, TrendingUp, ChevronRight, UserPlus, Loader2, User, MessageSquare, Check, Flame, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import BottomNavigation from "@/components/BottomNavigation";
import SearchSkeleton from "@/components/skeletons/SearchSkeleton";
import { createClient } from "@/lib/supabase";
import { capitalizeName } from "@/lib/utils";

const filters = ["All", "Students", "Groups", "Trending"];

export default function SearchPage() {
  const router = useRouter();
  const supabase = createClient();
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [students, setStudents] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [trending, setTrending] = useState<string[]>([]);
  const [connectionStatuses, setConnectionStatuses] = useState<Record<string, 'none' | 'pending_sent' | 'pending_received' | 'connected'>>({});
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isActionLoading, setIsActionLoading] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
      
      let statuses: Record<string, 'none' | 'pending_sent' | 'pending_received' | 'connected'> = {};
      let excludedIds = new Set<string>();

      if (user) {
        excludedIds.add(user.id);
        
        // Fetch friends and pending requests
        const [ { data: friendsData }, { data: requestsData } ] = await Promise.all([
          supabase.from('friends').select('user_id1, user_id2').or(`user_id1.eq.${user.id},user_id2.eq.${user.id}`),
          supabase.from('friend_requests').select('sender_id, receiver_id, status').or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        ]);

        if (friendsData) {
          friendsData.forEach((f: any) => {
            const friendId = f.user_id1 === user.id ? f.user_id2 : f.user_id1;
            statuses[friendId] = 'connected';
            excludedIds.add(friendId);
          });
        }
        if (requestsData) {
          requestsData.forEach((r: any) => {
            if (r.status === 'pending') {
              const otherId = r.sender_id === user.id ? r.receiver_id : r.sender_id;
              statuses[otherId] = r.sender_id === user.id ? 'pending_sent' : 'pending_received';
              excludedIds.add(otherId);
            }
          });
        }
        setConnectionStatuses(statuses);
      }

      let fetchedStudents: any[] = [];

      if (!searchQuery && user) {
        // People you may know - Showing all users for now while base is small
        const { data: allUsers } = await supabase
          .from('profiles')
          .select('*, is_verified')
          .neq('id', user.id)
          .limit(100); // High limit to show everyone while user base is small
          
        let uniqueMap = new Map();
        (allUsers as any[])?.forEach((s: any) => {
          if (!excludedIds.has(s.id) && !uniqueMap.has(s.id)) {
             uniqueMap.set(s.id, s);
          }
        });
        fetchedStudents = Array.from(uniqueMap.values()).slice(0, 20); // Show up to 20 people instead of just 10
      } else {
        // Explicit Search
        let searchQ = supabase.from('profiles').select('*, is_verified').limit(30);
        if (activeFilter === "All" || activeFilter === "Students") {
          searchQ = searchQ.or(`username.ilike.%${searchQuery}%,full_name.ilike.%${searchQuery}%`);
        }
        const { data: searchRes, error: sErr } = await searchQ;
        if (sErr) console.error("Error searching students:", sErr);
        
        // Improved local sorting: connections first, then exact matches, then others
        fetchedStudents = (searchRes as any[] || []).sort((a: any, b: any) => {
          const aStat = statuses[a.id] || 'none';
          const bStat = statuses[b.id] || 'none';
          
          if (aStat === 'connected' && bStat !== 'connected') return -1;
          if (bStat === 'connected' && aStat !== 'connected') return 1;
          
          const aExact = a.username.toLowerCase() === searchQuery.toLowerCase() || a.full_name?.toLowerCase() === searchQuery.toLowerCase();
          const bExact = b.username.toLowerCase() === searchQuery.toLowerCase() || b.full_name?.toLowerCase() === searchQuery.toLowerCase();
          
          if (aExact && !bExact) return -1;
          if (bExact && !aExact) return 1;
          
          return 0;
        });
      }

      setStudents(fetchedStudents);

      // Groups fetching
      let groupsQuery = supabase.from('groups').select('*').limit(6);
      if (searchQuery && (activeFilter === "All" || activeFilter === "Groups")) {
        groupsQuery = groupsQuery.ilike('name', `%${searchQuery}%`);
      }
      const { data: groupData, error: gErr } = await groupsQuery;
      if (gErr) console.error("Error fetching groups:", gErr);
      setGroups(groupData || []);

      // Trending words (Topics) from recent posts
      const { data: trendingPosts } = await supabase
        .from('posts')
        .select('content')
        .order('created_at', { ascending: false })
        .limit(200);
      
      if (trendingPosts) {
        // Extended stop words for academic/Nigerian context
        const stopWords = new Set([
          "the", "and", "for", "that", "this", "with", "you", "not", "are", "from", "your", "all", "have", "new", "out", "was", "but", "can", "what", "about", "who", "get", "has", "just", "will", "how", "why", "now", "see", "like", "our", "its", "then", "than", "there", "their", "when", "some", "them", "which", "because", "they", "been", "one", "more", "very", "much", "even", "still", "good", "well", "into", "also", "come", "made", "work", "much", "know", "here", "take", "time", "back", "first", "want", "went", "over", "last", "long", "give", "down", "post", "page", "user", "update", "today", "yesterday", "tomorrow"
        ]);
        
        const counts: Record<string, number> = {};
        
        trendingPosts.forEach((p: { content: string }) => {
          const content = p.content.toLowerCase();
          
          // 1. Extract hashtags separately and weight them higher
          const hashtags = content.match(/#[a-z0-9_]+/g) || [];
          hashtags.forEach((tag: string) => {
            const cleanTag = tag.replace('#', '');
            if (cleanTag.length >= 3) {
              counts[cleanTag] = (counts[cleanTag] || 0) + 3; // Weight x3
            }
          });

          // 2. Extract regular words
          const words = content.match(/\b[a-z]{3,}\b/g) || [];
          words.forEach((w: string) => {
            if (!stopWords.has(w) && !content.includes('#' + w)) {
              counts[w] = (counts[w] || 0) + 1;
            }
          });
        });
        
        const sortedTrending = Object.entries(counts)
          .filter(([_, count]) => count >= 2) // Minimum frequency
          .sort((a, b) => b[1] - a[1]);
        
        setTrending(sortedTrending.slice(0, 8).map(([word]) => word.charAt(0).toUpperCase() + word.slice(1)));
      }

      setIsLoading(false);
    }

    const timeoutId = setTimeout(() => {
      fetchData();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, activeFilter, supabase]);

  const handleJoinGroup = async (groupId: string) => {
    if (!currentUser || isActionLoading) return;
    setIsActionLoading(groupId);

    try {
      const { error } = await supabase
        .from('group_members')
        .insert({
          group_id: groupId,
          user_id: currentUser.id,
          role: 'member'
        });

      if (error) throw error;
      
      // Update local state to show joined (optional, or just redirect)
      router.push(`/groups/${groupId}`);
    } catch (err: any) {
      console.error("Error joining group:", err);
    } finally {
      setIsActionLoading(null);
    }
  };

  const handleConnect = async (studentId: string) => {
    if (!currentUser || isActionLoading) return;
    setIsActionLoading(studentId);
    
    const currentStatus = connectionStatuses[studentId] || 'none';
    
    try {
      if (currentStatus === 'none') {
        await supabase.from('friend_requests').insert({
          sender_id: currentUser.id,
          receiver_id: studentId,
          status: 'pending'
        });
        await supabase.from('notifications').insert({
          user_id: studentId,
          sender_id: currentUser.id,
          type: 'connect_request',
          content: 'wants to connect with you.',
          is_read: false
        });
        setConnectionStatuses(prev => ({ ...prev, [studentId]: 'pending_sent' }));
      } else if (currentStatus === 'pending_received') {
        await supabase.from('friend_requests').update({ status: 'accepted' })
          .match({ sender_id: studentId, receiver_id: currentUser.id, status: 'pending' });
        
        await supabase.from('notifications').delete()
          .match({ user_id: currentUser.id, sender_id: studentId, type: 'connect_request' });

        await supabase.from('notifications').insert({
          user_id: studentId,
          sender_id: currentUser.id,
          type: 'connect_accepted',
          content: 'accepted your connect request!',
          is_read: false
        });
        setConnectionStatuses(prev => ({ ...prev, [studentId]: 'connected' }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsActionLoading(null);
    }
  };

  const handleMessageClick = async (studentId: string) => {
    if (!currentUser || isActionLoading) return;
    setIsActionLoading(studentId);

    try {
      // 1. Check if conversation already exists
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
          .eq('user_id', studentId);

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
          setIsActionLoading(null);
          return router.push(`/messages/${targetConvoId}`);
        }
      }

      // 2. Create new conversation if none exists
      const newConvoId = crypto.randomUUID();
      const { error: convoError } = await supabase
        .from('conversations')
        .insert({ id: newConvoId });
        
      if (!convoError) {
        await supabase.from('conversation_participants').insert([
          { conversation_id: newConvoId, user_id: currentUser.id },
          { conversation_id: newConvoId, user_id: studentId }
        ]);
        setIsActionLoading(null);
        router.push(`/messages/${newConvoId}`);
      }
    } catch(err) {
      console.error("Could not start conversation:", err);
    } finally {
      setIsActionLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black pb-[100px] lg:pb-0 relative font-sans overflow-x-hidden transition-colors">
      {/* Search Header Container */}
      <div className="sticky top-0 z-40 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-zinc-100/50 dark:border-zinc-800/50">
        <div className="px-6 pt-10 pb-5">
          <div className="flex items-center gap-4 mb-6">
            <Link 
              href="/" 
              prefetch={true}
              className="w-11 h-11 flex items-center justify-center rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 active:scale-95 transition-all shrink-0 group hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <ArrowLeft size={18} strokeWidth={2.5} className="group-hover:-translate-x-0.5 transition-transform" />
            </Link>
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 w-4.5 h-4.5 group-focus-within:text-black dark:group-focus-within:text-white transition-colors" />
              <input
                type="text"
                placeholder="Find peers, groups, news..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-900 rounded-2xl py-3.5 pl-11 pr-11 outline-none placeholder:text-zinc-400 dark:placeholder:text-zinc-600 font-bold text-[13.5px] text-black dark:text-white focus:bg-white dark:focus:bg-zinc-800 focus:ring-4 focus:ring-[#E5FF66]/20 transition-all border border-zinc-100/50 dark:border-zinc-800 focus:border-[#E5FF66]/50"
              />
              <AnimatePresence>
                {searchQuery && (
                  <motion.button 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={() => setSearchQuery("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors"
                  >
                    <X size={12} strokeWidth={3} />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Horizontal Filters */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-6 py-2 rounded-[14px] text-xs font-black transition-all whitespace-nowrap active:scale-95 border ${
                  activeFilter === filter 
                  ? "bg-zinc-900 dark:bg-[#E5FF66] border-zinc-900 dark:border-[#E5FF66] text-white dark:text-black shadow-lg shadow-zinc-200 dark:shadow-none" 
                  : "bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500 hover:border-zinc-300 dark:hover:border-zinc-700"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="px-5 mt-6 space-y-9 relative min-h-[60vh]">
        {isLoading ? (
          <SearchSkeleton />
        ) : (
          <>
            {/* Trending Section - Styled like a premium tag collection */}
            {(activeFilter === "All" || activeFilter === "Trending") && (
              <motion.section
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center justify-between mb-5 px-1">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center">
                       <Flame size={16} className="text-orange-500" fill="currentColor" />
                    </div>
                    <h2 className="text-[17px] font-black tracking-tight text-zinc-900 dark:text-zinc-100">Trending Now</h2>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-300 dark:text-zinc-600">Live Updates</span>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {trending.map((tag, i) => (
                    <motion.button 
                      key={tag} 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => setSearchQuery(tag)}
                      className="bg-white dark:bg-zinc-900 px-5 py-3 rounded-2xl text-[13px] font-bold text-zinc-800 dark:text-zinc-100 shadow-[0_4px_15px_rgba(0,0,0,0.02)] dark:shadow-none border border-zinc-100 dark:border-zinc-800 hover:border-[#E5FF66] dark:hover:border-[#E5FF66] hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all group flex items-center gap-2"
                    >
                      {tag}
                    </motion.button>
                  ))}
                  {trending.length === 0 && (
                    <div className="w-full py-4 text-center bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800">
                       <p className="text-[11px] font-bold text-zinc-400 dark:text-zinc-600">Waiting for trends to ignite...</p>
                    </div>
                  )}
                </div>
              </motion.section>
            )}

            {/* Suggested Students */}
            {(activeFilter === "All" || activeFilter === "Students") && (
              <section>
                <div className="flex items-center justify-between mb-4 px-1">
                  <h2 className="text-[17px] font-black tracking-tight text-zinc-900 dark:text-zinc-100">
                    {searchQuery ? "Univas Results" : "People you may know"}
                  </h2>
                  <button className="flex items-center gap-1 text-[11px] font-black text-zinc-400 dark:text-zinc-600 hover:text-black dark:hover:text-white transition-colors">
                    REFRESH <Users size={12} />
                  </button>
                </div>
                <div className="flex flex-col gap-1.5">
                  <AnimatePresence mode="popLayout">
                    {students.length > 0 ? (
                      students.map((student, i) => {
                        const status = connectionStatuses[student.id] || 'none';
                        return (
                          <motion.div
                            key={student.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 + i * 0.05 }}
                            layout
                          >
                            <div className="flex items-center gap-4 px-4 py-4 bg-white dark:bg-zinc-900/50 hover:bg-zinc-50/50 dark:hover:bg-zinc-800 transition-all rounded-[32px] group border border-zinc-50 dark:border-zinc-800 hover:border-zinc-100 dark:hover:border-zinc-700 ring-1 ring-transparent hover:ring-zinc-50/50 dark:hover:ring-zinc-800">
                              <Link 
                                href={student.username ? `/profile/${student.username.replace('@', '')}` : `/profile/${student.id}`}
                                className="h-[60px] w-[60px] rounded-[24px] overflow-hidden bg-zinc-100 dark:bg-zinc-800 shrink-0 relative active:scale-95 transition-transform"
                              >
                                {student.avatar_url ? (
                                  <Image src={student.avatar_url} alt={student.full_name || student.username} width={60} height={60} className="h-full w-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-zinc-50 dark:bg-zinc-900">
                                     <User className="text-zinc-300 dark:text-zinc-700 w-8 h-8" />
                                  </div>
                                )}
                              </Link>
                              <Link 
                                href={student.username ? `/profile/${student.username.replace('@', '')}` : `/profile/${student.id}`}
                                className="flex-1 min-w-0"
                              >
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <h3 className="text-[15.5px] font-bold text-zinc-900 dark:text-zinc-100 truncate tracking-tight">{capitalizeName(student.full_name || student.username)}</h3>
                                  {student.is_verified && (
                                    <CheckCircle2 size={14} className="fill-black dark:fill-[#E5FF66] text-white dark:text-black shrink-0" />
                                  )}
                                </div>
                                <p className="text-[12.5px] font-medium text-zinc-500 dark:text-zinc-400 truncate mt-0.5">{student.universities?.name || "Lagos City, NG"}</p>
                              </Link>
                              {student.id !== currentUser?.id && (
                                <button 
                                  onClick={() => status === 'connected' ? handleMessageClick(student.id) : handleConnect(student.id)}
                                  disabled={isActionLoading === student.id || status === 'pending_sent'}
                                  className={`h-11 w-11 flex items-center justify-center rounded-[20px] transition-all duration-300 active:scale-90 ${
                                    status === 'connected'
                                    ? "bg-zinc-900 dark:bg-[#E5FF66] text-[#E5FF66] dark:text-black shadow-lg shadow-black/10"
                                    : status === 'pending_sent'
                                    ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-300 dark:text-zinc-600"
                                    : status === 'pending_received'
                                    ? "bg-black dark:bg-white text-white dark:text-black"
                                    : "bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-100 dark:border-zinc-700 hover:bg-[#E5FF66] hover:border-[#E5FF66] dark:hover:bg-[#E5FF66] dark:hover:border-[#E5FF66] shadow-[0_2px_10px_rgba(0,0,0,0.02)]"
                                  }`}
                                >
                                  {isActionLoading === student.id ? (
                                    <Loader2 size={16} className="animate-spin" />
                                  ) : status === 'connected' ? (
                                    <MessageSquare size={20} strokeWidth={2.5} />
                                  ) : status === 'pending_sent' ? (
                                    <Check size={20} strokeWidth={4} />
                                  ) : (
                                    <UserPlus size={20} strokeWidth={2.5} />
                                  )}
                                </button>
                              )}
                            </div>
                          </motion.div>
                        );
                      })
                    ) : (
                      <div className="py-20 flex flex-col items-center text-center px-10">
                         <div className="w-20 h-20 bg-zinc-50 dark:bg-zinc-900 rounded-full flex items-center justify-center mb-6">
                            <Search className="text-zinc-200 dark:text-zinc-800 w-10 h-10" />
                         </div>
                         <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-100 mb-2">No students found</h3>
                         <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Try searching for a name, username, or even their university.</p>
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              </section>
            )}

            {/* Univas Groups */}
            {(activeFilter === "All" || activeFilter === "Groups") && (
              <section>
                <div className="flex items-center justify-between mb-5 px-1">
                  <h2 className="text-[17px] font-black tracking-tight text-zinc-900 dark:text-zinc-100">Communities</h2>
                  <Link href="/univas" className="text-[11px] font-black text-zinc-400 dark:text-zinc-500 hover:text-black dark:hover:text-white">SEE MAP</Link>
                </div>
                <div className="grid grid-cols-2 gap-4 pb-12">
                  <AnimatePresence>
                    {groups.length > 0 ? (
                      groups.map((group, i) => (
                        <motion.div 
                          key={group.id} 
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.2 + i * 0.05 }}
                          className="bg-white dark:bg-zinc-900 rounded-[40px] p-2.5 shadow-[0_10px_35px_rgba(0,0,0,0.025)] dark:shadow-none border border-zinc-100/50 dark:border-zinc-800 group overflow-hidden flex flex-col h-full"
                        >
                          <div className="h-32 rounded-[32px] overflow-hidden relative mb-4 shrink-0">
                            {group.image_url ? (
                              <Image src={group.image_url} alt={group.name} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-800 dark:to-zinc-900 flex items-center justify-center">
                                <Users className="text-zinc-200 dark:text-zinc-700 w-9 h-9" />
                              </div>
                            )}
                            <div className="absolute top-2 right-2 px-2.5 py-1.5 bg-white/90 dark:bg-black/80 backdrop-blur-sm rounded-xl shadow-sm border border-white/50 dark:border-zinc-800">
                               <p className="text-[10px] font-black text-black dark:text-[#E5FF66]">HOT</p>
                            </div>
                          </div>
                          <div className="px-2 pb-2 flex-1 flex flex-col">
                            <h3 className="text-[14px] font-extrabold text-zinc-900 dark:text-zinc-100 mb-1 leading-tight line-clamp-1">{group.name}</h3>
                            <button 
                              onClick={() => handleJoinGroup(group.id)}
                              disabled={isActionLoading === group.id}
                              className="w-full mt-auto py-3 bg-[#1A1A24] dark:bg-zinc-800 rounded-2xl text-[11px] font-black text-white hover:bg-black dark:hover:bg-zinc-700 transition-all active:scale-95 shadow-lg shadow-zinc-200 dark:shadow-none group-hover:bg-[#E5FF66] group-hover:text-black group-hover:shadow-[#E5FF66]/20"
                            >
                              {isActionLoading === group.id ? <Loader2 size={16} className="animate-spin mx-auto" /> : "EXPLORE"}
                            </button>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="col-span-2 py-12 text-center text-sm font-bold text-zinc-300 dark:text-zinc-600 bg-zinc-50 dark:bg-zinc-900/50 rounded-[40px] border border-dashed border-zinc-200 dark:border-zinc-800">
                        Searching communities...
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              </section>
            )}
          </>
        )}
      </main>

      <BottomNavigation />
    </div>
  );
}
