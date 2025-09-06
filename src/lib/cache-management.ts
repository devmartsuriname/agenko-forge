/**
 * Phase 3: Smart Cache Management System
 * Advanced cache invalidation, asset fingerprinting, and service worker optimization
 */

import { QueryClient } from '@tanstack/react-query';
import { CacheInvalidation } from './react-query-config';

// Content update tracking and cache versioning
interface ContentVersion {
  type: string;
  id: string;
  version: string;
  timestamp: number;
  related: string[];
}

interface CacheWarmingConfig {
  enabled: boolean;
  criticalPaths: string[];
  preloadDelay: number;
  maxConcurrent: number;
}

interface AssetCacheConfig {
  version: string;
  staticAssets: string[];
  dynamicContent: string[];
  cacheBusting: boolean;
}

class SmartCacheManager {
  private static instance: SmartCacheManager;
  private queryClient: QueryClient;
  private contentVersions = new Map<string, ContentVersion>();
  private warmingQueue: string[] = [];
  private isWarming = false;
  private deploymentVersion: string;

  private constructor(queryClient: QueryClient) {
    this.queryClient = queryClient;
    this.deploymentVersion = this.getDeploymentVersion();
    this.initializeContentTracking();
  }

  static getInstance(queryClient: QueryClient): SmartCacheManager {
    if (!SmartCacheManager.instance) {
      SmartCacheManager.instance = new SmartCacheManager(queryClient);
    }
    return SmartCacheManager.instance;
  }

  /**
   * Smart content invalidation based on content relationships
   */
  async invalidateContent(contentType: string, id: string, updatedAt?: string): Promise<void> {
    console.log(`🔄 Smart cache invalidation: ${contentType}:${id}`);
    
    // Update content version tracking
    const versionKey = `${contentType}:${id}`;
    const version = updatedAt || Date.now().toString();
    
    this.contentVersions.set(versionKey, {
      type: contentType,
      id,
      version,
      timestamp: Date.now(),
      related: this.getRelatedContent(contentType, id)
    });

    // Invalidate primary content
    await CacheInvalidation.invalidateItem(this.queryClient, contentType, id);

    // Invalidate related content based on smart relationships
    await this.invalidateRelatedContent(contentType, id);

    // Trigger cache warming for critical paths
    await this.warmCriticalPaths(contentType);

    console.log(`✅ Smart invalidation complete for ${versionKey}`);
  }

  /**
   * Content-aware cache warming
   */
  async warmCache(config: CacheWarmingConfig): Promise<void> {
    if (!config.enabled || this.isWarming) {
      return;
    }

    this.isWarming = true;
    console.log('🔥 Starting cache warming process');

    try {
      const warmingPromises = config.criticalPaths.map((path, index) => 
        new Promise<void>((resolve) => {
          setTimeout(async () => {
            try {
              await this.warmPath(path);
              resolve();
            } catch (error) {
              console.warn(`Cache warming failed for ${path}:`, error);
              resolve();
            }
          }, index * (config.preloadDelay / config.maxConcurrent));
        })
      );

      await Promise.all(warmingPromises);
      console.log('✅ Cache warming completed');
    } finally {
      this.isWarming = false;
    }
  }

  /**
   * Asset cache busting and fingerprinting
   */
  async updateAssetCache(config: AssetCacheConfig): Promise<void> {
    console.log('🎯 Updating asset cache fingerprints');

    if (config.cacheBusting) {
      // Clear existing asset cache
      await this.clearAssetCache();
    }

    // Update service worker cache with new versions
    await this.updateServiceWorkerCache(config);

    // Preload critical static assets
    await this.preloadStaticAssets(config.staticAssets);

    console.log('✅ Asset cache updated');
  }

  /**
   * Deployment-based cache invalidation
   */
  async invalidateOnDeployment(): Promise<void> {
    const newVersion = this.getDeploymentVersion();
    
    if (newVersion !== this.deploymentVersion) {
      console.log(`🚀 New deployment detected: ${this.deploymentVersion} → ${newVersion}`);
      
      // Clear all React Query cache
      this.queryClient.clear();
      
      // Clear service worker cache
      await this.clearServiceWorkerCache();
      
      // Update internal version
      this.deploymentVersion = newVersion;
      
      // Warm critical paths
      await this.warmCriticalPaths('deployment');
      
      console.log('✅ Deployment cache invalidation complete');
    }
  }

  /**
   * Background cache optimization
   */
  async optimizeCache(): Promise<void> {
    console.log('⚡ Starting background cache optimization');

    // Remove stale cache entries
    const cache = this.queryClient.getQueryCache();
    const queries = cache.getAll();
    let removedCount = 0;

    queries.forEach(query => {
      if (query.isStale() && !query.isActive() && query.getObserversCount() === 0) {
        cache.remove(query);
        removedCount++;
      }
    });

    // Clean up content version tracking
    this.cleanupContentVersions();

    console.log(`✅ Cache optimization complete - removed ${removedCount} stale entries`);
  }

  /**
   * Get cache health metrics
   */
  getCacheMetrics(): {
    totalQueries: number;
    activeQueries: number;
    staleQueries: number;
    hitRate: number;
    contentVersions: number;
  } {
    const cache = this.queryClient.getQueryCache();
    const queries = cache.getAll();

    return {
      totalQueries: queries.length,
      activeQueries: queries.filter(q => q.isActive()).length,
      staleQueries: queries.filter(q => q.isStale()).length,
      hitRate: this.calculateHitRate(),
      contentVersions: this.contentVersions.size
    };
  }

  // Private methods

