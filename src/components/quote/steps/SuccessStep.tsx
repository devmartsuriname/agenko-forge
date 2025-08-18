import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Mail, Copy, ArrowRight } from 'lucide-react';
import { QuoteFormData } from '@/types/quote';
import { toast } from 'sonner';

interface SuccessStepProps {
  quoteId: string | null;
  formData: QuoteFormData;
}

export function SuccessStep({ quoteId, formData }: SuccessStepProps) {
  const copyQuoteId = () => {
    if (quoteId) {
      navigator.clipboard.writeText(quoteId);
      toast.success('Quote ID copied to clipboard');
    }
  };

  return (
    <div className="text-center space-y-6">
      {/* Success Icon */}
      <div className="flex justify-center">
        <div className="bg-green-100 dark:bg-green-900/20 p-6 rounded-full">
          <CheckCircle className="h-16 w-16 text-green-600 dark:text-green-400" />
        </div>
      </div>

      {/* Success Message */}
      <div>
        <h2 className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
          Quote Request Submitted!
        </h2>
        <p className="text-muted-foreground">
          Thank you, {formData.name}! We've received your quote request and will get back to you within 24 hours.
        </p>
      </div>

      {/* Quote ID */}
      {quoteId && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Your Quote Reference</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center gap-2">
              <Badge variant="outline" className="font-mono text-sm px-3 py-1">
                {quoteId}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={copyQuoteId}
                className="h-8 w-8 p-0"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Save this reference number for your records
            </p>
          </CardContent>
        </Card>
      )}

      {/* Next Steps */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-center gap-2">
            <Mail className="h-5 w-5" />
            What's Next?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <div className="bg-primary/20 text-primary rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mt-0.5">
                1
              </div>
              <div>
                <p className="font-medium">Quote Review (within 24 hours)</p>
                <p className="text-muted-foreground text-xs">
                  Our team will review your requirements and prepare a detailed quote
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-primary/20 text-primary rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mt-0.5">
                2
              </div>
              <div>
                <p className="font-medium">Quote Delivery</p>
                <p className="text-muted-foreground text-xs">
                  You'll receive a comprehensive quote at {formData.email}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-primary/20 text-primary rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mt-0.5">
                3
              </div>
              <div>
                <p className="font-medium">Discussion & Refinement</p>
                <p className="text-muted-foreground text-xs">
                  We'll discuss the details and refine the scope if needed
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button
          variant="outline"
          onClick={() => window.location.href = '/'}
          className="flex items-center gap-2"
        >
          <ArrowRight className="h-4 w-4" />
          Back to Home
        </Button>
        
        <Button
          onClick={() => window.location.href = '/contact'}
          className="flex items-center gap-2"
        >
          <Mail className="h-4 w-4" />
          Contact Us Directly
        </Button>
      </div>

      {/* Additional Info */}
      <div className="bg-muted/50 p-4 rounded-lg">
        <h3 className="font-medium text-sm mb-2">Need immediate assistance?</h3>
        <p className="text-xs text-muted-foreground">
          If you have urgent questions or need to discuss your project immediately, 
          feel free to contact us directly. We're here to help!
        </p>
      </div>
    </div>
  );
}