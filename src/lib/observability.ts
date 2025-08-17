import { supabase } from '@/integrations/supabase/client';

// Logging levels for structured logging
export const LogLevel = {
  DEBUG: 'debug',
  INFO: 'info', 
  WARN: 'warn',
  ERROR: 'error',
  CRITICAL: 'critical'
} as const;

export type LogLevel = typeof LogLevel[keyof typeof LogLevel];

// Application areas for categorizing logs
export const LogArea = {
  AUTH: 'auth',
  CMS: 'cms',
  CONTACT: 'contact',
  ADMIN: 'admin',
  API: 'api',
  RATE_LIMIT: 'rate_limit',
  MAINTENANCE: 'maintenance'
} as const;

export type LogArea = typeof LogArea[keyof typeof LogArea];

interface LogEvent {
  level: LogLevel;
  area: LogArea;
  message: string;
  route?: string;
  meta?: Record<string, any>;
}

interface LogError extends Omit<LogEvent, 'level'> {
  error_code?: string;
  stack?: string;
}

// Sampling configuration
const SAMPLING_CONFIG = {
  [LogLevel.CRITICAL]: 1.0, // Always log critical errors
  [LogLevel.ERROR]: 1.0,    // Always log errors
  [LogLevel.WARN]: 0.5,     // Sample 50% of warnings
  [LogLevel.INFO]: 0.2,     // Sample 20% of info logs
  [LogLevel.DEBUG]: 0.1     // Sample 10% of debug logs
};

/**
 * PII Redaction helper - client-side implementation
 */
function redactPII(text: string): string {
  if (!text) return text;
  
  // Redact email patterns
  text = text.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[EMAIL_REDACTED]');
  
  // Redact phone number patterns
  text = text.replace(/(\+?1?[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}/g, '[PHONE_REDACTED]');
  
  // Redact potential tokens (long alphanumeric strings)
  text = text.replace(/\b[A-Za-z0-9]{32,}\b/g, '[TOKEN_REDACTED]');
  
  return text;
}

/**
 * Determine if a log should be sampled based on level
 */
function shouldSample(level: LogLevel): boolean {
  const samplingRate = SAMPLING_CONFIG[level] || 1.0;
  return Math.random() < samplingRate;
}

/**
 * Get current route for logging context
 */
function getCurrentRoute(): string {
  if (typeof window !== 'undefined') {
    return window.location.pathname;
  }
  return '';
}

/**
 * Get current user ID for logging context
 */
async function getCurrentUserId(): Promise<string | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id || null;
  } catch {
    return null;
  }
}

/**
 * Log application events with sampling and PII redaction
 */
export async function logEvent(event: LogEvent): Promise<void> {
  // Check sampling
  if (!shouldSample(event.level)) {
    return;
  }

  try {
    const userId = await getCurrentUserId();
    const route = event.route || getCurrentRoute();
    
    // Redact PII from message and meta
    const sanitizedMessage = redactPII(event.message);
    const sanitizedMeta = event.meta ? 
      JSON.parse(redactPII(JSON.stringify(event.meta))) : {};

    const { error } = await supabase.rpc('log_app_event', {
      p_level: event.level,
      p_area: event.area,
      p_message: sanitizedMessage,
      p_route: route,
      p_user_id: userId,
      p_meta: sanitizedMeta
    });

    if (error) {
      console.error('Failed to log event:', error);
    }
  } catch (err) {
    console.error('Logging error:', err);
  }
}

/**
 * Log errors with sampling and PII redaction
 */
export async function logError(errorEvent: LogError & { error?: Error }): Promise<void> {
  // Always log errors (no sampling)
  try {
    const userId = await getCurrentUserId();
    const route = errorEvent.route || getCurrentRoute();
    
    // Extract error details
    const error = errorEvent.error;
    const stack = error?.stack || errorEvent.stack || '';
    const errorCode = errorEvent.error_code || error?.name || 'UNKNOWN_ERROR';
    
    // Redact PII
    const sanitizedMessage = redactPII(errorEvent.message);
    const sanitizedStack = redactPII(stack);
    const sanitizedMeta = errorEvent.meta ? 
      JSON.parse(redactPII(JSON.stringify(errorEvent.meta))) : {};

    const { error: logError } = await supabase.rpc('log_error', {
      p_area: errorEvent.area,
      p_message: sanitizedMessage,
      p_route: route,
      p_user_id: userId,
      p_error_code: errorCode,
      p_stack: sanitizedStack,
      p_meta: sanitizedMeta
    });

    if (logError) {
      console.error('Failed to log error:', logError);
    }
  } catch (err) {
    console.error('Error logging error:', err);
  }
}

/**
 * Convenience functions for common log levels
 */
export const logger = {
  debug: (area: LogArea, message: string, meta?: Record<string, any>, route?: string) =>
    logEvent({ level: LogLevel.DEBUG, area, message, meta, route }),
    
  info: (area: LogArea, message: string, meta?: Record<string, any>, route?: string) =>
    logEvent({ level: LogLevel.INFO, area, message, meta, route }),
    
  warn: (area: LogArea, message: string, meta?: Record<string, any>, route?: string) =>
    logEvent({ level: LogLevel.WARN, area, message, meta, route }),
    
  error: (area: LogArea, message: string, error?: Error, meta?: Record<string, any>, route?: string) =>
    logError({ area, message, error, meta, route }),
    
  critical: (area: LogArea, message: string, error?: Error, meta?: Record<string, any>, route?: string) =>
    logError({ area, message, error, meta, route })
};

/**
 * Check rate limits using the database function
 */
export async function checkRateLimit(
  identifier: string, 
  maxRequests: number = 10, 
  windowMinutes: number = 1
): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('check_rate_limit', {
      p_identifier: identifier,
      p_max_requests: maxRequests,
      p_window_minutes: windowMinutes
    });

    if (error) {
      console.error('Rate limit check failed:', error);
      return false; // Fail closed - deny request if check fails
    }

    return data === true;
  } catch (err) {
    console.error('Rate limit check error:', err);
    return false; // Fail closed
  }
}

/**
 * Get system health status
 */
export async function getHealthStatus(): Promise<any> {
  try {
    const { data, error } = await supabase.rpc('health_check');
    
    if (error) {
      throw new Error(error.message);
    }
    
    return data;
  } catch (err) {
    return {
      status: 'error',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: err instanceof Error ? err.message : 'Unknown error'
    };
  }
}