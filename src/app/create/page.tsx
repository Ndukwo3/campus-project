"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { ArrowLeft, Loader2, Image as ImageIcon, Link2, AtSign } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase";

function CreatePostInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const groupId = searchParams.get('group_id');
  const supabase = createClient();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    async function fetchUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        setUserProfile(profile);
      }
    }
    fetchUser();
  }, [supabase]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const insertText = (text: string) => {
    setContent(prev => prev + text);
    textareaRef.current?.focus();
  };

  const handlePost = async () => {
    if (!content.trim() && !imageFile) return;

    setIsSubmitting(true);
    setError(null);

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    if (!userProfile?.university_id) {
      setError("Please complete your profile to post.");
      setIsSubmitting(false);
      return;
    }

    sessionStorage.setItem('isPosting', 'true');

    if (groupId) {
      router.push(`/groups/${groupId}`);
    } else {
      router.push("/");
    }

    const uploadAndInsert = async () => {
      try {
        let imageUrl = null;

        if (imageFile) {
          const fileExt = imageFile.name.split('.').pop();
          const fileName = `${user.id}-${Math.random()}.${fileExt}`;
          const filePath = `${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('posts')
            .upload(filePath, imageFile);

          if (uploadError) {
            console.error("Upload error:", uploadError);
            return;
          }

          const { data: { publicUrl } } = supabase.storage
            .from('posts')
            .getPublicUrl(filePath);

          imageUrl = publicUrl;
        }

        const { error: postError } = await supabase
          .from("posts")
          .insert({
            user_id: user.id,
            university_id: userProfile.university_id,
            group_id: groupId || null,
            content: content.trim(),
            image_url: imageUrl
          });

        if (postError) {
          console.error("Full Post Error:", postError);
        }
      } catch (err) {
        console.error("Background task failed:", err);
      }
    };

    uploadAndInsert();
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black max-w-md mx-auto relative font-sans flex flex-col transition-colors">
      {/* Premium Glass Header */}
      <div className="sticky top-0 z-30 bg-white/80 dark:bg-black/80 backdrop-blur-xl px-4 py-4 flex items-center justify-between border-b border-zinc-100/50 dark:border-zinc-800/50">
        <div className="flex items-center gap-3">
          <Link href="/" className="w-10 h-10 flex items-center justify-center rounded-full bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors active:scale-95 text-zinc-800 dark:text-zinc-200">
            <ArrowLeft size={20} />
          </Link>
          <span className="font-extrabold text-[16px] tracking-tight text-zinc-900 dark:text-white">New Post</span>
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 px-5 py-6 flex flex-col relative">
        <div className="absolute top-10 right-0 w-64 h-64 bg-[#E5FF66]/5 rounded-full blur-3xl pointer-events-none -z-10" />

        {error && (
          <div className="bg-red-50 dark:bg-red-500/10 text-red-500 dark:text-red-400 px-4 py-3 rounded-2xl text-[13px] font-medium mb-4 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></div>
            {error}
          </div>
        )}

        <div className="flex gap-4 flex-1">
          {/* Avatar Area */}
          <div className="shrink-0 pt-1">
            <div className="relative">
              <div className="w-11 h-11 rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                {userProfile?.avatar_url ? (
                  <Image src={userProfile.avatar_url} alt="You" width={44} height={44} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 text-zinc-500 dark:text-zinc-400 font-bold text-lg">
                    {userProfile?.full_name?.charAt(0) || userProfile?.username?.charAt(0) || "?"}
                  </div>
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#4ADE80] rounded-full border-2 border-white dark:border-black"></div>
            </div>
            <div className="w-px h-full min-h-[100px] bg-zinc-100 dark:bg-zinc-800 mx-auto mt-2"></div>
          </div>

          <div className="flex-1 flex flex-col min-w-0">
            <div className="mb-1 flex items-center gap-1.5">
              <span className="font-bold text-[15px] tracking-tight text-zinc-900 dark:text-white">{userProfile?.full_name || userProfile?.username || "Loading..."}</span>
              <span className="text-[12px] text-zinc-400 dark:text-zinc-600 font-medium">· Just now</span>
            </div>
            <textarea
              ref={textareaRef}
              autoFocus
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's happening on your campus?"
              className="w-full text-[17px] text-zinc-900 dark:text-white border-none outline-none resize-none min-h-[30vh] bg-transparent pt-1 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 font-medium leading-[1.6]"
            />

            {imagePreview && (
              <div className="relative mt-4 rounded-2xl overflow-hidden border border-zinc-100 dark:border-zinc-800 group">
                <img src={imagePreview} alt="Preview" className="w-full h-auto max-h-[300px] object-cover" />
                <button
                  onClick={(e) => { e.preventDefault(); setImageFile(null); setImagePreview(null); }}
                  className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <span className="text-xl leading-none">&times;</span>
                </button>
              </div>
            )}

            {/* Integrated Toolbar */}
            <div className="mt-8 flex items-center justify-between py-2 border-t border-zinc-100/50 dark:border-zinc-800/50 pt-4">
              <div className="flex items-center gap-6 text-zinc-400 dark:text-zinc-600">
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); document.getElementById('image-input')?.click(); }}
                  className="hover:text-zinc-600 dark:hover:text-[#E5FF66] transition-colors"
                >
                  <ImageIcon size={22} />
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); insertText(" https://"); }}
                  className="hover:text-zinc-600 dark:hover:text-[#E5FF66] transition-colors"
                >
                  <Link2 size={22} />
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); insertText(" @"); }}
                  className="hover:text-zinc-600 dark:hover:text-[#E5FF66] transition-colors"
                >
                  <AtSign size={22} />
                </button>
              </div>

              <button
                onClick={(e) => { e.preventDefault(); handlePost(); }}
                disabled={(!content.trim() && !imageFile) || isSubmitting}
                className={`px-8 py-2.5 rounded-full font-black text-[14px] tracking-wide transition-all duration-300 flex items-center gap-2 shadow-sm ${
                  (content.trim() || imageFile)
                  ? "bg-[#E5FF66] text-black shadow-[0_4px_15px_rgba(229,255,102,0.4)] dark:shadow-none hover:scale-105 active:scale-95"
                  : "bg-zinc-100 dark:bg-zinc-900 text-zinc-300 dark:text-zinc-700 cursor-not-allowed"
                }`}
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Post
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        type="file"
        id="image-input"
        hidden
        accept="image/*"
        onChange={handleImageSelect}
      />
    </div>
  );
}

export default function CreatePostPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-zinc-100 dark:border-zinc-800 border-t-[#E5FF66] animate-spin" />
      </div>
    }>
      <CreatePostInner />
    </Suspense>
  );
}
