"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, ArrowLeft, Users, Search, ChevronRight, User, 
  Library, Hash, GraduationCap, Calendar, ShoppingBag, 
  Home, UserCheck, LayoutGrid 
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import BottomNavigation from "@/components/BottomNavigation";
import CreateGroupModal from "@/components/modals/CreateGroupModal";
import Toast from "@/components/Toast";

export default function CampusPage() {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [groups, setGroups] = useState<any[]>([]);
  const [myGroups, setMyGroups] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");

  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" | "warning"; isVisible: boolean }>({
    message: "",
    type: "success",
    isVisible: false,
  });

  const showToast = (message: string, type: "success" | "error" | "info" | "warning" = "success") => {
    setToast({ message, type, isVisible: true });
  };

  useEffect(() => {
    const init = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        router.push("/welcome");
        return;
      }
      setUser(authUser);

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();
      
      setProfile(profileData);
      
      if (profileData?.university_id) {
        fetchGroups(profileData.university_id, authUser.id);
      }
    };

    init();
  }, [supabase, router]);

  const fetchGroups = async (universityId: string, userId: string) => {
    setIsLoading(true);
    try {
      // 1. Fetch groups in the university
      const { data: allGroups } = await supabase
        .from('groups')
        .select('*')
        .eq('university_id', universityId);

      // 2. Fetch groups current user is a member of
      const { data: userMemberships } = await supabase
        .from('group_members')
        .select('group_id')
        .eq('user_id', userId);

      const userGroupIds = new Set((userMemberships as any[])?.map((m: any) => m.group_id) || []);

      const processedAll = (allGroups as any[]) || [];
      setGroups(processedAll.filter((g: any) => !userGroupIds.has(g.id)));
      setMyGroups(processedAll.filter((g: any) => userGroupIds.has(g.id)));
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinGroup = async (groupId: string) => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('group_members')
        .insert({
          group_id: groupId,
          user_id: user.id,
          role: 'member'
        });

      if (error) throw error;
      
      showToast("Successfully joined the community!");
      if (profile) fetchGroups(profile.university_id, user.id);
    } catch (err: any) {
      showToast(err.message || "Failed to join community", "error");
    }
  };

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
        <div className="flex flex-col">
          <h1 className="text-[34px] font-black tracking-tight text-zinc-900 dark:text-white uppercase italic">Campus</h1>
          <p className="text-[11px] font-bold text-zinc-400 dark:text-zinc-600 uppercase tracking-widest mt-0.5">University Operations Hub</p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 flex items-center justify-center text-zinc-400">
           <Search size={22} />
        </div>
      </div>

      <main className="flex-1 px-6 py-8 pb-40 space-y-12 overflow-y-auto scrollbar-hide">
        {/* Hub Bento Grid */}
        <section className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            {/* Top Row: Library (Dominant) & Hubs */}
            <motion.div
              onClick={() => router.push("/library")}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="col-span-1 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-[44px] p-8 flex flex-col justify-between h-[260px] shadow-2xl relative overflow-hidden group border border-transparent dark:border-zinc-100 cursor-pointer"
            >
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl group-hover:scale-150 transition-all duration-1000" />
              <div className="w-16 h-16 rounded-[24px] bg-blue-500/10 dark:bg-zinc-900/5 flex items-center justify-center text-blue-400 dark:text-blue-600 shadow-inner">
                <Library size={36} strokeWidth={2.5} />
              </div>
              <div className="space-y-1 z-10">
                <h3 className="font-black text-[26px] uppercase italic leading-[0.9] tracking-tighter">Library</h3>
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] opacity-40">Academic Hub</p>
              </div>
            </motion.div>

            <div className="col-span-1 h-[260px] flex flex-col gap-4">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 bg-zinc-50 dark:bg-zinc-900/40 rounded-[38px] p-6 border border-zinc-100 dark:border-zinc-800/50 flex flex-col justify-between group cursor-pointer transition-all hover:bg-white dark:hover:bg-zinc-900 shadow-sm"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#E5FF66]/10 dark:bg-[#E5FF66]/10 flex items-center justify-center text-[#E5FF66] dark:text-[#E2FF3D]">
                  <Users size={24} />
                </div>
                <h3 className="font-black text-[13px] uppercase tracking-wider text-zinc-900 dark:text-white">Communities</h3>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 bg-zinc-50 dark:bg-zinc-900/40 rounded-[38px] p-6 border border-zinc-100 dark:border-zinc-800/50 flex flex-col justify-between group cursor-pointer transition-all hover:bg-white dark:hover:bg-zinc-900 shadow-sm"
              >
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <Hash size={24} />
                </div>
                <h3 className="font-black text-[13px] uppercase tracking-wider text-zinc-900 dark:text-white">Channels</h3>
              </motion.div>
            </div>

            {/* Bottom Row: Events (Full Width) */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="col-span-2 bg-[#E5FF66] dark:bg-[#E5FF66] rounded-[40px] p-7 flex items-center justify-between shadow-xl relative overflow-hidden group"
            >
              <div className="flex gap-6 items-center">
                <div className="w-14 h-14 rounded-2xl bg-black/5 flex items-center justify-center text-black">
                  <Calendar size={32} />
                </div>
                <div className="space-y-1">
                  <h3 className="font-black text-2xl text-black uppercase italic leading-none tracking-tight">University Events</h3>
                  <p className="text-[11px] font-black text-black/60 uppercase tracking-[0.1em]">Don't miss out</p>
                </div>
              </div>
              <ChevronRight size={24} className="text-black/40 group-hover:translate-x-1 transition-transform" />
            </motion.div>
          </div>
        </section>

        {/* Featured Communities Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-[18px] font-black text-zinc-900 dark:text-white uppercase italic">Featured Hubs</h2>
            <div className="flex p-1 bg-zinc-100 dark:bg-zinc-900 rounded-xl gap-2">
              <button className="w-8 h-8 rounded-lg bg-white dark:bg-zinc-800 shadow-sm flex items-center justify-center text-zinc-900 dark:text-white">
                <LayoutGrid size={14} />
              </button>
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
            {["All", "My Communities", "Suggested"].map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter.toLowerCase())}
                className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border-2 ${
                  activeFilter === filter.toLowerCase() 
                  ? "bg-zinc-900 dark:bg-[#E5FF66] text-white dark:text-black shadow-lg border-transparent" 
                  : "bg-white dark:bg-zinc-950 text-zinc-400 dark:text-zinc-600 border-zinc-100 dark:border-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* Joined Communities Area */}
          {(activeFilter === "all" || activeFilter === "my communities") && (
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-[12px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-widest">Joined</h3>
                <span className="text-[10px] font-black text-black dark:text-[#E5FF66] bg-[#E5FF66] dark:bg-zinc-900 px-2 py-0.5 rounded-md">
                  {myGroups.length}
                </span>
              </div>
              <div className="space-y-3">
                {myGroups.length > 0 ? myGroups.map((group) => (
                  <Link 
                    key={group.id}
                    href={`/groups/${group.id}`}
                    className="flex items-center gap-4 p-4 rounded-[32px] bg-white dark:bg-zinc-950 border border-zinc-100/80 dark:border-zinc-800/50 shadow-sm hover:shadow-xl hover:shadow-black/5 active:scale-[0.98] transition-all group overflow-hidden relative"
                  >
                    <div className="absolute inset-y-0 left-0 w-1 bg-[#E5FF66] opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="w-14 h-14 rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-900/50 flex items-center justify-center relative shrink-0 border border-zinc-100 dark:border-zinc-800/80 group-hover:scale-105 transition-transform">
                      {group.image_url ? (
                        <Image src={group.image_url} alt={group.name} fill className="object-cover" />
                      ) : (
                        <Users className="text-zinc-300 dark:text-zinc-700 w-7 h-7" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-[15px] text-zinc-900 dark:text-white truncate">{group.name}</h3>
                      <p className="text-[12px] font-medium text-zinc-500 dark:text-zinc-400 truncate mt-0.5">{group.description || "Active community member"}</p>
                    </div>
                    <ChevronRight size={18} className="text-zinc-300 group-hover:text-[#E5FF66] transition-colors" />
                  </Link>
                )) : (
                  <div className="py-10 text-center bg-zinc-50/50 dark:bg-zinc-900/10 rounded-[40px] border-2 border-dashed border-zinc-100 dark:border-zinc-800/50">
                    <p className="text-xs font-bold text-zinc-400">No active communities</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Discovery Area */}
          {(activeFilter === "all" || activeFilter === "suggested") && (
            <div className="space-y-5 pt-4">
              <h3 className="text-[12px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-widest px-1">Discovery</h3>
              <div className="grid grid-cols-2 gap-4">
                {groups.length > 0 ? groups.map((group) => (
                  <div key={group.id} className="bg-white dark:bg-zinc-950 rounded-[36px] p-2 shadow-sm border border-zinc-100/60 dark:border-zinc-800/60 group overflow-hidden flex flex-col h-full">
                    <div className="h-32 rounded-[30px] overflow-hidden relative mb-4 bg-zinc-100 dark:bg-zinc-900 shrink-0">
                      {group.image_url ? (
                        <Image src={group.image_url} alt={group.name} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-900 dark:to-zinc-800 flex items-center justify-center">
                          <Users className="text-zinc-300 dark:text-zinc-700 w-8 h-8" />
                        </div>
                      )}
                    </div>
                    <div className="px-3 pb-4 flex-1 flex flex-col">
                      <h3 className="text-sm font-black text-zinc-900 dark:text-white mb-2 leading-tight line-clamp-1 italic uppercase">{group.name}</h3>
                      <button 
                        onClick={() => handleJoinGroup(group.id)}
                        className="w-full py-3 bg-zinc-900 dark:bg-[#E5FF66] rounded-2xl text-[10px] font-black text-white dark:text-black hover:bg-black dark:hover:bg-white transition-all active:scale-95 shadow-lg mt-auto uppercase tracking-widest"
                      >
                        Join
                      </button>
                    </div>
                  </div>
                )) : (
                  <div className="col-span-2 py-20 text-center">
                    <Construction size={40} className="text-zinc-200 mx-auto mb-4" />
                    <h3 className="text-sm font-black text-zinc-400">More hubs coming soon</h3>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      </main>

      {profile && user && (
        <CreateGroupModal 
          isOpen={isCreateModalOpen} 
          onClose={() => setIsCreateModalOpen(false)} 
          onSuccess={(id) => {
            fetchGroups(profile.university_id, user.id);
            showToast("Community created successfully!");
          }}
          universityId={profile.university_id}
          userId={user.id}
        />
      )}

      <BottomNavigation />
    </div>
  );
}

// Construction icon for empty state
function Construction({ size, className }: { size: number, className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <rect x="2" y="6" width="20" height="8" rx="1" />
      <path d="M17 14v7" />
      <path d="M7 14v7" />
      <path d="M17 3v3" />
      <path d="M7 3v3" />
      <path d="M10 14 2 3" />
      <path d="M14 14 22 3" />
    </svg>
  );
}
