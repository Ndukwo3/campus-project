import { ArrowLeft, Building2, GraduationCap, Users, LogOut } from "lucide-react";
import Link from "next/link";

export default function CampusSettingsPage() {
  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-[100px] max-w-md mx-auto relative font-sans">
      <div className="flex items-center justify-between px-6 py-4 sticky top-0 bg-[#F8F9FA]/80 backdrop-blur-md z-10 border-b border-zinc-100">
        <Link href="/settings" className="w-10 h-10 flex items-center justify-center rounded-full bg-white hover:bg-zinc-50 transition shadow-sm shrink-0">
          <ArrowLeft size={20} className="text-black" />
        </Link>
        <span className="font-bold text-lg tracking-tight text-black">Campus Tools</span>
        <div className="w-10 h-10" />
      </div>

      <main className="px-4 pt-6 space-y-8">
        
        {/* Core Identity */}
        <section>
          <div className="bg-white rounded-[24px] shadow-sm border border-zinc-100/50 overflow-hidden px-4 py-5 flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-zinc-100 flex items-center justify-center shrink-0 border border-zinc-200 shadow-sm">
              <Building2 size={28} className="text-zinc-400" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-lg text-black leading-tight">Federal University of Technology, Owerri</span>
              <span className="text-sm font-bold text-[#E2FF3D] drop-shadow-sm mt-1">FUTO</span>
            </div>
          </div>
          <p className="text-[12px] text-zinc-400 mt-2 px-4 text-center">
            To change your campus, you must contact support with proof of enrollment.
          </p>
        </section>

        {/* Groups & Courses */}
        <section>
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 px-4 shadow-none">
            Your Communities
          </h3>
          <div className="bg-white rounded-[24px] shadow-sm border border-zinc-100/50 overflow-hidden">
            
            <Link href="#" className="flex items-center justify-between w-full px-4 py-4 border-b border-zinc-100 hover:bg-zinc-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                  <GraduationCap size={14} className="text-blue-500" />
                </div>
                <div className="flex flex-col items-start">
                  <span className="font-bold text-[15px] text-zinc-900">Department Groups</span>
                  <span className="text-[12px] text-zinc-500">Computer Science</span>
                </div>
              </div>
              <span className="text-[11px] font-bold text-black bg-[#E5FF66] px-2 py-0.5 rounded-full">2</span>
            </Link>

            <Link href="#" className="flex items-center justify-between w-full px-4 py-4 border-b border-zinc-100 hover:bg-zinc-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center">
                  <Users size={14} className="text-emerald-500" />
                </div>
                <div className="flex flex-col items-start">
                  <span className="font-bold text-[15px] text-zinc-900">Course Groups</span>
                  <span className="text-[12px] text-zinc-500">Active study groups</span>
                </div>
              </div>
              <span className="text-[11px] font-bold text-black bg-[#E5FF66] px-2 py-0.5 rounded-full">4</span>
            </Link>

          </div>
        </section>

        {/* Leave Campus */}
        <section className="px-2">
          <button className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 rounded-2xl py-4 font-bold text-[15px] hover:bg-red-100 transition-colors active:scale-95">
            <LogOut size={18} />
            Leave Campus Network
          </button>
        </section>

      </main>
    </div>
  );
}
