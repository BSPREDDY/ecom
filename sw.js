// Service Worker for ShopEase
const CACHE_NAME = 'shopease-v1.0.0';
const urlsToCache = [
    '/',
    '/index.html',
    '/products.html',
    '/product-details.html',
    '/categories.html',
    '/cart.html',
    '/wishlist.html',
    '/login.html',
    '/checkout.html',
    '/order-success.html',
    '/css/main.css',
    '/css/components.css',
    '/css/responsive.css',
    '/js/app.js',
    '/js/api.js',
    '/js/search.js',
    '/js/auth.js',
    '/manifest.json'
];

// Install event
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

// Activate event
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Fetch event
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Cache hit - return response
                if (response) {
                    return response;
                }

                // Clone the request
                const fetchRequest = event.request.clone();

                return fetch(fetchRequest).then(
                    response => {
                        // Check if we received a valid response
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // Clone the response
                        const responseToCache = response.clone();

                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    }
                ).catch(() => {
                    // If both cache and network fail, show offline page
                    if (event.request.headers.get('accept').includes('text/html')) {
                        return caches.match('/offline.html');
                    }
                });
            })
    );
});

// Background sync for offline orders
self.addEventListener('sync', event => {
    if (event.tag === 'sync-orders') {
        event.waitUntil(syncOrders());
    }
});

async function syncOrders() {
    // Get pending orders from IndexedDB
    const pendingOrders = await getPendingOrders();

    for (const order of pendingOrders) {
        try {
            await fetch('/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(order)
            });

            // Remove from pending orders on success
            await removePendingOrder(order.id);
        } catch (error) {
            console.error('Failed to sync order:', error);
        }
    }
}

// Push notifications
self.addEventListener('push', event => {
    const options = {
        body: event.data.text(),
        icon: '/images/icon-192.png',
        badge: '/images/badge-72.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'Explore',
                icon: '/images/checkmark.png'
            },
            {
                action: 'close',
                title: 'Close',
                icon: '/images/xmark.png'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification('ShopEase', options)
    );
});

// Notification click event
self.addEventListener('notificationclick', event => {
    console.log('Notification click received.');
    event.notification.close();

    event.waitUntil(
        clients.openWindow('/')
    );
});