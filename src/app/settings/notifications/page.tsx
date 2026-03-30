"use client";

import { ArrowLeft, BellRing, Smartphone, Mail, MessageSquare, AtSign, Users, Megaphone, Calendar } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

// Reusable toggle component
function ToggleSetting({ 
  icon: Icon, 
  title, 
  description, 
  defaultChecked = true 
}: { 
  icon: any, 
  title: string, 
  description?: string, 
  defaultChecked?: boolean 
}) {
  const [enabled, setEnabled] = useState(defaultChecked);

  return (
    <div className="flex items-center justify-between px-4 py-4 border-b border-zinc-100 last:border-0 hover:bg-zinc-50/50 transition-colors cursor-pointer" onClick={() => setEnabled(!enabled)}>
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
        className={`w-12 h-6 rounded-full flex items-center p-1 shrink-0 transition-colors duration-300 ${enabled ? "bg-[#E5FF66]" : "bg-zinc-200"}`}
      >
        <div 
          className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform duration-300 ${enabled ? "translate-x-6 shadow-[0_0_8px_rgba(0,0,0,0.1)]" : "translate-x-0"}`} 
        />
      </div>
    </div>
  );
}

export default function NotificationsSettingsPage() {
  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-black pb-[100px] max-w-md mx-auto relative font-sans transition-colors">
      <div className="flex items-center justify-between px-6 py-4 sticky top-0 bg-[#F8F9FA]/80 dark:bg-black/80 backdrop-blur-md z-10 border-b border-zinc-100 dark:border-zinc-800/50">
        <Link href="/settings" className="w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition shadow-sm shrink-0 border border-transparent dark:border-zinc-800">
          <ArrowLeft size={20} className="text-black dark:text-white" />
        </Link>
        <span className="font-bold text-[14px] uppercase tracking-[0.2em] text-black dark:text-white">Notifications</span>
        <div className="w-10 h-10" />
      </div>

      <main className="px-4 pt-6 space-y-8">
        {/* Delivery Types */}
        <section>
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 px-4 shadow-none">
            Delivery Methods
          </h3>
          <div className="bg-white rounded-[24px] shadow-sm border border-zinc-100/50 overflow-hidden">
            <ToggleSetting 
              icon={Smartphone} 
              title="Push Notifications" 
              description="Receive alerts directly on your device."
              defaultChecked={true}
            />
            <ToggleSetting 
              icon={Mail} 
              title="Email Notifications" 
              description="Receive daily summaries and important alerts via email."
              defaultChecked={false}
            />
          </div>
        </section>

        {/* Social Alerts */}
        <section>
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 px-4 shadow-none">
            Social & Activity
          </h3>
          <div className="bg-white rounded-[24px] shadow-sm border border-zinc-100/50 overflow-hidden">
            <ToggleSetting 
              icon={MessageSquare} 
              title="Direct Messages" 
              description="When someone sends you a direct message."
            />
            <ToggleSetting 
              icon={MessageSquare} 
              title="Comments on My Posts" 
              description="When someone comments on a post you created."
            />
            <ToggleSetting 
              icon={AtSign} 
              title="Mentions" 
              description="When someone mentions you in a post or comment."
            />
          </div>
        </section>

        {/* Univas Alerts */}
        <section>
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 px-4 shadow-none">
            Univas & Groups
          </h3>
          <div className="bg-white rounded-[24px] shadow-sm border border-zinc-100/50 overflow-hidden">
            <ToggleSetting 
              icon={Users} 
              title="Group Activity" 
              description="New posts or messages in study groups you joined."
            />
            <ToggleSetting 
              icon={Megaphone} 
              title="Univas Announcements" 
              description="Official news and alerts from your university."
            />
            <ToggleSetting 
              icon={Calendar} 
              title="Event Reminders" 
              description="Reminders for upcoming academic events or deadlines."
            />
          </div>
        </section>
      </main>
    </div>
  );
}