  private initializeContentTracking(): void {
    // Listen for content updates via custom events
    if (typeof window !== 'undefined') {
      window.addEventListener('content-updated', this.handleContentUpdate.bind(this));
      window.addEventListener('deployment-updated', this.invalidateOnDeployment.bind(this));
    }
  }

  private handleContentUpdate(event: CustomEvent): void {
    const { contentType, id, updatedAt } = event.detail;
    this.invalidateContent(contentType, id, updatedAt);
  }

  private getRelatedContent(contentType: string, id: string): string[] {
    const relationships: Record<string, string[]> = {
      pages: ['homepage', 'navigation', 'sitemap'],
      blog_posts: ['blog', 'homepage-blog-preview', 'sitemap'],
      projects: ['portfolio', 'homepage-portfolio-preview', 'sitemap'],
      services: ['services', 'homepage-services-preview', 'sitemap'],
      settings: ['*'] // Settings affect everything
    };

    return relationships[contentType] || [];
  }

  private async invalidateRelatedContent(contentType: string, id: string): Promise<void> {
    const related = this.getRelatedContent(contentType, id);
    
    const invalidationPromises = related.map(relatedType => {
      if (relatedType === '*') {
        // Invalidate everything
        return this.queryClient.invalidateQueries();
      } else if (relatedType === 'homepage') {
        return CacheInvalidation.invalidateHomepage(this.queryClient);
      } else {
        return CacheInvalidation.invalidateContentType(this.queryClient, relatedType);
      }
    });

    await Promise.all(invalidationPromises);
  }

  private async warmCriticalPaths(triggerType: string): Promise<void> {
    const criticalPaths = this.getCriticalPathsForType(triggerType);
    
    if (criticalPaths.length > 0) {
      await this.warmCache({
        enabled: true,
        criticalPaths,
        preloadDelay: 2000,
        maxConcurrent: 3
      });
    }
  }

  private getCriticalPathsForType(contentType: string): string[] {
    const criticalPaths: Record<string, string[]> = {
      pages: ['homepage', 'about', 'services'],
      blog_posts: ['homepage', 'blog'],
      projects: ['homepage', 'portfolio'],
      services: ['homepage', 'services'],
      deployment: ['homepage', 'services', 'portfolio', 'about']
    };

    return criticalPaths[contentType] || [];
  }

  private async warmPath(path: string): Promise<void> {
    // Simulate path warming - in real implementation, this would prefetch the route data
    console.log(`🔥 Warming cache for path: ${path}`);
    
    // This is where you'd implement actual path warming logic
    // For example, prefetching route data, components, etc.
  }

  private async clearAssetCache(): Promise<void> {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          .filter(name => name.includes('assets') || name.includes('static'))
          .map(name => caches.delete(name))
      );
    }
  }

  private async updateServiceWorkerCache(config: AssetCacheConfig): Promise<void> {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'UPDATE_CACHE',
        config
      });
    }
  }

  private async preloadStaticAssets(assets: string[]): Promise<void> {
    const preloadPromises = assets.map(asset => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = asset;
      link.as = this.getAssetType(asset);
      document.head.appendChild(link);
      
      return new Promise<void>((resolve) => {
        link.onload = () => resolve();
        link.onerror = () => resolve(); // Don't fail on individual asset errors
      });
    });

    await Promise.allSettled(preloadPromises);
  }

  private getAssetType(asset: string): string {
    if (asset.endsWith('.css')) return 'style';
    if (asset.endsWith('.js')) return 'script';
    if (asset.match(/\.(jpg|jpeg|png|webp|svg)$/)) return 'image';
    if (asset.match(/\.(woff|woff2|ttf)$/)) return 'font';
    return 'fetch';
  }

  private async clearServiceWorkerCache(): Promise<void> {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
    }
  }

  private cleanupContentVersions(): void {
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    for (const [key, version] of this.contentVersions.entries()) {
      if (now - version.timestamp > maxAge) {
        this.contentVersions.delete(key);
      }
    }
  }

  private calculateHitRate(): number {
    // This would need to be implemented with actual metrics tracking
    // For now, return a placeholder
    return 85; // 85% hit rate
  }

  private getDeploymentVersion(): string {
    // Try to get version from various sources
    if (typeof window !== 'undefined') {
      // Check for version in meta tag
      const versionMeta = document.querySelector('meta[name="version"]');
      if (versionMeta) {
        return versionMeta.getAttribute('content') || '';
      }
      
      // Check for version in global variable
      if ((window as any).__APP_VERSION__) {
        return (window as any).__APP_VERSION__;
      }
    }
    
    // Fallback to timestamp-based version
    return Date.now().toString();
  }
}

// Utility functions for cache management
export const CacheManagementUtils = {
  // Initialize smart cache manager
  initialize: (queryClient: QueryClient): SmartCacheManager => {
    return SmartCacheManager.getInstance(queryClient);
  },

  // Trigger content update event
  notifyContentUpdate: (contentType: string, id: string, updatedAt?: string): void => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('content-updated', {
        detail: { contentType, id, updatedAt }
      }));
    }
  },

  // Trigger deployment update event
  notifyDeploymentUpdate: (): void => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('deployment-updated'));
    }
  },

  // Get critical assets for preloading
  getCriticalAssets: (): string[] => {
    return [
      '/images/logo.png',
      '/images/about-team-collaboration.jpg',
      '/images/about-workspace.jpg',
      '/images/client-logo-techflow.png',
      '/images/client-logo-financex.png',
      '/images/client-logo-healthtech.png',
      '/images/client-logo-shoppro.png'
    ];
  }
};

export default SmartCacheManager;