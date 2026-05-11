const CACHE_NAME = 'laria-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.json',
  './favicon.png',
  './logo192.png',
  './logo512.png'
];

// Inštalácia - učeň si ukladá náradie do debny (cache)
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Laria: Balím náradie do cache...');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Aktivácia - vyčistenie starého náradia
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
});

// Fetch - učeň podáva náradie (najprv z cache, ak niet, ide na sieť)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});