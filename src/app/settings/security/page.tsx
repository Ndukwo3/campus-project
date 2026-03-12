import { ArrowLeft, Key, ShieldCheck, Smartphone, Monitor } from "lucide-react";
import Link from "next/link";

export default function SecuritySettingsPage() {
  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-[100px] max-w-md mx-auto relative font-sans">
      <div className="flex items-center justify-between px-6 py-4 sticky top-0 bg-[#F8F9FA]/80 backdrop-blur-md z-10 border-b border-zinc-100">
        <Link href="/settings" className="w-10 h-10 flex items-center justify-center rounded-full bg-white hover:bg-zinc-50 transition shadow-sm shrink-0">
          <ArrowLeft size={20} className="text-black" />
        </Link>
        <span className="font-bold text-lg tracking-tight text-black">Security</span>
        <div className="w-10 h-10" />
      </div>

      <main className="px-4 pt-6 space-y-8">
        
        {/* Authentication Options */}
        <section>
          <div className="bg-white rounded-[24px] shadow-sm border border-zinc-100/50 overflow-hidden">
            
            <button className="flex items-center justify-between w-full px-4 py-4 border-b border-zinc-100 hover:bg-zinc-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center">
                  <Key size={14} className="text-zinc-600" />
                </div>
                <div className="flex flex-col items-start">
                  <span className="font-bold text-[15px] text-zinc-900">Change Password</span>
                  <span className="text-[12px] text-zinc-500">Update your account password</span>
                </div>
              </div>
            </button>

            <button className="flex items-center justify-between w-full px-4 py-4 hover:bg-zinc-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center">
                  <ShieldCheck size={14} className="text-zinc-600" />
                </div>
                <div className="flex flex-col items-start">
                  <span className="font-bold text-[15px] text-zinc-900">Two-Factor Auth</span>
                  <span className="text-[12px] text-zinc-500">Add an extra layer of security</span>
                </div>
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-red-500 bg-red-50 px-2 py-1 rounded-md">Off</span>
            </button>

          </div>
        </section>

        {/* Login Activity */}
        <section>
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 px-4 shadow-none">
            Where you're logged in
          </h3>
          <div className="bg-white rounded-[24px] shadow-sm border border-zinc-100/50 overflow-hidden">
            
            <div className="flex items-start gap-4 px-4 py-4 border-b border-zinc-100">
              <Smartphone size={24} className="text-emerald-500 mt-1 shrink-0" />
              <div className="flex flex-col">
                <span className="font-bold text-[15px] text-zinc-900">iPhone 14 Pro</span>
                <span className="text-[13px] text-zinc-500">Lagos, Nigeria • Active now</span>
                <span className="text-[11px] font-bold text-emerald-500 mt-1">Current Device</span>
              </div>
            </div>

            <div className="flex items-start gap-4 px-4 py-4">
              <Monitor size={24} className="text-zinc-400 mt-1 shrink-0" />
              <div className="flex flex-col">
                <span className="font-bold text-[15px] text-zinc-900">Chrome on Windows</span>
                <span className="text-[13px] text-zinc-500">Abuja, Nigeria • Yesterday</span>
              </div>
            </div>

          </div>
        </section>

        <section className="px-2">
          <button className="w-full bg-red-50 text-red-600 rounded-2xl py-4 font-bold text-[15px] hover:bg-red-100 transition-colors">
            Log out of all devices
          </button>
        </section>

      </main>
    </div>
  );
}
