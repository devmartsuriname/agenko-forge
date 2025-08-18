import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const logStep = (step: string, details?: any) => {
  console.log(`[STRIPE-WEBHOOK] ${step}${details ? ` - ${JSON.stringify(details)}` : ''}`);
};

serve(async (req) => {
  try {
    logStep("Webhook received");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("STRIPE_SECRET_KEY is not configured");
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Create Supabase client with service role
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      throw new Error("No Stripe signature found");
    }

    let event: Stripe.Event;
    try {
      // In production, you should set STRIPE_WEBHOOK_SECRET
      const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
      if (webhookSecret) {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      } else {
        // For testing, parse the body directly
        event = JSON.parse(body);
      }
    } catch (err) {
      logStep("Webhook signature verification failed", { error: err });
      return new Response("Webhook signature verification failed", { status: 400 });
    }

    logStep("Processing event", { type: event.type, id: event.id });

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        
        // Update order status to paid
        const { error: orderError } = await supabaseService
          .from("orders")
          .update({ 
            status: "paid",
            updated_at: new Date().toISOString()
          })
          .eq("provider_order_id", session.id);

        if (orderError) {
          logStep("Error updating order", { error: orderError, sessionId: session.id });
          throw orderError;
        }

        // Create payment record
        const paymentData = {
          order_id: null, // Will be set by trigger or separate query
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

        // Get order ID first
        const { data: order } = await supabaseService
          .from("orders")
          .select("id")
          .eq("provider_order_id", session.id)
          .single();

        if (order) {
          paymentData.order_id = order.id;
          
          const { error: paymentError } = await supabaseService
            .from("payments")
            .insert(paymentData);

          if (paymentError) {
            logStep("Error creating payment record", { error: paymentError });
          } else {
            logStep("Payment completed successfully", { sessionId: session.id, orderId: order.id });
          }
        }

        break;
      }

      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;
        
        const { error } = await supabaseService
          .from("orders")
          .update({ 
            status: "canceled",
            updated_at: new Date().toISOString()
          })
          .eq("provider_order_id", session.id);

        if (error) {
          logStep("Error updating expired order", { error, sessionId: session.id });
        } else {
          logStep("Order marked as canceled", { sessionId: session.id });
        }

        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        
        // Find order by payment intent and mark as failed
        const { error } = await supabaseService
          .from("orders")
          .update({ 
            status: "failed",
            updated_at: new Date().toISOString()
          })
          .eq("provider_order_id", paymentIntent.id);

        if (error) {
          logStep("Error updating failed payment", { error, paymentIntentId: paymentIntent.id });
        } else {
          logStep("Order marked as failed", { paymentIntentId: paymentIntent.id });
        }

        break;
      }

      default:
        logStep("Unhandled event type", { type: event.type });
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});