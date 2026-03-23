"use client";

import { Sparkles, ArrowLeft, Send, GraduationCap, Users, BookOpen, Clock, Loader2, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { createClient } from "@/lib/supabase";

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<any[]>([
    {
      role: 'assistant',
      content: "Hello! I'm your Academic Assistant. How can I help you today? I can explain textbooks, help with assignment topics, or build a study schedule for your next exam!"
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    async function fetchUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        setUserProfile(profile);
      }
    }
    fetchUser();
  }, [supabase]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isSubmitting) return;

    const userMessage = { role: 'user', content: inputText.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInputText("");
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: userMessage.content }),
      });

      const data = await response.json();
      if (data.response) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I'm having a technical issue. Please try again later." }]);
      }
    } catch (err) {
      console.error("AI error:", err);
      setMessages(prev => [...prev, { role: 'assistant', content: "Oops, something went wrong. Check your connection!" }]);
    }
    setIsSubmitting(false);
  };

  const suggestions = [
    "Summarize 'Introduction to Psychology'",
    "Simplify a physics concept",
    "Calculate my GP (Nigerian system)",
    "Explain standard deviation",
    "How to prepare for GST exams?"
  ];

  return (
    <div className="flex flex-col h-dvh bg-white max-w-md mx-auto relative font-sans overflow-hidden">
      {/* Premium Glass Header */}
      <div className="sticky top-0 z-30 bg-zinc-900 px-4 py-5 flex items-center justify-between border-b border-white/10 shadow-lg">
        <div className="flex items-center gap-3">
          <Link href="/campus" className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors active:scale-95 text-white">
            <ArrowLeft size={20} />
          </Link>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-[16px] tracking-tight text-white leading-none">Academic AI</span>
              <span className="bg-[#E5FF66] text-black text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase">BETA</span>
            </div>
            <p className="text-[11px] text-zinc-400 font-medium">Active Assistant</p>
          </div>
        </div>
        
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#E5FF66] to-[#4ADE80] flex items-center justify-center p-[2px]">
           <div className="w-full h-full rounded-2xl bg-zinc-900 flex items-center justify-center">
             <GraduationCap size={20} className="text-[#E5FF66]" />
           </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-5 py-6 flex flex-col gap-6 scrollbar-hide">
        {messages.map((msg, idx) => {
          const isAI = msg.role === 'assistant';
          return (
            <div 
              key={idx} 
              className={`flex ${isAI ? "justify-start" : "justify-end"} items-end gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300`}
            >
              {isAI && (
                <div className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center shrink-0 mb-1 border border-[#E5FF66]/20">
                  <Sparkles size={14} className="text-[#E5FF66]" />
                </div>
              )}
              <div 
                className={`max-w-[85%] px-5 py-3.5 rounded-[28px] text-[15px] leading-relaxed relative ${
                  isAI 
                    ? "bg-zinc-50 text-zinc-800 rounded-bl-none border border-zinc-100/50" 
                    : "bg-zinc-900 text-white rounded-br-none shadow-md"
                }`}
              >
                {msg.content}
                <div className={`absolute -bottom-5 ${isAI ? "left-1" : "right-1"} flex items-center gap-1.5 opacity-40`}>
                   <Clock size={10} />
                   <span className="text-[9px] font-bold uppercase tracking-widest">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
              {!isAI && (
                <div className="h-8 w-8 rounded-full bg-zinc-100 shrink-0 mb-1 flex items-center justify-center overflow-hidden border border-zinc-200">
                  {userProfile?.avatar_url ? (
                    <Image src={userProfile.avatar_url} alt="You" width={32} height={32} />
                  ) : (
                    <User size={16} className="text-zinc-400" />
                  )}
                </div>
              )}
            </div>
          );
        })}
        {isSubmitting && (
           <div className="flex justify-start items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center border border-[#E5FF66]/20 animate-pulse">
               <Sparkles size={14} className="text-[#E5FF66]" />
             </div>
             <div className="bg-zinc-50 px-5 py-3 rounded-[28px] rounded-bl-none flex gap-1">
                <span className="w-1.5 h-1.5 bg-zinc-300 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-zinc-300 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 bg-zinc-300 rounded-full animate-bounce [animation-delay:0.4s]"></span>
             </div>
           </div>
        )}
        
        {messages.length < 3 && !isSubmitting && (
          <div className="mt-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-400 mb-4 ml-1">Try these topics</h4>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s, idx) => (
                <button 
                  key={idx}
                  onClick={() => { setInputText(s); }}
                  className="px-5 py-3 bg-zinc-50 border border-zinc-100 rounded-[20px] text-[13px] font-bold text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 transition-all active:scale-95 text-left"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} className="h-10" />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-zinc-100 pb-[calc(1rem+env(safe-area-inset-bottom))]">
        <form 
          onSubmit={handleSendMessage}
          className="flex items-center gap-3 bg-zinc-50 p-2 rounded-[28px] border border-zinc-100 focus-within:ring-2 ring-[#E5FF66]/30 transition-all shadow-sm"
        >
          <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center shrink-0">
             <BookOpen size={18} className="text-[#E5FF66]" />
          </div>
          <input 
            type="text" 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="How can I help you today?" 
            className="flex-1 bg-transparent border-none outline-none text-[14px] font-medium text-zinc-900 placeholder:text-zinc-400 px-1"
          />
          <button 
            type="submit"
            disabled={!inputText.trim() || isSubmitting}
            className={`w-11 h-11 flex items-center justify-center rounded-full transition-all active:scale-90 shadow-md ${
              inputText.trim() 
                ? "bg-zinc-900 text-white" 
                : "bg-zinc-200 text-zinc-400 cursor-not-allowed shadow-none"
            }`}
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send size={18} strokeWidth={2.5} />
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
