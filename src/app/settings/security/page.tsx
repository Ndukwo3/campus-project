"use client";

import { ArrowLeft, Key, ShieldCheck, Smartphone, Monitor, X, Eye, EyeOff, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-black text-white text-[14px] font-bold px-5 py-3 rounded-2xl shadow-xl animate-fade-in-up max-w-[90vw] text-center">
      {message}
    </div>
  );
}

function ChangePasswordModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [current, setCurrent] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!current) return setError("Please enter your current password.");
    if (newPass.length < 8) return setError("New password must be at least 8 characters.");
    if (newPass !== confirm) return setError("Passwords do not match.");
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-t-[32px] w-full max-w-md p-6 pb-10 space-y-5"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-black text-xl text-black">Change Password</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-zinc-100 hover:bg-zinc-200 transition">
            <X size={16} />
          </button>
        </div>

        {error && (
          <p className="text-[13px] font-bold text-red-600 bg-red-50 rounded-xl px-4 py-2">{error}</p>
        )}

        <div className="space-y-3">
          <div className="relative">
            <input
              type={showCurrent ? "text" : "password"}
              placeholder="Current password"
              value={current}
              onChange={e => setCurrent(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl py-3.5 px-4 text-[15px] font-medium text-black focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent pr-12"
            />
            <button onClick={() => setShowCurrent(!showCurrent)} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400">
              {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <div className="relative">
            <input
              type={showNew ? "text" : "password"}
              placeholder="New password (min. 8 chars)"
              value={newPass}
              onChange={e => setNewPass(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl py-3.5 px-4 text-[15px] font-medium text-black focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent pr-12"
            />
            <button onClick={() => setShowNew(!showNew)} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400">
              {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <div className="relative">
            <input
              type={showConfirm ? "text" : "password"}
              placeholder="Confirm new password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl py-3.5 px-4 text-[15px] font-medium text-black focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent pr-12"
            />
            <button onClick={() => setShowConfirm(!showConfirm)} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400">
              {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          className="w-full bg-black text-white rounded-2xl py-4 font-bold text-[15px] hover:bg-zinc-800 transition-colors active:scale-95"
        >
          Update Password
        </button>
      </div>
    </div>
  );
}

function ConfirmModal({
  title,
  description,
  confirmLabel,
  onConfirm,
  onClose,
}: {
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-6" onClick={onClose}>
      <div className="bg-white rounded-[28px] w-full max-w-sm p-6 space-y-4" onClick={e => e.stopPropagation()}>
        <div className="flex flex-col items-center text-center gap-2">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-1">
            <AlertTriangle size={22} className="text-red-600" />
          </div>
          <h2 className="font-black text-xl text-black">{title}</h2>
          <p className="text-[14px] text-zinc-500">{description}</p>
        </div>
        <div className="flex gap-3 pt-2">
          <button onClick={onClose} className="flex-1 bg-zinc-100 text-zinc-700 rounded-2xl py-3.5 font-bold text-[15px] hover:bg-zinc-200 transition">
            Cancel
          </button>
          <button
            onClick={() => { onConfirm(); onClose(); }}
            className="flex-1 bg-red-600 text-white rounded-2xl py-3.5 font-bold text-[15px] hover:bg-red-700 transition active:scale-95"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SecuritySettingsPage() {
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-black pb-[100px] max-w-md mx-auto relative font-sans transition-colors">
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      {showChangePassword && (
        <ChangePasswordModal
          onClose={() => setShowChangePassword(false)}
          onSuccess={() => showToast("✅ Password updated successfully!")}
        />
      )}
      {showLogoutConfirm && (
        <ConfirmModal
          title="Log out everywhere?"
          description="You'll be signed out of all other devices. This device won't be affected."
          confirmLabel="Log Out"
          onConfirm={() => showToast("✅ Logged out of all other devices.")}
          onClose={() => setShowLogoutConfirm(false)}
        />
      )}

      <div className="flex items-center justify-between px-6 py-4 sticky top-0 bg-[#F8F9FA]/80 dark:bg-black/80 backdrop-blur-md z-10 border-b border-zinc-100 dark:border-zinc-800/50">
        <Link href="/settings" className="w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition shadow-sm shrink-0 border border-transparent dark:border-zinc-800">
          <ArrowLeft size={20} className="text-black dark:text-white" />
        </Link>
        <span className="font-bold text-[14px] uppercase tracking-[0.2em] text-black dark:text-white">Security</span>
        <div className="w-10 h-10" />
      </div>

      <main className="px-4 pt-6 space-y-8">

        {/* Authentication Options */}
        <section>
          <div className="bg-white dark:bg-zinc-900 rounded-[24px] shadow-sm border border-zinc-100/50 dark:border-zinc-800/50 overflow-hidden">

            <button
              onClick={() => setShowChangePassword(true)}
              className="flex items-center justify-between w-full px-4 py-5 border-b border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-zinc-50 dark:bg-black flex items-center justify-center border border-zinc-100 dark:border-zinc-800">
                  <Key size={16} className="text-zinc-600 dark:text-zinc-400" />
                </div>
                <div className="flex flex-col items-start">
                  <span className="font-bold text-[15px] text-zinc-900 dark:text-zinc-100">Change Password</span>
                  <span className="text-[12px] text-zinc-500 dark:text-zinc-500">Update your account password</span>
                </div>
              </div>
            </button>

            <button
              onClick={() => {
                setTwoFAEnabled(!twoFAEnabled);
                showToast(twoFAEnabled ? "Two-Factor Auth disabled." : "✅ Two-Factor Auth enabled!");
              }}
              className="flex items-center justify-between w-full px-4 py-5 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-zinc-50 dark:bg-black flex items-center justify-center border border-zinc-100 dark:border-zinc-800">
                  <ShieldCheck size={16} className={twoFAEnabled ? "text-emerald-500" : "text-zinc-600 dark:text-zinc-400"} />
                </div>
                <div className="flex flex-col items-start">
                  <span className="font-bold text-[15px] text-zinc-900 dark:text-zinc-100">Two-Factor Auth</span>
                  <span className="text-[12px] text-zinc-500 dark:text-zinc-500">Add an extra layer of security</span>
                </div>
              </div>
              <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full ${twoFAEnabled ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10" : "text-zinc-400 bg-zinc-100 dark:bg-black border border-zinc-200 dark:border-zinc-800"}`}>
                {twoFAEnabled ? "Active" : "Off"}
              </span>
            </button>

          </div>
        </section>

        {/* Login Activity */}
        <section>
          <h3 className="text-[10px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.2em] mb-3 px-4 shadow-none">
            Where you're logged in
          </h3>
          <div className="bg-white dark:bg-zinc-900 rounded-[24px) shadow-sm border border-zinc-100/50 dark:border-zinc-800/50 overflow-hidden">

            <div className="flex items-start gap-4 px-4 py-5 border-b border-zinc-100 dark:border-zinc-800/50">
              <Smartphone size={24} className="text-emerald-500 mt-1 shrink-0" />
              <div className="flex flex-col">
                <span className="font-bold text-[15px] text-zinc-900 dark:text-zinc-100">iPhone 14 Pro</span>
                <span className="text-[13px] text-zinc-500 dark:text-zinc-500">Lagos, Nigeria • Active now</span>
                <div className="flex items-center gap-1.5 mt-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                   <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Current Device</span>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-4 px-4 py-5">
              <Monitor size={24} className="text-zinc-400 dark:text-zinc-600 mt-1 shrink-0" />
              <div className="flex flex-col flex-1">
                <span className="font-bold text-[15px] text-zinc-900 dark:text-zinc-100">Chrome on Windows</span>
                <span className="text-[13px] text-zinc-500 dark:text-zinc-500">Abuja, Nigeria • Yesterday</span>
              </div>
            </div>

          </div>
        </section>

        <section className="px-2">
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full bg-red-50 dark:bg-red-500/5 text-red-600 rounded-2xl py-4 font-black text-[15px] border border-red-100/50 dark:border-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/10 transition-all active:scale-[0.98]"
          >
            Log out of all devices
          </button>
        </section>

      </main>
    </div>
  );
}
