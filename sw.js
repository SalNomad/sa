const CACHE='manasik-compass-v3';
const ASSETS=[
  './','./index.html','./umrah.html','./hajj.html','./tracker.html','./places.html','./emergency.html','./accessibility.html','./sources.html','./404.html',
  './assets/css/styles.css','./assets/js/i18n.js','./assets/js/data.js','./assets/js/app.js','./assets/icons/favicon.svg','./assets/icons/social-card.svg','./manifest.webmanifest','./SOURCES.md'
];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  e.respondWith(caches.match(e.request).then(hit=>hit||fetch(e.request).then(res=>{
    if(res.ok&&new URL(e.request.url).origin===location.origin){const copy=res.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));}
    return res;
  }).catch(()=>e.request.mode==='navigate'?caches.match('./index.html'):undefined)));
});
