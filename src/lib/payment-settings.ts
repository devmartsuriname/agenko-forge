import { supabase } from '@/integrations/supabase/client';
import { PaymentSettings, ProposalSettings, getPaymentSettings, getProposalSettings } from '@/types/settings';

// Cache for settings to avoid repeated database calls
let settingsCache: { payments?: PaymentSettings; proposals?: ProposalSettings } = {};
let lastFetch = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function fetchSettings(): Promise<{ payments: PaymentSettings; proposals: ProposalSettings }> {
  const now = Date.now();
  
  // Return cached settings if still valid
  if (lastFetch && (now - lastFetch) < CACHE_TTL && settingsCache.payments && settingsCache.proposals) {
    return { payments: settingsCache.payments, proposals: settingsCache.proposals };
  }

  try {
    const { data, error } = await supabase
      .from('app_config')
      .select('key, value')
      .in('key', ['payments', 'proposals']);

    if (error) throw error;

    const configMap = data?.reduce((acc, item) => {
      acc[item.key] = item.value;
      return acc;
    }, {} as Record<string, string>) || {};

    const payments = getPaymentSettings({ payments: configMap.payments });
    const proposals = getProposalSettings({ proposals: configMap.proposals });

    // Update cache
    settingsCache = { payments, proposals };
    lastFetch = now;

    return { payments, proposals };
  } catch (error) {
    console.error('Error fetching settings:', error);
    
    // Return defaults on error
    const payments = getPaymentSettings({});
    const proposals = getProposalSettings({});
    return { payments, proposals };
  }
}

export function clearSettingsCache() {
  settingsCache = {};
  lastFetch = 0;
}

export async function updatePaymentSettings(settings: PaymentSettings): Promise<void> {
  const { error } = await supabase
    .from('app_config')
    .upsert({
      key: 'payments',
      value: JSON.stringify(settings)
    });

  if (error) throw error;
  clearSettingsCache();
}

export async function updateProposalSettings(settings: ProposalSettings): Promise<void> {
  const { error } = await supabase
    .from('app_config')
    .upsert({
      key: 'proposals', 
      value: JSON.stringify(settings)
    });

  if (error) throw error;
  clearSettingsCache();
}