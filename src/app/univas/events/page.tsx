"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Search, Calendar, Plus, 
  Filter, Sparkles, LayoutGrid, Loader2,
  X, MapPin, Clock, Info
} from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import BottomNavigation from "@/components/BottomNavigation";
import EventCard from "@/components/EventCard";
import Toast from "@/components/Toast";

export default function EventsPage() {
  const router = useRouter();
  const supabase = createClient();
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [user, setUser] = useState<any>(null);

  const categories = ["all", "academic", "social", "sports", "tech", "arts"];

  useEffect(() => {
    async function init() {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      setUser(authUser);
      fetchEvents();
    }
    init();
  }, [supabase]);

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true });
      
      if (error) throw error;
      setEvents(data || []);
    } catch (err) {
      console.error("Fetch events error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         event.location?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "all" || event.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-black max-w-md mx-auto relative font-sans transition-colors notranslate">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/80 dark:bg-black/80 backdrop-blur-xl px-6 pt-10 pb-5 flex items-center justify-between border-b border-zinc-100/50 dark:border-zinc-800/50">
        <div className="flex items-center gap-4">
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={() => router.push("/univas")}
            className="w-10 h-10 rounded-xl bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center text-zinc-900 dark:text-white border border-zinc-100 dark:border-zinc-800"
          >
            <ArrowLeft size={20} />
          </motion.button>
          <div className="flex flex-col">
            <h1 className="text-[24px] font-black tracking-tight text-zinc-900 dark:text-white uppercase italic leading-none">Events</h1>
            <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-600 uppercase tracking-widest mt-1">Campus Happenings</p>
          </div>
        </div>
        <motion.button 
          whileTap={{ scale: 0.9 }}
          onClick={() => router.push("/univas/events/create")}
          className="w-10 h-10 rounded-xl bg-zinc-900 dark:bg-[#E5FF66] flex items-center justify-center text-white dark:text-black shadow-lg"
        >
          <Plus size={20} />
        </motion.button>
      </div>

      <main className="flex-1 px-6 py-8 pb-40 space-y-8 overflow-y-auto scrollbar-hide">
        {/* Search & Filters */}
        <div className="space-y-6">
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for events, locations..."
              className="w-full h-14 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl pl-12 pr-4 text-sm font-bold border border-zinc-100 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-[#E5FF66]/20 focus:border-[#E5FF66] transition-all"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border-2 ${
                  activeCategory === cat 
                  ? "bg-zinc-900 dark:bg-[#E5FF66] text-white dark:text-black shadow-lg border-transparent mt-[-2px] mb-[2px]" 
                  : "bg-white dark:bg-zinc-950 text-zinc-400 dark:text-zinc-600 border-zinc-100 dark:border-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Featured Event / Stats */}
        <div className="bg-zinc-900 dark:bg-white rounded-[44px] p-8 relative overflow-hidden group shadow-2xl">
           <div className="absolute top-0 right-0 p-8">
              <Sparkles className="text-[#E5FF66] dark:text-zinc-900 animate-pulse" size={24} />
           </div>
           <div className="relative z-10 space-y-2">
              <h2 className="text-[32px] font-black text-white dark:text-black uppercase italic leading-none tracking-tighter">Your Campus<br/>Is Alive.</h2>
              <p className="text-[10px] font-black text-[#E5FF66] dark:text-zinc-500 uppercase tracking-[0.2em]">{filteredEvents.length} Upcoming Events Found</p>
           </div>
        </div>

        {/* Events Grid */}
        <div className="space-y-6">
          {isLoading ? (
            <div className="flex flex-col items-center py-20 opacity-50">
              <Loader2 className="w-8 h-8 animate-spin mb-4 text-[#E5FF66]" />
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Syncing Campus Schedule...</p>
            </div>
          ) : filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              {filteredEvents.map((event) => (
                <EventCard 
                  key={event.id} 
                  event={event} 
                  onClick={(id) => router.push(`/univas/events/${id}`)}
                />
              ))}
            </div>
          ) : (
            <div className="py-24 text-center space-y-6">
              <div className="w-20 h-20 bg-zinc-50 dark:bg-zinc-900/50 rounded-[40px] flex items-center justify-center mx-auto border-2 border-dashed border-zinc-100 dark:border-zinc-800">
                 <Calendar size={32} className="text-zinc-200 dark:text-zinc-800" />
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase italic">Nothing Scheduled</h3>
                <p className="text-[11px] font-bold text-zinc-400 dark:text-zinc-600 uppercase tracking-widest leading-loose">
                  It's a quiet week on campus.<br/>Why not organize something?
                </p>
              </div>
              <motion.button 
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/univas/events/create')}
                className="px-8 py-4 bg-zinc-900 dark:bg-[#E5FF66] text-white dark:text-black rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl transition-all"
              >
                Host an Event
              </motion.button>
            </div>
          )}
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
}
