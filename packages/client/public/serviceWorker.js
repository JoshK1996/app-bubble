// Service Worker for Construction Material Tracking System
const CACHE_NAME = 'construction-tracker-v1';

// Assets to cache for offline use
const CACHE_ASSETS = [
  '/',
  '/index.html',
  '/favicon.ico',
  '/manifest.json',
  '/static/js/main.chunk.js',
  '/static/js/bundle.js',
  '/static/js/vendors~main.chunk.js',
  '/static/css/main.chunk.css',
  '/assets/logo.png'
];

// API endpoints to always try to fetch fresh
const API_ENDPOINTS = [
  '/graphql'
];

// Install event - cache essential assets
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Install');
  
  // Skip waiting to activate immediately
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Caching app assets');
      return cache.addAll(CACHE_ASSETS);
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activate');
  
  // Claim clients immediately
  self.clients.claim();
  
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          console.log('[ServiceWorker] Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }
  
  // Handle API requests separately - network first, then cache
  if (isApiRequest(event.request)) {
    event.respondWith(
      fetchAndCache(event.request).catch(() => {
        return caches.match(event.request);
      })
    );
    return;
  }
  
  // For all other requests - cache first, then network
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return from cache if found
      if (response) {
        return response;
      }
      
      // Otherwise fetch from network and cache
      return fetchAndCache(event.request);
    })
  );
});

// Helper to determine if a request is for an API endpoint
function isApiRequest(request) {
  return API_ENDPOINTS.some(endpoint => 
    request.url.includes(endpoint)
  );
}

// Helper to fetch from network and update cache
function fetchAndCache(request) {
  return fetch(request)
    .then((response) => {
      // Only cache valid responses
      if (!response || response.status !== 200 || response.type !== 'basic') {
        return response;
      }
      
      // Clone the response - one to return, one to cache
      const responseToCache = response.clone();
      
      caches.open(CACHE_NAME)
        .then((cache) => {
          cache.put(request, responseToCache);
        });
      
      return response;
    });
}

// Listen for sync events to process offline operations
self.addEventListener('sync', (event) => {
  console.log('[ServiceWorker] Sync event', event.tag);
  
  if (event.tag === 'sync-pending-operations') {
    event.waitUntil(syncPendingOperations());
  }
});

// Process offline operations when back online
async function syncPendingOperations() {
  // This would ideally communicate with the syncManager.js
  // In a real implementation, we would access IndexedDB directly
  
  // For now, just broadcast a message to the app
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_TRIGGERED',
        message: 'Background sync triggered'
      });
    });
  });
}

// Listen for push notifications
self.addEventListener('push', (event) => {
  console.log('[ServiceWorker] Push received:', event);
  
  const data = event.data.json();
  
  const title = data.title || 'Construction Tracker';
  const options = {
    body: data.message || 'New notification',
    icon: '/assets/logo.png',
    badge: '/assets/badge.png',
    data: data.data || {}
  };
  
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[ServiceWorker] Notification click:', event.notification);
  
  event.notification.close();
  
  // Open the app and navigate to a specific page
  const urlToOpen = event.notification.data.url || '/';
  
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clientList) => {
      // If a window is already open, focus it
      for (const client of clientList) {
        if (client.url.includes(urlToOpen) && 'focus' in client) {
          return client.focus();
        }
      }
      
      // Otherwise open a new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen);
      }
    })
  );
}); 