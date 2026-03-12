"use client";

import { ArrowLeft, MoreVertical, Heart, MessageCircle, UserPlus, Bell } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import BottomNavigation from "@/components/BottomNavigation";

export default function NotificationsPage() {
  // Placeholder state for real-time notifications
  const notifications: any[] = [];

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-[100px] max-w-md mx-auto relative font-sans">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-[#F8F9FA]/80 backdrop-blur-md px-6 py-6 flex items-center justify-between">
        <Link href="/" className="w-12 h-12 flex items-center justify-center rounded-[20px] bg-white shadow-sm hover:bg-zinc-50 transition active:scale-95">
          <ArrowLeft size={20} className="text-zinc-800" />
        </Link>
        <h1 className="text-xl font-extrabold tracking-tight text-zinc-900">Notifications</h1>
        <button className="w-12 h-12 flex items-center justify-center rounded-[20px] bg-white shadow-sm hover:bg-zinc-50 transition active:scale-95">
          <MoreVertical size={20} className="text-zinc-800" />
        </button>
      </div>

      <main className="px-6 py-4 flex flex-col items-center justify-center min-h-[60vh]">
        {notifications.length > 0 ? (
          <div className="w-full space-y-8">
            {/* Real notifications will be mapped here */}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center max-w-[280px]">
            <div className="w-20 h-20 bg-white shadow-sm rounded-full flex items-center justify-center mb-6 border-4 border-zinc-50">
              <Bell className="w-8 h-8 text-zinc-300" />
            </div>
            <h3 className="text-[17px] font-black tracking-tight text-zinc-900 mb-2">You're all caught up!</h3>
            <p className="text-[14px] font-medium leading-relaxed text-zinc-500">
              We'll let you know when someone interacts with you or your posts.
            </p>
          </div>
        )}
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
