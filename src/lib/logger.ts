/**
 * Production-safe logging system
 * Automatically strips logs in production builds while preserving errors
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  data?: any;
  timestamp: string;
  source?: string;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private isProduction = process.env.NODE_ENV === 'production';

  /**
   * Debug logs - stripped in production
   */
  debug(message: string, data?: any, source?: string) {
    if (this.isDevelopment) {
      console.log(`🐛 [DEBUG${source ? `:${source}` : ''}]`, message, data);
    }
  }

  /**
   * Info logs - stripped in production unless critical
   */
  info(message: string, data?: any, source?: string) {
    if (this.isDevelopment) {
      console.info(`ℹ️ [INFO${source ? `:${source}` : ''}]`, message, data);
    }
  }

  /**
   * Warning logs - kept in production for monitoring
   */
  warn(message: string, data?: any, source?: string) {
    if (this.isDevelopment) {
      console.warn(`⚠️ [WARN${source ? `:${source}` : ''}]`, message, data);
    } else if (this.isProduction) {
      // In production, only log warnings that are actionable
      console.warn(`[WARN${source ? `:${source}` : ''}]`, message);
    }
  }

  /**
   * Error logs - always kept for debugging
   */
  error(message: string, error?: any, source?: string) {
    const errorData = error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: error.stack
    } : error;

    if (this.isDevelopment) {
      console.error(`❌ [ERROR${source ? `:${source}` : ''}]`, message, errorData);
    } else {
      console.error(`[ERROR${source ? `:${source}` : ''}]`, message, errorData);
    }

    // In production, could send to error reporting service
    if (this.isProduction) {
      this.reportError(message, errorData, source);
    }
  }

  /**
   * Performance logs - development only
   */
  perf(message: string, data?: any, source?: string) {
    if (this.isDevelopment) {
      console.log(`⚡ [PERF${source ? `:${source}` : ''}]`, message, data);
    }
  }

  /**
   * Auth-specific logs with privacy protection
   */
  auth(message: string, data?: any) {
    const sanitizedData = this.sanitizeAuthData(data);
    if (this.isDevelopment) {
      console.log(`🔐 [AUTH]`, message, sanitizedData);
    }
  }

  /**
   * Admin-specific logs with audit trail
   */
  admin(message: string, data?: any, userId?: string) {
    const logEntry = {
      message,
      data: this.sanitizeAdminData(data),
      userId,
      timestamp: new Date().toISOString()
    };

    if (this.isDevelopment) {
      console.log(`👤 [ADMIN]`, logEntry);
    }
    
    // In production, admin actions should be logged for audit
    if (this.isProduction && userId) {
      this.auditLog(logEntry);
    }
  }

  /**
   * Network request logs - development only
   */
  network(method: string, url: string, status?: number, data?: any) {
    if (this.isDevelopment) {
      const statusIcon = status >= 400 ? '❌' : status >= 300 ? '⚠️' : '✅';
      console.log(`🌐 [NETWORK] ${statusIcon} ${method} ${url}`, { status, ...data });
    }
  }

  private sanitizeAuthData(data: any): any {
    if (!data) return data;
    
    const sanitized = { ...data };
    // Remove sensitive fields
    delete sanitized.password;
    delete sanitized.token;
    delete sanitized.refresh_token;
    delete sanitized.access_token;
    
    // Mask email for privacy
    if (sanitized.email) {
      const [user, domain] = sanitized.email.split('@');
      sanitized.email = `${user.substring(0, 2)}***@${domain}`;
    }
    
    return sanitized;
  }

  private sanitizeAdminData(data: any): any {
    if (!data) return data;
    
    const sanitized = { ...data };
    // Remove sensitive admin data
    delete sanitized.password;
    delete sanitized.api_key;
    delete sanitized.secret;
    
    return sanitized;
  }

  private reportError(message: string, error: any, source?: string) {
    // In production, this would send to error reporting service
    // For now, just ensure errors are captured
    try {
      const errorReport = {
        message,
        error,
        source,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent
      };
      
      // Store in localStorage as fallback for debugging
      const errors = JSON.parse(localStorage.getItem('app_errors') || '[]');
      errors.push(errorReport);
      
      // Keep only last 10 errors
      if (errors.length > 10) {
        errors.splice(0, errors.length - 10);
      }
      
      localStorage.setItem('app_errors', JSON.stringify(errors));
    } catch (e) {
      // Fail silently if error reporting fails
    }
  }

  private auditLog(entry: any) {
    // In production, this would send to audit service
    try {
      const auditEntry = {
        level: 'info' as LogLevel,
        ...entry,
        timestamp: new Date().toISOString()
      };
      
      const auditLogs = JSON.parse(localStorage.getItem('admin_audit') || '[]');
      auditLogs.push(auditEntry);
      
      // Keep only last 50 audit entries
      if (auditLogs.length > 50) {
        auditLogs.splice(0, auditLogs.length - 50);
      }
      
      localStorage.setItem('admin_audit', JSON.stringify(auditLogs));
    } catch (e) {
      // Fail silently if audit logging fails
    }
  }

  /**
   * Clear stored logs (for GDPR compliance)
   */
  clearStoredLogs() {
    try {
      localStorage.removeItem('app_errors');
      localStorage.removeItem('admin_audit');
    } catch (e) {
      // Fail silently
    }
  }
}

// Export singleton instance
export const logger = new Logger();

// Convenience exports for common patterns
export const log = {
  debug: (msg: string, data?: any, source?: string) => logger.debug(msg, data, source),
  info: (msg: string, data?: any, source?: string) => logger.info(msg, data, source),
  warn: (msg: string, data?: any, source?: string) => logger.warn(msg, data, source),
  error: (msg: string, error?: any, source?: string) => logger.error(msg, error, source),
  perf: (msg: string, data?: any, source?: string) => logger.perf(msg, data, source),
  auth: (msg: string, data?: any) => logger.auth(msg, data),
  admin: (msg: string, data?: any, userId?: string) => logger.admin(msg, data, userId),
  network: (method: string, url: string, status?: number, data?: any) => logger.network(method, url, status, data)
};
