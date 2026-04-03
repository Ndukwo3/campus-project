"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function TermsOfService() {
  const sections = [
    {
      title: "1. Acceptance of Terms",
      content: "By accessing Univas Hub (the \"Platform\"), you represent that you have read, understood, and agree to be bound by these Terms. If you do not agree, strictly discontinue use of the Platform immediately."
    },
    {
      title: "2. Academic Integrity Disclaimer",
      content: "Univas is designed exclusively as a study aid. You agree that materials obtained through this platform (past questions, notes, solutions) shall NOT be used for any form of examination malpractice, cheating, or plagiarism. Univas is not liable for any disciplinary actions taken by your University for academic dishonesty."
    },
    {
      title: "3. User Registration",
      content: "To access certain features, you must create an account using a valid email address. You are solely responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account."
    },
    {
      title: "4. Intellectual Property Rights",
      content: "Academic materials provided on the Platform are for personal, non-commercial study use only. You shall not redistribute, sell, or exploit any content from the Platform without explicit authorization. We do not claim ownership of materials uploaded by users; however, by uploading, you grant Univas a license to host and display those materials."
    },
    {
      title: "5. Limitation of Liability",
      content: "The Platform and all its content are provided on an \"as-is\" and \"as-available\" basis. Univas Hub, its developers, and affiliates do not guarantee the accuracy of academic materials and are not responsible for your academic performance, grades, or university results."
    },
    {
      title: "6. User Conduct",
      content: "You agree not to upload harmful code, harass other users, or use the Platform for unauthorized advertising. We reserve the right to suspend or terminate accounts that violate our community standards or create excessive server strain."
    },
    {
      title: "7. Termination of Access",
      content: "We reserve the right, without notice and at our sole discretion, to terminate your account or block your access to the Platform for any behavior that we deem harmful to the community or in violation of these Terms."
    },
    {
      title: "8. Governing Law",
      content: "These Terms shall be governed by and construed in accordance with the laws of the Federal Republic of Nigeria. Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the competent courts in Nigeria."
    }
  ];

  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-black text-zinc-900 dark:text-white font-sans px-6 py-12 transition-colors">
      
      {/* Immersive Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex items-center gap-4 mb-10"
      >
        <Link
          href="/signup"
          className="w-10 h-10 flex items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-black uppercase tracking-tighter italic leading-none">Terms of Service</h1>
          <p className="text-[9px] font-bold text-zinc-400 dark:text-zinc-600 uppercase tracking-widest mt-1">Version 1.0 · Univas Hub</p>
        </div>
      </motion.div>

      <div className="flex-1 max-w-2xl mx-auto w-full">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-8 pb-20"
        >
          <div className="p-6 rounded-3xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 mb-10">
            <p className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 leading-relaxed uppercase tracking-widest">
              Please read these terms carefully before proceeding. By using Univas, you are agreeing to the rules of our academic community.
            </p>
          </div>

          <div className="space-y-10">
            {sections.map((section, idx) => (
              <motion.section 
                key={idx}
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 * idx + 0.3 }}
                className="group"
              >
                <h2 className="text-[11px] font-black uppercase tracking-[0.25em] text-[#E5FF66] mb-3 group-hover:translate-x-1 transition-transform">
                  {section.title}
                </h2>
                <p className="text-[12px] font-medium text-zinc-600 dark:text-zinc-400 leading-normal tracking-wide text-justify">
                  {section.content}
                </p>
              </motion.section>
            ))}
          </div>

          <div className="pt-10 border-t border-zinc-100 dark:border-zinc-800">
            <p className="text-[10px] italic font-black text-center text-zinc-300 dark:text-zinc-700 uppercase tracking-widest">
              UNIVAS HUB · EMPOWERING ACADEMIC EXCELLENCE
            </p>
          </div>
        </motion.div>
      </div>

      {/* Floating Action for Consent */}
      <motion.div 
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[calc(100%-48px)] max-w-sm"
      >
        <Link 
          href="/signup"
          className="w-full bg-zinc-900 dark:bg-[#E2FF3D] text-white dark:text-black py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest text-center block shadow-2xl transition-transform active:scale-95"
        >
          Accept and Close
        </Link>
      </motion.div>
    </div>
  );
}
