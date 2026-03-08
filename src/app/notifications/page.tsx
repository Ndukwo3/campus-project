"use client";

import { ArrowLeft, MoreVertical, Heart, MessageCircle, UserPlus, Bell } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import BottomNavigation from "@/components/BottomNavigation";

const recentNotifications = [
  {
    id: 1,
    type: "like",
    user: "Chidi Obi",
    username: "chidi.obi",
    avatar: "/dummy/nigerian_avatar_2_1772720155980.png",
    content: "liked your post.",
    time: "3m",
    preview: "/dummy/nigerian_post_image_1772720254070.png",
  },
  {
    id: 2,
    type: "like",
    user: "Zainab Ibrahim",
    username: "zainab_vibe",
    avatar: "/dummy/nigerian_avatar_6_1772720236907.png",
    content: "liked your story.",
    time: "12m",
    preview: "/dummy/nigerian_avatar_4_1772720200827.png",
  },
  {
    id: 3,
    type: "follow",
    user: "Alvian",
    username: "alvian_tech",
    avatar: "/dummy/nigerian_avatar_5_1772720218967.png",
    content: "started following you.",
    time: "42m",
  },
  {
    id: 4,
    type: "like",
    user: "Ngozi Okafor",
    username: "ngozi_styl",
    avatar: "/dummy/nigerian_avatar_4_1772720200827.png",
    content: "liked your story.",
    time: "2h",
    preview: "/dummy/nigerian_avatar_1_1772720135560.png",
  }
];

const olderNotifications = [
  {
    id: 5,
    type: "like",
    user: "Raders",
    username: "raders_hub",
    avatar: "/dummy/nigerian_avatar_3_1772720174186.png",
    content: "liked your post.",
    time: "Oct, 31",
  },
  {
    id: 6,
    type: "comment",
    user: "Bambang",
    username: "bambang_j",
    avatar: "/dummy/nigerian_avatar_1_1772720135560.png",
    content: "commented: Fresh and vibrant.",
    time: "Oct, 30",
    preview: "/dummy/nigerian_post_image_1772720254070.png",
  },
  {
    id: 7,
    type: "like",
    user: "Dare",
    username: "dare_dev",
    avatar: "/dummy/nigerian_avatar_2_1772720155980.png",
    content: "liked your story.",
    time: "Oct, 28",
    preview: "/dummy/nigerian_avatar_6_1772720236907.png",
  },
  {
    id: 8,
    type: "follow",
    user: "Alvian",
    username: "alvian_tech",
    avatar: "/dummy/nigerian_avatar_5_1772720218967.png",
    content: "started following you.",
    time: "Oct, 25",
    isFollowing: true,
  },
  {
    id: 9,
    type: "comment",
    user: "Fateme",
    username: "fateme_x",
    avatar: "/dummy/nigerian_avatar_6_1772720236907.png",
    content: "commented: Fresh and vibrant.",
    time: "Oct, 25",
    preview: "/dummy/nigerian_avatar_4_1772720200827.png",
  }
];

export default function NotificationsPage() {
  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-[100px] max-w-md mx-auto relative font-sans">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-[#F8F9FA]/80 backdrop-blur-md px-6 py-6 flex items-center justify-between">
        <Link href="/" className="w-12 h-12 flex items-center justify-center rounded-full bg-white shadow-sm hover:bg-zinc-50 transition">
          <ArrowLeft size={20} className="text-zinc-800" />
        </Link>
        <h1 className="text-xl font-bold text-zinc-800">Notification</h1>
        <button className="w-12 h-12 flex items-center justify-center rounded-full bg-white shadow-sm hover:bg-zinc-50 transition">
          <MoreVertical size={20} className="text-zinc-800" />
        </button>
      </div>

      <main className="px-6 space-y-8">
        {/* Recent Section */}
        <section>
          <h2 className="text-base font-bold text-zinc-800 mb-4 px-1">Recent</h2>
          <div className="bg-white rounded-[32px] p-2 shadow-sm border border-zinc-100/50">
            {recentNotifications.map((noti) => (
              <NotificationItem key={noti.id} {...noti} />
            ))}
          </div>
        </section>

        {/* Older Section */}
        <section>
          <h2 className="text-base font-bold text-zinc-800 mb-4 px-1">Last 7 Days</h2>
          <div className="bg-white rounded-[32px] p-2 shadow-sm border border-zinc-100/50">
            {olderNotifications.map((noti) => (
              <NotificationItem key={noti.id} {...noti} />
            ))}
          </div>
        </section>
      </main>

      <BottomNavigation />
    </div>
  );
}

function NotificationItem({ type, username, avatar, content, time, preview, isFollowing }: any) {
  return (
    <div className="flex items-center gap-3 px-3 py-4 hover:bg-zinc-50/50 transition-colors rounded-2xl group">
      {/* Avatar */}
      <div className="relative shrink-0">
        <div className="h-12 w-12 rounded-full overflow-hidden bg-zinc-100">
          <Image src={avatar} alt={username} width={48} height={48} className="h-full w-full object-cover" />
        </div>
      </div>

      {/* Text Content */}
      <div className="flex-1 min-w-0 pr-1">
        <p className="text-[14px] leading-snug">
          <span className="font-bold text-black">{username}</span>{" "}
          <span className="text-zinc-500 font-medium">
            {content.includes("commented:") ? (
              <>
                commented: <span className="text-zinc-900 font-bold">{content.split("commented: ")[1]}</span>
              </>
            ) : content}{" "}
            {time}
          </span>
        </p>
      </div>

      {/* Action Area (Preview or Button) */}
      <div className="shrink-0 ml-1">
        {type === "follow" ? (
          <button className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all active:scale-95 ${
            isFollowing 
            ? "bg-zinc-100 text-zinc-500" 
            : "bg-[#E5FF66] text-black shadow-sm"
          }`}>
            {isFollowing ? "Following" : "Follow"}
          </button>
        ) : preview ? (
          <div className="h-11 w-11 rounded-xl overflow-hidden bg-zinc-100 border border-zinc-50 shadow-sm">
            <Image src={preview} alt="preview" width={44} height={44} className="h-full w-full object-cover" />
          </div>
        ) : null}
      </div>
    </div>
  );
}
