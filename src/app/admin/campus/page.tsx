"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { 
  Building2, 
  GraduationCap, 
  BookOpen, 
  Search, 
  Clock, 
  FileText, 
  LayoutGrid,
  ChevronRight,
  TrendingUp,
  AlertCircle
} from "lucide-react";
import { motion } from "framer-motion";

export default function UnivasModeratorPage() {
  const [stats, setStats] = useState<any>({
    total: 0,
    pending: 0,
    activeUnis: 0,
    activeDepts: 0
  });
  const [hierarchy, setHierarchy] = useState<any[]>([]);
  const [selectedUni, setSelectedUni] = useState<string | null>(null);
  const [recentUploads, setRecentUploads] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    setIsLoading(true);
    try {
      // 0. Get User Profile and Restriction
      const { data: { session } } = await supabase.auth.getSession();
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, moderated_university_id, universities:moderated_university_id(name)')
        .eq('id', session?.user.id)
        .single();

      const modUniId = profile?.moderated_university_id;
      const modUniName = (profile?.universities as any)?.name;
      const isRestricted = profile?.role === 'moderator' && modUniId;

      if (modUniName) setSelectedUni(modUniName);

      // 1. Fetch resources with restriction if applicable
      let query = supabase.from('academic_resources').select('university_name, department_name, status, created_at');
      if (isRestricted) query = query.eq('university_id', modUniId);

      const { data: resources, error: resError } = await query;
      if (resError) throw resError;

      // Calculate Stats
      const total = resources?.length || 0;
      const pending = (resources as any[])?.filter((r: any) => r.status === 'pending').length || 0;
      const uniqueUnis = new Set((resources as any[])?.map((r: any) => r.university_name)).size;
      const uniqueDepts = new Set((resources as any[])?.map((r: any) => r.department_name)).size;

      setStats({ total, pending, activeUnis: uniqueUnis, activeDepts: uniqueDepts });

      // 2. Build Hierarchy Breakdown
      const breakdown: any = {};
      (resources as any[])?.forEach((r: any) => {
        if (!breakdown[r.university_name]) {
          breakdown[r.university_name] = { count: 0, departments: new Set() };
        }
        breakdown[r.university_name].count++;
        breakdown[r.university_name].departments.add(r.department_name);
      });

      const hierarchyList = Object.keys(breakdown).map(name => ({
        name,
        count: breakdown[name].count,
        deptCount: breakdown[name].departments.size
      })).sort((a, b) => b.count - a.count);

      setHierarchy(hierarchyList);

      // 3. Fetch Recent Activity
      let recentQuery = supabase
        .from('academic_resources')
        .select('title, university_name, status, created_at')
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (isRestricted) recentQuery = recentQuery.eq('university_id', modUniId);

      const { data: recent, error: recError } = await recentQuery;

      if (!recError) setRecentUploads(recent || []);

    } catch (err) {
      console.error("Dashboard error:", err);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-10 pb-20">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black italic uppercase tracking-tight text-zinc-900 dark:text-white leading-none">
            {selectedUni ? `${selectedUni} Insights` : "Univas Insights"}
          </h2>
          <p className="text-sm font-bold text-zinc-500 dark:text-zinc-400 mt-2 uppercase tracking-widest text-[11px]">
            {selectedUni ? `Detailed analytics for your assigned institution.` : "System-wide overview of academic content and hierarchy health."}
          </p>
        </div>
        <button 
          onClick={fetchDashboardData}
          className="px-6 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-900 dark:hover:text-[#E5FF66] transition-all"
        >
          Refresh Data
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Materials", value: stats.total, icon: <FileText size={20} />, color: "text-[#E5FF66]" },
          { label: "Awaiting Review", value: stats.pending, icon: <Clock size={20} />, color: "text-orange-400" },
          { label: "Live Institutions", value: stats.activeUnis, icon: <Building2 size={20} />, color: "text-blue-400" },
          { label: "Active Departments", value: stats.activeDepts, icon: <GraduationCap size={20} />, color: "text-purple-400" }
        ].map((stat, i) => (
          <div key={i} className="p-6 bg-white dark:bg-black border border-zinc-100 dark:border-zinc-900 rounded-[32px] shadow-sm flex items-center gap-5">
             <div className={`w-12 h-12 rounded-2xl bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center ${stat.color}`}>
                {stat.icon}
             </div>
             <div>
               <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 leading-none mb-1">{stat.label}</p>
               <h4 className="text-2xl font-black text-zinc-900 dark:text-white leading-none tracking-tight">{stat.value}</h4>
             </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Hierarchy Overview */}
        <div className="lg:col-span-2 space-y-4">
           <div className="flex items-center gap-2 mb-2 px-2">
              <TrendingUp size={18} className="text-[#E5FF66]" />
              <h3 className="font-black text-xs uppercase tracking-[0.2em] text-zinc-400">Content Density by Institution</h3>
           </div>
           
           {isLoading ? (
             <div className="space-y-3">
               {[1,2,3].map(i => <div key={i} className="h-24 bg-zinc-50 dark:bg-zinc-900/50 rounded-[32px] animate-pulse" />)}
             </div>
           ) : (
             <div className="space-y-3">
               {hierarchy.map((uni, idx) => (
                 <div key={idx} className="p-6 bg-white dark:bg-black border border-zinc-100 dark:border-zinc-900 rounded-[32px] hover:border-[#E5FF66]/20 transition-all group flex items-center justify-between">
                    <div className="flex items-center gap-5">
                       <div className="w-12 h-12 rounded-2xl bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center text-zinc-400 group-hover:text-white transition-colors">
                          <Building2 size={22} />
                       </div>
                       <div>
                         <h4 className="text-[15px] font-black uppercase italic tracking-tight text-zinc-900 dark:text-white group-hover:text-[#E5FF66] transition-colors">{uni.name}</h4>
                         <p className="text-[10px] font-bold text-zinc-500 uppercase mt-1 tracking-widest">{uni.deptCount} Active Departments</p>
                       </div>
                    </div>
                    <div className="text-right flex items-center gap-6">
                      <div>
                        <p className="text-[18px] font-black text-zinc-900 dark:text-white leading-none">{uni.count}</p>
                        <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mt-1">Resources</p>
                      </div>
                      <ChevronRight size={18} className="text-zinc-200 group-hover:text-[#E5FF66] transition-all group-hover:translate-x-1" />
                    </div>
                 </div>
               ))}
               {hierarchy.length === 0 && (
                 <div className="py-20 text-center bg-zinc-50 dark:bg-zinc-900/40 rounded-[40px] border-2 border-dashed border-zinc-100 dark:border-zinc-800">
                    <AlertCircle size={40} className="mx-auto text-zinc-300 dark:text-zinc-700 mb-4" />
                    <p className="text-xs font-black uppercase tracking-widest text-zinc-400">No content data available yet.</p>
                 </div>
               )}
             </div>
           )}
        </div>

        {/* Recent Activity Log */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2 px-2">
             <LayoutGrid size={18} className="text-blue-400" />
             <h3 className="font-black text-xs uppercase tracking-[0.2em] text-zinc-400">Admin Log</h3>
          </div>
          <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-[40px] border border-zinc-100 dark:border-zinc-800 p-8 space-y-6">
             {recentUploads.map((log, i) => (
               <div key={i} className="relative pl-6 border-l-2 border-zinc-200 dark:border-zinc-800 last:border-none pb-6 last:pb-0">
                  <div className={`absolute -left-[5px] top-1 w-2 h-2 rounded-full ${log.status === 'pending' ? 'bg-orange-500' : 'bg-emerald-500'} shadow-[0_0_8px_rgba(34,197,94,0.4)]`} />
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 leading-none">{new Date(log.created_at).toLocaleTimeString()}</p>
                  <h5 className="text-[13px] font-bold text-zinc-900 dark:text-white mt-2 leading-snug">{log.title}</h5>
                  <p className="text-[9px] font-bold text-zinc-500 uppercase mt-1 tracking-tight">{log.university_name} · <span className={log.status === 'pending' ? 'text-orange-500' : 'text-emerald-500'}>{log.status}</span></p>
               </div>
             ))}
             {recentUploads.length === 0 && (
               <p className="text-[10px] text-center font-bold text-zinc-500 uppercase py-10 opacity-40 italic">Waiting for incoming streams...</p>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}

