const CACHE_NAME = "thai-translator-cache-v8.6";
self.addEventListener("install", e => self.skipWaiting());
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.map(k => k!==CACHE_NAME && caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener("fetch", e => {
  const req = e.request; const url = new URL(req.url);
  if (url.pathname.startsWith("/api/")) return;
  e.respondWith(
    fetch(req).then(r => { const c=r.clone(); caches.open(CACHE_NAME).then(cache => cache.put(req,c)); return r; })
      .catch(()=>caches.match(req))
  );
});
