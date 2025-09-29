// sw.js — offline samo za "Digitalni ruksak"
const BASE = '/'; // promijeni ako je u podmapi, npr. '/ruksak/'
const CACHE_VERSION = 'ruksak-1.0.0';
const STATIC_CACHE = `static-${CACHE_VERSION}`;

// put helper
const p = (path) =>
  BASE.endsWith('/') ? BASE + path.replace(/^\//, '') : BASE + '/' + path.replace(/^\//, '');

// Jedina offline stranica + njeni asseti:
const OFFLINE_URL = p('digitalniruksak.html');
const PRECACHE_URLS = [
  OFFLINE_URL,
  p('manifest.webmanifest'),
  p('images/mountain-adventures.svg'),
  p('images/mountain-adventures-192.png'),
  // Dodaj ovdje SAMO assete koje koristi digitalniruksak.html (ako su odvojeni fajlovi)
];

// INSTALL: precache samo ruksak
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

// ACTIVATE: očisti stare verzije
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== STATIC_CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// FETCH: offline samo za digitalniruksak.html; ostalo pass-through
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;

  // 1) Navigacije: reagiraj SAMO ako se traži baš digitalniruksak.html (ili start_url koji pokazuje na njega)
  if (req.mode === 'navigate') {
    const isRuksakNav =
      sameOrigin &&
      (url.pathname === new URL(OFFLINE_URL, self.location.origin).pathname);

    if (isRuksakNav) {
      event.respondWith(
        (async () => {
          try {
            const net = await fetch(req, { cache: 'no-store' });
            // Cacheaj svjež odgovor (isti URL)
            if (net.ok) {
              const copy = net.clone();
              const cache = await caches.open(STATIC_CACHE);
              await cache.put(OFFLINE_URL, copy);
            }
            return net;
          } catch {
            // Offline fallback: precache-ani ruksak
            const cached = await caches.match(OFFLINE_URL, { ignoreSearch: true });
            return (
              cached || new Response('Offline: ruksak nije u cache-u.', { status: 503 })
            );
          }
        })()
      );
      return;
    } else {
      // Za sve ostale stranice ne diramo ništa (ostavi mreži)
      return;
    }
  }

  // 2) Statički asseti ruksaka: posluži iz cachea ako su u precache listi
  if (sameOrigin) {
    const isPrecached = PRECACHE_URLS.some((u) => url.href === new URL(u, self.location.origin).href);
    if (isPrecached) {
      event.respondWith(
        (async () => {
          const cached = await caches.match(req, { ignoreSearch: true });
          if (cached) return cached;
          try {
            const net = await fetch(req);
            if (net.ok) {
              const copy = net.clone();
              const cache = await caches.open(STATIC_CACHE);
              await cache.put(req, copy);
            }
            return net;
          } catch {
            return new Response('Offline asset.', { status: 503 });
          }
        })()
      );
      return;
    }
  }

  // 3) Sve ostalo — pass-through (bez cachea)
  // (npr. vanjski GPX URL-ovi ostaju mreža; bez offline podrške)
});
