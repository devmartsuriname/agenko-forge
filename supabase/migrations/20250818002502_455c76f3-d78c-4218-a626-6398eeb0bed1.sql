-- Enable pg_cron extension for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule daily log cleanup at 3:00 AM UTC
SELECT cron.schedule(
  'logs_cleanup_daily',
  '0 3 * * *',
  $$
    DELETE FROM logs_errors WHERE ts < now() - interval '30 days';
    DELETE FROM logs_app_events WHERE ts < now() - interval '30 days';
  $$
);