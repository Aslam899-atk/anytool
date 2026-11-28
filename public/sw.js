const CACHE_NAME = 'anytool-master-offline-v2';

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
  '/rto-test.html',

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
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  // 1) HTML പേജുകൾക്ക് (/, /rto-test.html മുതലായവ) എപ്പോഴും പുതിയത് സെർവറിൽ നിന്ന് എടുക്കുക (Network-First)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).then(networkResponse => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // ഇന്റർനെറ്റ് ഇല്ലാത്തപ്പോൾ മാത്രം കാഷിൽ നിന്ന് എടുക്കുക
        return caches.match(event.request).then(res => res || caches.match('/'));
      })
    );
    return;
  }

  // 2) CSS, JS, ഇമേജുകൾക്ക് വേഗത്തിനായി Cache-First
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) return cachedResponse;

      return fetch(event.request).then(networkResponse => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      });
    })
  );
});
