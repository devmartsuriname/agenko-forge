/**
 * Production Error Handler
 * Phase 5: Production Console Cleanup - Comprehensive error handling
 */

import { optimizedPerformanceMonitor } from './performance-optimized';

interface ErrorInfo {
  componentStack?: string;
  errorBoundary?: string;
}

class ProductionErrorHandler {
  private static instance: ProductionErrorHandler;
  private errorCount = 0;
  private maxErrors = 10;
  private errorCooldown = 60000; // 1 minute
  private lastErrorTime = 0;

  private constructor() {
    this.initializeGlobalErrorHandling();
  }

  static getInstance(): ProductionErrorHandler {
    if (!ProductionErrorHandler.instance) {
      ProductionErrorHandler.instance = new ProductionErrorHandler();
    }
    return ProductionErrorHandler.instance;
  }

  private initializeGlobalErrorHandling() {
    if (typeof window === 'undefined') return;

    // Handle uncaught JavaScript errors
    window.addEventListener('error', (event) => {
      this.handleError(event.error, {
        type: 'javascript',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        message: event.message
      });
    });

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError(event.reason, {
        type: 'promise',
        promise: 'unhandled rejection'
      });
    });

    // Handle React DOM manipulation errors specifically
    const originalRemoveChild = Element.prototype.removeChild;
    Element.prototype.removeChild = function(child) {
      try {
        if (this.contains(child)) {
          return originalRemoveChild.call(this, child);
        } else {
          // Silently handle the case where child is not actually a child
          if (process.env.NODE_ENV === 'development') {
            console.warn('Attempted to remove child that is not a child of this node');
          }
          return child;
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('removeChild error caught:', error);
        }
        return child;
      }
    };
  }

  handleError(error: any, context: any = {}) {
    const now = Date.now();
    
    // Throttle error reporting to prevent spam
    if (now - this.lastErrorTime < this.errorCooldown && this.errorCount >= this.maxErrors) {
      return;
    }

    this.errorCount++;
    this.lastErrorTime = now;

    // Update performance monitor
    optimizedPerformanceMonitor.recordError();

    // Only log in development or for critical errors
    if (process.env.NODE_ENV === 'development') {
      console.error('Production Error Handler:', error, context);
    } else {
      // In production, only log critical errors that affect user experience
      if (this.isCriticalError(error)) {
        console.error('Critical error:', error.message || error);
      }
    }

    // Store error for potential reporting
    this.storeError(error, context);
  }

  private isCriticalError(error: any): boolean {
    if (!error) return false;
    
    const message = error.message || error.toString();
    const criticalPatterns = [
      'Network Error',
      'Failed to fetch',
      'Script error',
      'ChunkLoadError',
      'Loading chunk'
    ];

    return criticalPatterns.some(pattern => message.includes(pattern));
  }

  private storeError(error: any, context: any) {
    try {
      const errorData = {
        message: error.message || error.toString(),
        stack: error.stack,
        context,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent
      };

      // Store in sessionStorage for debugging
      const stored = sessionStorage.getItem('app_errors') || '[]';
      const errors = JSON.parse(stored);
      
      // Keep only last 20 errors
      errors.push(errorData);
      if (errors.length > 20) {
        errors.shift();
      }
      
      sessionStorage.setItem('app_errors', JSON.stringify(errors));
    } catch (storageError) {
      // Silently fail if storage is not available
    }
  }

  // Reset error count periodically
  resetErrorCount() {
    this.errorCount = 0;
    this.lastErrorTime = 0;
  }

  getErrorStats() {
    return {
      errorCount: this.errorCount,
      lastErrorTime: this.lastErrorTime
    };
  }
}

// React Error Boundary hook
export const useErrorHandler = () => {
  const errorHandler = ProductionErrorHandler.getInstance();
  
  return {
    handleError: (error: Error, errorInfo?: ErrorInfo) => {
      errorHandler.handleError(error, {
        componentStack: errorInfo?.componentStack,
        errorBoundary: errorInfo?.errorBoundary
      });
    },
    getErrorStats: () => errorHandler.getErrorStats()
  };
};

// Initialize global error handler
export const initializeProductionErrorHandler = () => {
  if (typeof window !== 'undefined') {
    ProductionErrorHandler.getInstance();
  }
};

// Export singleton
export const productionErrorHandler = ProductionErrorHandler.getInstance();
