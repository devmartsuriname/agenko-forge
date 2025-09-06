/**
 * Enhanced Service Worker Cache Management
 * Phase 3: Smart caching with content-aware invalidation
 */

export interface ServiceWorkerCacheConfig {
  version: string;
  staticAssets: string[];
  dynamicRoutes: string[];
  apiEndpoints: string[];
  maxAge: {
    static: number;
    dynamic: number;
    api: number;
  };
}

export class ServiceWorkerCacheManager {
  private config: ServiceWorkerCacheConfig;
  private readonly CACHE_PREFIX = 'devmart-v';
  
  constructor(config: ServiceWorkerCacheConfig) {
    this.config = config;
  }

  /**
   * Initialize service worker cache management
   */
  async initialize(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('✅ Service Worker registered successfully');
        
        // Send initial cache config
        this.sendConfigToServiceWorker(registration);
        
        // Listen for service worker messages
        this.setupServiceWorkerListener();
        
      } catch (error) {
        console.warn('Service Worker registration failed:', error);
      }
    }
  }

  /**
   * Update cache configuration
   */
  async updateCacheConfig(newConfig: Partial<ServiceWorkerCacheConfig>): Promise<void> {
    this.config = { ...this.config, ...newConfig };
    
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'UPDATE_CACHE_CONFIG',
        config: this.config
      });
    }
  }

  /**
   * Invalidate specific cache entries
   */
  async invalidateCache(pattern: string | RegExp): Promise<void> {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'INVALIDATE_CACHE',
        pattern: pattern.toString()
      });
    }
  }

  /**
   * Clear all caches
   */
  async clearAllCaches(): Promise<void> {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          .filter(name => name.startsWith(this.CACHE_PREFIX))
          .map(name => caches.delete(name))
      );
      
      console.log('🗑️ All service worker caches cleared');
    }
  }

  /**
   * Preload critical resources
   */
  async preloadCriticalResources(): Promise<void> {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'PRELOAD_RESOURCES',
        resources: this.config.staticAssets
      });
    }
  }

  /**
   * Get cache status and statistics
   */
  async getCacheStatus(): Promise<{
    caches: string[];
    totalSize: number;
    lastUpdated: string;
  }> {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      const devmartCaches = cacheNames.filter(name => name.startsWith(this.CACHE_PREFIX));
      
      // Calculate total cache size (approximate)
      let totalSize = 0;
      for (const cacheName of devmartCaches) {
        const cache = await caches.open(cacheName);
        const keys = await cache.keys();
        totalSize += keys.length; // Rough estimate
      }
      
      return {
        caches: devmartCaches,
        totalSize,
        lastUpdated: new Date().toISOString()
      };
    }
    
    return {
      caches: [],
      totalSize: 0,
      lastUpdated: new Date().toISOString()
    };
  }

  private sendConfigToServiceWorker(registration: ServiceWorkerRegistration): void {
    if (registration.active) {
      registration.active.postMessage({
        type: 'INIT_CACHE_CONFIG',
        config: this.config
      });
    }
  }

  private setupServiceWorkerListener(): void {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        const { type, data } = event.data;
        
        switch (type) {
          case 'CACHE_UPDATED':
            console.log('📦 Service Worker cache updated:', data);
            break;
          case 'CACHE_ERROR':
            console.error('❌ Service Worker cache error:', data);
            break;
          case 'PRELOAD_COMPLETE':
            console.log('🚀 Critical resources preloaded:', data);
            break;
          default:
            console.log('📨 Service Worker message:', event.data);
        }
      });
    }
  }
}

// Enhanced service worker script content
export const enhancedServiceWorkerScript = `
const CACHE_VERSION = 'v1';
const CACHE_PREFIX = 'devmart-';
const STATIC_CACHE = CACHE_PREFIX + 'static-' + CACHE_VERSION;
const DYNAMIC_CACHE = CACHE_PREFIX + 'dynamic-' + CACHE_VERSION;
const API_CACHE = CACHE_PREFIX + 'api-' + CACHE_VERSION;

let cacheConfig = {
  version: '1.0.0',
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
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll([
        '/',
        '/offline.html',
        ...cacheConfig.staticAssets
      ]);
    })
  );
  self.skipWaiting();
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter(name => name.startsWith(CACHE_PREFIX) && name !== STATIC_CACHE && name !== DYNAMIC_CACHE && name !== API_CACHE)
          .map(name => caches.delete(name))
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
  return url.pathname.match(/\\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2|ttf|ico)$/);
}

function isApiRequest(url) {
  return url.pathname.startsWith('/api/') || 
         url.pathname.includes('supabase.co/rest/') ||
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
    
    return new Response('API not available offline', { status: 503 });
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
    if (request.mode === 'navigate') {
      const offlinePage = await caches.match('/offline.html');
      return offlinePage || new Response('Page not available offline', { status: 503 });
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
`;

// Default cache configuration
export const defaultCacheConfig: ServiceWorkerCacheConfig = {
  version: '1.0.0',
  staticAssets: [
    '/images/logo.png',
    '/images/about-team-collaboration.jpg',
    '/images/about-workspace.jpg',
    '/images/client-logo-techflow.png',
    '/images/client-logo-financex.png',
    '/images/client-logo-healthtech.png',
    '/images/client-logo-shoppro.png'
  ],
  dynamicRoutes: [
    '/',
    '/about',
    '/services',
    '/portfolio',
    '/contact'
  ],
  apiEndpoints: [
    '/api',
    'supabase.co/rest'
  ],
  maxAge: {
    static: 24 * 60 * 60 * 1000, // 24 hours
    dynamic: 60 * 60 * 1000, // 1 hour
    api: 10 * 60 * 1000 // 10 minutes
  }
};