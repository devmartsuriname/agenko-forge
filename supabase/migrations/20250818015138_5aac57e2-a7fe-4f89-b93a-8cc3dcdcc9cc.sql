-- Check what extensions are in the public schema
SELECT extname, nspname as schema_name 
FROM pg_extension ext
JOIN pg_namespace nsp ON ext.extnamespace = nsp.oid
WHERE nspname = 'public';

-- Drop extensions from public schema if they exist there
DROP EXTENSION IF EXISTS pg_cron CASCADE;
DROP EXTENSION IF EXISTS pg_net CASCADE;

-- Recreate them in the extensions schema
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Schedule the storage orphan scan to run daily at 2:00 AM UTC
SELECT cron.schedule(
  'daily-storage-orphan-scan',
  '0 2 * * *', -- Daily at 2:00 AM UTC
  $$
  SELECT
    net.http_post(
        url:='https://dvgubqqjvmsepkilnkak.supabase.co/functions/v1/storage-orphan-scan',
        headers:='{"Content-Type": "application/json"}'::jsonb,
        body:='{"scheduled": true}'::jsonb
    ) as request_id;
  $$
);