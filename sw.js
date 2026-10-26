'use strict';
const PREFIX='bokuni-web-';
const CACHE=PREFIX+'cab5d9eac3c7';
const relative=['./','./index.html','./pwa.js','./manifest.webmanifest','./icons/icon192.png','./icons/icon512.png','./icons/apple180.png'];
const urls=relative.map(p=>new URL(p,self.registration.scope).href);
const indexURL=new URL('./index.html',self.registration.scope).href;
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(urls)));});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith(PREFIX)&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('message',event=>{if(event.data?.type==='SKIP_WAITING')self.skipWaiting();});
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET')return;
 const url=new URL(event.request.url);
 if(url.origin!==self.location.origin||!url.href.startsWith(self.registration.scope))return;
 if(event.request.mode==='navigate'){
  event.respondWith((async()=>{
   try { const response=await fetch(event.request); if(!response.ok)throw Error('unavailable');
     if((response.headers.get('content-type')||'').includes('text/html')){const cache=await caches.open(CACHE);await cache.put(indexURL,response.clone());}return response;
   } catch {const cached=await caches.match(indexURL);return cached||new Response('처음 한 번 인터넷에 연결해 앱을 열어 주세요.',{status:503,headers:{'Content-Type':'text/plain;charset=utf-8'}});}
  })());return;
 }
 if(urls.includes(url.href))event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request)));
});
