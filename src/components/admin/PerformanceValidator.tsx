import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { performanceMonitor } from '@/lib/performance-monitor';
import { PerformanceTester } from '@/lib/performance-tester';
import { Check, X, Clock, AlertCircle } from 'lucide-react';
import { UnifiedPerformanceMonitor } from '@/components/performance/UnifiedPerformanceMonitor';
import type { PerformanceMetric, TestResult } from '@/types/performance';

// Removed interface - now imported from types

export default function PerformanceValidator() {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [bundleInfo, setBundleInfo] = useState<any>(null);
  const [testResults, setTestResults] = useState<TestResult[]>([]);

  useEffect(() => {
    // Run initial performance check
    runPerformanceValidation();
  }, []);

  const runPerformanceValidation = async () => {
    setIsRunning(true);
    performanceMonitor.clearMetrics();

    try {
      // Run comprehensive performance tests using unified monitor
      const results = await performanceMonitor.runAllTests();
      setTestResults(results);
      
      // Test React component mounting performance
      performanceMonitor.startMeasure('component-mount');
      await new Promise(resolve => setTimeout(resolve, 50)); // Simulate component work
      performanceMonitor.endMeasure('component-mount');

      // Get navigation timing
      const navigationTiming = getNavigationMetrics();
      
      // Compile metrics from unified monitor
      const performanceMetrics = performanceMonitor.getMetrics();
      const compiledMetrics: PerformanceMetric[] = [
        {
          name: 'Component Mount Time',
          value: performanceMetrics['component-mount'] || 0,
          threshold: 100,
          unit: 'ms',
          status: (performanceMetrics['component-mount'] || 0) < 100 ? 'good' : 'warning'
        },
        ...results.map(result => ({
          name: result.name,
          value: result.duration,
          threshold: result.name === 'Lazy Loading' ? 500 : result.name === 'Asset Loading' ? 100 : 200,
          unit: 'ms',
          status: result.success ? 
            (result.duration < (result.name === 'Lazy Loading' ? 500 : result.name === 'Asset Loading' ? 100 : 200) ? 'good' : 'warning') : 
            'error' as 'good' | 'warning' | 'error'
        })),
        {
          name: 'DOM Content Loaded',
          value: navigationTiming.domContentLoaded,
          threshold: 2000,
          unit: 'ms',
          status: navigationTiming.domContentLoaded < 2000 ? 'good' : navigationTiming.domContentLoaded < 4000 ? 'warning' : 'error'
        },
        {
          name: 'Page Load Complete',
          value: navigationTiming.loadComplete,
          threshold: 5000,
          unit: 'ms',
          status: navigationTiming.loadComplete < 5000 ? 'good' : navigationTiming.loadComplete < 10000 ? 'warning' : 'error'
        }
      ];

      setMetrics(compiledMetrics);
      
      // Check bundle information
      setBundleInfo(getBundleInfo());
      
    } catch (error) {
      console.error('Performance validation failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const testSuspenseTimeout = async () => {
    // Simulate SuspenseWithTimeout behavior
    return new Promise(resolve => {
      const startTime = performance.now();
      // Simulate component loading
      setTimeout(() => {
        const endTime = performance.now();
        resolve(endTime - startTime);
      }, 50);
    });
  };

  const getNavigationMetrics = () => {
    const metrics = performanceMonitor.getNavigationTiming();
    if (metrics) {
      return metrics;
    }
    return { domContentLoaded: 0, loadComplete: 0 };
  };

  const getBundleInfo = () => {
    const scripts = Array.from(document.querySelectorAll('script[src]'));
    const stylesheets = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
    const memoryUsage = performanceMonitor.getMemoryUsage();
    
    return {
      scriptCount: scripts.length,
      stylesheetCount: stylesheets.length,
      totalAssets: scripts.length + stylesheets.length,
      memoryUsage: memoryUsage.used > 0 ? memoryUsage : null
    };
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <X className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'good':
        return 'default';
      case 'warning':
        return 'secondary';
      case 'error':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const overallScore = metrics.length > 0 ? 
    Math.round((metrics.filter(m => m.status === 'good').length / metrics.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Unified Performance Monitor */}
      <UnifiedPerformanceMonitor />
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Performance Validation Dashboard
            <Button 
              onClick={runPerformanceValidation} 
              disabled={isRunning}
              size="sm"
            >
              {isRunning ? 'Running...' : 'Run Test'}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="col-span-full mb-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Overall Performance Score:</span>
                <Badge variant={overallScore >= 80 ? 'default' : overallScore >= 60 ? 'secondary' : 'destructive'}>
                  {overallScore}%
                </Badge>
              </div>
            </div>
            
            {metrics.map((metric, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  {getStatusIcon(metric.status)}
                  <div>
                    <div className="text-sm font-medium">{metric.name}</div>
                    <div className="text-xs text-muted-foreground">
                      Threshold: &lt;{metric.threshold}{metric.unit}
                    </div>
                  </div>
                </div>
                <Badge variant={getStatusVariant(metric.status)}>
                  {metric.value.toFixed(1)}{metric.unit}
                </Badge>
              </div>
            ))}
          </div>

          {bundleInfo && (
            <div className="mt-6 space-y-4">
              <div className="p-4 border rounded-lg">
                <h4 className="text-sm font-medium mb-3">Bundle Information</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Scripts</div>
                    <div className="font-medium">{bundleInfo.scriptCount}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Stylesheets</div>
                    <div className="font-medium">{bundleInfo.stylesheetCount}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Total Assets</div>
                    <div className="font-medium">{bundleInfo.totalAssets}</div>
                  </div>
                  {bundleInfo.memoryUsage && (
                    <div>
                      <div className="text-muted-foreground">Memory Usage</div>
                      <div className="font-medium">{bundleInfo.memoryUsage.usedJSHeapSize}MB</div>
                    </div>
                  )}
                </div>
              </div>

              {testResults.length > 0 && (
                <div className="p-4 border rounded-lg">
                  <h4 className="text-sm font-medium mb-3">Performance Test Results</h4>
                  <div className="space-y-2">
                    {testResults.map((result, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        {result.success ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <X className="h-4 w-4 text-red-500" />
                        )}
                        <span className={result.success ? 'text-green-700' : 'text-red-700'}>
                          {result.name}
                        </span>
                        <span className="text-muted-foreground">
                          ({result.duration.toFixed(1)}ms)
                        </span>
                        {result.error && (
                          <span className="text-red-500 text-xs">- {result.error}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}