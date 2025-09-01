// Shared API Framework for Edge Functions
// This provides standardized patterns for all edge functions

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.55.0";

// Standard CORS headers - consistent across all functions
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

// Standard response interface
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
  request_id: string;
}

// Standard error types
export enum ErrorType {
  VALIDATION = 'VALIDATION_ERROR',
  RATE_LIMIT = 'RATE_LIMIT_EXCEEDED',
  AUTH = 'AUTHENTICATION_ERROR',
  PERMISSION = 'PERMISSION_DENIED',
  NOT_FOUND = 'RESOURCE_NOT_FOUND',
  EXTERNAL_API = 'EXTERNAL_API_ERROR',
  DATABASE = 'DATABASE_ERROR',
  INTERNAL = 'INTERNAL_SERVER_ERROR'
}

// Enhanced logging utility
export class Logger {
  constructor(private functionName: string) {}

  private formatMessage(level: string, step: string, details?: any): string {
    const timestamp = new Date().toISOString();
    const baseMessage = `[${timestamp}] [${this.functionName}] ${level.toUpperCase()}: ${step}`;
    return details ? `${baseMessage} - ${JSON.stringify(details)}` : baseMessage;
  }

  info(step: string, details?: any) {
    console.log(this.formatMessage('info', step, details));
  }

  warn(step: string, details?: any) {
    console.warn(this.formatMessage('warn', step, details));
  }

  error(step: string, details?: any) {
    console.error(this.formatMessage('error', step, details));
  }

  debug(step: string, details?: any) {
    console.debug(this.formatMessage('debug', step, details));
  }
}

// Standard Supabase client factory
export function createSupabaseClient(useServiceRole = true) {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseKey = useServiceRole 
    ? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    : Deno.env.get('SUPABASE_ANON_KEY');

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase configuration');
  }

  return createClient(supabaseUrl, supabaseKey, { 
    auth: { persistSession: false } 
  });
}

// Standard response helpers
export class ResponseHelper {
  static success<T>(data: T, message?: string, requestId?: string): Response {
    const response: ApiResponse<T> = {
      success: true,
      data,
      message,
      timestamp: new Date().toISOString(),
      request_id: requestId || crypto.randomUUID()
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  static error(
    error: string, 
    type: ErrorType = ErrorType.INTERNAL, 
    status = 500, 
    requestId?: string
  ): Response {
    const response: ApiResponse = {
      success: false,
      error: `${type}: ${error}`,
      timestamp: new Date().toISOString(),
      request_id: requestId || crypto.randomUUID()
    };

    return new Response(JSON.stringify(response), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  static validationError(error: string, requestId?: string): Response {
    return this.error(error, ErrorType.VALIDATION, 400, requestId);
  }

  static authError(error: string, requestId?: string): Response {
    return this.error(error, ErrorType.AUTH, 401, requestId);
  }

  static rateLimitError(requestId?: string): Response {
    return this.error(
      'Too many requests. Please try again later.',
      ErrorType.RATE_LIMIT,
      429,
      requestId
    );
  }

  static notFoundError(resource: string, requestId?: string): Response {
    return this.error(
      `${resource} not found`,
      ErrorType.NOT_FOUND,
      404,
      requestId
    );
  }
}

// Rate limiting utility
export class RateLimiter {
  private static limitMap = new Map<string, number[]>();

  static isRateLimited(
    identifier: string, 
    windowMs = 60000, // 1 minute
    maxRequests = 10
  ): boolean {
    const now = Date.now();
    
    if (!this.limitMap.has(identifier)) {
      this.limitMap.set(identifier, []);
    }
    
    const requests = this.limitMap.get(identifier)!;
    
    // Remove old requests outside the window
    const validRequests = requests.filter(time => now - time < windowMs);
    this.limitMap.set(identifier, validRequests);
    
    if (validRequests.length >= maxRequests) {
      return true;
    }
    
    // Add current request
    validRequests.push(now);
    this.limitMap.set(identifier, validRequests);
    
    return false;
  }
}

// Input validation helpers
export class ValidationHelper {
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 255;
  }

  static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  static sanitizeString(input: string, maxLength = 1000): string {
    return input.trim().substring(0, maxLength);
  }

  static validateRequired(value: any, fieldName: string): void {
    if (value === null || value === undefined || value === '') {
      throw new Error(`${fieldName} is required`);
    }
  }

  static validateStringLength(
    value: string, 
    fieldName: string, 
    minLength = 0, 
    maxLength = 1000
  ): void {
    if (value.length < minLength) {
      throw new Error(`${fieldName} must be at least ${minLength} characters long`);
    }
    if (value.length > maxLength) {
      throw new Error(`${fieldName} must be no more than ${maxLength} characters long`);
    }
  }
}

// Client info extraction utility
export class ClientHelper {
  static extractClientInfo(req: Request) {
    return {
      ip: req.headers.get('x-forwarded-for') || 
          req.headers.get('x-real-ip') || 
          'unknown',
      userAgent: req.headers.get('user-agent') || '',
      sessionId: req.headers.get('x-session-id') || crypto.randomUUID(),
      requestId: crypto.randomUUID()
    };
  }

  static async extractUserFromAuth(req: Request, supabase: any): Promise<string | null> {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return null;

    try {
      const token = authHeader.replace('Bearer ', '');
      const { data: userData } = await supabase.auth.getUser(token);
      return userData.user?.id || null;
    } catch {
      return null;
    }
  }
}

// Standard function wrapper
export function createHandler(
  functionName: string,
  handler: (req: Request, logger: Logger, clientInfo: any) => Promise<Response>
) {
  const logger = new Logger(functionName);

  return async (req: Request): Promise<Response> => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const clientInfo = ClientHelper.extractClientInfo(req);
    logger.info('Function started', { 
      method: req.method,
      url: req.url,
      requestId: clientInfo.requestId 
    });

    try {
      const response = await handler(req, logger, clientInfo);
      logger.info('Function completed successfully', { requestId: clientInfo.requestId });
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('Function failed', { 
        error: errorMessage, 
        requestId: clientInfo.requestId 
      });
      
      return ResponseHelper.error(
        'Internal server error occurred',
        ErrorType.INTERNAL,
        500,
        clientInfo.requestId
      );
    }
  };
}