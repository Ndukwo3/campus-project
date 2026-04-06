"use client";

import { ArrowLeft, MessageSquarePlus, Download, CheckCheck, MessagesSquare } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

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

export default function MessagingSettingsPage() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-black pb-[100px] max-w-md mx-auto relative font-sans transition-colors">
      <div className="flex items-center justify-between px-6 py-4 sticky top-0 bg-[#F8F9FA]/80 dark:bg-black/80 backdrop-blur-md z-10 border-b border-zinc-100 dark:border-zinc-800/50">
        <button 
          onClick={() => router.back()}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition shadow-sm shrink-0 border border-transparent dark:border-zinc-800"
        >
          <ArrowLeft size={20} className="text-black dark:text-white" />
        </button>
        <span className="font-bold text-[14px] uppercase tracking-[0.2em] text-black dark:text-white">Messaging</span>
        <div className="w-10 h-10" />
      </div>

      <main className="px-4 pt-6 space-y-8">
        
        {/* Rules */}
        <section>
          <div className="bg-white rounded-[24px] shadow-sm border border-zinc-100/50 overflow-hidden">
            
            <div className="flex flex-col gap-1 px-4 py-3.5 border-b border-zinc-100">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-3">
                  <MessagesSquare size={18} className="text-zinc-500" />
                  <span className="font-bold text-[15px] text-zinc-900">Who can message me</span>
                </div>
              </div>
              <select className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3 px-4 text-[14px] font-medium text-black outline-none ml-8 max-w-[calc(100%-32px)]">
                <option selected>Everyone on Univas</option>
                <option>Only People I Follow</option>
                <option>No One</option>
              </select>
            </div>

            <ToggleSetting 
              icon={MessageSquarePlus} 
              title="Message Requests" 
              description="Allow people you don't follow to send message requests."
              defaultChecked={true}
            />

          </div>
        </section>

        {/* Chat Features */}
        <section>
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 px-4 shadow-none">
            Chat Features
          </h3>
          <div className="bg-white rounded-[24px] shadow-sm border border-zinc-100/50 overflow-hidden">
            <ToggleSetting 
              icon={CheckCheck} 
              title="Read Receipts" 
              description="Let people know when you've seen their messages."
              defaultChecked={true}
            />
            <ToggleSetting 
              icon={Download} 
              title="Auto Download Media" 
              description="Photos and videos will download automatically over Wi-Fi."
              defaultChecked={false}
            />
          </div>
        </section>

      </main>
    </div>
  );
}
