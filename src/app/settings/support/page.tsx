"use client";

import { ArrowLeft, MessageCircleWarning, HelpCircle, BookHeart, Headset, X, ChevronRight, Send } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

function Toast({ message }: { message: string }) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-black text-white text-[14px] font-bold px-5 py-3 rounded-2xl shadow-xl max-w-[90vw] text-center">
      {message}
    </div>
  );
}

function ReportModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: () => void }) {
  const [type, setType] = useState("Bug / Crash");
  const [description, setDescription] = useState("");
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-t-[32px] w-full max-w-md p-6 pb-10 space-y-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="font-black text-xl text-black">Report a Problem</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-zinc-100 hover:bg-zinc-200 transition">
            <X size={16} />
          </button>
        </div>
        <div>
          <label className="block text-[13px] font-bold text-zinc-600 mb-1 ml-1">Problem Type</label>
          <select
            value={type}
            onChange={e => setType(e.target.value)}
            className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl py-3 px-4 text-[14px] font-medium text-black outline-none"
          >
            <option>Bug / Crash</option>
            <option>Feature Request</option>
            <option>Account Issue</option>
            <option>Content Issue</option>
            <option>Other</option>
          </select>
        </div>
        <div>
          <label className="block text-[13px] font-bold text-zinc-600 mb-1 ml-1">Describe the Problem</label>
          <textarea
            rows={4}
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Tell us what happened..."
            className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl py-3 px-4 text-[14px] font-medium text-black focus:outline-none focus:ring-2 focus:ring-black resize-none"
          />
        </div>
        <button
          onClick={() => { if (description.trim()) { onSubmit(); onClose(); } }}
          disabled={!description.trim()}
          className="w-full bg-black text-white rounded-2xl py-4 font-bold text-[15px] hover:bg-zinc-800 transition-colors active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Send size={16} />
          Submit Report
        </button>
      </div>
    </div>
  );
}

function ContactModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: () => void }) {
  const [message, setMessage] = useState("");
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-t-[32px] w-full max-w-md p-6 pb-10 space-y-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="font-black text-xl text-black">Contact Support</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-zinc-100 hover:bg-zinc-200 transition">
            <X size={16} />
          </button>
        </div>
        <p className="text-[14px] text-zinc-500">Our team typically responds within 24–48 hours.</p>
        <textarea
          rows={5}
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="How can we help you?"
          className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl py-3 px-4 text-[14px] font-medium text-black focus:outline-none focus:ring-2 focus:ring-black resize-none"
        />
        <button
          onClick={() => { if (message.trim()) { onSubmit(); onClose(); } }}
          disabled={!message.trim()}
          className="w-full bg-black text-white rounded-2xl py-4 font-bold text-[15px] hover:bg-zinc-800 transition-colors active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Send size={16} />
          Send Message
        </button>
      </div>
    </div>
  );
}

const FAQ_ITEMS = [
  { q: "How do I change my university?", a: "Contact support with your new enrollment document. University changes are reviewed within 5 business days." },
  { q: "How do I reset my password?", a: "Go to Settings → Security → Change Password to update your password." },
  { q: "Can I use two accounts?", a: "No, each student is allowed one Univas-verified account." },
  { q: "How do I report another user?", a: "Tap the three-dot menu on any post or profile and select 'Report'." },
];

