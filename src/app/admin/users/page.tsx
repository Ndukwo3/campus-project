"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { 
  Users, 
  Search, 
  ShieldCheck, 
  Shield, 
  User, 
  Loader2,
  CheckCircle2,
  AlertCircle,
  ChevronDown
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Profile {
  id: string;
  full_name: string;
  username: string;
  role: string;
  avatar_url?: string;
  created_at?: string;
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  
  const supabase = createClient();

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);

      if (user) {
        const { data: ownProfile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        setCurrentUserRole(ownProfile?.role || null);
      }

      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, full_name, username, role, avatar_url, created_at')
        .order('role', { ascending: false });
      
      if (error) throw error;
      setUsers(profiles || []);
    } catch (err: any) {
      console.error(err);
      setMessage({ type: 'error', text: "Failed to fetch users. Check permissions." });
    } finally {
      setIsLoading(false);
    }
  }

  const handleUpdateRole = async (userId: string, newRole: string) => {
    if (userId === currentUserId) {
      setMessage({ type: 'error', text: "You cannot change your own role." });
      return;
    }

    if (currentUserRole !== 'super_admin') {
      setMessage({ type: 'error', text: "Only Super Admins can manage roles." });
      return;
    }

    setUpdatingId(userId);
    setMessage(null);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;

      // Update local state
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
      setMessage({ type: 'success', text: "User status updated successfully!" });
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      console.error(err);
      setMessage({ type: 'error', text: "Failed to update role." });
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredUsers = users.filter(u => 
    (u.full_name?.toLowerCase() || "").includes(search.toLowerCase()) || 
    (u.username?.toLowerCase() || "").includes(search.toLowerCase())
  );

  const getRoleStyle = (role: string) => {
    switch(role) {
      case 'super_admin': return 'bg-[#E5FF66] text-black shadow-lg shadow-[#E5FF66]/20';
      case 'admin': return 'bg-purple-500 text-white shadow-lg shadow-purple-500/20';
      case 'moderator': return 'bg-blue-500 text-white shadow-lg shadow-blue-500/20';
      default: return 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400';
    }
  };

  return (
    <div className="space-y-8 pb-32">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black italic uppercase tracking-tight text-zinc-900 dark:text-white flex items-center gap-3">
            <Users size={32} className="text-[#E5FF66]" />
            User Directory
          </h2>
          <p className="text-sm font-bold text-zinc-500 dark:text-zinc-400 mt-2 uppercase tracking-widest text-[11px]">
            Manage every user in the system. Use Team Management for administrative staff.
          </p>
        </div>
      </div>

      <AnimatePresence>
        {message && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`p-4 rounded-2xl flex items-center gap-3 text-sm font-bold uppercase tracking-widest ${message.type === 'success' ? 'bg-[#E5FF66]/20 text-[#E2FF3D]' : 'bg-red-500/10 text-red-500'}`}
          >
            {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative group max-w-xl">
        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-[#E5FF66] transition-colors">
          <Search size={20} strokeWidth={2.5} />
        </div>
        <input 
          type="text"
          placeholder="Search by name, username..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 rounded-[28px] pl-14 pr-6 py-4.5 text-[15px] font-bold text-zinc-900 dark:text-white outline-none focus:border-[#E5FF66]/30 transition-all placeholder:text-zinc-300 dark:placeholder:text-zinc-700"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-zinc-400" size={32} />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredUsers.map(user => (
            <div 
              key={user.id}
              className="p-6 bg-white dark:bg-zinc-900 rounded-[32px] border border-zinc-100 dark:border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-6 hover:border-[#E5FF66]/30 transition-all group"
            >
              <div className="flex items-center gap-4 w-full md:w-auto">
                <div className="w-14 h-14 rounded-full bg-zinc-100 dark:bg-black border-2 border-zinc-200 dark:border-zinc-800 overflow-hidden flex items-center justify-center shrink-0">
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User className="text-zinc-400" size={24} />
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="font-black text-lg text-zinc-900 dark:text-white leading-none capitalize mb-1 truncate">
                    {user.full_name || "Unknown"}
                  </h3>
                  <div className="flex items-center gap-2">
                    <p className="text-[12px] font-bold text-zinc-400 dark:text-zinc-500">
                      @{user.username || "user"}
                    </p>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter ${getRoleStyle(user.role || 'user')}`}>
                      {user.role || 'user'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-zinc-50 dark:bg-black p-2 rounded-2xl w-full md:w-auto justify-center md:justify-end">
                <div className="flex items-center gap-2 pr-2 mr-2 border-r border-zinc-200 dark:border-zinc-800">
                  <p className="text-[10px] uppercase font-black text-zinc-400">Clearance Level:</p>
                </div>
                
                <div className="relative group/select">
                  <select
                    value={user.role || 'student'}
                    onChange={(e) => handleUpdateRole(user.id, e.target.value)}
                    disabled={updatingId === user.id || user.id === currentUserId || user.role === 'super_admin' || currentUserRole !== 'super_admin'}
                    className="appearance-none bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 pr-10 text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-[#E5FF66] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="student">Student (Member)</option>
                    <option value="moderator">Moderator</option>
                    <option value="admin">Admin</option>
                    {user.role === 'super_admin' && <option value="super_admin">Super Admin</option>}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
                    {updatingId === user.id ? (
                      <Loader2 className="animate-spin" size={12} />
                    ) : (
                      <ChevronDown size={14} strokeWidth={3} />
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {filteredUsers.length === 0 && (
            <div className="text-center py-20 px-10">
              <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search size={24} className="text-zinc-400" />
              </div>
              <p className="text-zinc-500 dark:text-zinc-400 font-bold">No users match your criteria.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
