import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { 
  createHandler, 
  createSupabaseClient, 
  ResponseHelper, 
  ValidationHelper, 
  RateLimiter,
  ErrorType,
  ClientHelper
} from "../shared/api-framework.ts";

interface QuoteRequest {
  name: string;
  email: string;
  company?: string;
  phone?: string;
  serviceType: string;
  projectScope: string;
  budgetRange: string;
  timeline: string;
  additionalRequirements?: string;
}

const VALID_SERVICE_TYPES = [
  'web_development', 'mobile_app', 'ecommerce', 'custom_software', 
  'consulting', 'maintenance', 'other'
];

const VALID_BUDGET_RANGES = [
  'under_5k', '5k_15k', '15k_50k', '50k_100k', 'over_100k', 'discuss'
];

const VALID_TIMELINES = [
  'asap', '1_month', '2_3_months', '3_6_months', '6_months_plus', 'flexible'
];

function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[\+]?[\d\s\-\(\)]{7,}$/;
  return phoneRegex.test(phone);
}

function validateQuoteRequest(data: QuoteRequest): void {
  // Required fields
  ValidationHelper.validateRequired(data.name, 'name');
  ValidationHelper.validateRequired(data.email, 'email');
  ValidationHelper.validateRequired(data.serviceType, 'serviceType');
  ValidationHelper.validateRequired(data.projectScope, 'projectScope');
  ValidationHelper.validateRequired(data.budgetRange, 'budgetRange');
  ValidationHelper.validateRequired(data.timeline, 'timeline');

  // String length validation
  ValidationHelper.validateStringLength(data.name, 'name', 2, 100);
  ValidationHelper.validateStringLength(data.projectScope, 'projectScope', 10, 2000);
  
  if (data.company) {
    ValidationHelper.validateStringLength(data.company, 'company', 0, 100);
  }
  
  if (data.additionalRequirements) {
    ValidationHelper.validateStringLength(data.additionalRequirements, 'additionalRequirements', 0, 1000);
  }

  // Email validation
  if (!ValidationHelper.isValidEmail(data.email)) {
    throw new Error('Please provide a valid email address');
  }

  // Phone validation (if provided)
  if (data.phone && !isValidPhone(data.phone)) {
    throw new Error('Please provide a valid phone number');
  }
}

async function checkDuplicateQuote(supabase: any, email: string): Promise<boolean> {
  const { data: recentQuotes } = await supabase
    .from("quotes")
    .select("id")
    .eq("email", email)
    .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
    .limit(1);

  return recentQuotes && recentQuotes.length > 0;
}

const handler = createHandler('submit-quote-request', async (req, logger, clientInfo) => {
  // Method validation
  if (req.method !== 'POST') {
    return ResponseHelper.error(
      'Method not allowed. Use POST.',
      ErrorType.VALIDATION,
      405,
      clientInfo.requestId
    );
  }

  try {
    // Create Supabase client
    const supabase = createSupabaseClient(true);

    // Advanced rate limiting using database function
    const { data: rateLimitCheck, error: rateLimitError } = await supabase.rpc(
      'check_rate_limit', 
      { 
        p_identifier: `quote_request:${clientInfo.ip}`,
        p_max_requests: 3,
        p_window_minutes: 60
      }
    );

    if (rateLimitError) {
      logger.warn('Rate limit check failed', { error: rateLimitError });
    } else if (!rateLimitCheck) {
      logger.warn('Rate limit exceeded for quote requests', { ip: clientInfo.ip });
      return ResponseHelper.rateLimitError(clientInfo.requestId);
    }

    // Extract user if authenticated
    const userId = await ClientHelper.extractUserFromAuth(req, supabase);

    // Parse and validate request data
    const quoteData: QuoteRequest = await req.json();
    logger.info('Quote request received', { 
      email: quoteData.email,
      serviceType: quoteData.serviceType,
      budgetRange: quoteData.budgetRange,
      userId: userId || 'anonymous'
    });

    validateQuoteRequest(quoteData);

    // Check for duplicate recent submissions
    const isDuplicate = await checkDuplicateQuote(supabase, quoteData.email);
    if (isDuplicate) {
      logger.warn('Duplicate quote request attempt', { email: quoteData.email });
      return ResponseHelper.error(
        'You have already submitted a quote request recently. Please check your email or contact us directly.',
        ErrorType.VALIDATION,
        429,
        clientInfo.requestId
      );
    }

    // Create quote record
    const quoteRecord = {
      user_id: userId,
      email: quoteData.email.toLowerCase().trim(),
      name: ValidationHelper.sanitizeString(quoteData.name, 100),
      company: quoteData.company 
        ? ValidationHelper.sanitizeString(quoteData.company, 100) 
        : null,
      phone: quoteData.phone?.trim() || null,
      service_type: quoteData.serviceType.trim(),
      project_scope: ValidationHelper.sanitizeString(quoteData.projectScope, 2000),
      budget_range: quoteData.budgetRange.trim(),
      timeline: quoteData.timeline.trim(),
      additional_requirements: quoteData.additionalRequirements 
        ? ValidationHelper.sanitizeString(quoteData.additionalRequirements, 1000)
        : null,
      status: 'pending',
      priority: 'normal',
      ip_address: clientInfo.ip,
      user_agent: clientInfo.userAgent.substring(0, 500),
      referrer: req.headers.get('referer')?.substring(0, 500) || null
    };

    const { data: quote, error: insertError } = await supabase
      .from('quotes')
      .insert(quoteRecord)
      .select('id')
      .single();

    if (insertError) {
      logger.error('Database insertion failed', { error: insertError });
      return ResponseHelper.error(
        'Failed to submit quote request. Please try again.',
        ErrorType.DATABASE,
        500,
        clientInfo.requestId
      );
    }

    // Create activity log (non-blocking)
    try {
      await supabase
        .from('quote_activities')
        .insert({
          quote_id: quote.id,
          user_id: userId,
          activity_type: 'created',
          new_value: 'pending',
          notes: `Quote request submitted from ${clientInfo.ip}`,
        });
    } catch (activityError) {
      logger.warn('Failed to create activity log', { error: activityError });
      // Don't fail the request for this
    }

    logger.info('Quote request submitted successfully', { 
      quoteId: quote.id,
      ip: clientInfo.ip,
      email: quoteData.email
    });

    return ResponseHelper.success(
      { quoteId: quote.id },
      'Quote request submitted successfully. We\'ll get back to you within 24 hours.',
      clientInfo.requestId
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // Handle validation errors specifically
    if (errorMessage.includes('Invalid') || 
        errorMessage.includes('required') || 
        errorMessage.includes('must be') ||
        errorMessage.includes('valid')) {
      logger.warn('Validation error', { error: errorMessage });
      return ResponseHelper.validationError(errorMessage, clientInfo.requestId);
    }

    logger.error('Unexpected error in quote submission', { error: errorMessage });
    return ResponseHelper.error(
      'An unexpected error occurred. Please try again.',
      ErrorType.INTERNAL,
      500,
      clientInfo.requestId
    );
  }
});

serve(handler);