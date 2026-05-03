const CACHE = 'mesa-galanes-v6';
const ASSETS = ['./', './index.html'];

// Responder al mensaje SKIP_WAITING para activar inmediatamente
self.addEventListener('message', function(e) {
  if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(cache) {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE; })
            .map(function(k) { return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(e) {
  // Firebase, APIs externas: siempre red
  if (e.request.url.includes('firebase') ||
      e.request.url.includes('googleapis') ||
      e.request.url.includes('gstatic') ||
      e.request.url.includes('fonts')) {
    return;
  }
  // index.html: network first (siempre baja la versión más nueva)
  if (e.request.mode === 'navigate' ||
      e.request.url.endsWith('/') ||
      e.request.url.includes('index.html')) {
    e.respondWith(
      fetch(e.request).then(function(response) {
        var copy = response.clone();
        caches.open(CACHE).then(function(cache) { cache.put(e.request, copy); });
        return response;
      }).catch(function() {
        return caches.match(e.request);
      })
    );
    return;
  }
  // Resto: cache first
  e.respondWith(
    caches.match(e.request).then(function(cached) {
      return cached || fetch(e.request);
    })
  );
});
