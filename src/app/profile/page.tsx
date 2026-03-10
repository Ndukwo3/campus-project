"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Settings, Grid, Bookmark, Tag, ChevronRight, Edit3, Camera, CheckCircle2, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import BottomNavigation from "@/components/BottomNavigation";
import { createClient } from "@/lib/supabase";

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClient();
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    async function fetchProfileData() {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      // Fetch profile with university/department info
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*, universities(name), departments(name)')
        .eq('id', user.id)
        .single();

      if (profileData) {
        setProfile(profileData);
        setEditFirstName(profileData.first_name || "");
        setEditLastName(profileData.last_name || "");
        setEditBio(profileData.bio || "");
      }

      // Fetch user's posts
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (postsData) {
        setPosts(postsData);
      }

      setIsLoading(false);
    }

    fetchProfileData();
  }, [router, supabase]);

  const handleSaveProfile = async () => {
    setIsUpdating(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return;

    const combinedFullName = `${editFirstName} ${editLastName}`.trim();

    const { error } = await supabase
      .from('profiles')
      .update({
        first_name: editFirstName,
        last_name: editLastName,
        full_name: combinedFullName || "New Student",
        bio: editBio,
      })
      .eq('id', user.id);

    if (!error) {
      setProfile({ 
        ...profile, 
        first_name: editFirstName, 
        last_name: editLastName, 
        full_name: combinedFullName || "New Student", 
        bio: editBio 
      });
      setIsEditing(false);
    }
    setIsUpdating(false);
  };

  const handleMockUpload = async () => {
    setIsUpdating(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // In a real app, this would be a Supabase Storage upload
    // For now, we'll just set a dummy URL to trigger the "tick"
    const dummyAvatar = "/dummy/nigerian_avatar_1_1772720135560.png";
    
    const { error } = await supabase
      .from('profiles')
      .update({ avatar_url: dummyAvatar })
      .eq('id', user.id);

    if (!error) {
      setProfile({ ...profile, avatar_url: dummyAvatar });
    }
    setIsUpdating(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-900" />
      </div>
    );
  }

  const isProfileComplete = profile?.bio && profile?.full_name !== "New Student" && profile?.avatar_url;

  return (
    <div className="min-h-screen bg-white pb-[100px] max-w-md mx-auto relative font-sans overflow-x-hidden">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-6 py-4 sticky top-0 bg-white z-10">
        <Link href="/" className="w-10 h-10 flex items-center justify-center rounded-full bg-stone-100 hover:bg-stone-200 transition">
          <ArrowLeft size={20} className="text-black" />
        </Link>
        <span className="font-bold text-lg tracking-tight text-black">Profile</span>
        <button className="w-10 h-10 flex items-center justify-center rounded-full bg-stone-100 hover:bg-stone-200 transition">
          <Settings size={20} className="text-black" />
        </button>
      </div>

      {/* Profile Info Section */}
      <div className="px-6 pt-2 pb-6">
        <div className="flex flex-col items-center">
          {/* Avatar with Ring */}
          <div className="relative">
            <div className={`w-28 h-28 rounded-full ring-4 ${profile?.avatar_url ? "ring-[#E5FF66]" : "ring-zinc-200"} ring-offset-4 overflow-hidden mb-4 shadow-lg transition-all`}>
              <Image 
                src={profile?.avatar_url || "/dummy/nigerian_avatar_1_1772720135560.png"} 
                alt="Profile" 
                width={112} 
                height={112} 
                className={`object-cover w-full h-full ${!profile?.avatar_url ? "grayscale opacity-50" : ""}`}
              />
            </div>
            <button 
              onClick={handleMockUpload}
              className="absolute bottom-4 right-0 w-8 h-8 bg-[#E5FF66] rounded-full flex items-center justify-center border-4 border-white text-black shadow-sm active:scale-90 transition-transform"
            >
              <Camera size={14} strokeWidth={2.5} />
            </button>
          </div>
          
          <div className="flex items-center gap-1.5 mb-1 text-center justify-center w-full">
            <h2 className="text-2xl font-bold text-black leading-tight truncate px-4">{profile?.full_name || "New Student"}</h2>
            {profile?.full_name !== "New Student" && <CheckCircle2 size={20} className="fill-black text-white flex-shrink-0" />}
          </div>
          <p className="text-zinc-500 text-[14px] font-medium mb-4">{profile?.username} • {profile?.level || "Undergraduate"}</p>
          
          <div className="flex gap-4 w-full">
            <button 
              onClick={() => setIsEditing(true)}
              className="flex-1 bg-[#1A1A24] text-white py-3 rounded-2xl text-[15px] font-semibold flex items-center justify-center gap-2 hover:bg-black transition active:scale-[0.98]"
            >
              <Edit3 size={18} />
              Edit Profile
            </button>
            <button className="w-12 h-12 bg-stone-100 rounded-2xl flex items-center justify-center text-black hover:bg-stone-200 transition">
              <Bookmark size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="flex justify-around py-6 border-y border-zinc-100 mx-6">
        <div className="flex flex-col items-center">
          <span className="text-lg font-bold text-black">{posts.length}</span>
          <span className="text-xs text-black/40 font-bold uppercase tracking-wider">Posts</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-lg font-bold text-black">0</span>
          <span className="text-xs text-black/40 font-bold uppercase tracking-wider">Followers</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-lg font-bold text-black">0</span>
          <span className="text-xs text-black/40 font-bold uppercase tracking-wider">Following</span>
        </div>
      </div>

      {/* Bio / University Section */}
      <div className="px-6 py-6 flex flex-col gap-4">
        <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
          <div className="flex items-center mb-2">
            <h3 className="font-bold text-sm text-black">University</h3>
          </div>
          <p className="text-sm font-normal text-black">{profile?.universities?.name || "Select University"}</p>
          <p className="text-sm text-black font-normal mt-1">{profile?.departments?.name || "Select Department"}</p>
        </div>

        {/* Profile Completion Guide */}
        {!isProfileComplete && (
          <div className="bg-[#E5FF66]/10 border border-[#E5FF66]/30 p-5 rounded-3xl mb-4 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-3 opacity-20 transform translate-x-1 translate-y--1 group-hover:scale-110 transition-transform">
              <CheckCircle2 size={60} className="text-black" />
            </div>
            
            <h3 className="font-extrabold text-[#1A1A24] text-lg mb-4 relative z-10 flex items-center gap-2">
              Finish setting up your profile 🚀
            </h3>
            
            <div className="flex flex-col gap-3 relative z-10">
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all ${profile?.full_name !== "New Student" ? "bg-[#1A1A24] border-[#1A1A24]" : "border-zinc-300"}`}>
                  {profile?.full_name !== "New Student" && <CheckCircle2 size={14} className="text-white fill-white" />}
                </div>
                <span className={`text-sm font-medium transition-all ${profile?.full_name !== "New Student" ? "text-zinc-400 line-through opacity-50" : "text-zinc-700"}`}>Add your full name</span>
              </div>
              
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all ${profile?.bio ? "bg-[#1A1A24] border-[#1A1A24]" : "border-zinc-300"}`}>
                  {profile?.bio && <CheckCircle2 size={14} className="text-white fill-white" />}
                </div>
                <span className={`text-sm font-medium transition-all ${profile?.bio ? "text-zinc-400 line-through opacity-50" : "text-zinc-700"}`}>Write a short bio</span>
              </div>
              
              <div className="flex items-center gap-3 cursor-pointer group/item" onClick={handleMockUpload}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all ${profile?.avatar_url ? "bg-[#1A1A24] border-[#1A1A24]" : "border-zinc-300 group-hover/item:border-black"}`}>
                  {profile?.avatar_url && <CheckCircle2 size={14} className="text-white fill-white" />}
                </div>
                <span className={`text-sm font-medium transition-all ${profile?.avatar_url ? "text-zinc-400 line-through opacity-50" : "text-zinc-700 group-hover/item:text-black"}`}>Upload a profile photo</span>
              </div>
            </div>
            
            <button 
              onClick={() => setIsEditing(true)}
              className="mt-5 w-full bg-[#1A1A24] text-white py-2.5 rounded-xl text-sm font-bold shadow-md active:scale-95 transition-all"
            >
              Complete Setup
            </button>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <h3 className="font-bold text-base text-black px-1">About Me</h3>
          {profile?.bio ? (
            <p className="text-sm text-zinc-600 leading-relaxed px-1 font-normal">
              {profile.bio}
            </p>
          ) : (
            <p className="text-sm text-zinc-400 italic px-1 font-normal">
              Tell your university community something about yourself...
            </p>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 flex items-center border-b border-zinc-100 mb-4">
        <button className="flex-1 py-4 flex flex-col items-center gap-1 group border-b-2 border-black">
          <Grid size={22} className="text-black" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-black">Posts</span>
        </button>
        <button className="flex-1 py-4 flex flex-col items-center gap-1 group">
          <Bookmark size={22} className="text-black/30 group-hover:text-black transition" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-black/30 group-hover:text-black transition">Saved</span>
        </button>
        <button className="flex-1 py-4 flex flex-col items-center gap-1 group">
          <Tag size={22} className="text-black/30 group-hover:text-black transition" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-black/30 group-hover:text-black transition">Tagged</span>
        </button>
      </div>

      {/* Posts Grid */}
      <div className="px-6 grid grid-cols-3 gap-2">
        {posts.length > 0 ? (
          posts.map((post) => (
            <div key={post.id} className="aspect-square bg-zinc-100 rounded-lg overflow-hidden relative">
              <Image 
                src={post.image_url || "/dummy/nigerian_post_image_1772720254070.png"} 
                alt="Post" 
                fill 
                className="object-cover" 
                unoptimized
              />
            </div>
          ))
        ) : (
          <div className="col-span-3 py-10 text-center text-zinc-400 text-sm">
            No posts yet. Share something with your campus!
          </div>
        )}
      </div>

      {/* Edit Profile Slide-up Modal */}
      {isEditing && (
        <>
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] transition-opacity"
            onClick={() => setIsEditing(false)}
          />
          <div className="fixed bottom-0 left-0 right-0 z-[101] max-w-md mx-auto bg-white rounded-t-[40px] px-6 pt-8 pb-10 shadow-2xl animate-in slide-in-from-bottom duration-300">
            <div className="w-12 h-1.5 bg-zinc-200 rounded-full mx-auto mb-8" onClick={() => setIsEditing(false)} />
            
            <h2 className="text-2xl font-black text-black mb-2 px-1">Edit Profile</h2>
            <p className="text-zinc-500 text-sm mb-8 px-1">Update your identity on Campus</p>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2 px-1">First Name</label>
                  <input 
                    type="text" 
                    value={editFirstName}
                    onChange={(e) => setEditFirstName(e.target.value)}
                    placeholder="John"
                    className="w-full bg-zinc-100 rounded-2xl px-5 py-4 text-[15px] font-bold outline-none focus:ring-2 focus:ring-[#E5FF66] transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2 px-1">Last Name</label>
                  <input 
                    type="text" 
                    value={editLastName}
                    onChange={(e) => setEditLastName(e.target.value)}
                    placeholder="Doe"
                    className="w-full bg-zinc-100 rounded-2xl px-5 py-4 text-[15px] font-bold outline-none focus:ring-2 focus:ring-[#E5FF66] transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2 px-1">About Me (Bio)</label>
                <textarea 
                  rows={4}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  placeholder="Tell us about yourself..."
                  className="w-full bg-zinc-100 rounded-2xl px-5 py-4 text-[15px] font-medium outline-none focus:ring-2 focus:ring-[#E5FF66] transition-all resize-none"
                />
              </div>
            </div>

            <div className="flex gap-4 mt-10">
              <button 
                onClick={() => setIsEditing(false)}
                className="flex-1 bg-stone-100 text-black py-4 rounded-2xl font-bold text-sm hover:bg-stone-200 transition"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveProfile}
                disabled={isUpdating}
                className="flex-[2] bg-[#1A1A24] text-white py-4 rounded-2xl font-bold text-sm hover:bg-black transition flex items-center justify-center gap-2"
              >
                {isUpdating && <Loader2 size={16} className="animate-spin" />}
                {isUpdating ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </>
      )}

      <BottomNavigation />
    </div>
  );
}
