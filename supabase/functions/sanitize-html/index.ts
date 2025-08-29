import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SanitizeRequest {
  html: string;
}

// Simple HTML sanitizer - allows only safe tags and attributes
const sanitizeHTML = (html: string): { sanitized: string; modified: boolean } => {
  if (!html) return { sanitized: '', modified: false };

  const originalHtml = html;
  
  // Allowed tags with their allowed attributes
  const allowedTags: Record<string, string[]> = {
    'p': ['class', 'style'],
    'h1': ['class', 'style'], 'h2': ['class', 'style'], 'h3': ['class', 'style'],
    'h4': ['class', 'style'], 'h5': ['class', 'style'], 'h6': ['class', 'style'],
    'strong': ['class'], 'em': ['class'], 'u': ['class'],
    'ul': ['class'], 'ol': ['class'], 'li': ['class'],
    'a': ['href', 'target', 'rel', 'class'],
    'img': ['src', 'alt', 'width', 'height', 'style', 'class'],
    'hr': ['class'],
    'blockquote': ['class', 'style'],
    'code': ['class'], 'pre': ['class'],
    'br': [], 'div': ['class', 'style'], 'span': ['class', 'style']
  };

  // Remove script tags and event handlers
  let sanitized = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^>]*>/gi, '')
    .replace(/\s*on\w+="[^"]*"/gi, '')
    .replace(/\s*on\w+='[^']*'/gi, '')
    .replace(/javascript:/gi, '');

  // Process each tag
  Object.keys(allowedTags).forEach(tag => {
    const allowedAttrs = allowedTags[tag];
    const regex = new RegExp(`<${tag}([^>]*)>`, 'gi');
    
    sanitized = sanitized.replace(regex, (match, attrs) => {
      if (!attrs) return `<${tag}>`;
      
      // Extract and filter attributes
      const attrRegex = /(\w+)=["']([^"']*)["']/g;
      const cleanAttrs: string[] = [];
      let attrMatch;
      
      while ((attrMatch = attrRegex.exec(attrs)) !== null) {
        const [, attrName, attrValue] = attrMatch;
        if (allowedAttrs.includes(attrName)) {
          // Additional validation for specific attributes
          if (attrName === 'href' && attrValue.toLowerCase().includes('javascript:')) {
            continue; // Skip malicious links
          }
          cleanAttrs.push(`${attrName}="${attrValue}"`);
        }
      }
      
      return cleanAttrs.length > 0 ? `<${tag} ${cleanAttrs.join(' ')}>` : `<${tag}>`;
    });
  });

  // Remove any remaining disallowed tags
  const allowedTagsList = Object.keys(allowedTags).join('|');
  const disallowedTagRegex = new RegExp(`<(?!\\/?(${allowedTagsList})\\b)[^>]+>`, 'gi');
  sanitized = sanitized.replace(disallowedTagRegex, '');

  // Preserve tokens like {{client_name}}
  const tokens = html.match(/\{\{[^}]+\}\}/g) || [];
  tokens.forEach(token => {
    if (!sanitized.includes(token)) {
      // Re-add any removed tokens
      sanitized = sanitized.replace(new RegExp(token.replace(/[{}]/g, '\\$&'), 'g'), token);
    }
  });

  return {
    sanitized: sanitized.trim(),
    modified: originalHtml !== sanitized
  };
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authorization' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check user role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['admin', 'editor'].includes(profile.role)) {
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { html }: SanitizeRequest = await req.json();

    if (!html) {
      return new Response(
        JSON.stringify({ error: 'HTML content required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const result = sanitizeHTML(html);

    // Log sanitization event
    if (result.modified) {
      await supabase.rpc('log_app_event', {
        p_level: 'info',
        p_area: 'proposals-templates',
        p_message: 'HTML content sanitized',
        p_meta: {
          user_id: user.id,
          original_length: html.length,
          sanitized_length: result.sanitized.length,
          was_modified: result.modified
        }
      });
    }

    return new Response(
      JSON.stringify({
        sanitized: result.sanitized,
        modified: result.modified,
        message: result.modified ? 'HTML was sanitized for security' : 'HTML is clean'
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error: any) {
    console.error('Error in sanitize-html function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
};

serve(handler);