"use client";

import { ArrowLeft, Bookmark, Heart, Share2, MessageCircle, UserX, VolumeX, X, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const SAVED_POSTS = [
  { id: 1, title: "Tips for JAMB 2026 preparation", author: "@chukwuemeka_cs" },
  { id: 2, title: "How I got an internship at a Big 4 firm", author: "@adaobi_mgt" },
  { id: 3, title: "Best cafeteria spots on campus ranked", author: "@futo.foodie" },
];
const LIKED_POSTS = [
  { id: 1, title: "Lecture slides for CSC 403", author: "@prof_okafor" },
  { id: 2, title: "Campus hackathon results!", author: "@techclub_futo" },
];

function PostListModal({
  title,
  posts,
  emptyIcon: EmptyIcon,
  emptyText,
  onClose,
}: {
  title: string;
  posts: { id: number; title: string; author: string }[];
  emptyIcon: React.ElementType;
  emptyText: string;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-t-[32px] w-full max-w-md p-6 pb-10 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-black text-xl text-black">{title}</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-zinc-100 hover:bg-zinc-200 transition">
            <X size={16} />
          </button>
        </div>

        {posts.length === 0 ? (
          <div className="flex flex-col items-center py-8 gap-2 text-center">
            <EmptyIcon size={40} className="text-zinc-300 mb-2" />
            <p className="font-bold text-zinc-500">{emptyText}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {posts.map(post => (
              <div key={post.id} className="bg-zinc-50 rounded-2xl p-4 flex flex-col gap-1">
                <span className="font-bold text-[15px] text-zinc-900">{post.title}</span>
                <span className="text-[13px] text-zinc-500">{post.author}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function UserListModal({
  title,
  emptyText,
  emptyIcon: EmptyIcon,
  onClose,
}: {
  title: string;
  emptyText: string;
  emptyIcon: React.ElementType;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-t-[32px] w-full max-w-md p-6 pb-10" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-black text-xl text-black">{title}</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-zinc-100 hover:bg-zinc-200 transition">
            <X size={16} />
          </button>
        </div>
        <div className="flex flex-col items-center py-8 gap-2 text-center">
          <EmptyIcon size={40} className="text-zinc-300 mb-2" />
          <p className="font-bold text-zinc-500">{emptyText}</p>
          <p className="text-[13px] text-zinc-400">Users you {title.toLowerCase()} will appear here.</p>
        </div>
      </div>
    </div>
  );
}

export default function ActivitySettingsPage() {
  const [modal, setModal] = useState<"saved" | "liked" | "shared" | "comments" | "blocked" | "muted" | null>(null);

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-black pb-[100px] max-w-md mx-auto relative font-sans transition-colors">

      {modal === "saved" && (
        <PostListModal title="Saved Posts" posts={SAVED_POSTS} emptyIcon={Bookmark} emptyText="No saved posts yet" onClose={() => setModal(null)} />
      )}
      {modal === "liked" && (
        <PostListModal title="Liked Posts" posts={LIKED_POSTS} emptyIcon={Heart} emptyText="No liked posts yet" onClose={() => setModal(null)} />
      )}
      {modal === "shared" && (
        <PostListModal title="Shared Posts" posts={[]} emptyIcon={Share2} emptyText="No shared posts yet" onClose={() => setModal(null)} />
      )}
      {modal === "comments" && (
        <PostListModal title="Comment History" posts={[]} emptyIcon={MessageCircle} emptyText="No comments yet" onClose={() => setModal(null)} />
      )}
      {modal === "blocked" && (
        <UserListModal title="Blocked" emptyText="No blocked users" emptyIcon={UserX} onClose={() => setModal(null)} />
      )}
      {modal === "muted" && (
        <UserListModal title="Muted" emptyText="No muted users" emptyIcon={VolumeX} onClose={() => setModal(null)} />
      )}

      <div className="flex items-center justify-between px-6 py-4 sticky top-0 bg-[#F8F9FA]/80 dark:bg-black/80 backdrop-blur-md z-10 border-b border-zinc-100 dark:border-zinc-800/50">
        <Link href="/settings" className="w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition shadow-sm shrink-0 border border-transparent dark:border-zinc-800">
          <ArrowLeft size={20} className="text-black dark:text-white" />
        </Link>
        <span className="font-bold text-[14px] uppercase tracking-[0.2em] text-black dark:text-white">Activity</span>
        <div className="w-10 h-10" />
      </div>

      <main className="px-4 pt-6 space-y-8">

        {/* Your Content */}
        <section>
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 px-4 shadow-none">
            Your Content
          </h3>
          <div className="bg-white rounded-[24px] shadow-sm border border-zinc-100/50 overflow-hidden">

            {[
              { key: "saved", icon: Bookmark, iconBg: "bg-zinc-100", iconColor: "text-zinc-600", label: "Saved Posts", count: SAVED_POSTS.length },
              { key: "liked", icon: Heart, iconBg: "bg-red-50", iconColor: "text-red-500", label: "Liked Posts", count: LIKED_POSTS.length },
              { key: "shared", icon: Share2, iconBg: "bg-blue-50", iconColor: "text-blue-500", label: "Shared Posts", count: 0 },
              { key: "comments", icon: MessageCircle, iconBg: "bg-zinc-100", iconColor: "text-zinc-600", label: "Comment History", count: 0 },
            ].map(({ key, icon: Icon, iconBg, iconColor, label, count }, i, arr) => (
              <button
                key={key}
                onClick={() => setModal(key as any)}
                className={`flex items-center justify-between w-full px-4 py-4 hover:bg-zinc-50 transition-colors ${i < arr.length - 1 ? "border-b border-zinc-100" : ""}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full ${iconBg} flex items-center justify-center`}>
                    <Icon size={14} className={iconColor} />
                  </div>
                  <span className="font-bold text-[15px] text-zinc-900">{label}</span>
                </div>
                <div className="flex items-center gap-2">
                  {count > 0 && <span className="text-[12px] font-bold text-black bg-[#E5FF66] px-2 py-0.5 rounded-full">{count}</span>}
                  <ChevronRight size={16} className="text-zinc-300" />
                </div>
              </button>
            ))}

          </div>
        </section>

        {/* Muted & Blocked */}
        <section>
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 px-4 shadow-none">
            Restricted Content
          </h3>
          <div className="bg-white rounded-[24px] shadow-sm border border-zinc-100/50 overflow-hidden">

            <button
              onClick={() => setModal("blocked")}
              className="flex items-center justify-between w-full px-4 py-4 border-b border-zinc-100 hover:bg-zinc-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center">
                  <UserX size={14} className="text-zinc-600" />
                </div>
                <span className="font-bold text-[15px] text-zinc-900">Blocked Users</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-bold text-zinc-400">0</span>
                <ChevronRight size={16} className="text-zinc-300" />
              </div>
            </button>

            <button
              onClick={() => setModal("muted")}
              className="flex items-center justify-between w-full px-4 py-4 hover:bg-zinc-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center">
                  <VolumeX size={14} className="text-zinc-600" />
                </div>
                <span className="font-bold text-[15px] text-zinc-900">Muted Users</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-bold text-zinc-400">0</span>
                <ChevronRight size={16} className="text-zinc-300" />
              </div>
            </button>

          </div>
        </section>

      </main>
    </div>
  );
}
