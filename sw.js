const CACHE='fenix-driver-v2-7';
const ASSETS=['./','./index.html','./styles.css','./app.js','./manifest.webmanifest','./icon-192.png','./icon-512.png',
'./src/finance.js','./src/journey.js','./src/vehicle.js','./src/objective.js','./src/history.js','./src/radar.js','./src/predictive.js','./src/platforms.js','./src/decision.js','./src/journey-intelligence.js','./src/opportunity-radar.js','./src/intelligence-2.js','./src/external-context.js','./src/fenix-score.js','./src/action.js','./src/autopilot.js','./src/copilot.js'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{if(event.request.method!=='GET')return;event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request).then(response=>{const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy));return response}).catch(()=>caches.match('./index.html'))));});
