const CACHE_NAME = 'mindsparks-v4.15.1';
const STATIC_ASSETS = [
  './',
  './index.html',
  './meo.png',
  './assets/cat-knight.jpg',
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
  './lib/katex/fonts/KaTeX_Main-Regular.woff2',
  './lib/katex/fonts/KaTeX_Main-Bold.woff2',
  './lib/katex/fonts/KaTeX_Main-Italic.woff2',
  './lib/katex/fonts/KaTeX_Math-Italic.woff2',
  './lib/katex/fonts/KaTeX_Math-BoldItalic.woff2',
  './lib/katex/fonts/KaTeX_Size1-Regular.woff2',
  './lib/katex/fonts/KaTeX_Size2-Regular.woff2',
  './lib/katex/fonts/KaTeX_Size3-Regular.woff2',
  './lib/katex/fonts/KaTeX_Size4-Regular.woff2',
  './lib/katex/fonts/KaTeX_AMS-Regular.woff2',
  './js/perf-config.js',
  './js/worker.js',
  './js/db.js',
  './js/srs.js',
  './js/parser.js',
  './js/audio-config.js',
  './js/audio.js',
  './js/confetti.js',
  './js/lofi-music.js',
  './js/ascii-bg.js',
  './js/app.js',
  './data/sample-deck.json',
  './backgrounds/bg-pixel-meadow.webp',
  './backgrounds/bg-starry-garden.webp',
  './backgrounds/bg-lofi-purple.webp',
  './backgrounds/bg-cyberpunk-teal.webp',
  './backgrounds/bg-sunset.webp',
  './backgrounds/bg-alol.webp',
  './backgrounds/bg-2.webp',
  './backgrounds/bg-noir-mono.webp',
  './backgrounds/bg-white-orange.webp'
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

// Fetch: Network-First for core app shell/code (HTML/JS/CSS/JSON), Cache-First + waitUntil SWR for static media/fonts
self.addEventListener('fetch', (event) => {
  // Only handle GET requests and http/https schemes
  if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) {
    return;
  }

  let isSameOrigin = false;
  let pathname = '';
  try {
    const reqUrl = new URL(event.request.url);
    isSameOrigin = reqUrl.origin === self.location.origin;
    pathname = reqUrl.pathname;
  } catch (_) {}

  const isCoreCodeAsset = isSameOrigin && (
    event.request.mode === 'navigate' ||
    pathname === '/' ||
    pathname.endsWith('/') ||
    /\.(?:html|js|css|json)$/i.test(pathname)
  );

  if (isCoreCodeAsset) {
    event.respondWith(
      fetch(event.request.mode === 'navigate' ? event.request.url : event.request, { cache: 'no-cache' })
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const responseToCache = networkResponse.clone();
            event.waitUntil(
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache))
            );
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) return cachedResponse;
            if (event.request.headers.get('accept')?.includes('text/html')) {
              return caches.match('./index.html');
            }
          });
        })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Fetch update in background if online (stale-while-revalidate wrapped in waitUntil)
        event.waitUntil(
          fetch(event.request).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
              return caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse.clone()));
            }
          }).catch(() => {
            // Offline, ignore background fetch error
          })
        );
        return cachedResponse;
      }

      // Not in cache, fetch from network and cache
      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }
        const responseToCache = networkResponse.clone();
        event.waitUntil(
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache))
        );
        return networkResponse;
      }).catch(() => {
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
