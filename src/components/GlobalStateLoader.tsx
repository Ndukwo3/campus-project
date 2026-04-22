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
          // Only local state update is needed here for the unread badge
          setHasUnread(true);
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
