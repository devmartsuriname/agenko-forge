import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, Building2, Loader2 } from 'lucide-react';
import { PricingTier } from '@/types/payment';
import { getPaymentProvider } from '@/lib/payment-providers';
import { toast } from 'sonner';

interface PaymentMethodDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tier: PricingTier;
}

export function PaymentMethodDialog({ open, onOpenChange, tier }: PaymentMethodDialogProps) {
  const [selectedMethod, setSelectedMethod] = useState<'stripe' | 'bank_transfer' | null>(null);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(price / 100);
  };

  const handlePayment = async () => {
    if (!selectedMethod) return;

    setLoading(true);
    try {
      const provider = getPaymentProvider(selectedMethod);
      
      const result = await provider.createCheckout({
        amount: tier.price,
        currency: tier.currency,
        productName: tier.name,
        customerInfo: selectedMethod === 'bank_transfer' ? customerInfo : undefined,
        successUrl: `${window.location.origin}/payment-success`,
        cancelUrl: `${window.location.origin}/payment-canceled`
      });

      if (result.url) {
        // Redirect to Stripe checkout
        window.open(result.url, '_blank');
      } else if (result.bankDetails) {
        // Show bank transfer instructions
        toast.success('Bank transfer order created successfully!');
        // You could redirect to a bank transfer instructions page here
        window.open(`/bank-transfer-instructions?orderId=${result.orderId}`, '_blank');
      }

      onOpenChange(false);
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(error instanceof Error ? error.message : 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = selectedMethod === 'stripe' || 
    (selectedMethod === 'bank_transfer' && customerInfo.name && customerInfo.email);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Choose Payment Method</DialogTitle>
          <DialogDescription>
            You selected {tier.name} - {formatPrice(tier.price, tier.currency)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Payment Method Selection */}
          <div className="grid gap-4">
            <Card 
              className={`cursor-pointer transition-colors ${
                selectedMethod === 'stripe' ? 'border-primary bg-primary/5' : ''
              }`}
              onClick={() => setSelectedMethod('stripe')}
            >
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <CreditCard className="h-5 w-5 mr-2" />
                <div className="flex-1">
                  <CardTitle className="text-lg">Credit Card</CardTitle>
                  <CardDescription>Pay securely with Stripe</CardDescription>
                </div>
              </CardHeader>
            </Card>

            <Card 
              className={`cursor-pointer transition-colors ${
                selectedMethod === 'bank_transfer' ? 'border-primary bg-primary/5' : ''
              }`}
              onClick={() => setSelectedMethod('bank_transfer')}
            >
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <Building2 className="h-5 w-5 mr-2" />
                <div className="flex-1">
                  <CardTitle className="text-lg">Bank Transfer (Suriname)</CardTitle>
                  <CardDescription>Direct bank transfer with manual verification</CardDescription>
                </div>
              </CardHeader>
            </Card>
          </div>

          {/* Customer Information for Bank Transfer */}
          {selectedMethod === 'bank_transfer' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Customer Information</CardTitle>
                <CardDescription>Required for bank transfer verification</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="customer-name">Full Name *</Label>
                  <Input
                    id="customer-name"
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <Label htmlFor="customer-email">Email Address *</Label>
                  <Input
                    id="customer-email"
                    type="email"
                    value={customerInfo.email}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter your email address"
                  />
                </div>
                <div>
                  <Label htmlFor="customer-phone">Phone Number</Label>
                  <Input
                    id="customer-phone"
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Enter your phone number (optional)"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handlePayment}
              disabled={!isFormValid || loading}
            >
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {selectedMethod === 'stripe' ? 'Pay with Stripe' : 'Create Bank Transfer Order'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}