const CACHE_NAME = 'hatanote-v18';
const FIREBASE_VERSION = '12.15.0';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './icon-512-maskable.png',
  `https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-app.js`,
  `https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-firestore.js`,
  `https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-auth.js`
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll(APP_SHELL.map((u) => new Request(u, { cache: 'reload' })))
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  // 画面本体（HTML）はネット優先：電波があれば常に最新版、3秒以内に届かなければ保存版を表示
  if (event.request.mode === 'navigate') {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_NAME);
      const cached = (await cache.match(event.request)) || (await cache.match('./index.html'));
      const network = fetch(event.request, { cache: 'no-store' }).then((res) => {
        if (res && res.status === 200) cache.put(event.request, res.clone());
        return res;
      });
      if (!cached) return network;
      const timeout = new Promise((resolve) => setTimeout(() => resolve(cached), 3000));
      return Promise.race([network.catch(() => cached), timeout]);
    })());
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const network = fetch(event.request)
        .then((response) => {
          const isSameOrigin = event.request.url.startsWith(self.location.origin);
          const isFirebaseSdk = event.request.url.startsWith('https://www.gstatic.com/firebasejs/');
          if (response && response.status === 200 && (isSameOrigin || isFirebaseSdk)) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
