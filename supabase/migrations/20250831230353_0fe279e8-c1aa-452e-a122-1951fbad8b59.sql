-- Update site_title from Agenko to Devmart to complete brand transformation
UPDATE public.settings 
SET value = '"Devmart"'::jsonb
WHERE key = 'site_title';