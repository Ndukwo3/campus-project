import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import webpush from 'web-push';

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

function initWebPush() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!publicKey || !privateKey) {
    return false;
  }
  webpush.setVapidDetails(
    'mailto:support@peerza.app',
    publicKey,
    privateKey
  );
  return true;
}

export async function POST(req: NextRequest) {
  try {
    if (!initWebPush()) {
      return NextResponse.json({ error: 'VAPID keys not configured' }, { status: 500 });
    }

    const { recipientId, title, body, url, icon, tag } = await req.json();

    if (!recipientId || !body) {
      return NextResponse.json(
        { error: 'Missing recipientId or body' },
        { status: 400 }
      );
    }

    const supabase = getAdminClient();
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('push_subscription, notification_settings')
      .eq('id', recipientId)
      .single();

    if (error || !profile?.push_subscription) {
      return NextResponse.json({ skipped: true, reason: 'No push subscription' });
    }

    const payload = JSON.stringify({
      title: title || 'Peerza',
      body,
      url: url || '/notifications',
      icon: icon || '/icon-192x192.png',
      tag: tag || 'peerza-notification',
    });

    try {
      await webpush.sendNotification(profile.push_subscription, payload);
      return NextResponse.json({ success: true });
    } catch (pushErr: any) {
      // If subscription is expired or invalid, clean it up
      if (pushErr.statusCode === 410 || pushErr.statusCode === 404) {
        await supabase
          .from('profiles')
          .update({ push_subscription: null })
          .eq('id', recipientId);
      }
      console.warn('[Push Send] Failed to deliver:', pushErr.statusCode || pushErr.message);
      return NextResponse.json({ skipped: true, reason: 'Delivery failed' });
    }
  } catch (err: any) {
    console.error('[Push Send] Error:', err);
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}
