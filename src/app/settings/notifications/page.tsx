"use client";

import { ArrowLeft, Smartphone, MessageSquare, AtSign, Users, Megaphone, Calendar, CheckCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";

// Reusable toggle component
function ToggleSetting({ 
  icon: Icon, 
  title, 
  description, 
  checked,
  onChange,
  disabled
}: { 
  icon: any, 
  title: string, 
  description?: string, 
  checked: boolean,
  onChange: (val: boolean) => void,
  disabled?: boolean
}) {
  return (
    <div 
      className={`flex items-center justify-between px-4 py-4 border-b border-zinc-100 last:border-0 hover:bg-zinc-50/50 transition-colors cursor-pointer ${disabled ? "opacity-50 cursor-not-allowed" : ""}`} 
      onClick={() => !disabled && onChange(!checked)}
    >
      <div className="flex gap-4 pr-4">
        <div className="mt-0.5">
          <Icon size={20} className="text-zinc-500" />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-[15px] text-zinc-900">{title}</span>
          {description && <span className="text-[13px] text-zinc-500 mt-0.5">{description}</span>}
        </div>
      </div>
      <div 
        className={`w-12 h-6 rounded-full flex items-center p-1 shrink-0 transition-colors duration-300 ${checked ? "bg-[#E5FF66]" : "bg-zinc-200"}`}
      >
        <div 
          className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform duration-300 ${checked ? "translate-x-6 shadow-[0_0_8px_rgba(0,0,0,0.1)]" : "translate-x-0"}`} 
        />
      </div>
    </div>
  );
}

function FloatingToast({ message }: { message: string }) {
  return (
    <motion.div 
      initial={{ y: -100, x: "-50%", opacity: 0 }}
      animate={{ y: 20, x: "-50%", opacity: 1 }}
      exit={{ y: -100, x: "-50%", opacity: 0 }}
      className="fixed top-0 left-1/2 z-[60] bg-zinc-900 dark:bg-[#E5FF66] text-white dark:text-black text-[13px] font-black px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 border border-white/10 dark:border-black/10 backdrop-blur-md"
    >
      <div className="bg-[#E5FF66] dark:bg-black rounded-full p-1">
        <CheckCircle size={14} className="text-black dark:text-[#E5FF66]" />
      </div>
      {message}
    </motion.div>
  );
}

export default function NotificationsSettingsPage() {
  const router = useRouter();
  const supabase = createClient();
  const queryClient = useQueryClient();
  
  const [toast, setToast] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Local state for toggles
  const [settings, setSettings] = useState({
    push: true,
    direct_messages: true,
    comments: true,
    mentions: true,
    group_activity: true,
    announcements: true,
    events: true
  });

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  };

  // Fetch current notification settings
  const { data: profile, isLoading } = useQuery({
    queryKey: ['notification-settings'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('notification_settings')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    }
  });

  // Sync state when data is loaded
  useEffect(() => {
    if (profile?.notification_settings) {
      setSettings(prev => ({
        ...prev,
        ...profile.notification_settings
      }));
    }
  }, [profile]);

  // Handle auto-save
  const saveSettings = useCallback(async (newSettings: typeof settings) => {
    setIsSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update({ notification_settings: newSettings })
      .eq('id', user.id);

    setIsSaving(false);
    if (!error) {
      queryClient.setQueryData(['notification-settings'], { notification_settings: newSettings });
      showToast("Changes saved automatically");
    }
  }, [supabase, queryClient]);

  const handleUpdateSetting = (key: keyof typeof settings, val: boolean) => {
    const updated = { ...settings, [key]: val };
    setSettings(updated);
    saveSettings(updated);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-black pb-[100px] max-w-md mx-auto relative font-sans transition-colors">
      <AnimatePresence>
        {toast && <FloatingToast message={toast} />}
      </AnimatePresence>

      <div className="flex items-center justify-between px-6 py-4 sticky top-0 bg-[#F8F9FA]/80 dark:bg-black/80 backdrop-blur-md z-10 border-b border-zinc-100 dark:border-zinc-800/50">
        <button 
          onClick={() => router.back()}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition shadow-sm shrink-0 border border-transparent dark:border-zinc-800"
        >
          <ArrowLeft size={20} className="text-black dark:text-white" />
        </button>
        <div className="flex flex-col items-center">
          <span className="font-bold text-[14px] uppercase tracking-[0.2em] text-black dark:text-white">Notifications</span>
          {isSaving && <span className="text-[10px] font-bold text-[#ADFF2F] animate-pulse absolute -bottom-1">Saving...</span>}
        </div>
        <div className="w-10 h-10" />
      </div>

      <main className="px-4 pt-6 space-y-8">
        {/* Delivery Types */}
        <section>
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 px-4 shadow-none">
            Delivery Methods
          </h3>
          <div className="bg-white dark:bg-zinc-900 rounded-[24px] shadow-sm border border-zinc-100/50 dark:border-zinc-800/50 overflow-hidden transition-colors">
            <ToggleSetting 
              icon={Smartphone} 
              title="Push Notifications" 
              description="Receive alerts directly on your device."
              checked={settings.push}
              onChange={(val) => handleUpdateSetting('push', val)}
              disabled={isLoading}
            />
          </div>
        </section>

        {/* Social Alerts */}
        <section>
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 px-4 shadow-none">
            Social & Activity
          </h3>
          <div className="bg-white dark:bg-zinc-900 rounded-[24px] shadow-sm border border-zinc-100/50 dark:border-zinc-800/50 overflow-hidden transition-colors">
            <ToggleSetting 
              icon={MessageSquare} 
              title="Direct Messages" 
              description="When someone sends you a direct message."
              checked={settings.direct_messages}
              onChange={(val) => handleUpdateSetting('direct_messages', val)}
              disabled={isLoading}
            />
            <ToggleSetting 
              icon={MessageSquare} 
              title="Comments on My Posts" 
              description="When someone comments on a post you created."
              checked={settings.comments}
              onChange={(val) => handleUpdateSetting('comments', val)}
              disabled={isLoading}
            />
            <ToggleSetting 
              icon={AtSign} 
              title="Mentions" 
              description="When someone mentions you in a post or comment."
              checked={settings.mentions}
              onChange={(val) => handleUpdateSetting('mentions', val)}
              disabled={isLoading}
            />
          </div>
        </section>

        {/* Univas Alerts */}
        <section>
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 px-4 shadow-none">
            Univas & Groups
          </h3>
          <div className="bg-white dark:bg-zinc-900 rounded-[24px] shadow-sm border border-zinc-100/50 dark:border-zinc-800/50 overflow-hidden transition-colors">
            <ToggleSetting 
              icon={Users} 
              title="Group Activity" 
              description="New posts or messages in study groups you joined."
              checked={settings.group_activity}
              onChange={(val) => handleUpdateSetting('group_activity', val)}
              disabled={isLoading}
            />
            <ToggleSetting 
              icon={Megaphone} 
              title="Univas Announcements" 
              description="Official news and alerts from your university."
              checked={settings.announcements}
              onChange={(val) => handleUpdateSetting('announcements', val)}
              disabled={isLoading}
            />
            <ToggleSetting 
              icon={Calendar} 
              title="Event Reminders" 
              description="Reminders for upcoming academic events or deadlines."
              checked={settings.events}
              onChange={(val) => handleUpdateSetting('events', val)}
              disabled={isLoading}
            />
          </div>
        </section>
      </main>
    </div>
  );
}
