/**
 * pwa/sw.js
 * 
 * Progressive Web App Service Worker for BabyTracker.
 * Caches core application assets for instant 0ms offline launch.
 */

const CACHE_NAME = 'babytracker-v1787371940306';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './api.js',
  './AdaptiveEngine.js',
  './manifest.webmanifest',
  './icons/icon.svg',
  'https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Precaching app shell...');
      return cache.addAll(ASSETS_TO_CACHE).catch(err => {
        console.warn('[ServiceWorker] Precache failed for some assets:', err);
      });
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[ServiceWorker] Removing old cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Never cache POST API calls (they are handled by outbox queue in api.js)
  if (event.request.method !== 'GET') {
    return;
  }

  // Network-first strategy with Cache fallback
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          if (event.request.mode === 'navigate') {
            return caches.match('./index.html');
          }
        });
      })
  );
});
