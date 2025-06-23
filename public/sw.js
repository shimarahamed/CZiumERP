const CACHE_NAME = 'czium-pos-cache-v1';

// On install, cache the app shell and other critical assets.
self.addEventListener('install', (event) => {
  // Since Next.js generates hashed assets, we won't pre-cache specific files.
  // The fetch handler below will cache assets dynamically as they are requested.
  console.log('Service Worker: Installing...');
  event.waitUntil(self.skipWaiting()); // Activate worker immediately
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  // Clean up old caches
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // Take control of all clients
  );
});

self.addEventListener('fetch', (event) => {
  // We only want to cache GET requests.
  if (event.request.method !== 'GET') {
    return;
  }
  
  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      // Try to get the response from the cache.
      const cachedResponse = await cache.match(event.request);
      
      // Await the network request, regardless of whether there's a cache hit.
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        // If the request is successful, clone it and cache it.
        if (networkResponse.ok) {
            cache.put(event.request, networkResponse.clone());
        }
        return networkResponse;
      }).catch(() => {
        // This will only be reached if the network request fails.
        // If there was no cached response, this will result in a network error.
      });

      // Return the cached response if it exists, otherwise wait for the network response.
      // This is a "stale-while-revalidate" strategy. Good for performance and offline.
      return cachedResponse || await fetchPromise;
    })
  );
});
