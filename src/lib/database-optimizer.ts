/**
 * Database Query Optimization & Batch Loading System
 * Reduces database round trips and optimizes query patterns
 */

import { supabase } from '@/integrations/supabase/client';
import { cache, CacheStrategies } from './cache-manager';

interface BatchRequest {
  id: string;
  table: string;
  select?: string;
  filters?: Record<string, any>;
  orderBy?: { column: string; ascending?: boolean };
  limit?: number;
  resolver: (data: any) => void;
  rejecter: (error: any) => void;
}

interface QueryOptimizationStats {
  totalQueries: number;
  batchedQueries: number;
  cacheHits: number;
  cacheMisses: number;
  avgQueryTime: number;
  savedRoundTrips: number;
}

class DatabaseOptimizer {
  private static instance: DatabaseOptimizer;
  private batchQueue: BatchRequest[] = [];
  private batchTimer?: number;
  private stats: QueryOptimizationStats = {
    totalQueries: 0,
    batchedQueries: 0,
    cacheHits: 0,
    cacheMisses: 0,
    avgQueryTime: 0,
    savedRoundTrips: 0
  };
  private queryTimes: number[] = [];

  static getInstance(): DatabaseOptimizer {
    if (!DatabaseOptimizer.instance) {
      DatabaseOptimizer.instance = new DatabaseOptimizer();
    }
    return DatabaseOptimizer.instance;
  }

  /**
   * Optimized query with batching and caching
   */
  async query<T>(
    table: string,
    options: {
      select?: string;
      filters?: Record<string, any>;
      orderBy?: { column: string; ascending?: boolean };
      limit?: number;
      cacheKey?: string;
      cacheTTL?: number;
      enableBatching?: boolean;
    } = {}
  ): Promise<T[]> {
    const startTime = performance.now();
    this.stats.totalQueries++;

    // Generate cache key
    const cacheKey = options.cacheKey || this.generateCacheKey(table, options);
    
    // Try cache first
    if (options.cacheTTL !== 0) {
      const cached = cache.getSync<T[]>(cacheKey);
      if (cached !== null) {
        this.stats.cacheHits++;
        return cached;
      }
      this.stats.cacheMisses++;
    }

    // Execute query
    const data = options.enableBatching 
      ? await this.batchQuery<T>(table, options)
      : await this.executeQuery<T>(table, options);

    // Cache result
    if (options.cacheTTL !== 0) {
      cache.set(cacheKey, data, options.cacheTTL || CacheStrategies.API_MEDIUM.ttl);
    }

    // Record timing
    const queryTime = performance.now() - startTime;
    this.recordQueryTime(queryTime);

    return data;
  }

  /**
   * Batch multiple queries to reduce database round trips
   */
  private async batchQuery<T>(
    table: string,
    options: any
  ): Promise<T[]> {
    return new Promise((resolve, reject) => {
      const batchId = `${table}_${Date.now()}_${Math.random()}`;
      
      this.batchQueue.push({
        id: batchId,
        table,
        ...options,
        resolver: resolve,
        rejecter: reject
      });

      // Process batch after short delay to collect more requests
      if (!this.batchTimer) {
        this.batchTimer = window.setTimeout(() => {
          this.processBatch();
        }, 10); // 10ms batching window
      }
    });
  }

  private async processBatch(): Promise<void> {
    if (this.batchQueue.length === 0) return;

    const batch = [...this.batchQueue];
    this.batchQueue = [];
    this.batchTimer = undefined;

    // Group by table for efficient batch processing
    const tableGroups = new Map<string, BatchRequest[]>();
    batch.forEach(request => {
      if (!tableGroups.has(request.table)) {
        tableGroups.set(request.table, []);
      }
      tableGroups.get(request.table)!.push(request);
    });

    this.stats.batchedQueries += batch.length;
    if (batch.length > 1) {
      this.stats.savedRoundTrips += batch.length - tableGroups.size;
    }

    // Process each table group
    for (const [table, requests] of tableGroups) {
      await this.processTableBatch(table, requests);
    }
  }

  private async processTableBatch(table: string, requests: BatchRequest[]): Promise<void> {
    try {
      // For now, execute individual queries (can be optimized further)
      const results = await Promise.all(
        requests.map(request => this.executeQuery(request.table, request))
      );

      requests.forEach((request, index) => {
        request.resolver(results[index]);
      });
    } catch (error) {
      requests.forEach(request => {
        request.rejecter(error);
      });
    }
  }

