// Randevum Service Worker
const CACHE_NAME = 'randevum-v1';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/styles.css',
    '/config.js',
    '/manifest.json',
    '/berber/',
    '/berber/index.html',
    '/fiyatlandirma/',
    '/fiyatlandirma/index.html',
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap'
];

// Install - Cache static assets
self.addEventListener('install', (event) => {
    console.log('[SW] Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[SW] Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => self.skipWaiting())
    );
});

// Activate - Clean old caches
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => {
                        console.log('[SW] Deleting old cache:', name);
                        return caches.delete(name);
                    })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch - Network first, fallback to cache
self.addEventListener('fetch', (event) => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') return;
    
    // Skip Firebase and external API requests
    if (event.request.url.includes('firestore.googleapis.com') ||
        event.request.url.includes('firebase') ||
        event.request.url.includes('emailjs')) {
        return;
    }
    
    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // Clone response for cache
                const responseClone = response.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseClone);
                });
                return response;
            })
            .catch(() => {
                // Network failed, try cache
                return caches.match(event.request).then((cachedResponse) => {
                    if (cachedResponse) {
                        return cachedResponse;
                    }
                    // If HTML request, return offline page
                    if (event.request.headers.get('accept').includes('text/html')) {
                        return caches.match('/');
                    }
                });
            })
    );
});

// Background Sync (for offline appointments - future)
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-appointments') {
        console.log('[SW] Syncing appointments...');
    }
});

// Push Notifications (future)
self.addEventListener('push', (event) => {
    if (event.data) {
        const data = event.data.json();
        const options = {
            body: data.body || 'Yeni bildirim',
            icon: '/icons/icon-192x192.png',
            badge: '/icons/icon-72x72.png',
            vibrate: [100, 50, 100],
            data: {
                url: data.url || '/'
            }
        };
        
        event.waitUntil(
            self.registration.showNotification(data.title || 'Randevum', options)
        );
    }
});

// Notification click
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        clients.openWindow(event.notification.data.url)
    );
});
