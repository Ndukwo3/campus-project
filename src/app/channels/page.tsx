"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Hash, Search, Plus, ArrowLeft, ChevronRight, 
  MessageSquare, Bell, Filter, MoreVertical, 
  Lock, Settings, Users, Activity
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import BottomNavigation from "@/components/BottomNavigation";
import Toast from "@/components/Toast";

export default function ChannelsPage() {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [communities, setCommunities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "active" | "unread">("all");

  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" | "warning"; isVisible: boolean }>({
    message: "",
    type: "success",
    isVisible: false,
  });

  const showToast = (message: string, type: "success" | "error" | "info" | "warning" = "success") => {
    setToast({ message, type, isVisible: true });
  };

  useEffect(() => {
    async function init() {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        router.push("/welcome");
        return;
      }
      setUser(authUser);
      fetchChannels(authUser.id);
    }
    init();
  }, [supabase, router]);

  const fetchChannels = async (userId: string) => {
    setIsLoading(true);
    try {
      // 1. Get communities user has joined
      const { data: userMemberships } = await supabase
        .from('group_members')
        .select('group_id, groups (*)')
        .eq('user_id', userId);

      if (!userMemberships) return;

      const groupIds = userMemberships.map((m: any) => m.group_id);
      
      // 2. Fetch all channels for these groups
      const { data: channelData } = await supabase
        .from('channels')
        .select('*')
        .in('group_id', groupIds)
        .order('name', { ascending: true });

      // 3. Group channels by community
      const grouped = userMemberships.map((membership: any) => {
        const group = membership.groups as any;
        return {
          ...group,
          channels: (channelData || []).filter((c: any) => c.group_id === group.id)
        };
      }).filter((g: any) => g.channels.length > 0);

      setCommunities(grouped);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCommunities = communities.map(comm => ({
    ...comm,
    channels: comm.channels.filter((c: any) => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comm.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(comm => comm.channels.length > 0);

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-black max-w-md mx-auto relative font-sans transition-colors">
      <Toast 
        message={toast.message} 
        type={toast.type} 
        isVisible={toast.isVisible} 
        onClose={() => setToast({ ...toast, isVisible: false })} 
      />

      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/80 dark:bg-black/80 backdrop-blur-xl px-6 pt-10 pb-5 flex items-center justify-between border-b border-zinc-100/50 dark:border-zinc-800/50">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="w-10 h-10 rounded-xl bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center text-zinc-900 dark:text-white border border-zinc-100 dark:border-zinc-800"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex flex-col">
            <h1 className="text-[24px] font-black tracking-tight text-zinc-900 dark:text-white uppercase italic leading-none">Channels</h1>
            <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-600 uppercase tracking-widest mt-1">Cross-Server Feed</p>
          </div>
        </div>
        <div className="flex gap-2">
           <button className="w-10 h-10 rounded-xl bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center text-zinc-400 border border-zinc-100 dark:border-zinc-800">
            <Filter size={18} />
          </button>
        </div>
      </div>

      <main className="flex-1 px-6 py-8 pb-40 space-y-8 overflow-y-auto scrollbar-hide">
        {/* Search & Tabs */}
        <div className="space-y-6">
          <div className="relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Find a channel or community..."
              className="w-full h-12 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl pl-11 pr-4 text-xs font-bold uppercase tracking-wider border border-zinc-100 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
          </div>

          <div className="flex p-1.5 bg-zinc-100/50 dark:bg-zinc-900/50 rounded-2xl gap-1">
             {(["all", "active", "unread"] as const).map(tab => (
               <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                  activeTab === tab 
                  ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm"
                  : "text-zinc-400 dark:text-zinc-600 hover:text-zinc-600 dark:hover:text-zinc-400"
                }`}
               >
                 {tab}
               </button>
             ))}
          </div>
        </div>

        {/* Channels List */}
        <div className="space-y-10">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-4 text-zinc-300">
               <div className="w-8 h-8 rounded-full border-4 border-zinc-100 dark:border-zinc-800 border-t-emerald-500 animate-spin" />
               <p className="text-[10px] font-black uppercase tracking-[0.2em]">Syncing Feed...</p>
            </div>
          ) : filteredCommunities.length > 0 ? (
            filteredCommunities.map((community) => (
              <div key={community.id} className="space-y-4">
                <div className="flex items-center gap-3 px-2">
                  <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-900 overflow-hidden border border-zinc-100 dark:border-zinc-800">
                    {community.image_url && (
                       <img src={community.image_url} alt="" className="w-full h-full object-cover" />
                    )}
                  </div>
                  <h2 className="text-[12px] font-black text-zinc-900 dark:text-white uppercase tracking-widest truncate flex-1 italic">
                    {community.name}
                  </h2>
                  <div className="w-5 h-px bg-zinc-100 dark:border-zinc-800 flex-1" />
                </div>

                <div className="grid grid-cols-1 gap-2">
                  {community.channels.map((channel: any) => (
                    <Link
                      key={channel.id}
                      href={`/groups/${community.id}/channels/${channel.id}`}
                      className="group flex items-center gap-4 p-4 rounded-[24px] bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-all active:scale-[0.98] shadow-sm hover:shadow-md"
                    >
                      <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                        <Hash size={18} strokeWidth={2.5} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-black text-[14px] text-zinc-900 dark:text-white uppercase italic tracking-tight truncate group-hover:text-emerald-500 transition-colors">
                          {channel.name}
                        </h3>
                        {channel.description && (
                          <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-600 uppercase tracking-widest truncate mt-0.5">
                            {channel.description}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1.5 px-1 opacity-40">
                         <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                         <span className="text-[8px] font-black uppercase text-zinc-400">Hub</span>
                      </div>
                    </Link>
                  ))}
                  
                  {/* Inline Create Channel Trigger */}
                  <button 
                    onClick={() => router.push(`/groups/${community.id}`)}
                    className="flex items-center gap-3 p-3 rounded-2xl border-2 border-dashed border-zinc-50 dark:border-zinc-900/50 text-zinc-400 hover:text-emerald-500 hover:border-emerald-500/30 transition-all text-[10px] font-black uppercase tracking-widest justify-center mt-2 group"
                  >
                    <Plus size={14} className="group-hover:rotate-90 transition-transform" />
                    Manage {community.name}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="py-24 text-center space-y-6">
              <div className="w-20 h-20 bg-zinc-50 dark:bg-zinc-900/50 rounded-[40px] flex items-center justify-center mx-auto border-2 border-dashed border-zinc-100 dark:border-zinc-800">
                 <Activity size={32} className="text-zinc-200 dark:text-zinc-800" />
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase italic">Silence in the Air</h3>
                <p className="text-[11px] font-bold text-zinc-400 dark:text-zinc-600 uppercase tracking-widest leading-loose">
                  You haven't joined any servers<br/>with active channels yet.
                </p>
              </div>
              <button 
                onClick={() => router.push('/communities')}
                className="px-8 py-4 bg-zinc-900 dark:bg-[#E5FF66] text-white dark:text-black rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all"
              >
                Find a Community
              </button>
            </div>
          )}
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
}
