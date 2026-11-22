const CACHE_NAME = 'smart-remote-app-v3';
const localUrls = [
  '/remote.html',
  '/remote-manifest.json',
  '/css/theme.css',
  '/favicon-32x32.png',
  '/apple-touch-icon.png',
  '/images/app-icon-192.png',
  '/images/app-icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[Remote SW] Pre-caching local app shell');
      return cache.addAll(localUrls);
    })
  );
  self.skipWaiting();
});

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

self.addEventListener('fetch', event => {
  // Pass non-GET requests directly
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(res => {
        if (res && res.status === 200) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, clone);
          });
        }
        return res;
      }).catch(() => {
        return caches.match('/remote.html');
      });
    })
  );
});
