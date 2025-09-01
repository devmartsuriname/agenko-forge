/**
 * Enhanced Performance Monitoring & Optimization System
 * Provides comprehensive performance tracking, optimization, and alerting
 */

import { supabase } from '@/integrations/supabase/client';

// Performance Budget Configuration
export const PERFORMANCE_BUDGETS = {
  lcp: { good: 2500, needs_improvement: 4000 },
  cls: { good: 0.1, needs_improvement: 0.25 },
  fid: { good: 100, needs_improvement: 300 },
  ttfb: { good: 800, needs_improvement: 1800 },
  fcp: { good: 1800, needs_improvement: 3000 },
  pageLoadTime: { good: 3000, needs_improvement: 5000 },
  resourceSize: { good: 1024 * 1024, needs_improvement: 2 * 1024 * 1024 }, // 1MB, 2MB
} as const;

export interface EnhancedWebVitals {
  lcp: number;
  cls: number;
  fid: number;
  ttfb: number;
  fcp: number;
  inp?: number; // Interaction to Next Paint
}

export interface PerformanceMetrics {
  vitals: EnhancedWebVitals;
  navigation: {
    loadTime: number;
    domContentLoaded: number;
    resourceCount: number;
    totalSize: number;
  };
  resources: {
    images: { count: number; size: number; avgLoadTime: number };
    scripts: { count: number; size: number; avgLoadTime: number };
    stylesheets: { count: number; size: number; avgLoadTime: number };
  };
  memory?: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
  connection?: {
    effectiveType: string;
    downlink: number;
    rtt: number;
  };
  errors: {
    jsErrors: number;
    networkErrors: number;
    resourceErrors: number;
  };
  timestamp: string;
  url: string;
  userAgent: string;
}

export interface PerformanceAlert {
  id: string;
  type: 'budget_exceeded' | 'vital_poor' | 'error_spike' | 'resource_bloat';
  severity: 'low' | 'medium' | 'high' | 'critical';
  metric: string;
  value: number;
  threshold: number;
  message: string;
  timestamp: string;
  resolved: boolean;
}

class EnhancedPerformanceMonitor {
  private static instance: EnhancedPerformanceMonitor;
  private observers: Map<string, PerformanceObserver> = new Map();
  private metrics: PerformanceMetrics[] = [];
  private alerts: PerformanceAlert[] = [];
  private isMonitoring = false;
  private reportingInterval?: number;

  static getInstance(): EnhancedPerformanceMonitor {
    if (!EnhancedPerformanceMonitor.instance) {
      EnhancedPerformanceMonitor.instance = new EnhancedPerformanceMonitor();
    }
    return EnhancedPerformanceMonitor.instance;
  }

  async initialize(): Promise<void> {
    if (typeof window === 'undefined' || this.isMonitoring) return;

    console.log('🚀 Enhanced Performance Monitor initializing...');
    
    this.setupWebVitalsObservers();
    this.setupResourceObservers();
    this.setupErrorTracking();
    this.startPeriodicReporting();
    
    this.isMonitoring = true;
    console.log('✅ Enhanced Performance Monitor initialized');
  }

  private setupWebVitalsObservers(): void {
    // Largest Contentful Paint
    if ('PerformanceObserver' in window) {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as any;
        this.updateVital('lcp', lastEntry.startTime);
      });
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
      this.observers.set('lcp', lcpObserver);

