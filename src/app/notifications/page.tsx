"use client";

import { ArrowLeft, MoreVertical, Heart, MessageCircle, UserPlus, Bell, User, Check, Repeat2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BottomNavigation from "@/components/BottomNavigation";
import NotificationSkeleton from "@/components/skeletons/NotificationSkeleton";
import { useNotificationStore } from "@/store/notificationStore";
import { createClient } from "@/lib/supabase";
import { formatDistanceToNow } from "date-fns";

export default function NotificationsPage() {
  const { setHasUnread } = useNotificationStore();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const supabase = createClient();
  
  useEffect(() => {
    // Mark notifications as read in state
    setHasUnread(false);

    // Fetch from database
    const fetchNotifications = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      // Fetch and format
      const { data, error } = await supabase
        .from('notifications')
        .select(`
          *,
          sender:profiles!sender_id (
            id,
            username,
            avatar_url
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (data && !error) {
        setNotifications(data);

        // Mark as read in DB if there are unread ones
        const unreadIds = data.filter((n: any) => !n.is_read).map((n: any) => n.id);
        if (unreadIds.length > 0) {
          await supabase
            .from('notifications')
            .update({ is_read: true })
            .in('id', unreadIds);
        }
      }
      setIsLoading(false);
    };

    fetchNotifications();
  }, [setHasUnread, supabase]);

  const handleMarkAllRead = async () => {
    const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
    if (unreadIds.length === 0) return;

    setNotifications(prev => prev.map((n: any) => ({ ...n, is_read: true })));
    await supabase.from('notifications').update({ is_read: true }).in('id', unreadIds);
  };

  const handleAccept = async (senderId: string) => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      await supabase.from('friend_requests').update({ status: 'accepted' })
        .match({ sender_id: senderId, receiver_id: user.id, status: 'pending' });
        
      // Delete the connect_request notification as it's now handled
      await supabase.from('notifications').delete()
        .match({ user_id: user.id, sender_id: senderId, type: 'connect_request' });
        
      await supabase.from('notifications').insert({
        user_id: senderId,
        sender_id: user.id,
        type: 'connect_accepted',
        content: 'accepted your connect request!',
        is_read: false
      });
      
      setNotifications(prev => prev.map(n => 
        (n.type === 'connect_request' && n.sender_id === senderId) ? { ...n, _handled: 'accepted' } : n
      ));
    } catch (e) {
      console.error('Error accepting request:', e);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDecline = async (senderId: string) => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      await supabase.from('friend_requests').update({ status: 'rejected' })
        .match({ sender_id: senderId, receiver_id: user.id, status: 'pending' });
        
      // Delete the connect_request notification as it's now handled
      await supabase.from('notifications').delete()
        .match({ user_id: user.id, sender_id: senderId, type: 'connect_request' });
        
      setNotifications(prev => prev.map(n => 
        (n.type === 'connect_request' && n.sender_id === senderId) ? { ...n, _handled: 'declined' } : n
      ));
    } catch (e) {
      console.error('Error declining request:', e);
    } finally {
      setIsProcessing(false);
    }
  };


  return (
    <div className="min-h-screen bg-white dark:bg-black pb-[100px] max-w-md mx-auto relative font-sans overflow-hidden transition-colors">
      {/* Premium Header Container */}
      <div className="sticky top-0 z-40 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-zinc-100/50 dark:border-zinc-800/50">
        <div className="flex items-center justify-between px-6 pt-10 pb-5">
          <div className="flex flex-col gap-0.5">
            <h1 className="text-3xl font-extrabold tracking-tighter text-zinc-900 dark:text-white">Activity</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-black dark:text-[#E5FF66] bg-[#E5FF66] dark:bg-zinc-800 px-2 py-0.5 rounded-md inline-block shadow-sm">
                {notifications.filter(n => !n.is_read).length} New
              </span>
            </div>
          </div>
          <div className="flex gap-3">
             <button 
               onClick={handleMarkAllRead}
               className="w-11 h-11 flex items-center justify-center rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 active:scale-95 transition-all hover:bg-zinc-100 dark:hover:bg-zinc-800"
               title="Mark all as read"
             >
               <Check size={20} strokeWidth={3} />
             </button>
             <button className="w-11 h-11 flex items-center justify-center rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 active:scale-95 transition-all hover:bg-zinc-100 dark:hover:bg-zinc-800">
               <MoreVertical size={20} />
             </button>
          </div>
        </div>
      </div>

      <main className="px-5 py-6 flex flex-col min-h-[70vh]">
        {isLoading ? (
          <NotificationSkeleton />
        ) : notifications.length > 0 ? (
          <div className="w-full space-y-2 relative">
            <AnimatePresence mode="popLayout" initial={false}>
              {notifications.map((notif: any, i) => (
                <motion.div
                  key={notif.id}
                  layout
                  initial={{ opacity: 0, y: 15, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 400, 
                    damping: 30, 
                    delay: Math.min(i * 0.03, 0.4) 
                  }}
                >
                  <NotificationItem 
                    notif={notif}
                    onAccept={handleAccept}
                    onDecline={handleDecline}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-1 flex-col items-center justify-center text-center max-w-[280px] mx-auto mt-20"
          >
            <div className="w-24 h-24 bg-zinc-50 dark:bg-zinc-900 shadow-xl rounded-[38px] flex items-center justify-center mb-8 border border-zinc-100 dark:border-zinc-800 relative group transition-all hover:rotate-6">
              <Bell className="w-10 h-10 text-zinc-300 dark:text-zinc-700 group-hover:text-black dark:group-hover:text-[#E5FF66] transition-colors" />
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#E5FF66] rounded-full border-[4px] border-white dark:border-zinc-950 shadow-sm animate-pulse"></div>
            </div>
            <h3 className="text-xl font-extrabold tracking-tight text-zinc-900 dark:text-white mb-2">Pure Quietness</h3>
            <p className="text-[14px] font-medium leading-relaxed text-zinc-500 dark:text-zinc-400">
              When your profile starts buzzing with activity, we'll notify you here!
            </p>
          </motion.div>
        )}
      </main>

      <BottomNavigation />
    </div>
  );
}

function NotificationItem({ notif, onAccept, onDecline }: { notif: any, onAccept: (id: string) => void, onDecline: (id: string) => void }) {
  const { type, sender, content, created_at, is_read, _handled } = notif;
  const username = type === 'welcome' ? 'Univas Team' : (sender?.username || 'Someone');
  const avatar = type === 'welcome' ? '/logo.png' : sender?.avatar_url;
  const time = formatDistanceToNow(new Date(created_at), { addSuffix: true });
  const isUnread = !is_read;

  // Type Icons mapping
  const getTypeConfig = () => {
    switch(type) {
      case 'like': return { icon: <Heart size={10} fill="currentColor" />, color: 'bg-rose-500' };
      case 'comment': return { icon: <MessageCircle size={10} fill="currentColor" />, color: 'bg-sky-500' };
      case 'repost': return { icon: <Repeat2 size={10} strokeWidth={3} />, color: 'bg-emerald-500' };
      case 'connect_request': return { icon: <UserPlus size={10} />, color: 'bg-zinc-900 dark:bg-[#E5FF66] dark:text-black' };
      case 'connect_accepted': return { icon: <Check size={10} strokeWidth={3} />, color: 'bg-green-500' };
      default: return { icon: <Bell size={10} fill="currentColor" />, color: 'bg-[#E5FF66]' };
    }
  };

  const config = getTypeConfig();

  return (
    <div className={`flex items-center gap-4 px-4 py-4.5 rounded-[28px] transition-all duration-500 group relative border shadow-sm backdrop-blur-md ${
      isUnread 
        ? 'bg-zinc-50/80 dark:bg-zinc-900/40 border-zinc-100 dark:border-[#E5FF66]/20' 
        : 'bg-white/50 dark:bg-zinc-950/30 border-zinc-50/50 dark:border-zinc-900/30 opacity-80 hover:opacity-100 hover:bg-zinc-50/80 dark:hover:bg-zinc-900/40'
    }`}>
      {/* Glow effect for unread */}
      {isUnread && (
        <div className="absolute inset-0 bg-gradient-to-r from-[#E5FF66]/5 via-transparent to-transparent rounded-[28px] pointer-events-none" />
      )}
      {/* Avatar with Floating Type Icon */}
      <Link href={sender?.id ? `/profile/${sender.id}` : '#'} className="relative shrink-0 block active:scale-90 transition-transform">
        <div className="h-13 w-13 rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center p-[2px] ring-4 ring-transparent group-hover:ring-[#E5FF66]/20 transition-all duration-500">
          <div className="w-full h-full rounded-2xl overflow-hidden bg-white dark:bg-zinc-950 border border-zinc-100/50 dark:border-zinc-800/50 shadow-inner">
            {avatar ? (
              <Image src={avatar} alt={username} width={52} height={52} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-zinc-50 dark:bg-zinc-900">
                 <User size={24} className="text-zinc-300 dark:text-zinc-700" />
              </div>
            )}
          </div>
        </div>
        <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-white border-[2.5px] border-white dark:border-zinc-950 shadow-lg transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 z-10 ${config.color}`}>
           <div className="scale-90">{config.icon}</div>
        </div>
      </Link>

      {/* Text Content Area */}
      <div className="flex-1 min-w-0 pr-1 z-10">
        <p className="text-[13.5px] leading-snug text-zinc-500 dark:text-zinc-400 font-medium tracking-tight">
          <Link href={sender?.id ? `/profile/${sender.id}` : '#'} className="font-bold text-zinc-950 dark:text-white hover:text-black dark:hover:text-[#E2FF3D] transition-colors">{username}</Link>
          {" "}
          {content.includes("commented:") ? (
            <>
              commented: <span className="text-zinc-900 dark:text-zinc-200 font-bold block mt-1.5 line-clamp-2 italic text-[12px] border-l-2 border-[#E5FF66] pl-3 py-1 bg-zinc-50/50 dark:bg-zinc-900/50 rounded-r-xl shadow-inner-sm">"{content.split("commented: ")[1].replace(/^"/, '').replace(/"$/, '')}"</span>
            </>
          ) : content}
        </p>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-[10px] font-black text-zinc-300 dark:text-zinc-600 uppercase tracking-widest">
            {time}
          </span>
          {isUnread && (
             <span className="w-1.5 h-1.5 rounded-full bg-[#E5FF66] shadow-[0_0_8px_rgba(229,255,102,0.8)]"></span>
          )}
        </div>
      </div>

      {/* Action Area */}
      <div className="shrink-0 flex items-center">
        {type === "connect_request" && !_handled ? (
          <div className="flex gap-2">
            <button 
              onClick={() => onAccept(sender?.id)} 
              className="px-5 py-2.5 bg-zinc-900 dark:bg-[#E5FF66] text-[#E5FF66] dark:text-black rounded-xl text-xs font-black transition-all active:scale-95 hover:bg-black dark:hover:bg-white shadow-lg"
            >
              Accept
            </button>
            <button 
              onClick={() => onDecline(sender?.id)} 
              className="w-10 h-10 flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500 rounded-xl transition-all active:scale-95 border border-zinc-100 dark:border-zinc-800"
            >
              <ArrowLeft size={16} className="rotate-90" />
            </button>
          </div>
        ) : type === "connect_request" && _handled ? (
          <div className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border ${
            _handled === 'accepted' ? "bg-green-50 dark:bg-green-500/10 border-green-100 dark:border-green-500/20 text-green-600 dark:text-green-400" : "bg-zinc-50 dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 text-zinc-400"
          }`}>
             {_handled === 'accepted' && <Check size={12} strokeWidth={4} />}
             <span className="text-[10px] font-black uppercase tracking-wider">
               {_handled === 'accepted' ? 'Added' : 'Declined'}
             </span>
          </div>
        ) : (
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <MoreVertical size={18} className="text-zinc-400 dark:text-zinc-600 cursor-pointer" />
          </div>
        )}
      </div>
    </div>
  );
}
