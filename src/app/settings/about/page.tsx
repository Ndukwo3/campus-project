import { ArrowLeft, FileText, Shield, Info, Heart } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function AboutSettingsPage() {
  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-[100px] max-w-md mx-auto relative font-sans">
      <div className="flex items-center justify-between px-6 py-4 sticky top-0 bg-[#F8F9FA]/80 backdrop-blur-md z-10 border-b border-zinc-100">
        <Link href="/settings" className="w-10 h-10 flex items-center justify-center rounded-full bg-white hover:bg-zinc-50 transition shadow-sm shrink-0">
          <ArrowLeft size={20} className="text-black" />
        </Link>
        <span className="font-bold text-lg tracking-tight text-black">About</span>
        <div className="w-10 h-10" />
      </div>

      <main className="px-4 pt-6 space-y-8">
        
        {/* App Info Banner */}
        <section className="flex flex-col items-center justify-center py-6">
          <div className="w-20 h-20 bg-black rounded-[24px] flex items-center justify-center shadow-lg mb-4">
            <span className="text-white font-black text-2xl tracking-tighter">O</span>
          </div>
          <h2 className="text-2xl font-black text-black">Campus</h2>
          <p className="text-sm font-bold text-zinc-400 mt-1">Version 1.0.0 (Build 42)</p>
        </section>

        {/* Legal Links */}
        <section>
          <div className="bg-white rounded-[24px] shadow-sm border border-zinc-100/50 overflow-hidden">
            
            <Link href="#" className="flex items-center justify-between w-full px-4 py-4 border-b border-zinc-100 hover:bg-zinc-50 transition-colors">
              <div className="flex items-center gap-3">
                <FileText size={18} className="text-zinc-600" />
                <span className="font-bold text-[15px] text-zinc-900">Terms of Service</span>
              </div>
            </Link>

            <Link href="#" className="flex items-center justify-between w-full px-4 py-4 border-b border-zinc-100 hover:bg-zinc-50 transition-colors">
              <div className="flex items-center gap-3">
                <Shield size={18} className="text-zinc-600" />
                <span className="font-bold text-[15px] text-zinc-900">Privacy Policy</span>
              </div>
            </Link>

            <Link href="#" className="flex items-center justify-between w-full px-4 py-4 hover:bg-zinc-50 transition-colors">
              <div className="flex items-center gap-3">
                <Info size={18} className="text-zinc-600" />
                <span className="font-bold text-[15px] text-zinc-900">Open Source Libraries</span>
              </div>
            </Link>

          </div>
        </section>

        <section className="text-center pt-8 flex flex-col items-center">
          <p className="text-[13px] font-bold text-zinc-400 flex items-center gap-1 justify-center">
            Made with <Heart size={14} className="text-red-500 fill-red-500" /> by your peers
          </p>
          <p className="text-[11px] text-zinc-400 mt-1">
            © 2026 Campus App Inc. All rights reserved.
          </p>
        </section>

      </main>
    </div>
  );
}
