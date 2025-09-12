/**
 * Network Debug Widget - Compact widget for admin dashboard
 */

import React, { useState, useEffect } from 'react';
import { networkDebugger, NetworkStats } from '@/lib/network-debug';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Globe, AlertTriangle, CheckCircle, Clock, TrendingUp } from 'lucide-react';

interface NetworkDebugWidgetProps {
  onOpenFullPanel?: () => void;
}

export const NetworkDebugWidget: React.FC<NetworkDebugWidgetProps> = ({ onOpenFullPanel }) => {
  const [stats, setStats] = useState<NetworkStats | null>(null);
  const [recentErrors, setRecentErrors] = useState<number>(0);

  useEffect(() => {
    const updateStats = () => {
      const currentStats = networkDebugger.getStats();
      setStats(currentStats);
      
      // Get recent errors (last 5 minutes)
      const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
      const recentErrorRequests = networkDebugger.getFilteredRequests({
        hasError: true,
        timeRange: { start: fiveMinutesAgo, end: Date.now() }
      });
      setRecentErrors(recentErrorRequests.length);
    };

    updateStats();
    const interval = setInterval(updateStats, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  if (!stats) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Network Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  const successRate = (1 - stats.errorRate) * 100;
  const isHealthy = successRate >= 95 && stats.averageResponseTime < 2000;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Network Status
          </CardTitle>
          {isHealthy ? (
            <Badge variant="default" className="text-xs">
              <CheckCircle className="h-3 w-3 mr-1" />
              Healthy
            </Badge>
          ) : (
            <Badge variant="destructive" className="text-xs">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Issues
            </Badge>
          )}
        </div>
        <CardDescription className="text-xs">
          Real-time network monitoring
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-xs text-muted-foreground">Requests</p>
            <p className="text-sm font-semibold">{stats.totalRequests}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Success</p>
            <p className={`text-sm font-semibold ${successRate >= 95 ? 'text-green-600' : 'text-red-600'}`}>
              {successRate.toFixed(1)}%
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Avg Time</p>
            <p className={`text-sm font-semibold ${stats.averageResponseTime < 1000 ? 'text-green-600' : stats.averageResponseTime < 2000 ? 'text-yellow-600' : 'text-red-600'}`}>
              {stats.averageResponseTime.toFixed(0)}ms
            </p>
          </div>
        </div>

        {/* Recent Issues Alert */}
        {recentErrors > 0 && (
          <div className="flex items-center gap-2 p-2 bg-red-50 dark:bg-red-900/20 rounded-md">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <p className="text-xs text-red-600">
              {recentErrors} error{recentErrors > 1 ? 's' : ''} in last 5 minutes
            </p>
          </div>
        )}

        {/* Slowest Request Alert */}
        {stats.slowestRequest && stats.slowestRequest.duration && stats.slowestRequest.duration > 3000 && (
          <div className="flex items-center gap-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-md">
            <Clock className="h-4 w-4 text-yellow-600" />
            <p className="text-xs text-yellow-600">
              Slow request detected: {stats.slowestRequest.duration.toFixed(0)}ms
            </p>
          </div>
        )}

        {/* View Details Button */}
        {onOpenFullPanel && (
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full text-xs"
            onClick={onOpenFullPanel}
          >
            <TrendingUp className="h-3 w-3 mr-1" />
            View Details
          </Button>
        )}

        {/* Quick Actions */}
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex-1 text-xs h-7"
            onClick={() => networkDebugger.clearRequests()}
          >
            Clear
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex-1 text-xs h-7"
            onClick={() => {
              const data = networkDebugger.exportRequests();
              navigator.clipboard.writeText(data);
            }}
          >
            Copy
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default NetworkDebugWidget;