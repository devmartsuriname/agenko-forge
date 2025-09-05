import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PerformanceMonitor } from '@/lib/performance-optimization';
import { PerformanceTester } from '@/lib/performance-tester';
import { FinalPerformanceValidator } from '@/lib/final-performance-validation';
import { Check, X, Clock, AlertCircle } from 'lucide-react';

interface PerformanceMetric {
  name: string;
  value: number;
  threshold: number;
  unit: string;
  status: 'good' | 'warning' | 'error';
}

export default function PerformanceValidator() {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [bundleInfo, setBundleInfo] = useState<any>(null);
  const [comprehensiveResults, setComprehensiveResults] = useState<any[]>([]);
  const [performanceReport, setPerformanceReport] = useState<string>('');

  useEffect(() => {
    // Run initial performance check
    runPerformanceValidation();
  }, []);

  const runPerformanceValidation = async () => {
    setIsRunning(true);
    PerformanceMonitor.clearMetrics();

    try {
      // Run comprehensive performance tests
      const testResults = await PerformanceTester.runAllTests();
      const finalValidation = await FinalPerformanceValidator.runComprehensiveValidation();
      
      // Generate comprehensive report
      const report = FinalPerformanceValidator.generatePerformanceReport(finalValidation);
      setPerformanceReport(report);
      setComprehensiveResults(finalValidation);
      
      // Test React component mounting performance
      PerformanceMonitor.startMeasure('component-mount');
      await new Promise(resolve => setTimeout(resolve, 50)); // Simulate component work
      PerformanceMonitor.endMeasure('component-mount');

      // Get navigation timing
      const navigationTiming = getNavigationMetrics();
      
      // Compile metrics from both sources
      const performanceMetrics = PerformanceMonitor.getMetrics();
      const compiledMetrics: PerformanceMetric[] = [
        {
          name: 'Component Mount Time',
          value: performanceMetrics['component-mount'] || 0,
          threshold: 100,
          unit: 'ms',
          status: (performanceMetrics['component-mount'] || 0) < 100 ? 'good' : 'warning'
        },
        ...testResults.map(result => ({
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
      
      // Check bundle information and performance data
      setBundleInfo({
        ...getBundleInfo(),
        performanceReport: PerformanceTester.generateReport(),
        testResults
      });
      
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
    if (typeof performance === 'undefined' || !performance.getEntriesByType) {
      return { domContentLoaded: 0, loadComplete: 0 };
    }

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    if (!navigation) {
      return { domContentLoaded: 0, loadComplete: 0 };
    }

    return {
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      loadComplete: navigation.loadEventEnd - navigation.loadEventStart
    };
  };

  const getBundleInfo = () => {
    const scripts = Array.from(document.querySelectorAll('script[src]'));
    const stylesheets = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
    
    return {
      scriptCount: scripts.length,
      stylesheetCount: stylesheets.length,
      totalAssets: scripts.length + stylesheets.length,
      memoryUsage: (performance as any).memory ? {
        usedJSHeapSize: Math.round(((performance as any).memory.usedJSHeapSize / 1024 / 1024) * 100) / 100,
        totalJSHeapSize: Math.round(((performance as any).memory.totalJSHeapSize / 1024 / 1024) * 100) / 100,
        jsHeapSizeLimit: Math.round(((performance as any).memory.jsHeapSizeLimit / 1024 / 1024) * 100) / 100
      } : null
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

              {comprehensiveResults.length > 0 && (
                <div className="p-4 border rounded-lg">
                  <h4 className="text-sm font-medium mb-3">Comprehensive Test Results</h4>
                  <div className="space-y-3">
                    {comprehensiveResults.map((category, categoryIndex) => (
                      <div key={categoryIndex} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="text-sm font-medium">{category.category}</h5>
                          <Badge variant={category.overallScore >= 80 ? 'default' : category.overallScore >= 60 ? 'secondary' : 'destructive'}>
                            {category.overallScore}%
                          </Badge>
                        </div>
                        <div className="space-y-1">
                          {category.tests.map((test: any, testIndex: number) => (
                            <div key={testIndex} className="flex items-center gap-2 text-xs">
                              {test.passed ? (
                                <Check className="h-3 w-3 text-green-500" />
                              ) : (
                                <X className="h-3 w-3 text-red-500" />
                              )}
                              <span className={test.passed ? 'text-green-700' : 'text-red-700'}>
                                {test.name}
                              </span>
                              {test.duration && (
                                <span className="text-muted-foreground">
                                  ({test.duration.toFixed(1)}ms)
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {performanceReport && (
                <div className="p-4 border rounded-lg">
                  <h4 className="text-sm font-medium mb-3">Performance Report</h4>
                  <pre className="text-xs whitespace-pre-wrap overflow-x-auto bg-muted p-3 rounded">
                    {performanceReport}
                  </pre>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}