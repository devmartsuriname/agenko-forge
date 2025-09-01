import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TrackCTARequest {
  cta_type: string; // 'newsletter', 'exit_intent', 'scroll_progress', 'sticky_bar'
  action: string; // 'shown', 'clicked', 'dismissed', 'converted'
  page_url: string;
  element_id?: string;
  metadata?: Record<string, any>;
}

const logStep = (step: string, details?: any) => {
  console.log(`[TRACK-CTA] ${step}${details ? ` - ${JSON.stringify(details)}` : ''}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    // Create Supabase client
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get client info
    const clientIP = req.headers.get("x-forwarded-for") || 
                    req.headers.get("x-real-ip") || 
                    "unknown";
    const userAgent = req.headers.get("user-agent") || "";
    const sessionId = req.headers.get("x-session-id") || crypto.randomUUID();

    // Get optional user from auth header
    let userId = null;
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: userData } = await supabaseService.auth.getUser(token);
      userId = userData.user?.id || null;
    }

    const trackingData: TrackCTARequest = await req.json();
    logStep("Tracking data received", { 
      cta_type: trackingData.cta_type,
      action: trackingData.action,
      page_url: trackingData.page_url
    });

    // Validation
    const validCtaTypes = ['newsletter', 'exit_intent', 'scroll_progress', 'sticky_bar', 'quote_form'];
    const validActions = ['shown', 'clicked', 'dismissed', 'converted'];

    if (!validCtaTypes.includes(trackingData.cta_type)) {
      return new Response(JSON.stringify({ 
        error: "Invalid CTA type" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    if (!validActions.includes(trackingData.action)) {
      return new Response(JSON.stringify({ 
        error: "Invalid action" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    if (!trackingData.page_url) {
      return new Response(JSON.stringify({ 
        error: "Page URL is required" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Insert tracking record
    const { data: interaction, error: insertError } = await supabaseService
      .from("cta_interactions")
      .insert({
        user_id: userId,
        session_id: sessionId,
        cta_type: trackingData.cta_type,
        action: trackingData.action,
        page_url: trackingData.page_url,
        element_id: trackingData.element_id || null,
        metadata: trackingData.metadata || {},
        ip_address: clientIP,
        user_agent: userAgent.substring(0, 500)
      })
      .select()
      .single();

    if (insertError) {
      logStep("Error creating interaction", { error: insertError });
      throw new Error(`Failed to track interaction: ${insertError.message}`);
    }

    logStep("Interaction tracked successfully", { interactionId: interaction.id });

    return new Response(JSON.stringify({
      success: true,
      interactionId: interaction.id
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