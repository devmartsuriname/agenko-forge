import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface CTATrackingData {
  cta_type: string;
  action: string;
  page_url: string;
  element_id?: string;
  metadata?: Record<string, any>;
}

export function useCTATracking() {
  const trackInteraction = useCallback(async (data: CTATrackingData) => {
    try {
      // Add session ID to help group interactions
      const sessionId = sessionStorage.getItem('session-id') || (() => {
        const newId = crypto.randomUUID();
        sessionStorage.setItem('session-id', newId);
        return newId;
      })();

      await supabase.functions.invoke('track-cta-interaction', {
        body: {
          ...data,
          metadata: {
            ...data.metadata,
            sessionId,
            timestamp: Date.now(),
            userAgent: navigator.userAgent,
            viewportWidth: window.innerWidth,
            viewportHeight: window.innerHeight
          }
        },
        headers: {
          'x-session-id': sessionId
        }
      });
    } catch (error) {
      // Silently fail tracking - don't disrupt user experience
      console.warn('CTA tracking failed:', error);
    }
  }, []);

  return { trackInteraction };
}