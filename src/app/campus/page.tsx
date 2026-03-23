"use client";

import { useEffect, useState } from "react";
import { Sparkles, ArrowLeft, Plus, Users, Search, ChevronRight, User } from "lucide-react";
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

      const userGroupIds = new Set(userMemberships?.map(m => m.group_id) || []);

      const processedAll = allGroups || [];
      setGroups(processedAll.filter(g => !userGroupIds.has(g.id)));
      setMyGroups(processedAll.filter(g => userGroupIds.has(g.id)));
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
      
      showToast("Successfully joined the group!");
      if (profile) fetchGroups(profile.university_id, user.id);
    } catch (err: any) {
      showToast(err.message || "Failed to join group", "error");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#FDFDFD] max-w-md mx-auto relative font-sans">
       <Toast 
        message={toast.message} 
        type={toast.type} 
        isVisible={toast.isVisible} 
        onClose={() => setToast({ ...toast, isVisible: false })} 
      />

      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl px-6 pt-10 pb-5 flex items-center justify-between border-b border-zinc-100/50">
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900">Campus</h1>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="w-10 h-10 flex items-center justify-center rounded-2xl bg-zinc-900 text-[#E5FF66] shadow-lg active:scale-95 transition-all"
        >
          <Plus size={20} />
        </button>
      </div>

      <main className="flex-1 px-6 py-6 pb-40 space-y-8 overflow-y-auto scrollbar-hide">
        {/* Horizontal Filters */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {["All Groups", "My Groups", "Recommended"].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter.toLowerCase())}
              className={`px-6 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                activeFilter === filter.toLowerCase() 
                ? "bg-zinc-900 text-white shadow-md" 
                : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* My Groups Section */}
        {(activeFilter === "all groups" || activeFilter === "my groups") && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[17px] font-bold text-zinc-900 leading-none">Joined Communities</h2>
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{myGroups.length} Groups</span>
            </div>
            
            <div className="space-y-3">
              {myGroups.length > 0 ? myGroups.map((group) => (
                <Link 
                  key={group.id}
                  href={`/groups/${group.id}`}
                  className="flex items-center gap-4 p-4 rounded-3xl bg-white border border-zinc-100/50 shadow-sm hover:shadow-md active:scale-[0.98] transition-all group"
                >
                  <div className="w-14 h-14 rounded-2xl overflow-hidden bg-zinc-100 flex items-center justify-center relative shrink-0">
                    {group.image_url ? (
                      <Image src={group.image_url} alt={group.name} fill className="object-cover" />
                    ) : (
                      <Users className="text-zinc-300 w-7 h-7" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-[15px] text-zinc-900 truncate">{group.name}</h3>
                    <p className="text-[12px] font-medium text-zinc-500 truncate mt-0.5">{group.description || "Active community member"}</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-400 group-hover:bg-[#E5FF66] group-hover:text-black transition-colors">
                    <ChevronRight size={18} />
                  </div>
                </Link>
              )) : (
                <div className="py-8 px-6 bg-zinc-50/50 rounded-3xl border border-dashed border-zinc-200 text-center">
                   <p className="text-sm font-bold text-zinc-400">No joined groups yet</p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Recommended/Explore Groups */}
        {(activeFilter === "all groups" || activeFilter === "recommended") && (
          <section>
            <div className="flex items-center justify-between mb-4 mt-2">
              <h2 className="text-[17px] font-bold text-zinc-900 leading-none">Discover More</h2>
              <Search size={18} className="text-zinc-400" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {groups.length > 0 ? groups.map((group) => (
                <div key={group.id} className="bg-white rounded-[32px] p-2 shadow-sm border border-zinc-100/50 group overflow-hidden flex flex-col h-full">
                  <div className="h-28 rounded-3xl overflow-hidden relative mb-3 bg-zinc-100 shrink-0">
                    {group.image_url ? (
                      <Image src={group.image_url} alt={group.name} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-zinc-100 to-zinc-200 flex items-center justify-center">
                        <Users className="text-zinc-300 w-8 h-8" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm">
                      <p className="text-[9px] font-black text-zinc-800 uppercase tracking-tighter">Recommended</p>
                    </div>
                  </div>
                  <div className="px-2 pb-2 flex-1 flex flex-col">
                    <h3 className="text-sm font-bold text-zinc-900 mb-1 leading-tight line-clamp-1">{group.name}</h3>
                    <p className="text-[11px] text-zinc-500 font-medium mb-3 line-clamp-2 min-h-[32px] leading-snug">
                       {group.description || "Join this academic community."}
                    </p>
                    <button 
                      onClick={() => handleJoinGroup(group.id)}
                      className="w-full py-2.5 bg-zinc-900 rounded-xl text-[11px] font-bold text-white hover:bg-black transition-all active:scale-95 shadow-sm mt-auto"
                    >
                      Join Community
                    </button>
                  </div>
                </div>
              )) : (
                <div className="col-span-2 py-10 text-center">
                   <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-zinc-100">
                     <Construction size={28} className="text-zinc-300" />
                   </div>
                   <h3 className="text-[15px] font-bold text-zinc-900 mb-1">More groups coming</h3>
                   <p className="text-xs text-zinc-400 px-10 leading-relaxed">We're finding more communities in your university!</p>
                </div>
              )}
            </div>
          </section>
        )}
      </main>

      {profile && user && (
        <CreateGroupModal 
          isOpen={isCreateModalOpen} 
          onClose={() => setIsCreateModalOpen(false)} 
          onSuccess={(id) => {
            fetchGroups(profile.university_id, user.id);
            showToast("Group created successfully!");
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
