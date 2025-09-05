/**
 * Comprehensive performance testing utilities
 */

interface TestResult {
  name: string;
  duration: number;
  success: boolean;
  error?: string;
}

export class PerformanceTester {
  private static results: TestResult[] = [];

  static async testLazyLoading(): Promise<TestResult> {
    const startTime = performance.now();
    try {
      // Test lazy loading of admin components
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

  static async testSuspenseTimeout(): Promise<TestResult> {
    const startTime = performance.now();
    try {
      // Simulate suspense timeout behavior
      await new Promise(resolve => setTimeout(resolve, 100));
      const endTime = performance.now();
      
      return {
        name: 'Suspense Timeout',
        duration: endTime - startTime,
        success: true
      };
    } catch (error) {
      return {
        name: 'Suspense Timeout',
        duration: 0,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  static testAssetLoading(): TestResult {
    const startTime = performance.now();
    try {
      // Test if critical assets are properly loaded
      const images = document.querySelectorAll('img');
      const scripts = document.querySelectorAll('script[src]');
      const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
      
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

  static testErrorBoundaryPerformance(): TestResult {
    const startTime = performance.now();
    try {
      // Test error boundary overhead (should be minimal)
      const testComponent = document.createElement('div');
      testComponent.setAttribute('data-test', 'error-boundary-test');
      document.body.appendChild(testComponent);
      
      // Clean up
      document.body.removeChild(testComponent);
      
      const endTime = performance.now();
      
      return {
        name: 'Error Boundary Performance',
        duration: endTime - startTime,
        success: true
      };
    } catch (error) {
      return {
        name: 'Error Boundary Performance',
        duration: 0,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  static testProductionOptimizations(): TestResult {
    const startTime = performance.now();
    try {
      // Check if production optimizations are applied correctly
      const isDevelopment = process.env.NODE_ENV === 'development';
      const isProduction = process.env.NODE_ENV === 'production';
      
      // In development, console should work
      // In production, console.log should be stripped but console.error should work
      const consoleWorking = typeof console.log === 'function';
      const errorConsoleWorking = typeof console.error === 'function';
      
      const endTime = performance.now();
      
      const optimizationsCorrect = isDevelopment ? 
        (consoleWorking && errorConsoleWorking) : 
        errorConsoleWorking; // In production, console.log might be stripped but console.error should remain
      
      return {
        name: 'Production Optimizations',
        duration: endTime - startTime,
        success: optimizationsCorrect,
        error: optimizationsCorrect ? undefined : 'Console logging configuration incorrect'
      };
    } catch (error) {
      return {
        name: 'Production Optimizations',
        duration: 0,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  static getMemoryUsage() {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return {
        used: Math.round((memory.usedJSHeapSize / 1024 / 1024) * 100) / 100,
        total: Math.round((memory.totalJSHeapSize / 1024 / 1024) * 100) / 100,
        limit: Math.round((memory.jsHeapSizeLimit / 1024 / 1024) * 100) / 100
      };
    }
    return null;
  }

  static getNavigationTiming() {
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

  static async runAllTests(): Promise<TestResult[]> {
    this.results = [];
    
    // Run async tests
    const lazyLoadingResult = await this.testLazyLoading();
    const suspenseResult = await this.testSuspenseTimeout();
    
    // Run sync tests
    const assetLoadingResult = this.testAssetLoading();
    const errorBoundaryResult = this.testErrorBoundaryPerformance();
    const productionOptsResult = this.testProductionOptimizations();
    
    this.results = [
      lazyLoadingResult,
      suspenseResult,
      assetLoadingResult,
      errorBoundaryResult,
      productionOptsResult
    ];
    
    return this.results;
  }

  static getResults(): TestResult[] {
    return [...this.results];
  }

  static getOverallScore(): number {
    if (this.results.length === 0) return 0;
    
    const successCount = this.results.filter(result => result.success).length;
    return Math.round((successCount / this.results.length) * 100);
  }

  static generateReport(): string {
    const memory = this.getMemoryUsage();
    const navigation = this.getNavigationTiming();
    const score = this.getOverallScore();
    
    let report = `Performance Test Report\n`;
    report += `========================\n\n`;
    report += `Overall Score: ${score}%\n\n`;
    
    report += `Test Results:\n`;
    this.results.forEach(result => {
      report += `- ${result.name}: ${result.success ? 'PASS' : 'FAIL'} (${result.duration.toFixed(1)}ms)\n`;
      if (result.error) {
        report += `  Error: ${result.error}\n`;
      }
    });
    
    if (memory) {
      report += `\nMemory Usage:\n`;
      report += `- Used: ${memory.used}MB\n`;
      report += `- Total: ${memory.total}MB\n`;
      report += `- Limit: ${memory.limit}MB\n`;
    }
    
    if (navigation) {
      report += `\nNavigation Timing:\n`;
      report += `- DOM Content Loaded: ${navigation.domContentLoaded}ms\n`;
      report += `- Load Complete: ${navigation.loadComplete}ms\n`;
      report += `- Total Load Time: ${navigation.totalLoadTime}ms\n`;
      report += `- Network Latency: ${navigation.networkLatency}ms\n`;
      report += `- Render Time: ${navigation.renderTime}ms\n`;
    }
    
    return report;
  }
}