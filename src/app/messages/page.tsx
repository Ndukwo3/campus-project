"use client";

import { Search, MoreVertical, Edit, Plus, Loader2, User, MessageSquare } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import BottomNavigation from "@/components/BottomNavigation";
import ChatListSkeleton from "@/components/skeletons/ChatListSkeleton";
import { createClient } from "@/lib/supabase";

// Realtime handling will be done here

import { useQuery, useQueryClient } from "@tanstack/react-query";

export default function MessagesPage() {
  const supabase = createClient();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isStartingChat, setIsStartingChat] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  // 🏛️ The "Instant-Inbox" Engine
  const { data: chats = [], isLoading } = useQuery({
    queryKey: ['inbox'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) return [];

      const { data: myConversations, error: convError } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', user.id);

      if (convError || !myConversations || myConversations.length === 0) return [];

      const conversationIds = myConversations.map((c: any) => c.conversation_id);

      const [partnersResult, latestMsgsResult] = await Promise.all([
        supabase
          .from('conversation_participants')
          .select('conversation_id, profiles(id, username, full_name, avatar_url)')
          .in('conversation_id', conversationIds)
          .neq('user_id', user.id),
        supabase
          .from('messages')
          .select('id, conversation_id, content, sender_id, is_read, created_at')
          .in('conversation_id', conversationIds)
          .order('created_at', { ascending: false })
      ]);

      if (!partnersResult.data || !latestMsgsResult.data) return [];

      const unreadCounts: Record<string, number> = {};
      for (const msg of latestMsgsResult.data) {
        if (!msg.is_read && msg.sender_id !== user.id) {
          unreadCounts[msg.conversation_id] = (unreadCounts[msg.conversation_id] || 0) + 1;
        }
      }

      const builtChats = [];
      const processedIds = new Set();
      
      for (const msg of latestMsgsResult.data) {
        if (!processedIds.has(msg.conversation_id)) {
          processedIds.add(msg.conversation_id);
          const partner = partnersResult.data.find((p: any) => p.conversation_id === msg.conversation_id)?.profiles;
          const partnerData = Array.isArray(partner) ? partner[0] : partner;
          
          builtChats.push({
            id: msg.conversation_id,
            partner_id: partnerData?.id,
            name: partnerData?.full_name || partnerData?.username || "Unknown Student",
            avatar: partnerData?.avatar_url,
            lastMessage: msg.content.startsWith('[IMAGE]') ? "📷 Photo" 
                         : msg.content.startsWith('[VOICE_NOTE]') ? "🎤 Voice Note" 
                         : msg.content,
            time: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            unread: unreadCounts[msg.conversation_id] || 0,
            online: true, 
          });
        }
      }
      return builtChats;
    },
    staleTime: 60 * 1000,
  });

  const { data: activeUsers = [] } = useQuery({
    queryKey: ['active-users'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data: friends, error: friendError } = await supabase
        .from('friends')
        .select('user_id1, user_id2')
        .or(`user_id1.eq.${user.id},user_id2.eq.${user.id}`);
        
      if (friendError || !friends || friends.length === 0) return [];

      const friendIds = friends.map((f: any) => f.user_id1 === user.id ? f.user_id2 : f.user_id1);
      const { data: friendProfiles } = await supabase
        .from('profiles')
        .select('id, full_name, username, avatar_url, last_seen')
        .in('id', friendIds);
        
      if (!friendProfiles) return [];

      return friendProfiles.map((p: any) => ({
        id: p.id,
        name: p.full_name || p.username,
        avatar: p.avatar_url,
        online: p.last_seen ? (new Date().getTime() - new Date(p.last_seen).getTime() < 5 * 60 * 1000) : false
      }));
    },
    staleTime: 30 * 1000,
  });

  useEffect(() => {
    const msgChannel = supabase.channel('inbox-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => {
         queryClient.invalidateQueries({ queryKey: ['inbox'] });
      })
      .subscribe();

  }, [supabase, queryClient]);

  const filteredChats = chats.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStartChat = async (partnerId: string) => {
    setIsStartingChat(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    try {
      // 1. Check if convo exists
      const { data: myConvos } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', user.id);
        
      if (myConvos && myConvos.length > 0) {
        const convoIds = myConvos.map((c: any) => c.conversation_id);
        const { data: sharedConvo } = await supabase
          .from('conversation_participants')
          .select('conversation_id')
          .in('conversation_id', convoIds)
          .eq('user_id', partnerId)
          .limit(1)
          .maybeSingle();

        if (sharedConvo) {
          router.push(`/messages/${sharedConvo.conversation_id}`);
          return;
        }
      }

      // 2. Create new convo
      const { data: newConvo } = await supabase.from('conversations').insert({}).select('id').single();
      if (newConvo) {
        await supabase.from('conversation_participants').insert([
          { conversation_id: newConvo.id, user_id: user.id },
          { conversation_id: newConvo.id, user_id: partnerId }
        ]);
        router.push(`/messages/${newConvo.id}`);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsStartingChat(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] dark:bg-black pb-[110px] max-w-md mx-auto relative font-sans transition-colors">
      {/* Premium Header with Backdrop Blur */}
      <div className="sticky top-0 z-40 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-zinc-100/50 dark:border-zinc-800/50">
        <div className="px-6 pt-10 pb-5 flex items-center justify-between gap-4">
          <AnimatePresence mode="wait">
            {!isSearching ? (
              <motion.h1 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100"
              >
                Messages
              </motion.h1>
            ) : (
              <motion.div 
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="flex-1 relative"
              >
                <input 
                  autoFocus
                  type="text"
                  placeholder="Search messages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-zinc-100 dark:bg-zinc-900 border-none rounded-2xl px-4 py-2.5 text-[15px] font-medium outline-none text-zinc-900 dark:text-white"
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex gap-2 relative">
            <button 
              onClick={() => {
                setIsSearching(!isSearching);
                if (isSearching) setSearchQuery("");
              }}
              className={`w-10 h-10 flex items-center justify-center rounded-2xl transition-all active:scale-95 ${isSearching ? 'bg-zinc-900 dark:bg-[#E5FF66] text-white dark:text-black' : 'bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200'}`}
            >
              <Search size={20} />
            </button>
            <div className="relative">
              <button 
                onClick={() => setShowMoreMenu(!showMoreMenu)}
                className={`w-10 h-10 flex items-center justify-center rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 active:scale-95 transition-all ${showMoreMenu ? 'ring-2 ring-[#E5FF66]' : ''}`}
              >
                <MoreVertical size={20} />
              </button>

              {/* More Menu Dropdown */}
              <AnimatePresence>
                {showMoreMenu && (
                  <>
                    <div 
                      className="fixed inset-0 z-[-1]" 
                      onClick={() => setShowMoreMenu(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      className="absolute right-0 mt-2 w-48 bg-white dark:bg-zinc-900 rounded-[24px] shadow-2xl border border-zinc-100 dark:border-zinc-800 overflow-hidden py-2"
                    >
                      <button className="w-full px-5 py-3 text-left text-xs font-black uppercase tracking-widest text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                        Mark All Read
                      </button>
                      <button className="w-full px-5 py-3 text-left text-xs font-black uppercase tracking-widest text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                        Archive All
                      </button>
                      <button className="w-full px-5 py-3 text-left text-xs font-black uppercase tracking-widest text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
                        Delete All
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Active Users Section - Horizontal Scroll */}
      <div className="py-6 overflow-hidden">
        <div className="px-6 flex items-center justify-between mb-4">
          <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-600">Active Now</h2>
          <span className="w-2 h-2 bg-[#4ADE80] rounded-full animate-pulse"></span>
        </div>
        
        {activeUsers.length > 0 ? (
          <div className="flex gap-5 overflow-x-auto px-6 pb-2 scrollbar-hide">
            {activeUsers.map((user: any) => (
              <div 
                key={user.id} 
                onClick={() => handleStartChat(user.id)}
                className="flex flex-col items-center gap-3 shrink-0 group cursor-pointer active:scale-95 transition-transform"
              >
                <div className="relative">
                  <div className="w-16 h-16 rounded-full overflow-hidden p-[2.5px] bg-gradient-to-tr from-[#E5FF66] to-[#4ADE80] ring-1 ring-zinc-100/50 dark:ring-zinc-800/50">
                    <div className="w-full h-full rounded-full overflow-hidden bg-white dark:bg-zinc-900 flex items-center justify-center">
                      {user.avatar ? (
                        <Image 
                          src={user.avatar} 
                          alt={user.name} 
                          width={64} 
                          height={64} 
                          className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110" 
                        />
                      ) : (
                        <User className="text-zinc-300 dark:text-zinc-700 w-8 h-8" />
                      )}
                    </div>
                  </div>
                  <div className="absolute bottom-0 right-0 w-4.5 h-4.5 bg-[#4ADE80] rounded-full border-[3px] border-white dark:border-black shadow-sm"></div>
                </div>
                <span className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400 tracking-tight max-w-[64px] truncate">{user.name}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-6 py-4 flex items-center gap-3">
             <div className="w-16 h-16 rounded-full border-2 border-dashed border-zinc-200 dark:border-zinc-800 flex items-center justify-center bg-zinc-50 dark:bg-zinc-900 shrink-0">
               <Plus className="w-6 h-6 text-zinc-300 dark:text-zinc-700" />
             </div>
             <div>
               <p className="text-[13px] font-medium text-zinc-600 dark:text-zinc-400">No other students online</p>
               <p className="text-[11px] text-zinc-400 dark:text-zinc-600">Connections will appear here when online.</p>
             </div>
          </div>
        )}
      </div>

      {/* Chat List Section */}
      <div className="px-5 mt-2">
        <div className="flex items-center justify-between mb-5 px-1">
          <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-600">Recent Chats</h2>
          <button className="text-[11px] font-bold text-[#222] dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-900 px-3 py-1 rounded-full active:scale-95 transition-all">Mark Read</button>
        </div>
        
        <div className="flex flex-col gap-1">
          {isLoading ? (
            <ChatListSkeleton />
          ) : filteredChats.length > 0 ? (
            filteredChats.map((chat) => (
            <Link 
              key={chat.id} 
              href={`/messages/${chat.id}`}
              className="flex items-center gap-4 p-3 rounded-[28px] hover:bg-white dark:hover:bg-zinc-900/50 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:hover:shadow-none active:scale-[0.98] transition-all cursor-pointer group"
            >
              <div className="relative shrink-0">
                <div className="w-[60px] h-[60px] rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-900 ring-4 ring-transparent group-hover:ring-[#E5FF66]/30 transition-all">
                  {chat.avatar ? (
                    <Image 
                      src={chat.avatar} 
                      alt={chat.name} 
                      width={60} 
                      height={60} 
                      className="object-cover w-full h-full" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-zinc-50 dark:bg-zinc-900/50 text-zinc-300 dark:text-zinc-700">
                      <User size={30} />
                    </div>
                  )}
                </div>
                {chat.online && (
                  <div className="absolute bottom-0 right-0 w-4 h-4 bg-[#4ADE80] rounded-full border-2 border-white dark:border-black shadow-sm"></div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-0.5">
                  <h3 className="font-bold text-[15px] text-zinc-900 dark:text-zinc-100 truncate tracking-tight">{chat.name}</h3>
                  <span className={`text-[11px] font-medium ${chat.unread > 0 ? "text-zinc-900 dark:text-[#E5FF66] font-bold" : "text-zinc-400 dark:text-zinc-600"}`}>
                    {chat.time}
                  </span>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <p className={`text-[13.5px] truncate flex-1 tracking-tight ${chat.unread > 0 ? "text-zinc-900 dark:text-zinc-300 font-semibold" : "text-zinc-500 dark:text-zinc-400 font-medium"}`}>
                    {chat.lastMessage}
                  </p>
                  {chat.unread > 0 && (
                    <div className="min-w-[20px] h-5 px-1.5 bg-[#E5FF66] rounded-full flex items-center justify-center shrink-0 shadow-[0_2px_10px_rgba(229,255,102,0.4)]">
                      <span className="text-[10px] font-black text-black">{chat.unread}</span>
                    </div>
                  )}
                </div>
              </div>
            </Link>
           ))
          ) : (
            <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
               <div className="w-16 h-16 bg-zinc-50 dark:bg-zinc-900 rounded-full flex items-center justify-center mb-4">
                 <MessageSquare className="w-8 h-8 text-zinc-300 dark:text-zinc-700" />
               </div>
               <h3 className="text-[15px] font-black text-zinc-900 dark:text-zinc-100 mb-1">No messages yet</h3>
               <p className="text-[13px] font-medium text-zinc-500 dark:text-zinc-500 max-w-[200px]">Start a conversation with your peers to collaborate!</p>
            </div>
          )}
        </div>
      </div>


      <BottomNavigation />
    </div>
  );
}
