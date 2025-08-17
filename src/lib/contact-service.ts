import { supabase } from '@/integrations/supabase/client';
import { logger, LogArea } from '@/lib/observability';

export async function submitContactForm(data: {
  name: string;
  email: string;
  subject?: string;
  message: string;
}) {
  try {
    // Check rate limit first
    const ip = await fetch('https://api.ipify.org?format=json')
      .then(r => r.json())
      .then(d => d.ip)
      .catch(() => 'unknown');

    const rateLimitKey = `contact-form:${ip}`;
    
    const { data: rateLimitOk, error: rateLimitError } = await supabase.rpc('check_rate_limit', {
      p_identifier: rateLimitKey,
      p_max_requests: 5,
      p_window_minutes: 15
    });

    if (rateLimitError || !rateLimitOk) {
      await logger.warn(LogArea.CONTACT, 'Rate limit exceeded for contact form', {
        ip,
        email: data.email
      });
      throw new Error('Too many requests. Please try again later.');
    }

    // Submit contact form
    const { error } = await supabase.functions.invoke('submit-contact', {
      body: { ...data, ip }
    });

    if (error) {
      await logger.error(LogArea.CONTACT, 'Contact form submission failed', error, {
        email: data.email,
        subject: data.subject
      });
      throw error;
    }

    await logger.info(LogArea.CONTACT, 'Contact form submitted successfully', {
      email: data.email,
      subject: data.subject
    });

    return { success: true };
  } catch (error) {
    await logger.error(LogArea.CONTACT, 'Contact form error', error as Error);
    throw error;
  }
}