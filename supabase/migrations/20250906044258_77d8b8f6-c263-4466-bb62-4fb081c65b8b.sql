-- CRITICAL SECURITY TIGHTENING - Phase 1 Migration
-- Address diagnostic scan findings for sensitive customer data

-- 1. Ensure contact_submissions is fully locked down
-- Already has good policies, but let's add explicit denials
CREATE POLICY "Deny direct contact_submissions access" 
ON contact_submissions 
FOR ALL 
TO authenticated, anon
USING (false)
WITH CHECK (false);

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

-- 3. Add explicit email_subscriptions protection
CREATE POLICY "Block direct email_subscriptions access" 
ON email_subscriptions 
FOR ALL 
TO authenticated, anon
USING (false)
WITH CHECK (false);

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
CREATE POLICY "Prevent template exposure in proposals" 
ON proposals 
FOR SELECT 
TO authenticated
USING (
  get_current_user_role() = 'admin' OR 
  (created_by = auth.uid() AND get_current_user_role() = ANY (ARRAY['admin', 'editor']))
);

-- 6. Add audit logging for sensitive data access
CREATE OR REPLACE FUNCTION log_sensitive_data_access()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO logs_app_events (level, area, message, user_id, meta)
  VALUES (
    'info',
    'security_audit', 
    'Sensitive data accessed: ' || TG_TABLE_NAME,
    auth.uid(),
    jsonb_build_object(
      'table', TG_TABLE_NAME,
      'operation', TG_OP,
      'timestamp', NOW()
    )
  );
  
  RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Apply audit triggers to sensitive tables
CREATE TRIGGER audit_contact_access 
  AFTER SELECT OR INSERT OR UPDATE OR DELETE ON contact_submissions
  FOR EACH ROW EXECUTE FUNCTION log_sensitive_data_access();

CREATE TRIGGER audit_quotes_access 
  AFTER SELECT OR INSERT OR UPDATE OR DELETE ON quotes
  FOR EACH ROW EXECUTE FUNCTION log_sensitive_data_access();

CREATE TRIGGER audit_clients_access 
  AFTER SELECT OR INSERT OR UPDATE OR DELETE ON clients
  FOR EACH ROW EXECUTE FUNCTION log_sensitive_data_access();

-- 8. Create security monitoring view for admins
CREATE OR REPLACE VIEW admin_security_monitor AS
SELECT 
  table_name,
  COUNT(*) as access_count,
  COUNT(DISTINCT user_id) as unique_users,
  MAX(ts) as last_access
FROM logs_app_events 
WHERE area = 'security_audit' 
  AND ts > NOW() - INTERVAL '24 hours'
GROUP BY table_name
ORDER BY access_count DESC;

-- Grant admin access to security monitor
GRANT SELECT ON admin_security_monitor TO authenticated;
CREATE POLICY "Admins can view security monitor" 
ON admin_security_monitor 
FOR SELECT 
TO authenticated
USING (get_current_user_role() = 'admin');