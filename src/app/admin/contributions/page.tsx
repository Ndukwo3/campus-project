"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { 
  FileText, 
  CheckCircle2, 
  XCircle, 
  Download, 
  ExternalLink, 
  Search, 
  Filter,
  Loader2,
  Clock,
  User,
  GraduationCap,
  Plus,
  Pencil,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function ContributionsReviewPage() {
  const [contributions, setContributions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("pending");
  const [searchTerm, setSearchTerm] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [editingResource, setEditingResource] = useState<any | null>(null);
  const [isUpdateLoading, setIsUpdateLoading] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    fetchContributions();
  }, [filter]);

  async function fetchContributions() {
    setIsLoading(true);
    try {
      // 0. Get user restriction
      const { data: { session } } = await supabase.auth.getSession();
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, moderated_university_id')
        .eq('id', session?.user.id)
        .single();

      const modUniId = profile?.moderated_university_id;
      const isRestricted = profile?.role === 'moderator' && modUniId;

      // 1. Fetch contributions with restriction if applicable
      let query = supabase
        .from('academic_resources')
        .select('*, profiles(full_name, username, avatar_url)')
        .eq('status', filter)
        .order('created_at', { ascending: false });

      if (isRestricted) query = query.eq('university_id', modUniId);

      const { data, error } = await query;

      if (error) throw error;
      setContributions(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(true);
      // Simulate real delay for premium feels
      setTimeout(() => setIsLoading(false), 800);
    }
  }

  const handleAction = async (id: string, newStatus: string) => {
    setActionLoading(id);
    try {
      const { error } = await supabase
        .from('academic_resources')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;
      
      // Update local state
      setContributions(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      console.error(error);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredContributions = contributions.filter(c => 
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.university_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.course_code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-32">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black italic uppercase tracking-tight text-zinc-900 dark:text-white">Review Contributions</h2>
          <p className="text-sm font-bold text-zinc-500 dark:text-zinc-400 mt-2 uppercase tracking-widest text-[11px]">Audit and Approve student uploads for the community library.</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-2xl w-fit">
            {["pending", "approved", "rejected"].map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-5 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all ${filter === s ? "bg-white dark:bg-black text-zinc-900 dark:text-white shadow-sm scale-105" : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"}`}
              >
                {s}
              </button>
            ))}
          </div>

          <Link href="/admin/contributions/upload">
            <button className="h-[52px] px-6 rounded-2xl bg-zinc-900 dark:bg-[#E5FF66] text-white dark:text-black font-black uppercase tracking-widest text-[11px] flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-zinc-200 dark:shadow-none">
              <Plus size={18} strokeWidth={3} />
              Direct Upload
            </button>
          </Link>
        </div>
      </div>

      {/* Modern Search Field */}
      <div className="relative group max-w-xl">
        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-[#E5FF66] transition-colors">
          <Search size={20} strokeWidth={2.5} />
        </div>
        <input 
          type="text"
          placeholder="Filter by university, course, or title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 rounded-[28px] pl-14 pr-6 py-4.5 text-[15px] font-bold text-zinc-900 dark:text-white outline-none focus:border-[#E5FF66]/30 transition-all placeholder:text-zinc-300 dark:placeholder:text-zinc-700"
        />
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => (
             <div key={i} className="h-28 rounded-[32px] bg-zinc-50 dark:bg-zinc-900/50 animate-pulse border border-zinc-100 dark:border-zinc-800" />
          ))}
        </div>
      ) : filteredContributions.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center text-center opacity-30">
          <FileText size={64} className="text-zinc-300 dark:text-zinc-700 mb-6" />
          <p className="font-black uppercase tracking-widest text-sm">No contributions found in this queue.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredContributions.map((resource) => {
              return (
                <motion.div 
                  layout
                  key={resource.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="group flex flex-col lg:flex-row items-center gap-6 p-6 rounded-[32px] bg-white dark:bg-black border border-zinc-100 dark:border-zinc-900 shadow-sm hover:shadow-xl hover:border-[#E5FF66]/20 transition-all"
                >
                  {/* Visual Icon */}
                  <div className="w-16 h-16 rounded-2xl bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center text-zinc-900 dark:text-[#E5FF66] group-hover:bg-[#E5FF66] group-hover:text-black transition-all shadow-inner">
                    <FileText size={32} strokeWidth={2.5} />
                  </div>

                  {/* Metadata */}
                  <div className="flex-1 min-w-0 space-y-2 text-center lg:text-left">
                    <div>
                      <h3 className="text-[17px] font-black tracking-tight text-zinc-900 dark:text-white leading-none truncate capitalize">
                        {resource.title}
                      </h3>
                      <div className="flex items-center justify-center lg:justify-start gap-4 mt-2">
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-zinc-100 dark:bg-zinc-900 rounded-full">
                          <GraduationCap size={12} className="text-zinc-400" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{resource.university_name}</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-zinc-100 dark:bg-zinc-900 rounded-full">
                          <span className="text-[10px] font-black uppercase tracking-widest text-[#E5FF66]/60">{resource.level}</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-zinc-100 dark:bg-zinc-900 rounded-full">
                          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{resource.semester}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-center lg:justify-start gap-3 pt-2">
                      <User size={14} className="text-zinc-300" />
                      <p className="text-[11px] font-bold text-zinc-400">
                        Shared by <span className="text-zinc-900 dark:text-zinc-200">{resource.profiles?.full_name || "@" + resource.profiles?.username}</span>
                      </p>
                      <span className="text-zinc-700 dark:text-zinc-800">·</span>
                      <Clock size={14} className="text-zinc-300" />
                      <p className="text-[11px] font-bold text-zinc-400">
                        {new Date(resource.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setEditingResource(resource)}
                      className="w-12 h-12 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 text-zinc-400 hover:text-blue-500 hover:border-blue-500/30 flex items-center justify-center transition-all active:scale-95"
                      title="Edit Metadata"
                    >
                      <Pencil size={18} strokeWidth={2.5} />
                    </button>

                    <a 
                      href={resource.file_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-12 h-12 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 text-zinc-400 hover:text-zinc-900 dark:hover:text-white flex items-center justify-center transition-all active:scale-95"
                      title="View Original File"
                    >
                      <ExternalLink size={20} strokeWidth={2.5} />
                    </a>

                    {filter === 'pending' && (
                      <>
                        <button
                          onClick={() => handleAction(resource.id, 'rejected')}
                          disabled={actionLoading !== null}
                          className="w-12 h-12 rounded-2xl bg-red-50/50 dark:bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all active:scale-95 flex items-center justify-center shadow-sm"
                          title="Reject"
                        >
                          <XCircle size={20} strokeWidth={3} />
                        </button>
                        <button
                          onClick={() => handleAction(resource.id, 'approved')}
                          disabled={actionLoading !== null}
                          className="px-6 h-12 rounded-2xl bg-[#E5FF66] text-black font-black uppercase tracking-widest text-[11px] hover:scale-105 active:scale-95 transition-all shadow-lg flex items-center gap-2"
                        >
                          {actionLoading === resource.id ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <CheckCircle2 size={18} strokeWidth={2.5} />
                          )}
                          Approve
                        </button>
                      </>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Edit Metadata Modal */}
      <AnimatePresence>
        {editingResource && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 lg:p-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingResource(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white dark:bg-black rounded-[40px] border border-zinc-100 dark:border-zinc-900 shadow-2xl overflow-hidden"
            >
              <div className="p-8 lg:p-10">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-2xl font-black italic uppercase tracking-tight text-zinc-900 dark:text-white">Edit Metadata</h3>
                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-1">Correcting Resource: {editingResource.title}</p>
                  </div>
                  <button onClick={() => setEditingResource(null)} className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-all">
                    <X size={20} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-black text-zinc-400 uppercase tracking-widest mb-2 px-1">Resource Title</label>
                    <input 
                      type="text" 
                      value={editingResource.title}
                      onChange={(e) => setEditingResource({...editingResource, title: e.target.value})}
                      className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl px-5 py-3.5 text-sm font-bold outline-none focus:border-[#E5FF66]/30 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-black text-zinc-400 uppercase tracking-widest mb-2 px-1">University Name</label>
                    <input 
                      type="text" 
                      value={editingResource.university_name}
                      onChange={(e) => setEditingResource({...editingResource, university_name: e.target.value})}
                      className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl px-5 py-3.5 text-sm font-bold outline-none focus:border-[#E5FF66]/30 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-black text-zinc-400 uppercase tracking-widest mb-2 px-1">Faculty / College / School</label>
                    <input 
                      type="text" 
                      value={editingResource.college_name || ""}
                      onChange={(e) => setEditingResource({...editingResource, college_name: e.target.value})}
                      className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl px-5 py-3.5 text-sm font-bold outline-none focus:border-[#E5FF66]/30 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-black text-zinc-400 uppercase tracking-widest mb-2 px-1">Department</label>
                    <input 
                      type="text" 
                      value={editingResource.department_name}
                      onChange={(e) => setEditingResource({...editingResource, department_name: e.target.value})}
                      className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl px-5 py-3.5 text-sm font-bold outline-none focus:border-[#E5FF66]/30 transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-black text-zinc-400 uppercase tracking-widest mb-2 px-1">Level</label>
                      <select 
                        value={editingResource.level}
                        onChange={(e) => setEditingResource({...editingResource, level: e.target.value})}
                        className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl px-4 py-3.5 text-sm font-bold outline-none"
                      >
                        {["100 Level", "200 Level", "300 Level", "400 Level", "500 Level", "600 Level", "Postgraduate"].map(l => (
                          <option key={l} value={l}>{l}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-black text-zinc-400 uppercase tracking-widest mb-2 px-1">Semester</label>
                      <select 
                        value={editingResource.semester}
                        onChange={(e) => setEditingResource({...editingResource, semester: e.target.value})}
                        className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl px-4 py-3.5 text-sm font-bold outline-none"
                      >
                        {["First Semester", "Second Semester"].map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="mt-10 flex gap-4">
                  <button 
                    onClick={() => setEditingResource(null)}
                    className="flex-1 h-14 rounded-2xl border border-zinc-100 dark:border-zinc-800 font-black uppercase tracking-widest text-[11px] hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={async () => {
                      setIsUpdateLoading(true);
                      const { error } = await supabase
                        .from('academic_resources')
                        .update({
                          title: editingResource.title,
                          university_name: editingResource.university_name,
                          college_name: editingResource.college_name,
                          department_name: editingResource.department_name,
                          level: editingResource.level,
                          semester: editingResource.semester
                        })
                        .eq('id', editingResource.id);
                      
                      if (!error) {
                        setContributions(prev => prev.map(c => c.id === editingResource.id ? editingResource : c));
                        setEditingResource(null);
                      }
                      setIsUpdateLoading(false);
                    }}
                    disabled={isUpdateLoading}
                    className="flex-[2] h-14 rounded-2xl bg-[#E5FF66] text-black font-black uppercase tracking-widest text-[11px] hover:scale-105 active:scale-95 transition-all shadow-xl flex items-center justify-center gap-2"
                  >
                    {isUpdateLoading ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                    Save Changes
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
