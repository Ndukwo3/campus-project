"use client";

import { ArrowLeft, Key, ShieldCheck, Smartphone, Monitor, X, Eye, EyeOff, AlertTriangle, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

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
  const [isUpdating, setIsUpdating] = useState(false);
  const supabase = createClient();

  const handleSubmit = async () => {
    setError("");
    if (!current) return setError("Please enter your current password.");
    if (newPass.length < 8) return setError("New password must be at least 8 characters.");
    if (newPass !== confirm) return setError("Passwords do not match.");

    setIsUpdating(true);
    try {
      // 1. Get current user's email
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) throw new Error("Could not find user email.");

      // 2. Re-authenticate to verify the current password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: current
      });

      if (signInError) throw new Error("Incorrect current password.");

      // 3. If verified, update the password
      const { error: updateError } = await supabase.auth.updateUser({ 
        password: newPass 
      });

      if (updateError) throw updateError;
      
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Password update error:", err);
      setError(err.message || "Failed to update password.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white dark:bg-zinc-900 rounded-t-[32px] w-full max-w-md p-6 pb-10 space-y-5 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-black text-xl text-black dark:text-white">Change Password</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 transition">
            <X size={16} className="text-black dark:text-white" />
          </button>
        </div>

        {error && (
          <p className="text-[13px] font-bold text-red-600 bg-red-50 dark:bg-red-500/10 rounded-xl px-4 py-2">{error}</p>
        )}

        <div className="space-y-3 font-sans">
          <div className="relative">
            <input
              type={showCurrent ? "text" : "password"}
              placeholder="Current password"
              value={current}
              onChange={e => setCurrent(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-2xl py-3.5 px-4 text-[15px] font-medium text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-[#E2FF3D]/50 focus:border-transparent pr-12"
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
              className="w-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-2xl py-3.5 px-4 text-[15px] font-medium text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-[#E2FF3D]/50 focus:border-transparent pr-12"
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
              className="w-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-2xl py-3.5 px-4 text-[15px] font-medium text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-[#E2FF3D]/50 focus:border-transparent pr-12"
            />
            <button onClick={() => setShowConfirm(!showConfirm)} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400">
              {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={isUpdating}
          className="w-full bg-black dark:bg-[#E2FF3D] text-white dark:text-black rounded-2xl py-4 font-black text-[15px] hover:bg-zinc-800 transition-all active:scale-95 disabled:opacity-50 uppercase tracking-widest flex items-center justify-center gap-2"
        >
          {isUpdating ? "Checking..." : "Update Password"}
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
  isLoading = false
}: {
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => void;
  onClose: () => void;
  isLoading?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-6" onClick={onClose}>
      <div className="bg-white dark:bg-zinc-900 rounded-[28px] w-full max-w-sm p-6 space-y-4" onClick={e => e.stopPropagation()}>
        <div className="flex flex-col items-center text-center gap-2">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-500/10 flex items-center justify-center mb-1">
            <AlertTriangle size={22} className="text-red-600" />
          </div>
          <h2 className="font-black text-xl text-black dark:text-white">{title}</h2>
          <p className="text-[14px] text-zinc-500 dark:text-zinc-400">{description}</p>
        </div>
        <div className="flex gap-3 pt-2">
          <button onClick={onClose} className="flex-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-2xl py-3.5 font-bold text-[15px] hover:bg-zinc-200 transition">
            Cancel
          </button>
          <button
            onClick={() => onConfirm()}
            disabled={isLoading}
            className="flex-1 bg-red-600 text-white rounded-2xl py-3.5 font-bold text-[15px] hover:bg-red-700 transition active:scale-95 disabled:opacity-50 flex items-center justify-center"
          >
            {isLoading ? "Signing out..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SecuritySettingsPage() {
  const router = useRouter();
  const supabase = createClient();
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  
  const [sessions, setSessions] = useState<any[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  useEffect(() => {
    setCurrentSessionId(localStorage.getItem("univas_session_id"));

    const fetchSessions = async () => {
      const { data } = await supabase.from("user_sessions").select("*").order("last_active", { ascending: false });
      if (data) setSessions(data);
    };

    fetchSessions();

    // ⚡️ Real-time subscription
    const channel = supabase
      .channel("user_sessions_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "user_sessions" }, () => {
        fetchSessions();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleRemoteLogout = async (sessionId: string) => {
    try {
      const { error } = await supabase.from("user_sessions").delete().eq("session_id", sessionId);
      if (error) throw error;
      showToast("✅ Device signed out remotely.");
    } catch (err) {
      showToast("❌ Failed to sign out device.");
    }
  };

  const handleGlobalLogout = async () => {
    setIsLoggingOut(true);
    try {
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      if (error) throw error;
      showToast("✅ Logged out of all devices.");
      setShowLogoutConfirm(false);
      router.push("/welcome");
    } catch (err: any) {
      console.error("Logout error:", err);
      showToast("❌ Failed to log out.");
    } finally {
      setIsLoggingOut(false);
    }
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
          description="You'll be signed out of all other devices including this one. You'll need to log back in."
          confirmLabel="Log Out"
          onConfirm={handleGlobalLogout}
          onClose={() => setShowLogoutConfirm(false)}
          isLoading={isLoggingOut}
        />
      )}

      <div className="flex items-center justify-between px-6 py-4 sticky top-0 bg-[#F8F9FA]/80 dark:bg-black/80 backdrop-blur-md z-10 border-b border-zinc-100 dark:border-zinc-800/50">
        <button 
          onClick={() => router.back()}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition shadow-sm shrink-0 border border-transparent dark:border-zinc-800"
        >
          <ArrowLeft size={20} className="text-black dark:text-white" />
        </button>
        <span className="font-bold text-[14px] uppercase tracking-[0.2em] text-black dark:text-white">Security</span>
        <div className="w-10 h-10" />
      </div>

      <main className="px-4 pt-6 space-y-8">
        <section>
          <div className="bg-white dark:bg-zinc-900 rounded-[24px] shadow-sm border border-zinc-100/50 dark:border-zinc-800/50 overflow-hidden">
            <button
              onClick={() => setShowChangePassword(true)}
              className="flex items-center justify-between w-full px-4 py-5 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-zinc-50 dark:bg-black flex items-center justify-center border border-zinc-100 dark:border-zinc-800">
                  <Key size={16} className="text-zinc-600 dark:text-zinc-400" />
                </div>
                <div className="flex flex-col items-start text-left">
                  <span className="font-bold text-[15px] text-zinc-900 dark:text-zinc-100">Change Password</span>
                  <span className="text-[12px] text-zinc-500 dark:text-zinc-500">Update your account password</span>
                </div>
              </div>
            </button>
          </div>
        </section>

        <section>
          <h3 className="text-[10px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.2em] mb-3 px-4">
            Where you're logged in
          </h3>
          <div className="bg-white dark:bg-zinc-900 rounded-[24px] shadow-sm border border-zinc-100/50 dark:border-zinc-800/50 overflow-hidden divide-y divide-zinc-100 dark:divide-zinc-800/50">
            {sessions.map((session) => {
              const isCurrent = session.session_id === currentSessionId;
              const Icon = session.device_name.includes("MacBook") || session.device_name.includes("PC") ? Monitor : Smartphone;

              return (
                <div key={session.id} className="flex items-start justify-between p-5 group">
                  <div className="flex gap-4">
                    <Icon size={24} className={isCurrent ? "text-emerald-500" : "text-zinc-400 dark:text-zinc-600"} />
                    <div className="flex flex-col">
                      <span className="font-bold text-[15px] text-zinc-900 dark:text-zinc-100">{session.device_name}</span>
                      <span className="text-[13px] text-zinc-500 dark:text-zinc-500">
                        {session.city}, {session.country} • {isCurrent ? "Active now" : "Last seen " + new Date(session.last_active).toLocaleDateString()}
                      </span>
                      {isCurrent && (
                        <div className="flex items-center gap-1.5 mt-2">
                           <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                           <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Current Device</span>
                         </div>
                      )}
                    </div>
                  </div>
                  
                  {!isCurrent && (
                    <button 
                      onClick={() => handleRemoteLogout(session.session_id)}
                      className="text-[10px] font-black uppercase tracking-widest text-red-600/60 hover:text-red-600 transition p-2 opacity-0 group-hover:opacity-100"
                    >
                      Sign Out
                    </button>
                  )}
                </div>
              );
            })}
            
            {sessions.length === 0 && (
              <div className="p-10 text-center text-[12px] font-bold text-zinc-400 uppercase tracking-widest">
                No active sessions found
              </div>
            )}
          </div>
        </section>

        <section className="px-2 pb-10">
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full bg-red-50 dark:bg-red-500/5 text-red-600 rounded-2xl py-4 font-black text-[15px] border border-red-100/50 dark:border-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/10 transition-all active:scale-[0.98] uppercase tracking-widest"
          >
            Log out of all devices
          </button>
        </section>
      </main>
    </div>
  );
}
