import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, X, CheckCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useCTATracking } from '@/hooks/useCTATracking';

interface EmailCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  source?: string;
  incentive?: string;
}

export function EmailCaptureModal({ 
  isOpen, 
  onClose, 
  title = "Stay in the Loop!",
  description = "Get the latest insights, tips, and updates delivered directly to your inbox.",
  source = "modal",
  incentive
}: EmailCaptureModalProps) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const { trackInteraction } = useCTATracking();

  React.useEffect(() => {
    if (isOpen) {
      trackInteraction({
        cta_type: 'newsletter',
        action: 'shown',
        page_url: window.location.href,
        element_id: 'email-capture-modal',
        metadata: { source, incentive }
      });
    }
  }, [isOpen, source, incentive, trackInteraction]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    setIsSubmitting(true);
    
    try {
      trackInteraction({
        cta_type: 'newsletter',
        action: 'clicked',
        page_url: window.location.href,
        element_id: 'email-capture-modal',
        metadata: { source, email }
      });

      const { data, error } = await supabase.functions.invoke('subscribe-email', {
        body: {
          email: email.trim(),
          name: name.trim() || undefined,
          source
        }
      });

      if (error) {
        throw new Error(error.message || 'Failed to subscribe');
      }

      setIsSuccess(true);
      toast.success('Successfully subscribed to our newsletter!');

      trackInteraction({
        cta_type: 'newsletter',
        action: 'converted',
        page_url: window.location.href,
        element_id: 'email-capture-modal',
        metadata: { source, email, subscriptionId: data.subscriptionId }
      });

      // Auto-close after success
      setTimeout(() => {
        onClose();
        setIsSuccess(false);
        setEmail('');
        setName('');
      }, 2000);

    } catch (error) {
      console.error('Subscription error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to subscribe';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    trackInteraction({
      cta_type: 'newsletter',
      action: 'dismissed',
      page_url: window.location.href,
      element_id: 'email-capture-modal',
      metadata: { source }
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isSuccess ? (
              <>
                <CheckCircle className="h-5 w-5 text-green-500" />
                Welcome Aboard!
              </>
            ) : (
              <>
                <Mail className="h-5 w-5 text-primary" />
                {title}
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {isSuccess ? (
              "Thank you for subscribing! You'll receive our latest updates soon."
            ) : (
              <>
                {description}
                {incentive && (
                  <div className="mt-2 p-2 bg-primary/10 rounded-lg text-sm font-medium text-primary">
                    {incentive}
                  </div>
                )}
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        {!isSuccess && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name (optional)</Label>
              <Input
                id="name"
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button 
                type="submit" 
                className="flex-1"
                disabled={isSubmitting}
              >
                {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Subscribe
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClose}
                disabled={isSubmitting}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </form>
        )}

        <p className="text-xs text-muted-foreground text-center">
          We respect your privacy. Unsubscribe at any time.
        </p>
      </DialogContent>
    </Dialog>
  );
}