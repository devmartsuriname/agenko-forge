-- Schedule daily log cleanup job
SELECT cron.schedule(
  'cleanup-logs-daily',
  '0 2 * * *', -- Every day at 2 AM
  $$SELECT public.cleanup_old_logs();$$
);