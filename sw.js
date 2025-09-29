// sw.js — root scope, “kao jučer”: offline radi Digitalni ruksak, ostalo ide preko mreže
const CACHE_VERSION = 'ruksak-1.0.6';
const STATIC_CACHE = `static-${CACHE_VERSION}`;

// Offline dokument i asseti (root putanje)
const OFFLINE_URL = '/digitalniruksak.html';
const PRECACHE_URLS = [
  OFFLINE_URL,
  '/manifest.webmanifest',
  '/images/mountain-adventures.svg',
  '/images/mountain-adventures-192.png',
  '/tools/camera-auto-enhance.html'
];

// INSTALL: precache samo ruksak + njegovi asseti
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(STATIC_CACHE).then((c) => c.addAll(PRECACHE_URLS)));
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

// FETCH
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;

  // 1) Navigacije: network-first, ali offline fallback je baš digitalniruksak.html
  if (req.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const net = await fetch(req, { cache: 'no-store' });
        // Cache-aj ruksak ako se baš on traži
        if (sameOrigin && url.pathname === new URL(OFFLINE_URL, self.location.origin).pathname && net.ok) {
          const copy = net.clone();
          const cache = await caches.open(STATIC_CACHE);
          await cache.put(OFFLINE_URL, copy);
        }
        return net;
      } catch {
        // Ako nema mreže: vrati digitalniruksak.html iz cachea
        const cached = await caches.match(OFFLINE_URL, { ignoreSearch: true });
        if (cached) return cached;
        // nužni fallback
        return new Response('Offline: ruksak nije u cache-u.', { status: 503 });
      }
    })());
    return;
  }

  // 2) Statički asseti ruksaka (iz precache liste): cache-first
  if (sameOrigin) {
    const isPrecached = PRECACHE_URLS.some((u) => url.href === new URL(u, self.location.origin).href);
    if (isPrecached) {
      event.respondWith((async () => {
        const hit = await caches.match(req, { ignoreSearch: true });
        if (hit) return hit;
        try {
          const net = await fetch(req);
          if (net.ok) (await caches.open(STATIC_CACHE)).put(req, net.clone());
          return net;
        } catch {
          return new Response('Offline asset.', { status: 503 });
        }
      })());
      return;
    }
  }

  // 3) Vanjski GPX: network-first, bez keširanja; offline -> 503
  const accept = req.headers.get('Accept')?.toLowerCase() || '';
  const isGpxLike = req.url.toLowerCase().endsWith('.gpx') || accept.includes('application/gpx+xml');
  if (!sameOrigin && isGpxLike) {
    event.respondWith((async () => {
      try { return await fetch(req, { mode: 'cors' }); }
      catch { return new Response('GPX nedostupan offline.', { status: 503 }); }
    })());
    return;
  }

  // 4) Sve ostalo: pass-through (ne diramo)
});
