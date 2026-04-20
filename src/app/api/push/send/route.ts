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
    const { userId, title, body, url } = await req.json();

    if (!userId || !title || !body) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    // Fetch the user's stored push subscription
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('push_subscription')
      .eq('id', userId)
      .single();

    if (error || !profile?.push_subscription) {
      // User has no push subscription — silently skip
      return NextResponse.json({ skipped: true });
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
