import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Mail, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useCTATracking } from '@/hooks/useCTATracking';

interface StickyNewsletterBarProps {
  enabled?: boolean;
  showAfterScroll?: number; // Show after user scrolls X pixels
  hideAfterDays?: number; // Hide for X days after dismissal
  message?: string;
  placeholder?: string;
}

export function StickyNewsletterBar({
  enabled = true,
  showAfterScroll = 800,
  hideAfterDays = 7,
  message = "📧 Get weekly insights delivered to your inbox!",
  placeholder = "Enter your email..."
}: StickyNewsletterBarProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState('');
  const [hasScrolled, setHasScrolled] = useState(false);
  
  const { trackInteraction } = useCTATracking();

  useEffect(() => {
    if (!enabled) return;

    // Check if user has dismissed recently
    const dismissedAt = localStorage.getItem('sticky-newsletter-dismissed');
    if (dismissedAt) {
      const dismissedDate = new Date(dismissedAt);
      const daysSinceDismissal = (Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissal < hideAfterDays) {
        return;
      }
    }

    // Check if user is already subscribed
    const isSubscribed = localStorage.getItem('newsletter-subscribed');
    if (isSubscribed) {
      return;
    }

    const handleScroll = () => {
      if (window.scrollY > showAfterScroll && !hasScrolled) {
        setHasScrolled(true);
        setTimeout(() => {
          setIsVisible(true);
          trackInteraction({
            cta_type: 'sticky_bar',
            action: 'shown',
            page_url: window.location.href,
            element_id: 'sticky-newsletter-bar',
            metadata: { scrollPosition: window.scrollY }
          });
        }, 1000); // Small delay for better UX
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [enabled, showAfterScroll, hideAfterDays, hasScrolled, trackInteraction]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    setIsSubmitting(true);
    
    try {
      trackInteraction({
        cta_type: 'sticky_bar',
        action: 'clicked',
        page_url: window.location.href,
        element_id: 'sticky-newsletter-bar',
        metadata: { email }
      });

      const { data, error } = await supabase.functions.invoke('subscribe-email', {
        body: {
          email: email.trim(),
          source: 'sticky_bar'
        }
      });

      if (error) {
        throw new Error(error.message || 'Failed to subscribe');
      }

      toast.success('Successfully subscribed!');
      localStorage.setItem('newsletter-subscribed', 'true');
      
      trackInteraction({
        cta_type: 'sticky_bar',
        action: 'converted',
        page_url: window.location.href,
        element_id: 'sticky-newsletter-bar',
        metadata: { email, subscriptionId: data.subscriptionId }
      });

      setIsVisible(false);

    } catch (error) {
      console.error('Subscription error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to subscribe';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDismiss = () => {
    trackInteraction({
      cta_type: 'sticky_bar',
      action: 'dismissed',
      page_url: window.location.href,
      element_id: 'sticky-newsletter-bar'
    });

    setIsVisible(false);
    localStorage.setItem('sticky-newsletter-dismissed', new Date().toISOString());
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-primary text-primary-foreground shadow-lg animate-slide-up">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {message}
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <Input
              type="email"
              placeholder={placeholder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-64 h-8 text-sm bg-background text-foreground"
              disabled={isSubmitting}
              required
            />
            <Button 
              type="submit" 
              size="sm" 
              variant="secondary"
              disabled={isSubmitting}
              className="whitespace-nowrap"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-1" />
                  Subscribe
                </>
              )}
            </Button>
          </form>
          
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleDismiss}
            className="text-primary-foreground hover:bg-primary-foreground/20 p-1"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}