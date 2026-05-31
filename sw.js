const CACHE_NAME = 'm12ano-v2'; // <--- Incrementato a v2 per forzare il reset sui vecchi dispositivi
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
  // Ricordati di aggiungere qui eventuali file .js o .css se ne usi di esterni!
];

// Installa il Service Worker e salva in cache i file principali
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting()) // Forza l'attivazione immediata
  );
});

// Attiva e pulisci vecchie cache (es. elimina la v1)
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim()) // Prende subito il controllo delle pagine aperte
  );
});

// Strategia: Stale-While-Revalidate
// Mostra subito la cache, ma aggiorna in background se c'è rete
self.addEventListener('fetch', (e) => {
  // Gestisci solo le richieste standard (GET) per evitare problemi con analytics o API esterne
  if (e.request.method !== 'GET') return;

  e.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(e.request).then((cachedResponse) => {
        // Avvia la richiesta di rete in background
        const networkFetch = fetch(e.request).then((networkResponse) => {
          // Se la risposta è valida, aggiorna la cache con il nuovo file
          if (networkResponse && networkResponse.status === 200) {
            cache.put(e.request, networkResponse.clone());
          }
          return networkResponse;
        }).catch(() => {
          // Silenzia gli errori di rete se l'utente è offline
        });

        // Ritorna subito il file in cache se esiste, altrimenti aspetta la rete
        return cachedResponse || networkFetch;
      });
    })
  );
});