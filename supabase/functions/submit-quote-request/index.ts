import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

const logStep = (step: string, details?: any) => {
  console.log(`[SUBMIT-QUOTE-REQUEST] ${step}${details ? ` - ${JSON.stringify(details)}` : ''}`);
};

// Validate email format
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate phone format (basic validation)
function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[\+]?[\d\s\-\(\)]{7,}$/;
  return phoneRegex.test(phone);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    // Create Supabase client with service role for database operations
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get client IP and user agent for rate limiting and tracking
    const clientIP = req.headers.get("x-forwarded-for") || 
                    req.headers.get("x-real-ip") || 
                    "unknown";
    const userAgent = req.headers.get("user-agent") || "";
    const referrer = req.headers.get("referer") || "";

    logStep("Request metadata", { clientIP, userAgent: userAgent.substring(0, 100) });

    // Rate limiting check - max 3 quote requests per IP per hour
    const { data: rateLimitCheck, error: rateLimitError } = await supabaseService.rpc(
      'check_rate_limit', 
      { 
        p_identifier: `quote_request:${clientIP}`,
        p_max_requests: 3,
        p_window_minutes: 60
      }
    );

    if (rateLimitError) {
      logStep("Rate limit check failed", { error: rateLimitError });
    } else if (!rateLimitCheck) {
      logStep("Rate limit exceeded", { clientIP });
      return new Response(JSON.stringify({ 
        error: "Too many quote requests. Please try again later." 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 429,
      });
    }

    // Get optional user from auth header
    const authHeader = req.headers.get("Authorization");
    let user = null;

    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: userData } = await supabaseService.auth.getUser(token);
      user = userData.user;
      logStep("User authenticated", { userId: user?.id, email: user?.email });
    }

    const quoteData: QuoteRequest = await req.json();
    logStep("Quote data received", { 
      email: quoteData.email, 
      serviceType: quoteData.serviceType,
      budgetRange: quoteData.budgetRange 
    });

    // Server-side validation
    const errors: string[] = [];

    if (!quoteData.name || quoteData.name.trim().length < 2) {
      errors.push("Name must be at least 2 characters long");
    }

    if (!quoteData.email || !isValidEmail(quoteData.email)) {
      errors.push("Valid email address is required");
    }

    if (quoteData.phone && !isValidPhone(quoteData.phone)) {
      errors.push("Phone number format is invalid");
    }

    if (!quoteData.serviceType || quoteData.serviceType.trim().length === 0) {
      errors.push("Service type is required");
    }

    if (!quoteData.projectScope || quoteData.projectScope.trim().length < 10) {
      errors.push("Project scope must be at least 10 characters long");
    }

    if (!quoteData.budgetRange || quoteData.budgetRange.trim().length === 0) {
      errors.push("Budget range is required");
    }

    if (!quoteData.timeline || quoteData.timeline.trim().length === 0) {
      errors.push("Timeline is required");
    }

    if (errors.length > 0) {
      logStep("Validation failed", { errors });
      return new Response(JSON.stringify({ 
        error: "Validation failed", 
        details: errors 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Check for duplicate recent submissions (same email within 24 hours)
    const { data: recentQuotes } = await supabaseService
      .from("quotes")
      .select("id")
      .eq("email", quoteData.email)
      .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .limit(1);

    if (recentQuotes && recentQuotes.length > 0) {
      logStep("Duplicate quote detected", { email: quoteData.email });
      return new Response(JSON.stringify({ 
        error: "You have already submitted a quote request recently. Please check your email or contact us directly." 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 429,
      });
    }

    // Create quote record
    const quoteRecord = {
      user_id: user?.id || null,
      email: quoteData.email.toLowerCase().trim(),
      name: quoteData.name.trim(),
      company: quoteData.company?.trim() || null,
      phone: quoteData.phone?.trim() || null,
      service_type: quoteData.serviceType.trim(),
      project_scope: quoteData.projectScope.trim(),
      budget_range: quoteData.budgetRange.trim(),
      timeline: quoteData.timeline.trim(),
      additional_requirements: quoteData.additionalRequirements?.trim() || null,
      status: "pending",
      priority: "normal",
      ip_address: clientIP,
      user_agent: userAgent.substring(0, 500), // Limit length
      referrer: referrer.substring(0, 500),
    };

    const { data: quote, error: quoteError } = await supabaseService
      .from("quotes")
      .insert(quoteRecord)
      .select()
      .single();

    if (quoteError) {
      logStep("Error creating quote", { error: quoteError });
      throw new Error(`Failed to create quote: ${quoteError.message}`);
    }

    logStep("Quote created successfully", { quoteId: quote.id });

    // Create activity log
    const { error: activityError } = await supabaseService
      .from("quote_activities")
      .insert({
        quote_id: quote.id,
        user_id: user?.id || null,
        activity_type: "created",
        new_value: "pending",
        notes: `Quote request submitted from ${clientIP}`,
      });

    if (activityError) {
      logStep("Error creating activity log", { error: activityError });
      // Don't fail the request for this
    }

    return new Response(JSON.stringify({
      success: true,
      quoteId: quote.id,
      message: "Quote request submitted successfully. We'll get back to you within 24 hours."
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