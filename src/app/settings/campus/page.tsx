"use client";

import { ArrowLeft, Building2, GraduationCap, Users, LogOut, X, AlertTriangle, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

function Toast({ message }: { message: string }) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-black text-white text-[14px] font-bold px-5 py-3 rounded-2xl shadow-xl max-w-[90vw] text-center">
      {message}
    </div>
  );
}

function ConfirmModal({
  title,
  description,
  confirmLabel,
  onConfirm,
  onClose,
}: {
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-6" onClick={onClose}>
      <div className="bg-white rounded-[28px] w-full max-w-sm p-6 space-y-4" onClick={e => e.stopPropagation()}>
        <div className="flex flex-col items-center text-center gap-2">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-1">
            <AlertTriangle size={22} className="text-red-600" />
          </div>
          <h2 className="font-black text-xl text-black">{title}</h2>
          <p className="text-[14px] text-zinc-500">{description}</p>
        </div>
        <div className="flex gap-3 pt-2">
          <button onClick={onClose} className="flex-1 bg-zinc-100 text-zinc-700 rounded-2xl py-3.5 font-bold text-[15px] hover:bg-zinc-200 transition">
            Cancel
          </button>
          <button
            onClick={() => { onConfirm(); onClose(); }}
            className="flex-1 bg-red-600 text-white rounded-2xl py-3.5 font-bold text-[15px] hover:bg-red-700 transition active:scale-95"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function GroupModal({ title, groups, onClose }: { title: string; groups: { name: string; members: number; color: string }[]; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-t-[32px] w-full max-w-md p-6 pb-10 max-h-[75vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-black text-xl text-black">{title}</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-zinc-100 hover:bg-zinc-200 transition">
            <X size={16} />
          </button>
        </div>
        <div className="space-y-3">
          {groups.map((g, i) => (
            <div key={i} className="flex items-center justify-between bg-zinc-50 rounded-2xl px-4 py-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full ${g.color} flex items-center justify-center text-white font-black text-[15px]`}>
                  {g.name[0]}
                </div>
                <div>
                  <p className="font-bold text-[15px] text-zinc-900">{g.name}</p>
                  <p className="text-[12px] text-zinc-500">{g.members} members</p>
                </div>
              </div>
              <button className="text-[12px] font-bold text-red-500 bg-red-50 px-3 py-1.5 rounded-xl hover:bg-red-100 transition">
                Leave
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const DEPT_GROUPS = [
  { name: "CSC Year 5 WhatsApp", members: 48, color: "bg-blue-500" },
  { name: "FUTO Dev Community", members: 230, color: "bg-indigo-500" },
];

const COURSE_GROUPS = [
  { name: "CSC 501 - AI Group", members: 22, color: "bg-emerald-500" },
  { name: "CSC 411 - Networks", members: 19, color: "bg-sky-500" },
  { name: "ENG 302 - Study Circle", members: 31, color: "bg-orange-400" },
  { name: "MTH 201 - Calculus", members: 40, color: "bg-purple-500" },
];

export default function CampusSettingsPage() {
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [groupModal, setGroupModal] = useState<"dept" | "course" | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-black pb-[100px] max-w-md mx-auto relative font-sans transition-colors">
      {toast && <Toast message={toast} />}
      {showLeaveConfirm && (
        <ConfirmModal
          title="Leave Campus Network?"
          description="You'll lose access to all campus-exclusive content, groups, and events. This action cannot be undone."
          confirmLabel="Leave Network"
          onConfirm={() => showToast("⚠️ You have left the campus network.")}
          onClose={() => setShowLeaveConfirm(false)}
        />
      )}
      {groupModal === "dept" && (
        <GroupModal title="Department Groups" groups={DEPT_GROUPS} onClose={() => setGroupModal(null)} />
      )}
      {groupModal === "course" && (
        <GroupModal title="Course Groups" groups={COURSE_GROUPS} onClose={() => setGroupModal(null)} />
      )}

      <div className="flex items-center justify-between px-6 py-4 sticky top-0 bg-[#F8F9FA]/80 dark:bg-black/80 backdrop-blur-md z-10 border-b border-zinc-100 dark:border-zinc-800/50">
        <Link href="/settings" className="w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition shadow-sm shrink-0 border border-transparent dark:border-zinc-800">
          <ArrowLeft size={20} className="text-black dark:text-white" />
        </Link>
        <span className="font-bold text-[14px] uppercase tracking-[0.2em] text-black dark:text-white">Campus Tools</span>
        <div className="w-10 h-10" />
      </div>

      <main className="px-4 pt-6 space-y-8">

        {/* Core Identity */}
        <section>
          <div className="bg-white rounded-[24px] shadow-sm border border-zinc-100/50 overflow-hidden px-4 py-5 flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-zinc-100 flex items-center justify-center shrink-0 border border-zinc-200 shadow-sm">
              <Building2 size={28} className="text-zinc-400" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-lg text-black leading-tight">Federal University of Technology, Owerri</span>
              <span className="text-sm font-bold text-[#E2FF3D] drop-shadow-sm mt-1">FUTO</span>
            </div>
          </div>
          <p className="text-[12px] text-zinc-400 mt-2 px-4 text-center">
            To change your campus, you must contact support with proof of enrollment.
          </p>
        </section>

        {/* Groups & Courses */}
        <section>
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 px-4 shadow-none">
            Your Communities
          </h3>
          <div className="bg-white rounded-[24px] shadow-sm border border-zinc-100/50 overflow-hidden">

            <button
              onClick={() => setGroupModal("dept")}
              className="flex items-center justify-between w-full px-4 py-4 border-b border-zinc-100 hover:bg-zinc-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                  <GraduationCap size={14} className="text-blue-500" />
                </div>
                <div className="flex flex-col items-start">
                  <span className="font-bold text-[15px] text-zinc-900">Department Groups</span>
                  <span className="text-[12px] text-zinc-500">Computer Science</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-black bg-[#E5FF66] px-2 py-0.5 rounded-full">2</span>
                <ChevronRight size={16} className="text-zinc-300" />
              </div>
            </button>

            <button
              onClick={() => setGroupModal("course")}
              className="flex items-center justify-between w-full px-4 py-4 hover:bg-zinc-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center">
                  <Users size={14} className="text-emerald-500" />
                </div>
                <div className="flex flex-col items-start">
                  <span className="font-bold text-[15px] text-zinc-900">Course Groups</span>
                  <span className="text-[12px] text-zinc-500">Active study groups</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-black bg-[#E5FF66] px-2 py-0.5 rounded-full">4</span>
                <ChevronRight size={16} className="text-zinc-300" />
              </div>
            </button>

          </div>
        </section>

        {/* Leave Campus */}
        <section className="px-2">
          <button
            onClick={() => setShowLeaveConfirm(true)}
            className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 rounded-2xl py-4 font-bold text-[15px] hover:bg-red-100 transition-colors active:scale-95"
          >
            <LogOut size={18} />
            Leave Campus Network
          </button>
        </section>

      </main>
    </div>
  );
}
