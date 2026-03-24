"use client";

import { useEffect, useState, useRef } from "react";
import { ArrowLeft, Settings, Grid, Bookmark, Tag, ChevronRight, Edit3, Camera, CheckCircle2, Loader2, User, Trash2, X, Maximize2, ImagePlus } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import BottomNavigation from "@/components/BottomNavigation";
import { createClient } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import Toast from "@/components/Toast";
import FeedCard from "@/components/FeedCard";

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
  const [savedPosts, setSavedPosts] = useState<any[]>([]);
  const [connectionCount, setConnectionCount] = useState(0);
  const [currentUserLikes, setCurrentUserLikes] = useState<Set<string>>(new Set());
  const [currentUserBookmarks, setCurrentUserBookmarks] = useState<Set<string>>(new Set());
  
  // Toast State
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
      if (likesData) setCurrentUserLikes(new Set(likesData.map(l => l.post_id)));

      // Fetch user's bookmarks
      const { data: bookmarksData } = await supabase.from('bookmarks').select('post_id').eq('user_id', user.id);
      if (bookmarksData) setCurrentUserBookmarks(new Set(bookmarksData.map(b => b.post_id)));
      
      // Fetch connections count
      const { count: connections } = await supabase
        .from('friends')
        .select('*', { count: 'exact', head: true })
        .or(`user_id1.eq.${user.id},user_id2.eq.${user.id}`);
      
      setConnectionCount(connections || 0);

      setIsLoading(false);
    }

    fetchProfileData();
  }, [router, supabase]);

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
        setSavedPosts(data.map(b => b.posts).filter(Boolean));
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
          content: "[[USER_PROFILE_UPDATE]]",
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
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-900" />
      </div>
    );
  }

  const isProfileComplete = profile?.bio && profile?.full_name !== "New Student" && profile?.avatar_url;

  return (
    <div className="min-h-screen bg-white pb-[100px] max-w-md mx-auto relative font-sans overflow-x-hidden">
      <Toast 
        message={toast.message} 
        type={toast.type} 
        isVisible={toast.isVisible} 
        onClose={() => setToast({ ...toast, isVisible: false })} 
      />
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
          
          <div className="flex items-center justify-center gap-1.5 mb-1 w-full max-w-[280px] mx-auto">
            <h2 className="text-2xl font-black text-black leading-tight truncate">{profile?.full_name || "New Student"}</h2>
            {profile?.full_name !== "New Student" && <CheckCircle2 size={18} className="fill-black text-white shrink-0" />}
          </div>
          <p className="text-zinc-500 text-[14px] font-medium mb-4">{profile?.username} • {profile?.level || "Undergraduate"}</p>
          
          <div className="flex gap-4 w-full">
            <button 
              onClick={() => setIsEditing(true)}
              className="w-full bg-[#1A1A24] text-white py-3 rounded-2xl text-[15px] font-bold shadow-[0_4px_10px_rgba(26,26,36,0.2)] active:scale-95 transition flex items-center justify-center gap-2"
            >
              <Edit3 size={18} />
              Edit Profile
            </button>
          </div>
        </div>
      </div>

      {/* Stats Section - Modern Look */}
      <div className="flex justify-around py-8 px-10 bg-white mx-0 border-b border-zinc-50">
        <div className="flex flex-col items-center gap-1 group cursor-pointer w-1/2">
          <span className="text-2xl font-black text-black group-hover:scale-110 transition-transform">{posts.length}</span>
          <span className="text-[10px] text-zinc-400 font-black uppercase tracking-[0.2em]">Posts</span>
        </div>
        <div className="w-[1px] h-10 bg-zinc-100" />
        <div className="flex flex-col items-center gap-1 group cursor-pointer w-1/2">
          <span className="text-2xl font-black text-black group-hover:scale-110 transition-transform">{connectionCount}</span>
          <span className="text-[10px] text-zinc-400 font-black uppercase tracking-[0.2em]">Connections</span>
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

        {/* Redesigned Profile Completion Progress */}
        {!isProfileComplete && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 bg-[#1A1A24] rounded-[32px] p-6 shadow-2xl relative overflow-hidden group"
          >
            {/* Subtle light effect */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#E5FF66]/5 rounded-full blur-3xl -mr-10 -mt-10" />
            
            <div className="relative z-10">
              <div className="flex justify-between items-end mb-4">
                <div>
                  <h3 className="text-white font-black text-xl mb-1 tracking-tight">Profile Strength</h3>
                  <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Complete your identity</p>
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
              <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden mb-6">
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
                className="w-full bg-white text-black py-4 rounded-2xl text-[14px] font-black tracking-tight hover:bg-[#E5FF66] transition-all active:scale-[0.98] shadow-lg shadow-black/20"
              >
                Continue Setup
              </button>
            </div>
          </motion.div>
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

      {/* Tabs - Sleek Apple-style */}
      <div className="px-6 flex items-center mb-6 sticky top-[72px] bg-white/80 backdrop-blur-md z-10 py-2">
        <div className="flex-1 flex bg-zinc-50 p-1 rounded-2xl relative">
          <button 
            onClick={() => setActiveTab("posts")}
            className={`flex-1 py-3.5 flex items-center justify-center gap-2 rounded-xl transition-all relative z-10 ${activeTab === "posts" ? "text-black font-black" : "text-zinc-400 font-bold hover:text-zinc-600"}`}
          >
            <Grid size={18} />
            <span className="text-xs">Posts</span>
          </button>
          <button 
            onClick={() => setActiveTab("saved")}
            className={`flex-1 py-3.5 flex items-center justify-center gap-2 rounded-xl transition-all relative z-10 ${activeTab === "saved" ? "text-black font-black" : "text-zinc-400 font-bold hover:text-zinc-600"}`}
          >
            <Bookmark size={18} />
            <span className="text-xs">Bookmarks</span>
          </button>
          
          {/* Active indicator pill */}
          <motion.div 
            layoutId="tab-pill"
            className="absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] bg-white rounded-xl shadow-sm border border-zinc-100"
            animate={{ x: activeTab === "posts" ? 0 : "100%" }}
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
                  authorName={profile?.full_name || "User"}
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
                  onDelete={async (id: string) => {
                    const { error } = await supabase.from('posts').delete().eq('id', id);
                    if (!error) {
                      setPosts(posts.filter(p => p.id !== id));
                      showToast("Post deleted");
                    }
                  }}
                  onLike={async (id: string) => {
                    const { data: { user } } = await supabase.auth.getUser();
                    if (!user) return;
                    await supabase.rpc('toggle_post_like', { post_id_input: id, user_id_input: user.id });
                    
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
                  onBookmark={async (id: string) => {
                    await supabase.from('bookmarks').delete().match({ user_id: profile.id, post_id: id });
                    setSavedPosts(savedPosts.filter(p => p.id !== id));
                  }}
                />
              ))
            ) : (
              <div className="py-16 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mb-4">
                  <Bookmark className="text-zinc-400 w-8 h-8" />
                </div>
                <p className="font-bold text-lg text-black mb-1">No Bookmarks</p>
                <p className="text-zinc-500 text-sm">Posts you bookmark will appear here for quick access.</p>
              </div>
            )}
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
                    className="w-full bg-zinc-100 rounded-2xl px-5 py-4 text-[15px] font-bold text-black outline-none focus:ring-2 focus:ring-[#E5FF66] transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2 px-1">Last Name</label>
                  <input 
                    type="text" 
                    value={editLastName}
                    onChange={(e) => setEditLastName(e.target.value)}
                    placeholder="Doe"
                    className="w-full bg-zinc-100 rounded-2xl px-5 py-4 text-[15px] font-bold text-black outline-none focus:ring-2 focus:ring-[#E5FF66] transition-all"
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
                  className="w-full bg-zinc-100 rounded-2xl px-5 py-4 text-[15px] font-medium text-black outline-none focus:ring-2 focus:ring-[#E5FF66] transition-all resize-none"
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
