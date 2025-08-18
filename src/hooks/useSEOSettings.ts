import { useEffect, useState } from 'react';
import { adminCms } from '@/lib/admin-cms';

interface SEOSettings {
  gsc_verification_code?: string;
  seo_title_template?: string;
  seo_default_description?: string;
  seo_default_og_image?: string;
}

export function useSEOSettings() {
  const [settings, setSettings] = useState<SEOSettings>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await adminCms.getAllSettings();
      setSettings({
        gsc_verification_code: data.gsc_verification_code,
        seo_title_template: data.seo_title_template,
        seo_default_description: data.seo_default_description,
        seo_default_og_image: data.seo_default_og_image,
      });
    } catch (error) {
      // Fail silently for public pages
      console.error('Failed to load SEO settings:', error);
    } finally {
      setLoading(false);
    }
  };

  return { settings, loading };
}