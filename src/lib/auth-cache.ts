/**
 * Authentication caching system to reduce redundant auth calls
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class AuthCache {
  private cache: Map<string, CacheEntry<any>> = new Map();

  set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const isExpired = Date.now() - entry.timestamp > entry.ttl;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  clear(pattern?: string): void {
    if (!pattern) {
      this.cache.clear();
      return;
    }

    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  size(): number {
    return this.cache.size;
  }

  // Clean up expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

// Singleton instance
export const authCache = new AuthCache();

// Auto cleanup every 5 minutes
setInterval(() => {
  authCache.cleanup();
}, 5 * 60 * 1000);

// Cache keys
export const CACHE_KEYS = {
  USER_ROLE: (userId: string) => `user_role_${userId}`,
  SESSION_VALIDATION: (sessionId: string) => `session_validation_${sessionId}`,
  USER_PERMISSIONS: (userId: string) => `user_permissions_${userId}`
} as const;