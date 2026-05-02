const CACHE = 'mesa-galanes-v5';
const ASSETS = [
  './',
  './index.html'
];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(cache) {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE; })
            .map(function(k) { return caches.delete(k); })\
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(e) {
  // Firebase y APIs externas: siempre red
  if (e.request.url.includes('firebase') ||
      e.request.url.includes('googleapis') ||
      e.request.url.includes('gstatic') ||
      e.request.url.includes('fonts')) {
    return;
  }

  // index.html: siempre red primero, cache como fallback
  if (e.request.url.endsWith('/') ||
      e.request.url.includes('index.html')) {
    e.respondWith(
      fetch(e.request)
        .then(function(response) {
          // Guardar la versión nueva en cache
          var copy = response.clone();
          caches.open(CACHE).then(function(cache) {
            cache.put(e.request, copy);
          });
          return response;
        })
        .catch(function() {
          // Sin red: usar cache
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
