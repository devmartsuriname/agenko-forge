/**
 * Production health check and system status monitoring
 */
import { supabase } from '@/integrations/supabase/client';

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  checks: {
    database: boolean;
    auth: boolean;
    storage: boolean;
    functions: boolean;
  };
  performance: {
    dbLatency: number;
    pageLoadTime: number;
  };
}

// Database connection health check
async function checkDatabase(): Promise<{ healthy: boolean; latency: number }> {
  const start = performance.now();
  
  try {
    const { error } = await supabase
      .from('pages')
      .select('id')
      .limit(1)
      .single();
    
    const latency = performance.now() - start;
    return { healthy: !error, latency };
  } catch {
    return { healthy: false, latency: performance.now() - start };
  }
}

// Auth service health check
async function checkAuth(): Promise<boolean> {
  try {
    const { data } = await supabase.auth.getSession();
    return true; // Auth service is responding
  } catch {
    return false;
  }
}

// Storage service health check
async function checkStorage(): Promise<boolean> {
  try {
    const { data } = await supabase.storage.listBuckets();
    return Array.isArray(data);
  } catch {
    return false;
  }
}

// Edge functions health check
async function checkFunctions(): Promise<boolean> {
  try {
    // Test a lightweight function if available
    const response = await fetch('/api/health', { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}

// Performance metrics
function getPageLoadTime(): number {
  if (typeof window !== 'undefined' && window.performance?.timing) {
    const timing = window.performance.timing;
    return timing.loadEventEnd - timing.navigationStart;
  }
  return 0;
}

// Main health check function
export async function performHealthCheck(): Promise<HealthStatus> {
  const timestamp = new Date().toISOString();
  
  // Run all checks in parallel
  const [dbResult, authHealthy, storageHealthy, functionsHealthy] = await Promise.all([
    checkDatabase(),
    checkAuth(),
    checkStorage(),
    checkFunctions(),
  ]);

  const checks = {
    database: dbResult.healthy,
    auth: authHealthy,
    storage: storageHealthy,
    functions: functionsHealthy,
  };

  // Determine overall status
  const healthyChecks = Object.values(checks).filter(Boolean).length;
  const totalChecks = Object.values(checks).length;
  
  let status: HealthStatus['status'] = 'unhealthy';
  if (healthyChecks === totalChecks) {
    status = 'healthy';
  } else if (healthyChecks >= totalChecks * 0.75) {
    status = 'degraded';
  }

  return {
    status,
    timestamp,
    checks,
    performance: {
      dbLatency: dbResult.latency,
      pageLoadTime: getPageLoadTime(),
    },
  };
}

// System monitoring for production
export class SystemMonitor {
  private static instance: SystemMonitor;
  private healthHistory: HealthStatus[] = [];
  private monitoringInterval?: number;

  static getInstance(): SystemMonitor {
    if (!SystemMonitor.instance) {
      SystemMonitor.instance = new SystemMonitor();
    }
    return SystemMonitor.instance;
  }

  startMonitoring(intervalMs: number = 300000) { // 5 minutes
    if (typeof window === 'undefined') return;
    
    this.monitoringInterval = window.setInterval(async () => {
      const health = await performHealthCheck();
      this.healthHistory.push(health);
      
      // Keep only last 24 hours of data (assuming 5-minute intervals)
      if (this.healthHistory.length > 288) {
        this.healthHistory.shift();
      }

      // Log degraded/unhealthy status
      if (health.status !== 'healthy') {
        console.warn('System health degraded:', health);
      }
    }, intervalMs);
  }

  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
    }
  }

  getHealthHistory(): HealthStatus[] {
    return [...this.healthHistory];
  }

  getCurrentHealth(): Promise<HealthStatus> {
    return performHealthCheck();
  }
}
