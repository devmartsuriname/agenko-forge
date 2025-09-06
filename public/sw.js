// Enhanced service worker with smart caching
const CACHE_VERSION = 'v3';
const CACHE_PREFIX = 'devmart-';
const STATIC_CACHE = CACHE_PREFIX + 'static-' + CACHE_VERSION;
const DYNAMIC_CACHE = CACHE_PREFIX + 'dynamic-' + CACHE_VERSION;
const API_CACHE = CACHE_PREFIX + 'api-' + CACHE_VERSION;

let cacheConfig = {
  version: '3.0.0',
  staticAssets: [],
  dynamicRoutes: [],
  apiEndpoints: [],
  maxAge: {
    static: 24 * 60 * 60 * 1000, // 24 hours
    dynamic: 60 * 60 * 1000, // 1 hour
    api: 10 * 60 * 1000 // 10 minutes
  }
};

// Install event - cache critical resources
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      const criticalAssets = [
        '/',
        '/offline.html',
        '/manifest.json',
        '/assets/logo.png',
        '/assets/hero-image.jpg'
      ];
      return cache.addAll(criticalAssets);
    })
  );
  self.skipWaiting();
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter(name => name.startsWith(CACHE_PREFIX) && 
                         name !== STATIC_CACHE && 
                         name !== DYNAMIC_CACHE && 
                         name !== API_CACHE)
          .map(name => {
            console.log('Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - smart caching strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip external requests
  if (!request.url.startsWith(self.location.origin)) {
    return;
  }

  // Handle different request types
  if (isStaticAsset(url)) {
    event.respondWith(handleStaticAsset(request));
  } else if (isApiRequest(url)) {
    event.respondWith(handleApiRequest(request));
  } else if (isDynamicRoute(url)) {
    event.respondWith(handleDynamicRoute(request));
  }
});

// Message event - handle cache updates
self.addEventListener('message', (event) => {
  const { type, config, pattern, resources } = event.data;
  
  switch (type) {
    case 'INIT_CACHE_CONFIG':
    case 'UPDATE_CACHE_CONFIG':
      cacheConfig = { ...cacheConfig, ...config };
      console.log('Cache config updated:', cacheConfig);
      break;
      
    case 'INVALIDATE_CACHE':
      invalidateMatchingCache(pattern);
      break;
      
    case 'PRELOAD_RESOURCES':
      preloadResources(resources);
      break;
  }
});

// Helper functions
function isStaticAsset(url) {
  return url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2|ttf|ico)$/);
}

function isApiRequest(url) {
  return url.pathname.startsWith('/api/') || 
         url.hostname.includes('supabase.co') ||
         cacheConfig.apiEndpoints.some(endpoint => url.pathname.includes(endpoint));
}

function isDynamicRoute(url) {
  return !isStaticAsset(url) && !isApiRequest(url);
}

async function handleStaticAsset(request) {
  try {
    const cache = await caches.open(STATIC_CACHE);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse && !isExpired(cachedResponse, cacheConfig.maxAge.static)) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    return cachedResponse || new Response('Asset not available offline', { status: 503 });
  }
}

async function handleApiRequest(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(API_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    const cache = await caches.open(API_CACHE);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse && !isExpired(cachedResponse, cacheConfig.maxAge.api)) {
      return cachedResponse;
    }
    
    return new Response(JSON.stringify({ error: 'API not available offline' }), { 
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function handleDynamicRoute(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    const cache = await caches.open(DYNAMIC_CACHE);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page for navigation requests
    if (request.destination === 'document') {
      const offlinePage = await caches.match('/offline.html');
      return offlinePage || caches.match('/');
    }
    
    return new Response('Resource not available offline', { status: 503 });
  }
}

function isExpired(response, maxAge) {
  const dateHeader = response.headers.get('date');
  if (!dateHeader) return false;
  
  const responseDate = new Date(dateHeader);
  return Date.now() - responseDate.getTime() > maxAge;
}

async function invalidateMatchingCache(pattern) {
  const cacheNames = await caches.keys();
  const regex = new RegExp(pattern);
  
  for (const cacheName of cacheNames) {
    if (cacheName.startsWith(CACHE_PREFIX)) {
      const cache = await caches.open(cacheName);
      const requests = await cache.keys();
      
      for (const request of requests) {
        if (regex.test(request.url)) {
          await cache.delete(request);
        }
      }
    }
  }
  
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({ type: 'CACHE_UPDATED', data: { pattern } });
    });
  });
}

async function preloadResources(resources) {
  try {
    const cache = await caches.open(STATIC_CACHE);
    await cache.addAll(resources);
    
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({ type: 'PRELOAD_COMPLETE', data: { count: resources.length } });
      });
    });
  } catch (error) {
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({ type: 'CACHE_ERROR', data: { error: error.message } });
      });
    });
  }
}

console.log('Enhanced Service Worker v3 loaded');