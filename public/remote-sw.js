const CACHE_NAME = 'smart-remote-app-v2';
const urlsToCache = [
  '/remote.html',
  '/remote-manifest.json',
  '/css/theme.css',
  '/favicon-32x32.png',
  '/apple-touch-icon.png',
  '/images/app-icon-192.png',
  '/images/app-icon-512.png',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap',
  'https://unpkg.com/lucide@latest'
];

// Install: Cache everything needed for complete offline operation
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[Remote SW] Caching app shell for complete offline use');
      return cache.addAll(urlsToCache).catch(err => {
        console.warn('[Remote SW] Partial caching fallback:', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate: Clear previous obsolete caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch: Serve from Cache first for 100% offline instant speed
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then(networkResponse => {
        // Cache external scripts & fonts dynamically on the fly
        if (event.request.method === 'GET' && networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Fallback to offline remote page
        return caches.match('/remote.html');
      });
    })
  );
});
