"use client";

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase';

/**
 * Requests push notification permission and registers the browser's
 * push subscription to the user's profile in Supabase.
 *
 * Should be called once from a global component like GlobalStateLoader.
 */
export function usePushNotifications(userId: string | null) {
  useEffect(() => {
    if (!userId) return;
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;

    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapidPublicKey) return;

    async function registerPush() {
      try {
        // Wait for service worker to be ready
        const registration = await navigator.serviceWorker.ready;

        // Check current permission — don't re-prompt if already denied
        if (Notification.permission === 'denied') return;

        // Check if already subscribed
        const existingSub = await registration.pushManager.getSubscription();
        if (existingSub) {
          // Already subscribed — ensure it's saved in DB (idempotent)
          await saveSubscription(existingSub, userId!);
          return;
        }

        // Request permission
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') return;

        // Subscribe to push
        const sub = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey!).buffer as ArrayBuffer,
        });

        await saveSubscription(sub, userId!);
      } catch (err) {
        // Silently ignore — push is a nice-to-have, not critical
        console.warn('[Push] Registration failed:', err);
      }
    }

    registerPush();
  }, [userId]);
}

async function saveSubscription(sub: PushSubscription, userId: string) {
  try {
    await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscription: sub.toJSON(), userId }),
    });
  } catch (err) {
    console.warn('[Push] Failed to save subscription to DB:', err);
  }
}

// Converts the VAPID public key from base64 to Uint8Array (required by PushManager)
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
