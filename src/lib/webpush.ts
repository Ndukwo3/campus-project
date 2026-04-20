import webpush from 'web-push';

webpush.setVapidDetails(
  process.env.VAPID_EMAIL!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  url?: string;
}

/**
 * Sends a push notification to a user's stored subscription.
 * @param subscription - The PushSubscription JSON stored in the profiles table.
 * @param payload - The notification content to send.
 */
export async function sendPushNotification(
  subscription: webpush.PushSubscription,
  payload: PushPayload
): Promise<boolean> {
  try {
    await webpush.sendNotification(subscription, JSON.stringify(payload));
    return true;
  } catch (err: any) {
    // A 410 Gone or 404 means the subscription is no longer valid
    if (err.statusCode === 410 || err.statusCode === 404) {
      return false; // Caller should delete the stale subscription
    }
    console.error('[WebPush] Send error:', err.message);
    return false;
  }
}

export default webpush;
