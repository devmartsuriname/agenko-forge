/**
 * Enhanced System Health Widget with standardized admin patterns
 */
import React, { useState, useEffect } from 'react';
import { StandardAdminCard } from './StandardAdminCard';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Database, Shield, HardDrive, Zap, Activity } from 'lucide-react';
import { performHealthCheck, SystemMonitor, HealthStatus } from '@/lib/health-check';
import { ADMIN_COLORS } from '@/lib/admin-standards';

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
    <StandardAdminCard
      title="System Health"
      description={health ? getStatusText(health.status) : 'Checking system status...'}
      badge={health ? {
        text: health.status,
        variant: health.status === 'healthy' ? 'default' : 
                health.status === 'degraded' ? 'secondary' : 'destructive'
      } : undefined}
      actions={[{
        label: 'Refresh',
        icon: RefreshCw,
        onClick: checkHealth,
        loading: isLoading,
        variant: 'outline'
      }]}
      loading={!health && isLoading}
    >
      <div className="space-y-6">
        {/* Service Status Grid */}
        <div className="grid grid-cols-2 gap-4">
          {[
            { key: 'database', label: 'Database', icon: Database },
            { key: 'auth', label: 'Authentication', icon: Shield },
            { key: 'storage', label: 'Storage', icon: HardDrive },
            { key: 'functions', label: 'Edge Functions', icon: Zap },
          ].map(({ key, label, icon: Icon }) => {
            const isHealthy = health?.checks[key as keyof typeof health.checks];
            return (
              <div key={key} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                <div className="flex items-center gap-3">
                  <Icon className={`h-5 w-5 ${isHealthy ? 'text-green-600' : 'text-red-600'}`} />
                  <span className="text-sm font-medium">{label}</span>
                </div>
                <Badge variant={isHealthy ? "default" : "destructive"}>
                  {isHealthy ? 'Healthy' : 'Error'}
                </Badge>
              </div>
            );
          })}
        </div>

        {/* Performance Metrics */}
        {health && (
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div className="text-center p-3 rounded-lg bg-muted/30">
              <Activity className="h-5 w-5 text-muted-foreground mx-auto mb-1" />
              <div className="text-sm text-muted-foreground">DB Latency</div>
              <div className="text-lg font-semibold">
                {Math.round(health.performance.dbLatency)}ms
              </div>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/30">
              <Activity className="h-5 w-5 text-muted-foreground mx-auto mb-1" />
              <div className="text-sm text-muted-foreground">Page Load</div>
              <div className="text-lg font-semibold">
                {Math.round(health.performance.pageLoadTime)}ms
              </div>
            </div>
          </div>
        )}

        {/* Last Checked */}
        {lastChecked && (
          <div className="text-center text-xs text-muted-foreground pt-2 border-t">
            Last updated: {lastChecked.toLocaleTimeString()}
          </div>
        )}
      </div>
    </StandardAdminCard>
  );
}