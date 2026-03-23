"use client";

import { ArrowLeft, MoreVertical, Heart, MessageCircle, UserPlus, Bell, User } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import BottomNavigation from "@/components/BottomNavigation";
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
        const unreadIds = data.filter(n => !n.is_read).map(n => n.id);
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
    <div className="min-h-screen bg-[#F8F9FA] pb-[100px] max-w-md mx-auto relative font-sans">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-[#F8F9FA]/80 backdrop-blur-md px-6 py-6 flex items-center justify-between">
        <Link href="/" className="w-12 h-12 flex items-center justify-center rounded-[20px] bg-white shadow-sm hover:bg-zinc-50 transition active:scale-95">
          <ArrowLeft size={20} className="text-zinc-800" />
        </Link>
        <h1 className="text-xl font-extrabold tracking-tight text-zinc-900">Notifications</h1>
        <button className="w-12 h-12 flex items-center justify-center rounded-[20px] bg-white shadow-sm hover:bg-zinc-50 transition active:scale-95">
          <MoreVertical size={20} className="text-zinc-800" />
        </button>
      </div>

      <main className="px-6 py-4 flex flex-col min-h-[60vh]">
        {isLoading ? (
          <div className="flex flex-1 items-center justify-center w-full min-h-[200px]">
            <div className="w-6 h-6 border-2 border-[#E5FF66] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : notifications.length > 0 ? (
          <div className="w-full space-y-2 relative">
             {notifications.map((notif: any) => (
               <NotificationItem 
                 key={notif.id}
                 notif={notif}
                 onAccept={handleAccept}
                 onDecline={handleDecline}
               />
             ))}
          </div>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center text-center max-w-[280px] mx-auto mt-20">
            <div className="w-20 h-20 bg-white shadow-sm rounded-full flex items-center justify-center mb-6 border-4 border-zinc-50">
              <Bell className="w-8 h-8 text-zinc-300" />
            </div>
            <h3 className="text-[17px] font-black tracking-tight text-zinc-900 mb-2">You're all caught up!</h3>
            <p className="text-[14px] font-medium leading-relaxed text-zinc-500">
              We'll let you know when someone interacts with you or your posts.
            </p>
          </div>
        )}
      </main>

      <BottomNavigation />
    </div>
  );
}

function NotificationItem({ notif, onAccept, onDecline }: any) {
  const { type, sender, content, created_at, is_read, _handled } = notif;
  const username = type === 'welcome' ? 'Campus Team' : (sender?.username || 'Someone');
  const avatar = type === 'welcome' ? '/logo.png' : sender?.avatar_url;
  const time = formatDistanceToNow(new Date(created_at), { addSuffix: true });
  const isUnread = !is_read;

  return (
    <div className={`flex items-center gap-3 px-3 py-4 hover:bg-zinc-50/50 transition-colors rounded-2xl group ${isUnread ? 'bg-zinc-50/80 shadow-sm' : ''}`}>
      {/* Avatar */}
      <Link href={sender?.id ? `/profile/${sender.id}` : '#'} className="relative shrink-0 block cursor-pointer active:scale-95 transition">
        <div className="h-12 w-12 rounded-full overflow-hidden bg-zinc-50 flex items-center justify-center border border-zinc-200/50">
          {avatar ? (
            <Image src={avatar} alt={username} width={48} height={48} className="h-full w-full object-cover" />
          ) : (
            <User size={22} className="text-zinc-400" />
          )}
        </div>
        {isUnread && (
          <div className="absolute top-0 right-0 w-3 h-3 bg-[#E5FF66] border-2 border-white rounded-full"></div>
        )}
      </Link>

      {/* Text Content */}
      <div className="flex-1 min-w-0 pr-1">
        <p className="text-[14px] leading-snug">
          <Link href={sender?.id ? `/profile/${sender.id}` : '#'} className="font-bold text-black hover:underline cursor-pointer">{username}</Link>{" "}
          <span className="text-zinc-500 font-medium">
            {content.includes("commented:") ? (
              <>
                commented: <span className="text-zinc-900 font-bold">{content.split("commented: ")[1]}</span>
              </>
            ) : content}{" "}
            {time}
          </span>
        </p>
      </div>

      {/* Action Area */}
      <div className="shrink-0 ml-1">
        {type === "connect_request" && !_handled ? (
          <div className="flex gap-2">
            <button 
              onClick={() => onAccept(sender?.id)} 
              className="px-4 py-2 bg-[#1A1A24] text-white rounded-[14px] text-xs font-bold transition-all active:scale-95 hover:bg-black shadow-sm"
            >
              Accept
            </button>
            <button 
              onClick={() => onDecline(sender?.id)} 
              className="px-4 py-2 bg-zinc-100 text-zinc-600 hover:bg-zinc-200 rounded-[14px] text-xs font-bold transition-all active:scale-95"
            >
              Hide
            </button>
          </div>
        ) : type === "connect_request" && _handled ? (
          <span className={`text-[11px] font-bold px-3 py-1.5 rounded-full ${
            _handled === 'accepted' ? "bg-green-50 text-green-600" : "bg-zinc-100 text-zinc-500"
          }`}>
             {_handled === 'accepted' ? 'Accepted' : 'Declined'}
          </span>
        ) : type === "connect_accepted" ? (
          <div className="w-10 h-10 rounded-full bg-[#E5FF66]/20 flex items-center justify-center text-[#9db32e]">
             <UserPlus size={16} strokeWidth={2.5} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
