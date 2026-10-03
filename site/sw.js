// Blocry Pool service worker.
// The cache version placeholder below is replaced at deploy time with a content hash so every deploy
// rotates the cache name and old caches are dropped on activate.
const CACHE = 'blocry-pool-__CACHE_VERSION__';
// Shell revision, bumped when app files change so a hand deploy also rotates the worker: 2 (add to calendar).
const DATA_URL = 'data/schedule.json';

// App shell precached at install. Paths are relative to the SW scope (/blocry-pool/).
const PRECACHE = [
  './',
  './index.html',
  './app.css',
  './app.js',
  './manifest.webmanifest',
  './offline.html',
  './icons/favicon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png',
  './' + DATA_URL,
];
const FONT_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com'];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => c.addAll(PRECACHE.map((u) => new Request(u, { cache: 'reload' }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('blocry-pool-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Network-first: try the network, store a copy, fall back to the cache.
async function networkFirst(req, cacheKey, fallbackUrl, markOffline) {
  const cache = await caches.open(CACHE);
  try {
    const res = await fetch(req);
    if (res && res.ok) cache.put(cacheKey, res.clone());
    return res;
  } catch (err) {
    const hit = await cache.match(cacheKey, { ignoreSearch: true });
    if (hit) {
      if (!markOffline) return hit;
      // Tell the page this copy came from the cache so it can show the offline banner.
      const headers = new Headers(hit.headers);
      headers.set('X-Blocry-Offline', '1');
      return new Response(await hit.blob(), { status: 200, statusText: 'OK', headers });
    }
    if (fallbackUrl) {
      const fb = await cache.match(fallbackUrl);
      if (fb) return fb;
    }
    throw err;
  }
}

// Stale-while-revalidate for static assets and Google Fonts.
async function staleWhileRevalidate(e) {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(e.request);
  const network = fetch(e.request).then((res) => {
    if (res && (res.ok || res.type === 'opaque')) cache.put(e.request, res.clone());
    return res;
  }).catch(() => cached);
  if (cached) { e.waitUntil(network.catch(() => {})); return cached; }
  return network;
}

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  if (req.mode === 'navigate') {
    e.respondWith(networkFirst(req, req, './offline.html', false).catch(() => caches.match('./index.html')));
    return;
  }
  if (url.origin === self.location.origin && url.pathname.endsWith('/' + DATA_URL)) {
    e.respondWith(networkFirst(req, new URL('./' + DATA_URL, self.registration.scope).href, null, true));
    return;
  }
  if (url.origin === self.location.origin || FONT_HOSTS.includes(url.hostname)) {
    e.respondWith(staleWhileRevalidate(e));
  }
});

self.addEventListener('message', (e) => { if (e.data === 'SKIP_WAITING') self.skipWaiting(); });
