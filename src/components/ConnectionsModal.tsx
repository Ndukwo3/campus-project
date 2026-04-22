"use client";

import { X, Search, User, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { capitalizeName } from "@/lib/utils";

interface ConnectionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
}

export default function ConnectionsModal({ isOpen, onClose, userId, userName }: ConnectionsModalProps) {
  const supabase = createClient();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: connections = [], isLoading } = useQuery({
    queryKey: ['connections', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('friends')
        .select(`
          user_id1,
          user_id2,
          profiles:user_id1 (id, full_name, username, avatar_url),
          profiles_other:user_id2 (id, full_name, username, avatar_url)
        `)
        .or(`user_id1.eq.${userId},user_id2.eq.${userId}`);

      if (error) return [];

      const profileList = data.map((f: any) => {
        // Return the profile that IS NOT the user we are looking at
        if (f.user_id1 === userId) return f.profiles_other;
        return f.profiles;
      }).filter(Boolean);

      // Deduplicate by profile ID
      const seen = new Set();
      return profileList.filter((p: any) => {
        if (seen.has(p.id)) return false;
        seen.add(p.id);
        return true;
      });
    },
    enabled: isOpen && !!userId,
    staleTime: 60 * 1000,
  });

  const filteredConnections = connections.filter((c: any) => 
    c.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center p-0 sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="relative w-full max-w-md bg-white dark:bg-zinc-950 rounded-t-[32px] sm:rounded-[40px] overflow-hidden flex flex-col h-[85vh] sm:h-[600px] shadow-2xl border-t border-zinc-100 dark:border-zinc-800"
          >
            {/* Header */}
            <div className="px-6 pt-8 pb-4 flex items-center justify-between sticky top-0 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl z-10">
              <div className="flex flex-col">
                <h2 className="text-xl font-black text-zinc-900 dark:text-white tracking-tight italic truncate max-w-[200px]">{capitalizeName(userName)}'s Loop</h2>
                <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-600 uppercase tracking-widest mt-1">{connections.length} Connections</p>
              </div>
              <button 
                onClick={onClose}
                className="w-10 h-10 rounded-2xl bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Search */}
            <div className="px-6 mb-4">
              <div className="relative">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input 
                  type="text"
                  placeholder="Find someone in the loop..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-11 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl pl-11 pr-4 text-xs font-bold uppercase tracking-wider border border-zinc-100 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-4 pb-10 scrollbar-hide">
              {isLoading ? (
                <div className="flex flex-col gap-3 px-2">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-16 w-full rounded-2xl bg-zinc-50 dark:bg-zinc-900 animate-pulse" />
                  ))}
                </div>
              ) : filteredConnections.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {filteredConnections.map((user: any) => (
                    <Link 
                      key={user.id}
                      href={`/profile/${user.id}`}
                      onClick={onClose}
                      className="flex items-center gap-4 p-3 rounded-2xl hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all group"
                    >
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                        {user.avatar_url ? (
                          <Image src={user.avatar_url} alt="" width={48} height={48} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-400">
                            <User size={20} />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-black text-zinc-900 dark:text-zinc-100 tracking-tight truncate">{capitalizeName(user.full_name)}</h4>
                        <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-600 uppercase tracking-widest truncate">{user.username}</p>
                      </div>
                      <div className="w-8 h-8 rounded-xl bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center text-zinc-400 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                        <ArrowRight size={14} />
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="py-20 text-center px-6">
                  <div className="w-16 h-16 rounded-[30px] bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center mx-auto mb-4 border border-dashed border-zinc-200 dark:border-zinc-800">
                    <User size={24} className="text-zinc-300 dark:text-zinc-700" />
                  </div>
                  <p className="text-xs font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-widest">No connections found in {userName}'s loop</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
