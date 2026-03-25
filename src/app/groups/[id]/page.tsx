"use client";

import { ChevronLeft, MoreVertical, Send, Users, User, Plus, Loader2, Info, MessageSquare, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef, use } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";

export default function GroupDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: groupId } = use(params);
  const router = useRouter();
  const supabase = createClient();
  
  const [group, setGroup] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"chat" | "info">("chat");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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

        // 3. Fetch message history
        const { data: history } = await supabase
          .from('group_messages')
          .select('*, profiles:sender_id (username, full_name, avatar_url)')
          .eq('group_id', groupId)
          .order('created_at', { ascending: true });

        if (history) setMessages(history);
      }
      setIsLoading(false);
      setTimeout(scrollToBottom, 100);
    }

    initGroup();
  }, [groupId, supabase, router]);

  useEffect(() => {
    if (!user || !groupId) return;

    // Real-time subscription for group messages
    const channel = supabase
      .channel(`group_${groupId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'group_messages',
          filter: `group_id=eq.${groupId}`,
        },
        async (payload: any) => {
          if (payload.new.sender_id !== user.id) {
            // Fetch sender profile for the new message
            const { data: senderProfile } = await supabase
              .from('profiles')
              .select('username, full_name, avatar_url')
              .eq('id', payload.new.sender_id)
              .single();

            const msgWithProfile = { ...payload.new, profiles: senderProfile };
            setMessages((prev) => [...prev, msgWithProfile]);
            setTimeout(scrollToBottom, 50);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, groupId, supabase]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !user || !groupId) return;

    const newMessage = {
      group_id: groupId,
      sender_id: user.id,
      content: inputText.trim(),
    };

    // Optimistic update
    const tempId = Math.random().toString();
    const optimisticMsg = { 
      ...newMessage, 
      id: tempId, 
      created_at: new Date().toISOString(), 
      profiles: { full_name: "You", avatar_url: user.user_metadata?.avatar_url } 
    };
    setMessages((prev) => [...prev, optimisticMsg]);
    setInputText("");

    const { data, error } = await supabase
      .from('group_messages')
      .insert(newMessage)
      .select('*, profiles:sender_id (username, full_name, avatar_url)')
      .single();

    if (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => prev.filter(m => m.id !== tempId));
    } else if (data) {
      setMessages((prev) => prev.map(m => m.id === tempId ? data : m));
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
      {/* Premium Header */}
      <div className="sticky top-0 z-30 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-zinc-100/50 dark:border-zinc-800/50">
        <div className="px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/campus" className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all">
              <ChevronLeft size={24} className="text-zinc-800 dark:text-white" />
            </Link>
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
          <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all">
            <MoreVertical size={20} className="text-zinc-500 dark:text-zinc-400" />
          </button>
        </div>

        {/* Action Tabs */}
        <div className="flex border-t border-zinc-100/50 dark:border-zinc-800/50">
          <button 
            onClick={() => setActiveTab("chat")}
            className={`flex-1 py-3 flex items-center justify-center gap-2 transition-all ${activeTab === "chat" ? "border-b-2 border-zinc-900 dark:border-[#E5FF66]" : "text-zinc-400"}`}
          >
            <MessageSquare size={18} className={activeTab === "chat" ? "text-zinc-900 dark:text-[#E5FF66]" : ""} />
            <span className={`text-[13px] font-bold ${activeTab === "chat" ? "text-zinc-900 dark:text-[#E5FF66]" : ""}`}>Study Chat</span>
          </button>
          <button 
            onClick={() => setActiveTab("info")}
            className={`flex-1 py-3 flex items-center justify-center gap-2 transition-all ${activeTab === "info" ? "border-b-2 border-zinc-900 dark:border-[#E5FF66]" : "text-zinc-400"}`}
          >
            <Info size={18} className={activeTab === "info" ? "text-zinc-900 dark:text-[#E5FF66]" : ""} />
            <span className={`text-[13px] font-bold ${activeTab === "info" ? "text-zinc-900 dark:text-[#E5FF66]" : ""}`}>Community Info</span>
          </button>
        </div>
      </div>

      {activeTab === "chat" ? (
        <>
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto px-4 py-6 flex flex-col gap-6 scrollbar-hide">
            {messages.map((msg, index) => {
              const isMe = msg.sender_id === user?.id;
              const showAvatar = index === 0 || messages[index - 1].sender_id !== msg.sender_id;
              
              return (
                <div 
                  key={msg.id} 
                  className={`flex ${isMe ? "justify-end" : "justify-start"} items-end gap-2 group`}
                >
                  {!isMe && showAvatar && (
                    <div className="w-8 h-8 rounded-2xl overflow-hidden shrink-0 mb-1 border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center">
                      {msg.profiles?.avatar_url ? (
                        <Image src={msg.profiles.avatar_url} alt="Avatar" width={32} height={32} className="object-cover w-full h-full" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] font-black text-zinc-400 dark:text-zinc-600 uppercase">
                          {msg.profiles?.username?.[0] || msg.profiles?.full_name?.[0] || "S"}
                        </div>
                      )}
                    </div>
                  )}
                  {!isMe && !showAvatar && <div className="w-8 shrink-0" />}
                  
                  <div className={`max-w-[80%] flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                    {!isMe && showAvatar && (
                      <span className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 mb-1 ml-1 uppercase tracking-tighter">
                        {msg.profiles?.full_name?.split(' ')[0] || msg.profiles?.username}
                      </span>
                    )}
                    <div 
                      className={`px-4 py-3 rounded-[24px] text-[15px] font-medium leading-relaxed shadow-sm transition-all ${
                        isMe 
                          ? "bg-zinc-900 dark:bg-[#E5FF66] text-white dark:text-black rounded-br-none" 
                          : "bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 rounded-bl-none border border-zinc-100/50 dark:border-zinc-800"
                      }`}
                    >
                      <p>{msg.content}</p>
                      <span className={`block text-[9px] mt-1.5 font-bold tracking-tighter opacity-50 ${isMe ? "text-right" : ""}`}>
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} className="h-4" />
          </div>

          {/* Chat Input Area */}
          <form 
            onSubmit={handleSendMessage}
            className="sticky bottom-0 flex-none p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] bg-white dark:bg-black border-t border-zinc-100/50 dark:border-zinc-800/50 z-30"
          >
            <div className="flex items-center gap-3">
              <div className="flex-1 relative flex items-center">
                <input 
                  type="text" 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Ask a question or share a thought..." 
                  className="w-full bg-zinc-50 dark:bg-zinc-900 rounded-[28px] py-4 pl-6 pr-14 outline-none text-[15px] font-medium placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:ring-2 focus:ring-[#E5FF66]/40 dark:focus:ring-[#E5FF66]/20 transition-all border border-zinc-100 dark:border-zinc-800 text-black dark:text-white"
                />
                <button type="button" className="absolute right-3 w-10 h-10 flex items-center justify-center text-zinc-400 dark:text-zinc-600 hover:text-zinc-800 dark:hover:text-[#E5FF66] transition-all">
                  <Plus size={22} strokeWidth={2.5} />
                </button>
              </div>
              <button 
                type="submit"
                disabled={!inputText.trim()}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                  inputText.trim() 
                    ? "bg-zinc-900 dark:bg-[#E5FF66] text-[#E5FF66] dark:text-black shadow-xl scale-105" 
                    : "bg-zinc-100 dark:bg-zinc-900 text-zinc-300 dark:text-zinc-700"
                }`}
              >
                <Send size={20} strokeWidth={3} />
              </button>
            </div>
          </form>
        </>
      ) : (
        /* Group Info / Members Tab */
        <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide">
          <section>
            <h2 className="text-xs font-black uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-600 mb-4 px-1">About this community</h2>
            <div className="bg-white dark:bg-zinc-900 p-5 rounded-[32px] border border-zinc-100 dark:border-zinc-800 shadow-sm">
               <p className="text-[15px] font-medium text-zinc-700 dark:text-zinc-300 leading-relaxed">
                 {group.description || "No description provided."}
               </p>
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-4 px-1">
              <h2 className="text-xs font-black uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-600">Members</h2>
              <span className="text-[11px] font-black text-zinc-900 bg-[#E5FF66] px-2.5 py-1 rounded-full uppercase tracking-tighter shadow-sm">
                {members.length} Total
              </span>
            </div>
            
            <div className="flex flex-col gap-2">
              {members.map((member) => (
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
          
          <button className="w-full py-5 rounded-[32px] border-2 border-red-50 dark:border-red-500/10 text-red-500 font-black text-xs uppercase tracking-[0.15em] hover:bg-red-50 dark:hover:bg-red-500/5 transition-colors active:scale-95">
             Leave Community
          </button>
        </div>
      )}
    </div>
  );
}
