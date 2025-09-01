/**
 * Intelligent Cache Management System
 * Provides smart caching strategies for API calls, static resources, and data
 */

interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl: number;
  key: string;
  hits: number;
  size: number;
}

interface CacheStats {
  totalEntries: number;
  totalSize: number;
  hitRate: number;
  missRate: number;
  totalHits: number;
  totalMisses: number;
  avgResponseTime: number;
}

interface CacheConfig {
  maxSize: number; // in bytes
  maxEntries: number;
  defaultTTL: number; // in milliseconds
  cleanupInterval: number;
  compressionEnabled: boolean;
}

class IntelligentCacheManager {
  private static instance: IntelligentCacheManager;
  private cache = new Map<string, CacheEntry>();
  private stats = {
    totalHits: 0,
    totalMisses: 0,
    totalResponseTime: 0,
    responseTimeCount: 0
  };
  private config: CacheConfig;
  private cleanupTimer?: number;

  private constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      maxSize: 50 * 1024 * 1024, // 50MB
      maxEntries: 1000,
      defaultTTL: 5 * 60 * 1000, // 5 minutes
      cleanupInterval: 60 * 1000, // 1 minute
      compressionEnabled: true,
      ...config
    };

    this.startCleanupTimer();
  }

  static getInstance(config?: Partial<CacheConfig>): IntelligentCacheManager {
    if (!IntelligentCacheManager.instance) {
      IntelligentCacheManager.instance = new IntelligentCacheManager(config);
    }
    return IntelligentCacheManager.instance;
  }

  /**
   * Get data from cache or execute function and cache result
   */
  async get<T>(
    key: string, 
    fetchFn: () => Promise<T>, 
    options: { ttl?: number; priority?: 'low' | 'normal' | 'high' } = {}
  ): Promise<T> {
    const startTime = performance.now();
    
    // Check if data exists in cache and is not expired
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      cached.hits++;
      this.stats.totalHits++;
      this.recordResponseTime(performance.now() - startTime);
      return cached.data as T;
    }

    // Cache miss - fetch fresh data
    this.stats.totalMisses++;
    
    try {
      const data = await fetchFn();
      const ttl = options.ttl || this.config.defaultTTL;
      
      // Store in cache
      this.set(key, data, ttl, options.priority);
      
      this.recordResponseTime(performance.now() - startTime);
      return data;
    } catch (error) {
      // If fetch fails and we have stale data, return it
      if (cached) {
        console.warn(`Cache: Using stale data for ${key} due to fetch error:`, error);
        cached.hits++;
        return cached.data as T;
      }
      throw error;
    }
  }

  /**
   * Set data in cache
   */
  set<T>(key: string, data: T, ttl?: number, priority: 'low' | 'normal' | 'high' = 'normal'): void {
    const serializedData = this.serialize(data);
    const size = this.calculateSize(serializedData);
    
    // Check if we need to make space
    this.ensureSpace(size, priority);
    
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.config.defaultTTL,
      key,
      hits: 0,
      size
    };

    this.cache.set(key, entry);
  }

  /**
   * Get data from cache without fetching
   */
  getSync<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      cached.hits++;
      this.stats.totalHits++;
      return cached.data as T;
    }
    return null;
  }

  /**
   * Check if key exists in cache and is valid
   */
  has(key: string): boolean {
    const cached = this.cache.get(key);
    return !!(cached && Date.now() - cached.timestamp < cached.ttl);
  }

  /**
   * Remove specific key from cache
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const totalRequests = this.stats.totalHits + this.stats.totalMisses;
    const totalSize = Array.from(this.cache.values()).reduce((sum, entry) => sum + entry.size, 0);
    
    return {
      totalEntries: this.cache.size,
      totalSize,
      hitRate: totalRequests > 0 ? (this.stats.totalHits / totalRequests) * 100 : 0,
      missRate: totalRequests > 0 ? (this.stats.totalMisses / totalRequests) * 100 : 0,
      totalHits: this.stats.totalHits,
      totalMisses: this.stats.totalMisses,
      avgResponseTime: this.stats.responseTimeCount > 0 
        ? this.stats.totalResponseTime / this.stats.responseTimeCount 
        : 0
    };
  }

  /**
   * Get cache entries for debugging
   */
  getEntries(): Array<{ key: string; size: number; hits: number; age: number; ttl: number }> {
    const now = Date.now();
    return Array.from(this.cache.entries()).map(([key, entry]) => ({
      key,
      size: entry.size,
      hits: entry.hits,
      age: now - entry.timestamp,
      ttl: entry.ttl
    }));
  }

  /**
   * Invalidate cache entries matching pattern
   */
  invalidatePattern(pattern: string | RegExp): number {
    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
    let removed = 0;
    
    for (const [key] of this.cache) {
      if (regex.test(key)) {
        this.cache.delete(key);
        removed++;
      }
    }
    
    return removed;
  }

  /**
   * Preload data into cache
   */
  async preload<T>(key: string, fetchFn: () => Promise<T>, ttl?: number): Promise<void> {
    try {
      const data = await fetchFn();
      this.set(key, data, ttl, 'high');
    } catch (error) {
      console.warn(`Cache preload failed for ${key}:`, error);
    }
  }

  /**
   * Batch get multiple keys
   */
  async getBatch<T>(
    requests: Array<{ key: string; fetchFn: () => Promise<T>; ttl?: number }>
  ): Promise<Record<string, T>> {
    const results: Record<string, T> = {};
    
    // Separate cached and uncached requests
    const uncachedRequests: typeof requests = [];
    
    for (const request of requests) {
      const cached = this.getSync<T>(request.key);
      if (cached !== null) {
        results[request.key] = cached;
      } else {
        uncachedRequests.push(request);
      }
    }
    
    // Fetch uncached data in parallel
    if (uncachedRequests.length > 0) {
      const fetchPromises = uncachedRequests.map(async (request) => {
        try {
          const data = await request.fetchFn();
          this.set(request.key, data, request.ttl);
          return { key: request.key, data };
        } catch (error) {
          console.warn(`Batch fetch failed for ${request.key}:`, error);
          return { key: request.key, data: null };
        }
      });
      
      const fetchResults = await Promise.all(fetchPromises);
      fetchResults.forEach(({ key, data }) => {
        if (data !== null) {
          results[key] = data;
        }
      });
    }
    
    return results;
  }

  private serialize<T>(data: T): string {
    return JSON.stringify(data);
  }

  private calculateSize(serializedData: string): number {
    // Rough calculation of memory usage
    return new Blob([serializedData]).size;
  }

  private ensureSpace(requiredSize: number, priority: 'low' | 'normal' | 'high'): void {
    const currentSize = Array.from(this.cache.values()).reduce((sum, entry) => sum + entry.size, 0);
    
    // Check if we exceed size or count limits
    if (currentSize + requiredSize > this.config.maxSize || this.cache.size >= this.config.maxEntries) {
      this.evictEntries(requiredSize, priority);
    }
  }

  private evictEntries(requiredSize: number, priority: 'low' | 'normal' | 'high'): void {
    const entries = Array.from(this.cache.entries());
    
    // Sort by priority (LRU for same priority)
    entries.sort(([, a], [, b]) => {
      // Lower hit count = higher eviction priority
      const scoreA = a.hits + (Date.now() - a.timestamp) / 1000;
      const scoreB = b.hits + (Date.now() - b.timestamp) / 1000;
      return scoreA - scoreB;
    });

    let freedSpace = 0;
    let removedCount = 0;
    
    for (const [key, entry] of entries) {
      this.cache.delete(key);
      freedSpace += entry.size;
      removedCount++;
      
      // Stop when we've freed enough space
      if (freedSpace >= requiredSize && this.cache.size < this.config.maxEntries * 0.9) {
        break;
      }
    }
    
    console.log(`Cache: Evicted ${removedCount} entries, freed ${Math.round(freedSpace / 1024)}KB`);
  }

  private recordResponseTime(time: number): void {
    this.stats.totalResponseTime += time;
    this.stats.responseTimeCount++;
  }

  private startCleanupTimer(): void {
    this.cleanupTimer = window.setInterval(() => {
      this.cleanup();
    }, this.config.cleanupInterval);
  }

  private cleanup(): void {
    const now = Date.now();
    let removed = 0;
    
    for (const [key, entry] of this.cache) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        removed++;
      }
    }
    
    if (removed > 0) {
      console.log(`Cache: Cleaned up ${removed} expired entries`);
    }
  }

  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = undefined;
    }
    this.cache.clear();
  }
}

