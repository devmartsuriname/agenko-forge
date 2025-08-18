import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
import { PricingTier } from '@/types/payment';
import { PaymentMethodDialog } from './PaymentMethodDialog';

const defaultTiers: PricingTier[] = [
  {
    id: 'basic',
    name: 'Basic',
    price: 2999, // $29.99
    currency: 'usd',
    description: 'Perfect for getting started',
    features: [
      'Up to 5 projects',
      'Basic support',
      'Standard templates',
      '5GB storage'
    ]
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 4999, // $49.99
    currency: 'usd',
    description: 'Most popular choice',
    features: [
      'Unlimited projects',
      'Priority support',
      'Premium templates',
      '50GB storage',
      'Advanced analytics',
      'Custom domain'
    ],
    popular: true
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 9999, // $99.99
    currency: 'usd',
    description: 'For large organizations',
    features: [
      'Everything in Premium',
      'Dedicated support',
      'Custom integrations',
      '500GB storage',
      'White-label solution',
      'API access'
    ]
  }
];

interface PricingTiersProps {
  tiers?: PricingTier[];
  onSelectTier?: (tier: PricingTier) => void;
}

export function PricingTiers({ tiers = defaultTiers, onSelectTier }: PricingTiersProps) {
  const [selectedTier, setSelectedTier] = useState<PricingTier | null>(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);

  const handleSelectTier = (tier: PricingTier) => {
    setSelectedTier(tier);
    setShowPaymentDialog(true);
    onSelectTier?.(tier);
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(price / 100);
  };

  return (
    <>
      <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {tiers.map((tier) => (
          <Card key={tier.id} className={`relative ${tier.popular ? 'border-primary shadow-lg' : ''}`}>
            {tier.popular && (
              <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground">
                Most Popular
              </Badge>
            )}
            
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">{tier.name}</CardTitle>
              <CardDescription>{tier.description}</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">
                  {formatPrice(tier.price, tier.currency)}
                </span>
                <span className="text-muted-foreground">/month</span>
              </div>
            </CardHeader>
            
            <CardContent>
              <ul className="space-y-3">
                {tier.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            
            <CardFooter>
              <Button 
                className="w-full" 
                variant={tier.popular ? 'default' : 'outline'}
                onClick={() => handleSelectTier(tier)}
              >
                Choose {tier.name}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {selectedTier && (
        <PaymentMethodDialog
          open={showPaymentDialog}
          onOpenChange={setShowPaymentDialog}
          tier={selectedTier}
        />
      )}
    </>
  );
}