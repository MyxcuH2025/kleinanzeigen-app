const CACHE_NAME = 'tüka-v3-no-cache'; // Cache-Version ändern um alten Cache zu löschen
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/images/logo.webp'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  // SERVICE WORKER KOMPLETT DEAKTIVIERT - KEINE CACHE-INTERVENTION
  // Alle Requests gehen direkt an das Netzwerk
  return;
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Push notification handling
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'Neue Nachricht verfügbar',
    icon: '/images/logo.webp',
    badge: '/images/logo.webp',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Öffnen',
        icon: '/images/logo.webp'
      },
      {
        action: 'close',
        title: 'Schließen',
        icon: '/images/logo.webp'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('tüka', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});
