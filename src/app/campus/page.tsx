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

export default function UnivasPage() {
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
          <h1 className="text-[34px] font-black tracking-tight text-zinc-900 dark:text-white uppercase italic">Univas</h1>
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
                onClick={() => router.push("/communities")}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 bg-zinc-50 dark:bg-zinc-900/40 rounded-[38px] p-6 border border-zinc-100 dark:border-zinc-800/50 flex flex-col justify-between group cursor-pointer transition-all hover:bg-white dark:hover:bg-zinc-900 shadow-sm"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#E5FF66]/10 dark:bg-[#E5FF66]/10 flex items-center justify-center text-[#E5FF66] dark:text-[#E2FF3D]">
                  <Users size={24} />
                </div>
                <div className="space-y-0.5">
                  <h3 className="font-black text-[13px] uppercase tracking-wider text-zinc-900 dark:text-white">Communities</h3>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1 h-1 rounded-full bg-[#E5FF66] animate-pulse" />
                    <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">Directory</span>
                  </div>
                </div>
              </motion.div>

              <motion.div
                onClick={() => router.push("/channels")}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 bg-zinc-50 dark:bg-zinc-900/40 rounded-[38px] p-6 border border-zinc-100 dark:border-zinc-800/50 flex flex-col justify-between group cursor-pointer transition-all hover:bg-white dark:hover:bg-zinc-900 shadow-sm"
              >
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <Hash size={24} />
                </div>
                <div className="space-y-0.5">
                  <h3 className="font-black text-[13px] uppercase tracking-wider text-zinc-900 dark:text-white">Channels</h3>
                  <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">Global Feed</span>
                </div>
              </motion.div>
            </div>

            {/* Bottom Row: Events (Full Width) */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="col-span-2 mt-8 bg-[#E5FF66] dark:bg-[#E5FF66] rounded-[40px] p-7 flex items-center justify-between shadow-xl relative overflow-hidden group"
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

        {/* Dynamic Activity/Announcements Section */}
        <section className="space-y-8">
           <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                <h2 className="text-[18px] font-black text-zinc-900 dark:text-white uppercase italic">Live Activity</h2>
              </div>
              <button className="text-[10px] font-black text-zinc-400 uppercase tracking-widest hover:text-zinc-600 dark:hover:text-[#E5FF66] transition-colors">See Feed</button>
           </div>
           
           <div className="p-10 text-center bg-zinc-50 dark:bg-zinc-900/20 rounded-[44px] border-2 border-dashed border-zinc-100 dark:border-zinc-800/80">
              <Sparkles size={32} className="mx-auto text-zinc-200 dark:text-zinc-800 mb-4" />
              <p className="text-[11px] font-black text-zinc-400 uppercase tracking-[0.2em] leading-relaxed">
                Connect your communities<br/>to see live updates here.
              </p>
           </div>
        </section>
      </main>

      {profile && user && (
        <CreateGroupModal 
          isOpen={isCreateModalOpen} 
          onClose={() => setIsCreateModalOpen(false)} 
          onSuccess={(id) => {
            router.push(`/groups/${id}`);
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
