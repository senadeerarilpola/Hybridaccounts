// Service Worker for SupiriAccounts PWA
const CACHE_NAME = 'supiriaccounts-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './src/css/style.css',
  './src/js/app.js',
  './src/js/db.js',
  './src/js/router.js',
  './src/utils/barcode-scanner.js',
  './src/utils/helpers.js',
  './src/utils/data-manager.js',
  './src/utils/business-analytics.js',
  './src/views/register.js',
  './src/views/profile.js',
  './src/views/new-customer.js',
  './src/views/new-item.js',
  './src/views/item-detail.js',
  './src/views/new-sale.js',
  './src/views/sale-detail.js',
  './src/views/settings.js',
  './src/views/business-analytics.js',
  './src/components/customers.js',
  './src/components/items.js',
  './src/components/sales.js',
  './src/components/reports.js',
  './src/models/sale.js',
  // Add other important files to cache
  'https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.2.1/css/all.min.css',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/js/bootstrap.bundle.min.js',
  'https://cdn.jsdelivr.net/npm/idb@7/build/iife/index-min.js',
  'https://cdn.jsdelivr.net/npm/chart.js'
];

// Install event - cache assets
self.addEventListener('install', event => {
  // Skip waiting to ensure the newest service worker activates immediately
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Caching app shell and assets');
        return cache.addAll(ASSETS);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(cacheName => {
          return cacheName !== CACHE_NAME;
        }).map(cacheName => {
          return caches.delete(cacheName);
        })
      );
    })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached response if found
        if (response) {
          return response;
        }

        // Clone the request because it's a one-time use stream
        const fetchRequest = event.request.clone();

        // Fall back to network
        return fetch(fetchRequest).then(response => {
          // Check if valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response as it's a one-time use stream
          const responseToCache = response.clone();

          // Add to cache for next time
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });

          // Return the response
          return response;
        });
      })
  );
});
