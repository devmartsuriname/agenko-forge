/**
 * Security utility functions for data protection and validation
 */

import { logger } from './logger';

export interface DataMaskingOptions {
  maskEmail?: boolean;
  maskPhone?: boolean;
  maskCardNumbers?: boolean;
  preserveLength?: boolean;
  maskChar?: string;
}

/**
 * Masks sensitive data in strings or objects
 */
export function maskSensitiveData(
  data: any, 
  options: DataMaskingOptions = {}
): any {
  const {
    maskEmail = true,
    maskPhone = true,
    maskCardNumbers = true,
    preserveLength = true,
    maskChar = '*'
  } = options;

  if (typeof data === 'string') {
    let masked = data;
    
    if (maskEmail) {
      // Mask email addresses: j***@e*****.com
      masked = masked.replace(
        /([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g,
        (match, user, domain) => {
          const maskedUser = user.length > 2 ? 
            user.substring(0, 1) + maskChar.repeat(3) : 
            maskChar.repeat(user.length);
          const domainParts = domain.split('.');
          const maskedDomain = domainParts.length > 1 ?
            domainParts[0].substring(0, 1) + maskChar.repeat(Math.max(1, domainParts[0].length - 1)) + 
            '.' + domainParts.slice(1).join('.') :
            maskChar.repeat(domain.length);
          return `${maskedUser}@${maskedDomain}`;
        }
      );
    }
    
    if (maskPhone) {
      // Mask phone numbers: +1 (***) ***-1234
      masked = masked.replace(
        /(\+?1?[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/g,
        (match, country, area, prefix, last) => {
          return `${country || ''}(${maskChar.repeat(3)}) ${maskChar.repeat(3)}-${last}`;
        }
      );
    }
    
    if (maskCardNumbers) {
      // Mask credit card numbers: ****-****-****-1234
      masked = masked.replace(
        /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g,
        (match) => {
          const cleaned = match.replace(/[-\s]/g, '');
          const last4 = cleaned.slice(-4);
          const separator = match.includes('-') ? '-' : match.includes(' ') ? ' ' : '';
          return `${maskChar.repeat(4)}${separator}${maskChar.repeat(4)}${separator}${maskChar.repeat(4)}${separator}${last4}`;
        }
      );
    }
    
    return masked;
  }
  
  if (Array.isArray(data)) {
    return data.map(item => maskSensitiveData(item, options));
  }
  
  if (typeof data === 'object' && data !== null) {
    const masked: any = {};
    for (const [key, value] of Object.entries(data)) {
      // Skip masking certain fields that should remain intact
      if (['id', 'uuid', 'created_at', 'updated_at', 'timestamp'].includes(key.toLowerCase())) {
        masked[key] = value;
      } else {
        masked[key] = maskSensitiveData(value, options);
      }
    }
    return masked;
  }
  
  return data;
}

/**
 * Validates email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  return emailRegex.test(email);
}

/**
 * Validates phone number format (flexible for international formats)
 */
export function isValidPhone(phone: string): boolean {
  // Remove all non-digit characters for validation
  const cleaned = phone.replace(/\D/g, '');
  
  // Phone should be between 7 and 15 digits (international standard)
  return cleaned.length >= 7 && cleaned.length <= 15;
}

/**
 * Sanitizes input to prevent XSS attacks
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
}

/**
 * Validates and sanitizes user input for database operations
 */
export function validateAndSanitizeInput(data: any): { 
  isValid: boolean; 
  sanitized: any; 
  errors: string[] 
} {
  const errors: string[] = [];
  let sanitized: any = {};
  
  try {
    if (typeof data === 'object' && data !== null) {
      for (const [key, value] of Object.entries(data)) {
        if (typeof value === 'string') {
          // Sanitize string inputs
          sanitized[key] = sanitizeInput(value);
          
          // Validate email fields
          if (key.toLowerCase().includes('email') && value) {
            if (!isValidEmail(value)) {
              errors.push(`Invalid email format for ${key}`);
            }
          }
          
          // Validate phone fields
          if (key.toLowerCase().includes('phone') && value) {
            if (!isValidPhone(value)) {
              errors.push(`Invalid phone format for ${key}`);
            }
          }
          
          // Check for extremely long inputs (potential DoS)
          if (value.length > 10000) {
            errors.push(`Input too long for ${key} (max 10,000 characters)`);
          }
        } else {
          sanitized[key] = value;
        }
      }
    } else {
      sanitized = data;
    }
  } catch (error) {
    logger.error('Input validation error', error, 'security-utils');
    errors.push('Invalid input format');
  }
  
  return {
    isValid: errors.length === 0,
    sanitized,
    errors
  };
}

/**
 * Rate limiting utility
 */
export class RateLimiter {
  private attempts: Map<string, { count: number; resetTime: number }> = new Map();
  
  constructor(
    private maxAttempts: number = 10,
    private windowMs: number = 15 * 60 * 1000 // 15 minutes
  ) {}
  
  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const record = this.attempts.get(identifier);
    
    if (!record || now > record.resetTime) {
      // Reset or create new record
      this.attempts.set(identifier, {
        count: 1,
        resetTime: now + this.windowMs
      });
      return true;
    }
    
    if (record.count >= this.maxAttempts) {
      return false;
    }
    
    record.count++;
    return true;
  }
  
  getRemainingAttempts(identifier: string): number {
    const record = this.attempts.get(identifier);
    if (!record || Date.now() > record.resetTime) {
      return this.maxAttempts;
    }
    return Math.max(0, this.maxAttempts - record.count);
  }
  
  getResetTime(identifier: string): number {
    const record = this.attempts.get(identifier);
    if (!record || Date.now() > record.resetTime) {
      return 0;
    }
    return record.resetTime;
  }
  
  reset(identifier: string): void {
    this.attempts.delete(identifier);
  }
  
  cleanup(): void {
    const now = Date.now();
    for (const [key, record] of this.attempts.entries()) {
      if (now > record.resetTime) {
        this.attempts.delete(key);
      }
    }
  }
}

/**
 * CSRF protection utility
 */
export function generateCSRFToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Secure headers utility
 */
export function getSecurityHeaders(): Record<string, string> {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https:; connect-src 'self' https:; frame-ancestors 'none';"
  };
}

/**
 * Data encryption utilities (for client-side sensitive data)
 */
export async function hashData(data: string): Promise<string> {
  if (!crypto.subtle) {
    throw new Error('Web Crypto API not available');
  }
  
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Secure comparison utility (prevents timing attacks)
 */
export async function secureCompare(a: string, b: string): Promise<boolean> {
  if (a.length !== b.length) {
    return false;
  }
  
  const hashA = await hashData(a);
  const hashB = await hashData(b);
  
  return hashA === hashB;
}

/**
 * Security audit logger
 */
export function logSecurityEvent(
  event: string, 
  details: any, 
  severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'
) {
  const maskedDetails = maskSensitiveData(details, {
    maskEmail: true,
    maskPhone: true,
    maskCardNumbers: true
  });
  
  logger.error(`SECURITY EVENT: ${event}`, {
    severity,
    details: maskedDetails,
    timestamp: new Date().toISOString(),
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
    url: typeof window !== 'undefined' ? window.location.href : 'unknown'
  }, 'security-audit');
}

// Export rate limiter instance for common use
export const globalRateLimiter = new RateLimiter(10, 15 * 60 * 1000); // 10 attempts per 15 minutes

// Cleanup rate limiter every hour
if (typeof window !== 'undefined') {
  setInterval(() => {
    globalRateLimiter.cleanup();
  }, 60 * 60 * 1000); // 1 hour
}