// Predefined cache strategies
export const CacheStrategies = {
  // API responses
  API_SHORT: { ttl: 1 * 60 * 1000, priority: 'normal' as const }, // 1 minute
  API_MEDIUM: { ttl: 5 * 60 * 1000, priority: 'normal' as const }, // 5 minutes
  API_LONG: { ttl: 30 * 60 * 1000, priority: 'high' as const }, // 30 minutes
  
  // Static content
  STATIC_SHORT: { ttl: 10 * 60 * 1000, priority: 'high' as const }, // 10 minutes
  STATIC_LONG: { ttl: 24 * 60 * 60 * 1000, priority: 'high' as const }, // 24 hours
  
  // User specific data
  USER_DATA: { ttl: 2 * 60 * 1000, priority: 'high' as const }, // 2 minutes
  
  // Low priority data
  ANALYTICS: { ttl: 15 * 60 * 1000, priority: 'low' as const }, // 15 minutes
} as const;

// Global cache instance
export const cache = IntelligentCacheManager.getInstance();

// Utility functions for common caching patterns
export const CacheUtils = {
  // Cache API responses
  async cacheApiCall<T>(
    key: string, 
    apiCall: () => Promise<T>, 
    strategy = CacheStrategies.API_MEDIUM
  ): Promise<T> {
    return cache.get(key, apiCall, strategy);
  },

  // Cache with custom key generation
  async cacheWithKey<T>(
    keyParts: string[], 
    fetchFn: () => Promise<T>, 
    strategy = CacheStrategies.API_MEDIUM
  ): Promise<T> {
    const key = keyParts.join(':');
    return cache.get(key, fetchFn, strategy);
  },

  // Cache settings data (frequently accessed)
  async cacheSettings<T>(fetchFn: () => Promise<T>): Promise<T> {
    return cache.get('app:settings', fetchFn, CacheStrategies.STATIC_LONG);
  },

  // Cache user profile data
  async cacheUserProfile<T>(userId: string, fetchFn: () => Promise<T>): Promise<T> {
    return cache.get(`user:profile:${userId}`, fetchFn, CacheStrategies.USER_DATA);
  },

  // Invalidate all data for a specific entity
  invalidateEntityCache(entityType: string, entityId?: string): number {
    const pattern = entityId 
      ? new RegExp(`^${entityType}:.*:${entityId}(:|$)`)
      : new RegExp(`^${entityType}:`);
    return cache.invalidatePattern(pattern);
  }
};