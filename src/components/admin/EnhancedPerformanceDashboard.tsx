/**
 * Enhanced Performance Dashboard
 * Real-time monitoring with alerts, optimization recommendations, and detailed metrics
 */

import React, { useState, useEffect } from 'react';
import { StandardAdminCard, AdminStatsCard } from './StandardAdminCard';
import { StandardAdminTable } from './StandardAdminTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Database, 
  Gauge, 
  Zap,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  AlertCircle,
  Info,
  Target
} from 'lucide-react';
import { 
  performanceMonitor, 
  PerformanceMetrics, 
  PerformanceAlert, 
  PERFORMANCE_BUDGETS 
} from '@/lib/performance-enhanced';
import { cache } from '@/lib/cache-manager';
import { dbOptimizer } from '@/lib/database-optimizer';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

export function EnhancedPerformanceDashboard() {
  const [currentMetrics, setCurrentMetrics] = useState<PerformanceMetrics | null>(null);
  const [metricsHistory, setMetricsHistory] = useState<PerformanceMetrics[]>([]);
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    initializeMonitoring();
    
    // Update metrics every 30 seconds
    const interval = setInterval(updateMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  const initializeMonitoring = async () => {
    setIsLoading(true);
    try {
      await performanceMonitor.initialize();
      await updateMetrics();
    } catch (error) {
      console.error('Failed to initialize performance monitoring:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateMetrics = async () => {
    try {
      const latest = performanceMonitor.getLatestMetrics();
      const history = performanceMonitor.getMetricsHistory();
      const currentAlerts = performanceMonitor.getActiveAlerts();

      setCurrentMetrics(latest);
      setMetricsHistory(history.slice(0, 20)); // Last 20 data points
      setAlerts(currentAlerts);
    } catch (error) {
      console.error('Failed to update metrics:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await updateMetrics();
    setRefreshing(false);
  };

  const resolveAlert = (alertId: string) => {
    performanceMonitor.resolveAlert(alertId);
    setAlerts(alerts.filter(alert => alert.id !== alertId));
  };

  const getPerformanceScore = () => {
    return performanceMonitor.getPerformanceScore();
  };

  const getVitalStatus = (metric: keyof typeof PERFORMANCE_BUDGETS, value: number) => {
    const budget = PERFORMANCE_BUDGETS[metric];
    if (!budget) return 'unknown';
    
    if (value <= budget.good) return 'good';
    if (value <= budget.needs_improvement) return 'needs-improvement';
    return 'poor';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600';
      case 'needs-improvement': return 'text-yellow-600';
      case 'poor': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getAlertIcon = (severity: PerformanceAlert['severity']) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'high': return <AlertCircle className="h-4 w-4 text-orange-600" />;
      case 'medium': return <Info className="h-4 w-4 text-yellow-600" />;
      case 'low': return <Info className="h-4 w-4 text-blue-600" />;
    }
  };

  const formatChartData = () => {
    return metricsHistory.map((metrics, index) => ({
      index: metricsHistory.length - index,
      lcp: metrics.vitals.lcp,
      cls: metrics.vitals.cls * 1000, // Scale CLS for visibility
      fid: metrics.vitals.fid,
      loadTime: metrics.navigation.loadTime,
      timestamp: new Date(metrics.timestamp).toLocaleTimeString()
    })).reverse();
  };

  if (isLoading) {
    return (
      <StandardAdminCard
        title="Performance Dashboard"
        description="Loading performance monitoring..."
        loading={true}
      >
        <div />
      </StandardAdminCard>
    );
  }

  const performanceScore = getPerformanceScore();
  const cacheStats = cache.getStats();
  const dbStats = dbOptimizer.getStats();

  return (
    <div className="space-y-6">
      {/* Performance Score & Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <AdminStatsCard
          title="Performance Score"
          value={performanceScore}
          subtitle="out of 100"
          trend={{
            value: 5,
            isPositive: true,
            label: "vs last hour"
          }}
          icon={Gauge}
        />
        
        <AdminStatsCard
          title="Cache Hit Rate"
          value={`${Math.round(cacheStats.hitRate)}%`}
          subtitle={`${cacheStats.totalHits} hits`}
          trend={{
            value: cacheStats.hitRate - 85,
            isPositive: cacheStats.hitRate > 85,
            label: "efficiency"
          }}
          icon={Database}
        />
        
        <AdminStatsCard
          title="Avg Query Time"
          value={`${Math.round(dbStats.avgQueryTime)}ms`}
          subtitle={`${dbStats.totalQueries} queries`}
          trend={{
            value: dbStats.savedRoundTrips,
            isPositive: true,
            label: "saved round trips"
          }}
          icon={Zap}
        />
        
        <AdminStatsCard
          title="Active Alerts"
          value={alerts.length}
          subtitle={alerts.filter(a => a.severity === 'critical').length + " critical"}
          trend={{
            value: alerts.length,
            isPositive: alerts.length === 0,
            label: "issues"
          }}
          icon={AlertTriangle}
        />
      </div>

      {/* Active Alerts */}
      {alerts.length > 0 && (
        <StandardAdminCard
          title="Performance Alerts"
          description="Issues requiring attention"
          badge={{
            text: `${alerts.length} active`,
            variant: alerts.some(a => a.severity === 'critical') ? 'destructive' : 'secondary'
          }}
        >
          <div className="space-y-3">
            {alerts.slice(0, 5).map((alert) => (
              <Alert key={alert.id} className={`${
                alert.severity === 'critical' ? 'border-red-200 bg-red-50' :
                alert.severity === 'high' ? 'border-orange-200 bg-orange-50' :
                alert.severity === 'medium' ? 'border-yellow-200 bg-yellow-50' :
                'border-blue-200 bg-blue-50'
              }`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-2">
                    {getAlertIcon(alert.severity)}
                    <div>
                      <AlertDescription className="font-medium">
                        {alert.message}
                      </AlertDescription>
                      <div className="text-xs text-muted-foreground mt-1">
                        {new Date(alert.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => resolveAlert(alert.id)}
                  >
                    Resolve
                  </Button>
                </div>
              </Alert>
            ))}
          </div>
        </StandardAdminCard>
      )}

      {/* Detailed Metrics */}
      <Tabs defaultValue="vitals" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="vitals">Core Web Vitals</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="cache">Cache Performance</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        {/* Core Web Vitals Tab */}
        <TabsContent value="vitals">
          <StandardAdminCard
            title="Core Web Vitals"
            description="Real-time performance metrics"
            actions={[{
              label: 'Refresh',
              icon: RefreshCw,
              onClick: handleRefresh,
              loading: refreshing
            }]}
          >
            {currentMetrics ? (
              <div className="space-y-6">
                {/* Vitals Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {[
                    { key: 'lcp', label: 'Largest Contentful Paint', unit: 'ms', description: 'Loading performance' },
                    { key: 'cls', label: 'Cumulative Layout Shift', unit: '', description: 'Visual stability' },
                    { key: 'fid', label: 'First Input Delay', unit: 'ms', description: 'Interactivity' },
                    { key: 'ttfb', label: 'Time to First Byte', unit: 'ms', description: 'Server response' },
                    { key: 'fcp', label: 'First Contentful Paint', unit: 'ms', description: 'Initial loading' }
                  ].map(({ key, label, unit, description }) => {
                    const value = currentMetrics.vitals[key as keyof typeof currentMetrics.vitals] || 0;
                    const status = getVitalStatus(key as keyof typeof PERFORMANCE_BUDGETS, value);
                    const budget = PERFORMANCE_BUDGETS[key as keyof typeof PERFORMANCE_BUDGETS];
                    
                    return (
                      <div key={key} className="space-y-3 p-4 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {status === 'good' ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : status === 'needs-improvement' ? (
                              <Clock className="h-4 w-4 text-yellow-600" />
                            ) : (
                              <AlertTriangle className="h-4 w-4 text-red-600" />
                            )}
                            <span className="font-medium text-sm">{label}</span>
                          </div>
                          <Badge variant={status === 'good' ? 'default' : status === 'needs-improvement' ? 'secondary' : 'destructive'}>
                            {key === 'cls' ? value.toFixed(3) : Math.round(value)}{unit}
                          </Badge>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Good: ≤{budget?.good}{unit}</span>
                            <span>Poor: &gt;{budget?.needs_improvement}{unit}</span>
                          </div>
                          <Progress 
                            value={Math.min(100, (value / (budget?.needs_improvement || 1)) * 100)}
                            className="h-2"
                          />
                        </div>
                        
                        <p className="text-xs text-muted-foreground">{description}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Navigation Metrics */}
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold">{Math.round(currentMetrics.navigation.loadTime)}ms</div>
                    <div className="text-sm text-muted-foreground">Page Load Time</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold">{currentMetrics.navigation.resourceCount}</div>
                    <div className="text-sm text-muted-foreground">Resources Loaded</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold">{Math.round(currentMetrics.navigation.totalSize / 1024)}KB</div>
                    <div className="text-sm text-muted-foreground">Total Size</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No performance data available
              </div>
            )}
          </StandardAdminCard>
        </TabsContent>

        {/* Resources Tab */}
        <TabsContent value="resources">
          <StandardAdminCard
            title="Resource Performance"
            description="Analysis of images, scripts, and stylesheets"
          >
            {currentMetrics ? (
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-3">
                  {[
                    { key: 'images', label: 'Images', icon: '🖼️' },
                    { key: 'scripts', label: 'Scripts', icon: '⚡' },
                    { key: 'stylesheets', label: 'Stylesheets', icon: '🎨' }
                  ].map(({ key, label, icon }) => {
                    const resource = currentMetrics.resources[key as keyof typeof currentMetrics.resources];
                    return (
                      <div key={key} className="p-4 border rounded-lg">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-lg">{icon}</span>
                          <span className="font-medium">{label}</span>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Count:</span>
                            <span className="font-medium">{resource.count}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Size:</span>
                            <span className="font-medium">{Math.round(resource.size / 1024)}KB</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Avg Load:</span>
                            <span className="font-medium">{Math.round(resource.avgLoadTime)}ms</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Memory Usage */}
                {currentMetrics.memory && (
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-3">Memory Usage</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Used JS Heap:</span>
                        <span>{Math.round(currentMetrics.memory.usedJSHeapSize / 1024 / 1024)}MB</span>
                      </div>
                      <Progress 
                        value={(currentMetrics.memory.usedJSHeapSize / currentMetrics.memory.jsHeapSizeLimit) * 100}
                        className="h-2"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>0MB</span>
                        <span>{Math.round(currentMetrics.memory.jsHeapSizeLimit / 1024 / 1024)}MB limit</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No resource data available
              </div>
            )}
          </StandardAdminCard>
        </TabsContent>

        {/* Cache Performance Tab */}
        <TabsContent value="cache">
          <StandardAdminCard
            title="Cache Performance"
            description="Cache hit rates and optimization stats"
          >
            <div className="space-y-6">
              {/* Cache Stats */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{Math.round(cacheStats.hitRate)}%</div>
                  <div className="text-sm text-muted-foreground">Hit Rate</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold">{cacheStats.totalEntries}</div>
                  <div className="text-sm text-muted-foreground">Cached Items</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold">{Math.round(cacheStats.totalSize / 1024)}KB</div>
                  <div className="text-sm text-muted-foreground">Cache Size</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold">{Math.round(cacheStats.avgResponseTime)}ms</div>
                  <div className="text-sm text-muted-foreground">Avg Response</div>
                </div>
              </div>

              {/* Database Stats */}
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-3">Database Optimization</h4>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Total Queries</div>
                    <div className="font-medium">{dbStats.totalQueries}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Batched Queries</div>
                    <div className="font-medium">{dbStats.batchedQueries}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Saved Round Trips</div>
                    <div className="font-medium text-green-600">+{dbStats.savedRoundTrips}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Avg Query Time</div>
                    <div className="font-medium">{Math.round(dbStats.avgQueryTime)}ms</div>
                  </div>
                </div>
              </div>
            </div>
          </StandardAdminCard>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends">
          <StandardAdminCard
            title="Performance Trends"
            description="Historical performance data"
          >
            {metricsHistory.length > 0 ? (
              <div className="space-y-6">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={formatChartData()}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="timestamp" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="lcp" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2}
                        name="LCP (ms)"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="fid" 
                        stroke="hsl(var(--secondary))" 
                        strokeWidth={2}
                        name="FID (ms)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="text-center text-sm text-muted-foreground">
                  Showing last {metricsHistory.length} measurements
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Not enough historical data available
              </div>
            )}
          </StandardAdminCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}