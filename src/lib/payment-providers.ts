import { supabase } from "@/integrations/supabase/client";
import { PaymentProvider, CheckoutParams, CheckoutResult } from "@/types/payment";

export class StripeProvider implements PaymentProvider {
  name = "Stripe";
  type = "stripe" as const;

  async createCheckout(params: CheckoutParams): Promise<CheckoutResult> {
    const { data, error } = await supabase.functions.invoke('create-stripe-checkout', {
      body: {
        amount: params.amount,
        currency: params.currency || 'usd',
        productName: params.productName || 'Premium Service',
        successUrl: params.successUrl,
        cancelUrl: params.cancelUrl
      }
    });

    if (error) {
      throw new Error(error.message || 'Failed to create Stripe checkout');
    }

    return {
      url: data.url,
      orderId: data.orderId
    };
  }
}

export class BankTransferProvider implements PaymentProvider {
  name = "Bank Transfer (Suriname)";
  type = "bank_transfer" as const;

  async createCheckout(params: CheckoutParams): Promise<CheckoutResult> {
    if (!params.customerInfo?.name || !params.customerInfo?.email) {
      throw new Error('Customer name and email are required for bank transfer');
    }

    const { data, error } = await supabase.functions.invoke('create-bank-transfer-order', {
      body: {
        amount: params.amount,
        currency: params.currency || 'usd',
        productName: params.productName || 'Premium Service',
        customerInfo: params.customerInfo
      }
    });

    if (error) {
      throw new Error(error.message || 'Failed to create bank transfer order');
    }

    return {
      orderId: data.orderId,
      reference: data.bankReference,
      bankDetails: data.bankDetails
    };
  }
}

export const paymentProviders = {
  stripe: new StripeProvider(),
  bank_transfer: new BankTransferProvider()
};

export function getPaymentProvider(type: 'stripe' | 'bank_transfer'): PaymentProvider {
  return paymentProviders[type];
}