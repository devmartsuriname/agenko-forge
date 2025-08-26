import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { getPaymentSettings } from "../shared/settings-helper.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CheckoutRequest {
  priceId?: string;
  amount?: number; // in cents
  currency?: string;
  productName?: string;
  successUrl?: string;
  cancelUrl?: string;
}

const logStep = (step: string, details?: any) => {
  console.log(`[CREATE-STRIPE-CHECKOUT] ${step}${details ? ` - ${JSON.stringify(details)}` : ''}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    // Get payment settings from database
    const paymentSettings = await getPaymentSettings();
    
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("STRIPE_SECRET_KEY is not configured");
    }

    // Create Supabase client with service role for database operations
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get user from auth header (optional for guest checkout)
    const authHeader = req.headers.get("Authorization");
    let user = null;
    let userEmail = "";

    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: userData } = await supabaseService.auth.getUser(token);
      user = userData.user;
      userEmail = user?.email || "";
    }

    const {
      priceId,
      amount = 4999, // Default $49.99
      currency = "usd",
      productName = "Premium Service",
      successUrl,
      cancelUrl
    }: CheckoutRequest = await req.json();

    logStep("Request data", { amount, currency, productName, hasUser: !!user });

    if (!userEmail && !amount) {
      throw new Error("Email or authenticated user required");
    }

    // For guest checkout, require email in metadata
    if (!user && !userEmail) {
      throw new Error("Email required for guest checkout");
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Check if customer exists
    let customerId;
    if (userEmail) {
      const customers = await stripe.customers.list({ email: userEmail, limit: 1 });
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
        logStep("Found existing customer", { customerId });
      }
    }

    const origin = req.headers.get("origin") || "https://dvgubqqjvmsepkilnkak.supabase.co";

    // Use URLs from settings or defaults
    const defaultSuccessUrl = successUrl || `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`;
    const defaultCancelUrl = cancelUrl || `${origin}/payment-canceled`;

    // Create checkout session
    const sessionConfig: any = {
      customer: customerId,
      customer_email: customerId ? undefined : userEmail,
      mode: "payment",
      success_url: defaultSuccessUrl,
      cancel_url: defaultCancelUrl,
      metadata: {
        user_id: user?.id || "guest",
        email: userEmail,
        stripe_mode: paymentSettings.stripe.mode
      }
    };

    // Add statement descriptor if configured
    if (paymentSettings.stripe.statement_descriptor) {
      sessionConfig.payment_intent_data = {
        statement_descriptor: paymentSettings.stripe.statement_descriptor
      };
    }

    if (priceId) {
      sessionConfig.line_items = [{ price: priceId, quantity: 1 }];
    } else {
      sessionConfig.line_items = [{
        price_data: {
          currency,
          product_data: { name: productName },
          unit_amount: amount,
        },
        quantity: 1,
      }];
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);
    logStep("Checkout session created", { sessionId: session.id });

    // Create order record
    const orderData = {
      user_id: user?.id || null,
      email: userEmail,
      amount,
      currency,
      provider: "stripe",
      provider_order_id: session.id,
      status: "pending",
      metadata: { product_name: productName }
    };

    const { data: order, error: orderError } = await supabaseService
      .from("orders")
      .insert(orderData)
      .select()
      .single();

    if (orderError) {
      logStep("Error creating order", { error: orderError });
      throw new Error(`Failed to create order: ${orderError.message}`);
    }

    logStep("Order created", { orderId: order.id });

    return new Response(JSON.stringify({ 
      url: session.url,
      sessionId: session.id,
      orderId: order.id
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});