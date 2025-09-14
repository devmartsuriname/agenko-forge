/**
 * Optimized Performance Monitor with Reduced Overhead
 * Phase 4: Runtime Error Resolution - Performance optimization
 */

import { logger } from './logger';

interface OptimizedPerformanceData {
  lcp: number;
  cls: number;
  fid: number;
  resourceCount: number;
  errorCount: number;
  timestamp: string;
}

class OptimizedPerformanceMonitor {
  private static instance: OptimizedPerformanceMonitor;
  private metrics: Map<string, number> = new Map();
  private observers: PerformanceObserver[] = [];
  private isInitialized = false;
  private warningThreshold = 5000; // 5 seconds
  private lastWarningTime = 0;
  private warningCooldown = 300000; // 5 minutes between warnings

  private constructor() {
    // Lazy initialization to avoid overhead
  }

  static getInstance(): OptimizedPerformanceMonitor {
    if (!OptimizedPerformanceMonitor.instance) {
      OptimizedPerformanceMonitor.instance = new OptimizedPerformanceMonitor();
    }
    return OptimizedPerformanceMonitor.instance;
  }

  initialize() {
    if (this.isInitialized || typeof window === 'undefined' || !('PerformanceObserver' in window)) {
      return;
    }

    try {
      // Only observe critical performance entries
      this.initializeCriticalObservers();
      this.isInitialized = true;
    } catch (error) {
      logger.error('Failed to initialize optimized performance monitor', error);
    }
  }

  private initializeCriticalObservers() {
    // Resource timing observer with throttling
    const resourceObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries() as PerformanceResourceTiming[];
      this.handleResourceEntries(entries);
    });
    
    resourceObserver.observe({ type: 'resource', buffered: false }); // Don't buffer old entries
    this.observers.push(resourceObserver);

    // Navigation timing (only once)
    const navObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'navigation') {
          this.handleNavigationEntry(entry as PerformanceNavigationTiming);
          navObserver.disconnect(); // One-time observation
        }
      }
    });
    navObserver.observe({ type: 'navigation', buffered: true });
  }

  private handleResourceEntries(entries: PerformanceResourceTiming[]) {
    const now = Date.now();
    
    // Throttle warnings to prevent spam
    if (now - this.lastWarningTime < this.warningCooldown) {
      return;
    }

    const slowResources = entries.filter(entry => entry.duration > this.warningThreshold);
    
    if (slowResources.length > 0) {
      // Only warn for truly problematic resources (>8s) and limit frequency
      const criticalResources = slowResources.filter(r => r.duration > 8000);
      if (criticalResources.length > 0) {
        logger.warn('Critical slow resources detected', {
          count: criticalResources.length,
          slowest: Math.round(Math.max(...criticalResources.map(r => r.duration))),
          resources: criticalResources.slice(0, 3).map(r => ({ name: r.name, duration: Math.round(r.duration) }))
        });
        this.lastWarningTime = now;
      }
    }

    // Update metrics efficiently
    this.metrics.set('resourceCount', entries.length);
  }

  private handleNavigationEntry(entry: PerformanceNavigationTiming) {
    const loadTime = entry.loadEventEnd - entry.fetchStart;
    const ttfb = entry.responseStart - entry.requestStart;
    
    this.metrics.set('pageLoadTime', loadTime);
    this.metrics.set('ttfb', ttfb);
  }

  // Lightweight metric collection
  getBasicMetrics(): OptimizedPerformanceData {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    return {
      lcp: this.metrics.get('lcp') || 0,
      cls: this.metrics.get('cls') || 0,
      fid: this.metrics.get('fid') || 0,
      resourceCount: this.metrics.get('resourceCount') || 0,
      errorCount: this.getErrorCount(),
      timestamp: new Date().toISOString()
    };
  }

  private getErrorCount(): number {
    try {
      const stored = sessionStorage.getItem('app_error_count');
      return stored ? parseInt(stored, 10) : 0;
    } catch {
      return 0;
    }
  }

  recordError() {
    try {
      const current = this.getErrorCount();
      sessionStorage.setItem('app_error_count', (current + 1).toString());
    } catch {
      // Silently fail if storage is not available
    }
  }

  cleanup() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.metrics.clear();
    this.isInitialized = false;
  }
}

// Export singleton with lazy initialization
export const optimizedPerformanceMonitor = OptimizedPerformanceMonitor.getInstance();

// Initialize only when needed
export const initOptimizedPerformanceMonitoring = () => {
  if (typeof window !== 'undefined') {
    // Delay initialization to avoid blocking startup
    setTimeout(() => {
      optimizedPerformanceMonitor.initialize();
    }, 1000);
  }
};