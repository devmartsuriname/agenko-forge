/**
 * System health monitoring widget for admin dashboard
 */
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, Database, Shield, HardDrive, Zap } from 'lucide-react';
import { performHealthCheck, SystemMonitor, HealthStatus } from '@/lib/health-check';

export function SystemHealthWidget() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkHealth = async () => {
    setIsLoading(true);
    try {
      const result = await performHealthCheck();
      setHealth(result);
      setLastChecked(new Date());
    } catch (error) {
      console.error('Health check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial health check
  useEffect(() => {
    checkHealth();
    
    // Start background monitoring
    const monitor = SystemMonitor.getInstance();
    monitor.startMonitoring();
    
    return () => {
      monitor.stopMonitoring();
    };
  }, []);

  const getStatusColor = (status: HealthStatus['status']) => {
    switch (status) {
      case 'healthy': return 'bg-green-500';
      case 'degraded': return 'bg-yellow-500';
      case 'unhealthy': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: HealthStatus['status']) => {
    switch (status) {
      case 'healthy': return 'All Systems Operational';
      case 'degraded': return 'Some Issues Detected';
      case 'unhealthy': return 'System Problems';
      default: return 'Unknown Status';
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">System Health</CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={checkHealth}
            disabled={isLoading}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
        {health && (
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${getStatusColor(health.status)}`} />
            <span className="text-sm text-muted-foreground">
              {getStatusText(health.status)}
            </span>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        {health ? (
          <>
            {/* Service Status */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Database</span>
                <Badge 
                  variant={health.checks.database ? "default" : "destructive"}
                  className="ml-auto"
                >
                  {health.checks.database ? 'OK' : 'Error'}
                </Badge>
              </div>
              
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Auth</span>
                <Badge 
                  variant={health.checks.auth ? "default" : "destructive"}
                  className="ml-auto"
                >
                  {health.checks.auth ? 'OK' : 'Error'}
                </Badge>
              </div>
              
              <div className="flex items-center gap-2">
                <HardDrive className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Storage</span>
                <Badge 
                  variant={health.checks.storage ? "default" : "destructive"}
                  className="ml-auto"
                >
                  {health.checks.storage ? 'OK' : 'Error'}
                </Badge>
              </div>
              
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Functions</span>
                <Badge 
                  variant={health.checks.functions ? "default" : "destructive"}
                  className="ml-auto"
                >
                  {health.checks.functions ? 'OK' : 'Error'}
                </Badge>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="pt-2 border-t">
              <div className="text-sm text-muted-foreground mb-2">Performance</div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">DB Latency:</span>
                  <span className="ml-1 font-medium">
                    {Math.round(health.performance.dbLatency)}ms
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Page Load:</span>
                  <span className="ml-1 font-medium">
                    {Math.round(health.performance.pageLoadTime)}ms
                  </span>
                </div>
              </div>
            </div>

            {/* Last Checked */}
            {lastChecked && (
              <div className="text-xs text-muted-foreground">
                Last checked: {lastChecked.toLocaleTimeString()}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto mb-2" />
            <div className="text-sm text-muted-foreground">Checking system health...</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}