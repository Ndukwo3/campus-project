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
  ChevronRight 
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

export default function SettingsPage() {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const settingGroups = [
    {
      title: "Account & Privacy",
      items: [
        { icon: User, label: "Account", href: "/settings/account", color: "text-blue-500", bg: "bg-blue-50" },
        { icon: Lock, label: "Privacy", href: "/settings/privacy", color: "text-purple-500", bg: "bg-purple-50" },
        { icon: Shield, label: "Security", href: "/settings/security", color: "text-emerald-500", bg: "bg-emerald-50" },
      ]
    },
    {
      title: "App & Data",
      items: [
        { icon: Bell, label: "Notifications", href: "/settings/notifications", color: "text-orange-500", bg: "bg-orange-50" },
        { icon: MessageSquare, label: "Messaging", href: "/settings/messaging", color: "text-sky-500", bg: "bg-sky-50" },
        { icon: Activity, label: "Content & Activity", href: "/settings/activity", color: "text-indigo-500", bg: "bg-indigo-50" },
        { icon: Palette, label: "Appearance", href: "/settings/appearance", color: "text-pink-500", bg: "bg-pink-50" },
      ]
    },
    {
      title: "University",
      items: [
        { icon: GraduationCap, label: "Campus Tools", href: "/settings/campus", color: "text-yellow-600", bg: "bg-yellow-50" },
      ]
    },
    {
      title: "Support",
      items: [
        { icon: HelpCircle, label: "Help & Support", href: "/settings/support", color: "text-zinc-500", bg: "bg-zinc-100" },
        { icon: Info, label: "About", href: "/settings/about", color: "text-zinc-500", bg: "bg-zinc-100" },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-[40px] max-w-md mx-auto relative font-sans">
      {/* Header Bar */}
      <div className="flex items-center gap-4 px-6 py-4 sticky top-0 bg-[#F8F9FA]/80 backdrop-blur-md z-10 border-b border-zinc-100">
        <Link href="/profile" className="w-10 h-10 flex items-center justify-center rounded-full bg-white hover:bg-zinc-50 transition shadow-sm shrink-0">
          <ArrowLeft size={20} className="text-black" />
        </Link>
        <span className="font-bold text-xl tracking-tight text-black">Settings</span>
      </div>

      <main className="px-4 pt-6 space-y-8">
        {settingGroups.map((group, groupIdx) => (
          <div key={groupIdx}>
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 px-4 shadow-none">
              {group.title}
            </h3>
            <div className="bg-white rounded-[24px] shadow-sm border border-zinc-100/50 overflow-hidden">
              {group.items.map((item, index) => {
                const Icon = item.icon;
                return (
                  <Link 
                    key={index}
                    href={item.href}
                    className={`flex items-center gap-4 px-4 py-3.5 hover:bg-zinc-50 transition-colors active:bg-zinc-100 ${index !== group.items.length - 1 ? 'border-b border-zinc-100' : ''}`}
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${item.bg}`}>
                      <Icon size={18} className={item.color} />
                    </div>
                    <span className="font-bold text-[15px] text-zinc-900 flex-1">{item.label}</span>
                    <ChevronRight size={18} className="text-zinc-300" />
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        {/* Danger Zone */}
        <div>
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 px-4 shadow-none">
            Account Actions
          </h3>
          <div className="bg-white rounded-[24px] shadow-sm border border-zinc-100/50 overflow-hidden mb-8">
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-4 px-4 py-3.5 hover:bg-red-50 transition-colors active:bg-zinc-100"
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-red-100">
                <LogOut size={18} className="text-red-600" />
              </div>
              <span className="font-bold text-[15px] text-red-600 flex-1 text-left">Log Out</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
