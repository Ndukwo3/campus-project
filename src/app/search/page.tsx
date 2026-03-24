"use client";

import { Search, ArrowLeft, X, Filter, Users, Hash, TrendingUp, ChevronRight, UserPlus, Loader2, User, MessageSquare, Check } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import BottomNavigation from "@/components/BottomNavigation";
import { createClient } from "@/lib/supabase";

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
          .select('*')
          .neq('id', user.id)
          .limit(100); // High limit to show everyone while user base is small
          
        let uniqueMap = new Map();
        allUsers?.forEach(s => {
          if (!excludedIds.has(s.id) && !uniqueMap.has(s.id)) {
             uniqueMap.set(s.id, s);
          }
        });
        fetchedStudents = Array.from(uniqueMap.values()).slice(0, 20); // Show up to 20 people instead of just 10
      } else {
        // Explicit Search
        let searchQ = supabase.from('profiles').select('*').limit(30);
        if (activeFilter === "All" || activeFilter === "Students") {
          searchQ = searchQ.or(`username.ilike.%${searchQuery}%,full_name.ilike.%${searchQuery}%`);
        }
        const { data: searchRes, error: sErr } = await searchQ;
        if (sErr) console.error("Error searching students:", sErr);
        
        // Improved local sorting: connections first, then exact matches, then others
        fetchedStudents = (searchRes || []).sort((a, b) => {
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
        
        trendingPosts.forEach(p => {
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
        const { data: sharedConvo } = await supabase
          .from('conversation_participants')
          .select('conversation_id')
          .in('conversation_id', convoIds)
          .eq('user_id', studentId)
          .limit(1)
          .maybeSingle();

        if (sharedConvo) {
          router.push(`/messages/${sharedConvo.conversation_id}`);
          return;
        }
      }

      // 2. Create new conversation if none exists
      const { data: newConvo, error: convoError } = await supabase
        .from('conversations')
        .insert({})
        .select('id')
        .single();
        
      if (newConvo && !convoError) {
        await supabase.from('conversation_participants').insert([
          { conversation_id: newConvo.id, user_id: currentUser.id },
          { conversation_id: newConvo.id, user_id: studentId }
        ]);
        router.push(`/messages/${newConvo.id}`);
      }
    } catch(err) {
      console.error("Could not start conversation:", err);
    } finally {
      setIsActionLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-[100px] max-w-md mx-auto relative font-sans">
      {/* Search Header */}
      <div className="sticky top-0 z-30 bg-[#F8F9FA]/80 backdrop-blur-md px-6 pt-8 pb-4">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/" className="w-12 h-12 flex items-center justify-center rounded-full bg-white shadow-sm hover:bg-zinc-50 transition shrink-0">
            <ArrowLeft size={20} className="text-zinc-800" />
          </Link>
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5 group-focus-within:text-zinc-600 transition-colors" />
            <input
              type="text"
              placeholder="Search people, groups, posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white shadow-sm rounded-2xl py-3.5 pl-12 pr-12 outline-none placeholder:text-zinc-400 font-medium text-sm text-black focus:ring-2 focus:ring-[#E5FF66]/50 transition border border-transparent focus:border-white"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full bg-zinc-100 text-zinc-500 hover:bg-zinc-200 transition"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Horizontal Filters */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap active:scale-95 ${
                activeFilter === filter 
                ? "bg-[#1A1A24] text-white shadow-md shadow-zinc-200" 
                : "bg-white text-zinc-500 shadow-sm border border-zinc-100/50"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      <main className="px-6 space-y-8 mt-4">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-zinc-300" />
          </div>
        ) : (
          <>
            {/* Trending Section */}
            {(activeFilter === "All" || activeFilter === "Trending") && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp size={18} className="text-zinc-400" />
                    <h2 className="text-[17px] font-bold text-zinc-800">Trending Now</h2>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {trending.map((tag) => (
                    <button 
                      key={tag} 
                      onClick={() => setSearchQuery(tag.replace('...', ''))}
                      className="bg-white px-4 py-2.5 rounded-xl text-[13px] font-semibold text-zinc-700 shadow-sm border border-zinc-50 hover:bg-zinc-50 transition active:scale-95"
                    >
                      {tag}
                    </button>
                  ))}
                  {trending.length === 0 && <p className="text-xs text-zinc-400">No trends yet</p>}
                </div>
              </section>
            )}

            {/* Suggested Students */}
            {(activeFilter === "All" || activeFilter === "Students") && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-[17px] font-bold text-zinc-800">
                    {searchQuery ? "Search Results" : "People you may know"}
                  </h2>
                  <Link href="#" className="text-xs font-bold text-zinc-400 uppercase tracking-widest hover:text-zinc-600">See All</Link>
                </div>
                <div className="bg-white rounded-[32px] p-2 shadow-sm border border-zinc-100/50 flex flex-col gap-1">
                  {students.length > 0 ? (
                    students.map((student) => {
                      const status = connectionStatuses[student.id] || 'none';
                      return (
                        <div key={student.id} className="flex items-center gap-3 px-3 py-4 hover:bg-zinc-50/50 transition-colors rounded-2xl group">
                          <div className="h-14 w-14 rounded-2xl overflow-hidden bg-zinc-100 shrink-0 group-hover:scale-95 transition-transform flex items-center justify-center">
                            {student.avatar_url ? (
                              <Image src={student.avatar_url} alt={student.full_name || student.username} width={56} height={56} className="h-full w-full object-cover" />
                            ) : (
                              <User className="text-zinc-300 w-7 h-7" />
                            )}
                          </div>
                          <Link 
                            href={`/profile/${student.id}`}
                            className="flex-1 min-w-0 pr-1 cursor-pointer"
                          >
                            <h3 className="text-[15px] font-bold text-zinc-900 truncate tracking-tight hover:text-black">{student.full_name || student.username}</h3>
                            <p className="text-[13px] font-medium text-zinc-500 truncate">{student.universities?.name || "Nigerian University"}</p>
                          </Link>
                          {student.id !== currentUser?.id && (
                            <button 
                              onClick={() => status === 'connected' ? handleMessageClick(student.id) : handleConnect(student.id)}
                              disabled={isActionLoading === student.id || status === 'pending_sent'}
                              className={`h-10 w-10 flex items-center justify-center rounded-2xl shadow-sm active:scale-90 transition ${
                                status === 'connected'
                                ? "bg-white border border-zinc-100 text-black hover:bg-zinc-50"
                                : status === 'pending_sent'
                                ? "bg-zinc-100 text-zinc-500"
                                : status === 'pending_received'
                                ? "bg-black text-white"
                                : "bg-[#E5FF66] text-black"
                              }`}
                            >
                              {isActionLoading === student.id ? (
                                <Loader2 size={16} className="animate-spin" />
                              ) : status === 'connected' ? (
                                <MessageSquare size={18} strokeWidth={2.5} />
                              ) : status === 'pending_sent' ? (
                                <Check size={18} strokeWidth={3} />
                              ) : status === 'pending_received' ? (
                                <UserPlus size={18} strokeWidth={2.5} />
                              ) : (
                                <UserPlus size={18} strokeWidth={2.5} />
                              )}
                            </button>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <p className="p-6 text-center text-sm text-zinc-400">No students found</p>
                  )}
                </div>
              </section>
            )}

            {/* Campus Groups */}
            {(activeFilter === "All" || activeFilter === "Groups") && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-[17px] font-bold text-zinc-800">Campus Groups</h2>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {groups.length > 0 ? (
                    groups.map((group) => (
                      <div key={group.id} className="bg-white rounded-[32px] p-2 shadow-sm border border-zinc-100/50 group overflow-hidden">
                        <div className="h-32 rounded-3xl overflow-hidden relative mb-3">
                          {group.image_url ? (
                            <Image src={group.image_url} alt={group.name} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-zinc-100 to-zinc-200 flex items-center justify-center">
                              <Users className="text-zinc-300 w-10 h-10" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                          <div className="absolute bottom-3 left-3 flex items-center gap-2">
                            <span className="text-[10px] font-bold text-white uppercase tracking-tighter opacity-80">Active Community</span>
                          </div>
                        </div>
                        <div className="px-2 pb-2">
                          <h3 className="text-sm font-bold text-zinc-900 mb-1 leading-tight truncate">{group.name}</h3>
                          <button 
                            onClick={() => handleJoinGroup(group.id)}
                            disabled={isActionLoading === group.id}
                            className="w-full py-2 bg-[#E5FF66] rounded-xl text-[11px] font-bold text-black hover:bg-black hover:text-white transition flex items-center justify-center gap-2"
                          >
                            {isActionLoading === group.id ? <Loader2 size={14} className="animate-spin" /> : "Join Group"}
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-2 py-8 text-center text-sm text-zinc-400">No groups found</div>
                  )}
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
