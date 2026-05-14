const CACHE='mesa-galanes-v12';
self.addEventListener('message',function(e){if(e.data&&e.data.type==='SKIP_WAITING')self.skipWaiting();});
self.addEventListener('install',function(){self.skipWaiting();});
self.addEventListener('activate',function(e){e.waitUntil(caches.keys().then(function(k){return Promise.all(k.map(function(c){return caches.delete(c);}));}));self.clients.claim();});
self.addEventListener('fetch',function(e){if(/firebase|googleapis|gstatic|fonts/.test(e.request.url))return;e.respondWith(fetch(e.request,{cache:'no-store'}).catch(function(){return caches.match(e.request);}));});
