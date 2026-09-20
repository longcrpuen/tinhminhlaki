const CACHE_NAME = 'mindsparks-v4.10.0';
const STATIC_ASSETS = [
  './',
  './index.html',
  './meo.png',
  './quotes.js',
  './js/quotes.js',
  './manifest.json',
  './css/theme.css',
  './css/fonts.css',
  './css/style.css',
  './lib/fonts/vt323.ttf',
  './lib/fonts/caveat.ttf',
  './lib/fonts/pixelify-sans-bold.ttf',
  './lib/katex/katex.min.css',
  './lib/katex/katex.min.js',
  './lib/katex/auto-render.min.js',
  './js/db.js',
  './js/srs.js',
  './js/parser.js',
  './js/audio-config.js',
  './js/audio.js',
  './js/confetti.js',
  './js/app.js',
  './data/sample-deck.json',
  './backgrounds/bg-pixel-meadow.webp',
  './backgrounds/bg-starry-garden.webp',
  './backgrounds/bg-lofi-purple.webp',
  './backgrounds/bg-cyberpunk-teal.webp',
  './backgrounds/bg-sunset.webp',
  './backgrounds/bg-alol.webp',
  './backgrounds/bg-2.webp'
];

// Install: Cache all static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate: Delete old caches & take immediate control
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Cache-First strategy with network fallback
self.addEventListener('fetch', (event) => {
  // Only handle GET requests and http/https schemes
  if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Fetch update in background if online (stale-while-revalidate for local assets)
        fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse.clone());
            });
          }
        }).catch(() => {
          // Offline, ignore background fetch error
        });
        return cachedResponse;
      }

      // Not in cache, fetch from network and cache
      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return networkResponse;
      }).catch(() => {
        // If navigating to an HTML page while offline, return index.html
        if (event.request.headers.get('accept')?.includes('text/html')) {
          return caches.match('./index.html');
        }
      });
    })
  );
});

// Allow app to trigger skipWaiting
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
