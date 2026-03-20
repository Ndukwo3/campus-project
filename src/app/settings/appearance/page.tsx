"use client";

import { ArrowLeft, Moon, Sun, Type, Languages, CircleDashed, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

function Toast({ message }: { message: string }) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-black text-white text-[14px] font-bold px-5 py-3 rounded-2xl shadow-xl max-w-[90vw] text-center flex items-center gap-2">
      <CheckCircle size={16} className="text-[#E5FF66] shrink-0" />
      {message}
    </div>
  );
}

export default function AppearanceSettingsPage() {
  const [theme, setTheme] = useState("system");
  const [fontSize, setFontSize] = useState("Medium (Default)");
  const [language, setLanguage] = useState("English (UK)");
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-[100px] max-w-md mx-auto relative font-sans">
      {toast && <Toast message={toast} />}

      <div className="flex items-center justify-between px-6 py-4 sticky top-0 bg-[#F8F9FA]/80 backdrop-blur-md z-10 border-b border-zinc-100">
        <Link href="/settings" className="w-10 h-10 flex items-center justify-center rounded-full bg-white hover:bg-zinc-50 transition shadow-sm shrink-0">
          <ArrowLeft size={20} className="text-black" />
        </Link>
        <span className="font-bold text-lg tracking-tight text-black">Appearance</span>
        <div className="w-10 h-10" />
      </div>

      <main className="px-4 pt-6 space-y-8">

        {/* Theme Settings */}
        <section>
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 px-4 shadow-none">
            Color Theme
          </h3>
          <div className="bg-white rounded-[24px] shadow-sm border border-zinc-100/50 p-4">
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setTheme("light")}
                className={`flex flex-col items-center justify-center gap-2 p-3 rounded-2xl transition-all border-2 ${theme === "light" ? "border-[#E5FF66] bg-[#E5FF66]/5" : "border-transparent bg-zinc-50 hover:bg-zinc-100"}`}
              >
                <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                  <Sun size={20} className="text-yellow-600" />
                </div>
                <span className="font-bold text-[13px] text-zinc-900">Light</span>
              </button>

              <button
                onClick={() => setTheme("dark")}
                className={`flex flex-col items-center justify-center gap-2 p-3 rounded-2xl transition-all border-2 ${theme === "dark" ? "border-[#E5FF66] bg-[#E5FF66]/5" : "border-transparent bg-zinc-50 hover:bg-zinc-100"}`}
              >
                <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center">
                  <Moon size={20} className="text-white" />
                </div>
                <span className="font-bold text-[13px] text-zinc-900">Dark</span>
              </button>

              <button
                onClick={() => setTheme("system")}
                className={`flex flex-col items-center justify-center gap-2 p-3 rounded-2xl transition-all border-2 ${theme === "system" ? "border-[#E5FF66] bg-[#E5FF66]/5" : "border-transparent bg-zinc-50 hover:bg-zinc-100"}`}
              >
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <CircleDashed size={20} className="text-blue-600" />
                </div>
                <span className="font-bold text-[13px] text-zinc-900">System</span>
              </button>
            </div>
          </div>
        </section>

        {/* Text Settings */}
        <section>
          <div className="bg-white rounded-[24px] shadow-sm border border-zinc-100/50 overflow-hidden">

            <div className="flex flex-col gap-1 px-4 py-3.5 border-b border-zinc-100">
              <div className="flex items-center gap-3 mb-1">
                <Type size={18} className="text-zinc-500" />
                <span className="font-bold text-[15px] text-zinc-900">Font Size</span>
              </div>
              <select
                value={fontSize}
                onChange={e => setFontSize(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3 px-4 text-[14px] font-medium text-black outline-none ml-7 max-w-[calc(100%-28px)]"
              >
                <option>Small</option>
                <option>Medium (Default)</option>
                <option>Large</option>
                <option>Extra Large</option>
              </select>
            </div>

            <div className="flex flex-col gap-1 px-4 py-3.5">
              <div className="flex items-center gap-3 mb-1">
                <Languages size={18} className="text-zinc-500" />
                <span className="font-bold text-[15px] text-zinc-900">Language</span>
              </div>
              <select
                value={language}
                onChange={e => setLanguage(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3 px-4 text-[14px] font-medium text-black outline-none ml-7 max-w-[calc(100%-28px)]"
              >
                <option>English (UK)</option>
                <option>English (US)</option>
                <option>French (Français)</option>
                <option>Pidgin</option>
              </select>
            </div>

          </div>
        </section>

        {/* Save */}
        <div className="pt-2 pb-8 px-2">
          <button
            onClick={() => showToast("Appearance settings saved!")}
            className="w-full bg-black text-white rounded-2xl py-4 font-bold text-[15px] shadow-lg hover:bg-zinc-800 transition-colors active:scale-95"
          >
            Save Appearance
          </button>
        </div>

      </main>
    </div>
  );
}
