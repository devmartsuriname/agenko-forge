/**
 * Production optimization utilities with enhanced performance monitoring
 */

import { logger } from './logger';

// Performance metrics collection
interface PerformanceMetrics {
  pageLoadTime: number;
  domContentLoaded: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  bundleSize: number;
  memoryUsage: number;
}

// Remove all development-only code in production
export function stripDevelopmentCode() {
  if (process.env.NODE_ENV === 'production') {
    // Override console methods in production
    const noop = () => {};
    console.log = noop;
    console.info = noop;
    console.debug = noop;
    
    // Keep console.warn and console.error for production debugging
    // These will be filtered by our logger system
  }
}

// Initialize production optimizations
export function initializeProductionOptimizations() {
  try {
    logger.info('Initializing production optimizations', {
      env: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    });

    // Strip development code
    stripDevelopmentCode();
    
    // Preload critical resources
    preloadCriticalAssets();
    
    // Initialize error reporting
    initializeErrorReporting();
    
    // Set up performance monitoring
    initializePerformanceMonitoring();
    
    // Initialize bundle analysis
    initializeBundleAnalysis();
    
    // Set up memory monitoring
    initializeMemoryMonitoring();
    
    logger.info('Production optimizations initialized successfully');
  } catch (error) {
    logger.error('Production optimizations failed', error);
  }
}

function preloadCriticalAssets() {
  const assets = [
    { href: '/logo.png', as: 'image', type: 'image/png' },
    { href: '/favicon.ico', as: 'image', type: 'image/x-icon' }
  ];
  
  assets.forEach(({ href, as, type }) => {
    try {
      // Check if asset exists first
      fetch(href, { method: 'HEAD' })
        .then(response => {
          if (response.ok) {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = as;
            link.href = href;
            link.type = type;
            link.onload = () => logger.debug(`Asset preloaded: ${href}`);
            link.onerror = () => logger.warn(`Failed to preload asset: ${href}`);
            document.head.appendChild(link);
          }
        })
        .catch(() => {
          logger.warn(`Asset check failed: ${href}`);
        });
    } catch (error) {
      logger.error(`Error preloading asset ${href}`, error);
    }
  });
}

function initializeErrorReporting() {
  // Global error handler
  window.addEventListener('error', (event) => {
    logger.error('Global JavaScript Error', {
      message: event.error?.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      stack: event.error?.stack,
      timestamp: new Date().toISOString()
    });
  });

  // Unhandled promise rejection handler
  window.addEventListener('unhandledrejection', (event) => {
    logger.error('Unhandled Promise Rejection', {
      reason: event.reason,
      timestamp: new Date().toISOString()
    });
  });

  // React error boundary fallback
  window.addEventListener('reacterror', ((event: CustomEvent) => {
    logger.error('React Error Boundary', {
      error: event.detail.error,
      errorInfo: event.detail.errorInfo,
      timestamp: new Date().toISOString()
    });
  }) as EventListener);
}

function initializePerformanceMonitoring() {
  if (!('PerformanceObserver' in window)) {
    logger.warn('PerformanceObserver not supported');
    return;
  }

  try {
    // Navigation timing
    const navObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'navigation') {
          const navEntry = entry as PerformanceNavigationTiming;
          const metrics: PerformanceMetrics = {
            pageLoadTime: navEntry.loadEventEnd - navEntry.fetchStart,
            domContentLoaded: navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart,
            firstContentfulPaint: 0,
            largestContentfulPaint: 0,
            bundleSize: 0,
            memoryUsage: getMemoryUsage()
          };
          
          logger.perf('Navigation Performance', metrics);
          
          // In production, send to analytics
          if (process.env.NODE_ENV === 'production') {
            reportPerformanceMetrics(metrics);
          }
        }
      }
    });
    
    navObserver.observe({ type: 'navigation', buffered: true });

    // Paint timing
    const paintObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const fcp = entries.find(entry => entry.name === 'first-contentful-paint');
      const lcp = entries.find(entry => entry.name === 'largest-contentful-paint');
      
      if (fcp || lcp) {
        logger.perf('Paint Performance', {
          firstContentfulPaint: fcp?.startTime || 0,
          largestContentfulPaint: lcp?.startTime || 0
        });
      }
    });
    
    paintObserver.observe({ type: 'paint', buffered: true });

    // Resource timing
    const resourceObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries() as PerformanceResourceTiming[];
      const slowResources = entries.filter(entry => entry.duration > 1000);
      
      if (slowResources.length > 0) {
        logger.warn('Slow resources detected', {
          count: slowResources.length,
          resources: slowResources.map(r => ({ name: r.name, duration: r.duration }))
        });
      }
    });
    
    resourceObserver.observe({ type: 'resource', buffered: true });

  } catch (error) {
    logger.error('Performance monitoring setup failed', error);
  }
}

