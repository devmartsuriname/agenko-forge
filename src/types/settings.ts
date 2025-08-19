// Settings type definitions for Phase 7

export interface PaymentSettings {
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

export interface ProposalSettings {
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

export interface AppSettings {
  payments?: PaymentSettings;
  proposals?: ProposalSettings;
}

// Helper functions
export function getPaymentSettings(appConfig: any): PaymentSettings {
  if (!appConfig?.payments) {
    return {
      provider_order: ["stripe", "bank_transfer"],
      stripe: { mode: "test" },
      bank_transfer: { enabled: false, instructions_md: "" }
    };
  }
  
  try {
    return typeof appConfig.payments === 'string' 
      ? JSON.parse(appConfig.payments)
      : appConfig.payments;
  } catch {
    return {
      provider_order: ["stripe", "bank_transfer"],
      stripe: { mode: "test" },
      bank_transfer: { enabled: false, instructions_md: "" }
    };
  }
}

export function getProposalSettings(appConfig: any): ProposalSettings {
  if (!appConfig?.proposals) {
    return {
      branding: { primary_color: "#6366f1" },
      email: { from_name: "", from_email: "", bcc_me: false },
      tokens: { ttl_hours: 168, single_use: false },
      attachments: { enabled: true, max_mb: 10 }
    };
  }
  
  try {
    return typeof appConfig.proposals === 'string' 
      ? JSON.parse(appConfig.proposals)
      : appConfig.proposals;
  } catch {
    return {
      branding: { primary_color: "#6366f1" },
      email: { from_name: "", from_email: "", bcc_me: false },
      tokens: { ttl_hours: 168, single_use: false },
      attachments: { enabled: true, max_mb: 10 }
    };
  }
}

export function maskSecretKey(key: string): string {
  if (!key || key.length < 8) return key;
  return key.slice(0, 4) + '*'.repeat(key.length - 8) + key.slice(-4);
}