"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { Plus, User, Loader2, Camera, Edit2, X, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import StoryViewer from "./StoryViewer";
import Toast from "./Toast";

const COLORS = ["#E5FF66", "#FF6666", "#66B2FF", "#B266FF", "#FFB266", "#66FFB2"];

export default function StoriesBar() {
  const [supabase] = useState(() => createClient());
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [campusStudents, setCampusStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Real stories state
  const [activeStoryUser, setActiveStoryUser] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isTextModalOpen, setIsTextModalOpen] = useState(false);
  const [isChoiceMenuOpen, setIsChoiceMenuOpen] = useState(false);
  const [storyText, setStoryText] = useState("");
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [refreshKey, setRefreshKey] = useState(0);

  // Toast State
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" | "warning"; isVisible: boolean }>({
    message: "",
    type: "success",
    isVisible: false,
  });

  const showToast = (message: string, type: "success" | "error" | "info" | "warning" = "success") => {
    setToast({ message, type, isVisible: true });
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;

    async function fetchCampusData() {
      // 1. Get current user session
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        setLoading(false);
        return;
      }

      // 2. Get current user's profile info
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      setCurrentUser(profile);

      if (profile?.university_id) {
        // 3. Get connections to filter stories
        const { data: friendsData } = await supabase
          .from('friends')
          .select('user_id1, user_id2')
          .or(`user_id1.eq.${authUser.id},user_id2.eq.${authUser.id}`);
          
        const friendIds = friendsData?.map(f => f.user_id1 === authUser.id ? f.user_id2 : f.user_id1) || [];
        const allowedUserIds = [authUser.id, ...friendIds];

        // 4. Fetch active stories from the user and their connections
        const now = new Date().toISOString();
        const { data: storiesData } = await supabase
          .from('stories')
          .select(`
            *,
            profiles:user_id (id, username, full_name, avatar_url)
          `)
          .in('user_id', allowedUserIds)
          .gt('expires_at', now)
          .order('created_at', { ascending: true });

        // Group stories by user
        const storyGroups = new Map();
        storiesData?.forEach((story: any) => {
          const userId = story.user_id;
          if (!storyGroups.has(userId)) {
            storyGroups.set(userId, {
              user: story.profiles,
              stories: []
            });
          }
          storyGroups.get(userId).stories.push({
            id: story.id,
            image_url: story.image_url,
            content: story.content,
            background_color: story.background_color,
            created_at: story.created_at
          });
        });

        const studentsWithStories = Array.from(storyGroups.values());

        // Combine: Only local people with stories
        const combined = studentsWithStories.map(s => ({ 
          ...s.user, 
          stories: s.stories, 
          hasStory: true 
        }));

        setCampusStudents(combined);

        // Auto-refresh when the next story expires
        if (storiesData && storiesData.length > 0) {
          const nextExpiry = Math.min(...storiesData.map((s: any) => new Date(s.expires_at).getTime()));
          const msUntilExpiry = nextExpiry - Date.now();
          if (msUntilExpiry > 0) {
            timer = setTimeout(() => setRefreshKey(prev => prev + 1), msUntilExpiry + 1000);
          }
        }
      }
      setLoading(false);
    }

    fetchCampusData();

    // 5. Realtime subscription for stories and profiles
    const channel = supabase
      .channel('stories-activity')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'stories' }, () => fetchCampusData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => fetchCampusData())
      .subscribe();

    return () => {
      if (timer) clearTimeout(timer);
      supabase.removeChannel(channel);
    };
  }, [supabase, refreshKey]);

  const handleStoryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${currentUser.id}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // 1. Upload to 'stories' bucket
      const { error: uploadError } = await supabase.storage
        .from('stories')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('stories')
        .getPublicUrl(filePath);

      // 2. Insert into 'stories' table
      const { error: insertError } = await supabase
        .from('stories')
        .insert({
          user_id: currentUser.id,
          university_id: currentUser.university_id,
          image_url: publicUrl
        });

      if (insertError) throw insertError;
      
      setRefreshKey(prev => prev + 1);
    } catch (err: any) {
      console.error("Story upload failed:", err.message);
      showToast("Failed to upload story. Please check your connection.", "error");
    } finally {
      setIsUploading(false);
      setIsChoiceMenuOpen(false);
    }
  };

  const handleDeleteStories = async () => {
    if (!currentUser) return;
    
    // We'll keep window.confirm for now as it's a critical action, 
    // but the user mostly complained about the success/error alerts.
    if (!confirm("Delete all your active stories?")) return;
    
    setIsUploading(true);
    try {
      const { error } = await supabase
        .from('stories')
        .delete()
        .eq('user_id', currentUser.id);
      if (error) throw error;
      setRefreshKey(prev => prev + 1);
      showToast("All stories deleted successfully!");
    } catch (err: any) {
      showToast("Failed to delete story: " + err.message, "error");
    } finally {
      setIsUploading(false);
      setIsChoiceMenuOpen(false);
    }
  };

  const handleTextStoryUpload = async () => {
    if (!storyText.trim() || !currentUser) return;
    setIsUploading(true);
    try {
      const { error } = await supabase
        .from('stories')
        .insert({
          user_id: currentUser.id,
          university_id: currentUser.university_id,
          content: storyText.trim(),
          background_color: selectedColor
        });
      if (error) throw error;
      setStoryText("");
      setIsTextModalOpen(false);
      setRefreshKey(prev => prev + 1);
      showToast("Status posted successfully!");
    } catch (err: any) {
      showToast("Failed to post status: " + err.message, "error");
    } finally {
      setIsUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full bg-white pt-2 pb-4">
        <div className="flex gap-4 overflow-x-auto px-4 scrollbar-hide">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex flex-col items-center gap-2 animate-pulse">
              <div className="w-[72px] h-[72px] rounded-full bg-zinc-100" />
              <div className="w-10 h-2 bg-zinc-100 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Find current user's story if it exists
  const currentUserEntry = campusStudents.find(s => s.id === currentUser?.id);
  const myStories = currentUserEntry?.stories || [];

  return (
    <div className="w-full bg-white pt-2 pb-4">
      <Toast 
        message={toast.message} 
        type={toast.type} 
        isVisible={toast.isVisible} 
        onClose={() => setToast({ ...toast, isVisible: false })} 
      />
      <div className="flex gap-4 overflow-x-auto px-4 scrollbar-hide shrink-0 items-start">
        <AnimatePresence>
          {/* "You" Story Circle */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-1 shrink-0"
          >
            <div className="relative group">
              <div 
                onClick={() => myStories.length > 0 && setActiveStoryUser({ user: currentUser, stories: myStories })}
                className={`flex h-[72px] w-[72px] items-center justify-center rounded-full ${myStories.length > 0 ? "bg-gradient-to-tr from-[#E5FF66] to-[#4ADE80] p-[2.5px]" : "bg-transparent cursor-pointer"}`}
              >
                <div className={`flex h-full w-full items-center justify-center rounded-full bg-white ${myStories.length > 0 ? "p-0.5" : "border-2 border-zinc-100 p-0.5"}`}>
                  <div className="relative h-full w-full rounded-full overflow-hidden bg-zinc-50 flex items-center justify-center shadow-inner">
                    {currentUser?.avatar_url ? (
                      <Image src={currentUser.avatar_url} alt="You" fill sizes="(max-width: 768px) 72px, 72px" className="object-cover" />
                    ) : (
                      <User className="w-8 h-8 text-zinc-300" />
                    )}
                    {isUploading && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <Loader2 className="w-6 h-6 animate-spin text-white" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="absolute top-[52px] right-0 z-20">
                <button 
                  onClick={() => setIsChoiceMenuOpen(!isChoiceMenuOpen)}
                  disabled={isUploading}
                  className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-[#E5FF66] text-black shadow-md hover:scale-110 active:scale-95 transition-all cursor-pointer"
                >
                  <Plus size={16} strokeWidth={3} />
                </button>

              </div>

              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleStoryUpload} 
                accept="image/*" 
                className="hidden" 
              />
            </div>
            <span className="text-[11px] font-bold text-zinc-900 mt-1">You</span>
          </motion.div>
          {/* ... Rest of student circles (not shown here for brevity but assuming they remain the same) */}

          {/* Campus Student Circles */}
          {campusStudents.filter(s => s.id !== currentUser?.id).map((student) => (
            <motion.div
              layout
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              key={student.id} 
              className="flex flex-col items-center gap-1 shrink-0 cursor-pointer"
              onClick={() => student.hasStory && setActiveStoryUser({ user: student, stories: student.stories })}
            >
              <div className="relative">
                <div className={`flex h-[72px] w-[72px] items-center justify-center rounded-full ${student.hasStory ? "bg-gradient-to-tr from-[#E5FF66] to-[#4ADE80] p-[2.5px] shadow-sm" : "bg-zinc-100 p-[1.5px]"}`}>
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-white p-0.5">
                    <div className="relative h-full w-full rounded-full overflow-hidden bg-zinc-100 flex items-center justify-center">
                      {student.avatar_url ? (
                        <Image src={student.avatar_url} alt={student.username} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-zinc-100 text-zinc-400 font-bold text-sm">
                          {student.username?.charAt(1).toUpperCase() || "S"}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {/* Online status indicator can be added here with real presence logic */}
              </div>
              <span className="text-[11px] font-bold text-zinc-600 mt-1 max-w-[70px] truncate">
                {student.full_name?.split(' ')[0] || student.username?.replace('@', '')}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Story Viewer Modal */}
      <AnimatePresence>
        {activeStoryUser && (
          <StoryViewer 
            user={activeStoryUser.user} 
            stories={activeStoryUser.stories} 
            onClose={() => setActiveStoryUser(null)} 
          />
        )}
      </AnimatePresence>

      {/* Choice Menu Modal */}
      <AnimatePresence>
        {isChoiceMenuOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/20 backdrop-blur-sm mx-auto max-w-md" onClick={() => setIsChoiceMenuOpen(false)}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white shadow-2xl rounded-3xl border border-zinc-100 overflow-hidden w-full max-w-[280px] z-[101]"
            >
              <div className="p-4 border-b border-zinc-100 bg-zinc-50/50">
                <h3 className="text-sm font-bold text-center text-zinc-800">Stories</h3>
              </div>
              {myStories.length > 0 && (
                <button 
                  onClick={handleDeleteStories}
                  className="w-full px-4 py-4 flex items-center gap-3 hover:bg-red-50/50 transition-colors text-sm font-bold text-red-600 border-b border-zinc-50"
                >
                  <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-500">
                    <Trash2 size={20} />
                  </div>
                  Delete my Live Stories
                </button>
              )}
              <button 
                onClick={() => { setIsChoiceMenuOpen(false); fileInputRef.current?.click(); }}
                className="w-full px-4 py-4 flex items-center gap-3 hover:bg-zinc-50 transition-colors text-sm font-bold text-zinc-800 border-b border-zinc-50"
              >
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                  <Camera size={20} />
                </div>
                Share a Photo
              </button>
              <button 
                onClick={() => { setIsChoiceMenuOpen(false); setIsTextModalOpen(true); }}
                className="w-full px-4 py-4 flex items-center gap-3 hover:bg-zinc-50 transition-colors text-sm font-bold text-zinc-800"
              >
                <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-500">
                  <Edit2 size={20} />
                </div>
                Type a Status
              </button>
              <button
                onClick={() => setIsChoiceMenuOpen(false)}
                className="w-full px-4 py-3 bg-zinc-50 text-zinc-500 text-xs font-bold hover:bg-zinc-100 transition-colors"
              >
                Cancel
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Text Story Creation Modal */}
      <AnimatePresence>
        {isTextModalOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed inset-0 z-[110] bg-black flex flex-col pt-12 mx-auto max-w-md"
            style={{ backgroundColor: selectedColor }}
          >
            <div className="flex items-center justify-between px-6 mb-12">
              <button onClick={() => setIsTextModalOpen(false)} className="text-black/60 hover:text-black transition-colors">
                <X size={28} />
              </button>
              <button 
                onClick={handleTextStoryUpload}
                disabled={!storyText.trim() || isUploading}
                className="px-6 py-2 bg-black text-white rounded-full font-bold text-sm disabled:opacity-50 transition-opacity"
              >
                {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Post status"}
              </button>
            </div>

            <div className="flex-1 flex items-center justify-center px-8">
              <textarea
                autoFocus
                value={storyText}
                onChange={(e) => setStoryText(e.target.value.slice(0, 100))}
                className="w-full h-64 bg-transparent border-none text-center text-4xl font-black text-black placeholder:text-black/20 outline-none resize-none scrollbar-hide"
                placeholder="What's your status?"
              />
            </div>

            {/* Color Selectors */}
            <div className="pb-12 px-6 flex justify-center gap-4">
              {COLORS.map(color => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`w-10 h-10 rounded-full border-2 transition-transform ${selectedColor === color ? "border-black scale-125" : "border-transparent"}`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

