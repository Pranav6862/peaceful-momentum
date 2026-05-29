// public/sw.js
const CACHE = 'petals-v1';

const PRECACHE = [
  '/',
  '/index.html',
  '/favicon.svg',
  '/apple-touch-icon.png',
  '/web-app-manifest-192x192.png',
  '/web-app-manifest-512x512.png',
  '/site.webmanifest',
];

// Install — cache core files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE))
  );
  self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch — network first, cache fallback
// Network first means users always get
// fresh code when online
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Update cache with fresh response
        const copy = response.clone();
        caches.open(CACHE).then((cache) => {
          cache.put(event.request, copy);
        });
        return response;
      })
      .catch(() => {
        // Offline fallback — serve from cache
        return caches.match(event.request);
      })
  );
});