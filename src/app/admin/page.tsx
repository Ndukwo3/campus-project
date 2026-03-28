"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { Users, School, BookOpen, Activity, AlertTriangle } from "lucide-react";
import Link from "next/link";

interface Stats {
  totalUsers: number;
  totalUniversities: number;
  totalDepartments: number;
  totalResources: number;
}

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchStats() {
      try {
        const [usersRes, uniRes, deptRes, resourcesRes] = await Promise.all([
          supabase.from('profiles').select('*', { count: 'exact', head: true }),
          supabase.from('universities').select('*', { count: 'exact', head: true }),
          supabase.from('departments').select('*', { count: 'exact', head: true }),
          supabase.from('academic_resources').select('*', { count: 'exact', head: true }).eq('status', 'approved')
        ]);

        setStats({
          totalUsers: usersRes.count || 0,
          totalUniversities: uniRes.count || 0,
          totalDepartments: deptRes.count || 0,
          totalResources: resourcesRes.count || 0
        });
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchStats();
  }, [supabase]);

  const statCards = [
    { icon: <Users size={24} />, label: "Total Students", value: stats?.totalUsers || 0, color: "text-blue-500", bg: "bg-blue-500/10", href: "/admin/users" },
    { icon: <School size={24} />, label: "Universities", value: stats?.totalUniversities || 0, color: "text-[#E5FF66]", bg: "bg-[#E5FF66]/10", href: "/admin/campus" },
    { icon: <BookOpen size={24} />, label: "Departments", value: stats?.totalDepartments || 0, color: "text-purple-500", bg: "bg-purple-500/10", href: "/admin/campus" },
    { icon: <Activity size={24} />, label: "Approved Resources", value: stats?.totalResources || 0, color: "text-emerald-500", bg: "bg-emerald-500/10", href: "/admin/campus" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-black italic uppercase tracking-tight text-zinc-900 dark:text-white">System Overview</h2>
        <p className="text-sm font-bold text-zinc-500 dark:text-zinc-400 mt-2">Holistic metrics for the Campus Hub platform.</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => (
             <div key={i} className="h-32 rounded-[32px] bg-zinc-50 dark:bg-zinc-900/50 animate-pulse border border-zinc-100 dark:border-zinc-800" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((card, idx) => (
            <Link key={idx} href={card.href} className="group cursor-pointer">
              <div className="p-6 h-full rounded-[32px] bg-white dark:bg-black border border-zinc-100 dark:border-zinc-900 shadow-sm flex flex-col gap-4 group-hover:border-[#E5FF66]/30 transition-all group-hover:shadow-md group-active:scale-[0.98]">
                 <div className={`w-12 h-12 rounded-2xl ${card.bg} ${card.color} flex items-center justify-center transition-transform group-hover:scale-110`}>
                   {card.icon}
                 </div>
                 <div>
                   <p className="text-[10px] uppercase font-black tracking-widest text-zinc-400">{card.label}</p>
                   <p className="text-3xl font-black text-zinc-900 dark:text-white mt-1">{card.value}</p>
                 </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
         <div className="p-8 rounded-[40px] bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-3 mb-6">
              <AlertTriangle className="text-orange-500" size={24} />
              <h3 className="font-black uppercase tracking-widest text-sm">System Alerts</h3>
            </div>
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-white dark:bg-black border border-zinc-100 dark:border-zinc-800">
                <p className="text-xs font-bold text-zinc-500">No active alerts. Global systems operating at 100%.</p>
              </div>
            </div>
         </div>
      </div>
    </div>
  );
}
