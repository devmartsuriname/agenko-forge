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
import { performanceMonitor } from '@/lib/performance-monitor';
import { productionUtils } from '@/lib/production-optimizations';
import { logger } from '@/lib/logger';
import type { PerformanceData, VitalStatus } from '@/types/performance';

interface UnifiedPerformanceMonitorProps {
  showAsWidget?: boolean;
  onClose?: () => void;
}

export const UnifiedPerformanceMonitor: React.FC<UnifiedPerformanceMonitorProps> = ({ 
  showAsWidget = false, 
  onClose 
}) => {
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null);
  const [isCollecting, setIsCollecting] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [storedErrors, setStoredErrors] = useState<any[]>([]);
  const [storedMetrics, setStoredMetrics] = useState<any[]>([]);

  useEffect(() => {
    // Only show widget in development or when explicitly enabled
    if (showAsWidget) {
      const showMonitor = 
        process.env.NODE_ENV === 'development' || 
        localStorage.getItem('show_performance_monitor') === 'true';
      
      setIsVisible(showMonitor);
      if (!showMonitor) return;
    }

    collectPerformanceData();
    
    // Collect metrics every 30 seconds
    const interval = setInterval(collectPerformanceData, 30000);
    return () => clearInterval(interval);
  }, [showAsWidget]);

  const collectPerformanceData = async () => {
    if (typeof window === 'undefined') return;
    
    setIsCollecting(true);
    
    try {
      const data = performanceMonitor.getCurrentData();
      if (data) {
        setPerformanceData(data);
      }

      // Get stored data for error tracking
      setStoredErrors(productionUtils.getStoredErrors());
      setStoredMetrics(productionUtils.getStoredMetrics());
      
    } catch (error) {
      logger.error('Failed to collect performance metrics', error);
    } finally {
      setIsCollecting(false);
    }
  };

  const getVitalStatus = (metric: keyof PerformanceData['vitals'], value: number): VitalStatus => {
    return performanceMonitor.getVitalStatus(metric, value);
  };

  const formatValue = (metric: keyof PerformanceData['vitals'], value: number): string => {
    return performanceMonitor.formatValue(metric, value);
  };

  const getStatusColor = (status: VitalStatus): string => {
    switch (status) {
      case 'good': return 'text-green-600';
      case 'needs-improvement': return 'text-yellow-600';
      case 'poor': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: VitalStatus) => {
    switch (status) {
      case 'good': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'needs-improvement': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'poor': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return <Zap className="h-4 w-4 text-gray-600" />;
    }
  };

  const getPerformanceScore = (): { score: number; status: 'good' | 'warning' | 'poor' } => {
    const score = performanceMonitor.getPerformanceScore();
    
    if (score >= 80) return { score, status: 'good' };
    if (score >= 60) return { score, status: 'warning' };
    return { score, status: 'poor' };
  };

  const clearStoredData = () => {
    productionUtils.clearStoredData();
    setStoredErrors([]);
    setStoredMetrics([]);
    logger.info('Performance data cleared by user');
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      setIsVisible(false);
    }
  };

  if (!isVisible) return null;

  if (!performanceData) {
    return (
      <Card className={showAsWidget ? "shadow-lg border-2" : ""}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Performance Monitor
            {isCollecting && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>}
          </CardTitle>
          <CardDescription>Loading performance metrics...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-4 bg-muted rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const vitals = [
    { key: 'lcp', label: 'Largest Contentful Paint', description: 'Loading performance' },
    { key: 'cls', label: 'Cumulative Layout Shift', description: 'Visual stability' },
    { key: 'fid', label: 'First Input Delay', description: 'Interactivity' },
    { key: 'ttfb', label: 'Time to First Byte', description: 'Server response' },
    { key: 'fcp', label: 'First Contentful Paint', description: 'Initial loading' }
  ] as const;

  const { score, status } = getPerformanceScore();

  const containerClass = showAsWidget 
    ? "fixed bottom-4 right-4 z-50 w-80" 
    : "w-full";

  return (
    <div className={containerClass}>
      <Card className={showAsWidget ? "shadow-lg border-2" : ""}>
        <CardHeader className={showAsWidget ? "pb-2" : ""}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4" />
              <CardTitle className={showAsWidget ? "text-sm" : ""}>
                Performance Monitor
              </CardTitle>
              {isCollecting && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>}
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={status === 'good' ? 'default' : status === 'warning' ? 'secondary' : 'destructive'}>
                {score}
              </Badge>
              {showAsWidget && (
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={handleClose}
                  className="h-6 w-6 p-0"
                >
                  ×
                </Button>
              )}
            </div>
          </div>
          <CardDescription className={showAsWidget ? "text-xs" : ""}>
            Real-time Core Web Vitals and performance metrics
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {showAsWidget ? (
            // Widget compact view with tabs
            <Tabs defaultValue="metrics" className="w-full">
              <TabsList className="grid w-full grid-cols-3 h-8">
                <TabsTrigger value="metrics" className="text-xs">Vitals</TabsTrigger>
                <TabsTrigger value="system" className="text-xs">System</TabsTrigger>
                <TabsTrigger value="errors" className="text-xs">
                  Errors {performanceData.errorCount > 0 && (
                    <Badge variant="destructive" className="ml-1 text-xs px-1">
                      {performanceData.errorCount}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="metrics" className="space-y-2 mt-2">
                <div className="grid grid-cols-1 gap-2">
                  {vitals.slice(0, 3).map(({ key, label }) => {
                    const value = performanceData.vitals[key];
                    const vitalStatus = getVitalStatus(key, value);
                    return (
                      <div key={key} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1">
                          {getStatusIcon(vitalStatus)}
                          <span className="truncate">{label}</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {formatValue(key, value)}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </TabsContent>

              <TabsContent value="system" className="space-y-2 mt-2">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>Load: {Math.round(performanceData.pageLoadTime)}ms</span>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <Database className="h-3 w-3" />
                    <span>Mem: {performanceData.memoryUsage}MB</span>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <Wifi className={`h-3 w-3 ${performanceData.networkStatus === 'online' ? 'text-green-500' : 'text-red-500'}`} />
                    <span className="capitalize">{performanceData.networkStatus}</span>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <BarChart3 className="h-3 w-3" />
                    <span>{performanceData.resourceCount} assets</span>
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
                    {storedErrors.slice(-3).map((error, index) => (
                      <Alert key={index} variant="destructive" className="p-2">
                        <AlertDescription className="text-xs">
                          <div className="font-medium truncate">{error.message}</div>
                          <div className="text-xs opacity-75">
                            {new Date(error.timestamp).toLocaleTimeString()}
                          </div>
                        </AlertDescription>
                      </Alert>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          ) : (
            // Full dashboard view
            <>
              {/* Core Web Vitals */}
              <div className="space-y-4">
                <h4 className="font-medium">Core Web Vitals</h4>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {vitals.map(({ key, label, description }) => {
                    const value = performanceData.vitals[key];
                    const vitalStatus = getVitalStatus(key, value);
                    return (
                      <div key={key} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(vitalStatus)}
                            <span className="text-sm font-medium">{label}</span>
                          </div>
                          <Badge variant={vitalStatus === 'good' ? 'default' : 'secondary'}>
                            {formatValue(key, value)}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{description}</p>
                        <Progress 
                          value={vitalStatus === 'good' ? 100 : vitalStatus === 'needs-improvement' ? 60 : 30} 
                          className="h-1"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Summary Stats */}
              <div className="grid gap-4 md:grid-cols-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{performanceData.resourceCount}</div>
                  <div className="text-sm text-muted-foreground">Resources</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{Math.round(performanceData.pageLoadTime)}ms</div>
                  <div className="text-sm text-muted-foreground">Page Load</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{performanceData.memoryUsage}MB</div>
                  <div className="text-sm text-muted-foreground">Memory</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{performanceData.errorCount}</div>
                  <div className="text-sm text-muted-foreground">JS Errors</div>
                </div>
              </div>
            </>
          )}

          {/* Controls */}
          <div className="flex justify-between pt-2 border-t">
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={clearStoredData}
              className={`${showAsWidget ? 'text-xs h-6' : ''}`}
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Clear Data
            </Button>
            
            <span className={`${showAsWidget ? 'text-xs' : 'text-sm'} text-muted-foreground`}>
              {new Date(performanceData.timestamp).toLocaleTimeString()}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};