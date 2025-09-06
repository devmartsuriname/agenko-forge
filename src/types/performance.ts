/**
 * Shared performance monitoring types
 */

export interface WebVitalsMetrics {
  lcp: number; // Largest Contentful Paint
  cls: number; // Cumulative Layout Shift 
  fid: number; // First Input Delay
  ttfb: number; // Time to First Byte
  fcp: number; // First Contentful Paint
}

export interface PerformanceData {
  vitals: WebVitalsMetrics;
  pageLoadTime: number;
  domContentLoaded: number;
  memoryUsage: number;
  networkStatus: 'online' | 'offline';
  resourceCount: number;
  bundleSize: number;
  errorCount: number;
  timestamp: string;
}

export interface PerformanceMetric {
  name: string;
  value: number;
  threshold: number;
  unit: string;
  status: 'good' | 'warning' | 'error';
}

export interface TestResult {
  name: string;
  duration: number;
  success: boolean;
  error?: string;
}

export interface PerformanceAlert {
  type: string;
  severity: 'low' | 'medium' | 'high';
  metric: string;
  value: number;
  message: string;
  timestamp: string;
}

export interface NavigationMetrics {
  domContentLoaded: number;
  loadComplete: number;
  totalLoadTime: number;
  networkLatency: number;
  renderTime: number;
}

export interface MemoryUsage {
  used: number;
  total: number;
  limit: number;
}

export type VitalStatus = 'good' | 'needs-improvement' | 'poor';

export interface VitalThreshold {
  good: number;
  poor: number;
}

export const PERFORMANCE_THRESHOLDS: Record<keyof WebVitalsMetrics, VitalThreshold> = {
  lcp: { good: 2500, poor: 4000 },
  cls: { good: 0.1, poor: 0.25 },
  fid: { good: 100, poor: 300 },
  ttfb: { good: 800, poor: 1800 },
  fcp: { good: 1800, poor: 3000 }
};