function initializeBundleAnalysis() {
  // Analyze initial bundle size
  if ('performance' in window && 'getEntriesByType' in performance) {
    try {
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      const jsResources = resources.filter(r => r.name.includes('.js'));
      const cssResources = resources.filter(r => r.name.includes('.css'));
      
      const totalJSSize = jsResources.reduce((total, resource) => {
        return total + (resource.transferSize || 0);
      }, 0);
      
      const totalCSSSize = cssResources.reduce((total, resource) => {
        return total + (resource.transferSize || 0);
      }, 0);
      
      logger.perf('Bundle Analysis', {
        totalJSSize: Math.round(totalJSSize / 1024) + 'KB',
        totalCSSSize: Math.round(totalCSSSize / 1024) + 'KB',
        jsFiles: jsResources.length,
        cssFiles: cssResources.length
      });
      
      // Warn if bundle is too large
      if (totalJSSize > 500 * 1024) { // 500KB
        logger.warn('Large JavaScript bundle detected', {
          size: Math.round(totalJSSize / 1024) + 'KB'
        });
      }
    } catch (error) {
      logger.error('Bundle analysis failed', error);
    }
  }
}

function initializeMemoryMonitoring() {
  // Monitor memory usage periodically
  if ('memory' in performance) {
    const checkMemory = () => {
      try {
        const memory = (performance as any).memory;
        const memoryMB = Math.round(memory.usedJSHeapSize / 1024 / 1024);
        
        logger.perf('Memory Usage', {
          used: memoryMB + 'MB',
          total: Math.round(memory.totalJSHeapSize / 1024 / 1024) + 'MB',
          limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024) + 'MB'
        });
        
        // Warn if memory usage is very high (increased threshold for modern web apps)
        if (memoryMB > 300) {
          logger.warn('High memory usage detected', { usage: memoryMB + 'MB' });
        }
      } catch (error) {
        logger.error('Memory monitoring failed', error);
      }
    };
    
    // Check memory every 30 seconds in development, 5 minutes in production
    const interval = process.env.NODE_ENV === 'development' ? 30000 : 300000;
    setInterval(checkMemory, interval);
    
    // Initial check
    setTimeout(checkMemory, 5000);
  }
}

function getMemoryUsage(): number {
  try {
    if ('memory' in performance) {
      return Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024);
    }
  } catch (error) {
    logger.error('Failed to get memory usage', error);
  }
  return 0;
}

function reportPerformanceMetrics(metrics: PerformanceMetrics) {
  // In production, this would send to analytics service
  if (process.env.NODE_ENV === 'production') {
    try {
      // Store metrics for later analysis
      const perfHistory = JSON.parse(localStorage.getItem('perf_metrics') || '[]');
      perfHistory.push({
        ...metrics,
        timestamp: new Date().toISOString(),
        url: window.location.pathname
      });
      
      // Keep only last 20 entries
      if (perfHistory.length > 20) {
        perfHistory.splice(0, perfHistory.length - 20);
      }
      
      localStorage.setItem('perf_metrics', JSON.stringify(perfHistory));
    } catch (error) {
      logger.error('Failed to store performance metrics', error);
    }
  }
}

// Export utilities for external use
export const productionUtils = {
  getStoredErrors: () => {
    try {
      return JSON.parse(localStorage.getItem('app_errors') || '[]');
    } catch {
      return [];
    }
  },
  
  getStoredMetrics: () => {
    try {
      return JSON.parse(localStorage.getItem('perf_metrics') || '[]');
    } catch {
      return [];
    }
  },
  
  clearStoredData: () => {
    try {
      localStorage.removeItem('app_errors');
      localStorage.removeItem('perf_metrics');
      localStorage.removeItem('admin_audit');
      logger.info('Stored performance data cleared');
    } catch (error) {
      logger.error('Failed to clear stored data', error);
    }
  }
};
