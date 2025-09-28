// ======= PWA offline service worker (cache-first) =======
const CACHE_VERSION = 'v1.0.0';
const CACHE_NAME = `ma-ruksak-${CACHE_VERSION}`;

// 1) Precache "osnovu" aplikacije (dodaj svoje fajlove ovdje!)
const PRECACHE_ASSETS = [
  '/',                       // ako serviraš kao root
  '/digitalniruksak.html',   // tvoja stranica
  '/images/mountain-adventures.svg',
  // Ako koristiš svoje ikone:
  '/images/mountain-adventures-192.png',
  '/images/mountain-adventures-512.png',
  // Ako imaš izdvojene CSS/JS fajlove, navedi ih ovdje:
  // '/style.css',
  // '/season.css',
  // '/tools/camera-auto-enhance.html',
];

// 2) Koje ekstenzije tretiramo kao "statiku" (cache-first)
const STATIC_EXT = /\.(?:html|css|js|mjs|json|png|svg|jpg|jpeg|gif|webp|ico|woff2?)$/i;

// 3) GPX – mreža-prva, uz fallback iz cachea (da dobiješ najnoviji trag, ali radi i offline)
const GPX_EXT = /\.gpx(?:$|\?)/i;

// 4) Cross-origin (npr. Google Fonts) – stale-while-revalidate
const CROSS_ORIGIN_SWRE = /^(https?:)?\/\/(fonts\.gstatic\.com|fonts\.googleapis\.com)\//i;

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_ASSETS))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    // počisti stare cacheve
    const keys = await caches.keys();
    await Promise.all(keys.map(k => (k !== CACHE_NAME ? caches.delete(k) : Promise.resolve())));
    await self.clients.claim();
  })());
});

// ----- Strategije odgovora -----
// - statika (same-origin, html/css/js/img): CACHE-FIRST
// - .gpx: NETWORK-FIRST -> fallback iz cachea
// - fonts.google*: STALE-WHILE-REVALIDATE
// - ostalo: default network -> fallback iz cachea indexa ako je HTML navigacija (offline stranica)

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;

  // samo GET smisleno keširamo
  if (req.method !== 'GET') return;

  // 1) GPX – network-first (svjež trag), fallback cache
  if (GPX_EXT.test(url.pathname)) {
    event.respondWith(networkFirst(req));
    return;
  }

  // 2) Cross-origin fonts – stale-while-revalidate
  if (CROSS_ORIGIN_SWRE.test(req.url)) {
    event.respondWith(staleWhileRevalidate(req));
    return;
  }

  // 3) Statika (same-origin html/css/js/img/json...) – cache-first
  if (sameOrigin && STATIC_EXT.test(url.pathname)) {
    event.respondWith(cacheFirst(req));
    return;
  }

  // 4) Navigacije (SPA/stranica) – network -> fallback index iz cachea
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).catch(async () => {
        const cache = await caches.open(CACHE_NAME);
        // fallback na precacheanu stranicu
        return cache.match('/digitalniruksak.html');
      })
    );
    return;
  }

  // 5) default – pokušaj mreže, pa cache fallback
  event.respondWith(
    fetch(req).catch(async () => {
      const cache = await caches.open(CACHE_NAME);
      const match = await cache.match(req, { ignoreSearch: true });
      return match || Response.error();
    })
  );
});

// ---- Strategije helperi ----
async function cacheFirst(req) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(req, { ignoreSearch: true });
  if (cached) return cached;
  const resp = await fetch(req);
  // opaques (cross-origin bez CORS) će se spremiti, ali je ok za statiku
  cache.put(req, resp.clone());
  return resp;
}

async function networkFirst(req) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const resp = await fetch(req, { cache: 'no-store' });
    cache.put(req, resp.clone());
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
    cache.put(req, resp.clone());
    return resp;
  }).catch(() => null);
  return cached || networkPromise || fetch(req);
}
