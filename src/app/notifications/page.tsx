"use client";

import { ArrowLeft, Bell, MoreHorizontal, CheckCircle2, Heart, MessageCircle, UserPlus, Info } from "lucide-react";
import Link from "next/link";
import BottomNavigation from "@/components/BottomNavigation";

const notifications = [
  {
    id: 1,
    type: "like",
    user: "Chidi Obi",
    avatar: "/dummy/nigerian_avatar_2_1772720155980.png",
    content: "liked your post \"Group study under the shade at faculty!\"",
    time: "2m",
    isUnread: true,
  },
  {
    id: 2,
    type: "follow",
    user: "Zainab Ibrahim",
    avatar: "/dummy/nigerian_avatar_6_1772720236907.png",
    content: "started following you",
    time: "15m",
    isUnread: true,
  },
  {
    id: 3,
    type: "comment",
    user: "Ayo",
    avatar: "/dummy/nigerian_avatar_3_1772720174186.png",
    content: "commented: \"Great shot! Good luck with the exams.\"",
    time: "1h",
    isUnread: false,
  },
  {
    id: 4,
    type: "system",
    user: "Uni-verse",
    avatar: "/dummy/nigerian_avatar_1_1772720135560.png",
    content: "Welcome to Uni-verse! Complete your profile to get discovered by other students.",
    time: "3h",
    isUnread: false,
  },
  {
    id: 5,
    type: "like",
    user: "Ngozi",
    avatar: "/dummy/nigerian_avatar_4_1772720200827.png",
    content: "liked your profile picture",
    time: "5h",
    isUnread: false,
  }
];

export default function NotificationsPage() {
  const getIcon = (type: string) => {
    switch (type) {
      case "like": return <Heart size={16} className="text-red-500 fill-red-500" />;
      case "follow": return <UserPlus size={16} className="text-blue-500" />;
      case "comment": return <MessageCircle size={16} className="text-green-500" />;
      default: return <Info size={16} className="text-zinc-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-[100px] max-w-md mx-auto relative shadow-sm">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md px-4 h-16 flex items-center justify-between border-b border-zinc-100">
        <div className="flex items-center gap-3">
          <Link href="/" className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-zinc-100 transition">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-xl font-bold text-black">Notifications</h1>
        </div>
        <button className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-zinc-100 transition">
          <MoreHorizontal size={24} />
        </button>
      </div>

      <main className="divide-y divide-zinc-100">
        {notifications.map((notification) => (
          <div 
            key={notification.id} 
            className={`flex gap-3 px-4 py-4 transition-colors ${notification.isUnread ? "bg-zinc-50/50" : "bg-white"}`}
          >
            <div className="relative shrink-0">
              <div className="h-12 w-12 rounded-full overflow-hidden">
                <img 
                  src={notification.avatar} 
                  alt={notification.user} 
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-white rounded-full flex items-center justify-center shadow-sm border border-zinc-50">
                {getIcon(notification.type)}
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start gap-2">
                <p className="text-[15px] leading-snug">
                  <span className="font-bold text-black">{notification.user}</span>{" "}
                  <span className="text-zinc-600">{notification.content}</span>
                </p>
                {notification.isUnread && (
                  <div className="h-2 w-2 rounded-full bg-[#E5FF66] shrink-0 mt-2" />
                )}
              </div>
              <p className="text-xs text-zinc-400 mt-1">{notification.time} ago</p>
            </div>
          </div>
        ))}
      </main>

      {/* Empty State Mockup if no more */}
      <div className="py-12 px-8 text-center bg-white border-t border-zinc-100">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-50 text-zinc-300 mb-4">
          <Bell size={32} />
        </div>
        <h3 className="text-base font-bold text-zinc-900">All caught up!</h3>
        <p className="text-sm text-zinc-500 mt-1">Check back later for new interactions and campus updates.</p>
      </div>

      <BottomNavigation />
    </div>
  );
}
