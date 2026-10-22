const CACHE='vitrines-pro-v20261022191319';
const ASSETS=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  e.respondWith(caches.open(CACHE).then(cache=>cache.match(e.request,{ignoreSearch:true}).then(cached=>{
    const net=fetch(e.request).then(res=>{if(res&&res.status===200)cache.put(e.request,res.clone());return res}).catch(()=>cached||cache.match('./index.html'));
    return cached||net;})));
});
