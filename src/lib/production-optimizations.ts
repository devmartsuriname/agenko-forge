/**
 * Production optimization utilities
 */

// Remove all development-only code in production
export function stripDevelopmentCode() {
  // Only strip console logs in production builds
  if (process.env.NODE_ENV === 'production') {
    // Remove console statements (handled by build process)
    console.log = () => {};
    console.warn = () => {};
    console.info = () => {};
    
    // Keep console.error for production debugging
  }
  // In development, preserve all console logging for debugging
}

// Initialize production optimizations
export function initializeProductionOptimizations() {
  // Only run in production to avoid development conflicts
  if (process.env.NODE_ENV !== 'production') {
    return;
  }

  try {
    stripDevelopmentCode();
    
    // Preload critical resources with error handling
    preloadCriticalAssets();
    
    // Initialize error reporting
    initializeErrorReporting();
    
    // Set up performance monitoring
    initializePerformanceMonitoring();
  } catch (error) {
    console.error('Production optimizations failed:', error);
  }
}

function preloadCriticalAssets() {
  // Only preload assets that actually exist
  const heroImages = [
    // Fix asset path to match actual location
    '/src/assets/hero-image.jpg',
  ];
  
  heroImages.forEach(src => {
    // Check if asset exists before preloading
    const img = new Image();
    img.onload = () => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      document.head.appendChild(link);
    };
    img.onerror = () => {
      console.warn(`Asset not found for preloading: ${src}`);
    };
    img.src = src;
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
  // Only run performance monitoring in production
  if (process.env.NODE_ENV !== 'production') {
    return;
  }

  try {
    // Monitor bundle size
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming;
            // Track page load metrics (only in production)
            if (process.env.NODE_ENV === 'production') {
              // Send to analytics service in production
              console.info('Page Load Metrics:', {
                domContentLoaded: navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart,
                loadComplete: navEntry.loadEventEnd - navEntry.loadEventStart,
                totalTime: navEntry.loadEventEnd - navEntry.fetchStart
              });
            }
          }
        }
      });
      
      observer.observe({ type: 'navigation', buffered: true });
    }
  } catch (error) {
    console.error('Performance monitoring failed:', error);
  }
}
