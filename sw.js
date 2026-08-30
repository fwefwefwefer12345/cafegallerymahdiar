// Cafe Mahdiar - Service Worker (Offline & PWA Cache)
const CACHE_NAME = 'mahdiar-pwa-v7';

const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './assets/css/style.css',
  './assets/fonts/fonts.css',
  './assets/fonts/Dxxo8j6PP2D_kU2muijlE8WWMmk.woff2',
  './assets/fonts/Dxxo8j6PP2D_kU2muijlGMWWMmk.woff2',
  './assets/fonts/Dxxo8j6PP2D_kU2muijlHcWW.woff2',
  './assets/fonts/zrfl0HLVx-HwTP82Yaf4Iw.woff2',
  './assets/fonts/zrfl0HLVx-HwTP82Yaj4IxL0.woff2',
  './assets/fonts/zrfl0HLVx-HwTP82YaL4IxL0.woff2',
  './assets/fonts/zrfl0HLVx-HwTP82Yan4IxL0.woff2',
  './assets/js/three.min.js',
  './assets/js/menu-data.js',
  './assets/js/app.js',
  './assets/js/visuals.js',
  './assets/images/favicon-circle.png',
  './assets/images/favicon.ico',
  './assets/images/pwa-192.png',
  './assets/images/pwa-512.png',
  './assets/images/pwa-maskable-512.png',
  './assets/images/apple-touch-icon.png',
  './assets/images/about.webp'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Only handle GET requests and http/https protocols
  if (request.method !== 'GET' || !request.url.startsWith('http')) {
    return;
  }

  // Navigation requests: Network First with offline fallback to index.html
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          }
          return response;
        })
        .catch(async () => {
          const cachedResponse = await caches.match(request);
          if (cachedResponse) return cachedResponse;
          return caches.match('./index.html');
        })
    );
    return;
  }

  // Static Assets & External Fonts/Libs: Stale-While-Revalidate
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          }
          return networkResponse;
        })
        .catch(() => {
          // Ignore network errors for background fetches
        });

      return cachedResponse || fetchPromise;
    })
  );
});
