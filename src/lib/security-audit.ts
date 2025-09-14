/**
 * Security audit and monitoring utilities
 */

import { logger } from './logger';
import { maskSensitiveData, logSecurityEvent } from './security-utils';

export interface SecurityAuditEvent {
  type: 'authentication' | 'authorization' | 'data_access' | 'data_modification' | 'suspicious_activity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  source: string;
  userId?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  details: any;
  timestamp: string;
}

class SecurityAuditor {
  private events: SecurityAuditEvent[] = [];
  private maxEvents = 1000; // Keep last 1000 events in memory
  
  /**
   * Log a security audit event
   */
  logEvent(event: Omit<SecurityAuditEvent, 'timestamp'>): void {
    const auditEvent: SecurityAuditEvent = {
      ...event,
      timestamp: new Date().toISOString(),
      details: maskSensitiveData(event.details)
    };
    
    // Add to memory store
    this.events.push(auditEvent);
    
    // Keep only the most recent events
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }
    
    // Log to console/external service based on severity
    switch (event.severity) {
      case 'critical':
      case 'high':
        logger.error(`SECURITY AUDIT [${event.severity.toUpperCase()}]`, auditEvent, 'security-audit');
        break;
      case 'medium':
        logger.warn(`SECURITY AUDIT [${event.severity.toUpperCase()}]`, auditEvent, 'security-audit');
        break;
      case 'low':
        logger.info(`SECURITY AUDIT [${event.severity.toUpperCase()}]`, auditEvent, 'security-audit');
        break;
    }
    
