import { ArrowLeft, MessageCircleWarning, HelpCircle, BookHeart, Headset } from "lucide-react";
import Link from "next/link";

export default function SupportSettingsPage() {
  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-[100px] max-w-md mx-auto relative font-sans">
      <div className="flex items-center justify-between px-6 py-4 sticky top-0 bg-[#F8F9FA]/80 backdrop-blur-md z-10 border-b border-zinc-100">
        <Link href="/settings" className="w-10 h-10 flex items-center justify-center rounded-full bg-white hover:bg-zinc-50 transition shadow-sm shrink-0">
          <ArrowLeft size={20} className="text-black" />
        </Link>
        <span className="font-bold text-lg tracking-tight text-black">Help & Support</span>
        <div className="w-10 h-10" />
      </div>

      <main className="px-4 pt-6 space-y-8">
        
        {/* Support Options */}
        <section>
          <div className="bg-white rounded-[24px] shadow-sm border border-zinc-100/50 overflow-hidden">
            
            <Link href="#" className="flex items-center justify-between w-full px-4 py-4 border-b border-zinc-100 hover:bg-zinc-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center">
                  <MessageCircleWarning size={14} className="text-orange-500" />
                </div>
                <div className="flex flex-col items-start">
                  <span className="font-bold text-[15px] text-zinc-900">Report a Problem</span>
                  <span className="text-[12px] text-zinc-500">Bugs, crashes, or glitches</span>
                </div>
              </div>
            </Link>

            <Link href="#" className="flex items-center justify-between w-full px-4 py-4 border-b border-zinc-100 hover:bg-zinc-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                  <HelpCircle size={14} className="text-blue-500" />
                </div>
                <div className="flex flex-col items-start">
                  <span className="font-bold text-[15px] text-zinc-900">Help Center</span>
                  <span className="text-[12px] text-zinc-500">FAQs and guides</span>
                </div>
              </div>
            </Link>

            <Link href="#" className="flex items-center justify-between w-full px-4 py-4 border-b border-zinc-100 hover:bg-zinc-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center">
                  <BookHeart size={14} className="text-emerald-500" />
                </div>
                <div className="flex flex-col items-start">
                  <span className="font-bold text-[15px] text-zinc-900">Community Guidelines</span>
                  <span className="text-[12px] text-zinc-500">Rules for a safe campus</span>
                </div>
              </div>
            </Link>

            <Link href="#" className="flex items-center justify-between w-full px-4 py-4 hover:bg-zinc-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center">
                  <Headset size={14} className="text-zinc-600" />
                </div>
                <div className="flex flex-col items-start">
                  <span className="font-bold text-[15px] text-zinc-900">Contact Support</span>
                  <span className="text-[12px] text-zinc-500">Talk to our team</span>
                </div>
              </div>
            </Link>

          </div>
        </section>

      </main>
    </div>
  );
}
