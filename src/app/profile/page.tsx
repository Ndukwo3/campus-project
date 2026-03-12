"use client";

import { useEffect, useState, useRef } from "react";
import { ArrowLeft, Settings, Grid, Bookmark, Tag, ChevronRight, Edit3, Camera, CheckCircle2, Loader2, User, Trash2, X, Maximize2, ImagePlus } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import BottomNavigation from "@/components/BottomNavigation";
import { createClient } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClient();
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState("posts");
  const [isSaved, setIsSaved] = useState(false);

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

  const handleUploadClick = () => {
    setShowPhotoOptions(true);
  };

  const handleGalleryClick = () => {
    setShowPhotoOptions(false);
    fileInputRef.current?.click();
  };

  const handleCameraClick = () => {
    setShowPhotoOptions(false);
    cameraInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUpdating(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setIsUpdating(false);
      return;
    }

    try {
      // 1. Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { 
          upsert: true,
          contentType: file.type // Ensure correct content type
        });

      if (uploadError) throw uploadError;

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // 3. Update Profile in Database
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // 4. Update Local State
      setProfile({ ...profile, avatar_url: publicUrl });
    } catch (err: any) {
      console.error("Upload error:", err.message);
      // Fallback for demo if bucket doesn't exist yet - you can still see the file picker work
      alert("Note: Upload failed. Please ensure you have created an 'avatars' bucket in Supabase Storage with public access. For now, testing the file picker functionality is successful.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteAvatar = async () => {
    if (!profile?.avatar_url) return;
    
    setIsUpdating(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setIsUpdating(false);
      return;
    }

    try {
      // 1. Remove from database
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Optional: Delete from storage if you want to save space
      // For MVP, we'll just null the reference in the profile
      
      // 2. Update local state
      setProfile({ ...profile, avatar_url: null });
      setShowImageViewer(false);
    } catch (err: any) {
      console.error("Delete error:", err.message);
      alert("Failed to delete photo. Please try again.");
    } finally {
      setIsUpdating(false);
    }
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
        <Link 
          href="/settings"
          className="w-10 h-10 flex items-center justify-center rounded-full bg-stone-100 hover:bg-stone-200 transition"
        >
          <Settings size={20} className="text-black" />
        </Link>
      </div>

      {/* Profile Info Section */}
      <div className="px-6 pt-2 pb-6">
        <div className="flex flex-col items-center">
          {/* Avatar with Ring */}
          <div className="relative">
            <div 
              onClick={() => profile?.avatar_url && setShowImageViewer(true)}
              className={`w-28 h-28 rounded-full ring-4 ${profile?.avatar_url ? "ring-[#E5FF66] cursor-pointer" : "ring-zinc-200"} ring-offset-4 overflow-hidden mb-4 shadow-lg transition-all flex items-center justify-center bg-zinc-50 relative group`}
            >
              {profile?.avatar_url ? (
                <>
                  <Image 
                    src={profile.avatar_url} 
                    alt="Profile" 
                    width={112} 
                    height={112} 
                    className="object-cover w-full h-full"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Maximize2 size={24} className="text-white" />
                  </div>
                </>
              ) : (
                <User className="w-12 h-12 text-zinc-300" />
              )}
            </div>
            <button 
              onClick={handleUploadClick}
              disabled={isUpdating}
              className="absolute bottom-4 right-0 w-8 h-8 bg-[#E5FF66] rounded-full flex items-center justify-center border-4 border-white text-black shadow-sm active:scale-90 transition-transform disabled:opacity-50"
            >
              {isUpdating ? <Loader2 size={12} className="animate-spin" /> : <Camera size={14} strokeWidth={2.5} />}
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
              className="flex-1 bg-[#1A1A24] text-white py-3 rounded-2xl text-[15px] font-bold shadow-[0_4px_10px_rgba(26,26,36,0.2)] active:scale-95 transition flex items-center justify-center gap-2"
            >
              <Edit3 size={18} />
              Edit Profile
            </button>
            <button 
              onClick={() => setIsSaved(!isSaved)}
              className={`w-14 items-center justify-center flex rounded-2xl transition active:scale-95 ${isSaved ? "bg-[#1A1A24] text-[#E5FF66]" : "bg-stone-100 text-black hover:bg-stone-200"}`}
            >
              <Bookmark size={22} fill={isSaved ? "currentColor" : "none"} />
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
              
              <div className="flex items-center gap-3 cursor-pointer group/item" onClick={handleUploadClick}>
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

        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept="image/*" 
          className="hidden" 
        />
        <input 
          type="file" 
          ref={cameraInputRef} 
          onChange={handleFileChange} 
          accept="image/*" 
          capture="user" 
          className="hidden" 
        />
      </div>

      {/* Tabs */}
      <div className="px-6 flex items-center border-b border-zinc-100 mb-4">
        <button 
          onClick={() => setActiveTab("posts")}
          className={`flex-1 py-4 flex flex-col items-center gap-1 group ${activeTab === "posts" ? "border-b-2 border-black" : ""}`}
        >
          <Grid size={22} className={activeTab === "posts" ? "text-black" : "text-black/30 group-hover:text-black transition"} />
          <span className={`text-[10px] font-bold uppercase tracking-widest ${activeTab === "posts" ? "text-black" : "text-black/30 group-hover:text-black transition"}`}>Posts</span>
        </button>
        <button 
          onClick={() => setActiveTab("saved")}
          className={`flex-1 py-4 flex flex-col items-center gap-1 group ${activeTab === "saved" ? "border-b-2 border-black" : ""}`}
        >
          <Bookmark size={22} className={activeTab === "saved" ? "text-black" : "text-black/30 group-hover:text-black transition"} />
          <span className={`text-[10px] font-bold uppercase tracking-widest ${activeTab === "saved" ? "text-black" : "text-black/30 group-hover:text-black transition"}`}>Saved</span>
        </button>
        <button 
          onClick={() => setActiveTab("tagged")}
          className={`flex-1 py-4 flex flex-col items-center gap-1 group ${activeTab === "tagged" ? "border-b-2 border-black" : ""}`}
        >
          <Tag size={22} className={activeTab === "tagged" ? "text-black" : "text-black/30 group-hover:text-black transition"} />
          <span className={`text-[10px] font-bold uppercase tracking-widest ${activeTab === "tagged" ? "text-black" : "text-black/30 group-hover:text-black transition"}`}>Tagged</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="px-6">
        {activeTab === "posts" && (
          <div className="grid grid-cols-3 gap-2">
            {posts.length > 0 ? (
              posts.map((post) => (
                <div key={post.id} className="aspect-square bg-zinc-100 rounded-lg overflow-hidden relative group cursor-pointer">
                  <Image 
                    src={post.image_url || "/dummy/nigerian_post_image_1772720254070.png"} 
                    alt="Post" 
                    fill 
                    className="object-cover group-hover:scale-105 transition duration-500" 
                  />
                  <div className="absolute inset-0 bg-black/5 group-hover:bg-black/20 transition-colors" />
                </div>
              ))
            ) : (
              <div className="col-span-3 py-16 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mb-4">
                  <Grid className="text-zinc-400 w-8 h-8" />
                </div>
                <p className="font-bold text-lg text-black mb-1">No Posts Yet</p>
                <p className="text-zinc-500 text-sm">When you share a post, it will appear here on your profile.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "saved" && (
          <div className="py-16 flex flex-col items-center justify-center text-center animate-in fade-in">
            <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mb-4">
              <Bookmark className="text-zinc-400 w-8 h-8" />
            </div>
            <p className="font-bold text-lg text-black mb-1">Feature Coming Soon</p>
            <p className="text-zinc-500 text-sm">Saved posts functionality is currently under development.</p>
          </div>
        )}

        {activeTab === "tagged" && (
          <div className="py-16 flex flex-col items-center justify-center text-center animate-in fade-in">
            <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mb-4">
              <Tag className="text-zinc-400 w-8 h-8" />
            </div>
            <p className="font-bold text-lg text-black mb-1">Feature Coming Soon</p>
            <p className="text-zinc-500 text-sm">Tagged posts functionality is currently under development.</p>
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

      {/* Image Viewer / Delete Modal */}
      <AnimatePresence>
        {showImageViewer && profile?.avatar_url && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200] bg-black flex flex-col"
            >
              <div className="p-6 flex items-center justify-between">
                <button onClick={() => setShowImageViewer(false)} className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white transition-colors">
                  <ArrowLeft size={24} />
                </button>
                <button 
                  onClick={handleDeleteAvatar}
                  disabled={isUpdating}
                  className="px-4 py-2 bg-red-500/10 text-red-500 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-red-500 hover:text-white transition-all transform active:scale-95 disabled:opacity-50"
                >
                  <Trash2 size={18} />
                  Delete Photo
                </button>
              </div>
              
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="flex-1 relative flex items-center justify-center p-4"
              >
                 <div className="w-full max-w-sm aspect-square relative rounded-[40px] overflow-hidden shadow-2xl">
                   <Image 
                     src={profile.avatar_url} 
                     alt="Enlarged profile" 
                     fill 
                     className="object-cover"
                     unoptimized
                   />
                 </div>
              </motion.div>
              
              <div className="p-10 flex justify-center">
                 <p className="text-zinc-500 text-sm font-medium">Profile Preview</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Photo Options Modal */}
      <AnimatePresence>
        {showPhotoOptions && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setShowPhotoOptions(false)}
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="w-full max-w-[340px] bg-white rounded-[40px] px-6 pt-8 pb-10 shadow-2xl relative z-20"
            >
              <h2 className="text-xl font-black text-black mb-8 px-1 text-center">Profile Photo</h2>

              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={handleCameraClick}
                  className="flex flex-col items-center justify-center gap-4 bg-zinc-50 hover:bg-zinc-100 p-6 rounded-[32px] transition-all active:scale-95 group border border-transparent hover:border-zinc-200"
                >
                  <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-all">
                    <Camera size={28} className="text-black" />
                  </div>
                  <span className="font-bold text-[13px] text-black">Take Photo</span>
                </button>

                <button 
                  onClick={handleGalleryClick}
                  className="flex flex-col items-center justify-center gap-4 bg-zinc-50 hover:bg-zinc-100 p-6 rounded-[32px] transition-all active:scale-95 group border border-transparent hover:border-zinc-200"
                >
                  <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-all">
                    <ImagePlus size={28} className="text-black" />
                  </div>
                  <span className="font-bold text-[13px] text-black">Gallery</span>
                </button>
              </div>

              <button 
                onClick={() => setShowPhotoOptions(false)}
                className="mt-8 w-full py-4 bg-zinc-100 rounded-2xl text-sm font-bold text-zinc-500 hover:bg-zinc-200 hover:text-black transition active:scale-95"
              >
                Cancel
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
