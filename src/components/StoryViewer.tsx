"use client";

import { X, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

interface Story {
  id: string;
  image_url: string | null;
  content: string | null;
  background_color: string | null;
  created_at: string;
}

interface StoryViewerProps {
  user: {
    username: string;
    full_name: string;
    avatar_url: string | null;
  };
  stories: Story[];
  onClose: () => void;
}

export default function StoryViewer({ user, stories, onClose }: StoryViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  const handleNext = useCallback(() => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setProgress(0);
    } else {
      onClose();
    }
  }, [currentIndex, stories.length, onClose]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setProgress(0);
    } else {
      setCurrentIndex(0);
      setProgress(0);
    }
  }, [currentIndex]);

  // Handle auto-advancing when progress reaches 100%
  useEffect(() => {
    if (progress >= 100) {
      handleNext();
    }
  }, [progress, handleNext]);

  useEffect(() => {
    const duration = 5000; // 5 seconds per story
    const interval = 50; // Update progress every 50ms
    const step = (interval / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => (prev < 100 ? prev + step : 100));
    }, interval);

    return () => clearInterval(timer);
  }, [currentIndex]);

  if (!stories.length) return null;

  const currentStory = stories[currentIndex];

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center mx-auto max-w-md">
      {/* Progress Bars */}
      <div className="absolute top-6 left-4 right-4 z-20 flex gap-1.5">
        {stories.map((_, index) => (
          <div key={index} className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-white"
              initial={{ width: 0 }}
              animate={{ 
                width: index === currentIndex ? `${progress}%` : index < currentIndex ? "100%" : "0%" 
              }}
              transition={{ duration: 0.1 }}
            />
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="absolute top-12 left-4 right-4 z-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-white overflow-hidden bg-zinc-800">
            {user.avatar_url ? (
              <Image src={user.avatar_url} alt={user.username} width={40} height={40} className="object-cover w-full h-full" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white font-bold text-xs bg-zinc-700">
                {user.username.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-white font-bold text-sm tracking-tight">{user.full_name || user.username}</span>
            <span className="text-white/60 text-[11px] font-medium">
              {new Date(currentStory.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-black/20 text-white backdrop-blur-sm hover:bg-black/40 transition-colors"
        >
          <X size={24} />
        </button>
      </div>

      {/* Story Content */}
      <div className="relative w-full h-full flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStory.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.3 }}
            className="relative w-full h-full flex items-center justify-center"
            style={{ backgroundColor: currentStory.image_url ? 'black' : (currentStory.background_color || '#E5FF66') }}
          >
            {currentStory.image_url ? (
              <Image
                src={currentStory.image_url}
                alt="Story content"
                fill
                className="object-contain"
                priority
                unoptimized
              />
            ) : (
              <div 
                className="px-8 text-center"
              >
                <h2 className="text-3xl font-black text-black leading-tight tracking-tight">
                  {currentStory.content}
                </h2>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Interaction Areas */}
        <div className="absolute inset-0 flex">
          <div className="w-1/3 h-full cursor-pointer" onClick={handlePrev} />
          <div className="w-2/3 h-full cursor-pointer" onClick={handleNext} />
        </div>
      </div>

      {/* Navigation Buttons for desktop */}
      <div className="hidden md:flex absolute top-1/2 -translate-y-1/2 left-4 right-4 justify-between pointer-events-none">
        <button 
          onClick={handlePrev}
          className="w-12 h-12 flex items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md pointer-events-auto hover:bg-white/20 transition-all active:scale-95"
        >
          <ChevronLeft size={28} />
        </button>
        <button 
          onClick={handleNext}
          className="w-12 h-12 flex items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md pointer-events-auto hover:bg-white/20 transition-all active:scale-95"
        >
          <ChevronRight size={28} />
        </button>
      </div>
    </div>
  );
}
