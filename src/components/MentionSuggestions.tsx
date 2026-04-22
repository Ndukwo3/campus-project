"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { User, Loader2 } from "lucide-react";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { capitalizeName } from "@/lib/utils";

interface MentionSuggestionsProps {
  query: string;
  onSelect: (username: string) => void;
}

export default function MentionSuggestions({ query, onSelect }: MentionSuggestionsProps) {
  const supabase = createClient();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['mention-search', query],
    queryFn: async () => {
      if (!query && query !== "") return [];
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url')
        .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`)
        .limit(5);

      if (error) return [];
      return data;
    },
    enabled: true,
  });

  if (isLoading && query) {
    return (
      <div className="absolute z-[100] bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl shadow-2xl p-4 flex items-center gap-2 min-w-[200px]">
        <Loader2 className="w-4 h-4 animate-spin text-[#E5FF66]" />
        <span className="text-[12px] font-bold text-zinc-400">Searching...</span>
      </div>
    );
  }

  if (users.length === 0) return null;

  return (
    <div className="absolute z-[100] bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden min-w-[240px] animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="px-4 py-2 border-b border-zinc-50 dark:border-zinc-800/50">
        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Suggested People</span>
      </div>
      <div className="max-h-[200px] overflow-y-auto">
        {users.map((user: any) => (
          <button
            key={user.id}
            onClick={() => onSelect(user.username)}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#E5FF66] dark:hover:bg-[#E5FF66] group transition-colors text-left"
          >
            <div className="w-8 h-8 rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-800 shrink-0 border border-zinc-200 dark:border-zinc-700">
              {user.avatar_url ? (
                <Image src={user.avatar_url} alt="" width={32} height={32} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-400">
                  <User size={14} />
                </div>
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-[13px] text-zinc-900 dark:text-zinc-100 group-hover:text-black truncate leading-none mb-0.5">
                {capitalizeName(user.full_name)}
              </span>
              <span className="text-[11px] font-medium text-zinc-400 group-hover:text-black/60 truncate">
                @{user.username}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
