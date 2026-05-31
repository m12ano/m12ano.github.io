const CACHE_NAME = 'purpl3l3an-cache-v2'; // <--- Incrementa questo (v1, v2, v3...) ad ogni update
const ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  // tutti gli altri tuoi asset...
];

// Installazione - Salva la nuova cache
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// Attivazione - Elimina le vecchie cache obsolete
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('Vecchia cache eliminata:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
});