// ======= PWA offline service worker (cache-first) =======
const CACHE_VERSION = 'v1.1.0';
const CACHE_NAME = `ma-ruksak-${CACHE_VERSION}`;
const OFFLINE_FALLBACK = '/digitalniruksak.html';

// 1) Precache "osnovu" aplikacije (DOPUNI svojim fajlovima!)
const PRECACHE_ASSETS = [
  '/',                       // root (ako serviraš kao /)
  OFFLINE_FALLBACK,          // glavna stranica
  '/manifest.webmanifest',
  '/images/mountain-adventures.svg',
  // Ako koristiš svoje ikone:
  '/images/mountain-adventures-192.png',
  '/images/mountain-adventures-512.png',
  // Ako imaš izdvojene CSS/JS/alat stranice, navedi ih ovdje, npr.:
  // '/style.css',
  // '/season.css',
  // '/tools/camera-auto-enhance.html',
  // '/gpx/moja-ruta.gpx',   // GPX lokalno → bit će dostupan i offline
];

// 2) Ekstenzije koje tretiramo kao statiku (cache-first)
const STATIC_EXT = /\.(?:html|css|js|mjs|json|png|svg|jpg|jpeg|gif|webp|ico|woff2?|webmanifest)$/i;

// 3) GPX – mreža-prva, uz fallback iz cachea (svjež trag, ali radi i offline)
const GPX_EXT = /\.gpx(?:$|\?)/i;

// 4) Cross-origin (npr. Google Fonts) – stale-while-revalidate
const CROSS_ORIGIN_SWRE = /^(https?:)?\/\/(fonts\.gstatic\.com|fonts\.googleapis\.com)\//i;

// ------- Install / Activate -------
self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    // Koristi Request(..., {cache:'reload'}) da preskoči stari HTTP cache i uzme svježe
    await cache.addAll(PRECACHE_ASSETS.map(u => new Request(u, { cache: 'reload' })));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    // počisti stare cacheve
    const keys = await caches.keys();
    await Promise.all(keys.map(k => (k !== CACHE_NAME ? caches.delete(k) : Promise.resolve())));
    await self.clients.claim();
  })());
});

// Omogući ručni "skip waiting" iz appa (po želji)
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});

// ------- Fetch strategije -------
// - statika (same-origin, html/css/js/img/...): CACHE-FIRST
// - .gpx: NETWORK-FIRST -> fallback cache
// - fonts.google*: STALE-WHILE-REVALIDATE
// - HTML navigacije: NETWORK → fallback na OFFLINE_FALLBACK iz cachea
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

  // 3) Statika (same-origin html/css/js/img/json/...): cache-first
  if (sameOrigin && (STATIC_EXT.test(url.pathname) || url.pathname === '/')) {
    event.respondWith(cacheFirst(req));
    return;
  }

  // 4) HTML navigacije (SPA/MPA) – detektiraj Accept: text/html
  if (isHtmlNavigation(req)) {
    event.respondWith(
      fetch(req).catch(async () => {
        const cache = await caches.open(CACHE_NAME);
        return (await cache.match(OFFLINE_FALLBACK)) || new Response('Offline', { status: 503 });
      })
    );
    return;
  }

  // 5) Default – mreža, pa cache fallback (ako imamo)
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
  if (resp && (resp.ok || resp.type === 'opaqueredirect' || resp.type === 'opaque')) {
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
  // Navigacija ili običan GET s HTML prihvatom
  if (req.mode === 'navigate') return true;
  const accept = req.headers.get('accept') || '';
  return accept.includes('text/html');
}
