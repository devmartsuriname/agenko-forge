/**
 * Performance optimization utilities for production
 */

// Bundle analyzer for production builds
export function analyzeBundleSize() {
  if (process.env.NODE_ENV === 'production') {
    // Bundle size analysis would be implemented here
    return {
      totalSize: 0,
      chunkSizes: {},
      recommendations: []
    };
  }
  return null;
}

// Preload critical resources
export function preloadCriticalResources() {
  if (typeof document === 'undefined') return;

  // Preload critical fonts
  const fontLink = document.createElement('link');
  fontLink.rel = 'preload';
  fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap';
  fontLink.as = 'style';
  document.head.appendChild(fontLink);
}

// Optimize images based on device capabilities
export function getOptimalImageFormat(): 'webp' | 'avif' | 'jpeg' {
  if (typeof window === 'undefined') return 'jpeg';

  // Check for AVIF support
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  const supportsAVIF = canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0;
  
  if (supportsAVIF) return 'avif';
  
  // Check for WebP support
  const supportsWebP = canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  
  return supportsWebP ? 'webp' : 'jpeg';
}

// Memory cleanup for large datasets
export function cleanupMemory() {
  if (typeof window !== 'undefined' && 'gc' in window) {
    // Trigger garbage collection if available (Chrome with --js-flags="--expose-gc")
    (window as any).gc();
  }
}

// Performance monitoring
export class PerformanceMonitor {
  private static metrics: Record<string, number> = {};

  static startMeasure(name: string) {
    if (typeof performance !== 'undefined') {
      performance.mark(`${name}-start`);
    }
  }

  static endMeasure(name: string) {
    if (typeof performance !== 'undefined') {
      performance.mark(`${name}-end`);
      performance.measure(name, `${name}-start`, `${name}-end`);
      
      const measure = performance.getEntriesByName(name)[0];
      this.metrics[name] = measure.duration;
    }
  }

  static getMetrics() {
    return { ...this.metrics };
  }

  static clearMetrics() {
    this.metrics = {};
    if (typeof performance !== 'undefined') {
      performance.clearMarks();
      performance.clearMeasures();
    }
  }
}