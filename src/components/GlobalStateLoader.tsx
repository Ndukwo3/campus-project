"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase";
import { useNotificationStore } from "@/store/notificationStore";
import { usePresenceStore } from "@/store/presenceStore";
import { usePushNotifications } from "@/hooks/usePushNotifications";

export default function GlobalStateLoader() {
  const { setHasUnread } = useNotificationStore();
  const { setOnlineUsers } = usePresenceStore();
  const supabase = createClient();
  const channelRef = useRef<any>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Register push notifications for the logged-in user
  usePushNotifications(userId);

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setUserId(user.id);

      // 1. Initial Notification check
      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false);
      setHasUnread(!!count && count > 0);

      // 2. Setup Realtime Channel
      const channel = supabase.channel('global_state', {
        config: {
          presence: {
            key: user.id,
          },
        },
      });

      channel
        .on('postgres_changes', { 
          event: 'INSERT', schema: 'public', table: 'notifications', 
          filter: `user_id=eq.${user.id}` 
        }, async (payload: any) => {
          setHasUnread(true);

          // Fire a push notification to the user's device
          const type = payload.new?.type || '';
          const content = payload.new?.content || '';

          let title = '🔔 New Activity on Univas';
          let notifBody = content;
          let url = '/notifications';

          if (type === 'like') {
            title = '❤️ Someone liked your post';
            url = '/';
          } else if (type === 'comment') {
            title = '💬 New comment on your post';
            url = '/';
          } else if (type === 'connect_request') {
            title = '🤝 New connection request';
            url = '/notifications';
          } else if (type === 'connect_accepted') {
            title = '✅ Connection accepted!';
            url = '/notifications';
          } else if (type === 'message') {
            title = '✉️ New message';
            url = '/messages';
          }

          try {
            await fetch('/api/push/send', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId: user.id, title, body: notifBody || title, url }),
            });
          } catch (e) {
            // Silently fail — push is non-critical
          }
        })
        .on('postgres_changes', {
          event: 'UPDATE', schema: 'public', table: 'notifications',
          filter: `user_id=eq.${user.id}`
        }, async () => {
           const { count: newCount } = await supabase
             .from('notifications')
             .select('*', { count: 'exact', head: true })
             .eq('user_id', user.id)
             .eq('is_read', false);
           setHasUnread(!!newCount && newCount > 0);
        })
        .on('presence', { event: 'sync' }, () => {
          const newState = channel.presenceState();
          const onlineIds = new Set<string>();
          Object.keys(newState).forEach((key) => {
            onlineIds.add(key);
          });
          setOnlineUsers(onlineIds);
        })
        .subscribe(async (status: string) => {
          if (status === 'SUBSCRIBED') {
            await channel.track({
              online_at: new Date().toISOString(),
              user_id: user.id
            });
          }
        });

      channelRef.current = channel;
    }

    init();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [setHasUnread, setOnlineUsers, supabase]);

  return null;
}
