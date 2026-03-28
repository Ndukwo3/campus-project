"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { motion } from "framer-motion";
import { LayoutDashboard, Users, BookOpen, ShieldAlert, ArrowLeft, Shield, FileText } from "lucide-react";
import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [modUni, setModUni] = useState<{ id: string, name: string } | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/auth");
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select(`
          role, 
          moderated_university_id,
          universities:moderated_university_id (name)
        `)
        .eq('id', session.user.id)
        .single();

      if (profile && ['super_admin', 'admin', 'moderator'].includes(profile.role)) {
        setIsAdmin(true);
        setRole(profile.role);
        if (profile.moderated_university_id) {
           setModUni({ 
             id: profile.moderated_university_id as string, 
             name: (profile.universities as any)?.name || 'Campus' 
           });
        }
      } else {
        router.push("/");
      }
    };

    checkAdmin();
  }, [router, supabase]);

  if (isAdmin === null) {
    return (
      <div className="min-h-screen bg-white dark:bg-black text-zinc-900 dark:text-zinc-100 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <Shield size={48} className="text-zinc-200 dark:text-zinc-800" />
          <p className="text-xs uppercase tracking-[0.2em] font-bold text-zinc-400">Verifying Clearance...</p>
        </div>
      </div>
    );
  }

  const isSuperAdmin = role === 'super_admin';

  const menuItems = [
    { icon: <LayoutDashboard size={18} />, label: "Overview", href: "/admin", allowed: ['super_admin', 'admin', 'moderator'] },
    { icon: <Users size={18} />, label: "User Management", href: "/admin/users", allowed: ['super_admin', 'admin'] },
    { icon: <Shield size={18} />, label: "Team Management", href: "/admin/team", allowed: ['super_admin'] },
    { icon: <FileText size={18} />, label: "Review Contributions", href: "/admin/contributions", allowed: ['super_admin', 'admin', 'moderator'] },
    { icon: <BookOpen size={18} />, label: "Campus Resources", href: "/admin/campus", allowed: ['super_admin', 'admin', 'moderator'] },
    { icon: <ShieldAlert size={18} />, label: "Reported Content", href: "/admin/reports", allowed: ['super_admin', 'admin'] }
  ].filter(item => item.allowed.includes(role || ''));

  return (
    <div className="min-h-screen bg-white dark:bg-black text-zinc-900 dark:text-zinc-100 flex pb-20 md:pb-0">
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-zinc-100 dark:border-zinc-900 hidden md:flex flex-col bg-zinc-50/50 dark:bg-black/50">
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-900">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-xl bg-zinc-900 dark:bg-[#E5FF66] flex items-center justify-center text-white dark:text-black">
              <Shield size={16} />
            </div>
            <h1 className="font-black italic uppercase tracking-tight text-lg">Hub Control</h1>
          </div>
          <p className="text-[10px] uppercase tracking-widest font-black text-zinc-400">
            Clearance: <span className="text-[#E5FF66]">{modUni?.name || role?.replace('_', ' ')}</span>
          </p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item, idx) => {
            const isActive = pathname === item.href;
            return (
              <Link key={idx} href={item.href}>
                <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-bold text-sm ${isActive ? 'bg-zinc-900 dark:bg-[#E5FF66] text-white dark:text-black shadow-md translate-x-1' : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900/80 hover:text-zinc-900 dark:hover:text-white'}`}>
                  {item.icon}
                  {item.label}
                </div>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-zinc-100 dark:border-zinc-900">
          <Link href="/">
            <div className="flex items-center gap-3 px-4 py-3 rounded-2xl text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors font-bold text-sm">
              <ArrowLeft size={18} />
              Exit Control
            </div>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-h-screen overflow-y-auto">
        <div className="max-w-6xl mx-auto p-4 md:p-8">
          {/* Mobile Header */}
          <div className="md:hidden flex items-center justify-between mb-8 pb-4 border-b border-zinc-100 dark:border-zinc-900">
            <div className="flex items-center gap-3">
              <Shield className="text-zinc-900 dark:text-[#E5FF66]" size={24} />
              <div>
                <h1 className="font-black italic uppercase text-lg leading-none">Hub Control</h1>
                <p className="text-[10px] uppercase font-bold text-zinc-400">{role?.replace('_', ' ')}</p>
              </div>
            </div>
            <Link href="/" className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center">
              <ArrowLeft size={18} />
            </Link>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {children}
          </motion.div>
        </div>
      </main>

      {/* Mobile Nav Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 border-t border-zinc-100 dark:border-zinc-900 bg-white/80 dark:bg-black/80 backdrop-blur-xl z-50 px-6 py-4 pb-8 flex items-center justify-between">
        {menuItems.map((item, idx) => {
           const isActive = pathname === item.href;
           return (
             <Link key={idx} href={item.href}>
               <div className={`p-3 rounded-2xl transition-colors ${isActive ? 'bg-zinc-900 dark:bg-[#E5FF66] text-white dark:text-black' : 'text-zinc-400 hover:text-zinc-900 dark:hover:text-white'}`}>
                 {item.icon}
               </div>
             </Link>
           )
        })}
      </div>
    </div>
  );
}
