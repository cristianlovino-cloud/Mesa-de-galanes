// v4 — network first para todo, sin cache del HTML
const CACHE = 'mesa-galanes-v8';

self.addEventListener('message', function(e) {
  if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('install', function(e) {
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.map(function(k) { return caches.delete(k); }));
    })
  );
  self.clients.claim();
});

// SIEMPRE red primero — nunca servir HTML del cache
self.addEventListener('fetch', function(e) {
  if (e.request.url.includes('firebase') ||
      e.request.url.includes('googleapis') ||
      e.request.url.includes('gstatic') ||
      e.request.url.includes('fonts')) {
    return; // dejar pasar sin interceptar
  }
  // Todo lo demás: network first, sin fallback a cache para HTML
  e.respondWith(
    fetch(e.request).catch(function() {
      return caches.match(e.request);
    })
  );
});
