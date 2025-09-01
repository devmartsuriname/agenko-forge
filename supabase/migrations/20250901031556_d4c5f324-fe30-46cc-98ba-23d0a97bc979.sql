-- Update the RLS policy to allow public access to all contact and social media fields
DROP POLICY IF EXISTS "Public can view safe settings" ON public.settings;

CREATE POLICY "Public can view safe settings" ON public.settings
FOR SELECT 
USING (key = ANY (ARRAY[
  'site_title'::text, 
  'contact_email'::text, 
  'company_name'::text,
  'contact_phone'::text,
  'contact_address'::text,
  'business_hours'::text,
  'footer_legal_text'::text,
  'facebook_url'::text,
  'linkedin_url'::text,
  'twitter_url'::text,
  'instagram_url'::text
]));

-- Add the missing business_hours setting if it doesn't exist
INSERT INTO public.settings (key, value) 
VALUES ('business_hours', '"Mon - Fri: 9:00 AM - 6:00 PM PST"'::jsonb)
ON CONFLICT (key) DO NOTHING;