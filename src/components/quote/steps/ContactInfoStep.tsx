import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { QuoteFormData } from '@/types/quote';

interface ContactInfoStepProps {
  data: QuoteFormData;
  onUpdate: (updates: Partial<QuoteFormData>) => void;
}

export function ContactInfoStep({ data, onUpdate }: ContactInfoStepProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="name" className="text-sm font-medium">
            Full Name *
          </Label>
          <Input
            id="name"
            type="text"
            value={data.name}
            onChange={(e) => onUpdate({ name: e.target.value })}
            placeholder="John Doe"
            className="mt-1"
            required
            aria-describedby="name-error"
          />
          {!data.name && (
            <p id="name-error" className="text-sm text-destructive mt-1">
              Name is required
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="email" className="text-sm font-medium">
            Email Address *
          </Label>
          <Input
            id="email"
            type="email"
            value={data.email}
            onChange={(e) => onUpdate({ email: e.target.value })}
            placeholder="john@example.com"
            className="mt-1"
            required
            aria-describedby="email-error"
          />
          {!data.email && (
            <p id="email-error" className="text-sm text-destructive mt-1">
              Email is required
            </p>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="company" className="text-sm font-medium">
            Company/Organization
          </Label>
          <Input
            id="company"
            type="text"
            value={data.company || ''}
            onChange={(e) => onUpdate({ company: e.target.value })}
            placeholder="Your Company Inc."
            className="mt-1"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Optional - helps us understand your business context
          </p>
        </div>

        <div>
          <Label htmlFor="phone" className="text-sm font-medium">
            Phone Number
          </Label>
          <Input
            id="phone"
            type="tel"
            value={data.phone || ''}
            onChange={(e) => onUpdate({ phone: e.target.value })}
            placeholder="+1 (555) 123-4567"
            className="mt-1"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Optional - for urgent clarifications
          </p>
        </div>
      </div>

      <div className="bg-muted/50 p-4 rounded-lg">
        <h3 className="font-medium text-sm mb-2">Privacy Notice</h3>
        <p className="text-xs text-muted-foreground">
          Your information will only be used to process your quote request and communicate with you about your project. 
          We never share your data with third parties.
        </p>
      </div>
    </div>
  );
}