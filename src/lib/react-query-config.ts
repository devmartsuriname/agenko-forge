/**
 * Optimized React Query Configuration
 * Phase 2: Content-aware caching with versioning and background refresh
 */

import { QueryClient, QueryKey } from '@tanstack/react-query';
import { toast } from 'sonner';

// Content-specific cache strategies
export const CacheStrategies = {
  // Homepage content - critical path, longer cache with background refresh
  HOMEPAGE: {
    staleTime: 2 * 60 * 1000, // 2 minutes - consider fresh
    gcTime: 15 * 60 * 1000, // 15 minutes - keep in memory (renamed from cacheTime)
    refetchOnWindowFocus: false, // Don't refetch on focus to prevent flashing
    refetchOnMount: false, // Don't refetch on mount if data exists
    refetchInterval: 5 * 60 * 1000, // Background refresh every 5 minutes
    refetchIntervalInBackground: true, // Continue refreshing in background
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  },

  // Static content (pages, services, projects)
  STATIC_CONTENT: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchInterval: 10 * 60 * 1000, // 10 minutes background refresh
    retry: 2,
  },

  // Dynamic content (blog posts, comments)
  DYNAMIC_CONTENT: {
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    retry: 2,
  },

  // User-specific data
  USER_DATA: {
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    retry: 3,
  },

  // Settings and configuration
  SETTINGS: {
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 1,
  },

  // Real-time data (analytics, monitoring)
  REAL_TIME: {
    staleTime: 0, // Always stale
    gcTime: 1 * 60 * 1000, // 1 minute
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchInterval: 30 * 1000, // 30 seconds
    retry: 1,
  }
} as const;

// Generate versioned cache keys based on content timestamps
export const createVersionedKey = (baseKey: string[], version?: string | number): QueryKey => {
  if (version) {
    return [...baseKey, 'v', version.toString()];
  }
  return baseKey;
};

// Create homepage-specific cache key with timestamp
export const createHomepageKey = (updatedAt?: string): QueryKey => {
  return createVersionedKey(['homepage'], updatedAt);
};

// Error handler for React Query
const onError = (error: Error, query: any) => {
  console.error('Query error:', error, query);
  
  // Only show user-facing errors for certain types of failures
  if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
    toast.error('Connection issue. Some content may be cached.', {
      duration: 3000,
      position: 'bottom-right'
    });
  } else if (error.message.includes('404')) {
    console.warn('Content not found, using cached version if available');
  } else {
    // Log unexpected errors but don't show to user unless critical
    console.error('Unexpected query error:', error);
  }
};

