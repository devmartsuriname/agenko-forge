import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Activity, 
  Zap, 
  Database, 
  Wifi, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  BarChart3,
  Trash2
} from 'lucide-react';
import { logger } from '@/lib/logger';
import { productionUtils } from '@/lib/production-optimizations';

interface PerformanceData {
  pageLoadTime: number;
  memoryUsage: number;
  networkStatus: 'online' | 'offline';
  bundleSize: number;
  errorCount: number;
  lastUpdate: string;
}

export const PerformanceMonitor: React.FC = () => {
  const [performanceData, setPerformanceData] = useState<PerformanceData>({
    pageLoadTime: 0,
    memoryUsage: 0,
    networkStatus: 'online',
    bundleSize: 0,
    errorCount: 0,
    lastUpdate: new Date().toISOString()
  });

  const [isVisible, setIsVisible] = useState(false);
  const [storedErrors, setStoredErrors] = useState<any[]>([]);
  const [storedMetrics, setStoredMetrics] = useState<any[]>([]);

  useEffect(() => {
    // Only show in development or when specifically enabled
    const showMonitor = 
      process.env.NODE_ENV === 'development' || 
      localStorage.getItem('show_performance_monitor') === 'true';
    
    setIsVisible(showMonitor);

    if (!showMonitor) return;

    const updatePerformanceData = () => {
      try {
        // Get memory usage
        const memory = (performance as any).memory;
        const memoryMB = memory ? Math.round(memory.usedJSHeapSize / 1024 / 1024) : 0;

        // Get page load time
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        const loadTime = navigation ? navigation.loadEventEnd - navigation.fetchStart : 0;

        // Get network status
        const networkStatus = navigator.onLine ? 'online' : 'offline';

        // Get stored errors count
        const errors = productionUtils.getStoredErrors();
        
        setPerformanceData({
          pageLoadTime: Math.round(loadTime),
          memoryUsage: memoryMB,
          networkStatus,
          bundleSize: 0, // Will be updated by bundle analysis
          errorCount: errors.length,
          lastUpdate: new Date().toISOString()
        });

        setStoredErrors(errors);
        setStoredMetrics(productionUtils.getStoredMetrics());

      } catch (error) {
        logger.error('Performance monitor update failed', error);
      }
    };

    // Update immediately and then every 10 seconds
    updatePerformanceData();
    const interval = setInterval(updatePerformanceData, 10000);

    return () => clearInterval(interval);
  }, []);

  const getPerformanceScore = (): { score: number; status: 'good' | 'warning' | 'poor' } => {
    let score = 100;
    
    // Deduct points for poor metrics
    if (performanceData.pageLoadTime > 3000) score -= 20;
    if (performanceData.memoryUsage > 100) score -= 15;
    if (performanceData.errorCount > 0) score -= 10;
    if (performanceData.networkStatus === 'offline') score -= 20;
    
    if (score >= 80) return { score, status: 'good' };
    if (score >= 60) return { score, status: 'warning' };
    return { score, status: 'poor' };
  };

  const clearStoredData = () => {
    productionUtils.clearStoredData();
    setStoredErrors([]);
    setStoredMetrics([]);
    setPerformanceData(prev => ({ ...prev, errorCount: 0 }));
    logger.info('Performance data cleared by user');
  };

  if (!isVisible) return null;

  const { score, status } = getPerformanceScore();

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80">
      <Card className="shadow-lg border-2">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4" />
              <CardTitle className="text-sm">Performance Monitor</CardTitle>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={status === 'good' ? 'default' : status === 'warning' ? 'secondary' : 'destructive'}>
                {score}
              </Badge>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => setIsVisible(false)}
                className="h-6 w-6 p-0"
              >
                ×
              </Button>
            </div>
          </div>
          <CardDescription className="text-xs">
            Real-time application performance metrics
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-3">
          <Tabs defaultValue="metrics" className="w-full">
            <TabsList className="grid w-full grid-cols-3 h-8">
              <TabsTrigger value="metrics" className="text-xs">Metrics</TabsTrigger>
              <TabsTrigger value="errors" className="text-xs">
                Errors {performanceData.errorCount > 0 && (
                  <Badge variant="destructive" className="ml-1 text-xs px-1">
                    {performanceData.errorCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="history" className="text-xs">History</TabsTrigger>
            </TabsList>
            
            <TabsContent value="metrics" className="space-y-2 mt-2">
              {/* Performance Score */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span>Overall Score</span>
                  <span className="font-medium">{score}/100</span>
                </div>
                <Progress value={score} className="h-2" />
              </div>

              {/* Individual Metrics */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>Load: {performanceData.pageLoadTime}ms</span>
                </div>
                
                <div className="flex items-center space-x-1">
                  <Database className="h-3 w-3" />
                  <span>Memory: {performanceData.memoryUsage}MB</span>
                </div>
                
                <div className="flex items-center space-x-1">
                  <Wifi className={`h-3 w-3 ${performanceData.networkStatus === 'online' ? 'text-green-500' : 'text-red-500'}`} />
                  <span className="capitalize">{performanceData.networkStatus}</span>
                </div>
                
                <div className="flex items-center space-x-1">
                  {performanceData.errorCount === 0 ? (
                    <CheckCircle className="h-3 w-3 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-3 w-3 text-red-500" />
                  )}
                  <span>{performanceData.errorCount} errors</span>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="errors" className="space-y-2 mt-2">
              {storedErrors.length === 0 ? (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    No errors detected
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {storedErrors.slice(-5).map((error, index) => (
                    <Alert key={index} variant="destructive" className="p-2">
                      <AlertDescription className="text-xs">
                        <div className="font-medium">{error.message}</div>
                        <div className="text-xs opacity-75">
                          {new Date(error.timestamp).toLocaleTimeString()}
                        </div>
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="history" className="space-y-2 mt-2">
              {storedMetrics.length === 0 ? (
                <Alert>
                  <BarChart3 className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    No performance history available
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {storedMetrics.slice(-3).map((metric, index) => (
                    <div key={index} className="text-xs p-2 border rounded">
                      <div className="flex justify-between">
                        <span>Load: {Math.round(metric.pageLoadTime)}ms</span>
                        <span>Mem: {metric.memoryUsage}MB</span>
                      </div>
                      <div className="text-xs opacity-75">
                        {new Date(metric.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
          
          {/* Controls */}
          <div className="flex justify-between pt-2 border-t">
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={clearStoredData}
              className="text-xs h-6"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Clear Data
            </Button>
            
            <span className="text-xs text-muted-foreground">
              Updated: {new Date(performanceData.lastUpdate).toLocaleTimeString()}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};