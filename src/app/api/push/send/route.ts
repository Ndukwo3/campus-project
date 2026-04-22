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
    const { userId, title, body, url, type } = await req.json();

    if (!userId || !title || !body) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    // Fetch the user's stored push subscription and settings
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('push_subscription, notification_settings')
      .eq('id', userId)
      .single();

    if (error || !profile?.push_subscription) {
      // User has no push subscription — silently skip
      return NextResponse.json({ skipped: true });
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
