"use client";

import { ArrowLeft, Settings, Grid, Bookmark, Tag, ChevronRight, Edit3, Camera, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import BottomNavigation from "@/components/BottomNavigation";

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-white pb-[100px] max-w-md mx-auto relative font-sans">
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
            <div className="w-28 h-28 rounded-full ring-4 ring-[#E5FF66] ring-offset-4 overflow-hidden mb-4 shadow-lg">
              <Image 
                src="/dummy/nigerian_avatar_1_1772720135560.png" 
                alt="Profile" 
                width={112} 
                height={112} 
                className="object-cover w-full h-full"
              />
            </div>
            <button className="absolute bottom-4 right-0 w-8 h-8 bg-[#E5FF66] rounded-full flex items-center justify-center border-4 border-white text-black shadow-sm">
              <Camera size={14} strokeWidth={2.5} />
            </button>
          </div>
          
          <div className="flex items-center gap-1.5 mb-1">
            <h2 className="text-2xl font-bold text-black leading-tight">Samuel Adebayo</h2>
            <CheckCircle2 size={20} className="fill-black text-white" />
          </div>
          <p className="text-black text-[15px] font-bold mb-4 opacity-100">@sam_dev • 300 Level CS</p>
          
          <div className="flex gap-4 w-full">
            <button className="flex-1 bg-[#1A1A24] text-white py-3 rounded-2xl text-[15px] font-semibold flex items-center justify-center gap-2 hover:bg-black transition">
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
          <span className="text-lg font-bold text-black">124</span>
          <span className="text-xs text-black/40 font-bold uppercase tracking-wider">Posts</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-lg font-bold text-black">1.2k</span>
          <span className="text-xs text-black/40 font-bold uppercase tracking-wider">Followers</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-lg font-bold text-black">850</span>
          <span className="text-xs text-black/40 font-bold uppercase tracking-wider">Following</span>
        </div>
      </div>

      {/* Bio / University Section */}
      <div className="px-6 py-6 flex flex-col gap-4">
        <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
          <div className="flex items-center mb-2">
            <h3 className="font-bold text-sm text-black">University</h3>
          </div>
          <p className="text-sm font-normal text-black">University of Lagos (UNILAG)</p>
          <p className="text-sm text-black font-normal mt-1">Computer Science Department</p>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="font-bold text-base text-black px-1">About Me</h3>
          <p className="text-sm text-black leading-relaxed px-1 font-normal">
            Building the next generation of campus tech! Passionate about UI/UX and Fullstack dev. Coffee & Code ☕️💻
          </p>
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
        <div className="aspect-square bg-zinc-100 rounded-lg overflow-hidden relative">
           <Image src="/dummy/nigerian_post_image_1772720254070.png" alt="Post" fill className="object-cover" />
        </div>
        <div className="aspect-square bg-zinc-100 rounded-lg overflow-hidden relative">
           <Image src="/dummy/nigerian_avatar_4_1772720200827.png" alt="Post" fill className="object-cover" />
        </div>
        <div className="aspect-square bg-zinc-100 rounded-lg overflow-hidden relative">
           <Image src="/dummy/nigerian_avatar_2_1772720155980.png" alt="Post" fill className="object-cover" />
        </div>
        <div className="aspect-square bg-zinc-200 rounded-lg"></div>
        <div className="aspect-square bg-zinc-200 rounded-lg"></div>
        <div className="aspect-square bg-zinc-200 rounded-lg"></div>
      </div>

      <BottomNavigation />
    </div>
  );
}
