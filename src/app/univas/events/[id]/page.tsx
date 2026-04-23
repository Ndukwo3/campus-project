"use client";

import { useState, useEffect, use } from "react";
import { 
  ArrowLeft, Calendar, MapPin, Clock, 
  Users, Share2, Bookmark, ChevronLeft,
  Info, Shield, User, Loader2
} from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase";
import { format } from "date-fns";
import { motion } from "framer-motion";
import BottomNavigation from "@/components/BottomNavigation";
import Toast from "@/components/Toast";

export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: eventId } = use(params);
  const router = useRouter();
  const supabase = createClient();
  const [event, setEvent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" | "warning"; isVisible: boolean }>({
    message: "",
    type: "success",
    isVisible: false,
  });

  const showToast = (message: string, type: "success" | "error" | "info" | "warning" = "success") => {
    setToast({ message, type, isVisible: true });
  };

  useEffect(() => {
    async function fetchEvent() {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('events')
          .select(`
            *,
            organizer:organizer_id (full_name, username, avatar_url),
            university:university_id (name)
          `)
          .eq('id', eventId)
          .single();
        
        if (error) throw error;
        setEvent(data);
      } catch (err) {
        console.error("Fetch event detail error:", err);
        router.push("/univas/events");
      } finally {
        setIsLoading(false);
      }
    }
    fetchEvent();
  }, [eventId, supabase, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
        <Loader2 className="w-8 h-8 animate-spin text-[#E5FF66]" />
      </div>
    );
  }

  if (!event) return null;

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-black max-w-md mx-auto relative font-sans transition-colors overflow-x-hidden">
      <Toast 
        message={toast.message} 
        type={toast.type} 
        isVisible={toast.isVisible} 
        onClose={() => setToast({ ...toast, isVisible: false })} 
      />

      {/* Hero Section */}
      <div className="relative h-[40vh] w-full overflow-hidden">
        {event.image_url ? (
          <Image 
            src={event.image_url} 
            alt={event.title} 
            fill 
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-zinc-900 flex items-center justify-center">
            <Calendar size={64} className="text-zinc-800" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
        
        {/* Top Actions */}
        <div className="absolute top-10 left-6 right-6 flex items-center justify-between z-10">
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={() => router.back()}
            className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white"
          >
            <ChevronLeft size={24} />
          </motion.button>
          <div className="flex gap-3">
            <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsBookmarked(!isBookmarked)}
              className={`w-11 h-11 rounded-2xl backdrop-blur-md border flex items-center justify-center ${isBookmarked ? 'bg-[#E5FF66] border-[#E5FF66] text-black' : 'bg-white/10 border-white/20 text-white'}`}
            >
              <Bookmark size={20} fill={isBookmarked ? "currentColor" : "none"} />
            </motion.button>
            <motion.button 
              whileTap={{ scale: 0.9 }}
              className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white"
            >
              <Share2 size={20} />
            </motion.button>
          </div>
        </div>

        {/* Hero Title */}
        <div className="absolute bottom-8 left-8 right-8 space-y-3">
           <div className="px-3 py-1 bg-[#E5FF66] rounded-full inline-flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />
              <span className="text-[10px] font-black text-black uppercase tracking-widest">{event.category}</span>
           </div>
           <h1 className="text-4xl font-black text-white uppercase italic leading-[0.85] tracking-tighter">
             {event.title}
           </h1>
        </div>
      </div>

      <main className="flex-1 bg-white dark:bg-black rounded-t-[44px] -mt-10 relative z-20 px-8 pt-10 pb-40 space-y-10">
        {/* Quick Info Grid */}
        <div className="grid grid-cols-2 gap-4">
           <div className="p-5 bg-zinc-50 dark:bg-zinc-900/50 rounded-[32px] border border-zinc-100/50 dark:border-zinc-800/50 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-500">
                <Calendar size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Date</p>
                <p className="text-[14px] font-bold text-zinc-900 dark:text-white">{format(new Date(event.date), 'EEEE, MMM dd')}</p>
              </div>
           </div>
           <div className="p-5 bg-zinc-50 dark:bg-zinc-900/50 rounded-[32px] border border-zinc-100/50 dark:border-zinc-800/50 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <Clock size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Time</p>
                <p className="text-[14px] font-bold text-zinc-900 dark:text-white">{event.time}</p>
              </div>
           </div>
        </div>

        {/* Location Section */}
        <div className="flex items-center gap-5 p-6 bg-zinc-50 dark:bg-zinc-900/50 rounded-[32px] border border-zinc-100/50 dark:border-zinc-800/50">
           <div className="w-14 h-14 rounded-2xl bg-zinc-900 dark:bg-white flex items-center justify-center text-[#E5FF66] dark:text-black shadow-lg">
              <MapPin size={28} />
           </div>
           <div className="flex-1">
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Location</p>
              <p className="text-[15px] font-bold text-zinc-900 dark:text-white leading-tight mt-0.5">{event.location}</p>
              <button className="text-[10px] font-black text-blue-500 uppercase tracking-widest mt-1 hover:underline">Get Directions</button>
           </div>
        </div>

        {/* Description Section */}
        <section className="space-y-4">
           <div className="flex items-center justify-between">
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400">About Event</h2>
              <div className="w-10 h-px bg-zinc-100 dark:bg-zinc-800" />
           </div>
           <p className="text-[16px] text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium">
             {event.description}
           </p>
        </section>

        {/* Organizer Section */}
        <section className="space-y-4">
           <h2 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400">Organized By</h2>
           <div className="flex items-center justify-between p-4 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[28px] shadow-sm">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center border border-zinc-100 dark:border-zinc-800">
                    {event.organizer?.avatar_url ? (
                      <Image src={event.organizer.avatar_url} alt="Organizer" width={48} height={48} className="object-cover" />
                    ) : (
                      <User className="text-zinc-300 dark:text-zinc-700 w-6 h-6" />
                    )}
                 </div>
                 <div>
                    <p className="text-[15px] font-bold text-zinc-900 dark:text-white leading-tight">{event.organizer?.full_name || 'Campus Student Union'}</p>
                    <p className="text-[11px] font-black text-zinc-400 uppercase tracking-widest mt-0.5">Verified Organizer</p>
                 </div>
              </div>
              <button className="px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg">Follow</button>
           </div>
        </section>

        {/* Footer Actions */}
        <div className="fixed bottom-10 left-6 right-6 flex items-center gap-4 z-40">
           <button 
             className="flex-1 py-5 bg-zinc-900 dark:bg-[#E5FF66] text-white dark:text-black rounded-[28px] font-black text-sm uppercase italic tracking-wider shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3"
             onClick={() => showToast("Registration materialized! See you there.")}
           >
              Register Now
              <Plus size={20} strokeWidth={3} />
           </button>
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
}
