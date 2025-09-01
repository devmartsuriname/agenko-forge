import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { 
  createHandler, 
  createSupabaseClient, 
  ResponseHelper, 
  ValidationHelper, 
  RateLimiter,
  ErrorType
} from "../shared/api-framework.ts";

interface ContactSubmissionRequest {
  name: string;
  email: string;
  subject?: string;
  message: string;
  captchaToken?: string;
}

function validateContactSubmission(data: ContactSubmissionRequest): void {
  // Required field validation
  ValidationHelper.validateRequired(data.name, 'name');
  ValidationHelper.validateRequired(data.email, 'email');
  ValidationHelper.validateRequired(data.message, 'message');

  // String length validation
  ValidationHelper.validateStringLength(data.name, 'name', 2, 100);
  ValidationHelper.validateStringLength(data.message, 'message', 10, 2000);
  
  if (data.subject) {
    ValidationHelper.validateStringLength(data.subject, 'subject', 0, 200);
  }

  // Email format validation
  if (!ValidationHelper.isValidEmail(data.email)) {
    throw new Error('Please provide a valid email address');
  }
}

async function verifyCaptcha(token: string): Promise<boolean> {
  // CAPTCHA verification stub - implement actual verification here
  // For hCaptcha: POST to https://hcaptcha.com/siteverify
  // For reCAPTCHA: POST to https://www.google.com/recaptcha/api/siteverify
  
  // For now, return true (stub implementation)
  // TODO: Implement actual CAPTCHA verification
  return true;
}

const handler = createHandler('submit-contact', async (req, logger, clientInfo) => {
  // Method validation
  if (req.method !== 'POST') {
    return ResponseHelper.error(
      'Method not allowed. Use POST.',
      ErrorType.VALIDATION,
      405,
      clientInfo.requestId
    );
  }

  // Rate limiting - 5 requests per minute per IP
  if (RateLimiter.isRateLimited(clientInfo.ip, 60000, 5)) {
    logger.warn('Rate limit exceeded for contact form', { ip: clientInfo.ip });
    return ResponseHelper.rateLimitError(clientInfo.requestId);
  }

  try {
    // Parse and validate request data
    const submissionData: ContactSubmissionRequest = await req.json();
    logger.info('Contact submission received', { 
      email: submissionData.email,
      hasSubject: !!submissionData.subject
    });

    validateContactSubmission(submissionData);

    // Verify CAPTCHA if provided
    if (submissionData.captchaToken) {
      const isValidCaptcha = await verifyCaptcha(submissionData.captchaToken);
      if (!isValidCaptcha) {
        logger.warn('CAPTCHA verification failed', { ip: clientInfo.ip });
        return ResponseHelper.validationError(
          'CAPTCHA verification failed',
          clientInfo.requestId
        );
      }
    }

    // Create Supabase client
    const supabase = createSupabaseClient(true);

    // Insert contact submission
    const { error: insertError } = await supabase
      .from('contact_submissions')
      .insert({
        name: ValidationHelper.sanitizeString(submissionData.name, 100),
        email: submissionData.email.trim().toLowerCase(),
        subject: submissionData.subject 
          ? ValidationHelper.sanitizeString(submissionData.subject, 200) 
          : null,
        message: ValidationHelper.sanitizeString(submissionData.message, 2000),
        ip: clientInfo.ip,
      });

    if (insertError) {
      logger.error('Database insertion failed', { error: insertError });
      return ResponseHelper.error(
        'Failed to submit contact form. Please try again.',
        ErrorType.DATABASE,
        500,
        clientInfo.requestId
      );
    }

    logger.info('Contact form submitted successfully', { 
      ip: clientInfo.ip,
      email: submissionData.email
    });

    return ResponseHelper.success(
      { submitted: true },
      'Thank you for your message. We\'ll get back to you soon!',
      clientInfo.requestId
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // Handle validation errors specifically
    if (errorMessage.includes('Invalid') || 
        errorMessage.includes('required') || 
        errorMessage.includes('must be')) {
      logger.warn('Validation error', { error: errorMessage });
      return ResponseHelper.validationError(errorMessage, clientInfo.requestId);
    }

    logger.error('Unexpected error in contact submission', { error: errorMessage });
    return ResponseHelper.error(
      'An unexpected error occurred. Please try again.',
      ErrorType.INTERNAL,
      500,
      clientInfo.requestId
    );
  }
});

serve(handler);