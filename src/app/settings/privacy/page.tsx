"use client";

import { ArrowLeft, Globe, Users, Navigation, Eye, Hash, ShieldAlert, X, AlertTriangle, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

function Toast({ message }: { message: string }) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-black text-white text-[14px] font-bold px-5 py-3 rounded-2xl shadow-xl max-w-[90vw] text-center flex items-center gap-2">
      <CheckCircle size={16} className="text-[#E5FF66] shrink-0" />
      {message}
    </div>
  );
}


export default function PrivacySettingsPage() {
  const router = useRouter();
  const supabase = createClient();
  const queryClient = useQueryClient();
  
  const [postVisibility, setPostVisibility] = useState("My Univas Only");
  const [profileVisibility, setProfileVisibility] = useState("Univas Only");
  const [followerVisibility, setFollowerVisibility] = useState("Everyone");
  const [canMessage, setCanMessage] = useState("Everyone");
  const [canTag, setCanTag] = useState("Everyone");
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['privacy-settings'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data } = await supabase
        .from('profiles')
        .select('post_visibility, profile_visibility, follower_visibility, can_message, can_tag')
        .eq('id', user.id)
        .single();
      return data;
    }
  });

  useEffect(() => {
    if (profile) {
      setPostVisibility(profile.post_visibility || "My Univas Only");
      setProfileVisibility(profile.profile_visibility || "Univas Only");
      setFollowerVisibility(profile.follower_visibility || "Everyone");
      setCanMessage(profile.can_message || "Everyone");
      setCanTag(profile.can_tag || "Everyone");
    }
  }, [profile]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = async () => {
    setIsSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update({
        post_visibility: postVisibility,
        profile_visibility: profileVisibility,
        follower_visibility: followerVisibility,
        can_message: canMessage,
        can_tag: canTag
      })
      .eq('id', user.id);

    setIsSaving(false);
    if (error) {
      showToast("❌ Failed to save! Try again.");
    } else {
      queryClient.invalidateQueries({ queryKey: ['privacy-settings'] });
      queryClient.invalidateQueries({ queryKey: ['profile-settings'] });
      showToast("Privacy settings saved!");
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-black pb-[100px] max-w-md mx-auto relative font-sans transition-colors">
      {toast && <Toast message={toast} />}

      <div className="flex items-center justify-between px-6 py-4 sticky top-0 bg-[#F8F9FA]/80 dark:bg-black/80 backdrop-blur-md z-10 border-b border-zinc-100 dark:border-zinc-800/50">
        <button 
          onClick={() => router.back()}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition shadow-sm shrink-0 border border-transparent dark:border-zinc-800"
        >
          <ArrowLeft size={20} className="text-black dark:text-white" />
        </button>
        <span className="font-bold text-[14px] uppercase tracking-[0.2em] text-black dark:text-white">Privacy</span>
        <div className="w-10 h-10" />
      </div>

      <main className="px-4 pt-6 space-y-8">
        {/* Visibility */}
        <section>
          <h3 className="text-[10px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.2em] mb-3 px-4 shadow-none">
            Visibility & Reach
          </h3>
          <div className="bg-white dark:bg-zinc-900 rounded-[24px] shadow-sm border border-zinc-100/50 dark:border-zinc-800/50 overflow-hidden">

            <div className="flex flex-col gap-1 px-4 py-4 border-b border-zinc-100 dark:border-zinc-800/50">
              <div className="flex items-center gap-3 mb-1">
                <Globe size={18} className="text-zinc-500 dark:text-zinc-400" />
                <span className="font-bold text-[15px] text-zinc-900 dark:text-zinc-100">Who can see my posts</span>
              </div>
              <p className="text-[13px] text-zinc-500 dark:text-zinc-400 mb-3 pl-7 leading-relaxed">Control the audience for your social feed posts.</p>
              <select
                value={postVisibility}
                onChange={e => setPostVisibility(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-xl py-3 px-4 text-[14px] font-bold text-black dark:text-white outline-none ml-7 max-w-[calc(100%-28px)] appearance-none"
              >
                <option>Everyone</option>
                <option>My Univas Only</option>
                <option>Connections Only</option>
              </select>
            </div>

            <div className="flex flex-col gap-1 px-4 py-4 border-b border-zinc-100 dark:border-zinc-800/50">
              <div className="flex items-center gap-3 mb-1">
                <Eye size={18} className="text-zinc-500 dark:text-zinc-400" />
                <span className="font-bold text-[15px] text-zinc-900 dark:text-zinc-100">Profile Visibility</span>
              </div>
              <select
                value={profileVisibility}
                onChange={e => setProfileVisibility(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-xl py-3 px-4 text-[14px] font-bold text-black dark:text-white outline-none ml-7 max-w-[calc(100%-28px)] appearance-none"
              >
                <option>Public (Visible in search)</option>
                <option>Univas Only</option>
                <option>Hidden</option>
              </select>
            </div>

            <div className="flex flex-col gap-1 px-4 py-4">
              <div className="flex items-center gap-3 mb-1">
                <Users size={18} className="text-zinc-500 dark:text-zinc-400" />
                <span className="font-bold text-[15px] text-zinc-900 dark:text-zinc-100">Who can see my followers</span>
              </div>
              <select
                value={followerVisibility}
                onChange={e => setFollowerVisibility(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-xl py-3 px-4 text-[14px] font-bold text-black dark:text-white outline-none ml-7 max-w-[calc(100%-28px)] appearance-none"
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
          <h3 className="text-[10px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.2em] mb-3 px-4 shadow-none">
            Interactions
          </h3>
          <div className="bg-white dark:bg-zinc-900 rounded-[24px] shadow-sm border border-zinc-100/50 dark:border-zinc-800/50 overflow-hidden">

            <div className="flex flex-col gap-1 px-4 py-4 border-b border-zinc-100 dark:border-zinc-800/50">
              <div className="flex items-center gap-3 mb-1">
                <Navigation size={18} className="text-zinc-500 dark:text-zinc-400" />
                <span className="font-bold text-[15px] text-zinc-900 dark:text-zinc-100">Who can send me messages</span>
              </div>
              <select
                value={canMessage}
                onChange={e => setCanMessage(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-xl py-3 px-4 text-[14px] font-bold text-black dark:text-white outline-none ml-7 max-w-[calc(100%-28px)] appearance-none"
              >
                <option>Everyone</option>
                <option>Connections Only</option>
                <option>No One</option>
              </select>
            </div>

            <div className="flex flex-col gap-1 px-4 py-4">
              <div className="flex items-center gap-3 mb-1">
                <Hash size={18} className="text-zinc-500 dark:text-zinc-400" />
                <span className="font-bold text-[15px] text-zinc-900 dark:text-zinc-100">Who can tag me in posts</span>
              </div>
              <select
                value={canTag}
                onChange={e => setCanTag(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-xl py-3 px-4 text-[14px] font-bold text-black dark:text-white outline-none ml-7 max-w-[calc(100%-28px)] appearance-none"
              >
                <option>Everyone</option>
                <option>Connections Only</option>
                <option>No One</option>
              </select>
            </div>
          </div>
        </section>


        {/* Save */}
        <div className="pt-2 pb-8 px-2">
          <button
            onClick={handleSave}
            disabled={isSaving || isLoading}
            className="w-full bg-zinc-900 dark:bg-[#E5FF66] text-white dark:text-black rounded-2xl py-4 font-black text-[15px] shadow-lg shadow-zinc-200 dark:shadow-none hover:opacity-90 transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {isSaving && <Loader2 className="animate-spin" size={18} />}
            {isSaving ? "Saving Visibility..." : "Save Privacy Settings"}
          </button>
        </div>
      </main>
    </div>
  );
}
