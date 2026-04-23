"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Calendar, MapPin, Clock, Users, ChevronRight } from "lucide-react";
import { format } from "date-fns";

interface EventCardProps {
  event: {
    id: string;
    title: string;
    description: string;
    date: string;
    time: string;
    location: string;
    image_url: string | null;
    category: string;
    status: string;
  };
  onClick?: (id: string) => void;
}

export default function EventCard({ event, onClick }: EventCardProps) {
  const eventDate = new Date(event.date);

  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={() => onClick?.(event.id)}
      className="bg-white dark:bg-zinc-900/40 rounded-[38px] overflow-hidden border border-zinc-100/60 dark:border-zinc-800/40 shadow-sm hover:shadow-2xl hover:shadow-black/5 dark:hover:shadow-black/20 transition-all duration-500 cursor-pointer flex flex-col group"
    >
      {/* Image Header */}
      <div className="relative h-48 w-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
        {event.image_url ? (
          <Image
            src={event.image_url}
            alt={event.title}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-1000"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-900 dark:to-zinc-800">
            <Calendar size={48} className="text-zinc-200 dark:text-zinc-700" />
          </div>
        )}
        
        {/* Category Tag */}
        <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-[#E5FF66]" />
          <span className="text-[9px] font-black text-white uppercase tracking-wider">{event.category}</span>
        </div>

        {/* Date Overlay */}
        <div className="absolute bottom-4 right-4 w-12 h-14 rounded-2xl bg-white dark:bg-black/80 backdrop-blur-md flex flex-col items-center justify-center shadow-lg border border-white/20">
           <span className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase leading-none">{format(eventDate, 'MMM')}</span>
           <span className="text-lg font-black text-zinc-900 dark:text-white leading-none mt-0.5">{format(eventDate, 'dd')}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-1">
        <div className="flex-1 space-y-3">
          <h3 className="font-black text-xl text-zinc-900 dark:text-white uppercase italic leading-none tracking-tight group-hover:text-[#E5FF66] transition-colors">
            {event.title}
          </h3>
          
          <p className="text-[13px] text-zinc-500 dark:text-zinc-400 line-clamp-2 font-medium leading-relaxed">
            {event.description}
          </p>
        </div>

        <div className="mt-6 pt-5 border-t border-zinc-100 dark:border-zinc-800/50 space-y-3">
          <div className="flex items-center justify-between text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-[#E5FF66]" />
              <span>{event.time}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-[#E5FF66]" />
              <span className="truncate max-w-[120px]">{event.location}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-4">
             <div className="flex -space-x-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-7 h-7 rounded-full bg-zinc-200 dark:bg-zinc-800 border-2 border-white dark:border-zinc-900 flex items-center justify-center">
                    <Users size={12} className="text-zinc-400" />
                  </div>
                ))}
                <div className="w-7 h-7 rounded-full bg-[#E5FF66] border-2 border-white dark:border-zinc-900 flex items-center justify-center text-[8px] font-black text-black">
                  +12
                </div>
             </div>
             
             <div className="flex items-center gap-2 text-[10px] font-black text-zinc-900 dark:text-[#E5FF66] uppercase tracking-widest">
               Details <ChevronRight size={14} />
             </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
