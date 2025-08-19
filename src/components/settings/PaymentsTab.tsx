import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle, CreditCard, Banknote, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PaymentSettings, maskSecretKey } from '@/types/settings';

interface PaymentsTabProps {
  settings: PaymentSettings;
  onChange: (settings: PaymentSettings) => void;
  errors: Record<string, string>;
  onClearError: (field: string) => void;
}

export function PaymentsTab({ settings, onChange, errors, onClearError }: PaymentsTabProps) {
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});

  const handleStripeChange = (field: keyof PaymentSettings['stripe'], value: string) => {
    onChange({
      ...settings,
      stripe: { ...settings.stripe, [field]: value }
    });
    onClearError(`stripe.${field}`);
  };

  const handleBankTransferChange = (field: keyof PaymentSettings['bank_transfer'], value: string | boolean) => {
    onChange({
      ...settings,
      bank_transfer: { ...settings.bank_transfer, [field]: value }
    });
    onClearError(`bank_transfer.${field}`);
  };

  const toggleSecretVisibility = (field: string) => {
    setShowSecrets(prev => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <div className="space-y-6">
      {/* Stripe Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Stripe Configuration
          </CardTitle>
          <CardDescription>
            Configure Stripe payment processing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Label>Payment Mode</Label>
            <RadioGroup
              value={settings.stripe.mode}
              onValueChange={(value: "test" | "live") => handleStripeChange('mode', value)}
              className="flex gap-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="test" id="test" />
                <Label htmlFor="test">Test Mode</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="live" id="live" />
                <Label htmlFor="live">Live Mode</Label>
              </div>
            </RadioGroup>
            <p className="text-sm text-muted-foreground">
              Use test mode for development and live mode for production
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="stripe_publishable_key">Publishable Key</Label>
            <div className="relative">
              <Input
                id="stripe_publishable_key"
                type={showSecrets.publishable_key ? "text" : "password"}
                value={settings.stripe.publishable_key || ''}
                onChange={(e) => handleStripeChange('publishable_key', e.target.value)}
                placeholder={settings.stripe.mode === 'test' ? 'pk_test_...' : 'pk_live_...'}
                className={errors['stripe.publishable_key'] ? 'border-destructive' : ''}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => toggleSecretVisibility('publishable_key')}
              >
                {showSecrets.publishable_key ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            {errors['stripe.publishable_key'] && (
              <p className="text-sm text-destructive">{errors['stripe.publishable_key']}</p>
            )}
            <p className="text-sm text-muted-foreground">
              {settings.stripe.publishable_key 
                ? `Showing: ${maskSecretKey(settings.stripe.publishable_key)}`
                : 'Find this in your Stripe Dashboard → Developers → API keys'
              }
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="stripe_webhook_secret">Webhook Secret</Label>
            <div className="relative">
              <Input
                id="stripe_webhook_secret"
                type={showSecrets.webhook_secret ? "text" : "password"}
                value={settings.stripe.webhook_secret || ''}
                onChange={(e) => handleStripeChange('webhook_secret', e.target.value)}
                placeholder="whsec_..."
                className={errors['stripe.webhook_secret'] ? 'border-destructive' : ''}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => toggleSecretVisibility('webhook_secret')}
              >
                {showSecrets.webhook_secret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            {errors['stripe.webhook_secret'] && (
              <p className="text-sm text-destructive">{errors['stripe.webhook_secret']}</p>
            )}
            <p className="text-sm text-muted-foreground">
              {settings.stripe.webhook_secret 
                ? `Configured: ${maskSecretKey(settings.stripe.webhook_secret)}`
                : 'Get this from your Stripe Dashboard → Developers → Webhooks'
              }
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="statement_descriptor">Statement Descriptor (Optional)</Label>
            <Input
              id="statement_descriptor"
              value={settings.stripe.statement_descriptor || ''}
              onChange={(e) => handleStripeChange('statement_descriptor', e.target.value)}
              placeholder="AGENKO DEV"
              maxLength={22}
              className={errors['stripe.statement_descriptor'] ? 'border-destructive' : ''}
            />
            {errors['stripe.statement_descriptor'] && (
              <p className="text-sm text-destructive">{errors['stripe.statement_descriptor']}</p>
            )}
            <p className="text-sm text-muted-foreground">
              Text that appears on customer credit card statements (max 22 characters)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Bank Transfer Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Banknote className="h-5 w-5" />
            Bank Transfer Configuration
          </CardTitle>
          <CardDescription>
            Configure offline bank transfer payments for local clients
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Bank Transfer</Label>
              <p className="text-sm text-muted-foreground">
                Allow customers to pay via bank transfer
              </p>
            </div>
            <Switch
              checked={settings.bank_transfer.enabled}
              onCheckedChange={(checked) => handleBankTransferChange('enabled', checked)}
            />
          </div>

          {settings.bank_transfer.enabled && (
            <>
              <div className="space-y-2">
                <Label htmlFor="bank_instructions">Payment Instructions</Label>
                <Textarea
                  id="bank_instructions"
                  value={settings.bank_transfer.instructions_md}
                  onChange={(e) => handleBankTransferChange('instructions_md', e.target.value)}
                  placeholder="Please transfer the amount to the following bank account..."
                  rows={4}
                  className={errors['bank_transfer.instructions_md'] ? 'border-destructive' : ''}
                />
                {errors['bank_transfer.instructions_md'] && (
                  <p className="text-sm text-destructive">{errors['bank_transfer.instructions_md']}</p>
                )}
                <p className="text-sm text-muted-foreground">
                  Markdown supported. Include bank details and payment instructions.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="beneficiary_name">Beneficiary Name</Label>
                  <Input
                    id="beneficiary_name"
                    value={settings.bank_transfer.beneficiary_name || ''}
                    onChange={(e) => handleBankTransferChange('beneficiary_name', e.target.value)}
                    placeholder="Agenko Development Ltd"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="bank_name">Bank Name</Label>
                  <Input
                    id="bank_name"
                    value={settings.bank_transfer.bank_name || ''}
                    onChange={(e) => handleBankTransferChange('bank_name', e.target.value)}
                    placeholder="Finabank Suriname"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="account_number">Account Number (Display)</Label>
                  <Input
                    id="account_number"
                    value={settings.bank_transfer.account_number_masked || ''}
                    onChange={(e) => handleBankTransferChange('account_number_masked', e.target.value)}
                    placeholder="****1234"
                  />
                  <p className="text-sm text-muted-foreground">
                    Use masked format for security (e.g., ****1234)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="iban">IBAN (Optional)</Label>
                  <Input
                    id="iban"
                    value={settings.bank_transfer.iban || ''}
                    onChange={(e) => handleBankTransferChange('iban', e.target.value)}
                    placeholder="SR12 FINA 0000 1234 5678"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="swift">SWIFT/BIC Code (Optional)</Label>
                <Input
                  id="swift"
                  value={settings.bank_transfer.swift || ''}
                  onChange={(e) => handleBankTransferChange('swift', e.target.value)}
                  placeholder="FINASR12"
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Security Notice */}
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
            <div className="space-y-1">
              <p className="font-medium text-orange-800">Security Notice</p>
              <p className="text-sm text-orange-700">
                Secret keys are stored securely on the server and never exposed to the client. 
                The Stripe secret key should be set as an environment variable and managed through 
                your deployment platform's secrets management.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}