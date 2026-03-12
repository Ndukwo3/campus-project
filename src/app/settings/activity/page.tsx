import { ArrowLeft, Bookmark, Heart, Share2, MessageCircle, UserX, VolumeX } from "lucide-react";
import Link from "next/link";

export default function ActivitySettingsPage() {
  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-[100px] max-w-md mx-auto relative font-sans">
      <div className="flex items-center justify-between px-6 py-4 sticky top-0 bg-[#F8F9FA]/80 backdrop-blur-md z-10 border-b border-zinc-100">
        <Link href="/settings" className="w-10 h-10 flex items-center justify-center rounded-full bg-white hover:bg-zinc-50 transition shadow-sm shrink-0">
          <ArrowLeft size={20} className="text-black" />
        </Link>
        <span className="font-bold text-lg tracking-tight text-black">Content & Activity</span>
        <div className="w-10 h-10" />
      </div>

      <main className="px-4 pt-6 space-y-8">
        
        {/* Your Content */}
        <section>
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 px-4 shadow-none">
            Your Content
          </h3>
          <div className="bg-white rounded-[24px] shadow-sm border border-zinc-100/50 overflow-hidden">
            
            <Link href="#" className="flex items-center justify-between w-full px-4 py-4 border-b border-zinc-100 hover:bg-zinc-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center">
                  <Bookmark size={14} className="text-zinc-600" />
                </div>
                <span className="font-bold text-[15px] text-zinc-900">Saved Posts</span>
              </div>
            </Link>

            <Link href="#" className="flex items-center justify-between w-full px-4 py-4 border-b border-zinc-100 hover:bg-zinc-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center">
                  <Heart size={14} className="text-red-500" />
                </div>
                <span className="font-bold text-[15px] text-zinc-900">Liked Posts</span>
              </div>
            </Link>

            <Link href="#" className="flex items-center justify-between w-full px-4 py-4 border-b border-zinc-100 hover:bg-zinc-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                  <Share2 size={14} className="text-blue-500" />
                </div>
                <span className="font-bold text-[15px] text-zinc-900">Shared Posts</span>
              </div>
            </Link>

            <Link href="#" className="flex items-center justify-between w-full px-4 py-4 hover:bg-zinc-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center">
                  <MessageCircle size={14} className="text-zinc-600" />
                </div>
                <span className="font-bold text-[15px] text-zinc-900">Comment History</span>
              </div>
            </Link>

          </div>
        </section>

        {/* Muted & Blocked */}
        <section>
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 px-4 shadow-none">
            Restricted Content
          </h3>
          <div className="bg-white rounded-[24px] shadow-sm border border-zinc-100/50 overflow-hidden">
            
            <Link href="#" className="flex items-center justify-between w-full px-4 py-4 border-b border-zinc-100 hover:bg-zinc-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center">
                  <UserX size={14} className="text-zinc-600" />
                </div>
                <span className="font-bold text-[15px] text-zinc-900">Blocked Users</span>
              </div>
              <span className="text-[13px] font-bold text-zinc-400">0</span>
            </Link>

            <Link href="#" className="flex items-center justify-between w-full px-4 py-4 hover:bg-zinc-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center">
                  <VolumeX size={14} className="text-zinc-600" />
                </div>
                <span className="font-bold text-[15px] text-zinc-900">Muted Users</span>
              </div>
              <span className="text-[13px] font-bold text-zinc-400">0</span>
            </Link>

          </div>
        </section>

      </main>
    </div>
  );
}
