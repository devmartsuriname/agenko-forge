-- Phase 5A: Backend Final Polish - RLS, Indexing, Error Sampling & Retention

-- 1. RLS Safeguards: Prevent last admin demotion
CREATE OR REPLACE FUNCTION public.prevent_last_admin_demotion()
RETURNS TRIGGER AS $$
DECLARE
    admin_count INT;
BEGIN
    -- Only check if role is being changed from admin
    IF OLD.role = 'admin' AND NEW.role != 'admin' THEN
        SELECT COUNT(*) INTO admin_count 
        FROM public.profiles 
        WHERE role = 'admin' AND id != NEW.id;
        
        IF admin_count = 0 THEN
            RAISE EXCEPTION 'Cannot demote the last admin. At least one admin must remain.';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to prevent last admin demotion
CREATE TRIGGER prevent_last_admin_demotion_trigger
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.prevent_last_admin_demotion();

-- 2. Performance Indexes
-- Slug indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_pages_slug ON public.pages(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_projects_slug ON public.projects(slug);
CREATE INDEX IF NOT EXISTS idx_services_slug ON public.services(slug);

-- Status and published_at indexes for efficient filtering and ordering
CREATE INDEX IF NOT EXISTS idx_pages_status_published ON public.pages(status, published_at DESC) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_blog_posts_status_published ON public.blog_posts(status, published_at DESC) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_projects_status_published ON public.projects(status, published_at DESC) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_services_status_published ON public.services(status, published_at DESC) WHERE status = 'published';

-- Foreign key indexes
CREATE INDEX IF NOT EXISTS idx_project_images_project_id ON public.project_images(project_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- 3. Observability Tables
CREATE TABLE IF NOT EXISTS public.logs_app_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ts TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    level TEXT NOT NULL CHECK (level IN ('debug', 'info', 'warn', 'error', 'critical')),
    area TEXT NOT NULL,
    route TEXT,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    message TEXT NOT NULL,
    meta JSONB DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS public.logs_errors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ts TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    area TEXT NOT NULL,
    route TEXT,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    error_code TEXT,
    message TEXT NOT NULL,
    stack TEXT,
    meta JSONB DEFAULT '{}'::jsonb
);

-- Indexes for log tables
CREATE INDEX IF NOT EXISTS idx_logs_app_events_ts ON public.logs_app_events(ts DESC);
CREATE INDEX IF NOT EXISTS idx_logs_app_events_level_area ON public.logs_app_events(level, area);
CREATE INDEX IF NOT EXISTS idx_logs_errors_ts ON public.logs_errors(ts DESC);
CREATE INDEX IF NOT EXISTS idx_logs_errors_area ON public.logs_errors(area);

-- 4. RLS Policies for Log Tables (Server-only inserts)
ALTER TABLE public.logs_app_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logs_errors ENABLE ROW LEVEL SECURITY;

-- Only service role can insert logs (no client inserts)
CREATE POLICY "Service role can insert app events" ON public.logs_app_events
    FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role can insert errors" ON public.logs_errors
    FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- Admins can view logs
CREATE POLICY "Admins can view app events" ON public.logs_app_events
    FOR SELECT USING (get_current_user_role() = 'admin');

CREATE POLICY "Admins can view errors" ON public.logs_errors
    FOR SELECT USING (get_current_user_role() = 'admin');

-- 5. PII Redaction Helper Function
CREATE OR REPLACE FUNCTION public.redact_pii(input_text TEXT)
RETURNS TEXT AS $$
BEGIN
    IF input_text IS NULL THEN
        RETURN NULL;
    END IF;
    
    -- Redact email patterns
    input_text := regexp_replace(input_text, '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', '[EMAIL_REDACTED]', 'g');
    
    -- Redact phone number patterns
    input_text := regexp_replace(input_text, '(\+?1?[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}', '[PHONE_REDACTED]', 'g');
    
    -- Redact potential tokens (long alphanumeric strings)
    input_text := regexp_replace(input_text, '\b[A-Za-z0-9]{32,}\b', '[TOKEN_REDACTED]', 'g');
    
    RETURN input_text;
END;
$$ LANGUAGE plpgsql IMMUTABLE;