      // First Input Delay
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          this.updateVital('fid', entry.processingStart - entry.startTime);
        });
      });
      fidObserver.observe({ type: 'first-input', buffered: true });
      this.observers.set('fid', fidObserver);

      // Cumulative Layout Shift
      const clsObserver = new PerformanceObserver((list) => {
        let clsValue = 0;
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        this.updateVital('cls', clsValue);
      });
      clsObserver.observe({ type: 'layout-shift', buffered: true });
      this.observers.set('cls', clsObserver);
    }
  }

  private setupResourceObservers(): void {
    if ('PerformanceObserver' in window) {
      const resourceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        this.analyzeResourcePerformance(entries as PerformanceResourceTiming[]);
      });
      resourceObserver.observe({ type: 'resource', buffered: true });
      this.observers.set('resource', resourceObserver);
    }
  }

  private setupErrorTracking(): void {
    // JavaScript errors
    window.addEventListener('error', (event) => {
      this.trackError('js', event.error?.message || 'Unknown error', event.filename, event.lineno);
    });

    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.trackError('promise', event.reason?.message || 'Unhandled promise rejection');
    });

    // Resource loading errors
    window.addEventListener('error', (event) => {
      if (event.target && event.target !== window) {
        this.trackError('resource', `Failed to load ${(event.target as any).tagName}: ${(event.target as any).src || (event.target as any).href}`);
      }
    }, true);
  }

  private updateVital(vital: keyof EnhancedWebVitals, value: number): void {
    // Store the latest vital measurement
    if (!this.currentVitals) {
      this.currentVitals = {} as EnhancedWebVitals;
    }
    this.currentVitals[vital] = value;

    // Check against performance budgets
    this.checkPerformanceBudget(vital, value);
  }

  private currentVitals: EnhancedWebVitals = {} as EnhancedWebVitals;
  private errorCounts = { js: 0, network: 0, resource: 0 };

  private trackError(type: 'js' | 'promise' | 'resource' | 'network', message: string, filename?: string, line?: number): void {
    const errorType = type === 'promise' ? 'js' : type;
    this.errorCounts[errorType as keyof typeof this.errorCounts]++;

    // Log error for debugging
    console.error(`Performance Monitor - ${type} error:`, {
      message,
      filename,
      line,
      timestamp: new Date().toISOString()
    });

    // Check for error spikes
    this.checkErrorSpike();
  }

  private analyzeResourcePerformance(entries: PerformanceResourceTiming[]): void {
    const resources = {
      images: { count: 0, size: 0, totalLoadTime: 0 },
      scripts: { count: 0, size: 0, totalLoadTime: 0 },
      stylesheets: { count: 0, size: 0, totalLoadTime: 0 },
    };

    entries.forEach(entry => {
      const loadTime = entry.responseEnd - entry.startTime;
      const size = entry.transferSize || 0;

      if (entry.initiatorType === 'img') {
        resources.images.count++;
        resources.images.size += size;
        resources.images.totalLoadTime += loadTime;
      } else if (entry.initiatorType === 'script') {
        resources.scripts.count++;
        resources.scripts.size += size;
        resources.scripts.totalLoadTime += loadTime;
      } else if (entry.initiatorType === 'css' || entry.initiatorType === 'link') {
        resources.stylesheets.count++;
        resources.stylesheets.size += size;
        resources.stylesheets.totalLoadTime += loadTime;
      }
    });

    // Check for resource bloat
    const totalSize = resources.images.size + resources.scripts.size + resources.stylesheets.size;
    if (totalSize > PERFORMANCE_BUDGETS.resourceSize.needs_improvement) {
      this.createAlert('resource_bloat', 'high', 'totalResourceSize', totalSize, PERFORMANCE_BUDGETS.resourceSize.needs_improvement, 
        `Total resource size (${Math.round(totalSize / 1024)}KB) exceeds performance budget`);
    }
  }

  private checkPerformanceBudget(metric: keyof EnhancedWebVitals, value: number): void {
    const budget = PERFORMANCE_BUDGETS[metric];
    if (!budget) return;

    if (value > budget.needs_improvement) {
      this.createAlert('budget_exceeded', 'high', metric, value, budget.needs_improvement,
        `${metric.toUpperCase()} (${Math.round(value)}${metric === 'cls' ? '' : 'ms'}) exceeds performance budget`);
    } else if (value > budget.good) {
      this.createAlert('vital_poor', 'medium', metric, value, budget.good,
        `${metric.toUpperCase()} (${Math.round(value)}${metric === 'cls' ? '' : 'ms'}) needs improvement`);
    }
  }

  private checkErrorSpike(): void {
    const totalErrors = this.errorCounts.js + this.errorCounts.network + this.errorCounts.resource;
    if (totalErrors > 5) { // More than 5 errors in current session
      this.createAlert('error_spike', 'critical', 'errorCount', totalErrors, 5,
        `Error spike detected: ${totalErrors} errors in current session`);
    }
  }

  private createAlert(type: PerformanceAlert['type'], severity: PerformanceAlert['severity'], 
                     metric: string, value: number, threshold: number, message: string): void {
    const alert: PerformanceAlert = {
      id: `${type}_${metric}_${Date.now()}`,
      type,
      severity,
      metric,
      value,
      threshold,
      message,
      timestamp: new Date().toISOString(),
      resolved: false
    };

    this.alerts.unshift(alert);
    
    // Keep only last 50 alerts
    if (this.alerts.length > 50) {
      this.alerts = this.alerts.slice(0, 50);
    }

    // Log critical alerts
    if (severity === 'critical') {
      console.error('🚨 Critical Performance Alert:', alert);
    }
  }

  private startPeriodicReporting(): void {
    // Report metrics every 30 seconds
    this.reportingInterval = window.setInterval(() => {
      this.collectAndReportMetrics();
    }, 30000);

    // Initial report after 5 seconds
    setTimeout(() => {
      this.collectAndReportMetrics();
    }, 5000);
  }

  private async collectAndReportMetrics(): Promise<void> {
    const metrics = await this.getCurrentMetrics();
    this.metrics.unshift(metrics);
    
    // Keep only last 100 metric snapshots
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(0, 100);
    }

    // Report to analytics if needed (could send to your backend)
    if (process.env.NODE_ENV === 'production') {
      this.reportToAnalytics(metrics);
    }
  }

  private async getCurrentMetrics(): Promise<PerformanceMetrics> {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    
    // Get memory info if available
    const memory = (performance as any).memory ? {
      usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
      totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
      jsHeapSizeLimit: (performance as any).memory.jsHeapSizeLimit,
    } : undefined;

    // Get connection info if available
    const connection = (navigator as any).connection ? {
      effectiveType: (navigator as any).connection.effectiveType,
      downlink: (navigator as any).connection.downlink,
      rtt: (navigator as any).connection.rtt,
    } : undefined;

    // Calculate resource stats
    const imageResources = resources.filter(r => r.initiatorType === 'img');
    const scriptResources = resources.filter(r => r.initiatorType === 'script');
    const styleResources = resources.filter(r => r.initiatorType === 'css' || r.initiatorType === 'link');

    return {
      vitals: { ...this.currentVitals },
      navigation: {
        loadTime: navigation ? navigation.loadEventEnd - navigation.fetchStart : 0,
        domContentLoaded: navigation ? navigation.domContentLoadedEventEnd - navigation.fetchStart : 0,
        resourceCount: resources.length,
        totalSize: resources.reduce((sum, r) => sum + (r.transferSize || 0), 0),
      },
      resources: {
        images: {
          count: imageResources.length,
          size: imageResources.reduce((sum, r) => sum + (r.transferSize || 0), 0),
          avgLoadTime: imageResources.length > 0 
            ? imageResources.reduce((sum, r) => sum + (r.responseEnd - r.startTime), 0) / imageResources.length 
            : 0
        },
        scripts: {
          count: scriptResources.length,
          size: scriptResources.reduce((sum, r) => sum + (r.transferSize || 0), 0),
          avgLoadTime: scriptResources.length > 0 
            ? scriptResources.reduce((sum, r) => sum + (r.responseEnd - r.startTime), 0) / scriptResources.length 
            : 0
        },
        stylesheets: {
          count: styleResources.length,
          size: styleResources.reduce((sum, r) => sum + (r.transferSize || 0), 0),
          avgLoadTime: styleResources.length > 0 
            ? styleResources.reduce((sum, r) => sum + (r.responseEnd - r.startTime), 0) / styleResources.length 
            : 0
        }
      },
      memory,
      connection,
      errors: {
        jsErrors: this.errorCounts.js,
        networkErrors: this.errorCounts.network,
        resourceErrors: this.errorCounts.resource,
      },
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    };
  }

  private async reportToAnalytics(metrics: PerformanceMetrics): Promise<void> {
    try {
      // Only report significant metrics to avoid spam
      const shouldReport = metrics.vitals.lcp > PERFORMANCE_BUDGETS.lcp.good ||
                          metrics.vitals.cls > PERFORMANCE_BUDGETS.cls.good ||
                          metrics.vitals.fid > PERFORMANCE_BUDGETS.fid.good ||
                          metrics.errors.jsErrors > 0 ||
                          metrics.errors.networkErrors > 0;

      if (shouldReport) {
        await supabase.functions.invoke('track-performance-metrics', {
          body: { metrics }
        });
      }
    } catch (error) {
      console.warn('Failed to report performance metrics:', error);
    }
  }

  // Public API
  getLatestMetrics(): PerformanceMetrics | null {
    return this.metrics[0] || null;
  }

  getMetricsHistory(): PerformanceMetrics[] {
    return [...this.metrics];
  }

  getActiveAlerts(): PerformanceAlert[] {
    return this.alerts.filter(alert => !alert.resolved);
  }

  getAllAlerts(): PerformanceAlert[] {
    return [...this.alerts];
  }

  resolveAlert(alertId: string): void {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
    }
  }

  getPerformanceScore(): number {
    const latest = this.getLatestMetrics();
    if (!latest) return 0;

    let score = 100;
    
    // Deduct points for poor vitals
    if (latest.vitals.lcp > PERFORMANCE_BUDGETS.lcp.needs_improvement) score -= 20;
    else if (latest.vitals.lcp > PERFORMANCE_BUDGETS.lcp.good) score -= 10;
    
    if (latest.vitals.cls > PERFORMANCE_BUDGETS.cls.needs_improvement) score -= 20;
    else if (latest.vitals.cls > PERFORMANCE_BUDGETS.cls.good) score -= 10;
    
    if (latest.vitals.fid > PERFORMANCE_BUDGETS.fid.needs_improvement) score -= 20;
    else if (latest.vitals.fid > PERFORMANCE_BUDGETS.fid.good) score -= 10;

    // Deduct points for errors
    score -= Math.min(30, latest.errors.jsErrors * 5 + latest.errors.networkErrors * 3 + latest.errors.resourceErrors * 2);

    return Math.max(0, score);
  }

  stop(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
    
    if (this.reportingInterval) {
      clearInterval(this.reportingInterval);
      this.reportingInterval = undefined;
    }
    
    this.isMonitoring = false;
    console.log('🛑 Enhanced Performance Monitor stopped');
  }
}

export const performanceMonitor = EnhancedPerformanceMonitor.getInstance();
