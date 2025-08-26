import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { getPaymentSettings } from "../shared/settings-helper.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BankTransferRequest {
  amount: number; // in cents
  currency?: string;
  productName?: string;
  customerInfo: {
    name: string;
    email: string;
    phone?: string;
  };
}

const logStep = (step: string, details?: any) => {
  console.log(`[CREATE-BANK-TRANSFER-ORDER] ${step}${details ? ` - ${JSON.stringify(details)}` : ''}`);
};

// Generate a unique reference number for bank transfers
function generateBankReference(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substr(2, 4).toUpperCase();
  return `BT-${timestamp}-${random}`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    // Get payment settings from database
    const paymentSettings = await getPaymentSettings();

    // Create Supabase client with service role for database operations
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get user from auth header (optional)
    const authHeader = req.headers.get("Authorization");
    let user = null;

    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: userData } = await supabaseService.auth.getUser(token);
      user = userData.user;
    }

    const {
      amount,
      currency = "usd",
      productName = "Premium Service",
      customerInfo
    }: BankTransferRequest = await req.json();

    logStep("Request data", { amount, currency, productName, customerInfo });

    if (!amount || amount <= 0) {
      throw new Error("Valid amount is required");
    }

    if (!customerInfo?.name || !customerInfo?.email) {
      throw new Error("Customer name and email are required");
    }

    // Generate unique reference for this bank transfer
    const bankReference = generateBankReference();

    // Create order record
    const orderData = {
      user_id: user?.id || null,
      email: customerInfo.email,
      amount,
      currency,
      provider: "bank_transfer",
      provider_order_id: bankReference,
      status: "awaiting_verification",
      metadata: {
        product_name: productName,
        customer_info: customerInfo,
        bank_reference: bankReference,
        created_via: "bank_transfer_flow"
      }
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

    logStep("Bank transfer order created", { orderId: order.id, reference: bankReference });

    // Get bank details from settings
    const bankSettings = paymentSettings.bank_transfer;
    const bankDetails = {
      bankName: bankSettings.bank_name || "Suriname Commercial Bank",
      accountName: bankSettings.beneficiary_name || "Your Company Name", 
      accountNumber: bankSettings.account_number_masked || "123-456-789",
      swiftCode: bankSettings.swift || "SCBKSR22",
      iban: bankSettings.iban || "",
      reference: bankReference,
      amount: amount / 100, // Convert cents to dollars
      currency: currency.toUpperCase(),
      instructions: bankSettings.instructions_md ? 
        bankSettings.instructions_md.split('\n').filter(line => line.trim()) :
        [
          "Use the reference number provided when making the transfer",
          "Include your email address in the transfer description", 
          "Transfer must be completed within 7 days",
          "Upload proof of payment after completing the transfer"
        ]
    };

    return new Response(JSON.stringify({
      orderId: order.id,
      bankReference,
      bankDetails,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        status: order.status,
        created_at: order.created_at
      }
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