"use client";

import { ArrowLeft, FileText, Shield, Info, Heart, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

function DocModal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-t-[32px] w-full max-w-md p-6 pb-10 max-h-[80vh] overflow-y-auto space-y-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="font-black text-xl text-black">{title}</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-zinc-100 hover:bg-zinc-200 transition">
            <X size={16} />
          </button>
        </div>
        <div className="text-[14px] text-zinc-600 space-y-3 leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function AboutSettingsPage() {
  const [modal, setModal] = useState<"terms" | "privacy" | "oss" | null>(null);

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-black pb-[100px] max-w-md mx-auto relative font-sans transition-colors">

      {modal === "terms" && (
        <DocModal title="Terms of Service" onClose={() => setModal(null)}>
          <p>By accessing the Campus app, you agree to be bound by these Terms of Service and all applicable laws and regulations.</p>
          <p><strong className="text-zinc-900 dark:text-zinc-100">Eligibility:</strong> You must be a currently enrolled student at a verified university to use Campus.</p>
          <p><strong className="text-zinc-900 dark:text-zinc-100">Account Responsibility:</strong> You are responsible for maintaining the confidentiality of your account and password and for restricting access to your device.</p>
          <p><strong className="text-zinc-900 dark:text-zinc-100">Content:</strong> You retain ownership of content you post. By posting, you grant Campus a non-exclusive license to display your content to other users.</p>
          <p><strong className="text-zinc-900 dark:text-zinc-100">Prohibited Activities:</strong> You may not use Campus for illegal activities, harassment, spam, or any activity that violates our Community Guidelines.</p>
          <p><strong className="text-zinc-900 dark:text-zinc-100">Termination:</strong> We reserve the right to terminate or suspend access to our service without prior notice for conduct that we believe violates these Terms.</p>
          <p className="text-zinc-400 dark:text-zinc-500 text-[12px]">Last updated: March 2026</p>
        </DocModal>
      )}

      {modal === "privacy" && (
        <DocModal title="Privacy Policy" onClose={() => setModal(null)}>
          <p>Campus is committed to protecting your privacy. This policy explains what data we collect and how we use it.</p>
          <p><strong className="text-zinc-900 dark:text-zinc-100">Data We Collect:</strong> We collect information you provide (name, email, university), as well as usage data (posts, interactions, device info).</p>
          <p><strong className="text-zinc-900 dark:text-zinc-100">How We Use It:</strong> Your data is used to provide and improve our services, personalize your feed, and keep the platform safe.</p>
          <p><strong className="text-zinc-900 dark:text-zinc-100">Data Sharing:</strong> We do not sell your personal data. We may share data with trusted partners to operate our services, subject to confidentiality agreements.</p>
          <p><strong className="text-zinc-900 dark:text-zinc-100">Your Rights:</strong> You may request deletion of your account and associated data at any time by contacting support.</p>
          <p><strong className="text-zinc-900 dark:text-zinc-100">Cookies:</strong> We use cookies and similar tracking technologies to improve your experience.</p>
          <p className="text-zinc-400 dark:text-zinc-500 text-[12px]">Last updated: March 2026</p>
        </DocModal>
      )}

      {modal === "oss" && (
        <DocModal title="Open Source Libraries" onClose={() => setModal(null)}>
          {[
            { name: "Next.js", version: "15.0.0", license: "MIT", author: "Vercel, Inc." },
            { name: "React", version: "19.0.0", license: "MIT", author: "Meta Platforms, Inc." },
            { name: "Tailwind CSS", version: "3.4.0", license: "MIT", author: "Tailwind Labs, Inc." },
            { name: "Lucide React", version: "0.372.0", license: "ISC", author: "Lucide Contributors" },
            { name: "Supabase JS", version: "2.39.7", license: "MIT", author: "Supabase Inc." },
            { name: "TypeScript", version: "5.4.0", license: "Apache-2.0", author: "Microsoft Corp." },
          ].map((lib, i) => (
            <div key={i} className="bg-zinc-50 dark:bg-black border border-transparent dark:border-zinc-800 rounded-2xl px-4 py-3">
              <div className="flex items-center justify-between">
                <span className="font-black text-zinc-900 dark:text-zinc-100">{lib.name}</span>
                <span className="text-[12px] font-bold text-zinc-400 dark:text-zinc-500 bg-zinc-200 dark:bg-zinc-800 px-2 py-0.5 rounded-md">{lib.license}</span>
              </div>
              <p className="text-[12px] text-zinc-500 dark:text-zinc-500 mt-1">v{lib.version} · {lib.author}</p>
            </div>
          ))}
        </DocModal>
      )}

      <div className="flex items-center justify-between px-6 py-4 sticky top-0 bg-[#F8F9FA]/80 dark:bg-black/80 backdrop-blur-md z-10 border-b border-zinc-100 dark:border-zinc-800/50">
        <Link href="/settings" className="w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition shadow-sm shrink-0 border border-transparent dark:border-zinc-800">
          <ArrowLeft size={20} className="text-black dark:text-white" />
        </Link>
        <span className="font-bold text-[14px] uppercase tracking-[0.2em] text-black dark:text-white">About</span>
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

            <button
              onClick={() => setModal("terms")}
              className="flex items-center justify-between w-full px-4 py-4 border-b border-zinc-100 hover:bg-zinc-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <FileText size={18} className="text-zinc-600" />
                <span className="font-bold text-[15px] text-zinc-900">Terms of Service</span>
              </div>
            </button>

            <button
              onClick={() => setModal("privacy")}
              className="flex items-center justify-between w-full px-4 py-4 border-b border-zinc-100 hover:bg-zinc-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Shield size={18} className="text-zinc-600" />
                <span className="font-bold text-[15px] text-zinc-900">Privacy Policy</span>
              </div>
            </button>

            <button
              onClick={() => setModal("oss")}
              className="flex items-center justify-between w-full px-4 py-4 hover:bg-zinc-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Info size={18} className="text-zinc-600" />
                <span className="font-bold text-[15px] text-zinc-900">Open Source Libraries</span>
              </div>
            </button>

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
