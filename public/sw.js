// SafeRoute AI Service Worker
const CACHE_NAME = 'saferoute-ai-v2';
const TILE_CACHE_NAME = 'saferoute-offline-tiles-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.svg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('Failed to precache static assets:', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME && key !== TILE_CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);

  // Skip local backend API requests
  if (url.pathname.startsWith('/api/')) {
    return;
  }

  // Handle Map Tiles and Mapbox GIS assets via dedicated offline tile cache
  const isMapAsset =
    url.hostname.includes('mapbox.com') ||
    url.hostname.includes('openstreetmap.org') ||
    url.hostname.includes('cartocdn.com') ||
    url.pathname.includes('/tiles/') ||
    url.pathname.endsWith('.pbf') ||
    url.pathname.includes('/fonts/v1/') ||
    url.pathname.includes('/styles/v1/');

  if (isMapAsset) {
    event.respondWith(
      caches.open(TILE_CACHE_NAME).then(async (tileCache) => {
        const cached = await tileCache.match(event.request);
        if (cached) {
          // Serve immediately from offline cache, update in background if online
          fetch(event.request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200) {
                tileCache.put(event.request, networkResponse.clone());
              }
            })
            .catch(() => {});
          return cached;
        }

        // Not in cache: fetch from network and cache successful response
        return fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              tileCache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(async () => {
            // Offline fallback: check any matching cached tile
            return (await tileCache.match(event.request)) || Response.error();
          });
      })
    );
    return;
  }

  // Network-first for hashed Vite assets so updates are never blocked by stale cache
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Stale-while-revalidate for navigation and static html/manifest
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return networkResponse;
        })
        .catch(() => {
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
          return cached;
        });

      return cached || fetchPromise;
    })
  );
});
