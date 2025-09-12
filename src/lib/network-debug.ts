/**
 * Network Debugging and Monitoring Utilities
 * Provides comprehensive network request monitoring, logging, and debugging tools
 */

import { logger } from './logger';

export interface NetworkRequest {
  id: string;
  url: string;
  method: string;
  timestamp: number;
  status?: number;
  statusText?: string;
  duration?: number;
  size?: number;
  error?: string;
  headers?: Record<string, string>;
  requestBody?: any;
  responseBody?: any;
  retryCount?: number;
}

export interface NetworkStats {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  slowestRequest: NetworkRequest | null;
  errorRate: number;
}

class NetworkDebugger {
  private requests: Map<string, NetworkRequest> = new Map();
  private isEnabled = false;
  private maxStoredRequests = 100;
  private slowRequestThreshold = 2000; // 2 seconds
  
  constructor() {
    // Enable by default in development
    this.isEnabled = process.env.NODE_ENV === 'development';
  }

  /**
   * Enable network debugging
   */
  enable() {
    this.isEnabled = true;
    if (typeof window !== 'undefined') {
      this.interceptFetch();
      logger.info('Network debugging enabled', undefined, 'network-debug');
    }
  }

  /**
   * Disable network debugging
   */
  disable() {
    this.isEnabled = false;
    logger.info('Network debugging disabled', undefined, 'network-debug');
  }

  /**
   * Intercept fetch requests for monitoring
   */
  private interceptFetch() {
    if (typeof window === 'undefined' || (window.fetch as any).__networkDebugger) {
      return; // Already intercepted or not in browser
    }

    const originalFetch = window.fetch;
    const self = this;

    window.fetch = async function(...args: Parameters<typeof fetch>) {
      const requestId = self.generateRequestId();
      const url = typeof args[0] === 'string' ? args[0] : 
                  args[0] instanceof URL ? args[0].href : 
                  (args[0] as Request).url;
      const method = args[1]?.method || 'GET';
      const startTime = performance.now();

      // Create initial request record
      const request: NetworkRequest = {
        id: requestId,
        url,
        method,
        timestamp: Date.now(),
        headers: self.extractHeaders(args[1]?.headers),
        requestBody: self.extractRequestBody(args[1]?.body)
      };

      self.addRequest(request);

      try {
        const response = await originalFetch.apply(this, args);
        const endTime = performance.now();
        const duration = endTime - startTime;

        // Clone response to read body without consuming it
        const responseClone = response.clone();
        let responseBody;
        
        try {
          const contentType = response.headers.get('content-type');
          if (contentType?.includes('application/json')) {
            responseBody = await responseClone.json();
          } else if (contentType?.includes('text')) {
            responseBody = await responseClone.text();
          }
        } catch {
          // Ignore body parsing errors
        }

        // Update request with response data
        const updatedRequest: NetworkRequest = {
          ...request,
          status: response.status,
          statusText: response.statusText,
          duration,
          size: self.getResponseSize(response),
          responseBody
        };

        self.updateRequest(requestId, updatedRequest);
        self.logRequest(updatedRequest);

        return response;
      } catch (error) {
        const endTime = performance.now();
        const duration = endTime - startTime;

        // Update request with error data
        const updatedRequest: NetworkRequest = {
          ...request,
          duration,
          error: error instanceof Error ? error.message : 'Network error'
        };

        self.updateRequest(requestId, updatedRequest);
        self.logRequest(updatedRequest);

        throw error;
      }
    };

    // Mark fetch as intercepted
    (window.fetch as any).__networkDebugger = true;
  }

  /**
   * Generate unique request ID
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Extract headers from request
   */
  private extractHeaders(headers?: HeadersInit): Record<string, string> {
    if (!headers) return {};
    
    if (headers instanceof Headers) {
      const result: Record<string, string> = {};
      headers.forEach((value, key) => {
        result[key] = value;
      });
      return result;
    }
    
    if (Array.isArray(headers)) {
      const result: Record<string, string> = {};
      headers.forEach(([key, value]) => {
        result[key] = value;
      });
      return result;
    }
    
    return headers as Record<string, string>;
  }

