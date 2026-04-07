"use client";

import {
  ArrowLeft, User, Camera, Mail, Phone, Calendar,
  BookOpen, GraduationCap, MapPin, CheckCircle, Loader2
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { useQuery, useQueryClient } from "@tanstack/react-query";

function Toast({ message }: { message: string }) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-black text-white text-[14px] font-bold px-5 py-3 rounded-2xl shadow-xl max-w-[90vw] text-center flex items-center gap-2">
      <CheckCircle size={16} className="text-[#E5FF66] shrink-0" />
      {message}
    </div>
  );
}

export default function AccountSettingsPage() {
  const router = useRouter();
  const supabase = createClient();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // loading & saving states
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Profile data
  const [userId, setUserId] = useState<string>("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [email, setEmail] = useState("");
  const [level, setLevel] = useState("100 Level");
  const [department, setDepartment] = useState("");
  const [universityName, setUniversityName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // Real-time Query Sync
  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile-account'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return null; }
      
      setUserId(user.id);
      setEmail(user.email ?? "");

      const { data } = await supabase
        .from("profiles")
        .select("*, universities(name), departments(name)")
        .eq("id", user.id)
        .single();
      
      return data;
    }
  });

  // sync form state when data is loaded
  useEffect(() => {
    if (profile) {
      // 1. Name values: Use split fields if available, otherwise fallback to splitting full_name
      if (profile.first_name) setFirstName(profile.first_name);
      if (profile.last_name) setLastName(profile.last_name);
      
      if (!profile.first_name && !profile.last_name && profile.full_name) {
        const parts = profile.full_name.trim().split(/\s+/);
        setFirstName(parts[0] || "");
        setLastName(parts.length > 1 ? parts.slice(1).join(' ') : "");
      }

      setUsername(profile.username || "");
      setBio(profile.bio || "");
      setLevel(profile.level || "100 Level");
      setAvatarUrl(profile.avatar_url || null);
      
      // Robust handling for relationship joins (Universities and Departments)
      // Supabase can return these as objects or arrays depending on the schema relationship type.
      const getJoinedDataName = (data: any) => {
        if (!data) return "";
        if (Array.isArray(data)) return data[0]?.name || "";
        return data.name || "";
      };

      setUniversityName(getJoinedDataName(profile.universities));
      setDepartment(getJoinedDataName(profile.departments));
      
      setPhone(profile.phone || "");
      setDob(profile.dob || "");
    }
  }, [profile]);

  const handleSave = async () => {
    if (!userId) return;
    setIsSaving(true);

    const combinedFullName = `${firstName.trim()} ${lastName.trim()}`.trim() || "New Student";

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: combinedFullName,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        username: username.trim(),
        bio: bio.trim(),
        level,
        phone: phone.trim(),
        dob: dob,
      })
      .eq("id", userId);

    setIsSaving(false);
    if (error) {
      showToast("❌ Failed to save. Please try again.");
    } else {
      queryClient.invalidateQueries({ queryKey: ['profile-account'] });
      queryClient.invalidateQueries({ queryKey: ['profile-settings'] });
      showToast("Profile saved successfully!");
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;

    setIsUploadingPhoto(true);

    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `avatars/${userId}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true, contentType: file.type });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", userId);

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
      queryClient.invalidateQueries({ queryKey: ['profile-account'] });
      queryClient.invalidateQueries({ queryKey: ['profile-settings'] });
      showToast("Profile photo updated!");
    } catch (err: any) {
      showToast("❌ Upload failed. Check your storage bucket.");
      console.error(err.message);
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-900" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-black pb-[100px] max-w-md mx-auto relative font-sans transition-colors">
      {toast && <Toast message={toast} />}

      {/* Header Bar */}
      <div className="flex items-center justify-between px-6 py-4 sticky top-0 bg-[#F8F9FA]/80 dark:bg-black/80 backdrop-blur-md z-10 border-b border-zinc-100 dark:border-zinc-800/50">
        <button 
          onClick={() => router.back()}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition shadow-sm shrink-0 border border-transparent dark:border-zinc-800"
        >
          <ArrowLeft size={20} className="text-black dark:text-white" />
        </button>
        <span className="font-bold text-[14px] uppercase tracking-[0.2em] text-black dark:text-white">Account</span>
        <div className="w-10 h-10" />
      </div>

      <main className="px-6 pt-6 space-y-8">

        {/* Profile Photo Section */}
        <section className="flex flex-col items-center">
          <div className="relative mb-4">
            <div className="w-28 h-28 rounded-full bg-zinc-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-sm">
              {isUploadingPhoto ? (
                <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
              ) : avatarUrl ? (
                <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="w-12 h-12 text-zinc-300" />
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingPhoto}
              className="absolute bottom-0 right-0 w-8 h-8 bg-[#E5FF66] rounded-full flex items-center justify-center border-2 border-white text-black shadow-sm hover:scale-105 transition-transform active:scale-95 disabled:opacity-50"
            >
              <Camera size={14} />
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>
          <p className="text-sm font-bold text-zinc-500">Change Profile Photo</p>
        </section>

        {/* Basic Info Forms */}
        <section className="space-y-4">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Basic Information</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-bold text-zinc-600 mb-1 ml-1">First Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    type="text"
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    className="w-full bg-white border border-zinc-200 rounded-2xl py-3.5 pl-11 pr-4 text-[15px] font-medium text-black focus:outline-none focus:ring-2 focus:ring-[#E5FF66] focus:border-transparent transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[13px] font-bold text-zinc-600 mb-1 ml-1">Last Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    type="text"
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                    className="w-full bg-white border border-zinc-200 rounded-2xl py-3.5 pl-11 pr-4 text-[15px] font-medium text-black focus:outline-none focus:ring-2 focus:ring-[#E5FF66] focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-bold text-zinc-600 mb-1 ml-1">Username / Handle</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-bold">@</span>
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="w-full bg-white border border-zinc-200 rounded-2xl py-3.5 pl-9 pr-4 text-[15px] font-medium text-black focus:outline-none focus:ring-2 focus:ring-[#E5FF66] focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-bold text-zinc-600 mb-1 ml-1">Bio</label>
              <textarea
                rows={3}
                value={bio}
                onChange={e => setBio(e.target.value)}
                placeholder="Tell us about yourself..."
                className="w-full bg-white border border-zinc-200 rounded-2xl py-3.5 px-4 text-[15px] font-medium text-black focus:outline-none focus:ring-2 focus:ring-[#E5FF66] focus:border-transparent transition-all resize-none"
              />
            </div>
          </div>
        </section>

        {/* Academic Info */}
        <section className="space-y-4">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Academic Details</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-[13px] font-bold text-zinc-600 mb-1 ml-1">University</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  value={universityName}
                  disabled
                  className="w-full bg-zinc-100 border border-zinc-200 rounded-2xl py-3.5 pl-11 pr-4 text-[15px] font-medium text-zinc-500 cursor-not-allowed"
                />
              </div>
              <p className="text-[11px] text-zinc-400 mt-1 ml-1">Contact support to change your university.</p>
            </div>

            <div>
              <label className="block text-[13px] font-bold text-zinc-600 mb-1 ml-1">Department / Faculty</label>
              <div className="relative">
                <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  value={department}
                  disabled
                  className="w-full bg-zinc-100 border border-zinc-200 rounded-2xl py-3.5 pl-11 pr-4 text-[15px] font-medium text-zinc-500 cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-bold text-zinc-600 mb-1 ml-1">Level</label>
              <div className="relative">
                <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <select
                  value={level}
                  onChange={e => setLevel(e.target.value)}
                  className="w-full bg-white border border-zinc-200 rounded-2xl py-3.5 pl-11 pr-4 text-[15px] font-medium text-black focus:outline-none focus:ring-2 focus:ring-[#E5FF66] focus:border-transparent transition-all appearance-none"
                >
                  <option>100 Level</option>
                  <option>200 Level</option>
                  <option>300 Level</option>
                  <option>400 Level</option>
                  <option>500 Level</option>
                  <option>Graduate</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Private Info */}
        <section className="space-y-4">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Private Information</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-[13px] font-bold text-zinc-600 mb-1 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full bg-zinc-100 border border-zinc-200 rounded-2xl py-3.5 pl-11 pr-4 text-[15px] font-medium text-zinc-500 cursor-not-allowed"
                />
              </div>
              <p className="text-[11px] text-zinc-400 mt-1 ml-1">Email cannot be changed once registered.</p>
            </div>

            <div>
              <label className="block text-[13px] font-bold text-zinc-600 mb-1 ml-1">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+234 800 000 0000"
                  className="w-full bg-white border border-zinc-200 rounded-2xl py-3.5 pl-11 pr-4 text-[15px] font-medium text-black focus:outline-none focus:ring-2 focus:ring-[#E5FF66] focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-bold text-zinc-600 mb-1 ml-1">Date of Birth</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="date"
                  value={dob}
                  onChange={e => setDob(e.target.value)}
                  className="w-full bg-white border border-zinc-200 rounded-2xl py-3.5 pl-11 pr-4 text-[15px] font-medium text-black focus:outline-none focus:ring-2 focus:ring-[#E5FF66] focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Save Button */}
        <div className="pt-4 pb-8">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full bg-black text-white rounded-2xl py-4 font-bold text-[15px] shadow-lg hover:bg-zinc-800 transition-colors active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isSaving && <Loader2 size={16} className="animate-spin" />}
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>

      </main>
    </div>
  );
}
