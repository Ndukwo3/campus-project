import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendPushNotification, PushPayload } from '@/lib/webpush';

export async function POST(req: NextRequest) {
  // Initialize inside handler so it only runs at request time, not build time
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    const bodyPayload = await req.json();
    
    let userId, title, body, url, type;

    // 1. Detect if this is a Supabase Webhook payload
    if (bodyPayload.record && bodyPayload.table === 'notifications') {
      const record = bodyPayload.record;
      userId = record.user_id;
      type = record.type;
      const rawContent = record.content || '';

      // Map Supabase notification types to user-friendly push titles
      if (type === 'like') {
        title = '❤️ Someone liked your post';
        body = 'Check out who liked your content!';
        url = '/';
      } else if (type === 'comment') {
        title = '💬 New comment';
        body = rawContent || 'Someone commented on your post';
        url = '/';
      } else if (type === 'repost') {
        title = '🔄 Post Reposted';
        body = rawContent || 'Someone reposted your content';
        url = '/';
      } else if (type === 'mention') {
        title = '🏷️ You were mentioned';
        body = rawContent || 'Someone mentioned you in a post/comment';
        url = '/';
      } else if (type === 'connect_request') {
        title = '🤝 New connection request';
        body = 'Someone wants to connect with you on Campus!';
        url = '/notifications';
      } else if (type === 'connect_accepted') {
        title = '✅ Connection accepted!';
        body = 'You are now connected with a new student.';
        url = '/notifications';
      } else if (type === 'message') {
        title = '✉️ New message';
        body = rawContent || 'You have a new message.';
        url = '/messages';
      } else {
        title = '🔔 New activity on Univas';
        body = rawContent || 'You have a new notification.';
        url = '/notifications';
      }
    } else {
      // 2. Otherwise assume direct payload from GlobalStateLoader
      userId = bodyPayload.userId;
      title = bodyPayload.title;
      body = bodyPayload.body;
      url = bodyPayload.url;
      type = bodyPayload.type;
    }

    if (!userId || !title || !body) {
      return NextResponse.json({ error: 'Missing fields', received: bodyPayload }, { status: 400 });
    }

    // Fetch the user's stored push subscription and settings
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('push_subscription, notification_settings')
      .eq('id', userId)
      .single();

    if (error || !profile?.push_subscription) {
      return NextResponse.json({ skipped: true, reason: 'no_subscription' });
    }

    // Check notification settings
    const settings = profile.notification_settings as any;
    if (settings) {
      // 1. Global push toggle check
      if (settings.push === false) {
        return NextResponse.json({ skipped: 'user_global_push_disabled' });
      }

      // 2. Specific type check
      if (type) {
        let isEnabled = true;
        if (type === 'message') isEnabled = settings.direct_messages !== false;
        else if (type === 'comment') isEnabled = settings.comments !== false;
        else if (type === 'mention') isEnabled = settings.mentions !== false;
        else if (type === 'like') isEnabled = settings.likes !== false;
        else if (type === 'connect_request' || type === 'connect_accepted') isEnabled = settings.group_activity !== false;
        else if (type === 'event') isEnabled = settings.events !== false;

        if (!isEnabled) {
          return NextResponse.json({ skipped: `user_${type}_push_disabled` });
        }
      }
    }

    const payload: PushPayload = {
      title,
      body,
      icon: '/icon-192x192.png',
      url: url || '/',
    };

    const success = await sendPushNotification(profile.push_subscription, payload);

    if (!success) {
      // Subscription is stale — clear it from the DB
      await supabaseAdmin
        .from('profiles')
        .update({ push_subscription: null })
        .eq('id', userId);
    }

    return NextResponse.json({ success });
  } catch (err: any) {
    console.error('[Push Send] Error:', err.message);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
