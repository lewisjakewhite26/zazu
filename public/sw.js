/**
 * Zazu service worker — offline shell + static assets.
 * Network-first for Supabase; cache-first for same-origin static files.
 */

const CACHE_NAME = 'zazu-v1';
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/favicon.svg',
  '/manifest.webmanifest',
  '/icons/icon-192.svg',
  '/icons/icon-512.svg',
  '/lib/adaptive-theme.js',
  '/lib/morning-task.js',
  '/lib/progress-web.js',
  '/lib/alarms-web.js',
  '/lib/settings-web.js',
  '/lib/calendar-web.js',
  '/lib/web-screens.js',
  '/lib/words-api.js',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)).then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))),
    ).then(() => self.clients.claim()),
  );
});

function isSupabaseRequest(url) {
  return url.hostname.includes('supabase.co');
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  if (isSupabaseRequest(url)) {
    event.respondWith(fetch(request).catch(() => caches.match(request)));
    return;
  }

  if (url.origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      const networkFetch = fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => cached);

      return cached || networkFetch;
    }),
  );
});
