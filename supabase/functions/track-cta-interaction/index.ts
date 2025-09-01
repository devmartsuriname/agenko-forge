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

interface TrackCTARequest {
  cta_type: string; // 'newsletter', 'exit_intent', 'scroll_progress', 'sticky_bar'
  action: string; // 'shown', 'clicked', 'dismissed', 'converted'
  page_url: string;
  element_id?: string;
  metadata?: Record<string, any>;
}

const VALID_CTA_TYPES = ['newsletter', 'exit_intent', 'scroll_progress', 'sticky_bar', 'quote_form'];
const VALID_ACTIONS = ['shown', 'clicked', 'dismissed', 'converted'];

function validateTrackingData(data: TrackCTARequest): void {
  ValidationHelper.validateRequired(data.cta_type, 'cta_type');
  ValidationHelper.validateRequired(data.action, 'action');
  ValidationHelper.validateRequired(data.page_url, 'page_url');

  if (!VALID_CTA_TYPES.includes(data.cta_type)) {
    throw new Error(`Invalid CTA type. Must be one of: ${VALID_CTA_TYPES.join(', ')}`);
  }

  if (!VALID_ACTIONS.includes(data.action)) {
    throw new Error(`Invalid action. Must be one of: ${VALID_ACTIONS.join(', ')}`);
  }

  if (!ValidationHelper.isValidUrl(data.page_url)) {
    throw new Error('Invalid page URL format');
  }

  if (data.element_id) {
    ValidationHelper.validateStringLength(data.element_id, 'element_id', 0, 100);
  }
}

const handler = createHandler('track-cta-interaction', async (req, logger, clientInfo) => {
  // Method validation
  if (req.method !== 'POST') {
    return ResponseHelper.error(
      'Method not allowed. Use POST.',
      ErrorType.VALIDATION,
      405,
      clientInfo.requestId
    );
  }

  // Rate limiting - 20 requests per minute per IP
  if (RateLimiter.isRateLimited(clientInfo.ip, 60000, 20)) {
    logger.warn('Rate limit exceeded', { ip: clientInfo.ip });
    return ResponseHelper.rateLimitError(clientInfo.requestId);
  }

  try {
    // Parse and validate request data
    const trackingData: TrackCTARequest = await req.json();
    logger.info('Tracking data received', { 
      cta_type: trackingData.cta_type,
      action: trackingData.action,
      page_url: trackingData.page_url
    });

    validateTrackingData(trackingData);

    // Create Supabase client
    const supabase = createSupabaseClient(true);

    // Extract user ID if authenticated
    const userId = await ClientHelper.extractUserFromAuth(req, supabase);

    // Insert tracking record
    const { data: interaction, error: insertError } = await supabase
      .from("cta_interactions")
      .insert({
        user_id: userId,
        session_id: clientInfo.sessionId,
        cta_type: trackingData.cta_type,
        action: trackingData.action,
        page_url: trackingData.page_url,
        element_id: trackingData.element_id || null,
        metadata: trackingData.metadata || {},
        ip_address: clientInfo.ip,
        user_agent: clientInfo.userAgent.substring(0, 500)
      })
      .select()
      .single();

    if (insertError) {
      logger.error('Database insertion failed', { error: insertError });
      return ResponseHelper.error(
        'Failed to track interaction',
        ErrorType.DATABASE,
        500,
        clientInfo.requestId
      );
    }

    logger.info('Interaction tracked successfully', { 
      interactionId: interaction.id,
      userId: userId || 'anonymous'
    });

    return ResponseHelper.success(
      { interactionId: interaction.id },
      'Interaction tracked successfully',
      clientInfo.requestId
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // Handle validation errors specifically
    if (errorMessage.includes('Invalid') || errorMessage.includes('required')) {
      logger.warn('Validation error', { error: errorMessage });
      return ResponseHelper.validationError(errorMessage, clientInfo.requestId);
    }

    logger.error('Unexpected error', { error: errorMessage });
    return ResponseHelper.error(
      'Failed to process tracking request',
      ErrorType.INTERNAL,
      500,
      clientInfo.requestId
    );
  }
});

serve(handler);