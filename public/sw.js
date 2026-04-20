const CACHE_NAME = 'campus-v2';
const STATIC_ASSETS = [
    '/',
    '/icon-192x192.png',
    '/icon-512x512.png',
    '/manifest.json'
];

// Install: Cache static assets immediately
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(STATIC_ASSETS);
        })
    );
    self.skipWaiting();
});

// Activate: Clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
            );
        })
    );
    self.clients.claim();
});

// Fetch: Stale-While-Revalidate strategy
self.addEventListener('fetch', (event) => {
    // Only handle GET requests
    if (event.request.method !== 'GET') return;

    // Skip Supabase API calls (let them be live)
    if (event.request.url.includes('supabase.co')) return;

    event.respondWith(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.match(event.request).then((cachedResponse) => {
                const fetchedResponse = fetch(event.request).then((networkResponse) => {
                    // Cache the new response for next time
                    if (networkResponse.status === 200) {
                        cache.put(event.request, networkResponse.clone());
                    }
                    return networkResponse;
                }).catch(() => {
                    // Silently fail if network is down
                });

                // Return cached version immediately (stale), or wait for network (if first time)
                return cachedResponse || fetchedResponse;
            });
        })
    );
});

// ─── Push Notifications ───────────────────────────────────────────────────────

// Fired when the server sends a push message to the browser
self.addEventListener('push', (event) => {
    let payload = { title: 'Univas', body: 'You have a new notification', url: '/', icon: '/icon-192x192.png' };

    try {
        if (event.data) {
            payload = { ...payload, ...JSON.parse(event.data.text()) };
        }
    } catch (e) {
        // Fallback to default payload
    }

    const options = {
        body: payload.body,
        icon: payload.icon || '/icon-192x192.png',
        badge: '/icon-192x192.png',
        vibrate: [100, 50, 100],
        data: { url: payload.url || '/' },
        actions: [
            { action: 'open', title: 'Open App' },
            { action: 'dismiss', title: 'Dismiss' }
        ]
    };

    event.waitUntil(
        self.registration.showNotification(payload.title, options)
    );
});

// Fired when the user clicks the notification
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.action === 'dismiss') return;

    const targetUrl = event.notification.data?.url || '/';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            // If the app is already open, navigate to the target URL
            for (const client of windowClients) {
                if (client.url.includes(self.location.origin) && 'focus' in client) {
                    client.navigate(targetUrl);
                    return client.focus();
                }
            }
            // Otherwise, open a new window
            if (clients.openWindow) {
                return clients.openWindow(targetUrl);
            }
        })
    );
});
