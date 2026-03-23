"use client";

import { useState } from "react";
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const { data, error: groupError } = await supabase
        .from('groups')
        .insert({
          name: name.trim(),
          description: description.trim(),
          university_id: universityId,
          created_by: userId,
          is_private: isPrivate
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
        className="bg-white w-full max-w-md rounded-t-[32px] sm:rounded-[32px] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
      >
        <div className="px-6 py-5 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
          <h2 className="text-xl font-bold text-zinc-900 tracking-tight">Create Group</h2>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-zinc-100 transition-colors">
            <X size={20} className="text-zinc-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
          {/* Group Icon Placeholder */}
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 rounded-[32px] bg-zinc-100 flex items-center justify-center text-zinc-400 group relative cursor-pointer hover:bg-zinc-200 transition-colors">
              <Users size={40} />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/10 rounded-[32px]">
                <Camera size={24} className="text-white" />
              </div>
            </div>
            <p className="text-[11px] font-bold text-zinc-400 mt-3 uppercase tracking-widest">Group Icon</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2 px-1">Group Name</label>
              <input 
                type="text" 
                placeholder="e.g. CSC Class of 2026"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl px-5 py-4 text-[15px] outline-none focus:ring-2 focus:ring-[#E5FF66]/50 focus:border-white transition-all font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2 px-1">Description</label>
              <textarea 
                placeholder="What is this group about?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl px-5 py-4 text-[15px] outline-none focus:ring-2 focus:ring-[#E5FF66]/50 focus:border-white transition-all font-medium h-32 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button 
                type="button"
                onClick={() => setIsPrivate(false)}
                className={`p-4 rounded-2xl border flex flex-col gap-2 transition-all ${!isPrivate ? "bg-white border-[#E5FF66] ring-2 ring-[#E5FF66]/20" : "bg-zinc-50 border-zinc-100"}`}
              >
                <Globe size={20} className={!isPrivate ? "text-zinc-900" : "text-zinc-400"} />
                <div className="text-left">
                  <p className="text-sm font-bold text-zinc-900 leading-none">Public</p>
                  <p className="text-[11px] text-zinc-500 font-medium">Anyone can join</p>
                </div>
              </button>

              <button 
                type="button"
                onClick={() => setIsPrivate(true)}
                className={`p-4 rounded-2xl border flex flex-col gap-2 transition-all ${isPrivate ? "bg-white border-[#E5FF66] ring-2 ring-[#E5FF66]/20" : "bg-zinc-50 border-zinc-100"}`}
              >
                <Lock size={20} className={isPrivate ? "text-zinc-900" : "text-zinc-400"} />
                <div className="text-left">
                  <p className="text-sm font-bold text-zinc-900 leading-none">Private</p>
                  <p className="text-[11px] text-zinc-500 font-medium">Approval needed</p>
                </div>
              </button>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-[13px] font-medium border border-red-100">
              {error}
            </div>
          )}
        </form>

        <div className="p-6 border-t border-zinc-100 bg-zinc-50/30">
          <button 
            onClick={handleSubmit}
            disabled={!name.trim() || isSubmitting}
            className="w-full bg-[#1A1A24] text-white rounded-2xl py-4.5 font-bold text-[15px] hover:bg-black transition-all shadow-lg active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
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
