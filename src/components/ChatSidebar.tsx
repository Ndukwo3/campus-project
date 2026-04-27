"use client";

import { Search, MoreVertical, User, MessageSquare } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { createClient } from "@/lib/supabase";
import { capitalizeName } from "@/lib/utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { usePresenceStore } from "@/store/presenceStore";
import ChatListSkeleton from "./skeletons/ChatListSkeleton";

export default function ChatSidebar() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const pathname = usePathname();
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [isMarkingAllRead, setIsMarkingAllRead] = useState(false);

  const { data: chatsData, isLoading } = useQuery({
    queryKey: ['inbox'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) return { chats: [] };

      const { data: myConvos } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', user.id);
      
      if (!myConvos || myConvos.length === 0) return { chats: [] };
      const conversationIds = myConvos.map((c: { conversation_id: string }) => c.conversation_id);

      const [partnersResult, latestMsgsResult, unreadResult] = await Promise.all([
        supabase
          .from('conversation_participants')
          .select('conversation_id, profiles(id, username, full_name, avatar_url)')
          .in('conversation_id', conversationIds)
          .neq('user_id', user.id),
        supabase
          .from('messages')
          .select('conversation_id, content, sender_id, is_read, created_at')
          .in('conversation_id', conversationIds)
          .order('created_at', { ascending: false }),
        supabase
          .from('messages')
          .select('conversation_id', { count: 'exact' })
          .in('conversation_id', conversationIds)
          .neq('sender_id', user.id)
          .eq('is_read', false)
      ]);

      const unreadMap: Record<string, number> = {};
      if (unreadResult.data) {
        unreadResult.data.forEach((m: any) => {
          unreadMap[m.conversation_id] = (unreadMap[m.conversation_id] || 0) + 1;
        });
      }

      const latestMsgMap: Record<string, any> = {};
      if (latestMsgsResult.data) {
        latestMsgsResult.data.forEach((msg: any) => {
          if (!latestMsgMap[msg.conversation_id]) {
            latestMsgMap[msg.conversation_id] = msg;
          }
        });
      }

      const builtChats = partnersResult.data?.map((p: any) => {
        const partnerData: any = Array.isArray(p.profiles) ? p.profiles[0] : p.profiles;
        const msg = latestMsgMap[p.conversation_id];
        if (!msg) return null;

        return {
          id: p.conversation_id,
          partner_id: partnerData?.id,
          name: capitalizeName(partnerData?.full_name || partnerData?.username || "Unknown Student"),
          avatar: partnerData?.avatar_url,
          lastMessage: msg.content.startsWith('[IMAGE]') ? "📷 Photo" 
                       : msg.content.startsWith('[VOICE_NOTE]') ? "🎤 Voice Note" 
                       : msg.content,
          time: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          unread: unreadMap[p.conversation_id] || 0,
          sortTime: new Date(msg.created_at).getTime(),
        };
      }).filter(Boolean).sort((a: any, b: any) => b.sortTime - a.sortTime);

      return { chats: builtChats || [] };
    },
    staleTime: 10 * 1000,
  });

  const { onlineUsers: globalOnlineUsers } = usePresenceStore();
  const onlineUsersList = Array.from(globalOnlineUsers.keys());

  useEffect(() => {
    const msgChannel = supabase.channel('inbox-sidebar-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => {
         queryClient.invalidateQueries({ queryKey: ['inbox'] });
      })
      .subscribe();
    return () => { supabase.removeChannel(msgChannel); };
  }, [supabase, queryClient]);

  const handleMarkAllRead = async () => {
    setIsMarkingAllRead(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        const { data: convs } = await supabase.from('conversation_participants').select('conversation_id').eq('user_id', user.id);
        if (convs && convs.length > 0) {
            await supabase.from('messages').update({ is_read: true }).in('conversation_id', convs.map((c: { conversation_id: string }) => c.conversation_id)).neq('sender_id', user.id).eq('is_read', false);
            queryClient.invalidateQueries({ queryKey: ['inbox'] });
            queryClient.invalidateQueries({ queryKey: ['unread-messages'] });
        }
    }
    setIsMarkingAllRead(false);
    setShowMoreMenu(false);
  };

  const chats = chatsData?.chats || [];
  const filteredChats = chats.filter((c: any) => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-white dark:bg-black border-r border-zinc-100 dark:border-zinc-800 transition-colors w-full lg:w-[380px] xl:w-[420px] shrink-0 overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-10 pb-5 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">Chat</h1>
        <div className="flex gap-2 relative">
            <button 
                onClick={() => setShowMoreMenu(!showMoreMenu)}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 transition-all"
            >
                <MoreVertical size={18} />
            </button>
            <AnimatePresence>
                {showMoreMenu && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={() => setShowMoreMenu(false)} />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="absolute right-0 mt-10 w-48 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-100 dark:border-zinc-800 overflow-hidden py-2 z-50"
                        >
                            <button onClick={handleMarkAllRead} className="w-full px-5 py-3 text-left text-xs font-black uppercase tracking-widest text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">Mark All Read</button>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
      </div>

      {/* Search */}
      <div className="px-6 mb-4">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 w-4.5 h-4.5 group-focus-within:text-black dark:group-focus-within:text-[#E5FF66] transition-colors" />
          <input 
            type="text" 
            placeholder="Search messages"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-100 dark:bg-zinc-900/50 rounded-full py-3 pl-11 pr-5 outline-none text-[14px] font-bold text-zinc-900 dark:text-white placeholder:text-zinc-400 border border-transparent focus:border-[#E5FF66]/50 focus:bg-white dark:focus:bg-zinc-900 transition-all"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto scrollbar-hide px-3 pb-20 lg:pb-4">
        {isLoading ? (
          <ChatListSkeleton />
        ) : filteredChats.length > 0 ? (
          <div className="flex flex-col">
            {filteredChats.map((chat: any) => {
              const isActive = onlineUsersList.includes(chat.partner_id);
              const isSelected = pathname === `/messages/${chat.id}`;
              return (
                <Link 
                  key={chat.id} 
                  href={`/messages/${chat.id}`}
                  className={`flex items-center gap-4 p-4 rounded-[24px] transition-all group relative ${isSelected ? 'bg-zinc-50 dark:bg-zinc-900 shadow-sm' : 'hover:bg-zinc-50 dark:hover:bg-zinc-900/40'}`}
                >
                  <div className="relative shrink-0">
                    <div className="w-[54px] h-[54px] rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-900">
                      {chat.avatar ? (
                        <Image src={chat.avatar} alt="" width={54} height={54} className="object-cover w-full h-full" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-300 dark:text-zinc-700">
                          <User size={28} />
                        </div>
                      )}
                    </div>
                    <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-[3px] border-white dark:border-[#09090b] ${isActive ? 'bg-[#4ADE80]' : 'bg-zinc-300 dark:bg-zinc-700'}`}></div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-0.5">
                      <h3 className={`font-black text-[14.5px] truncate tracking-tight ${chat.unread > 0 ? 'text-zinc-900 dark:text-white' : 'text-zinc-900 dark:text-zinc-100'}`}>{chat.name}</h3>
                      <span className="text-[11px] font-bold text-zinc-400 dark:text-zinc-600 shrink-0">{chat.time}</span>
                    </div>
                    <div className="flex justify-between items-center gap-2">
                        <p className={`text-[13px] truncate flex-1 tracking-tight ${chat.unread > 0 ? 'text-zinc-900 dark:text-zinc-300 font-bold' : 'text-zinc-500 dark:text-zinc-500 font-medium'}`}>
                            {chat.lastMessage}
                        </p>
                        {chat.unread > 0 && (
                            <div className="min-w-[18px] h-[18px] px-1 bg-[#E5FF66] rounded-full flex items-center justify-center shrink-0">
                                <span className="text-[9px] font-black text-black">{chat.unread}</span>
                            </div>
                        )}
                    </div>
                  </div>
                  
                  {isSelected && (
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-10 bg-[#E5FF66] rounded-l-full" />
                  )}
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center opacity-40">
             <MessageSquare className="w-10 h-10 mb-4" />
             <p className="text-sm font-bold">No conversations</p>
          </div>
        )}
      </div>
    </div>
  );
}
