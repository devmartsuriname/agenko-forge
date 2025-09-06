/**
 * Unified performance monitoring utilities
 */

import { logger } from './logger';
import type { 
  PerformanceData, 
  WebVitalsMetrics, 
  TestResult, 
  NavigationMetrics, 
  MemoryUsage,
  VitalStatus,
  PERFORMANCE_THRESHOLDS
} from '@/types/performance';

export class UnifiedPerformanceMonitor {
  private static instance: UnifiedPerformanceMonitor;
  private metrics: Record<string, number> = {};
  private performanceData: PerformanceData | null = null;
  private observers: PerformanceObserver[] = [];

  private constructor() {
    this.initializeObservers();
  }

  static getInstance(): UnifiedPerformanceMonitor {
    if (!UnifiedPerformanceMonitor.instance) {
      UnifiedPerformanceMonitor.instance = new UnifiedPerformanceMonitor();
    }
    return UnifiedPerformanceMonitor.instance;
  }

  private initializeObservers() {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
      return;
    }

    try {
      // Navigation timing observer
      const navObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            this.handleNavigationEntry(entry as PerformanceNavigationTiming);
          }
        }
      });
      navObserver.observe({ type: 'navigation', buffered: true });
      this.observers.push(navObserver);

      // Paint timing observer
      const paintObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.handlePaintEntry(entry);
        }
      });
      paintObserver.observe({ type: 'paint', buffered: true });
      this.observers.push(paintObserver);

      // Resource timing observer
      const resourceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries() as PerformanceResourceTiming[];
        this.handleResourceEntries(entries);
      });
      resourceObserver.observe({ type: 'resource', buffered: true });
      this.observers.push(resourceObserver);

    } catch (error) {
      logger.error('Failed to initialize performance observers', error);
    }
  }

  private handleNavigationEntry(entry: PerformanceNavigationTiming) {
    const metrics = {
      pageLoadTime: entry.loadEventEnd - entry.fetchStart,
      domContentLoaded: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
      ttfb: entry.responseStart - entry.requestStart
    };
    
    Object.assign(this.metrics, metrics);
    this.updatePerformanceData();
  }

  private handlePaintEntry(entry: PerformanceEntry) {
    if (entry.name === 'first-contentful-paint') {
      this.metrics.fcp = entry.startTime;
    }
    this.updatePerformanceData();
  }

  private handleResourceEntries(entries: PerformanceResourceTiming[]) {
    this.metrics.resourceCount = entries.length;
    
    // Calculate bundle size from JS resources
    const jsResources = entries.filter(r => r.name.includes('.js'));
    this.metrics.bundleSize = jsResources.reduce((total, resource) => {
      return total + (resource.transferSize || 0);
    }, 0);
    
    this.updatePerformanceData();
  }

  private updatePerformanceData() {
    // Simulate LCP and CLS for now (would use real Web Vitals library)
    const vitals: WebVitalsMetrics = {
      lcp: this.metrics.lcp || Math.random() * 2000 + 1000,
      cls: this.metrics.cls || Math.random() * 0.1,
      fid: this.metrics.fid || Math.random() * 50 + 10,
      ttfb: this.metrics.ttfb || 0,
      fcp: this.metrics.fcp || 0
    };

    this.performanceData = {
      vitals,
      pageLoadTime: this.metrics.pageLoadTime || 0,
      domContentLoaded: this.metrics.domContentLoaded || 0,
      memoryUsage: this.getMemoryUsage().used,
      networkStatus: navigator.onLine ? 'online' : 'offline',
      resourceCount: this.metrics.resourceCount || 0,
      bundleSize: this.metrics.bundleSize || 0,
      errorCount: this.getStoredErrors().length,
      timestamp: new Date().toISOString()
    };
  }

  // Manual measurement methods
  startMeasure(name: string) {
    if (typeof performance !== 'undefined') {
      performance.mark(`${name}-start`);
    }
  }

  endMeasure(name: string) {
    if (typeof performance !== 'undefined') {
      performance.mark(`${name}-end`);
      performance.measure(name, `${name}-start`, `${name}-end`);
      
      const measure = performance.getEntriesByName(name)[0];
      this.metrics[name] = measure.duration;
    }
  }

  // Get current performance data
  getCurrentData(): PerformanceData | null {
    if (!this.performanceData) {
      this.updatePerformanceData();
    }
    return this.performanceData;
  }

  // Get specific metrics
  getMetrics(): Record<string, number> {
    return { ...this.metrics };
  }

  getMemoryUsage(): MemoryUsage {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return {
        used: Math.round(memory.usedJSHeapSize / 1024 / 1024),
        total: Math.round(memory.totalJSHeapSize / 1024 / 1024),
        limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024)
      };
    }
    return { used: 0, total: 0, limit: 0 };
  }

  getNavigationTiming(): NavigationMetrics | null {
    if (!performance.getEntriesByType) {
      return null;
    }

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    if (!navigation) {
      return null;
    }

    return {
      domContentLoaded: Math.round(navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart),
      loadComplete: Math.round(navigation.loadEventEnd - navigation.loadEventStart),
      totalLoadTime: Math.round(navigation.loadEventEnd - navigation.fetchStart),
      networkLatency: Math.round(navigation.responseEnd - navigation.requestStart),
      renderTime: Math.round(navigation.domContentLoadedEventStart - navigation.responseEnd)
    };
  }

  // Performance testing methods
  async testLazyLoading(): Promise<TestResult> {
    const startTime = performance.now();
    try {
      const adminModule = await import('@/pages/admin/AdminCaseStudyEditor');
      const endTime = performance.now();
      
      return {
        name: 'Lazy Loading',
        duration: endTime - startTime,
        success: true
      };
    } catch (error) {
      return {
        name: 'Lazy Loading',
        duration: 0,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  testAssetLoading(): TestResult {
    const startTime = performance.now();
    try {
      const images = document.querySelectorAll('img');
      const brokenImages = Array.from(images).filter(img => 
        img.naturalWidth === 0 && img.complete
      );
      
      const endTime = performance.now();
      
      return {
        name: 'Asset Loading',
        duration: endTime - startTime,
        success: brokenImages.length === 0,
        error: brokenImages.length > 0 ? `${brokenImages.length} broken images found` : undefined
      };
    } catch (error) {
      return {
        name: 'Asset Loading',
        duration: 0,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async runAllTests(): Promise<TestResult[]> {
    const lazyLoadingResult = await this.testLazyLoading();
    const assetLoadingResult = this.testAssetLoading();
    
    return [lazyLoadingResult, assetLoadingResult];
  }

  // Utility methods
  getVitalStatus(metric: keyof WebVitalsMetrics, value: number): VitalStatus {
    const thresholds = {
      lcp: { good: 2500, poor: 4000 },
      cls: { good: 0.1, poor: 0.25 },
      fid: { good: 100, poor: 300 },
      ttfb: { good: 800, poor: 1800 },
      fcp: { good: 1800, poor: 3000 }
    };
    
    const threshold = thresholds[metric];
    if (value <= threshold.good) return 'good';
    if (value <= threshold.poor) return 'needs-improvement';
    return 'poor';
  }

  formatValue(metric: keyof WebVitalsMetrics, value: number): string {
    if (metric === 'cls') return value.toFixed(3);
    return `${Math.round(value)}ms`;
  }

  getPerformanceScore(): number {
    if (!this.performanceData) return 0;
    
    let score = 100;
    const data = this.performanceData;
    
    // Deduct points for poor metrics
    if (data.pageLoadTime > 3000) score -= 20;
    if (data.memoryUsage > 100) score -= 15;
    if (data.errorCount > 0) score -= 10;
    if (data.networkStatus === 'offline') score -= 20;
    
    return Math.max(0, score);
  }

  // Storage utilities
  private getStoredErrors(): any[] {
    try {
      return JSON.parse(localStorage.getItem('app_errors') || '[]');
    } catch {
      return [];
    }
  }

  clearMetrics() {
    this.metrics = {};
    this.performanceData = null;
    if (typeof performance !== 'undefined') {
      performance.clearMarks();
      performance.clearMeasures();
    }
  }

  cleanup() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.clearMetrics();
  }
}

// Export singleton instance
export const performanceMonitor = UnifiedPerformanceMonitor.getInstance();