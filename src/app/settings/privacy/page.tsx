import { ArrowLeft, Globe, Users, Navigation, Eye, Hash, ShieldAlert } from "lucide-react";
import Link from "next/link";

export default function PrivacySettingsPage() {
  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-[100px] max-w-md mx-auto relative font-sans">
      <div className="flex items-center justify-between px-6 py-4 sticky top-0 bg-[#F8F9FA]/80 backdrop-blur-md z-10 border-b border-zinc-100">
        <Link href="/settings" className="w-10 h-10 flex items-center justify-center rounded-full bg-white hover:bg-zinc-50 transition shadow-sm shrink-0">
          <ArrowLeft size={20} className="text-black" />
        </Link>
        <span className="font-bold text-lg tracking-tight text-black">Privacy</span>
        <div className="w-10 h-10" />
      </div>

      <main className="px-4 pt-6 space-y-8">
        {/* Visibility */}
        <section>
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 px-4 shadow-none">
            Visibility & Reach
          </h3>
          <div className="bg-white rounded-[24px] shadow-sm border border-zinc-100/50 overflow-hidden">
            
            <div className="flex flex-col gap-1 px-4 py-3.5 border-b border-zinc-100">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-3">
                  <Globe size={18} className="text-zinc-500" />
                  <span className="font-bold text-[15px] text-zinc-900">Who can see my posts</span>
                </div>
              </div>
              <p className="text-[13px] text-zinc-500 mb-3 pl-8">Control the audience for your social feed posts.</p>
              <select className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3 px-4 text-[14px] font-medium text-black outline-none ml-8 max-w-[calc(100%-32px)]">
                <option>Everyone</option>
                <option selected>My Campus Only</option>
                <option>Connections Only</option>
              </select>
            </div>

            <div className="flex flex-col gap-1 px-4 py-3.5 border-b border-zinc-100">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-3">
                  <Eye size={18} className="text-zinc-500" />
                  <span className="font-bold text-[15px] text-zinc-900">Profile Visibility</span>
                </div>
              </div>
              <select className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3 px-4 text-[14px] font-medium text-black outline-none ml-8 max-w-[calc(100%-32px)]">
                <option>Public (Visible in search)</option>
                <option selected>Campus Only</option>
                <option>Hidden</option>
              </select>
            </div>
            
            <div className="flex flex-col gap-1 px-4 py-3.5">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-3">
                  <Users size={18} className="text-zinc-500" />
                  <span className="font-bold text-[15px] text-zinc-900">Who can see my followers</span>
                </div>
              </div>
              <select className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3 px-4 text-[14px] font-medium text-black outline-none ml-8 max-w-[calc(100%-32px)]">
                <option selected>Everyone</option>
                <option>Connections Only</option>
                <option>Only Me</option>
              </select>
            </div>

          </div>
        </section>

        {/* Interactions */}
        <section>
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 px-4 shadow-none">
            Interactions
          </h3>
          <div className="bg-white rounded-[24px] shadow-sm border border-zinc-100/50 overflow-hidden">
            
            <div className="flex flex-col gap-1 px-4 py-3.5 border-b border-zinc-100">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-3">
                  <Navigation size={18} className="text-zinc-500" />
                  <span className="font-bold text-[15px] text-zinc-900">Who can send me messages</span>
                </div>
              </div>
              <select className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3 px-4 text-[14px] font-medium text-black outline-none ml-8 max-w-[calc(100%-32px)]">
                <option selected>Everyone</option>
                <option>Connections Only</option>
                <option>No One</option>
              </select>
            </div>

            <div className="flex flex-col gap-1 px-4 py-3.5">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-3">
                  <Hash size={18} className="text-zinc-500" />
                  <span className="font-bold text-[15px] text-zinc-900">Who can tag me in posts</span>
                </div>
              </div>
              <select className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3 px-4 text-[14px] font-medium text-black outline-none ml-8 max-w-[calc(100%-32px)]">
                <option selected>Everyone</option>
                <option>Connections Only</option>
                <option>No One</option>
              </select>
            </div>

          </div>
        </section>

        {/* Blocking */}
        <section>
          <div className="bg-white rounded-[24px] shadow-sm border border-zinc-100/50 overflow-hidden">
            <Link href="/settings/activity" className="flex items-center justify-between px-4 py-4 hover:bg-zinc-50 transition-colors">
              <div className="flex items-center gap-3">
                <ShieldAlert size={18} className="text-red-500" />
                <span className="font-bold text-[15px] text-zinc-900">Blocked Users</span>
              </div>
              <span className="text-[13px] font-bold text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded-full">0</span>
            </Link>
          </div>
          <p className="text-[12px] text-zinc-400 mt-3 px-4 text-center">
            Blocked users cannot see your profile, posts, or send you messages.
          </p>
        </section>

      </main>
    </div>
  );
}
