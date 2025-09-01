import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { 
  createHandler, 
  createSupabaseClient, 
  ResponseHelper, 
  ErrorType
} from "../shared/api-framework.ts";

async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session, 
  supabase: any,
  logger: any
): Promise<void> {
  logger.info('Processing checkout completion', { sessionId: session.id });

  // Update order status to paid
  const { error: orderError } = await supabase
    .from("orders")
    .update({ 
      status: "paid",
      updated_at: new Date().toISOString()
    })
    .eq("provider_order_id", session.id);

  if (orderError) {
    logger.error('Failed to update order status', { error: orderError, sessionId: session.id });
    throw new Error(`Failed to update order: ${orderError.message}`);
  }

  // Get order ID for payment record
  const { data: order, error: orderSelectError } = await supabase
    .from("orders")
    .select("id")
    .eq("provider_order_id", session.id)
    .single();

  if (orderSelectError || !order) {
    logger.error('Failed to find order', { error: orderSelectError, sessionId: session.id });
    throw new Error('Order not found after update');
  }

  // Create payment record
  const paymentData = {
    order_id: order.id,
    provider: "stripe",
    provider_payment_id: session.payment_intent as string,
    amount: session.amount_total || 0,
    currency: session.currency || "usd",
    status: "paid",
    provider_data: {
      session_id: session.id,
      customer_id: session.customer,
      payment_status: session.payment_status
    }
  };

  const { error: paymentError } = await supabase
    .from("payments")
    .insert(paymentData);

  if (paymentError) {
    logger.error('Failed to create payment record', { error: paymentError });
    throw new Error(`Failed to create payment record: ${paymentError.message}`);
  }

  logger.info('Payment completed successfully', { sessionId: session.id, orderId: order.id });
}

async function handleCheckoutExpired(
  session: Stripe.Checkout.Session, 
  supabase: any,
  logger: any
): Promise<void> {
  logger.info('Processing checkout expiration', { sessionId: session.id });

  const { error } = await supabase
    .from("orders")
    .update({ 
      status: "canceled",
      updated_at: new Date().toISOString()
    })
    .eq("provider_order_id", session.id);

  if (error) {
    logger.error('Failed to update expired order', { error, sessionId: session.id });
    throw new Error(`Failed to update expired order: ${error.message}`);
  }

  logger.info('Order marked as canceled', { sessionId: session.id });
}

async function handlePaymentFailed(
  paymentIntent: Stripe.PaymentIntent, 
  supabase: any,
  logger: any
): Promise<void> {
  logger.info('Processing payment failure', { paymentIntentId: paymentIntent.id });

  const { error } = await supabase
    .from("orders")
    .update({ 
      status: "failed",
      updated_at: new Date().toISOString()
    })
    .eq("provider_order_id", paymentIntent.id);

  if (error) {
    logger.error('Failed to update failed payment', { error, paymentIntentId: paymentIntent.id });
    throw new Error(`Failed to update failed payment: ${error.message}`);
  }

  logger.info('Order marked as failed', { paymentIntentId: paymentIntent.id });
}

const handler = createHandler('stripe-webhook', async (req, logger, clientInfo) => {
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
    // Validate Stripe configuration
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      logger.error('Stripe configuration missing');
      return ResponseHelper.error(
        'Stripe not configured',
        ErrorType.EXTERNAL_API,
        500,
        clientInfo.requestId
      );
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    const supabase = createSupabaseClient(true);

    // Get request body and signature
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      logger.warn('Missing Stripe signature');
      return ResponseHelper.error(
        'Missing Stripe signature',
        ErrorType.EXTERNAL_API,
        400,
        clientInfo.requestId
      );
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
      if (webhookSecret) {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      } else {
        // For testing without webhook secret
        event = JSON.parse(body);
        logger.warn('Processing webhook without signature verification');
      }
    } catch (err) {
      logger.error('Webhook signature verification failed', { error: err });
      return ResponseHelper.error(
        'Webhook signature verification failed',
        ErrorType.EXTERNAL_API,
        400,
        clientInfo.requestId
      );
    }

    logger.info('Processing Stripe event', { type: event.type, id: event.id });

    // Process different event types
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(
          event.data.object as Stripe.Checkout.Session, 
          supabase, 
          logger
        );
        break;

      case "checkout.session.expired":
        await handleCheckoutExpired(
          event.data.object as Stripe.Checkout.Session, 
          supabase, 
          logger
        );
        break;

      case "payment_intent.payment_failed":
        await handlePaymentFailed(
          event.data.object as Stripe.PaymentIntent, 
          supabase, 
          logger
        );
        break;

      default:
        logger.info('Unhandled event type', { type: event.type });
    }

    return ResponseHelper.success(
      { received: true, eventType: event.type },
      'Webhook processed successfully',
      clientInfo.requestId
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error('Webhook processing failed', { error: errorMessage });
    
    return ResponseHelper.error(
      'Webhook processing failed',
      ErrorType.EXTERNAL_API,
      500,
      clientInfo.requestId
    );
  }
});

serve(handler);