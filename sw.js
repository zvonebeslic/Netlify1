// ======= PWA offline service worker (cache-first + network-first za GPX) =======
const CACHE_VERSION = 'v1.1.2';
const CACHE_NAME = `ma-ruksak-${CACHE_VERSION}`;
const OFFLINE_FALLBACK = '/digitalniruksak.html';

// 1) Precache "osnovu" aplikacije (DOPUNI svojim fajlovima!)
const PRECACHE_ASSETS = [
  '/',                           // root (ako serviraš s korijena; po potrebi ukloni)
  OFFLINE_FALLBACK,              // glavna stranica (fallback za offline)
  '/manifest.webmanifest',
  '/images/mountain-adventures.svg',
  '/images/mountain-adventures-192.png',
  '/images/mountain-adventures-512.png',
  // Primjeri dodatne statike / alata (po potrebi odkomentiraj/dodaj):
  // '/style.css',
  // '/app.js',
  // '/tools/camera-auto-enhance.html',
  // '/gpx/moja-ruta.gpx'        // lokalni GPX → dostupan i offline
];

// 2) Ekstenzije koje tretiramo kao statiku (cache-first)
const STATIC_EXT = /\.(?:html|css|js|mjs|json|png|svg|jpg|jpeg|gif|webp|ico|woff2?|webmanifest)$/i;

// 3) GPX – mreža-prva, uz fallback iz cachea (svjež trag, ali radi i offline)
const GPX_EXT = /\.gpx(?:$|\?)/i;

// 4) Cross-origin (npr. Google Fonts) – stale-while-revalidate
const CROSS_ORIGIN_SWRE = /^(https?:)?\/\/(fonts\.gstatic\.com|fonts\.googleapis\.com)\//i;

// ------- Install -------
self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    // Preskoči HTTP cache i uzmi svježe artefakte
    await cache.addAll(PRECACHE_ASSETS.map(u => new Request(u, { cache: 'reload' })));
    await self.skipWaiting();
  })());
});

// ------- Activate -------
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    // očisti stare cacheve
    const keys = await caches.keys();
    await Promise.all(keys.map(k => (k !== CACHE_NAME ? caches.delete(k) : Promise.resolve())));

    // ✅ Navigation Preload (brži first paint na sporoj mreži)
    if ('navigationPreload' in self.registration) {
      try { await self.registration.navigationPreload.enable(); } catch {}
    }

    await self.clients.claim();
  })());
});

// Omogući ručni "skip waiting" iz appa (po želji)
self.addEventListener('message', (event) => {
  if (event?.data === 'SKIP_WAITING' || event?.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// ------- Fetch strategije -------
// - statika (same-origin): CACHE-FIRST
// - .gpx: NETWORK-FIRST -> fallback cache
// - fonts.google*: STALE-WHILE-REVALIDATE
// - HTML navigacije: pokušaj preloaded/NETWORK → fallback na OFFLINE_FALLBACK
// - default: NETWORK → fallback cache (ako postoji)

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;

  // keširanje ima smisla samo za GET
  if (req.method !== 'GET') return;

  // 1) GPX – network-first
  if (GPX_EXT.test(url.pathname)) {
    event.respondWith(networkFirst(req));
    return;
  }

  // 2) Cross-origin Google Fonts – SWR
  if (CROSS_ORIGIN_SWRE.test(req.url)) {
    event.respondWith(staleWhileRevalidate(req));
    return;
  }

  // 3) Statika (same-origin) – cache-first
  if (sameOrigin && (STATIC_EXT.test(url.pathname) || url.pathname === '/')) {
    event.respondWith(cacheFirst(req));
    return;
  }

  // 4) HTML navigacije
  if (isHtmlNavigation(req)) {
    event.respondWith((async () => {
      try {
        // iskoristi preloaded response ako postoji
        const preloaded = await event.preloadResponse;
        if (preloaded) return preloaded;

        return await fetch(req);
      } catch (_) {
        const cache = await caches.open(CACHE_NAME);
        return (await cache.match(OFFLINE_FALLBACK, { ignoreSearch: true }))
          || new Response('Offline', { status: 503 });
      }
    })());
    return;
  }

  // 5) Default – mreža → cache fallback (ako imamo)
  event.respondWith(
    fetch(req).catch(async () => {
      const cache = await caches.open(CACHE_NAME);
      const match = await cache.match(req, { ignoreSearch: true });
      return match || Response.error();
    })
  );
});

// ------- Helperi (strategije) -------
async function cacheFirst(req) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(req, { ignoreSearch: true });
  if (cached) return cached;

  const resp = await fetch(req);
  // Keširaj samo OK (200) ili opaque (CORS) odgovore
  if (resp && (resp.ok || resp.type === 'opaque' || resp.type === 'opaqueredirect')) {
    cache.put(req, resp.clone());
  }
  return resp;
}

async function networkFirst(req) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const resp = await fetch(req, { cache: 'no-store' });
    if (resp && (resp.ok || resp.type === 'opaque' || resp.type === 'opaqueredirect')) {
      cache.put(req, resp.clone());
    }
    return resp;
  } catch (e) {
    const cached = await cache.match(req, { ignoreSearch: true });
    if (cached) return cached;
    throw e;
  }
}

async function staleWhileRevalidate(req) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(req, { ignoreSearch: true });
  const networkPromise = fetch(req).then((resp) => {
    if (resp && (resp.ok || resp.type === 'opaque' || resp.type === 'opaqueredirect')) {
      cache.put(req, resp.clone());
    }
    return resp;
  }).catch(() => null);
  return cached || networkPromise || fetch(req);
}

function isHtmlNavigation(req) {
  if (req.mode === 'navigate') return true;
  const accept = req.headers.get('accept') || '';
  return accept.includes('text/html');
}
