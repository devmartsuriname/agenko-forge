// Performance optimization utilities
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  // Initialize all performance optimizations
  initialize() {
    if (typeof window === 'undefined') return;
    
    this.measureCoreWebVitals();
    this.preloadCriticalResources();
    this.addResourceHints();
    
    console.log('Performance monitoring initialized');
  }

  private measureCoreWebVitals() {
    if (typeof window === 'undefined') return;

    // Simple performance tracking
    const navigationStart = performance.timeOrigin;
    const domContentLoaded = performance.getEntriesByType('navigation')[0];
    
    if (domContentLoaded) {
      console.log('Page load performance:', {
        domContentLoaded: (domContentLoaded as PerformanceNavigationTiming).domContentLoadedEventEnd - navigationStart,
        loadComplete: (domContentLoaded as PerformanceNavigationTiming).loadEventEnd - navigationStart
      });
    }
  }

  private preloadCriticalResources() {
    const criticalResources = ['/logo.png'];
    criticalResources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource;
      link.as = 'image';
      document.head.appendChild(link);
    });
  }

  private addResourceHints() {
    const hints = [
      { rel: 'dns-prefetch', href: 'https://dvgubqqjvmsepkilnkak.supabase.co' },
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    ];

    hints.forEach(hint => {
      const link = document.createElement('link');
      link.rel = hint.rel;
      link.href = hint.href;
      document.head.appendChild(link);
    });
  }
}

// Legacy export to fix build error
export const injectHeroPreload = () => {
  // Placeholder function for backwards compatibility
};