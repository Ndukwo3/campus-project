"use client";

import { 
  ArrowLeft, 
  User, 
  Lock, 
  Bell, 
  Shield, 
  MessageSquare, 
  Palette, 
  GraduationCap, 
  Activity, 
  HelpCircle, 
  Info, 
  LogOut, 
  ChevronRight,
  ExternalLink,
  ChevronLeft
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";

export default function SettingsPage() {
  const router = useRouter();
  const supabase = createClient();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    async function fetchProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('full_name, username, avatar_url')
          .eq('id', user.id)
          .single();
        setProfile(data);
      }
    }
    fetchProfile();
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const settingGroups = [
    {
      title: "Account",
      items: [
        { icon: User, label: "Personal Information", href: "/settings/account", subtitle: "Manage your growth and identity" },
        { icon: Lock, label: "Privacy and Safety", href: "/settings/privacy", subtitle: "Control who can interact with you" },
        { icon: Shield, label: "Password and Security", href: "/settings/security", subtitle: "Login alerts and identity protection" },
      ]
    },
    {
      title: "Preferences",
      items: [
        { icon: Bell, label: "Notifications", href: "/settings/notifications", subtitle: "Customize your campus alerts" },
        { icon: MessageSquare, label: "Direct Messages", href: "/settings/messaging", subtitle: "Chat and community settings" },
        { icon: Palette, label: "Interface & Appearance", href: "/settings/appearance", subtitle: "Dark mode and visual themes" },
      ]
    },
    {
      title: "Campus",
      items: [
        { icon: GraduationCap, label: "University Tools", href: "/settings/campus", subtitle: "Departments, Levels, and Resources" },
        { icon: Activity, label: "Your Activity", href: "/settings/activity", subtitle: "Timeline and interaction history" },
      ]
    },
    {
      title: "Resources & Support",
      items: [
        { icon: HelpCircle, label: "Help Center", href: "/settings/support", subtitle: "FAQs and contact support" },
        { icon: Info, label: "About Campus", href: "/settings/about", subtitle: "Terms, Privacy, and Version" },
      ]
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black pb-[100px] max-w-md mx-auto relative font-sans transition-colors">
      {/* Premium Header */}
      <div className="sticky top-0 z-40 w-full bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-zinc-100/50 dark:border-zinc-800/50 px-6 py-4 flex items-center justify-between">
        <button 
          onClick={() => router.back()}
          className="w-10 h-10 flex items-center justify-center rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 transition-all active:scale-90"
        >
          <ChevronLeft size={20} strokeWidth={2.5} />
        </button>
        <h1 className="text-[17px] font-black tracking-tight text-zinc-900 dark:text-zinc-100 uppercase tracking-widest text-xs">Settings</h1>
        <div className="w-10" /> {/* Spacer */}
      </div>

      <main className="px-6 pt-8">
        {/* Profile Card Summary */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-zinc-900 dark:bg-zinc-900/50 rounded-[32px] p-6 mb-10 relative overflow-hidden group shadow-xl shadow-zinc-200 dark:shadow-none border border-transparent dark:border-zinc-800"
        >
          {/* Subtle light effect */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-10 -mt-10" />
          
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-16 h-16 rounded-[22px] overflow-hidden bg-white/10 border border-white/10 p-[1px]">
              {profile?.avatar_url ? (
                <Image 
                  src={profile.avatar_url} 
                  alt="Profile" 
                  width={64} 
                  height={64} 
                  className="w-full h-full object-cover rounded-[20px]"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/50">
                  <User size={32} />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-white font-black text-xl truncate tracking-tight">{profile?.full_name || "New Student"}</h2>
              <p className="text-white/40 text-[13px] font-bold">{profile?.username || "@username"}</p>
            </div>
            <Link 
              href="/profile"
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/10 text-[#E5FF66] hover:bg-white/20 transition-all active:scale-95 shadow-lg"
            >
              <ExternalLink size={18} />
            </Link>
          </div>
          
          <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-white/50 text-[11px] font-black uppercase tracking-widest">Premium Account</span>
            </div>
            <span className="text-[#E5FF66] text-[10px] font-black uppercase tracking-[0.2em]">Beta Access</span>
          </div>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-10"
        >
          {settingGroups.map((group, groupIdx) => (
            <div key={groupIdx} className="space-y-4">
              <h3 className="text-[11px] font-black text-zinc-300 dark:text-zinc-700 uppercase tracking-[0.25em] px-2 mb-2">
                {group.title}
              </h3>
              
              <div className="space-y-2">
                {group.items.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <motion.div key={index} variants={itemVariants}>
                      <Link 
                        href={item.href}
                        className="group flex items-center gap-4 px-2 py-3 rounded-2xl hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all active:scale-[0.98]"
                      >
                        <div className="w-12 h-12 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 flex items-center justify-center text-zinc-900 dark:text-zinc-100 shadow-sm group-hover:bg-white dark:group-hover:bg-black group-hover:shadow-md group-hover:border-[#E5FF66]/30 transition-all">
                          <Icon size={20} strokeWidth={2.5} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-black text-[15px] text-zinc-900 dark:text-zinc-100 tracking-tight leading-none mb-1">{item.label}</p>
                          <p className="text-zinc-400 dark:text-zinc-500 text-xs font-medium truncate opacity-80">{item.subtitle}</p>
                        </div>
                        <ChevronRight size={18} className="text-zinc-300 dark:text-zinc-700 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors" />
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Logout Section */}
          <motion.div variants={itemVariants} className="pt-4">
            <button 
              onClick={handleLogout}
              className="w-full group flex items-center gap-4 px-2 py-4 rounded-[28px] bg-red-50/30 dark:bg-red-500/5 hover:bg-red-50 dark:hover:bg-red-500/10 border border-red-100/30 dark:border-red-500/10 hover:border-red-100 dark:hover:border-red-500/20 transition-all active:scale-[0.98]"
            >
              <div className="w-12 h-12 rounded-2xl bg-white dark:bg-zinc-900 border border-red-100 dark:border-red-500/20 flex items-center justify-center text-red-500 shadow-sm transition-all group-hover:shadow-md">
                <LogOut size={20} strokeWidth={2.5} />
              </div>
              <div className="flex-1 text-left">
                <p className="font-black text-[15px] text-red-500 tracking-tight leading-none mb-1">Log Out</p>
                <p className="text-red-400/60 dark:text-red-500/40 text-xs font-bold uppercase tracking-widest">End Session</p>
              </div>
            </button>
          </motion.div>
        </motion.div>

        <div className="py-12 flex flex-col items-center justify-center opacity-20">
          <GraduationCap size={40} className="text-zinc-900 dark:text-white mb-4" />
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-900 dark:text-white text-center">Campus v1.0.4</p>
        </div>
      </main>
    </div>
  );
}
