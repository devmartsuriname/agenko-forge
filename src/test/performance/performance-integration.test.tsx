/**
 * Phase 6: Performance Integration Tests
 * Tests all performance optimizations implemented in phases 1-5
 */

import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { PerformanceTester } from '@/lib/performance-tester';
import { FinalPerformanceValidator } from '@/lib/final-performance-validation';
import Index from '@/pages/Index';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: () => ({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ 
            data: { 
              id: '1', 
              title: 'Home', 
              slug: 'home',
              body: { sections: [] },
              status: 'published' 
            }, 
            error: null 
          })
        }),
        order: () => Promise.resolve({ data: [], error: null })
      })
    })
  }
}));

function TestWrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: 0 },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
}

describe('Phase 6: Performance Integration Tests', () => {
  beforeEach(() => {
    // Reset performance observers
    vi.clearAllMocks();
    
    // Mock performance API
    Object.defineProperty(global, 'performance', {
      writable: true,
      value: {
        ...performance,
        getEntriesByType: vi.fn(() => []),
        mark: vi.fn(),
        measure: vi.fn()
      }
    });
  });

  describe('Core Performance Metrics', () => {
    test('lazy loading performs within acceptable limits', async () => {
      const result = await PerformanceTester.testLazyLoading();
      
      expect(result.success).toBe(true);
      expect(result.duration).toBeLessThan(1000); // Should load within 1s
      expect(result.error).toBeUndefined();
    });

    test('suspense timeout handling works correctly', async () => {
      const result = await PerformanceTester.testSuspenseTimeout();
      
      expect(result.success).toBe(true);
      expect(result.name).toBe('Suspense Timeout Test');
    });

    test('asset loading is optimized', () => {
      const result = PerformanceTester.testAssetLoading();
      
      expect(result.success).toBe(true);
      expect(result.name).toBe('Asset Loading Test');
    });

    test('error boundary overhead is minimal', () => {
      const result = PerformanceTester.testErrorBoundaryPerformance();
      
      expect(result.success).toBe(true);
      expect(result.duration).toBeLessThan(100); // Should be very fast
    });

    test('production optimizations are active', () => {
      const result = PerformanceTester.testProductionOptimizations();
      
      expect(result.success).toBe(true);
      expect(result.name).toBe('Production Optimizations Test');
    });
  });

  describe('Memory Management', () => {
    test('memory usage stays within bounds', () => {
      const memoryUsage = PerformanceTester.getMemoryUsage();
      
      if (memoryUsage) {
        expect(memoryUsage.used).toBeLessThan(100 * 1024 * 1024); // < 100MB
        expect(memoryUsage.total).toBeLessThan(200 * 1024 * 1024); // < 200MB
      }
    });

    test('navigation timing is optimal', () => {
      const timing = PerformanceTester.getNavigationTiming();
      
      expect(timing.domContentLoaded).toBeGreaterThan(0);
      expect(timing.loadComplete).toBeGreaterThan(timing.domContentLoaded);
    });
  });

  describe('Component Performance', () => {
    test('homepage renders without performance issues', async () => {
      const startTime = performance.now();
      
      const { container } = render(
        <TestWrapper>
          <Index />
        </TestWrapper>
      );

      // Wait for component to stabilize
      await new Promise(resolve => setTimeout(resolve, 100));

      const renderTime = performance.now() - startTime;
      expect(renderTime).toBeLessThan(1000); // Should render within 1s
      expect(container.querySelector('main')).toBeInTheDocument();
    });

    test('no console errors during render', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      const { container } = render(
        <TestWrapper>
          <Index />
        </TestWrapper>
      );

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(consoleSpy).not.toHaveBeenCalled();
      expect(container.querySelector('main')).toBeInTheDocument();
      consoleSpy.mockRestore();
    });
  });

  describe('Final Validation Integration', () => {
    test('comprehensive validation passes', async () => {
      const results = await FinalPerformanceValidator.runComprehensiveValidation();
      
      expect(results).toBeInstanceOf(Array);
      expect(results.length).toBeGreaterThan(0);
      
      // Check that most categories pass
      const passedCategories = results.filter(r => r.overallScore >= 70);
      expect(passedCategories.length).toBeGreaterThan(results.length * 0.7); // 70% should pass
    });

    test('cache behavior validation works', async () => {
      const cacheResult = await FinalPerformanceValidator.validateCacheBehavior();
      
      expect(cacheResult).toHaveProperty('cacheHitRate');
      expect(cacheResult).toHaveProperty('serviceWorkerActive');
      expect(cacheResult).toHaveProperty('backgroundRefreshWorking');
    });

    test('cross-device validation completes', async () => {
      const deviceResult = await FinalPerformanceValidator.validateCrossDevicePerformance();
      
      expect(deviceResult).toHaveProperty('mobileOptimized');
      expect(deviceResult).toHaveProperty('touchFriendly');
      expect(deviceResult).toHaveProperty('responsiveDesign');
      expect(deviceResult).toHaveProperty('networkTolerant');
    });
  });

  describe('Overall System Health', () => {
    test('performance tester generates valid report', () => {
      const report = PerformanceTester.generateReport();
      
      expect(typeof report).toBe('string');
      expect(report).toContain('Performance Test Report');
      expect(report.length).toBeGreaterThan(100);
    });

    test('overall performance score is acceptable', () => {
      const score = PerformanceTester.getOverallScore();
      
      expect(score).toBeGreaterThanOrEqual(70); // Minimum 70% performance score
      expect(score).toBeLessThanOrEqual(100);
    });
  });
});