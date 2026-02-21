// Service Worker for Progressive Web App

const CACHE_NAME = 'eshophub-v1';
const URLS_TO_CACHE = [
    '/',
    '/index.html',
    '/css/modern.css',
    '/js/firebase-config.js',
    '/js/auth.js',
    '/js/products.js',
    '/js/cart.js',
    '/js/wishlist.js',
    '/js/main.js',
    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
    'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css',
    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js',
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
    'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js',
    'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[v0] Service Worker: Caching app shell');
            return cache.addAll(URLS_TO_CACHE).catch((error) => {
                console.log('[v0] Cache addAll error:', error);
                // Continue even if some resources fail to cache
                return Promise.resolve();
            });
        })
    );
    self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[v0] Service Worker: Deleting old cache -', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') {
        return;
    }

    // Handle API calls differently
    if (event.request.url.includes('dummyjson.com') || event.request.url.includes('googleapis.com')) {
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    // Clone the response
                    const clonedResponse = response.clone();

                    // Cache successful API responses
                    if (response.status === 200) {
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(event.request, clonedResponse);
                        });
                    }

                    return response;
                })
                .catch(() => {
                    // Return cached version if network fails
                    return caches.match(event.request);
                })
        );
    } else {
        // For other requests, cache first, then network
        event.respondWith(
            caches.match(event.request).then((response) => {
                // Return cached response if available
                if (response) {
                    return response;
                }

                return fetch(event.request).then((response) => {
                    // Don't cache non-successful responses
                    if (!response || response.status !== 200 || response.type === 'error') {
                        return response;
                    }

                    // Clone the response
                    const clonedResponse = response.clone();

                    // Cache the response
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, clonedResponse);
                    });

                    return response;
                }).catch(() => {
                    // Return offline page if available
                    return caches.match('/index.html');
                });
            })
        );
    }
});

// Background sync for cart (when user is back online)
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-cart') {
        event.waitUntil(
            // Sync cart data when back online
            new Promise((resolve, reject) => {
                console.log('[v0] Service Worker: Syncing cart');
                // Cart is stored in localStorage and will sync when user opens the app
                resolve();
            })
        );
    }
});

console.log('[v0] Service Worker: Loaded');
