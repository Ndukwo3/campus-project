"use client";

import { useState, useEffect } from "react";
import { UserPlus, Check, Loader2, User } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { capitalizeName } from "@/lib/utils";

interface SuggestedConnectionsProps {
  userId: string;
  universityId: string;
  onCountChange?: (count: number) => void;
}

export default function SuggestedConnections({ userId, universityId, onCountChange }: SuggestedConnectionsProps) {

  const supabase = createClient();
  const queryClient = useQueryClient();
  const [connectingIds, setConnectingIds] = useState<Set<string>>(new Set());
  const [connectedIds, setConnectedIds] = useState<Set<string>>(new Set());
  const storageKey = `sent_requests_${userId}`;

  // Load sent requests from localStorage after mount (avoids SSR/hydration issues)
  useEffect(() => {
    if (!userId) return;
    try {
      const saved = localStorage.getItem(`sent_requests_${userId}`);
      if (saved) {
        const ids = JSON.parse(saved);
        console.log("Restored from localStorage:", ids);
        setConnectedIds(new Set(ids));
      }
    } catch (e) {
      console.error("Failed to load from localStorage", e);
    }
  }, [userId]);

  const { data: suggestions = [], isLoading } = useQuery({
    queryKey: ['suggested-connections', universityId],
    queryFn: async () => {
      const { data: friendsData } = await supabase
        .from('friends')
        .select('user_id1, user_id2')
        .or(`user_id1.eq.${userId},user_id2.eq.${userId}`);


      const friendIds = new Set(friendsData?.flatMap((f: { user_id1: string; user_id2: string }) => [f.user_id1, f.user_id2]) || []);
      friendIds.add(userId);


      const { data: admins } = await supabase
        .from('profiles')
        .select('id, full_name, username, avatar_url, role')
        .eq('role', 'admin')
        .limit(5);

      const { data: sameUniStudents } = await supabase
        .from('profiles')
        .select('id, full_name, username, avatar_url, role')
        .eq('university_id', universityId)
        .neq('role', 'super_admin')
        .neq('role', 'admin')
        .limit(20);

      let studentList = sameUniStudents || [];
      if (studentList.length < 5) {
        const { data: globalUsers } = await supabase
          .from('profiles')
          .select('id, full_name, username, avatar_url, role')
          .neq('university_id', universityId) // Only users NOT in the same uni
          .neq('role', 'super_admin')
          .neq('role', 'admin')
          .limit(10);
        studentList = [...studentList, ...(globalUsers || [])];
      }

      const filteredStudents = studentList.filter((u: any) => !friendIds.has(u.id));
      const filteredAdmins = (admins || []).filter((u: any) => !friendIds.has(u.id));

      const seen = new Set();
      const uniqueStudents = filteredStudents.filter((u: any) => {
         if (seen.has(u.id)) return false;
         seen.add(u.id);
         return true;
      });

      return [...filteredAdmins, ...uniqueStudents.sort(() => 0.5 - Math.random()).slice(0, 7)];


    },
    enabled: !!userId && !!universityId,
  });

  // Report initial count from localStorage on load
  const [initialCountReported, setInitialCountReported] = useState(false);
  useEffect(() => {
    if (!isLoading && !initialCountReported && onCountChange) {
      onCountChange(connectedIds.size);
      setInitialCountReported(true);
    }
  }, [isLoading, initialCountReported, onCountChange, connectedIds.size]);

  const handleConnect = async (targetId: string) => {
    if (connectingIds.has(targetId) || connectedIds.has(targetId)) return;
    setConnectingIds(prev => new Set(prev).add(targetId));
    try {
      // Send a connection request notification only — friendship is confirmed when accepted
      const { error } = await supabase.from('notifications').insert({
        user_id: targetId,
        sender_id: userId,
        type: 'connect_request',
        content: 'wants to connect with you!',
        is_read: false
      });

      if (error) throw error;

      const nextSet = new Set(connectedIds).add(targetId);
      setConnectedIds(nextSet);
      // Persist to localStorage so "Request Sent" survives refresh
      localStorage.setItem(storageKey, JSON.stringify([...nextSet]));
      onCountChange?.(nextSet.size);

      queryClient.invalidateQueries({ queryKey: ['posts'] });

    } catch (err: any) {
      console.error("Connection Error:", err.message, err.code);
    } finally {
      setConnectingIds(prev => {
        const next = new Set(prev);
        next.delete(targetId);
        return next;
      });
    }
  };





  if (suggestions.length === 0 && !isLoading) return null;

  return (
    <div className="flex flex-col gap-4">
      {isLoading ? (
        [1, 2, 3, 4, 5].map(i => (
          <div key={i} className="flex items-center gap-4 animate-pulse p-4">
            <div className="w-14 h-14 rounded-full bg-zinc-100 dark:bg-zinc-800" />
            <div className="flex-1">
              <div className="w-24 h-4 bg-zinc-100 dark:bg-zinc-800 rounded-full mb-2" />
              <div className="w-16 h-3 bg-zinc-50 dark:bg-zinc-900 rounded-full" />
            </div>
            <div className="w-24 h-10 rounded-2xl bg-zinc-50 dark:bg-zinc-900" />
          </div>
        ))
      ) : (
        suggestions.map((user: any) => {
          const isAlreadySent = connectedIds.has(user.id);
          const isSending = connectingIds.has(user.id);
          return (
          <div key={user.id} className="flex items-center gap-4 p-4 bg-zinc-50 dark:bg-zinc-900/40 rounded-[28px] border border-zinc-100 dark:border-zinc-800/60 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="w-14 h-14 rounded-full overflow-hidden bg-white dark:bg-zinc-800 border-2 border-white dark:border-zinc-800 shadow-sm relative shrink-0">
              {user.avatar_url ? (
                <Image src={user.avatar_url} alt="" fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-300">
                  <User size={24} strokeWidth={2.5} />
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="text-[14px] font-black text-zinc-900 dark:text-zinc-100 tracking-tight truncate leading-tight">{capitalizeName(user.full_name)}</h4>
              <p className="text-[11px] font-bold text-[#E5FF66] uppercase tracking-widest mt-0.5">{user.username}</p>
            </div>

            <button
              onClick={() => handleConnect(user.id)}
              disabled={isSending || isAlreadySent}
              className={`px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all active:scale-[0.95] flex items-center gap-2 ${
                isAlreadySent
                ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 cursor-default"
                : isSending
                ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed"
                : "bg-black dark:bg-[#E5FF66] text-white dark:text-black shadow-lg shadow-[#E5FF66]/10"
              }`}
            >
              {isSending ? (
                <div className="flex gap-0.5">
                  <div className="w-1 h-1 bg-current rounded-full animate-bounce" />
                  <div className="w-1 h-1 bg-current rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-1 h-1 bg-current rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              ) : isAlreadySent ? (
                <Check size={12} />
              ) : (
                <UserPlus size={12} />
              )}
              {isSending ? "Sending" : isAlreadySent ? "Request Sent" : "Connect"}
            </button>
          </div>
          );
        })
      )}
    </div>
  );
}
