import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendPushNotification } from '@/lib/webpush';

// This route is called by Vercel Cron (see vercel.json)
// Vercel passes a secret header to prevent unauthorized calls
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Initialize inside handler so it only runs at request time, not build time
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    // Find users who have a push subscription AND haven't been seen in 24+ hours
    const { data: inactiveUsers, error } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, push_subscription')
      .not('push_subscription', 'is', null)
      .lt('last_seen', twentyFourHoursAgo);

    if (error) {
      console.error('[Re-engage Cron] Query failed:', error.message);
      return NextResponse.json({ error: 'DB query failed' }, { status: 500 });
    }

    if (!inactiveUsers || inactiveUsers.length === 0) {
      return NextResponse.json({ sent: 0, message: 'No inactive users found' });
    }

    const reEngageMessages = [
      "🔥 Trending on Univas — see what's happening on campus!",
      "📣 Your campus is buzzing. Check the latest on Univas!",
      "🎓 Miss anything today? Trending posts are waiting for you.",
      "✨ Your peers are posting. Come see what's on the Univas feed!",
    ];

    let sentCount = 0;
    const staleIds: string[] = [];

    for (const user of inactiveUsers) {
      const body = reEngageMessages[Math.floor(Math.random() * reEngageMessages.length)];

      const success = await sendPushNotification(user.push_subscription, {
        title: '👋 Hey, we miss you!',
        body,
        icon: '/icon-192x192.png',
        url: '/',
      });

      if (success) {
        sentCount++;
      } else {
        staleIds.push(user.id);
      }
    }

    // Clean up stale subscriptions in batch
    if (staleIds.length > 0) {
      await supabaseAdmin
        .from('profiles')
        .update({ push_subscription: null })
        .in('id', staleIds);
    }

    return NextResponse.json({ sent: sentCount, staleCleared: staleIds.length });
  } catch (err: any) {
    console.error('[Re-engage Cron] Error:', err.message);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
