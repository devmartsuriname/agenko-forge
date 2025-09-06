-- Security Enhancement Migration: Tighten RLS Policies for Data Protection
-- Addressing security scanner warnings about potential data exposure

-- 1. Fix contact_submissions - Add service role INSERT policy for contact forms
-- This allows the contact form edge function to insert submissions while keeping admin-only viewing
CREATE POLICY "Service role can insert contact submissions"
ON public.contact_submissions
FOR INSERT
WITH CHECK (auth.role() = 'service_role');

-- 2. Tighten clients table - Editors should only manage their own clients, not all clients
-- Drop the overly permissive policy and replace with more restrictive ones
DROP POLICY IF EXISTS "editors_manage_clients" ON public.clients;

-- Create more restrictive policies for clients
CREATE POLICY "Editors can create clients"
ON public.clients
FOR INSERT
WITH CHECK (
  get_current_user_role() = ANY(ARRAY['admin', 'editor']) 
  AND created_by = auth.uid()
);

CREATE POLICY "Editors can view their own clients"
ON public.clients
FOR SELECT
USING (
  get_current_user_role() = 'admin' 
  OR (get_current_user_role() = 'editor' AND created_by = auth.uid())
);

CREATE POLICY "Editors can update their own clients"
ON public.clients
FOR UPDATE
USING (
  get_current_user_role() = 'admin' 
  OR (get_current_user_role() = 'editor' AND created_by = auth.uid())
);

CREATE POLICY "Only admins can delete clients"
ON public.clients
FOR DELETE
USING (get_current_user_role() = 'admin');

-- 3. Add DELETE policy for email_subscriptions (GDPR compliance)
CREATE POLICY "Service role can delete email subscriptions"
ON public.email_subscriptions
FOR DELETE
USING (auth.role() = 'service_role');

-- 4. Enhance quotes table security - Add explicit DELETE restriction
CREATE POLICY "Only admins can delete quotes"
ON public.quotes
FOR DELETE
USING (get_current_user_role() = 'admin');

-- 5. Add audit logging function for sensitive operations
CREATE OR REPLACE FUNCTION public.log_sensitive_access(
  table_name TEXT,
  operation TEXT,
  record_id UUID DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.logs_app_events (level, area, message, user_id, meta)
  VALUES (
    'info',
    'security_audit',
    format('Sensitive data access: %s %s', operation, table_name),
    auth.uid(),
    jsonb_build_object(
      'table', table_name,
      'operation', operation,
      'record_id', record_id,
      'timestamp', NOW(),
      'user_role', get_current_user_role()
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 6. Create security monitoring trigger for sensitive tables
CREATE OR REPLACE FUNCTION public.audit_sensitive_access()
RETURNS TRIGGER AS $$
BEGIN
  -- Log access to sensitive customer data
  PERFORM public.log_sensitive_access(TG_TABLE_NAME, TG_OP, 
    CASE 
      WHEN TG_OP = 'DELETE' THEN OLD.id
      ELSE NEW.id
    END
  );
  
  RETURN CASE 
    WHEN TG_OP = 'DELETE' THEN OLD
    ELSE NEW
  END;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- 7. Apply audit triggers to sensitive tables
DROP TRIGGER IF EXISTS audit_contact_submissions ON public.contact_submissions;
CREATE TRIGGER audit_contact_submissions
  AFTER INSERT OR UPDATE OR DELETE ON public.contact_submissions
  FOR EACH ROW EXECUTE FUNCTION public.audit_sensitive_access();

DROP TRIGGER IF EXISTS audit_clients ON public.clients;
CREATE TRIGGER audit_clients
  AFTER INSERT OR UPDATE OR DELETE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.audit_sensitive_access();

DROP TRIGGER IF EXISTS audit_quotes ON public.quotes;
CREATE TRIGGER audit_quotes
  AFTER INSERT OR UPDATE OR DELETE ON public.quotes
  FOR EACH ROW EXECUTE FUNCTION public.audit_sensitive_access();

DROP TRIGGER IF EXISTS audit_email_subscriptions ON public.email_subscriptions;
CREATE TRIGGER audit_email_subscriptions
  AFTER INSERT OR UPDATE OR DELETE ON public.email_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.audit_sensitive_access();

-- 8. Create data retention policy function
CREATE OR REPLACE FUNCTION public.cleanup_old_sensitive_data()
RETURNS VOID AS $$
BEGIN
  -- Clean up old contact submissions (keep for 2 years for business records)
  DELETE FROM public.contact_submissions 
  WHERE created_at < NOW() - INTERVAL '2 years';
  
  -- Clean up old email subscriptions that were unsubscribed (keep for 30 days for compliance)
  DELETE FROM public.email_subscriptions 
  WHERE unsubscribed_at IS NOT NULL 
    AND unsubscribed_at < NOW() - INTERVAL '30 days';
  
  -- Clean up old proposal events (keep for 1 year)
  DELETE FROM public.proposal_events 
  WHERE created_at < NOW() - INTERVAL '1 year';
  
  -- Clean up old CTA interactions (keep for 6 months for analytics)
  DELETE FROM public.cta_interactions 
  WHERE created_at < NOW() - INTERVAL '6 months';
  
  -- Log cleanup
  INSERT INTO public.logs_app_events (level, area, message, meta)
  VALUES (
    'info', 
    'data_retention', 
    'Automated cleanup of old sensitive data completed',
    jsonb_build_object('timestamp', NOW())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 9. Add email validation function for better data integrity
CREATE OR REPLACE FUNCTION public.is_valid_email(email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- Basic email validation pattern
  RETURN email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 10. Add check constraints for data validation
ALTER TABLE public.contact_submissions 
ADD CONSTRAINT valid_email_format 
CHECK (is_valid_email(email));

ALTER TABLE public.quotes 
ADD CONSTRAINT valid_email_format 
CHECK (is_valid_email(email));

ALTER TABLE public.clients 
ADD CONSTRAINT valid_email_format 
CHECK (is_valid_email(email));

ALTER TABLE public.email_subscriptions 
ADD CONSTRAINT valid_email_format 
CHECK (is_valid_email(email));

-- 11. Create function to mask sensitive data for logs
CREATE OR REPLACE FUNCTION public.mask_sensitive_data(data JSONB)
RETURNS JSONB AS $$
BEGIN
  -- Remove or mask sensitive fields from logging
  RETURN jsonb_build_object(
    'table_accessed', data->>'table',
    'operation', data->>'operation',
    'timestamp', data->>'timestamp',
    'user_role', data->>'user_role'
    -- Explicitly exclude record_id and other sensitive data
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE SECURITY DEFINER SET search_path = public;