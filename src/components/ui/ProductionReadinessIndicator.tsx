/**
 * Production Readiness Indicator
 * Phase 5: Production Console Cleanup - Visual indicator of production readiness
 */

import { useEffect, useState } from 'react';
import { productionErrorHandler } from '@/lib/production-error-handler';
import { optimizedPerformanceMonitor } from '@/lib/performance-optimized';

interface ProductionStatus {
  errors: number;
  lastError: number;
  performance: any;
  isProduction: boolean;
  hasConsoleWarnings: boolean;
}

export function ProductionReadinessIndicator() {
  const [status, setStatus] = useState<ProductionStatus>({
    errors: 0,
    lastError: 0,
    performance: null,
    isProduction: process.env.NODE_ENV === 'production',
    hasConsoleWarnings: false
  });

  const [isVisible, setIsVisible] = useState(process.env.NODE_ENV === 'development');

  useEffect(() => {
    if (!isVisible) return;

    const updateStatus = () => {
      const errorStats = productionErrorHandler.getErrorStats();
      const perfData = optimizedPerformanceMonitor.getBasicMetrics();
      
      setStatus(prev => ({
        ...prev,
        errors: errorStats.errorCount,
        lastError: errorStats.lastErrorTime,
        performance: perfData
      }));
    };

    // Update immediately
    updateStatus();

    // Update every 5 seconds
    const interval = setInterval(updateStatus, 5000);

    return () => clearInterval(interval);
  }, [isVisible]);

  if (!isVisible) return null;

  const getStatusColor = () => {
    if (status.errors === 0) return 'text-green-500';
    if (status.errors < 5) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getStatusText = () => {
    if (status.errors === 0) return 'Clean';
    if (status.errors < 5) return 'Minor Issues';
    return 'Needs Attention';
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-background border border-border rounded-lg p-3 shadow-lg text-xs">
        <div className="flex items-center gap-2 mb-2">
          <div className={`w-2 h-2 rounded-full ${getStatusColor().replace('text-', 'bg-')}`}></div>
          <span className="font-medium">Production Status: {getStatusText()}</span>
        </div>
        
        <div className="space-y-1 text-muted-foreground">
          <div>Errors: {status.errors}</div>
          <div>Mode: {status.isProduction ? 'Production' : 'Development'}</div>
          {status.performance && (
            <div>Performance: {status.performance.resourceCount} resources</div>
          )}
          {status.lastError > 0 && (
            <div className="text-xs text-yellow-600">
              Last error: {new Date(status.lastError).toLocaleTimeString()}
            </div>
          )}
        </div>

        <button
          onClick={() => setIsVisible(false)}
          className="absolute -top-1 -right-1 w-4 h-4 bg-muted hover:bg-muted/80 rounded-full text-xs flex items-center justify-center"
        >
          ×
        </button>
      </div>
    </div>
  );
}