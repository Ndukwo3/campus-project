export interface PushPayload {
  recipientId: string;
  title?: string;
  body: string;
  url?: string;
  icon?: string;
  tag?: string;
}

/**
 * Fire-and-forget helper to trigger a Web Push notification to a user.
 */
export function sendPushNotification(payload: PushPayload) {
  if (typeof window === 'undefined') return;
  fetch('/api/push/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).catch(() => {
    // Ignore network errors for background push
  });
}

