import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ContactSubmissionRequest {
  name: string;
  email: string;
  subject?: string;
  message: string;
  captchaToken?: string;
}

// Rate limiting storage (in production, use Redis or similar)
const rateLimitMap = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 5;
  
  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, []);
  }
  
  const requests = rateLimitMap.get(ip)!;
  
  // Remove old requests outside the window
  const validRequests = requests.filter(time => now - time < windowMs);
  rateLimitMap.set(ip, validRequests);
  
  if (validRequests.length >= maxRequests) {
    return true;
  }
  
  // Add current request
  validRequests.push(now);
  rateLimitMap.set(ip, validRequests);
  
  return false;
}

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validateInput(data: ContactSubmissionRequest): string | null {
  if (!data.name || data.name.trim().length < 2) {
    return 'Name must be at least 2 characters long';
  }
  
  if (!data.email || !validateEmail(data.email)) {
    return 'Please provide a valid email address';
  }
  
  if (!data.message || data.message.trim().length < 10) {
    return 'Message must be at least 10 characters long';
  }
  
  if (data.name.length > 100) {
    return 'Name is too long';
  }
  
  if (data.email.length > 255) {
    return 'Email is too long';
  }
  
  if (data.subject && data.subject.length > 200) {
    return 'Subject is too long';
  }
  
  if (data.message.length > 2000) {
    return 'Message is too long';
  }
  
  return null;
}

async function verifyCaptcha(token: string): Promise<boolean> {
  // CAPTCHA verification stub - implement actual verification here
  // For hCaptcha: POST to https://hcaptcha.com/siteverify
  // For reCAPTCHA: POST to https://www.google.com/recaptcha/api/siteverify
  console.log('CAPTCHA verification stub - token:', token);
  
  // For now, return true (stub implementation)
  // TODO: Implement actual CAPTCHA verification
  return true;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }

  try {
    // Get client IP
    const clientIP = req.headers.get('x-forwarded-for') || 
                    req.headers.get('x-real-ip') || 
                    'unknown';

    // Check rate limiting
    if (isRateLimited(clientIP)) {
      return new Response(
        JSON.stringify({ 
          error: 'Too many requests. Please try again in a minute.' 
        }),
        { 
          status: 429, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Parse and validate request body
    const body: ContactSubmissionRequest = await req.json();
    
    const validationError = validateInput(body);
    if (validationError) {
      return new Response(
        JSON.stringify({ error: validationError }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Verify CAPTCHA if provided
    if (body.captchaToken) {
      const isValidCaptcha = await verifyCaptcha(body.captchaToken);
      if (!isValidCaptcha) {
        return new Response(
          JSON.stringify({ error: 'CAPTCHA verification failed' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Insert contact submission
    const { error } = await supabase
      .from('contact_submissions')
      .insert({
        name: body.name.trim(),
        email: body.email.trim().toLowerCase(),
        subject: body.subject?.trim() || null,
        message: body.message.trim(),
        ip: clientIP,
      });

    if (error) {
      console.error('Database error:', error);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to submit contact form. Please try again.' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Contact form submitted successfully from IP:', clientIP);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Thank you for your message. We\'ll get back to you soon!' 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error: any) {
    console.error('Error in submit-contact function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'An unexpected error occurred. Please try again.' 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
};

serve(handler);