    // Store in localStorage for debugging (masked data only)
    this.persistEvent(auditEvent);
  }
  
  /**
   * Get security events by type
   */
  getEventsByType(type: SecurityAuditEvent['type']): SecurityAuditEvent[] {
    return this.events.filter(event => event.type === type);
  }
  
  /**
   * Get events by severity
   */
  getEventsBySeverity(severity: SecurityAuditEvent['severity']): SecurityAuditEvent[] {
    return this.events.filter(event => event.severity === severity);
  }
  
  /**
   * Get recent events within time range
   */
  getRecentEvents(minutesAgo: number = 60): SecurityAuditEvent[] {
    const cutoff = new Date(Date.now() - minutesAgo * 60 * 1000).toISOString();
    return this.events.filter(event => event.timestamp >= cutoff);
  }
  
  /**
   * Detect suspicious patterns
   */
  detectSuspiciousActivity(): {
    hasActivity: boolean;
    patterns: string[];
    recommendations: string[];
  } {
    const patterns: string[] = [];
    const recommendations: string[] = [];
    const recentEvents = this.getRecentEvents(60); // Last hour
    
    // Pattern 1: Multiple failed authentication attempts
    const failedAuth = recentEvents.filter(e => 
      e.type === 'authentication' && 
      e.details?.success === false
    );
    
    if (failedAuth.length > 5) {
      patterns.push(`${failedAuth.length} failed authentication attempts in the last hour`);
      recommendations.push('Consider implementing account lockout after failed attempts');
    }
    
    // Pattern 2: Suspicious data access patterns
    const dataAccess = recentEvents.filter(e => e.type === 'data_access');
    const uniqueUsers = new Set(dataAccess.map(e => e.userId)).size;
    const accessCount = dataAccess.length;
    
    if (accessCount > 100 && uniqueUsers < 3) {
      patterns.push(`High volume data access (${accessCount} requests) from few users (${uniqueUsers})`);
      recommendations.push('Review data access patterns for potential data scraping');
    }
    
    // Pattern 3: Multiple high-severity events
    const highSeverityEvents = recentEvents.filter(e => 
      e.severity === 'high' || e.severity === 'critical'
    );
    
    if (highSeverityEvents.length > 3) {
      patterns.push(`${highSeverityEvents.length} high-severity security events`);
      recommendations.push('Immediate security review recommended');
    }
    
    // Pattern 4: Unusual IP addresses
    const ipAddresses = recentEvents
      .map(e => e.ipAddress)
      .filter(ip => ip)
      .reduce((acc, ip) => acc.set(ip, (acc.get(ip) || 0) + 1), new Map());
    
    const suspiciousIPs = Array.from(ipAddresses.entries())
      .filter(([ip, count]) => count > 50)
      .map(([ip]) => ip);
    
    if (suspiciousIPs.length > 0) {
      patterns.push(`High activity from IP addresses: ${suspiciousIPs.join(', ')}`);
      recommendations.push('Consider implementing IP-based rate limiting');
    }
    
    return {
      hasActivity: patterns.length > 0,
      patterns,
      recommendations
    };
  }
  
  /**
   * Generate security summary
   */
  generateSecuritySummary(hoursBack: number = 24): {
    totalEvents: number;
    eventsByType: Record<string, number>;
    eventsBySeverity: Record<string, number>;
    topSources: Array<{ source: string; count: number }>;
    suspiciousActivity: ReturnType<typeof SecurityAuditor.prototype.detectSuspiciousActivity>;
  } {
    const events = this.getRecentEvents(hoursBack * 60);
    
    const eventsByType = events.reduce((acc, event) => {
      acc[event.type] = (acc[event.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const eventsBySeverity = events.reduce((acc, event) => {
      acc[event.severity] = (acc[event.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const sourceCounts = events.reduce((acc, event) => {
      acc[event.source] = (acc[event.source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const topSources = Object.entries(sourceCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([source, count]) => ({ source, count }));
    
    return {
      totalEvents: events.length,
      eventsByType,
      eventsBySeverity,
      topSources,
      suspiciousActivity: this.detectSuspiciousActivity()
    };
  }
  
  /**
   * Clear old events and clean up storage
   */
  cleanup(): void {
    // Keep only last 24 hours of events
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    this.events = this.events.filter(event => event.timestamp >= cutoff);
    
    // Clean up localStorage
    try {
      const stored = JSON.parse(localStorage.getItem('security_audit_events') || '[]');
      const filtered = stored.filter((event: SecurityAuditEvent) => event.timestamp >= cutoff);
      localStorage.setItem('security_audit_events', JSON.stringify(filtered.slice(-500))); // Keep last 500
    } catch (error) {
      logger.error('Security audit cleanup failed', error, 'security-audit');
    }
  }
  
  /**
   * Persist event to localStorage for debugging
   */
  private persistEvent(event: SecurityAuditEvent): void {
    try {
      const stored = JSON.parse(localStorage.getItem('security_audit_events') || '[]');
      stored.push(event);
      
      // Keep only last 500 events
      if (stored.length > 500) {
        stored.splice(0, stored.length - 500);
      }
      
      localStorage.setItem('security_audit_events', JSON.stringify(stored));
    } catch (error) {
      // Fail silently if localStorage is not available
    }
  }
}

// Export singleton instance
export const securityAuditor = new SecurityAuditor();

// Convenience functions for common audit events
export const auditAuth = {
  loginSuccess: (userId: string, details: any = {}) => {
    securityAuditor.logEvent({
      type: 'authentication',
      severity: 'low',
      source: 'auth_system',
      userId,
      details: { ...details, success: true, action: 'login' }
    });
  },
  
  loginFailure: (email: string, reason: string, details: any = {}) => {
    securityAuditor.logEvent({
      type: 'authentication',
      severity: 'medium',
      source: 'auth_system',
      details: { ...details, success: false, email: maskSensitiveData(email), reason, action: 'login' }
    });
  },
  
  logout: (userId: string, details: any = {}) => {
    securityAuditor.logEvent({
      type: 'authentication',
      severity: 'low',
      source: 'auth_system',
      userId,
      details: { ...details, action: 'logout' }
    });
  },
  
  passwordChange: (userId: string, details: any = {}) => {
    securityAuditor.logEvent({
      type: 'authentication',
      severity: 'medium',
      source: 'auth_system',
      userId,
      details: { ...details, action: 'password_change' }
    });
  }
};

export const auditData = {
  sensitiveAccess: (table: string, operation: string, userId?: string, recordId?: string) => {
    // Only log admin operations as low severity for normal access patterns
    const severity = (operation === 'SELECT' && userId) ? 'low' : 'medium';
    securityAuditor.logEvent({
      type: 'data_access',
      severity,
      source: 'database',
      userId,
      details: { table, operation, recordId }
    });
  },
  
  massOperation: (table: string, operation: string, count: number, userId?: string) => {
    securityAuditor.logEvent({
      type: 'data_modification',
      severity: count > 100 ? 'high' : 'medium',
      source: 'database',
      userId,
      details: { table, operation, count, action: 'bulk_operation' }
    });
  },
  
  unauthorizedAccess: (resource: string, userId?: string, details: any = {}) => {
    securityAuditor.logEvent({
      type: 'authorization',
      severity: 'high',
      source: 'access_control',
      userId,
      details: { ...details, resource, action: 'unauthorized_access' }
    });
  }
};

export const auditSuspicious = {
  rateLimitExceeded: (identifier: string, limit: number, details: any = {}) => {
    securityAuditor.logEvent({
      type: 'suspicious_activity',
      severity: 'medium',
      source: 'rate_limiter',
      details: { ...details, identifier, limit, action: 'rate_limit_exceeded' }
    });
  },
  
  suspiciousPattern: (pattern: string, severity: SecurityAuditEvent['severity'], details: any = {}) => {
    securityAuditor.logEvent({
      type: 'suspicious_activity',
      severity,
      source: 'pattern_detection',
      details: { ...details, pattern, action: 'suspicious_pattern_detected' }
    });
  },
  
  securityBypass: (bypass: string, userId?: string, details: any = {}) => {
    securityAuditor.logEvent({
      type: 'suspicious_activity',
      severity: 'critical',
      source: 'security_system',
      userId,
      details: { ...details, bypass, action: 'security_bypass_attempt' }
    });
  }
};

// Auto-cleanup every hour
if (typeof window !== 'undefined') {
  setInterval(() => {
    securityAuditor.cleanup();
  }, 60 * 60 * 1000); // 1 hour
}
