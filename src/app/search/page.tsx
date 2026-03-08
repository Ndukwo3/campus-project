"use client";

import { Search, ArrowLeft, X, Filter, Users, Hash, TrendingUp, ChevronRight, UserPlus } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import BottomNavigation from "@/components/BottomNavigation";

const filters = ["All", "Students", "Groups", "Trending"];

const trendingSearches = ["GST 201 Solutions", "LSS Elections", "Unilag Tech Meetup", "Faculty of Science"];

const suggestedStudents = [
  { id: 1, name: "Ayo Balogun", username: "@ayo_dev", dept: "Computer Science", avatar: "/assets/top_student_1.png" },
  { id: 2, name: "Ngozi Okafor", username: "@ngozi_styl", dept: "Architecture", avatar: "/assets/top_student_2.png" },
  { id: 3, name: "Emeka John", username: "@emeka_j", dept: "Mechanical Engr", avatar: "/assets/top_student_3.png" },
];

const featuredGroups = [
  { id: 1, name: "Techies Hangout", members: "1.2k members", image: "/assets/techies_hangout.png" },
  { id: 2, name: "Creative Minds", members: "840 members", image: "/assets/creative_minds.png" },
];

export default function SearchPage() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-[100px] max-w-md mx-auto relative font-sans">
      {/* Search Header */}
      <div className="sticky top-0 z-30 bg-[#F8F9FA]/80 backdrop-blur-md px-6 pt-8 pb-4">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/" className="w-12 h-12 flex items-center justify-center rounded-full bg-white shadow-sm hover:bg-zinc-50 transition shrink-0">
            <ArrowLeft size={20} className="text-zinc-800" />
          </Link>
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5 group-focus-within:text-zinc-600 transition-colors" />
            <input
              type="text"
              placeholder="Search people, groups, posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white shadow-sm rounded-2xl py-3.5 pl-12 pr-12 outline-none placeholder:text-zinc-400 font-medium text-sm focus:ring-2 focus:ring-[#E5FF66]/50 transition border border-transparent focus:border-white"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full bg-zinc-100 text-zinc-500 hover:bg-zinc-200 transition"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Horizontal Filters */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap active:scale-95 ${
                activeFilter === filter 
                ? "bg-[#1A1A24] text-white shadow-md shadow-zinc-200" 
                : "bg-white text-zinc-500 shadow-sm border border-zinc-100/50"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      <main className="px-6 space-y-8 mt-4">
        {/* Trending Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp size={18} className="text-zinc-400" />
              <h2 className="text-[17px] font-bold text-zinc-800">Trending Now</h2>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {trendingSearches.map((tag) => (
              <button key={tag} className="bg-white px-4 py-2.5 rounded-xl text-[13px] font-semibold text-zinc-700 shadow-sm border border-zinc-50 hover:bg-zinc-50 transition active:scale-95">
                {tag}
              </button>
            ))}
          </div>
        </section>

        {/* Suggested Students */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[17px] font-bold text-zinc-800">Top Students</h2>
            <Link href="#" className="text-xs font-bold text-zinc-400 uppercase tracking-widest hover:text-zinc-600">See All</Link>
          </div>
          <div className="bg-white rounded-[32px] p-2 shadow-sm border border-zinc-100/50">
            {suggestedStudents.map((student) => (
              <div key={student.id} className="flex items-center gap-3 px-3 py-4 hover:bg-zinc-50/50 transition-colors rounded-2xl group">
                <div className="h-14 w-14 rounded-2xl overflow-hidden bg-zinc-100 shrink-0 group-hover:scale-95 transition-transform">
                  <Image src={student.avatar} alt={student.name} width={56} height={56} className="h-full w-full object-cover" />
                </div>
                <div className="flex-1 min-w-0 pr-1">
                  <h3 className="text-[15px] font-bold text-zinc-900 truncate tracking-tight">{student.name}</h3>
                  <p className="text-[13px] font-medium text-zinc-500">{student.dept}</p>
                </div>
                <button className="h-10 w-10 flex items-center justify-center rounded-2xl bg-[#E5FF66] text-black shadow-sm active:scale-90 transition">
                  <UserPlus size={18} strokeWidth={2.5} />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Featured Communities */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[17px] font-bold text-zinc-800">Campus Groups</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {featuredGroups.map((group) => (
              <div key={group.id} className="bg-white rounded-[32px] p-2 shadow-sm border border-zinc-100/50 group overflow-hidden">
                <div className="h-32 rounded-3xl overflow-hidden relative mb-3">
                  <Image src={group.image} alt={group.name} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-3 left-3 flex items-center gap-2">
                    <div className="flex -space-x-2">
                      <div className="w-5 h-5 rounded-full border border-white bg-zinc-200" />
                      <div className="w-5 h-5 rounded-full border border-white bg-zinc-300" />
                    </div>
                    <span className="text-[10px] font-bold text-white uppercase tracking-tighter opacity-80">{group.members}</span>
                  </div>
                </div>
                <div className="px-2 pb-2">
                  <h3 className="text-sm font-bold text-zinc-900 mb-1 leading-tight">{group.name}</h3>
                  <button className="w-full py-2 bg-zinc-100 rounded-xl text-[11px] font-bold text-zinc-600 hover:bg-zinc-200 transition">Join Group</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <BottomNavigation />
    </div>
  );
}
