-- Drop the existing cron job first
SELECT cron.unschedule('daily-storage-orphan-scan');

-- Enable extensions in the extensions schema (proper location)
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