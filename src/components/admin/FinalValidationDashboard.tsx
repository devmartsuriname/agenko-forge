/**
 * Final Performance Validation Dashboard - Phase 6
 * Comprehensive validation interface for the complete performance optimization
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Clock, 
  Zap, 
  Shield, 
  Globe, 
  Monitor,
  Activity,
  Download
} from 'lucide-react';
import { FinalPerformanceValidator } from '@/lib/final-performance-validation';

interface ValidationResults {
  comprehensive: any[];
  cache: any;
  crossDevice: any;
  timestamp: string;
}

export function FinalValidationDashboard() {
  const [results, setResults] = useState<ValidationResults | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);

  const runValidation = async () => {
    setIsRunning(true);
    setProgress(0);

    try {
      // Run comprehensive validation
      setProgress(25);
      const comprehensive = await FinalPerformanceValidator.runComprehensiveValidation();
      
      setProgress(50);
      const cache = await FinalPerformanceValidator.validateCacheBehavior();
      
      setProgress(75);
      const crossDevice = await FinalPerformanceValidator.validateCrossDevicePerformance();
      
      setProgress(100);

      setResults({
        comprehensive,
        cache,
        crossDevice,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Validation failed:', error);
    } finally {
      setIsRunning(false);
      setProgress(0);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'fail': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'pass': return 'default' as const;
      case 'warning': return 'secondary' as const;
      case 'fail': return 'destructive' as const;
      default: return 'outline' as const;
    }
  };

  const downloadReport = () => {
    if (!results) return;
    
    const report = FinalPerformanceValidator.generatePerformanceReport(results.comprehensive);
    const blob = new Blob([report], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-validation-${new Date().toISOString().split('T')[0]}.md`;
    
    // Use safer DOM manipulation
    try {
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      
      // Cleanup with error handling
      setTimeout(() => {
        try {
          if (document.body.contains(a)) {
            document.body.removeChild(a);
          }
        } catch (error) {
          // Silently handle cleanup error
        }
      }, 100);
    } catch (error) {
      URL.revokeObjectURL(url);
      console.error('Download failed:', error);
    }
  };

  const overallScore = results?.comprehensive.reduce((sum, result) => sum + result.overallScore, 0) / (results?.comprehensive.length || 1) || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Final Performance Validation</h2>
          <p className="text-muted-foreground">Phase 6: Comprehensive system validation</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={runValidation} disabled={isRunning}>
            {isRunning ? (
              <>
                <Activity className="mr-2 h-4 w-4 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Zap className="mr-2 h-4 w-4" />
                Run Validation
              </>
            )}
          </Button>
          {results && (
            <Button variant="outline" onClick={downloadReport}>
              <Download className="mr-2 h-4 w-4" />
              Download Report
            </Button>
          )}
        </div>
      </div>

      {isRunning && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="mr-2 h-5 w-5 animate-spin" />
              Running Validation Tests...
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={progress} className="w-full" />
            <p className="text-sm text-muted-foreground mt-2">
              Testing system performance and optimization...
            </p>
          </CardContent>
        </Card>
      )}

      {results && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overall Score</CardTitle>
              <Monitor className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overallScore.toFixed(0)}%</div>
              <p className="text-xs text-muted-foreground">
                System performance rating
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cache Hit Rate</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{results.cache.cacheHitRate}%</div>
              <p className="text-xs text-muted-foreground">
                Cache efficiency
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Service Worker</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {results.cache.serviceWorkerActive ? '✅' : '❌'}
              </div>
              <p className="text-xs text-muted-foreground">
                Offline capability
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {results && (
        <Tabs defaultValue="performance" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="performance">Performance Tests</TabsTrigger>
            <TabsTrigger value="cache">Cache Behavior</TabsTrigger>
            <TabsTrigger value="device">Cross-Device</TabsTrigger>
          </TabsList>

          <TabsContent value="performance" className="space-y-4">
            <div className="grid gap-4">
              {results.comprehensive.map((category, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {category.category}
                      <Badge variant={category.overallScore >= 80 ? 'default' : category.overallScore >= 60 ? 'secondary' : 'destructive'}>
                        {category.overallScore}%
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {category.tests.map((test: any, testIndex: number) => (
                        <div key={testIndex} className="flex items-center justify-between p-2 rounded border">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(test.status)}
                            <span className="text-sm font-medium">{test.name}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant={getStatusVariant(test.status)}>
                              {test.status}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {test.duration.toFixed(1)}ms
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="cache" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Cache Performance</CardTitle>
                <CardDescription>
                  Analysis of caching behavior and efficiency
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex items-center justify-between p-3 rounded border">
                    <span className="font-medium">Background Refresh</span>
                    <Badge variant={results.cache.backgroundRefreshWorking ? 'default' : 'destructive'}>
                      {results.cache.backgroundRefreshWorking ? 'Working' : 'Failed'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded border">
                    <span className="font-medium">Deployment Invalidation</span>
                    <Badge variant={results.cache.deploymentInvalidationWorking ? 'default' : 'destructive'}>
                      {results.cache.deploymentInvalidationWorking ? 'Working' : 'Failed'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="device" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Cross-Device Compatibility</CardTitle>
                <CardDescription>
                  Mobile optimization and responsive design validation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex items-center justify-between p-3 rounded border">
                    <span className="font-medium">Mobile Optimized</span>
                    <Badge variant={results.crossDevice.mobileOptimized ? 'default' : 'destructive'}>
                      {results.crossDevice.mobileOptimized ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded border">
                    <span className="font-medium">Touch Friendly</span>
                    <Badge variant={results.crossDevice.touchFriendly ? 'default' : 'secondary'}>
                      {results.crossDevice.touchFriendly ? 'Yes' : 'Partial'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded border">
                    <span className="font-medium">Responsive Design</span>
                    <Badge variant={results.crossDevice.responsiveDesign ? 'default' : 'secondary'}>
                      {results.crossDevice.responsiveDesign ? 'Yes' : 'Basic'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded border">
                    <span className="font-medium">Network Tolerant</span>
                    <Badge variant={results.crossDevice.networkTolerant ? 'default' : 'destructive'}>
                      {results.crossDevice.networkTolerant ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {results && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Validation completed at {new Date(results.timestamp).toLocaleString()}.
            System performance: <strong>{overallScore >= 80 ? 'Excellent' : overallScore >= 60 ? 'Good' : 'Needs Improvement'}</strong>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}