"use client";

import { useState, useEffect } from "react";
import { 
  ArrowLeft, Calendar, MapPin, Clock, 
  Info, Camera, Plus, Loader2, Sparkles,
  ChevronRight, Check
} from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import BottomNavigation from "@/components/BottomNavigation";
import Toast from "@/components/Toast";

export default function CreateEventPage() {
  const router = useRouter();
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    category: "social",
    image_url: ""
  });

  const categories = ["academic", "social", "sports", "tech", "arts", "general"];

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) router.push("/login");
      setUser(user);
    }
    getUser();
  }, [supabase, router]);

  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" | "warning"; isVisible: boolean }>({
    message: "",
    type: "success",
    isVisible: false,
  });

  const showToast = (message: string, type: "success" | "error" | "info" | "warning" = "success") => {
    setToast({ message, type, isVisible: true });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.date || !formData.location) {
      showToast("Please fill in all core fields", "warning");
      return;
    }

    setIsLoading(true);
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('university_id')
        .eq('id', user.id)
        .single();

      const { error } = await supabase
        .from('events')
        .insert({
          ...formData,
          organizer_id: user.id,
          university_id: profile?.university_id,
          status: 'upcoming'
        });

      if (error) throw error;

      showToast("Event materialized successfully!");
      setTimeout(() => router.push("/univas/events"), 2000);
    } catch (err: any) {
      showToast(err.message || "Failed to create event", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-black max-w-md mx-auto relative font-sans transition-colors overflow-x-hidden">
      <Toast 
        message={toast.message} 
        type={toast.type} 
        isVisible={toast.isVisible} 
        onClose={() => setToast({ ...toast, isVisible: false })} 
      />

      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/80 dark:bg-black/80 backdrop-blur-xl px-6 pt-10 pb-5 flex items-center gap-4 border-b border-zinc-100/50 dark:border-zinc-800/50">
        <motion.button 
          whileTap={{ scale: 0.9 }}
          onClick={() => router.back()}
          className="w-10 h-10 rounded-xl bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center text-zinc-900 dark:text-white border border-zinc-100 dark:border-zinc-800"
        >
          <ArrowLeft size={20} />
        </motion.button>
        <div className="flex flex-col">
          <h1 className="text-[24px] font-black tracking-tight text-zinc-900 dark:text-white uppercase italic leading-none">Host Event</h1>
          <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-600 uppercase tracking-widest mt-1">Organize Campus Life</p>
        </div>
      </div>

      <main className="flex-1 px-8 py-8 pb-40 space-y-10 overflow-y-auto scrollbar-hide">
        {/* Visual Cue */}
        <div className="bg-zinc-900 dark:bg-white p-8 rounded-[40px] flex items-center gap-6 relative overflow-hidden group shadow-2xl">
           <div className="w-14 h-14 rounded-2xl bg-white/10 dark:bg-black/5 flex items-center justify-center text-[#E5FF66] dark:text-zinc-900">
              <Sparkles size={32} strokeWidth={2.5} />
           </div>
           <div className="space-y-1">
              <h2 className="text-2xl font-black text-white dark:text-black uppercase italic leading-none tracking-tight">Materialize</h2>
              <p className="text-[10px] font-black text-[#E5FF66] dark:text-zinc-500 uppercase tracking-widest">Bring your idea to life</p>
           </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
           {/* Section: Core Details */}
           <div className="space-y-6">
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] px-1">Event Title</label>
                 <input 
                   type="text"
                   value={formData.title}
                   onChange={(e) => setFormData({...formData, title: e.target.value})}
                   placeholder="e.g. Summer Tech Hackathon"
                   className="w-full h-14 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl px-6 text-sm font-bold border border-zinc-100 dark:border-zinc-800 focus:outline-none focus:ring-2 ring-[#E5FF66]/20 transition-all text-zinc-900 dark:text-white"
                 />
              </div>

              <div className="space-y-2">
                 <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] px-1">Category</label>
                 <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
                    {categories.map(cat => (
                       <button
                         key={cat}
                         type="button"
                         onClick={() => setFormData({...formData, category: cat})}
                         className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border-2 ${
                           formData.category === cat 
                           ? "bg-[#E5FF66] text-black border-[#E5FF66] shadow-lg shadow-[#E5FF66]/20" 
                           : "bg-white dark:bg-zinc-950 text-zinc-400 dark:text-zinc-600 border-zinc-100 dark:border-zinc-900"
                         }`}
                       >
                          {cat}
                       </button>
                    ))}
                 </div>
              </div>
           </div>

           {/* Section: Logistics */}
           <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] px-1">Date</label>
                 <input 
                   type="date"
                   value={formData.date}
                   onChange={(e) => setFormData({...formData, date: e.target.value})}
                   className="w-full h-14 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl px-5 text-[13px] font-bold border border-zinc-100 dark:border-zinc-800 focus:outline-none focus:ring-2 ring-[#E5FF66]/20 transition-all text-zinc-900 dark:text-white"
                 />
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] px-1">Time</label>
                 <input 
                   type="time"
                   value={formData.time}
                   onChange={(e) => setFormData({...formData, time: e.target.value})}
                   className="w-full h-14 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl px-5 text-[13px] font-bold border border-zinc-100 dark:border-zinc-800 focus:outline-none focus:ring-2 ring-[#E5FF66]/20 transition-all text-zinc-900 dark:text-white"
                 />
              </div>
           </div>

           <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] px-1">Location</label>
              <div className="relative">
                 <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                 <input 
                   type="text"
                   value={formData.location}
                   onChange={(e) => setFormData({...formData, location: e.target.value})}
                   placeholder="e.g. Science Auditorium, Hall 4"
                   className="w-full h-14 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl pl-12 pr-6 text-sm font-bold border border-zinc-100 dark:border-zinc-800 focus:outline-none focus:ring-2 ring-[#E5FF66]/20 transition-all text-zinc-900 dark:text-white"
                 />
              </div>
           </div>

           {/* Section: Description */}
           <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] px-1">About the Event</label>
              <textarea 
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Give us the deep dive! What should students expect?"
                className="w-full bg-zinc-50 dark:bg-zinc-900/50 rounded-[32px] p-6 text-sm font-medium border border-zinc-100 dark:border-zinc-800 focus:outline-none focus:ring-2 ring-[#E5FF66]/20 transition-all text-zinc-900 dark:text-white resize-none leading-relaxed"
              />
           </div>

           {/* Submit Button */}
           <div className="pt-6">
              <button 
                type="submit"
                disabled={isLoading}
                className="w-full py-5 bg-zinc-900 dark:bg-[#E5FF66] text-white dark:text-black rounded-[32px] font-black text-sm uppercase italic tracking-widest shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                 {isLoading ? (
                    <Loader2 className="animate-spin" size={20} />
                 ) : (
                    <>
                      Materialize Event
                      <ChevronRight size={20} strokeWidth={3} />
                    </>
                 )}
              </button>
           </div>
        </form>
      </main>

      <BottomNavigation />
    </div>
  );
}
