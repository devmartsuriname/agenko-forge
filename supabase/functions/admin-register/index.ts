import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RegisterRequest {
  email: string;
  password: string;
  bootstrapCode: string;
}

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 5; // requests per window
const RATE_WINDOW = 60 * 1000; // 1 minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip) || { count: 0, resetTime: now + RATE_WINDOW };
  
  if (now > entry.resetTime) {
    // Reset window
    entry.count = 0;
    entry.resetTime = now + RATE_WINDOW;
  }
  
  if (entry.count >= RATE_LIMIT) {
    return false;
  }
  
  entry.count++;
  rateLimitMap.set(ip, entry);
  return true;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    // Rate limiting by IP
    const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    
    if (!checkRateLimit(clientIP)) {
      console.log(`Rate limit exceeded for IP: ${clientIP}`);
      return new Response(JSON.stringify({ error: 'Too many requests. Please try again later.' }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const bootstrapCode = Deno.env.get('BOOTSTRAP_CODE');

    if (!bootstrapCode) {
      console.error('BOOTSTRAP_CODE not configured');
      return new Response(JSON.stringify({ error: 'Registration not properly configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse request body
    const { email, password, bootstrapCode: providedCode }: RegisterRequest = await req.json();

    // Basic validation
    if (!email || !password || !providedCode) {
      return new Response(JSON.stringify({ error: 'Email, password, and bootstrap code are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate email domain
    if (!email.toLowerCase().endsWith('@devmart.sr')) {
      console.log(`Invalid domain for email: ${email}`);
      return new Response(JSON.stringify({ error: 'Only @devmart.sr email addresses are allowed' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Basic password validation
    if (password.length < 8) {
      return new Response(JSON.stringify({ error: 'Password must be at least 8 characters long' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create Supabase clients
    const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey);
    const supabaseService = createClient(supabaseUrl, supabaseServiceKey);

    // Check if registration is enabled
    const { data: isEnabled, error: enabledError } = await supabaseAnon.rpc('is_registration_enabled');
    
    if (enabledError) {
      console.error('Error checking registration status:', enabledError);
      return new Response(JSON.stringify({ error: 'Failed to check registration status' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!isEnabled) {
      console.log('Registration is disabled');
      return new Response(JSON.stringify({ error: 'Registration is currently disabled' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // First, set the bootstrap hash using service role (only if not exists)
    const { error: hashError } = await supabaseService
      .from('app_config')
      .select('key')
      .eq('key', 'bootstrap_hash')
      .single();

    // If bootstrap hash doesn't exist, create it
    if (hashError?.code === 'PGRST116') {
      console.log('Setting bootstrap hash...');
      const { error: setHashError } = await supabaseService
        .from('app_config')
        .insert({
          key: 'bootstrap_hash',
          value: `crypt('${bootstrapCode}', gen_salt('bf'))`
        });

      if (setHashError) {
        console.error('Error setting bootstrap hash:', setHashError);
        // Continue anyway, might be set already
      }
    }

    // Sign up the user
    console.log(`Attempting to register user: ${email}`);
    const { data: signUpData, error: signUpError } = await supabaseAnon.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${new URL(req.url).origin}/admin/login`,
        data: {
          email_confirm: true
        }
      }
    });

    if (signUpError) {
      console.error('Sign up error:', signUpError);
      return new Response(JSON.stringify({ error: signUpError.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!signUpData.user) {
      return new Response(JSON.stringify({ error: 'Failed to create user' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`User created successfully: ${signUpData.user.id}`);

    // Sign in the user to get authenticated session
    const { data: signInData, error: signInError } = await supabaseAnon.auth.signInWithPassword({
      email,
      password
    });

    if (signInError) {
      console.error('Auto sign-in error:', signInError);
      return new Response(JSON.stringify({ error: 'User created but auto-login failed. Please login manually.' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create authenticated client with the user's session
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${signInData.session.access_token}`
        }
      }
    });

    // Ensure profile exists (should be created by trigger, but double-check)
    const { error: profileError } = await supabaseAuth
      .from('profiles')
      .upsert({
        id: signUpData.user.id,
        email: email,
        role: 'viewer'
      });

    if (profileError) {
      console.error('Profile creation error:', profileError);
      // Continue anyway, profile might exist
    }

    // Call the bootstrap promotion function
    console.log('Attempting admin promotion...');
    const { data: promotionResult, error: promotionError } = await supabaseAuth.rpc('bootstrap_promote_admin', {
      p_code: providedCode
    });

    if (promotionError) {
      console.error('Promotion error:', promotionError);
      return new Response(JSON.stringify({ error: promotionError.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!promotionResult?.success) {
      console.error('Promotion failed:', promotionResult?.error);
      return new Response(JSON.stringify({ error: promotionResult?.error || 'Failed to promote to admin' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Admin promotion successful');

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Admin account created successfully',
      user: {
        id: signUpData.user.id,
        email: signUpData.user.email
      }
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});