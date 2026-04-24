const CACHE_NAME = 'butce-v5';
const ASSETS = [
  '/butce/',
  '/butce/index.html',
  '/butce/manifest.json'
];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = e.request.url;

  // Firebase, auth, dış API isteklerini cache'leme — direkt geçir
  if (
    url.includes('firebase') ||
    url.includes('firestore') ||
    url.includes('googleapis') ||
    url.includes('gstatic') ||
    url.includes('identitytoolkit') ||
    url.includes('securetoken') ||
    url.includes('yahoo') ||
    url.includes('coingecko') ||
    url.includes('allorigins') ||
    url.includes('corsproxy') ||
    url.includes('open.er-api')
  ) {
    return; // service worker müdahale etme
  }

  // HTML dosyalarını her zaman network'ten al
  if (e.request.mode === 'navigate' || url.endsWith('.html')) {
    e.respondWith(
      fetch(e.request).catch(() => caches.match(e.request))
    );
    return;
  }

  // Diğer statik dosyalar cache'den
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
