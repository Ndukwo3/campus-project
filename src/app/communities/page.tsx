"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, Search, Users, ChevronRight, ArrowLeft, 
  Sparkles, LayoutGrid, Globe, Shield, UserPlus, User
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import BottomNavigation from "@/components/BottomNavigation";
import CreateGroupModal from "@/components/modals/CreateGroupModal";
import Toast from "@/components/Toast";

export default function CommunitiesPage() {
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
      const { data: allGroups } = await supabase
        .from('groups')
        .select('*')
        .eq('university_id', universityId);

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
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="w-10 h-10 rounded-xl bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center text-zinc-900 dark:text-white border border-zinc-100 dark:border-zinc-800"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex flex-col">
            <h1 className="text-[24px] font-black tracking-tight text-zinc-900 dark:text-white uppercase italic leading-none">Communities</h1>
            <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-600 uppercase tracking-widest mt-1">Directory & Discovery</p>
          </div>
        </div>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="w-10 h-10 rounded-xl bg-zinc-900 dark:bg-[#E5FF66] flex items-center justify-center text-white dark:text-black shadow-lg"
        >
          <Plus size={20} />
        </button>
      </div>

      <main className="flex-1 px-6 py-8 pb-40 space-y-10 overflow-y-auto scrollbar-hide">
        {/* Search */}
        <div className="relative group">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-[#E5FF66] transition-colors" />
          <input 
            type="text" 
            placeholder="Search for focus groups, hubs, or clubs..." 
            className="w-full h-14 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl pl-12 pr-4 text-sm font-medium border border-zinc-100 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-[#E5FF66]/20 focus:border-[#E5FF66] transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
          {["All", "My Communities", "Suggested", "Global"].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter.toLowerCase())}
              className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border-2 ${
                activeFilter === filter.toLowerCase() 
                ? "bg-zinc-900 dark:bg-[#E5FF66] text-white dark:text-black shadow-lg border-transparent mt-[-2px] mb-[2px]" 
                : "bg-white dark:bg-zinc-950 text-zinc-400 dark:text-zinc-600 border-zinc-100 dark:border-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-900"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* My Communities */}
        {(activeFilter === "all" || activeFilter === "my communities") && (
          <div className="space-y-6">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <Users size={16} className="text-[#E5FF66]" />
                <h2 className="text-[14px] font-black text-zinc-900 dark:text-white uppercase italic tracking-wider">Joined Communities</h2>
              </div>
              <span className="text-[10px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-widest">
                {myGroups.length} TOTAL
              </span>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              {myGroups.length > 0 ? myGroups.map((group) => (
                <Link 
                  key={group.id}
                  href={`/groups/${group.id}`}
                  className="flex items-center gap-4 p-5 rounded-[32px] bg-white dark:bg-zinc-950 border border-zinc-100/80 dark:border-zinc-800/50 shadow-sm hover:shadow-xl hover:shadow-black/5 active:scale-[0.98] transition-all group overflow-hidden relative"
                >
                  <div className="absolute inset-y-0 left-0 w-1.5 bg-[#E5FF66] opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="w-14 h-14 rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-900/50 flex items-center justify-center relative shrink-0 border border-zinc-100 dark:border-zinc-800/80 group-hover:scale-105 transition-transform duration-500">
                    {group.image_url ? (
                      <Image src={group.image_url} alt={group.name} fill className="object-cover" />
                    ) : (
                      <Users className="text-zinc-300 dark:text-zinc-700 w-7 h-7" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-[16px] text-zinc-900 dark:text-white truncate">{group.name}</h3>
                    <p className="text-[12px] font-medium text-zinc-500 dark:text-zinc-400 truncate mt-0.5">{group.description || "Active community member"}</p>
                  </div>
                  <motion.div 
                    initial={{ x: 0 }}
                    whileHover={{ x: 4 }}
                    className="w-8 h-8 rounded-full bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center text-zinc-300 group-hover:text-[#E5FF66] group-hover:bg-[#E5FF66]/10 transition-colors"
                  >
                    <ChevronRight size={18} />
                  </motion.div>
                </Link>
              )) : (
                <div className="py-12 text-center bg-zinc-50/50 dark:bg-zinc-900/20 rounded-[44px] border-2 border-dashed border-zinc-100 dark:border-zinc-800/50">
                  <Globe size={40} className="mx-auto text-zinc-200 dark:text-zinc-800 mb-4" />
                  <p className="text-[12px] font-bold text-zinc-400 uppercase tracking-widest leading-relaxed">You haven't joined<br/>any communities yet</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Suggested / Discovery */}
        {(activeFilter === "all" || activeFilter === "suggested" || activeFilter === "global") && (
          <div className="space-y-6 pt-4">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-blue-500" />
                <h2 className="text-[14px] font-black text-zinc-900 dark:text-white uppercase italic tracking-wider">Discover Hubs</h2>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {groups.length > 0 ? groups.map((group) => (
                <div 
                  key={group.id} 
                  className="bg-zinc-50/50 dark:bg-zinc-950 rounded-[40px] border border-zinc-100 dark:border-zinc-800/80 p-3 shadow-sm hover:shadow-xl transition-all group/card flex flex-col h-full overflow-hidden"
                >
                  <div className="h-32 rounded-[32px] overflow-hidden relative mb-4 bg-zinc-100 dark:bg-zinc-900 shrink-0">
                    {group.image_url ? (
                      <Image 
                        src={group.image_url} 
                        alt={group.name} 
                        fill 
                        className="object-cover group-hover/card:scale-110 transition-transform duration-1000" 
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-900 dark:to-zinc-800 flex items-center justify-center">
                        <Users className="text-zinc-300 dark:text-zinc-700 w-8 h-8" />
                      </div>
                    )}
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/90 dark:bg-black/80 backdrop-blur-md flex items-center gap-1.5 shadow-sm">
                       <Shield size={10} className="text-[#E5FF66]" />
                       <span className="text-[9px] font-black text-zinc-900 dark:text-white uppercase tracking-wider">Public</span>
                    </div>
                  </div>
                  
                  <div className="px-3 pb-3 flex-1 flex flex-col">
                    <h3 className="text-[14px] font-black text-zinc-900 dark:text-white mb-2 leading-tight line-clamp-1 italic uppercase tracking-tighter group-hover/card:text-[#E5FF66] transition-colors">{group.name}</h3>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex -space-x-2">
                         {[1,2,3].map(i => (
                           <div key={i} className="w-5 h-5 rounded-full bg-zinc-200 dark:bg-zinc-800 border-2 border-white dark:border-zinc-950 overflow-hidden">
                              <User size={10} className="w-full h-full text-zinc-400" />
                           </div>
                         ))}
                      </div>
                      <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-600 uppercase tracking-widest">Growing</span>
                    </div>
                    
                    <button 
                      onClick={() => handleJoinGroup(group.id)}
                      className="w-full h-11 bg-zinc-900 dark:bg-[#E5FF66] rounded-2xl text-[10px] font-black text-white dark:text-black hover:bg-black dark:hover:bg-white transition-all active:scale-95 shadow-lg mt-auto uppercase tracking-widest flex items-center justify-center gap-2"
                    >
                      <UserPlus size={14} />
                      Join Hub
                    </button>
                  </div>
                </div>
              )) : (
                <div className="col-span-2 py-24 text-center bg-zinc-50/30 dark:bg-zinc-900/10 rounded-[44px] border-2 border-dashed border-zinc-100 dark:border-zinc-800/30">
                  <LayoutGrid size={40} className="mx-auto text-zinc-200 dark:text-zinc-800 mb-4" />
                  <h3 className="text-[12px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-widest">More communities<br/>coming soon</h3>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {profile && user && (
        <CreateGroupModal 
          isOpen={isCreateModalOpen} 
          onClose={() => setIsCreateModalOpen(false)} 
          onSuccess={(id) => {
            fetchGroups(profile.university_id, user.id);
            showToast("Community created successfully!");
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