// Default query configuration
const defaultOptions = {
  queries: {
    // Global defaults - conservative settings
    staleTime: 30 * 1000, // 30 seconds
    cacheTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false, // Prevent unexpected refetches
    refetchOnMount: true,
    refetchOnReconnect: true,
    retry: (failureCount: number, error: Error) => {
      // Don't retry on 404s or authentication errors
      if (error.message.includes('404') || error.message.includes('401')) {
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 10000),
    onError,
  },
  mutations: {
    onError,
    retry: 1,
  }
};

// Create optimized QueryClient
export const createOptimizedQueryClient = (): QueryClient => {
  return new QueryClient({
    defaultOptions
  });
};

// Cache invalidation utilities
export const CacheInvalidation = {
  // Invalidate homepage cache
  invalidateHomepage: (queryClient: QueryClient) => {
    return queryClient.invalidateQueries({ 
      queryKey: ['homepage'],
      exact: false // Invalidate all homepage variants
    });
  },

  // Invalidate content by type
  invalidateContentType: (queryClient: QueryClient, contentType: string) => {
    return queryClient.invalidateQueries({ 
      queryKey: [contentType],
      exact: false
    });
  },

  // Invalidate specific content item
  invalidateItem: (queryClient: QueryClient, contentType: string, id: string) => {
    return queryClient.invalidateQueries({ 
      queryKey: [contentType, id],
      exact: false
    });
  },

  // Smart invalidation based on content relationships
  invalidateRelatedContent: (queryClient: QueryClient, contentType: string, id: string) => {
    const invalidations = [];
    
    // Always invalidate the specific item
    invalidations.push(CacheInvalidation.invalidateItem(queryClient, contentType, id));
    
    // Invalidate related content based on type
    switch (contentType) {
      case 'pages':
        // If homepage is updated, invalidate homepage cache
        invalidations.push(CacheInvalidation.invalidateHomepage(queryClient));
        break;
      case 'blog_posts':
        // Invalidate blog listings and homepage if blog preview is shown
        invalidations.push(queryClient.invalidateQueries({ queryKey: ['blog'] }));
        invalidations.push(queryClient.invalidateQueries({ queryKey: ['homepage'] }));
        break;
      case 'projects':
        // Invalidate project listings and homepage
        invalidations.push(queryClient.invalidateQueries({ queryKey: ['projects'] }));
        invalidations.push(queryClient.invalidateQueries({ queryKey: ['homepage'] }));
        break;
      case 'services':
        // Invalidate service listings and homepage
        invalidations.push(queryClient.invalidateQueries({ queryKey: ['services'] }));
        invalidations.push(queryClient.invalidateQueries({ queryKey: ['homepage'] }));
        break;
    }
    
    return Promise.all(invalidations);
  }
};

// Query prefetching utilities
export const QueryPrefetch = {
  // Prefetch critical homepage data
  prefetchHomepage: async (queryClient: QueryClient, cmsGetPages: () => Promise<any[]>) => {
    await queryClient.prefetchQuery({
      queryKey: ['homepage'],
      queryFn: async () => {
        const pages = await cmsGetPages();
        return pages.find(p => p.slug === 'home') || null;
      },
      ...CacheStrategies.HOMEPAGE
    });
  },

  // Prefetch related content
  prefetchRelatedContent: async (queryClient: QueryClient, prefetchFunctions: Record<string, () => Promise<any>>) => {
    const prefetchPromises = Object.entries(prefetchFunctions).map(([key, fn]) =>
      queryClient.prefetchQuery({
        queryKey: [key],
        queryFn: fn,
        ...CacheStrategies.STATIC_CONTENT
      })
    );
    
    await Promise.allSettled(prefetchPromises);
  }
};

// Development utilities
export const DevTools = {
  // Log cache statistics
  logCacheStats: (queryClient: QueryClient) => {
    const cache = queryClient.getQueryCache();
    const queries = cache.getAll();
    
    console.group('React Query Cache Stats');
    console.log(`Total queries: ${queries.length}`);
    console.log(`Active queries: ${queries.filter(q => q.isActive()).length}`);
    console.log(`Stale queries: ${queries.filter(q => q.isStale()).length}`);
    console.log(`Loading queries: ${queries.filter(q => q.getObserversCount() > 0 && q.state.status === 'pending').length}`);
    
    // Log cache keys and their status
    queries.forEach(query => {
      const status = query.isStale() ? '🟡 stale' : query.state.status === 'pending' ? '🔄 loading' : '✅ fresh';
      console.log(`${status} ${JSON.stringify(query.queryKey)}`);
    });
    
    console.groupEnd();
  },

  // Clear all cache
  clearAllCache: (queryClient: QueryClient) => {
    queryClient.clear();
    console.log('🗑️ All React Query cache cleared');
  }
};

// Export default optimized client instance (lazy initialization to avoid issues)
export const optimizedQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Global defaults - conservative settings
      staleTime: 30 * 1000, // 30 seconds
      gcTime: 5 * 60 * 1000, // 5 minutes (renamed from cacheTime)
      refetchOnWindowFocus: false, // Prevent unexpected refetches
      refetchOnMount: true,
      refetchOnReconnect: true,
      retry: (failureCount: number, error: Error) => {
        // Don't retry on 404s or authentication errors
        if (error.message.includes('404') || error.message.includes('401')) {
          return false;
        }
        return failureCount < 2;
      },
      retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 10000),
    },
    mutations: {
      retry: 1,
    }
  }
});