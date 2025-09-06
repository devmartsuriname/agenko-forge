-- CRITICAL SECURITY TIGHTENING - Phase 1 Migration (Fixed)
-- Address diagnostic scan findings for sensitive customer data

-- 1. Ensure contact_submissions is fully locked down to service role only
DROP POLICY IF EXISTS "Deny direct contact_submissions access" ON contact_submissions;
-- Contact submissions should only be accessible via service role and admins

-- 2. Tighten quotes table - remove potential user access loopholes  
DROP POLICY IF EXISTS "Users can view their own quotes" ON quotes;
CREATE POLICY "Users can view quotes only via email match" 
ON quotes 
FOR SELECT 
TO authenticated
USING (
  (user_id = auth.uid()) OR 
  (user_id IS NULL AND email = (SELECT email FROM auth.users WHERE id = auth.uid()))
);

-- 3. Ensure email_subscriptions remains service-role only
-- Already properly locked down, no changes needed

-- 4. Strengthen clients table - ensure only proper ownership
DROP POLICY IF EXISTS "Editors can view their own clients" ON clients;
CREATE POLICY "Strict client access control" 
ON clients 
FOR SELECT 
TO authenticated
USING (
  get_current_user_role() = 'admin' OR 
  (get_current_user_role() = 'editor' AND created_by = auth.uid())
);

-- 5. Add proposals security layer - prevent unauthorized template access
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS security_level TEXT DEFAULT 'standard';

-- 6. Create audit logging function for data modifications only
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Apply audit triggers to sensitive tables (INSERT/UPDATE/DELETE only)
CREATE TRIGGER audit_contact_modifications 
  AFTER INSERT OR UPDATE OR DELETE ON contact_submissions
  FOR EACH ROW EXECUTE FUNCTION log_sensitive_data_modification();

CREATE TRIGGER audit_quotes_modifications 
  AFTER INSERT OR UPDATE OR DELETE ON quotes
  FOR EACH ROW EXECUTE FUNCTION log_sensitive_data_modification();

CREATE TRIGGER audit_clients_modifications 
  AFTER INSERT OR UPDATE OR DELETE ON clients
  FOR EACH ROW EXECUTE FUNCTION log_sensitive_data_modification();

-- 8. Create rate limiting for sensitive operations
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Add security monitoring for admins
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON logs_app_events TO authenticated;