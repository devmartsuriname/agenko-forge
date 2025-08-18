import { useEffect, useState } from 'react';
import { TrackingScripts, ConsentBanner } from '@/components/TrackingScripts';
import { adminCms } from '@/lib/admin-cms';

interface IntegrationSettings {
  ga4_tracking_id?: string;
  google_ads_id?: string;
  meta_pixel_id?: string;
  linkedin_partner_id?: string;
  gsc_verification_code?: string;
  tracking_enabled?: boolean;
  show_consent_banner?: boolean;
}

export function GlobalIntegrations() {
  const [settings, setSettings] = useState<IntegrationSettings>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await adminCms.getAllSettings();
      setSettings({
        ga4_tracking_id: data.ga4_tracking_id,
        google_ads_id: data.google_ads_id,
        meta_pixel_id: data.meta_pixel_id,
        linkedin_partner_id: data.linkedin_partner_id,
        gsc_verification_code: data.gsc_verification_code,
        tracking_enabled: data.tracking_enabled !== false,
        show_consent_banner: data.show_consent_banner !== false,
      });
    } catch (error) {
      console.error('Failed to load integration settings:', error);
      // Fail silently in production
    } finally {
      setLoading(false);
    }
  };

  if (loading) return null;

  return (
    <>
      <TrackingScripts
        ga4TrackingId={settings.ga4_tracking_id}
        googleAdsId={settings.google_ads_id}
        metaPixelId={settings.meta_pixel_id}
        linkedinPartnerId={settings.linkedin_partner_id}
        trackingEnabled={settings.tracking_enabled}
      />
      <ConsentBanner show={settings.show_consent_banner} />
    </>
  );
}