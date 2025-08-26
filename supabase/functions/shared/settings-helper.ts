// Shared helper for reading app_config settings from edge functions
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.55.0";

interface PaymentSettings {
  provider_order: ("stripe" | "bank_transfer")[];
  stripe: {
    mode: "test" | "live";
    publishable_key?: string;
    webhook_secret?: string;
    statement_descriptor?: string;
  };
  bank_transfer: {
    enabled: boolean;
    instructions_md: string;
    beneficiary_name?: string;
    bank_name?: string;
    account_number_masked?: string;
    iban?: string;
    swift?: string;
  };
}

interface ProposalSettings {
  branding: {
    logo_url_light?: string;
    logo_url_dark?: string;
    primary_color?: string;
    footer_note_md?: string;
  };
  email: {
    from_name: string;
    from_email: string;
    reply_to?: string;
    bcc_me?: boolean;
    signature_html?: string;
  };
  tokens: {
    ttl_hours: number;
    single_use: boolean;
  };
  attachments: {
    enabled: boolean;
    max_mb: number;
  };
}

// Default settings
const defaultPaymentSettings: PaymentSettings = {
  provider_order: ["stripe", "bank_transfer"],
  stripe: { mode: "test" },
  bank_transfer: { enabled: false, instructions_md: "" }
};

const defaultProposalSettings: ProposalSettings = {
  branding: {
    primary_color: "#1a1a1a",
    footer_note_md: ""
  },
  email: {
    from_name: "Agenko",
    from_email: "proposals@agenko.com"
  },
  tokens: {
    ttl_hours: 168, // 7 days
    single_use: false
  },
  attachments: {
    enabled: true,
    max_mb: 10
  }
};

export async function getPaymentSettings(): Promise<PaymentSettings> {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data, error } = await supabase
      .from('app_config')
      .select('value')
      .eq('key', 'payments')
      .single();

    if (error || !data?.value) {
      return defaultPaymentSettings;
    }

    const parsed = JSON.parse(data.value);
    return { ...defaultPaymentSettings, ...parsed };
  } catch (error) {
    console.error('Error fetching payment settings:', error);
    return defaultPaymentSettings;
  }
}

export async function getProposalSettings(): Promise<ProposalSettings> {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data, error } = await supabase
      .from('app_config')
      .select('value')
      .eq('key', 'proposals')
      .single();

    if (error || !data?.value) {
      return defaultProposalSettings;
    }

    const parsed = JSON.parse(data.value);
    return { ...defaultProposalSettings, ...parsed };
  } catch (error) {
    console.error('Error fetching proposal settings:', error);
    return defaultProposalSettings;
  }
}