  private async executeQuery<T>(
    table: string,
    options: {
      select?: string;
      filters?: Record<string, any>;
      orderBy?: { column: string; ascending?: boolean };
      limit?: number;
    }
  ): Promise<T[]> {
    let query = (supabase as any).from(table).select(options.select || '*');

    // Apply filters
    if (options.filters) {
      Object.entries(options.filters).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          query = query.in(key, value);
        } else if (value !== undefined && value !== null) {
          query = query.eq(key, value);
        }
      });
    }

    // Apply ordering
    if (options.orderBy) {
      query = query.order(options.orderBy.column, { 
        ascending: options.orderBy.ascending !== false 
      });
    }

    // Apply limit
    if (options.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;
    
    if (error) throw error;
    return data as T[];
  }

  private generateCacheKey(table: string, options: any): string {
    const keyParts = [table];
    
    if (options.select) keyParts.push(`select:${options.select}`);
    if (options.filters) {
      const filterStr = Object.entries(options.filters)
        .map(([k, v]) => `${k}:${Array.isArray(v) ? v.join(',') : v}`)
        .join('|');
      keyParts.push(`filters:${filterStr}`);
    }
    if (options.orderBy) {
      keyParts.push(`order:${options.orderBy.column}:${options.orderBy.ascending !== false ? 'asc' : 'desc'}`);
    }
    if (options.limit) keyParts.push(`limit:${options.limit}`);
    
    return keyParts.join(':');
  }

  private recordQueryTime(time: number): void {
    this.queryTimes.push(time);
    
    // Keep only last 100 query times
    if (this.queryTimes.length > 100) {
      this.queryTimes.shift();
    }
    
    // Update average
    this.stats.avgQueryTime = this.queryTimes.reduce((sum, t) => sum + t, 0) / this.queryTimes.length;
  }

  /**
   * Optimized homepage data fetcher
   */
  async getHomepageData(): Promise<{
    pages: any[];
    settings: any;
    blogPosts: any[];
    projects: any[];
    services: any[];
  }> {
    const cacheKey = 'homepage:data';
    
    return cache.get(cacheKey, async () => {
      // Batch all homepage queries
      const [pages, settings, blogPosts, projects, services] = await Promise.all([
        this.query('pages', {
          select: '*',
          filters: { status: 'published' },
          orderBy: { column: 'published_at', ascending: false },
          enableBatching: false // Direct query for critical path
        }),
        this.query('settings', {
          select: '*',
          enableBatching: false
        }),
        this.query('blog_posts', {
          select: '*',
          filters: { status: 'published' },
          orderBy: { column: 'published_at', ascending: false },
          limit: 3,
          enableBatching: false
        }),
        this.query('projects', {
          select: '*, project_images(*)',
          filters: { status: 'published' },
          orderBy: { column: 'published_at', ascending: false },
          enableBatching: false
        }),
        this.query('services', {
          select: '*',
          filters: { status: 'published' },
          orderBy: { column: 'published_at', ascending: false },
          enableBatching: false
        })
      ]);

      return { pages, settings, blogPosts, projects, services };
    }, CacheStrategies.API_SHORT);
  }

  /**
   * Optimized settings fetcher with aggressive caching
   */
  async getSettings(): Promise<Record<string, any>> {
    return cache.get('app:settings:optimized', async () => {
      const { data, error } = await supabase
        .from('settings')
        .select('*');
      
      if (error) throw error;
      
      // Convert to key-value object for easier access
      const settings: Record<string, any> = {};
      data?.forEach(setting => {
        settings[setting.key] = setting.value;
      });
      
      return settings;
    }, CacheStrategies.STATIC_LONG);
  }

  /**
   * Preload critical data
   */
  async preloadCriticalData(): Promise<void> {
    console.log('🚀 Preloading critical data...');
    
    const preloadPromises = [
      this.getSettings(),
      cache.preload('pages:published', () => 
        this.query('pages', { 
          filters: { status: 'published' },
          orderBy: { column: 'published_at', ascending: false }
        }),
        CacheStrategies.STATIC_SHORT.ttl
      ),
      cache.preload('blog:latest', () =>
        this.query('blog_posts', {
          filters: { status: 'published' },
          orderBy: { column: 'published_at', ascending: false },
          limit: 6
        }),
        CacheStrategies.API_MEDIUM.ttl
      )
    ];

    try {
      await Promise.allSettled(preloadPromises);
      console.log('✅ Critical data preloaded');
    } catch (error) {
      console.warn('⚠️ Some critical data failed to preload:', error);
    }
  }

  /**
   * Get optimization statistics
   */
  getStats(): QueryOptimizationStats {
    return { ...this.stats };
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.stats = {
      totalQueries: 0,
      batchedQueries: 0,
      cacheHits: 0,
      cacheMisses: 0,
      avgQueryTime: 0,
      savedRoundTrips: 0
    };
    this.queryTimes = [];
  }

  /**
   * Invalidate related caches when data changes
   */
  invalidateCache(table: string, operation: 'insert' | 'update' | 'delete', id?: string): void {
    // Invalidate specific patterns based on the table and operation
    const patterns = [
      `${table}:`,
      'homepage:data',
      'app:settings'
    ];

    if (table === 'settings') {
      patterns.push('app:settings:optimized');
    }

    patterns.forEach(pattern => {
      cache.invalidatePattern(pattern);
    });

    console.log(`Cache invalidated for ${table} ${operation}${id ? ` (${id})` : ''}`);
  }
}

// Global optimizer instance
export const dbOptimizer = DatabaseOptimizer.getInstance();

// Convenience functions
export const OptimizedQueries = {
  // Get all published content for homepage
  getHomepageData: () => dbOptimizer.getHomepageData(),
  
  // Get settings with aggressive caching
  getSettings: () => dbOptimizer.getSettings(),
  
  // Get blog posts with caching
  getBlogPosts: (limit?: number) => dbOptimizer.query('blog_posts', {
    filters: { status: 'published' },
    orderBy: { column: 'published_at', ascending: false },
    limit,
    cacheTTL: CacheStrategies.API_MEDIUM.ttl
  }),
  
  // Get projects with images
  getProjects: (limit?: number) => dbOptimizer.query('projects', {
    select: '*, project_images(*)',
    filters: { status: 'published' },
    orderBy: { column: 'published_at', ascending: false },
    limit,
    cacheTTL: CacheStrategies.API_MEDIUM.ttl
  }),
  
  // Get services
  getServices: (limit?: number) => dbOptimizer.query('services', {
    filters: { status: 'published' },
    orderBy: { column: 'published_at', ascending: false },
    limit,
    cacheTTL: CacheStrategies.API_MEDIUM.ttl
  }),
  
  // Preload critical data
  preloadCriticalData: () => dbOptimizer.preloadCriticalData()
};
