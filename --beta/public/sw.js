const CACHE_NAME = 'laria-v2-crystal'; // Verzia v2 pre oživenie CrystalCore
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.json',
  './favicon.png',
  './logo192.png',
  './logo512.png'
  // Sem neskôr prihodíš ďalšie súbory pre offline "telo" appky
];
let aktualnyJazyk = 'sk'; // 🇸🇰 Zjednotený jazykový port pre Service Worker (vždy "jazyk")

// Inštalácia - učňovská debna na náradie (cache)
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('🌲 Laria Crystal: Balím nové náradie do cache...');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Aktivácia - vyčistenie starého náradia, nech to ligoce
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch - HLAVNÝ ENGINE PRE OFFLINE BEH
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // TAURI / NATIVE BRIDGE: Ak voláme lokálne API alebo Tauri prostredie
  // Tauri interné volania (tauri://) alebo IPC mosty Service Worker nesmie blokovať
  if (url.protocol === 'tauri:' || url.pathname.startsWith('/api/native')) {
    // V Tauri prostredí necháme požiadavku prejsť priamo do natívneho jadra
    return; 
  }

  // POISTKA: Ignorujeme iné ako štandardné webové požiadavky (napr. rozšírenia prehliadača)
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return;
  }

  // KLASICKÁ ČASŤ: Najprv blesková cache, ak nie sme offline, tak ťaháme sieť
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response; // Našli sme v cache, bleskovo vraciame
      }

      return fetch(event.request).catch(err => {
        console.log('🌲 Laria Core: Sme úplne offline, dzigáme čisté dáta z cache!');
        
        // POISTKA PRE NAVIGÁCIU: Ak používateľ prepína podstránky offline, vrátime hlavné vnútro appky
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});

// 🔄 JAZYKOVÝ PORT: Načúvanie správam z hlavnej aplikácie
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SET_LANGUAGE') {
    // FIX: Teraz bezpečne čítame uzákonený kľúč "jazyk"
    aktualnyJazyk = event.data.jazyk || 'sk';
    console.log(`🌲 SW DIALKOVÝ PORT: Jazyk na pozadí úspešne prepnutý na: [${aktualnyJazyk}]`);
  }
});