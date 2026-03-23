"use client";

import { Search, MoreVertical, Edit, Plus, Loader2, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import BottomNavigation from "@/components/BottomNavigation";
import { createClient } from "@/lib/supabase";

// Realtime handling will be done here

export default function MessagesPage() {
  const supabase = createClient();
  const router = useRouter();
  const [chats, setChats] = useState<any[]>([]);
  const [activeUsers, setActiveUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isStartingChat, setIsStartingChat] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function fetchMessages() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !isMounted) {
        if (isMounted) setIsLoading(false);
        return;
      }

      // 1. Get user's conversation lists sorted by updated_at (newest first)
      const { data: myConversations, error: convError } = await supabase
        .from('conversation_participants')
        .select(`
          conversation_id,
          conversations (updated_at)
        `)
        .eq('user_id', user.id);

      // Separate logic for chats and active users to ensure bar is populated even if inbox is empty
      if (myConversations && myConversations.length > 0 && !convError) {
        // Sort conversations manually since they are nested
        const sortedConvos = [...myConversations].sort((a: any, b: any) => 
          new Date(b.conversations?.updated_at || 0).getTime() - new Date(a.conversations?.updated_at || 0).getTime()
        );

        const conversationIds = sortedConvos.map((c: any) => c.conversation_id);

        // Fetch partners
        const { data: partnersData } = await supabase
          .from('conversation_participants')
          .select(`
            conversation_id,
            profiles (id, username, full_name, avatar_url)
          `)
          .in('conversation_id', conversationIds)
          .neq('user_id', user.id);

        // Fetch latest message for each
        const { data: latestMessages } = await supabase
          .from('messages')
          .select('*')
          .in('conversation_id', conversationIds)
          .order('created_at', { ascending: false });

        const builtChats = [];
        const usedIds = new Set();
        
        for (const msg of latestMessages || []) {
          if (!usedIds.has(msg.conversation_id)) {
            usedIds.add(msg.conversation_id);
            const partnerRecord = partnersData?.find(p => p.conversation_id === msg.conversation_id);
            const partnerMetaRaw = partnerRecord ? partnerRecord.profiles : null;
            const partnerMeta = Array.isArray(partnerMetaRaw) ? partnerMetaRaw[0] : partnerMetaRaw;
            
            builtChats.push({
              id: msg.conversation_id,
              partner_id: partnerMeta?.id,
              name: partnerMeta?.full_name || partnerMeta?.username || "Unknown",
              avatar: partnerMeta?.avatar_url,
              lastMessage: msg.content.startsWith('[IMAGE]') ? "📷 Photo" 
                           : msg.content.startsWith('[VOICE_NOTE]') ? "🎤 Voice Note" 
                           : msg.content,
              time: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              unread: (msg.is_read || msg.sender_id === user.id) ? 0 : 1,
              online: true, // Show all as online for UX
            });
          }
        }
        if (isMounted) setChats(builtChats);
      }

      // 4. Fetch ONLY Active Friends (making it exclusive as requested)
      const { data: friends } = await supabase
        .from('friends')
        .select('*')
        .or(`user_id1.eq.${user.id},user_id2.eq.${user.id}`);
        
      if (friends && friends.length > 0) {
        const friendIds = friends.map((f: any) => f.user_id1 === user.id ? f.user_id2 : f.user_id1);
        const { data: friendProfiles } = await supabase
          .from('profiles')
          .select('id, full_name, username, avatar_url, last_seen')
          .in('id', friendIds);
          
        if (friendProfiles && isMounted) {
          const processedActives = friendProfiles.map(p => {
            const isRecentlyActive = p.last_seen ? (new Date().getTime() - new Date(p.last_seen).getTime() < 5 * 60 * 1000) : false;
            return {
              id: p.id,
              name: p.full_name || p.username,
              avatar: p.avatar_url,
              online: isRecentlyActive
            };
          });
          setActiveUsers(processedActives);
        }
      } else if (isMounted) {
        setActiveUsers([]);
      }

      if (isMounted) setIsLoading(false);
    }
    
    fetchMessages();
    
    // Subscribe to changes in messages table
    const msgChannel = supabase.channel('inbox-updates')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, () => {
         fetchMessages();
      })
      .subscribe();

    // Listen for auth changes to re-fetch
    const { data: { subscription: authListener } } = supabase.auth.onAuthStateChange(() => {
      fetchMessages();
    });
      
    return () => {
      isMounted = false;
      supabase.removeChannel(msgChannel);
      authListener.unsubscribe();
    };
  }, [supabase]);

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
        const convoIds = myConvos.map(c => c.conversation_id);
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
    } catch (err) {
      console.error(err);
    } finally {
      setIsStartingChat(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-[110px] max-w-md mx-auto relative font-sans">
      {/* Premium Header with Backdrop Blur */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-zinc-100/50">
        <div className="px-6 pt-10 pb-5 flex items-center justify-between">
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900">Messages</h1>
          <div className="flex gap-3">
            <button className="w-10 h-10 flex items-center justify-center rounded-2xl bg-zinc-50 border border-zinc-100 text-zinc-800 active:scale-95 transition-all">
              <Search size={20} />
            </button>
            <button className="w-10 h-10 flex items-center justify-center rounded-2xl bg-zinc-50 border border-zinc-100 text-zinc-800 active:scale-95 transition-all">
              <MoreVertical size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Active Users Section - Horizontal Scroll */}
      <div className="py-6 overflow-hidden">
        <div className="px-6 flex items-center justify-between mb-4">
          <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-zinc-400">Active Now</h2>
          <span className="w-2 h-2 bg-[#4ADE80] rounded-full animate-pulse"></span>
        </div>
        
        {activeUsers.length > 0 ? (
          <div className="flex gap-5 overflow-x-auto px-6 pb-2 scrollbar-hide">
            {activeUsers.map((user) => (
              <div 
                key={user.id} 
                onClick={() => handleStartChat(user.id)}
                className="flex flex-col items-center gap-3 shrink-0 group cursor-pointer active:scale-95 transition-transform"
              >
                <div className="relative">
                  <div className="w-16 h-16 rounded-full overflow-hidden p-[2.5px] bg-gradient-to-tr from-[#E5FF66] to-[#4ADE80] ring-1 ring-zinc-100/50">
                    <div className="w-full h-full rounded-full overflow-hidden bg-white flex items-center justify-center">
                      {user.avatar ? (
                        <Image 
                          src={user.avatar} 
                          alt={user.name} 
                          width={64} 
                          height={64} 
                          className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110" 
                        />
                      ) : (
                        <User className="text-zinc-300 w-8 h-8" />
                      )}
                    </div>
                  </div>
                  <div className="absolute bottom-0 right-0 w-4.5 h-4.5 bg-[#4ADE80] rounded-full border-[3px] border-white shadow-sm"></div>
                </div>
                <span className="text-[11px] font-bold text-zinc-600 tracking-tight max-w-[64px] truncate">{user.name}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-6 py-4 flex items-center gap-3">
             <div className="w-16 h-16 rounded-full border-2 border-dashed border-zinc-200 flex items-center justify-center bg-zinc-50 shrink-0">
               <Plus className="w-6 h-6 text-zinc-300" />
             </div>
             <div>
               <p className="text-[13px] font-medium text-zinc-600">No other students online</p>
               <p className="text-[11px] text-zinc-400">Connections will appear here when online.</p>
             </div>
          </div>
        )}
      </div>

      {/* Chat List Section */}
      <div className="px-5 mt-2">
        <div className="flex items-center justify-between mb-5 px-1">
          <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-zinc-400">Recent Chats</h2>
          <button className="text-[11px] font-bold text-[#222] bg-zinc-100 px-3 py-1 rounded-full active:scale-95 transition-all">Mark Read</button>
        </div>
        
        <div className="flex flex-col gap-1">
          {isLoading ? (
            <div className="flex justify-center p-20">
              <Loader2 className="w-8 h-8 animate-spin text-zinc-200" />
            </div>
          ) : chats.length > 0 ? chats.map((chat) => (
            <Link 
              key={chat.id} 
              href={`/messages/${chat.id}`}
              className="flex items-center gap-4 p-3 rounded-[28px] hover:bg-white hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] active:scale-[0.98] transition-all cursor-pointer group"
            >
              <div className="relative shrink-0">
                <div className="w-[60px] h-[60px] rounded-full overflow-hidden bg-zinc-100 ring-4 ring-transparent group-hover:ring-[#E5FF66]/30 transition-all">
                  {chat.avatar ? (
                    <Image 
                      src={chat.avatar} 
                      alt={chat.name} 
                      width={60} 
                      height={60} 
                      className="object-cover w-full h-full" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-zinc-50 text-zinc-300">
                      <User size={30} />
                    </div>
                  )}
                </div>
                {chat.online && (
                  <div className="absolute bottom-0 right-0 w-4 h-4 bg-[#4ADE80] rounded-full border-2 border-white shadow-sm"></div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-0.5">
                  <h3 className="font-bold text-[15px] text-zinc-900 truncate">{chat.name}</h3>
                  <span className={`text-[11px] font-medium ${chat.unread > 0 ? "text-zinc-900 font-bold" : "text-zinc-400"}`}>
                    {chat.time}
                  </span>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <p className={`text-[13.5px] truncate flex-1 ${chat.unread > 0 ? "text-zinc-900 font-semibold" : "text-zinc-500 font-medium"}`}>
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
          )) : (
            <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
               <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mb-4">
                 <MoreVertical className="w-8 h-8 text-zinc-300" />
               </div>
               <h3 className="text-[15px] font-bold text-zinc-900 mb-1">No messages yet</h3>
               <p className="text-[13px] font-medium text-zinc-500 max-w-[200px]">Start a conversation with your peers to collaborate!</p>
            </div>
          )}
        </div>
      </div>


      <BottomNavigation />
    </div>
  );
}