  /**
   * Extract request body
   */
  private extractRequestBody(body?: BodyInit): any {
    if (!body) return undefined;
    
    if (typeof body === 'string') {
      try {
        return JSON.parse(body);
      } catch {
        return body;
      }
    }
    
    return '[Binary Data]';
  }

  /**
   * Get response size estimate
   */
  private getResponseSize(response: Response): number {
    const contentLength = response.headers.get('content-length');
    return contentLength ? parseInt(contentLength, 10) : 0;
  }

  /**
   * Add new request to tracking
   */
  private addRequest(request: NetworkRequest) {
    if (!this.isEnabled) return;
    
    this.requests.set(request.id, request);
    
    // Limit stored requests to prevent memory issues
    if (this.requests.size > this.maxStoredRequests) {
      const oldestKey = this.requests.keys().next().value;
      this.requests.delete(oldestKey);
    }
  }

  /**
   * Update existing request
   */
  private updateRequest(id: string, request: NetworkRequest) {
    if (!this.isEnabled) return;
    this.requests.set(id, request);
  }

  /**
   * Log request for debugging
   */
  private logRequest(request: NetworkRequest) {
    if (!this.isEnabled) return;

    const { url, method, status, duration, error } = request;
    
    if (error) {
      logger.error(`Network request failed: ${method} ${url}`, {
        error,
        duration,
        requestId: request.id
      }, 'network');
    } else if (duration && duration > this.slowRequestThreshold) {
      logger.warn(`Slow network request: ${method} ${url}`, {
        status,
        duration: `${duration.toFixed(2)}ms`,
        requestId: request.id
      }, 'network');
    } else {
      logger.debug(`Network request: ${method} ${url}`, {
        status,
        duration: duration ? `${duration.toFixed(2)}ms` : undefined,
        requestId: request.id
      }, 'network');
    }
  }

  /**
   * Get all tracked requests
   */
  getRequests(): NetworkRequest[] {
    return Array.from(this.requests.values()).sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Get requests filtered by criteria
   */
  getFilteredRequests(filter: {
    status?: number;
    method?: string;
    url?: string;
    hasError?: boolean;
    timeRange?: { start: number; end: number };
  }): NetworkRequest[] {
    return this.getRequests().filter(request => {
      if (filter.status && request.status !== filter.status) return false;
      if (filter.method && request.method !== filter.method) return false;
      if (filter.url && !request.url.includes(filter.url)) return false;
      if (filter.hasError !== undefined && !!request.error !== filter.hasError) return false;
      if (filter.timeRange) {
        const { start, end } = filter.timeRange;
        if (request.timestamp < start || request.timestamp > end) return false;
      }
      return true;
    });
  }

  /**
   * Get network statistics
   */
  getStats(): NetworkStats {
    const requests = this.getRequests();
    const successfulRequests = requests.filter(r => r.status && r.status >= 200 && r.status < 400);
    const failedRequests = requests.filter(r => r.error || (r.status && r.status >= 400));
    
    const durations = requests
      .filter(r => r.duration)
      .map(r => r.duration!);
    
    const averageResponseTime = durations.length > 0 
      ? durations.reduce((a, b) => a + b, 0) / durations.length 
      : 0;

    const slowestRequest = requests
      .filter(r => r.duration)
      .sort((a, b) => (b.duration || 0) - (a.duration || 0))[0] || null;

    return {
      totalRequests: requests.length,
      successfulRequests: successfulRequests.length,
      failedRequests: failedRequests.length,
      averageResponseTime,
      slowestRequest,
      errorRate: requests.length > 0 ? failedRequests.length / requests.length : 0
    };
  }

  /**
   * Clear all tracked requests
   */
  clearRequests() {
    this.requests.clear();
    logger.info('Network debug requests cleared', undefined, 'network-debug');
  }

  /**
   * Export requests as JSON for analysis
   */
  exportRequests(): string {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      requests: this.getRequests(),
      stats: this.getStats()
    }, null, 2);
  }
}

// Singleton instance
export const networkDebugger = new NetworkDebugger();

// Auto-enable in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  networkDebugger.enable();
}

export default networkDebugger;