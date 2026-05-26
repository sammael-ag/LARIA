const CACHE_NAME = 'laria-v2-crystal'; // Zmenila som verziu na v2, nech si systém všimne zmenu
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
let currentLang = 'sk'; // Neviditeľný jazykový port pre Service Worker

// Inštalácia - učeň si ukladá náradie do debny (cache)
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Laria Crystal: Balím nové náradie do cache...');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  // Okamžitá aktivácia nového SW
  self.skipWaiting();
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
  // Prevzatie kontroly nad všetkými oknami
  self.clients.claim();
});

// Fetch - HLAVNÝ ENGINE S PROXY DNA
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // PROXY ČASŤ: Ak ide o požiadavku na nášho Native Helpera (Gophera)
  if (url.pathname.startsWith('/api/native')) {
    event.respondWith(
      fetch('http://localhost:8080/')
        .then(response => {
          console.log('Laria Proxy: Gopher odpovedá, dzigáme dáta!');
          return response;
        })
        .catch(err => {
          console.error('Laria Proxy: Gopher je asi v diere...', err);
          return new Response(JSON.stringify({ error: 'Native Helper nedostupný' }), {
            headers: { 'Content-Type': 'application/json' }
          });
        })
    );
    return; // Ukončíme fetch, aby to nepokračovalo do cache
  }

  // KLASICKÁ ČASŤ: Najprv cache, ak niet, tak sieť
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

// JAZYKOVÝ PORT: Načúvanie správam z hlavnej aplikácie
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SET_LANGUAGE') {
    currentLang = event.data.lang;
    console.log(`🌲 SW DIALKOVÝ PORT: Jazyk na pozadí úspešne prepnutý na: [${currentLang}]`);
  }
});