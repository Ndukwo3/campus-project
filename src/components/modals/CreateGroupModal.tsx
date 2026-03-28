"use client";

import { useState, useRef } from "react";
import { X, Users, Lock, Globe, Loader2, Camera } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase";

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (groupId: string) => void;
  universityId: string;
  userId: string;
}

export default function CreateGroupModal({ isOpen, onClose, onSuccess, universityId, userId }: CreateGroupModalProps) {
  const supabase = createClient();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      let imageUrl = null;

      // Handle Image Upload
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${userId}-${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('posts')
          .upload(filePath, imageFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('posts')
          .getPublicUrl(filePath);
        
        imageUrl = publicUrl;
      }

      const { data, error: groupError } = await supabase
        .from('groups')
        .insert({
          name: name.trim(),
          description: description.trim(),
          university_id: universityId,
          created_by: userId,
          is_private: isPrivate,
          image_url: imageUrl
        })
        .select('id')
        .single();

      if (groupError) throw groupError;

      // Automatically add creator as an admin member
      const { error: memberError } = await supabase
        .from('group_members')
        .insert({
          group_id: data.id,
          user_id: userId,
          role: 'admin'
        });

      if (memberError) throw memberError;

      onSuccess(data.id);
      onClose();
      // Reset form
      setName("");
      setDescription("");
      setIsPrivate(false);
      setImageFile(null);
      setImagePreview(null);
    } catch (err: any) {
      console.error("Error creating group:", err);
      setError(err.message || "Failed to create group. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-0 sm:p-4" onClick={onClose}>
      <motion.div 
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-zinc-950 w-full max-w-md rounded-t-[32px] sm:rounded-[32px] overflow-hidden shadow-2xl flex flex-col max-h-[90vh] transition-colors"
      >
        <div className="px-6 py-5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">Create Group</h2>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
            <X size={20} className="text-zinc-500 dark:text-zinc-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
          {/* Group Icon Picker */}
          <div className="flex flex-col items-center">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="w-24 h-24 rounded-[32px] bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-zinc-400 dark:text-zinc-600 group relative cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors border-2 border-dashed border-zinc-200 dark:border-zinc-800 overflow-hidden"
            >
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <Users size={40} />
              )}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 backdrop-blur-[2px]">
                <Camera size={24} className="text-white drop-shadow-md" />
              </div>
            </div>
            <p className="text-[11px] font-black text-zinc-400 dark:text-zinc-500 mt-3 uppercase tracking-[0.2em]">Add Community Cover</p>
            <input 
              type="file" 
              ref={fileInputRef} 
              hidden 
              accept="image/*" 
              onChange={handleImageSelect} 
            />
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-2 px-1">Group Name</label>
              <input 
                type="text" 
                placeholder="e.g. CSC Class of 2026"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl px-5 py-4 text-[15px] outline-none focus:ring-2 focus:ring-[#E5FF66]/50 dark:focus:ring-[#E5FF66]/20 focus:border-white dark:focus:border-zinc-700 transition-all font-medium text-zinc-900 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-2 px-1">Description</label>
              <textarea 
                placeholder="What is this group about?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl px-5 py-4 text-[15px] outline-none focus:ring-2 focus:ring-[#E5FF66]/50 dark:focus:ring-[#E5FF66]/20 focus:border-white dark:focus:border-zinc-700 transition-all font-medium h-32 resize-none text-zinc-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button 
                type="button"
                onClick={() => setIsPrivate(false)}
                className={`p-4 rounded-2xl border flex flex-col gap-2 transition-all ${!isPrivate ? "bg-white dark:bg-[#E5FF66]/10 border-[#E5FF66] ring-2 ring-[#E5FF66]/20" : "bg-zinc-50 dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800"}`}
              >
                <Globe size={20} className={!isPrivate ? "text-zinc-900 dark:text-[#E5FF66]" : "text-zinc-400 dark:text-zinc-600"} />
                <div className="text-left">
                  <p className={`text-sm font-bold leading-none ${!isPrivate ? "text-zinc-900 dark:text-white" : "text-zinc-500"}`}>Public</p>
                  <p className="text-[11px] text-zinc-500 font-medium mt-1">Anyone can join</p>
                </div>
              </button>

              <button 
                type="button"
                onClick={() => setIsPrivate(true)}
                className={`p-4 rounded-2xl border flex flex-col gap-2 transition-all ${isPrivate ? "bg-white dark:bg-[#E5FF66]/10 border-[#E5FF66] ring-2 ring-[#E5FF66]/20" : "bg-zinc-50 dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800"}`}
              >
                <Lock size={20} className={isPrivate ? "text-zinc-900 dark:text-[#E5FF66]" : "text-zinc-400 dark:text-zinc-600"} />
                <div className="text-left">
                  <p className={`text-sm font-bold leading-none ${isPrivate ? "text-zinc-900 dark:text-white" : "text-zinc-500"}`}>Private</p>
                  <p className="text-[11px] text-zinc-500 font-medium mt-1">Approval needed</p>
                </div>
              </button>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-2xl text-[13px] font-medium border border-red-100 dark:border-red-500/20">
              {error}
            </div>
          )}
        </form>

        <div className="p-6 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-900/30">
          <button 
            onClick={handleSubmit}
            disabled={!name.trim() || isSubmitting}
            className="w-full bg-zinc-900 dark:bg-[#E5FF66] text-white dark:text-black rounded-2xl py-4.5 font-bold text-[15px] hover:bg-black dark:hover:bg-[#d4f54d] transition-all shadow-lg active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Creating Group...
              </>
            ) : (
              "Create Group"
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
