import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mail, ArrowRight, X } from 'lucide-react';
import { EmailCaptureModal } from './EmailCaptureModal';
import { useCTATracking } from '@/hooks/useCTATracking';

interface ScrollProgressCTAProps {
  enabled?: boolean;
  triggerAtPercentage?: number; // Show when user scrolls to X% of page
  title?: string;
  subtitle?: string;
  hideAfterDays?: number;
}

export function ScrollProgressCTA({
  enabled = true,
  triggerAtPercentage = 70,
  title = "Enjoying our content?",
  subtitle = "Get more insights delivered weekly!",
  hideAfterDays = 3
}: ScrollProgressCTAProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);
  
  const { trackInteraction } = useCTATracking();

  useEffect(() => {
    if (!enabled || hasTriggered) return;

    // Check if user has dismissed recently
    const dismissedAt = localStorage.getItem('scroll-cta-dismissed');
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
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercentage = (scrollTop / scrollHeight) * 100;

      if (scrollPercentage >= triggerAtPercentage && !hasTriggered) {
        setHasTriggered(true);
        setTimeout(() => {
          setIsVisible(true);
          trackInteraction({
            cta_type: 'scroll_progress',
            action: 'shown',
            page_url: window.location.href,
            element_id: 'scroll-progress-cta',
            metadata: { scrollPercentage, triggerAt: triggerAtPercentage }
          });
        }, 500);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [enabled, triggerAtPercentage, hasTriggered, hideAfterDays, trackInteraction]);

  const handleClick = () => {
    trackInteraction({
      cta_type: 'scroll_progress',
      action: 'clicked',
      page_url: window.location.href,
      element_id: 'scroll-progress-cta'
    });
    setShowModal(true);
  };

  const handleDismiss = () => {
    trackInteraction({
      cta_type: 'scroll_progress',
      action: 'dismissed',
      page_url: window.location.href,
      element_id: 'scroll-progress-cta'
    });

    setIsVisible(false);
    localStorage.setItem('scroll-cta-dismissed', new Date().toISOString());
  };

  const handleModalClose = () => {
    setShowModal(false);
    setIsVisible(false); // Hide the CTA after modal interaction
  };

  if (!isVisible) return null;

  return (
    <>
      <div className="fixed right-4 bottom-20 z-40 max-w-sm animate-slide-in-right">
        <div className="bg-card border border-border rounded-lg shadow-lg p-4">
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1">
              <h3 className="font-semibold text-sm mb-1">{title}</h3>
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleDismiss}
              className="p-1 h-6 w-6"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
          
          <Button 
            onClick={handleClick}
            size="sm" 
            className="w-full text-xs"
          >
            <Mail className="h-3 w-3 mr-2" />
            Subscribe Now
            <ArrowRight className="h-3 w-3 ml-2" />
          </Button>
        </div>
      </div>

      <EmailCaptureModal
        isOpen={showModal}
        onClose={handleModalClose}
        title="Thanks for Reading!"
        description="Since you've made it this far, you might enjoy our weekly insights delivered straight to your inbox."
        incentive="🚀 Join 1000+ developers getting weekly tips"
        source="scroll_progress"
      />
    </>
  );
}