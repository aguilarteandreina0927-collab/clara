const CACHE='clara-v1';
const ASSETS=['/clara/','clara.html','index.html'];

self.addEventListener('install',e=>{
  e.waitUntil(
    caches.open(CACHE).then(c=>c.addAll(ASSETS).catch(()=>{}))
  );
  self.skipWaiting();
});

self.addEventListener('activate',e=>{
  e.waitUntil(
    caches.keys().then(keys=>Promise.all(
      keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch',e=>{
  // Solo cachear requests GET del mismo origen
  if(e.request.method!=='GET')return;
  if(!e.request.url.startsWith(self.location.origin))return;

  e.respondWith(
    caches.match(e.request).then(cached=>{
      // Intentar red primero, caer en caché si falla
      return fetch(e.request).then(res=>{
        if(res&&res.status===200){
          const copy=res.clone();
          caches.open(CACHE).then(c=>c.put(e.request,copy));
        }
        return res;
      }).catch(()=>cached);
    })
  );
});
