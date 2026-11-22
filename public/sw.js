const CACHE_NAME = 'anytool-master-offline-v1';

// Every single tool and asset across the entire website
const ALL_SITE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/css/theme.css',
  '/js/core.js',
  '/favicon-32x32.png',
  '/favicon-16x16.png',
  '/favicon.ico',
  '/apple-touch-icon.png',
  '/images/app-icon-192.png',
  '/images/app-icon-512.png',
  '/images/anytool-brand.jpg',
  '/images/anytool-banner.png',

  // Smart Remote Studio & Standalone
  '/remote.html',
  '/smart-remote.html',
  '/remote-manifest.json',
  '/api/remote-version.json',

  // PDF Suite
  '/pdf-tools.html',
  '/merge-pdf.html',
  '/split-pdf.html',
  '/compress-pdf.html',
  '/image-to-pdf.html',
  '/pdf-to-image.html',

  // Media & AI
  '/bg-remover.html',
  '/image-converter.html',
  '/image-tools.html',
  '/video-downloader.html',
  '/video-tools.html',

  // Developer & Coding
  '/dev-tools.html',
  '/developer-tools.html',
  '/python-runner.html',
  '/turtle-runner.html',
  '/cs-tools.html',
  '/text-tools.html',

  // Cyber Security & Networking
  '/cyber-tools.html',
  '/hash-generator.html',
  '/ip-tools.html',

  // Calculators & Converters
  '/calc-tools.html',
  '/binary-tools.html',
  '/hex-tools.html',
  '/number-converter.html',
  '/base64-tools.html',

  // QR & 2D/1D Barcode Suite
  '/qr-tools.html',
  '/qr-code.html',
  '/qr-code-generator.html',
  '/qr-generator.html',
  '/qr-scanner.html',
  '/barcode-tools.html',
  '/code-128.html',
  '/code-39.html',
  '/code-93.html',
  '/ean-13.html',
  '/upc-barcode.html',
  '/itf-barcode.html',
  '/codabar.html',
  '/databar.html',
  '/data-matrix.html',
  '/pdf417.html',
  '/aztec-code.html',
  '/msi-plessey.html',

  // Legal
  '/privacy.html',
  '/terms.html'
];

// Install Event: Pre-cache the entire website for 100% offline access
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[AnyTool Master SW] Pre-caching entire website for complete offline use');
      return Promise.all(
        ALL_SITE_ASSETS.map(url => {
          return cache.add(url).catch(err => {
            console.warn(`[AnyTool Master SW] Skipped pre-caching: ${url}`, err);
          });
        })
      );
    })
  );
  self.skipWaiting();
});

// Activate Event: Clear older caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            console.log('[AnyTool Master SW] Clearing legacy cache:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event: Cache First, fallback to Network, then Cache on the fly
self.addEventListener('fetch', event => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Skip API calls that require dynamic backend answers
  if (url.pathname.startsWith('/api/feedback') || url.pathname.startsWith('/api/auth/google')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse;
      }

      // Fetch from network and save into cache
      return fetch(event.request).then(networkResponse => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Fallback for navigation requests
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html') || caches.match('/remote.html');
        }
      });
    })
  );
});
