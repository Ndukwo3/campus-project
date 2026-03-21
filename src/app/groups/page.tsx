"use client";

import { Search, Plus, Users, BookOpen, GraduationCap, Sparkles, ArrowRight, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import BottomNavigation from "@/components/BottomNavigation";
import { createClient } from "@/lib/supabase";

export default function GroupsPage() {
  const supabase = createClient();
  const [groups, setGroups] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function fetchGroups() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      const { data: dbGroups, error } = await supabase
        .from('groups')
        .select(`
          *,
          member_count:group_members(count)
        `)
        .order('created_at', { ascending: false });

      if (dbGroups) {
        setGroups(dbGroups);
      }
      setIsLoading(false);
    }
    fetchGroups();
  }, [supabase]);

  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-[110px] max-w-md mx-auto relative font-sans">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-zinc-100/50">
        <div className="px-6 pt-10 pb-5 flex items-center justify-between">
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900">Groups</h1>
          <button className="w-10 h-10 flex items-center justify-center rounded-2xl bg-[#E5FF66] text-black shadow-sm active:scale-95 transition-all">
            <Plus size={20} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* AI Assistant Banner */}
      <div className="px-5 mt-6 mb-8">
        <Link 
          href="/ai-assistant"
          className="relative overflow-hidden group block"
        >
          <div className="bg-zinc-900 rounded-[32px] p-6 text-white shadow-xl flex items-center justify-between border border-white/10">
            <div className="flex-1 relative z-10">
              <div className="flex items-center gap-2 mb-2">
                 <div className="w-8 h-8 rounded-full bg-[#E5FF66] flex items-center justify-center">
                   <Sparkles size={16} className="text-black" />
                 </div>
                 <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Powered by AI</span>
              </div>
              <h2 className="text-xl font-bold mb-1">Academic Assistant</h2>
              <p className="text-zinc-400 text-xs font-medium leading-relaxed max-w-[180px]">
                Get instant help with your assignments and exam prep.
              </p>
              <div className="mt-4 inline-flex items-center gap-2 text-[12px] font-bold text-[#E5FF66]">
                Ask something now <ArrowRight size={14} />
              </div>
            </div>
            
            {/* Visual Decoration */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-[#E5FF66]/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>
            
            <div className="relative z-10 w-24 h-24 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
               <div className="absolute inset-0 bg-[#E5FF66]/20 rounded-full animate-pulse"></div>
               <GraduationCap size={48} className="text-[#E5FF66]" />
            </div>
          </div>
        </Link>
      </div>

      {/* Filter / Tabs - Premium Pill Style */}
      <div className="flex gap-2 px-6 mb-8 overflow-x-auto scrollbar-hide py-1">
        {[
          { label: "Explorer", active: true },
          { label: "My Groups", active: false },
          { label: "Study Circles", active: false },
          { label: "Social", active: false }
        ].map((tab, idx) => (
          <button 
            key={idx}
            className={`px-6 py-3 rounded-2xl text-[12px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-sm
              ${tab.active ? "bg-[#1A1A24] text-white shadow-[#1A1A24]/10" : "bg-white text-zinc-400 border border-zinc-50 hover:bg-zinc-50"}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Explore Section */}
      <div className="px-6">
        <div className="flex items-center justify-between mb-6 px-1">
          <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400">Recommended communities</h2>
        </div>
        
        <div className="flex flex-col gap-5">
          {isLoading ? (
            <div className="flex flex-col gap-4">
               {[1,2,3].map(i => (
                 <div key={i} className="h-24 bg-zinc-50 rounded-[32px] animate-pulse" />
               ))}
            </div>
          ) : groups.length > 0 ? (
            groups.map((group) => (
              <Link 
                key={group.id}
                href={`/groups/${group.id}`}
                className="bg-white p-4 rounded-[32px] border border-zinc-100 shadow-[0_8px_30px_rgba(0,0,0,0.02)] flex items-center gap-4 hover:shadow-[0_15px_40px_rgba(0,0,0,0.04)] hover:-translate-y-0.5 transition-all duration-500 group"
              >
                <div className="w-16 h-16 rounded-[24px] bg-zinc-50 overflow-hidden relative shadow-inner border border-zinc-100">
                   {group.image_url ? (
                     <Image src={group.image_url} alt={group.name} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                   ) : (
                     <div className="w-full h-full flex items-center justify-center text-zinc-200">
                       <Users size={32} />
                     </div>
                   )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-black text-[15px] text-zinc-900 mb-1 group-hover:text-black transition-colors truncate tracking-tight">{group.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-[#4ADE80] bg-[#4ADE80]/5 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                      {group.member_count?.[0]?.count || 0} Members
                    </span>
                    <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest">• ACTIVE</span>
                  </div>
                </div>
                <div className="w-10 h-10 flex items-center justify-center rounded-2xl bg-zinc-50 text-zinc-300 group-hover:bg-[#E5FF66] group-hover:text-black group-hover:rotate-[-45deg] transition-all">
                  <ArrowRight size={18} strokeWidth={2.5} />
                </div>
              </Link>
            ))
          ) : (
            <div className="bg-zinc-50/50 rounded-[40px] p-12 text-center border border-zinc-100 shadow-inner">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                <BookOpen className="w-10 h-10 text-zinc-200" />
              </div>
              <h3 className="font-black text-zinc-900 text-lg mb-2">Build your community</h3>
              <p className="text-[13px] text-zinc-500 font-medium leading-relaxed mb-8 max-w-[220px] mx-auto">Collab with peers by creating the first study circle in your department!</p>
              <button className="px-10 py-4 bg-zinc-900 text-[#E5FF66] rounded-2xl text-[13px] font-black shadow-2xl active:scale-95 transition-all">
                Create First Group
              </button>
            </div>
          )}
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
}
