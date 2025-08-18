import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Send, User, Mail, Building2, Phone } from 'lucide-react';
import { QuoteFormData, SERVICE_TYPES, BUDGET_RANGES, TIMELINE_OPTIONS } from '@/types/quote';

interface ReviewStepProps {
  data: QuoteFormData;
  onUpdate: (updates: Partial<QuoteFormData>) => void;
  onSubmit: () => void;
  submitting: boolean;
}

export function ReviewStep({ data, onUpdate, onSubmit, submitting }: ReviewStepProps) {
  const selectedService = SERVICE_TYPES.find(s => s.value === data.serviceType);
  const selectedBudget = BUDGET_RANGES.find(b => b.value === data.budgetRange);
  const selectedTimeline = TIMELINE_OPTIONS.find(t => t.value === data.timeline);

  return (
    <div className="space-y-6">
      {/* Contact Information Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="h-5 w-5" />
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{data.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span>{data.email}</span>
          </div>
          {data.company && (
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span>{data.company}</span>
            </div>
          )}
          {data.phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{data.phone}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Project Details Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Project Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Service Type</Label>
            <div className="flex items-center gap-2 mt-1">
              <span>{selectedService?.icon}</span>
              <span>{selectedService?.label}</span>
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium">Project Description</Label>
            <div className="mt-1 p-3 bg-muted/50 rounded-md text-sm">
              {data.projectScope}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label className="text-sm font-medium">Budget Range</Label>
              <Badge variant="secondary" className="mt-1">
                {selectedBudget?.label}
              </Badge>
            </div>
            <div>
              <Label className="text-sm font-medium">Timeline</Label>
              <Badge variant="outline" className="mt-1">
                {selectedTimeline?.label}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Requirements */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Additional Information</CardTitle>
        </CardHeader>
        <CardContent>
          <Label htmlFor="additional-requirements" className="text-sm font-medium">
            Any additional requirements or questions?
          </Label>
          <Textarea
            id="additional-requirements"
            value={data.additionalRequirements || ''}
            onChange={(e) => onUpdate({ additionalRequirements: e.target.value })}
            placeholder="Any specific technologies, integrations, design preferences, or other requirements we should know about..."
            className="mt-2"
            rows={4}
          />
          <p className="text-xs text-muted-foreground mt-2">
            Optional - this helps us provide a more accurate quote
          </p>
        </CardContent>
      </Card>

      {/* Terms and Submit */}
      <Card className="border-primary/20">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
              <h3 className="font-medium text-sm mb-2 text-blue-900 dark:text-blue-100">
                What happens next?
              </h3>
              <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
                <li>• We'll review your request within 24 hours</li>
                <li>• You'll receive a detailed quote via email</li>
                <li>• We may reach out for clarification if needed</li>
                <li>• No obligation - the quote is completely free</li>
              </ul>
            </div>

            <div className="text-xs text-muted-foreground">
              By submitting this form, you agree to our privacy policy and terms of service. 
              We'll only use your information to process your quote request.
            </div>

            <Button 
              onClick={onSubmit}
              disabled={submitting}
              className="w-full"
              size="lg"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting Quote Request...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Quote Request
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}