function HelpCenterModal({ onClose }: { onClose: () => void }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-t-[32px] w-full max-w-md p-6 pb-10 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-black text-xl text-black">Help Center</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-zinc-100 hover:bg-zinc-200 transition">
            <X size={16} />
          </button>
        </div>
        <div className="space-y-2">
          {FAQ_ITEMS.map((item, i) => (
            <div key={i} className="bg-zinc-50 rounded-2xl overflow-hidden">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between px-4 py-3.5 text-left"
              >
                <span className="font-bold text-[15px] text-zinc-900">{item.q}</span>
                <ChevronRight size={16} className={`text-zinc-400 transition-transform ${open === i ? "rotate-90" : ""}`} />
              </button>
              {open === i && (
                <div className="px-4 pb-4 text-[14px] text-zinc-500">{item.a}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function GuidelinesModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-t-[32px] w-full max-w-md p-6 pb-10 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-black text-xl text-black">Community Guidelines</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-zinc-100 hover:bg-zinc-200 transition">
            <X size={16} />
          </button>
        </div>
        <div className="space-y-4 text-[14px] text-zinc-600">
          {[
            { title: "🤝 Respect Everyone", body: "Treat all Univas members with courtesy. Harassment, bullying, or discrimination of any kind is strictly prohibited." },
            { title: "✅ Be Authentic", body: "Use your real identity. Impersonating others or creating fake accounts is against our terms of service." },
            { title: "📚 Academic Integrity", body: "Do not facilitate cheating or plagiarism. Academic integrity violations are reported to your institution." },
            { title: "🔒 Protect Privacy", body: "Do not share another person's private information without consent." },
            { title: "🚫 No Spam", body: "Do not post unsolicited promotions or irrelevant content repeatedly." },
          ].map((item, i) => (
            <div key={i}>
              <p className="font-black text-zinc-900 mb-1">{item.title}</p>
              <p>{item.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function SupportSettingsPage() {
  const [modal, setModal] = useState<"report" | "help" | "guidelines" | "contact" | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-black pb-[100px] max-w-md mx-auto relative font-sans transition-colors">
      {toast && <Toast message={toast} />}
      {modal === "report" && <ReportModal onClose={() => setModal(null)} onSubmit={() => showToast("✅ Report submitted. Thank you!")} />}
      {modal === "help" && <HelpCenterModal onClose={() => setModal(null)} />}
      {modal === "guidelines" && <GuidelinesModal onClose={() => setModal(null)} />}
      {modal === "contact" && <ContactModal onClose={() => setModal(null)} onSubmit={() => showToast("✅ Message sent! We'll reply within 48 hours.")} />}

      <div className="flex items-center justify-between px-6 py-4 sticky top-0 bg-[#F8F9FA]/80 dark:bg-black/80 backdrop-blur-md z-10 border-b border-zinc-100 dark:border-zinc-800/50">
        <Link href="/settings" className="w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition shadow-sm shrink-0 border border-transparent dark:border-zinc-800">
          <ArrowLeft size={20} className="text-black dark:text-white" />
        </Link>
        <span className="font-bold text-[14px] uppercase tracking-[0.2em] text-black dark:text-white">Support</span>
        <div className="w-10 h-10" />
      </div>

      <main className="px-4 pt-6 space-y-8">

        <section>
          <div className="bg-white rounded-[24px] shadow-sm border border-zinc-100/50 overflow-hidden">

            {[
              { key: "report", icon: MessageCircleWarning, iconBg: "bg-orange-50", iconColor: "text-orange-500", label: "Report a Problem", sub: "Bugs, crashes, or glitches" },
              { key: "help", icon: HelpCircle, iconBg: "bg-blue-50", iconColor: "text-blue-500", label: "Help Center", sub: "FAQs and guides" },
              { key: "guidelines", icon: BookHeart, iconBg: "bg-emerald-50", iconColor: "text-emerald-500", label: "Community Guidelines", sub: "Rules for a safe community" },
              { key: "contact", icon: Headset, iconBg: "bg-zinc-100", iconColor: "text-zinc-600", label: "Contact Support", sub: "Talk to our team" },
            ].map(({ key, icon: Icon, iconBg, iconColor, label, sub }, i, arr) => (
              <button
                key={key}
                onClick={() => setModal(key as any)}
                className={`flex items-center justify-between w-full px-4 py-4 hover:bg-zinc-50 transition-colors ${i < arr.length - 1 ? "border-b border-zinc-100" : ""}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full ${iconBg} flex items-center justify-center`}>
                    <Icon size={14} className={iconColor} />
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="font-bold text-[15px] text-zinc-900">{label}</span>
                    <span className="text-[12px] text-zinc-500">{sub}</span>
                  </div>
                </div>
                <ChevronRight size={16} className="text-zinc-300" />
              </button>
            ))}

          </div>
        </section>

      </main>
    </div>
  );
}
