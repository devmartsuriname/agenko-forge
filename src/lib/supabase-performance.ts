/**
 * Supabase Performance Optimization Utilities
 */

import { supabase } from '@/integrations/supabase/client';

export interface QueryPerformanceOptions {
  enableTiming?: boolean;
  enableCaching?: boolean;
  cacheKey?: string;
  cacheTtl?: number;
}

interface QueryFunction<T> {
  (): Promise<{ data: T | null; error: any }>;
}

class SupabasePerformanceManager {
  private queryCache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private connectionPool = new Map<string, Promise<any>>();
  
  /**
   * Execute a query with performance optimizations
   */
  async executeOptimizedQuery<T>(
    queryFn: QueryFunction<T>,
    options: QueryPerformanceOptions = {}
  ): Promise<T> {
    const {
      enableTiming = true,
      enableCaching = false,
      cacheKey,
      cacheTtl = 5 * 60 * 1000 // 5 minutes default
    } = options;
    
    const startTime = performance.now();
    
    // Check cache first
    if (enableCaching && cacheKey) {
      const cached = this.queryCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < cached.ttl) {
        if (enableTiming) {
          console.log(`[DB] Cache hit for ${cacheKey} (${(performance.now() - startTime).toFixed(2)}ms)`);
        }
        return cached.data;
      }
    }
    
    // Check for duplicate queries
    const queryKey = cacheKey || 'query_' + Date.now() + '_' + Math.random();
    const existingQuery = this.connectionPool.get(queryKey);
    
    if (existingQuery) {
      console.log(`[DB] Deduplicating query: ${queryKey}`);
      return existingQuery;
    }
    
    // Execute query
    const queryPromise = this.executeQuery(queryFn, startTime, enableTiming);
    
    // Store in connection pool temporarily
    this.connectionPool.set(queryKey, queryPromise);
    
    try {
      const result = await queryPromise;
      
      // Cache result if enabled
      if (enableCaching && cacheKey && result) {
        this.queryCache.set(cacheKey, {
          data: result,
          timestamp: Date.now(),
          ttl: cacheTtl
        });
      }
      
      return result;
    } finally {
      // Remove from connection pool
      this.connectionPool.delete(queryKey);
    }
  }
  
  private async executeQuery<T>(
    queryFn: QueryFunction<T>,
    startTime: number,
    enableTiming: boolean
  ): Promise<T> {
    try {
      const { data, error } = await queryFn();
      
      if (error) {
        const errorTime = performance.now() - startTime;
        console.error('[DB] Query error:', error, `(${errorTime.toFixed(2)}ms)`);
        throw error;
      }
      
      const queryTime = performance.now() - startTime;
      
      if (enableTiming) {
        if (queryTime > 1000) {
          console.warn(`[DB] Slow query detected: ${queryTime.toFixed(2)}ms`);
        } else {
          console.log(`[DB] Query completed: ${queryTime.toFixed(2)}ms`);
        }
      }
      
      return data as T;
    } catch (error) {
      const errorTime = performance.now() - startTime;
      console.error('[DB] Query execution failed:', error, `(${errorTime.toFixed(2)}ms)`);
      throw error;
    }
  }
  
  /**
   * Create optimized queries for specific tables
   */
  createServicesQuery() {
    return {
      selectAll: async (options: {
        status?: string;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
        limit?: number;
        offset?: number;
      } = {}) => {
        let query = supabase.from('services').select('*');
        
        if (options.status && options.status !== 'all') {
          query = query.eq('status', options.status);
        }
        
        if (options.sortBy) {
          query = query.order(options.sortBy, { 
            ascending: options.sortOrder === 'asc' 
          });
        } else {
          query = query.order('updated_at', { ascending: false });
        }
        
        if (options.limit) {
          query = query.limit(options.limit);
        }
        
        if (options.offset) {
          query = query.range(
            options.offset, 
            options.offset + (options.limit || 10) - 1
          );
        }
        
        return query;
      }
    };
  }
  
  /**
   * Clear cache entries
   */
  clearCache(pattern?: string) {
    if (!pattern) {
      this.queryCache.clear();
      return;
    }
    
    for (const key of this.queryCache.keys()) {
      if (key.includes(pattern)) {
        this.queryCache.delete(key);
      }
    }
  }
  
  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      size: this.queryCache.size,
      activeConnections: this.connectionPool.size,
      entries: Array.from(this.queryCache.keys())
    };
  }
  
  /**
   * Cleanup expired cache entries
   */
  cleanupCache() {
    const now = Date.now();
    for (const [key, entry] of this.queryCache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.queryCache.delete(key);
      }
    }
  }
}

// Singleton instance
export const supabasePerformance = new SupabasePerformanceManager();

// Auto cleanup every 5 minutes
setInterval(() => {
  supabasePerformance.cleanupCache();
}, 5 * 60 * 1000);

export default supabasePerformance;