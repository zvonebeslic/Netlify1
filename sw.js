// sw.js
// ---------------------------------------------
// PWA Service Worker za "Digitalni ruksak"
// - Cache-first za statiku (isti origin)
// - Network-first za navigacije (index.html fallback offline)
// - Network-first za vanjske GPX URL-ove (CORS), uz cache fallback
// - Čišćenje starih cacheva po verziji
// ---------------------------------------------

// Ako je site u podmapi, npr. https://domena.com/ruksak/,
// postavi BASE = '/ruksak/' i u index.html registriraj:
// navigator.serviceWorker.register('./sw.js', { scope: './' });
const BASE = '/';

const CACHE_VERSION = 'v1.1.4';
const STATIC_CACHE = `static-${CACHE_VERSION}`;

// Pomoćna za sastavljanje putanja
const p = (path) => (BASE.endsWith('/') ? BASE + path.replace(/^\//, '') : BASE + '/' + path.replace(/^\//, ''));

// Precache—mora pokriti početnu (i `/` i `index.html`), manifest i osnovne assete.
// Dodaj ovdje nove statičke datoteke (slike, dodatne stranice…) koje želiš offline.
const PRECACHE_URLS = [
  BASE,                 // npr. '/' ili '/ruksak/'
  p('index.html'),
  p('manifest.webmanifest'),
  p('images/mountain-adventures.svg'),
  p('images/mountain-adventures-192.png'),
  p('tools/camera-auto-enhance.html')
];

// Utility: treba li cache-ati ovu vrstu resursa?
function isStaticDestination(req) {
  const d = req.destination;
  return d === 'document' || d === 'script' || d === 'style' || d === 'image' || d === 'font';
}

/* INSTALL: precache */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

/* ACTIVATE: cleanup starih cacheva */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== STATIC_CACHE)
          .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

/* FETCH strategije */
self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Samo GET kontroliramo
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;

  // 0) Navigacije (SPA/MPA): network-first s fallbackom na cache-ani index.html
  // Ovo osigurava da app radi i offline kod osvježavanja / dubokih linkova.
  if (req.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const net = await fetch(req);
          // (Opcionalno) cache-ati svježi index
          const copy = net.clone();
          try {
            const cache = await caches.open(STATIC_CACHE);
            cache.put(p('index.html'), copy);
          } catch {}
          return net;
        } catch {
          // Offline fallback: pokušaj prvo precache-ani 'index.html', ako ne, onda BASE
          const cachedIndex = await caches.match(p('index.html'));
          if (cachedIndex) return cachedIndex;
          const cachedBase = await caches.match(BASE);
          return cachedBase || new Response('Offline: index nije u cache-u.', { status: 503 });
        }
      })()
    );
    return;
  }

  // 1) Isti origin – statika: cache-first + runtime cache
  if (sameOrigin && isStaticDestination(req)) {
    event.respondWith(
      caches.match(req).then((cached) => {
        if (cached) return cached;
        return fetch(req).then((res) => {
          // Cache-aj uspješne odgovore
          if (res.ok) {
            const copy = res.clone();
            caches.open(STATIC_CACHE).then((c) => c.put(req, copy));
          }
          return res;
        });
      })
    );
    return;
  }

  // 2) Vanjski GPX (CORS) – network-first s fallbackom na cache (ako je ikada spremljen)
  const isGpxLike =
    req.url.toLowerCase().endsWith('.gpx') ||
    req.headers.get('Accept')?.toLowerCase().includes('application/gpx+xml');

  if (!sameOrigin && isGpxLike) {
    event.respondWith(
      (async () => {
        try {
          const net = await fetch(req, { mode: 'cors' });
          // (Ne cache-amo namjerno GPX iz vana osim ako baš želiš — onda dodaš put u runtime cache)
          return net;
        } catch {
          const cached = await caches.match(req);
          return cached || new Response('GPX nedostupan offline.', { status: 503 });
        }
      })()
    );
    return;
  }

  // 3) Ostalo – pass-through (ili lako SWR ako želiš)
  // Primjer SWR (zakomentirano):
  // event.respondWith((async ()=>{
  //   const cache = await caches.open(STATIC_CACHE);
  //   const cached = await cache.match(req);
  //   const fetchPromise = fetch(req).then(res => {
  //     if (res.ok && isStaticDestination(req)) cache.put(req, res.clone());
  //     return res;
  //   }).catch(()=>null);
  //   return cached || fetchPromise || new Response('Offline.', { status: 503 });
  // })());
});
