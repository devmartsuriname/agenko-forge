/**
 * Production optimization utilities
 */

// Remove all development-only code in production
export function stripDevelopmentCode() {
  if (process.env.NODE_ENV === 'production') {
    // Remove console statements (handled by build process)
    console.log = () => {};
    console.warn = () => {};
    console.info = () => {};
    
    // Keep console.error for production debugging
  }
}

// Initialize production optimizations
export function initializeProductionOptimizations() {
  if (process.env.NODE_ENV === 'production') {
    stripDevelopmentCode();
    
    // Preload critical resources
    preloadCriticalAssets();
    
    // Initialize error reporting
    initializeErrorReporting();
    
    // Set up performance monitoring
    initializePerformanceMonitoring();
  }
}

function preloadCriticalAssets() {
  // Preload hero images
  const heroImages = [
    '/assets/hero-image.jpg',
    // Add other critical images
  ];
  
  heroImages.forEach(src => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    document.head.appendChild(link);
  });
}

function initializeErrorReporting() {
  // Set up global error handler
  window.addEventListener('error', (event) => {
    // Production error reporting would go here
    console.error('Production Error:', {
      message: event.error?.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      stack: event.error?.stack
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled Promise Rejection:', event.reason);
  });
}

function initializePerformanceMonitoring() {
  // Monitor Core Web Vitals (would require web-vitals package)
  // getCLS, getFID, getFCP, getLCP, getTTFB tracking would go here

  // Monitor bundle size
  if ('PerformanceObserver' in window) {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'navigation') {
          const navEntry = entry as PerformanceNavigationTiming;
          // Track page load metrics
          console.log('Page Load Metrics:', {
            domContentLoaded: navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart,
            loadComplete: navEntry.loadEventEnd - navEntry.loadEventStart,
            totalTime: navEntry.loadEventEnd - navEntry.fetchStart
          });
        }
      }
    });
    
    observer.observe({ type: 'navigation', buffered: true });
  }
}
