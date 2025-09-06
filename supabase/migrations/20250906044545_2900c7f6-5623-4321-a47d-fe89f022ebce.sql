-- SECURITY FIX: Function Search Path Security
-- Addresses WARN issues from security linter

-- Fix log_sensitive_data_modification function
CREATE OR REPLACE FUNCTION log_sensitive_data_modification()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO logs_app_events (level, area, message, user_id, meta)
  VALUES (
    'info',
    'security_audit', 
    'Sensitive data modified: ' || TG_TABLE_NAME,
    auth.uid(),
    jsonb_build_object(
      'table', TG_TABLE_NAME,
      'operation', TG_OP,
      'timestamp', NOW(),
      'record_id', CASE 
        WHEN TG_OP = 'DELETE' THEN OLD.id::text
        ELSE NEW.id::text
      END
    )
  );
  
  RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

-- Fix check_sensitive_rate_limit function  
CREATE OR REPLACE FUNCTION check_sensitive_rate_limit(operation_type TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  recent_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO recent_count
  FROM logs_app_events
  WHERE user_id = auth.uid()
    AND area = 'security_audit'
    AND message LIKE '%' || operation_type || '%'
    AND ts > NOW() - INTERVAL '1 hour';
    
  RETURN recent_count < 50; -- Max 50 operations per hour
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';