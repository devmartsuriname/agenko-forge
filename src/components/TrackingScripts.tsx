import { useEffect, useState } from 'react';

interface TrackingScriptsProps {
  ga4TrackingId?: string;
  googleAdsId?: string;
  metaPixelId?: string;
  linkedinPartnerId?: string;
  trackingEnabled?: boolean;
}

// Check if we're in production and not on admin routes
const shouldLoadTracking = () => {
  if (typeof window === 'undefined') return false;
  
  // Only load on production domain
  const isProduction = window.location.hostname !== 'localhost' && 
                      !window.location.hostname.includes('127.0.0.1') &&
                      !window.location.hostname.includes('.lovable.app');
  
  // Don't load on admin routes
  const isAdminRoute = window.location.pathname.startsWith('/admin');
  
  return isProduction && !isAdminRoute;
};

// Consent management with localStorage persistence
const CONSENT_KEY = 'tracking-consent';

interface ConsentStatus {
  accepted: boolean;
  timestamp: number;
}

const getConsentStatus = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  try {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (!stored) return false;
    
    const consent: ConsentStatus = JSON.parse(stored);
    return consent.accepted;
  } catch {
    return false;
  }
};

const setConsentStatus = (accepted: boolean): void => {
  if (typeof window === 'undefined') return;
  
  const consent: ConsentStatus = {
    accepted,
    timestamp: Date.now()
  };
  
  localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
  
  // Trigger a custom event to notify other components
  window.dispatchEvent(new CustomEvent('consentChanged', { detail: { accepted } }));
};

const hasConsentChoice = (): boolean => {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(CONSENT_KEY) !== null;
};

export function TrackingScripts({
  ga4TrackingId,
  googleAdsId,
  metaPixelId,
  linkedinPartnerId,
  trackingEnabled = true
}: TrackingScriptsProps) {
  useEffect(() => {
    // Exit if tracking is disabled or conditions not met
    if (!trackingEnabled || !shouldLoadTracking() || !getConsentStatus()) {
      return;
    }

    const scripts: HTMLScriptElement[] = [];
    
    // Google Analytics 4
    if (ga4TrackingId) {
      // Load gtag script
      const gtagScript = document.createElement('script');
      gtagScript.async = true;
      gtagScript.src = `https://www.googletagmanager.com/gtag/js?id=${ga4TrackingId}`;
      document.head.appendChild(gtagScript);
      scripts.push(gtagScript);

      // Initialize gtag
      const gtagConfigScript = document.createElement('script');
      gtagConfigScript.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${ga4TrackingId}', {
          page_title: document.title,
          page_location: window.location.href
        });
      `;
      document.head.appendChild(gtagConfigScript);
      scripts.push(gtagConfigScript);
    }

    // Google Ads
    if (googleAdsId && ga4TrackingId) {
      const googleAdsScript = document.createElement('script');
      googleAdsScript.innerHTML = `
        gtag('config', '${googleAdsId}');
      `;
      document.head.appendChild(googleAdsScript);
      scripts.push(googleAdsScript);
    }

    // Meta Pixel
    if (metaPixelId) {
      const fbqScript = document.createElement('script');
      fbqScript.innerHTML = `
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window,document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${metaPixelId}');
        fbq('track', 'PageView');
      `;
      document.head.appendChild(fbqScript);
      scripts.push(fbqScript);

      // Add noscript fallback
      const fbqNoscript = document.createElement('noscript');
      fbqNoscript.innerHTML = `
        <img height="1" width="1" style="display:none"
        src="https://www.facebook.com/tr?id=${metaPixelId}&ev=PageView&noscript=1" />
      `;
      document.head.appendChild(fbqNoscript);
    }

    // LinkedIn Insight Tag
    if (linkedinPartnerId) {
      const linkedinScript = document.createElement('script');
      linkedinScript.innerHTML = `
        _linkedin_partner_id = "${linkedinPartnerId}";
        window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
        window._linkedin_data_partner_ids.push(_linkedin_partner_id);
      `;
      document.head.appendChild(linkedinScript);
      scripts.push(linkedinScript);

      const linkedinPixelScript = document.createElement('script');
      linkedinPixelScript.innerHTML = `
        (function(l) {
        if (!l){window.lintrk = function(a,b){window.lintrk.q.push([a,b])};
        window.lintrk.q=[]}
        var s = document.getElementsByTagName("script")[0];
        var b = document.createElement("script");
        b.type = "text/javascript";b.async = true;
        b.src = "https://snap.licdn.com/li.js";
        s.parentNode.insertBefore(b, s);})(window.lintrk);
      `;
      document.head.appendChild(linkedinPixelScript);
      scripts.push(linkedinPixelScript);
    }

    // Listen for consent changes to reload scripts if needed
    const handleConsentChange = (event: CustomEvent) => {
      if (event.detail.accepted) {
        // Reload the page to initialize tracking scripts with consent
        window.location.reload();
      }
    };

    window.addEventListener('consentChanged', handleConsentChange as EventListener);

    // Cleanup function - safer DOM manipulation
    return () => {
      window.removeEventListener('consentChanged', handleConsentChange as EventListener);
      
      // Use a more React-friendly cleanup approach
      scripts.forEach(script => {
        try {
          // Check if script still exists and has a parent before removing
          if (script && script.parentNode && document.contains(script)) {
            script.parentNode.removeChild(script);
          }
        } catch (error) {
          // Silently handle cleanup errors to prevent console noise
          if (process.env.NODE_ENV === 'development') {
            console.warn('Script cleanup warning:', error);
          }
        }
      });
    };
  }, [ga4TrackingId, googleAdsId, metaPixelId, linkedinPartnerId, trackingEnabled]);

  return null; // This component doesn't render anything
}

// Consent Banner Component with working buttons
export function ConsentBanner({ show = false }: { show?: boolean }) {
  const [isVisible, setIsVisible] = useState(true);
  const [isAccepting, setIsAccepting] = useState(false);

  // Hide banner if consent already given or shouldn't show
  if (!show || !shouldLoadTracking() || hasConsentChoice() || !isVisible) {
    return null;
  }

  const handleAcceptAll = async () => {
    setIsAccepting(true);
    
    // Set consent and hide banner
    setConsentStatus(true);
    
    // Small delay for UX feedback
    setTimeout(() => {
      setIsVisible(false);
      setIsAccepting(false);
    }, 200);
  };

  const handleManagePreferences = () => {
    // For now, just accept all - can be enhanced later for granular control
    handleAcceptAll();
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 shadow-lg z-50 transition-transform duration-300">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-sm text-muted-foreground">
          <p>
            We use cookies and tracking technologies to improve your experience. 
            By continuing to use our site, you consent to our use of cookies.
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50 transition-opacity"
            onClick={handleAcceptAll}
            disabled={isAccepting}
          >
            {isAccepting ? 'Accepting...' : 'Accept All'}
          </button>
          <button 
            className="px-4 py-2 text-sm border border-border rounded hover:bg-muted disabled:opacity-50 transition-colors"
            onClick={handleManagePreferences}
            disabled={isAccepting}
          >
            Manage Preferences
          </button>
        </div>
      </div>
    </div>
  );
}