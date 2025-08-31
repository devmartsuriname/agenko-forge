import { useEffect, useState } from 'react';
import { adminCms } from '@/lib/admin-cms';

interface ContactSettings {
  site_title?: string;
  site_description?: string;
  contact_email?: string;
  contact_phone?: string;
  contact_address?: string;
  business_hours?: string;
  footer_legal_text?: string;
  facebook_url?: string;
  linkedin_url?: string;
  twitter_url?: string;
  instagram_url?: string;
}

export function useContactSettings() {
  const [settings, setSettings] = useState<ContactSettings>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await adminCms.getAllSettings();
      setSettings({
        site_title: data.site_title || 'Devmart',
        site_description: data.site_description || 'Digital agency delivering innovative web development and marketing solutions.',
        contact_email: data.contact_email || 'info@devmart.sr',
        contact_phone: data.contact_phone || '+555-759-9854',
        contact_address: data.contact_address || '6801 Hollywood Blvd\nLos Angeles, CA 90028',
        business_hours: data.business_hours || 'Mon - Fri: 9:00 AM - 6:00 PM PST',
        footer_legal_text: data.footer_legal_text || '© 2025 Devmart - All Rights Reserved.',
        facebook_url: data.facebook_url,
        linkedin_url: data.linkedin_url,
        twitter_url: data.twitter_url,
        instagram_url: data.instagram_url,
      });
    } catch (error) {
      // Fail silently for public pages and use defaults
      console.error('Failed to load contact settings:', error);
      setSettings({
      site_title: 'Devmart',
      site_description: 'Digital agency delivering innovative web development and marketing solutions.',
      contact_email: 'info@devmart.sr',
        contact_phone: '+555-759-9854',
        contact_address: '6801 Hollywood Blvd\nLos Angeles, CA 90028',
        business_hours: 'Mon - Fri: 9:00 AM - 6:00 PM PST',
        footer_legal_text: '© 2025 Devmart - All Rights Reserved.',
      });
    } finally {
      setLoading(false);
    }
  };

  return { settings, loading };
}