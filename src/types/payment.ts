export interface Order {
  id: string;
  user_id?: string;
  email: string;
  amount: number; // in cents
  currency: string;
  provider: 'stripe' | 'bank_transfer';
  provider_order_id?: string;
  status: 'pending' | 'paid' | 'failed' | 'canceled' | 'awaiting_verification';
  metadata?: any;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  order_id: string;
  provider: string;
  provider_payment_id?: string;
  amount: number;
  currency: string;
  status: string;
  provider_data?: any;
  admin_notes?: string;
  verified_by?: string;
  verified_at?: string;
  created_at: string;
}

export interface PaymentProvider {
  name: string;
  type: 'stripe' | 'bank_transfer';
  createCheckout: (params: CheckoutParams) => Promise<CheckoutResult>;
}

export interface CheckoutParams {
  amount: number;
  currency?: string;
  productName?: string;
  customerInfo?: {
    name?: string;
    email: string;
    phone?: string;
  };
  successUrl?: string;
  cancelUrl?: string;
}

export interface CheckoutResult {
  url?: string;
  orderId: string;
  reference?: string;
  bankDetails?: BankDetails;
}

export interface BankDetails {
  bankName: string;
  accountName: string;
  accountNumber: string;
  swiftCode: string;
  reference: string;
  amount: number;
  currency: string;
  instructions: string[];
}

export interface PricingTier {
  id: string;
  name: string;
  price: number; // in cents
  currency: string;
  description: string;
  features: string[];
  popular?: boolean;
}