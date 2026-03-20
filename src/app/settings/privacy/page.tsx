"use client";

import { ArrowLeft, Globe, Users, Navigation, Eye, Hash, ShieldAlert, X, AlertTriangle, CheckCircle } from "lucide-react";
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

function BlockedUsersModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-t-[32px] w-full max-w-md p-6 pb-10 space-y-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="font-black text-xl text-black">Blocked Users</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-zinc-100 hover:bg-zinc-200 transition">
            <X size={16} />
          </button>
        </div>
        <div className="flex flex-col items-center py-8 gap-2 text-center">
          <ShieldAlert size={40} className="text-zinc-300 mb-2" />
          <p className="font-bold text-zinc-500">No blocked users</p>
          <p className="text-[13px] text-zinc-400">Users you block will appear here.</p>
        </div>
      </div>
    </div>
  );
}

export default function PrivacySettingsPage() {
  const [postVisibility, setPostVisibility] = useState("My Campus Only");
  const [profileVisibility, setProfileVisibility] = useState("Campus Only");
  const [followerVisibility, setFollowerVisibility] = useState("Everyone");
  const [canMessage, setCanMessage] = useState("Everyone");
  const [canTag, setCanTag] = useState("Everyone");
  const [showBlocked, setShowBlocked] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = () => {
    showToast("Privacy settings saved!");
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-[100px] max-w-md mx-auto relative font-sans">
      {toast && <Toast message={toast} />}
      {showBlocked && <BlockedUsersModal onClose={() => setShowBlocked(false)} />}

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
            Visibility &amp; Reach
          </h3>
          <div className="bg-white rounded-[24px] shadow-sm border border-zinc-100/50 overflow-hidden">

            <div className="flex flex-col gap-1 px-4 py-3.5 border-b border-zinc-100">
              <div className="flex items-center gap-3 mb-1">
                <Globe size={18} className="text-zinc-500" />
                <span className="font-bold text-[15px] text-zinc-900">Who can see my posts</span>
              </div>
              <p className="text-[13px] text-zinc-500 mb-3 pl-7">Control the audience for your social feed posts.</p>
              <select
                value={postVisibility}
                onChange={e => setPostVisibility(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3 px-4 text-[14px] font-medium text-black outline-none ml-7 max-w-[calc(100%-28px)]"
              >
                <option>Everyone</option>
                <option>My Campus Only</option>
                <option>Connections Only</option>
              </select>
            </div>

            <div className="flex flex-col gap-1 px-4 py-3.5 border-b border-zinc-100">
              <div className="flex items-center gap-3 mb-1">
                <Eye size={18} className="text-zinc-500" />
                <span className="font-bold text-[15px] text-zinc-900">Profile Visibility</span>
              </div>
              <select
                value={profileVisibility}
                onChange={e => setProfileVisibility(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3 px-4 text-[14px] font-medium text-black outline-none ml-7 max-w-[calc(100%-28px)]"
              >
                <option>Public (Visible in search)</option>
                <option>Campus Only</option>
                <option>Hidden</option>
              </select>
            </div>

            <div className="flex flex-col gap-1 px-4 py-3.5">
              <div className="flex items-center gap-3 mb-1">
                <Users size={18} className="text-zinc-500" />
                <span className="font-bold text-[15px] text-zinc-900">Who can see my followers</span>
              </div>
              <select
                value={followerVisibility}
                onChange={e => setFollowerVisibility(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3 px-4 text-[14px] font-medium text-black outline-none ml-7 max-w-[calc(100%-28px)]"
              >
                <option>Everyone</option>
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
              <div className="flex items-center gap-3 mb-1">
                <Navigation size={18} className="text-zinc-500" />
                <span className="font-bold text-[15px] text-zinc-900">Who can send me messages</span>
              </div>
              <select
                value={canMessage}
                onChange={e => setCanMessage(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3 px-4 text-[14px] font-medium text-black outline-none ml-7 max-w-[calc(100%-28px)]"
              >
                <option>Everyone</option>
                <option>Connections Only</option>
                <option>No One</option>
              </select>
            </div>

            <div className="flex flex-col gap-1 px-4 py-3.5">
              <div className="flex items-center gap-3 mb-1">
                <Hash size={18} className="text-zinc-500" />
                <span className="font-bold text-[15px] text-zinc-900">Who can tag me in posts</span>
              </div>
              <select
                value={canTag}
                onChange={e => setCanTag(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3 px-4 text-[14px] font-medium text-black outline-none ml-7 max-w-[calc(100%-28px)]"
              >
                <option>Everyone</option>
                <option>Connections Only</option>
                <option>No One</option>
              </select>
            </div>
          </div>
        </section>

        {/* Blocking */}
        <section>
          <div className="bg-white rounded-[24px] shadow-sm border border-zinc-100/50 overflow-hidden">
            <button
              onClick={() => setShowBlocked(true)}
              className="flex items-center justify-between w-full px-4 py-4 hover:bg-zinc-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <ShieldAlert size={18} className="text-red-500" />
                <span className="font-bold text-[15px] text-zinc-900">Blocked Users</span>
              </div>
              <span className="text-[13px] font-bold text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded-full">0</span>
            </button>
          </div>
          <p className="text-[12px] text-zinc-400 mt-3 px-4 text-center">
            Blocked users cannot see your profile, posts, or send you messages.
          </p>
        </section>

        {/* Save */}
        <div className="pt-2 pb-8 px-2">
          <button
            onClick={handleSave}
            className="w-full bg-black text-white rounded-2xl py-4 font-bold text-[15px] shadow-lg hover:bg-zinc-800 transition-colors active:scale-95"
          >
            Save Privacy Settings
          </button>
        </div>
      </main>
    </div>
  );
}
