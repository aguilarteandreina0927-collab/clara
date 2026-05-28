const CACHE='clara-v3';

self.addEventListener('install',e=>{
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
  if(e.request.method!=='GET')return;
  
  const url=new URL(e.request.url);
  
  // El HTML siempre se busca en la red primero
  if(url.pathname.endsWith('.html')||url.pathname.endsWith('/')){
    e.respondWith(
      fetch(e.request).catch(()=>caches.match(e.request))
    );
    return;
  }
  
  // Fonts y assets — caché primero
  if(url.hostname.includes('googleapis')||url.hostname.includes('gstatic')){
    e.respondWith(
      caches.match(e.request).then(cached=>{
        if(cached)return cached;
        return fetch(e.request).then(res=>{
          const copy=res.clone();
          caches.open(CACHE).then(c=>c.put(e.request,copy));
          return res;
        });
      })
    );
    return;
  }
});
