import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { Resend } from "npm:resend@4.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SubscribeEmailRequest {
  email: string;
  name?: string;
  source?: string; // 'newsletter', 'blog', 'exit_intent', 'scroll_cta', etc.
}

const logStep = (step: string, details?: any) => {
  console.log(`[SUBSCRIBE-EMAIL] ${step}${details ? ` - ${JSON.stringify(details)}` : ''}`);
};

// Validate email format
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    // Create Supabase client with service role
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get client IP and user agent
    const clientIP = req.headers.get("x-forwarded-for") || 
                    req.headers.get("x-real-ip") || 
                    "unknown";
    const userAgent = req.headers.get("user-agent") || "";

    logStep("Request metadata", { clientIP });

    // Rate limiting check - max 5 subscriptions per IP per hour
    const { data: rateLimitCheck, error: rateLimitError } = await supabaseService.rpc(
      'check_rate_limit', 
      { 
        p_identifier: `email_subscribe:${clientIP}`,
        p_max_requests: 5,
        p_window_minutes: 60
      }
    );

    if (rateLimitError || !rateLimitCheck) {
      logStep("Rate limit exceeded", { clientIP });
      return new Response(JSON.stringify({ 
        error: "Too many subscription requests. Please try again later." 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 429,
      });
    }

    const subscriptionData: SubscribeEmailRequest = await req.json();
    logStep("Subscription data received", { 
      email: subscriptionData.email, 
      source: subscriptionData.source 
    });

    // Server-side validation
    if (!subscriptionData.email || !isValidEmail(subscriptionData.email)) {
      return new Response(JSON.stringify({ 
        error: "Valid email address is required" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const email = subscriptionData.email.toLowerCase().trim();
    const name = subscriptionData.name?.trim() || null;
    const source = subscriptionData.source?.trim() || 'newsletter';

    // Check if email already exists
    const { data: existingSubscription } = await supabaseService
      .from("email_subscriptions")
      .select("id, status")
      .eq("email", email)
      .single();

    let subscriptionId: string;
    let isNewSubscription = false;

    if (existingSubscription) {
      if (existingSubscription.status === 'active') {
        logStep("Email already subscribed", { email });
        return new Response(JSON.stringify({ 
          success: true,
          message: "You're already subscribed to our newsletter!",
          subscriptionId: existingSubscription.id
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      } else {
        // Reactivate subscription
        const { data: updatedSub, error: updateError } = await supabaseService
          .from("email_subscriptions")
          .update({
            status: 'active',
            name: name || undefined,
            source,
            confirmed_at: new Date().toISOString(),
            unsubscribed_at: null,
            ip_address: clientIP,
            user_agent: userAgent.substring(0, 500)
          })
          .eq("id", existingSubscription.id)
          .select()
          .single();

        if (updateError) {
          throw new Error(`Failed to reactivate subscription: ${updateError.message}`);
        }
        
        subscriptionId = updatedSub.id;
        logStep("Subscription reactivated", { subscriptionId });
      }
    } else {
      // Create new subscription
      const { data: newSubscription, error: createError } = await supabaseService
        .from("email_subscriptions")
        .insert({
          email,
          name,
          source,
          status: 'active',
          confirmed_at: new Date().toISOString(),
          ip_address: clientIP,
          user_agent: userAgent.substring(0, 500)
        })
        .select()
        .single();

      if (createError) {
        logStep("Error creating subscription", { error: createError });
        throw new Error(`Failed to create subscription: ${createError.message}`);
      }

      subscriptionId = newSubscription.id;
      isNewSubscription = true;
      logStep("New subscription created", { subscriptionId });
    }

    // Send welcome email if Resend API key is available
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (resendApiKey && isNewSubscription) {
      try {
        const resend = new Resend(resendApiKey);
        
        await resend.emails.send({
          from: "Devmart <noreply@devmart.sr>",
          to: [email],
          subject: "Welcome to Devmart Newsletter!",
          html: `
            <h1>Welcome to Devmart, ${name || 'there'}!</h1>
            <p>Thank you for subscribing to our newsletter. You'll receive updates about:</p>
            <ul>
              <li>Latest blog posts and insights</li>
              <li>New projects and case studies</li>
              <li>Industry trends and tips</li>
              <li>Exclusive content and offers</li>
            </ul>
            <p>Best regards,<br>The Devmart Team</p>
            <hr>
            <p style="font-size: 12px; color: #666;">
              If you didn't subscribe to this newsletter, you can 
              <a href="${Deno.env.get("SUPABASE_URL")}/unsubscribe?id=${subscriptionId}">unsubscribe here</a>.
            </p>
          `,
        });

        logStep("Welcome email sent", { email });
      } catch (emailError) {
        logStep("Failed to send welcome email", { error: emailError });
        // Don't fail the request if email sending fails
      }
    }

    return new Response(JSON.stringify({
      success: true,
      subscriptionId,
      message: isNewSubscription 
        ? "Successfully subscribed! Check your email for confirmation." 
        : "Subscription updated successfully!"
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