const V = 'gt-v1'
const SHELL = ['/', '/index.html', '/manifest.webmanifest', '/icon-192.png', '/icon-512.png']
self.addEventListener('install', e => { e.waitUntil(caches.open(V).then(c => c.addAll(SHELL))); self.skipWaiting() })
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim()))
})
// La página envía la lista de archivos que cargó para guardarlos desde la primera visita.
self.addEventListener('message', e => {
  if (e.data && e.data.cache) e.waitUntil(caches.open(V).then(c => Promise.allSettled(e.data.cache.map(u => c.add(u)))))
})
self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url)
  if (r.method !== 'GET' || u.origin !== location.origin) return // Supabase y otros dominios no se interceptan
  if (r.mode === 'navigate') {
    e.respondWith(fetch(r).then(res => { const cp = res.clone(); caches.open(V).then(c => c.put('/index.html', cp)); return res }).catch(() => caches.match('/index.html')))
    return
  }
  e.respondWith(caches.match(r).then(hit => hit || fetch(r).then(res => { if (res.ok) { const cp = res.clone(); caches.open(V).then(c => c.put(r, cp)) } return res })))
})
