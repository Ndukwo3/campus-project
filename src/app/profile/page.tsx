"use client";

import { useEffect, useState, useRef } from "react";
import { 
  ArrowLeft, Grid, Bookmark, Tag, User, Camera, Edit3, CheckCircle2, 
  Loader2, LogOut, Package, Shield, Settings, Settings2, Trash2, Maximize2, 
  Repeat2, ChevronRight, X, ImagePlus, Check, Plus 
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import BottomNavigation from "@/components/BottomNavigation";
import { createClient } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import Toast from "@/components/Toast";
import FeedCard from "@/components/FeedCard";
import ConnectionsModal from "@/components/ConnectionsModal";
import { capitalizeName } from "@/lib/utils";

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
  const [activeTab, setActiveTab] = useState<"posts" | "saved" | "reposts" | "tagged">("posts");
  const [reposts, setReposts] = useState<any[]>([]);
  const [savedPosts, setSavedPosts] = useState<any[]>([]);
  const [connectionCount, setConnectionCount] = useState(0);
  const [currentUserLikes, setCurrentUserLikes] = useState<Set<string>>(new Set());
  const [currentUserBookmarks, setCurrentUserBookmarks] = useState<Set<string>>(new Set());
  const [currentUserReposts, setCurrentUserReposts] = useState<Set<string>>(new Set());
  const [isConnectionsOpen, setIsConnectionsOpen] = useState(false);
  
  // Toast State
  const [hasStories, setHasStories] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" | "warning"; isVisible: boolean }>({
    message: "",
    type: "success",
    isVisible: false,
  });

  const showToast = (message: string, type: "success" | "error" | "info" | "warning" = "success") => {
    setToast({ message, type, isVisible: true });
  };
  
  // Crop States
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [tempImageFile, setTempImageFile] = useState<File | null>(null);
  const [tempImageUrl, setTempImageUrl] = useState<string | null>(null);
  const [isFinalizingUpload, setIsFinalizingUpload] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [touchStartDist, setTouchStartDist] = useState(0);

  // ... (inside the Modal)
  const handlePinchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].pageX - e.touches[1].pageX,
        e.touches[0].pageY - e.touches[1].pageY
      );
      setTouchStartDist(dist);
    }
  };

  const handlePinchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && touchStartDist > 0) {
      const dist = Math.hypot(
        e.touches[0].pageX - e.touches[1].pageX,
        e.touches[0].pageY - e.touches[1].pageY
      );
      const zoomFactor = dist / touchStartDist;
      setZoom(Math.min(Math.max(1, zoom * zoomFactor), 4));
      setTouchStartDist(dist);
    }
  };

  const handleRepost = async (postId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const wasReposted = currentUserReposts.has(postId);

    if (wasReposted) {
      await supabase.from('reposts').delete().match({ user_id: user.id, post_id: postId });
      setCurrentUserReposts(prev => {
        const next = new Set(prev);
        next.delete(postId);
        return next;
      });
      showToast("Repost removed");
    } else {
      await supabase.from('reposts').insert({ user_id: user.id, post_id: postId });
      setCurrentUserReposts(prev => {
        const next = new Set(prev);
        next.add(postId);
        return next;
      });

      // Notify the post author
      const { data: postData } = await supabase.from('posts').select('user_id, content').eq('id', postId).single();
      if (postData && postData.user_id !== user.id) {
        await supabase.from('notifications').insert({
          user_id: postData.user_id,
          sender_id: user.id,
          type: 'repost',
          content: `reposted your post: "${postData.content?.substring(0, 50)}${postData.content?.length > 50 ? '...' : ''}"`,
          is_read: false
        });
      }
      showToast("Post reposted!");
    }
  };

  useEffect(() => {
    async function fetchProfileData() {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      // Fetch profile without nested relations to prevent failure if FK is missing
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileData) {
        // Fetch relations manually to be safe
        if (profileData.university_id) {
          const { data: uni } = await supabase.from('universities').select('name').eq('id', profileData.university_id).maybeSingle();
          if (uni) profileData.universities = uni;
        }
        if (profileData.department_id) {
          const { data: dept } = await supabase.from('departments').select('name').eq('id', profileData.department_id).maybeSingle();
          if (dept) profileData.departments = dept;
        }

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
      
      // Fetch user's likes to show correct icons
      const { data: likesData } = await supabase.from('likes').select('post_id').eq('user_id', user.id);
      if (likesData) setCurrentUserLikes(new Set(likesData.map((l: any) => l.post_id)));

      // Fetch user's bookmarks
      const { data: bookmarksData } = await supabase.from('bookmarks').select('post_id').eq('user_id', user.id);
      if (bookmarksData) setCurrentUserBookmarks(new Set(bookmarksData.map((b: any) => b.post_id)));
      
      // Fetch user's reposts
      const { data: repostsData } = await supabase.from('reposts').select('post_id').eq('user_id', user.id);
      if (repostsData) setCurrentUserReposts(new Set(repostsData.map((r: any) => r.post_id)));
      
      const { count: connections } = await supabase
        .from('friends')
        .select('*', { count: 'exact', head: true })
        .or(`user_id1.eq.${user.id},user_id2.eq.${user.id}`);
      
      setConnectionCount(connections || 0);
      
      // Fetch active stories count
      const now = new Date().toISOString();
      const { count: storiesCount } = await supabase
        .from('stories')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gt('expires_at', now);
      
      setHasStories(!!storiesCount && storiesCount > 0);
      setIsLoading(false);
    }

    fetchProfileData();
  }, [router, supabase]);

  useEffect(() => {
    async function fetchReposts() {
      if (activeTab !== "reposts") return;
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('reposts')
        .select(`
          id,
          post_id,
          created_at,
          posts (
            *,
            profiles:user_id (username, full_name, avatar_url)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (data) setReposts(data);
    }
    fetchReposts();
  }, [activeTab, supabase]);

  useEffect(() => {
    async function fetchSavedPosts() {
      if (activeTab !== "saved") return;
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('bookmarks')
        .select(`
          post_id,
          posts (
            *,
            profiles:user_id (*)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (data) {
        setSavedPosts(data.map((b: any) => b.posts).filter(Boolean));
      }
    }

    fetchSavedPosts();
  }, [activeTab, supabase]);

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
      showToast("Profile updated successfully!");
      setIsEditing(false);
    } else {
      showToast("Failed to update profile", "error");
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

    // Open Crop Modal instead of immediate upload
    setTempImageFile(file);
    setTempImageUrl(URL.createObjectURL(file));
    setIsCropModalOpen(true);
    
    // Clear the input so same file can be chosen again
    e.target.value = '';
  };

  const handleConfirmedCrop = async () => {
    if (!tempImageFile) return;

    setIsFinalizingUpload(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setIsFinalizingUpload(false);
      return;
    }

    try {
      // 1. Create a canvas to extract the center square
      const img = new globalThis.Image();
      img.src = tempImageUrl!;
      
      await new Promise((resolve) => { img.onload = resolve; });
      
      const canvas = document.createElement('canvas');
      const sizeFull = Math.min(img.width, img.height);
      const size = sizeFull / zoom;
      canvas.width = 500; // Standard avatar size
      canvas.height = 500;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error("Canvas context failed");
      
      const sourceX = (img.width - size) / 2;
      const sourceY = (img.height - size) / 2;
      
      ctx.drawImage(img, sourceX, sourceY, size, size, 0, 0, 500, 500);
      
      const blob = await new Promise<Blob>((resolve) => 
        canvas.toBlob((b) => resolve(b!), 'image/jpeg', 0.9)
      );

      const fileExt = tempImageFile.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`; 

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, blob, { 
          upsert: true,
          contentType: tempImageFile.type || 'image/jpeg'
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
      
      // 4. Update local state
      setProfile({ ...profile, avatar_url: publicUrl });
      
      // 5. Automatically create a social post in the News Feed!
      await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          university_id: profile?.university_id,
          content: "Just updated my profile photo!",
          image_url: publicUrl,
          likes_count: 0,
          comments_count: 0
        });

      showToast("Profile updated successfully!");
    } catch (err: any) {
      console.error("Upload error:", err.message);
    } finally {
      setIsFinalizingUpload(false);
      setIsCropModalOpen(false);
      setTempImageUrl(null);
      setTempImageFile(null);
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
      showToast("Failed to delete photo. Please try again.", "error");
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black transition-colors">
        <div className="relative flex items-center justify-center">
          <div className="absolute w-16 h-16 bg-[#E5FF66]/20 rounded-full animate-ping" />
          <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(229,255,102,0.15)] animate-pulse relative z-10">
            <span className="text-[#E5FF66] font-black text-3xl italic tracking-tighter">U</span>
            <span className="text-white font-black text-3xl italic tracking-tighter">-v</span>
          </div>
        </div>
      </div>
    );
  }

  const isProfileComplete = profile?.bio && profile?.full_name !== "New Student" && profile?.avatar_url;

  return (
    <div className="min-h-screen bg-white dark:bg-black pb-[100px] max-w-md mx-auto relative font-sans overflow-x-hidden transition-colors">
      <Toast 
        message={toast.message} 
        type={toast.type} 
        isVisible={toast.isVisible} 
        onClose={() => setToast({ ...toast, isVisible: false })} 
      />
      {/* Header Bar */}
      <div className="flex items-center justify-between px-6 py-4 sticky top-0 bg-white/80 dark:bg-black/80 backdrop-blur-xl z-10 border-b border-zinc-100/50 dark:border-zinc-800/50">
        <Link href="/" className="w-10 h-10 flex items-center justify-center rounded-full bg-stone-100 dark:bg-zinc-900 hover:bg-stone-200 dark:hover:bg-zinc-800 transition">
          <ArrowLeft size={20} className="text-black dark:text-white" />
        </Link>
        <span className="font-bold text-lg tracking-tight text-black dark:text-white">Profile</span>
        <Link 
          href="/settings"
          className="w-10 h-10 flex items-center justify-center rounded-full bg-stone-100 dark:bg-zinc-900 hover:bg-stone-200 dark:hover:bg-zinc-800 transition"
        >
          <Settings size={20} className="text-black dark:text-white" />
        </Link>
      </div>

      {/* Profile Info Section */}
      <div className="px-6 pt-2 pb-6">
        <div className="flex flex-col items-center">
          {/* Avatar with Ring */}
          <div className="relative">
            <div 
              onClick={() => profile?.avatar_url && setShowImageViewer(true)}
              className={`w-28 h-28 rounded-full ring-4 ${hasStories ? "ring-[#E5FF66] cursor-pointer" : "ring-zinc-200 dark:ring-zinc-800"} ring-offset-4 ring-offset-white dark:ring-offset-black overflow-hidden mb-4 shadow-lg transition-all flex items-center justify-center bg-zinc-50 dark:bg-zinc-900 relative group`}
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
                <User className="w-12 h-12 text-zinc-300 dark:text-zinc-700" />
              )}
            </div>
            <button 
              onClick={handleUploadClick}
              disabled={isUpdating}
              className="absolute bottom-4 right-0 w-8 h-8 bg-[#E5FF66] rounded-full flex items-center justify-center border-4 border-white dark:border-black text-black shadow-sm active:scale-90 transition-transform disabled:opacity-50"
            >
              {isUpdating ? <Loader2 size={12} className="animate-spin" /> : <Camera size={14} strokeWidth={2.5} />}
            </button>
          </div>
          
          <div className="flex items-center justify-center gap-1.5 mb-1 w-full max-w-[280px] mx-auto">
            <h2 className="text-2xl font-black text-black dark:text-white leading-tight truncate">{capitalizeName(profile?.full_name || "New Student")}</h2>
            {profile?.full_name !== "New Student" && <CheckCircle2 size={18} className="fill-black dark:fill-[#E5FF66] text-white dark:text-black shrink-0" />}
          </div>
          <p className="text-zinc-500 dark:text-zinc-400 text-[14px] font-medium mb-4">{profile?.username} • {profile?.level || "Undergraduate"}</p>
          
          <div className="flex gap-4 w-full">
            <button 
              onClick={() => setIsEditing(true)}
              className="w-full bg-[#1A1A24] dark:bg-zinc-900 text-white py-3 rounded-2xl text-[15px] font-bold shadow-[0_4px_10px_rgba(26,26,36,0.2)] dark:shadow-none active:scale-95 transition flex items-center justify-center gap-2 border border-transparent dark:border-zinc-800"
            >
              <Edit3 size={18} />
              Edit Profile
            </button>
          </div>
        </div>
      </div>

      {/* Stats Section - Modern Look */}
      <div className="flex justify-around py-8 px-10 bg-white dark:bg-black mx-0 border-b border-zinc-50 dark:border-zinc-900 transition-colors">
        <div className="flex flex-col items-center gap-1 group cursor-pointer w-1/2">
          <span className="text-2xl font-black text-black dark:text-white group-hover:scale-110 transition-transform">{posts.length}</span>
          <span className="text-[10px] text-zinc-400 dark:text-zinc-600 font-black uppercase tracking-[0.2em]">Posts</span>
        </div>
        <div className="w-[1px] h-10 bg-zinc-100 dark:bg-zinc-800" />
        <div 
          onClick={() => setIsConnectionsOpen(true)}
          className="flex flex-col items-center gap-1 group cursor-pointer w-1/2"
        >
          <span className="text-2xl font-black text-black dark:text-white group-hover:scale-110 transition-transform">{connectionCount}</span>
          <span className="text-[10px] text-zinc-400 dark:text-zinc-600 font-black uppercase tracking-[0.2em]">Connections</span>
        </div>
      </div>

      {/* Bio / University Section */}
      <div className="px-6 py-6 flex flex-col gap-4">
        <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center mb-2">
            <h3 className="font-bold text-sm text-black dark:text-white">University</h3>
          </div>
          <p className="text-sm font-normal text-black dark:text-zinc-300">{profile?.universities?.name || "Select University"}</p>
          <p className="text-sm text-black dark:text-zinc-300 font-normal mt-1">{profile?.departments?.name || "Select Department"}</p>
        </div>

        {/* Redesigned Profile Completion Progress */}
        {!isProfileComplete && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 bg-[#1A1A24] dark:bg-zinc-900 rounded-[32px] p-6 shadow-2xl relative overflow-hidden group border border-white/5 dark:border-zinc-800"
          >
            {/* Subtle light effect */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#E5FF66]/5 rounded-full blur-3xl -mr-10 -mt-10" />
            
            <div className="relative z-10">
              <div className="flex justify-between items-end mb-4">
                <div>
                  <h3 className="text-white font-black text-xl mb-1 tracking-tight">Profile Strength</h3>
                  <p className="text-zinc-500 dark:text-zinc-400 text-xs font-bold uppercase tracking-wider">Complete your identity</p>
                </div>
                <div className="text-right">
                  <span className="text-[#E5FF66] text-3xl font-black italic">
                    {Math.round(
                      ((profile?.full_name !== "New Student" ? 1 : 0) + 
                       (profile?.bio ? 1 : 0) + 
                       (profile?.avatar_url ? 1 : 0)) / 3 * 100
                    )}%
                  </span>
                </div>
              </div>

              {/* Modern Progress Bar */}
              <div className="h-2 w-full bg-white/10 dark:bg-white/5 rounded-full overflow-hidden mb-6">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ 
                    width: `${((profile?.full_name !== "New Student" ? 1 : 0) + 
                                (profile?.bio ? 1 : 0) + 
                                (profile?.avatar_url ? 1 : 0)) / 3 * 100}%` 
                  }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-[#E5FF66] to-[#4ADE80] rounded-full"
                />
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {[
                  { label: "Name", done: profile?.full_name !== "New Student" },
                  { label: "Bio", done: !!profile?.bio },
                  { label: "Photo", done: !!profile?.avatar_url }
                ].map((item, idx) => (
                  <div 
                    key={idx}
                    className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-all
                      ${item.done ? "bg-[#E5FF66] text-black" : "bg-white/5 text-zinc-500 border border-white/10"}`}
                  >
                    {item.done && <CheckCircle2 size={10} strokeWidth={3} />}
                    {item.label}
                  </div>
                ))}
              </div>

              <button 
                onClick={() => {
                  if (profile?.full_name === "New Student" || !profile?.bio) {
                    setIsEditing(true);
                  } else if (!profile?.avatar_url) {
                    handleUploadClick();
                  } else {
                    setIsEditing(true);
                  }
                }}
                className="w-full bg-white dark:bg-[#E5FF66] text-black py-4 rounded-2xl text-[14px] font-black tracking-tight hover:bg-[#E5FF66] dark:hover:bg-white transition-all active:scale-[0.98] shadow-lg shadow-black/20"
              >
                Continue Setup
              </button>
            </div>
          </motion.div>
        )}

        <div className="flex flex-col gap-2">
          <h3 className="font-bold text-base text-black dark:text-white px-1">About Me</h3>
          {profile?.bio ? (
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed px-1 font-normal">
              {profile.bio}
            </p>
          ) : (
            <p className="text-sm text-zinc-400 italic px-1 font-normal">
              Tell your Univas community something about yourself...
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

      {/* Tabs - Sleek Apple-style */}
      <div className="px-6 flex items-center mb-6 sticky top-[72px] bg-white/80 dark:bg-black/80 backdrop-blur-md z-10 py-2">
        <div className="flex-1 flex bg-zinc-50 dark:bg-zinc-900 p-1 rounded-2xl relative">
          <button 
            onClick={() => setActiveTab("posts")}
            className={`flex-1 py-3.5 flex items-center justify-center gap-2 rounded-xl transition-all relative z-10 ${activeTab === "posts" ? "text-black dark:text-white font-black" : "text-zinc-400 font-bold hover:text-zinc-600 dark:hover:text-zinc-300"}`}
          >
            <Grid size={18} />
            <span className="text-xs">Posts</span>
          </button>
          <button 
            onClick={() => setActiveTab("saved")}
            className={`flex-1 py-3.5 flex items-center justify-center gap-2 rounded-xl transition-all relative z-10 ${activeTab === "saved" ? "text-black dark:text-white font-black" : "text-zinc-400 font-bold hover:text-zinc-600 dark:hover:text-zinc-300"}`}
          >
            <Bookmark size={18} />
            <span className="text-xs">Bookmarks</span>
          </button>
          <button 
            onClick={() => setActiveTab("reposts")}
            className={`flex-1 py-3.5 flex items-center justify-center gap-2 rounded-xl transition-all relative z-10 ${activeTab === "reposts" ? "text-black dark:text-white font-black" : "text-zinc-400 font-bold hover:text-zinc-600 dark:hover:text-zinc-300"}`}
          >
            <Repeat2 size={18} />
            <span className="text-xs">Reposts</span>
          </button>
          
          {/* Active indicator pill */}
          <motion.div 
            layoutId="tab-pill"
            className="absolute top-1 bottom-1 left-1 w-[calc(33.33%-4px)] bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-zinc-100 dark:border-zinc-700"
            animate={{ 
              x: activeTab === "posts" ? 0 : 
                 activeTab === "saved" ? "100%" : 
                 activeTab === "reposts" ? "200%" : 0 
            }}
            transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
          />
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-6">
        {activeTab === "posts" && (
          <div className="flex flex-col gap-4">
            {posts.length > 0 ? (
              posts.map((post) => (
                <FeedCard 
                  key={post.id}
                  id={post.id}
                  authorName={capitalizeName(profile?.full_name || "User")}
                  authorImage={profile?.avatar_url}
                  timePosted={new Date(post.created_at).toLocaleDateString()}
                  postImage={post.image_url}
                  likes={post.likes_count || 0}
                  comments={post.comments_count || 0}
                  description={post.content}
                  authorId={post.user_id}
                  currentUserId={profile?.id}
                  isLiked={currentUserLikes.has(post.id)}
                  isBookmarked={currentUserBookmarks.has(post.id)}
                  isReposted={currentUserReposts.has(post.id)}
                  onDelete={async (id: string) => {
                    const { error } = await supabase.from('posts').delete().eq('id', id);
                    if (!error) {
                      setPosts(posts.filter(p => p.id !== id));
                      showToast("Post deleted");
                    }
                  }}
                  onRepost={handleRepost}
                  onLike={async (id: string) => {
                    const { data: { user } } = await supabase.auth.getUser();
                    if (!user) return;
                    await supabase.rpc('toggle_post_like', { post_id_input: id, user_id_input: user.id });
                    
                    const isNowLiked = !currentUserLikes.has(id);
                    // Send notification if liked
                    if (isNowLiked && post.user_id !== user.id) {
                      await supabase.from('notifications').insert({
                        user_id: post.user_id,
                        sender_id: user.id,
                        type: 'like',
                        content: `liked your post: "${post.content?.substring(0, 50)}${post.content?.length > 50 ? '...' : ''}"`,
                        is_read: false
                      });
                    }

                    // Update local state if needed (though FeedCard handles it optimistically)
                    setCurrentUserLikes(prev => {
                      const next = new Set(prev);
                      if (next.has(id)) next.delete(id);
                      else next.add(id);
                      return next;
                    });
                  }}
                  onBookmark={async (id: string) => {
                    const { data: { user } } = await supabase.auth.getUser();
                    if (!user) return;
                    
                    const isBookmarked = currentUserBookmarks.has(id);
                    if (isBookmarked) {
                      await supabase.from('bookmarks').delete().match({ user_id: user.id, post_id: id });
                      setCurrentUserBookmarks(prev => {
                        const next = new Set(prev);
                        next.delete(id);
                        return next;
                      });
                      showToast("Bookmark removed");
                    } else {
                      await supabase.from('bookmarks').insert({ user_id: user.id, post_id: id });
                      setCurrentUserBookmarks(prev => {
                        const next = new Set(prev);
                        next.add(id);
                        return next;
                      });
                      showToast("Post bookmarked!");
                    }
                  }}
                  onComment={(id: string) => {
                    const postData = {
                      id,
                      authorName: profile?.full_name || "User",
                      authorId: post.user_id,
                      authorImage: profile?.avatar_url,
                      description: post.content
                    };
                    window.dispatchEvent(new CustomEvent('open-comment', { detail: postData }));
                  }}
                  onShare={(id: string) => {
                    const postData = {
                      id,
                      authorName: profile?.full_name || "User",
                      authorImage: profile?.avatar_url,
                      description: post.content
                    };
                    window.dispatchEvent(new CustomEvent('open-share', { detail: postData }));
                  }}
                />
              ))
            ) : (
              <div className="py-16 flex flex-col items-center justify-center text-center">
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
          <div className="flex flex-col gap-4">
            {savedPosts.length > 0 ? (
              savedPosts.map((post) => (
                <FeedCard 
                  key={post.id}
                  id={post.id}
                  authorName={post.profiles?.full_name || "User"}
                  authorImage={post.profiles?.avatar_url}
                  timePosted={new Date(post.created_at).toLocaleDateString()}
                  postImage={post.image_url}
                  likes={post.likes_count || 0}
                  comments={post.comments_count || 0}
                  description={post.content}
                  authorId={post.user_id}
                  currentUserId={profile?.id}
                  isBookmarked={true}
                  isLiked={currentUserLikes.has(post.id)}
                  isReposted={currentUserReposts.has(post.id)}
                  onRepost={handleRepost}
                  onLike={async (id: string) => {
                    const { data: { user } } = await supabase.auth.getUser();
                    if (!user) return;
                    await supabase.rpc('toggle_post_like', { post_id_input: id, user_id_input: user.id });
                    
                    setCurrentUserLikes(prev => {
                      const next = new Set(prev);
                      if (next.has(id)) next.delete(id);
                      else next.add(id);
                      return next;
                    });
                  }}
                  onBookmark={async (id: string) => {
                    await supabase.from('bookmarks').delete().match({ user_id: profile.id, post_id: id });
                    setSavedPosts(savedPosts.filter(p => p.id !== id));
                  }}
                />
              ))
            ) : (
              <div className="py-16 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center justify-center mb-4 border border-zinc-200 dark:border-zinc-800 shadow-sm">
                  <Bookmark className="text-zinc-400 dark:text-zinc-600 w-8 h-8" />
                </div>
                <p className="font-bold text-lg text-black dark:text-white mb-1">No Bookmarks</p>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm">Posts you bookmark will appear here for quick access.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "reposts" && (
          <div className="flex flex-col gap-4">
            {reposts.length > 0 ? (
              reposts.map((repost) => (
                <FeedCard 
                  key={repost.id}
                  id={repost.post_id}
                  authorName={repost.posts.profiles?.full_name || "User"}
                  authorImage={repost.posts.profiles?.avatar_url}
                  timePosted={new Date(repost.posts.created_at).toLocaleDateString()}
                  postImage={repost.posts.image_url}
                  likes={repost.posts.likes_count || 0}
                  comments={repost.posts.comments_count || 0}
                  description={repost.posts.content}
                  authorId={repost.posts.user_id}
                  currentUserId={profile?.id}
                  isLiked={currentUserLikes.has(repost.post_id)}
                  isBookmarked={currentUserBookmarks.has(repost.post_id)}
                  isReposted={true}
                  onRepost={handleRepost}
                  onLike={async (id: string) => {
                    const { data: { user } } = await supabase.auth.getUser();
                    if (!user) return;
                    await supabase.rpc('toggle_post_like', { post_id_input: id, user_id_input: user.id });
                    
                    setCurrentUserLikes(prev => {
                      const next = new Set(prev);
                      if (next.has(id)) next.delete(id);
                      else next.add(id);
                      return next;
                    });
                  }}
                  onBookmark={async (id: string) => {
                    const { data: { user } } = await supabase.auth.getUser();
                    if (!user) return;
                    
                    const isBookmarked = currentUserBookmarks.has(id);
                    if (isBookmarked) {
                      await supabase.from('bookmarks').delete().match({ user_id: user.id, post_id: id });
                      setCurrentUserBookmarks(prev => {
                        const next = new Set(prev);
                        next.delete(id);
                        return next;
                      });
                      showToast("Bookmark removed");
                    } else {
                      await supabase.from('bookmarks').insert({ user_id: user.id, post_id: id });
                      setCurrentUserBookmarks(prev => {
                        const next = new Set(prev);
                        next.add(id);
                        return next;
                      });
                      showToast("Post bookmarked!");
                    }
                  }}
                />
              ))
            ) : (
              <div className="py-16 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center justify-center mb-4 border border-zinc-200 dark:border-zinc-800 shadow-sm">
                  <Repeat2 className="text-zinc-400 dark:text-zinc-600 w-8 h-8" />
                </div>
                <p className="font-bold text-lg text-black dark:text-white mb-1">No Reposts</p>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm">Posts you repost will appear here for your connections to see.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "tagged" && (
          <div className="py-16 flex flex-col items-center justify-center text-center animate-in fade-in">
            <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center justify-center mb-4 border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <Tag className="text-zinc-400 dark:text-zinc-600 w-8 h-8" />
            </div>
            <p className="font-bold text-lg text-black dark:text-white mb-1">Feature Coming Soon</p>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm">Tagged posts functionality is currently under development.</p>
          </div>
        )}
      </div>

      {/* Edit Profile Slide-up Modal */}
      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 z-[100] flex items-end justify-center">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
              onClick={() => setIsEditing(false)}
            />
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-t-[40px] px-6 pt-3 pb-12 shadow-2xl max-h-[90vh] overflow-y-auto border-t border-zinc-100 dark:border-zinc-800"
            >
              {/* Handle Bar */}
              <div className="flex justify-center mb-6">
                <div className="w-12 h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full" onClick={() => setIsEditing(false)} />
              </div>
              
              <div className="flex items-center justify-between mb-8 px-1">
                <div>
                  <h2 className="text-2xl font-black text-black dark:text-white">Edit Identity</h2>
                  <p className="text-zinc-400 dark:text-zinc-500 text-xs font-bold uppercase tracking-widest mt-0.5">Univas Profile Settings</p>
                </div>
                <button 
                  onClick={() => setIsEditing(false)}
                  className="w-10 h-10 flex items-center justify-center rounded-2xl bg-zinc-50 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 hover:text-black dark:hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-8">
                {/* Names */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-widest px-1">First Name</label>
                    <input 
                      type="text" 
                      value={editFirstName}
                      onChange={(e) => setEditFirstName(e.target.value)}
                      placeholder="First Name"
                      className="w-full bg-zinc-50 dark:bg-zinc-950 rounded-2xl px-5 py-4 text-[15px] font-bold text-black dark:text-white outline-none border border-zinc-100 dark:border-zinc-800 focus:border-[#E5FF66] focus:bg-white dark:focus:bg-zinc-900 transition-all shadow-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-widest px-1">Last Name</label>
                    <input 
                      type="text" 
                      value={editLastName}
                      onChange={(e) => setEditLastName(e.target.value)}
                      placeholder="Last Name"
                      className="w-full bg-zinc-50 dark:bg-zinc-950 rounded-2xl px-5 py-4 text-[15px] font-bold text-black dark:text-white outline-none border border-zinc-100 dark:border-zinc-800 focus:border-[#E5FF66] focus:bg-white dark:focus:bg-zinc-900 transition-all shadow-sm"
                    />
                  </div>
                </div>

                {/* Bio with character counter */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-[10px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-widest">About Me</label>
                    <span className={`text-[10px] font-black ${editBio.length > 150 ? "text-red-500" : "text-zinc-300 dark:text-zinc-700"}`}>
                      {editBio.length}/160
                    </span>
                  </div>
                  <textarea 
                    rows={3}
                    maxLength={160}
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    placeholder="Tell us about yourself..."
                    className="w-full bg-zinc-50 dark:bg-zinc-950 rounded-3xl px-6 py-5 text-[15px] font-medium text-black dark:text-white outline-none border border-zinc-100 dark:border-zinc-800 focus:border-[#E5FF66] focus:bg-white dark:focus:bg-zinc-900 transition-all resize-none shadow-sm leading-relaxed"
                  />
                </div>

                {/* Academic Identity */}
                <div className="space-y-6 pt-2 border-t border-zinc-50 dark:border-zinc-800/50">
                  <h3 className="text-[11px] font-black text-zinc-300 dark:text-zinc-700 uppercase tracking-[0.2em] px-1">Academic Status</h3>
                  
                  <div className="space-y-5">
                    <div className="group">
                      <label className="text-[10px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-widest px-1 block mb-2">School Level</label>
                      <div className="relative">
                        <select 
                          value={profile?.level || ""}
                          onChange={(e) => setProfile({...profile, level: e.target.value})}
                          className="w-full bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-2xl px-5 py-4 text-[15px] font-bold text-black dark:text-white outline-none appearance-none group-focus-within:border-[#E5FF66] transition-all"
                        >
                          <option value="100 Level" className="dark:bg-zinc-950">100 Level</option>
                          <option value="200 Level" className="dark:bg-zinc-950">200 Level</option>
                          <option value="300 Level" className="dark:bg-zinc-950">300 Level</option>
                          <option value="400 Level" className="dark:bg-zinc-950">400 Level</option>
                          <option value="500 Level" className="dark:bg-zinc-950">500 Level</option>
                          <option value="Graduate" className="dark:bg-zinc-950">Graduate</option>
                        </select>
                        <ChevronRight size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-300 dark:text-zinc-700 rotate-90 pointer-events-none" />
                      </div>
                    </div>

                    <div className="bg-[#1A1A24] p-6 rounded-[32px] text-white/90 relative overflow-hidden group">
                       <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-12 -mt-12 blur-2xl" />
                       <div className="relative z-10 flex items-center justify-between">
                         <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Current University</span>
                            <span className="text-sm font-black whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px]">
                              {profile?.universities?.name || "N/A"}
                            </span>
                         </div>
                         <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                            <Package size={18} className="text-[#E5FF66]" />
                         </div>
                       </div>
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <div className="pt-6">
                  <button 
                    onClick={handleSaveProfile}
                    disabled={isUpdating}
                    className="w-full bg-[#E5FF66] text-black py-5 rounded-[28px] font-black text-sm uppercase tracking-widest shadow-xl shadow-[#E5FF66]/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {isUpdating ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Syncing...
                      </>
                    ) : (
                      <>
                        <Check size={18} strokeWidth={3} />
                        Save Profile
                      </>
                    )}
                  </button>
                  <button 
                    onClick={() => setIsEditing(false)}
                    className="w-full mt-4 py-3 text-zinc-400 dark:text-zinc-600 text-sm font-bold hover:text-black dark:hover:text-white transition-colors"
                  >
                    Discard Changes
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
              className="w-full max-w-[340px] bg-white dark:bg-zinc-900 rounded-[40px] px-6 pt-8 pb-10 shadow-2xl relative z-20 border border-zinc-100 dark:border-zinc-800"
            >
              <h2 className="text-xl font-black text-black dark:text-white mb-8 px-1 text-center font-sans tracking-tight">Profile Photo</h2>

              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={handleCameraClick}
                  className="flex flex-col items-center justify-center gap-4 bg-zinc-50 dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-900 p-6 rounded-[32px] transition-all active:scale-95 group border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800"
                >
                  <div className="w-14 h-14 bg-white dark:bg-zinc-900 rounded-2xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-all">
                    <Camera size={28} className="text-black dark:text-white" />
                  </div>
                  <span className="font-bold text-[13px] text-black dark:text-zinc-300">Take Photo</span>
                </button>

                <button 
                  onClick={handleGalleryClick}
                  className="flex flex-col items-center justify-center gap-4 bg-zinc-50 dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-900 p-6 rounded-[32px] transition-all active:scale-95 group border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800"
                >
                  <div className="w-14 h-14 bg-white dark:bg-zinc-900 rounded-2xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-all">
                    <ImagePlus size={28} className="text-black dark:text-white" />
                  </div>
                  <span className="font-bold text-[13px] text-black dark:text-zinc-300">Gallery</span>
                </button>
              </div>

              <button 
                onClick={() => setShowPhotoOptions(false)}
                className="mt-8 w-full py-4 bg-zinc-100 dark:bg-zinc-800 rounded-2xl text-sm font-bold text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:text-black dark:hover:text-white transition active:scale-95"
              >
                Cancel
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Bottom Navigation */}
      <BottomNavigation />
      
      {/* Floating Action Button - Enhanced Centering */}
      <div className="fixed inset-x-0 bottom-[92px] flex justify-center pointer-events-none z-[70] px-6">
        <div className="w-full max-w-md flex justify-end">
          <Link 
            href="/create" 
            className="w-14 h-14 bg-[#E5FF66] text-black rounded-2xl flex items-center justify-center shadow-[0_8px_30px_rgb(229,255,102,0.4)] hover:shadow-[0_12px_40px_rgb(229,255,102,0.5)] active:scale-90 transition-all duration-300 pointer-events-auto border-2 border-white dark:border-black group relative"
          >
            <Plus className="w-8 h-8 group-hover:rotate-90 transition-transform duration-300" strokeWidth={3} />
            <div className="absolute inset-0 bg-[#E5FF66] rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity pointer-events-none" />
          </Link>
        </div>
      </div>
      
      <ConnectionsModal 
        isOpen={isConnectionsOpen}
        onClose={() => setIsConnectionsOpen(false)}
        userId={profile?.id}
        userName={capitalizeName(profile?.full_name || "User")}
      />
      
      {/* Premium Crop Modal */}
      <AnimatePresence>
        {isCropModalOpen && tempImageUrl && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col p-6 items-center justify-center overflow-hidden"
          >
            <div className="w-full flex items-center justify-between mb-8 max-w-sm">
              <button 
                onClick={() => {
                  setIsCropModalOpen(false);
                  setTempImageUrl(null);
                  setZoom(1);
                }}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-all active:scale-95"
              >
                <X size={20} />
              </button>
              <h3 className="font-bold text-lg text-white">Adjust Photo</h3>
              <div className="w-10" />
            </div>

            <div 
              className="relative w-full aspect-square max-w-sm rounded-[32px] overflow-hidden border-4 border-[#E5FF66]/20 shadow-2xl touch-none"
              onTouchStart={handlePinchStart}
              onTouchMove={handlePinchMove}
            >
               {/* Center Guide Hole Overlay */}
               <div className="absolute inset-0 z-10 pointer-events-none">
                 <div className="w-full h-full border-[60px] border-black/60 flex items-center justify-center">
                    <div className="w-full h-full rounded-full border border-white/30 shadow-[0_0_0_1000px_rgba(0,0,0,0.6)]"></div>
                 </div>
               </div>
               
               <motion.div 
                 drag 
                 dragElastic={0.1}
                 dragConstraints={{ top: -200, bottom: 200, left: -200, right: 200 }}
                 className="w-full h-full cursor-move"
               >
                 <div className="w-full h-full flex items-center justify-center" style={{ transform: `scale(${zoom})` }}>
                   <Image 
                     src={tempImageUrl} 
                     alt="Crop Preview" 
                     fill 
                     className="object-contain pointer-events-none" 
                   />
                 </div>
               </motion.div>
            </div>

            <div className="mt-12 w-full max-w-sm px-4">
              <div className="flex flex-col gap-6">
                {/* Custom Styled Zoom Slider */}
                <div className="flex items-center gap-4 text-white/50">
                  <span className="text-xs font-black">1X</span>
                  <input 
                    type="range" 
                    min="1" 
                    max="3" 
                    step="0.01" 
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    className="flex-1 accent-[#E5FF66] h-1.5 rounded-full cursor-pointer appearance-none bg-white/10"
                  />
                  <span className="text-xs font-black">3X</span>
                </div>

                <p className="text-zinc-400 text-xs font-medium text-center">Pinch or drag to position your photo</p>
                
                <button 
                  onClick={handleConfirmedCrop}
                  disabled={isFinalizingUpload}
                  className="w-full py-4 rounded-2xl bg-[#E5FF66] text-black font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl active:scale-95 disabled:opacity-50 transition-all shadow-[#E5FF66]/20"
                >
                  {isFinalizingUpload ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Confirm Photo"
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
