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
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_pages_slug ON public.pages(slug);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_projects_slug ON public.projects(slug);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_services_slug ON public.services(slug);

-- Status and published_at indexes for efficient filtering and ordering
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_pages_status_published ON public.pages(status, published_at DESC) WHERE status = 'published';
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_blog_posts_status_published ON public.blog_posts(status, published_at DESC) WHERE status = 'published';
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_projects_status_published ON public.projects(status, published_at DESC) WHERE status = 'published';
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_services_status_published ON public.services(status, published_at DESC) WHERE status = 'published';

-- Foreign key indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_project_images_project_id ON public.project_images(project_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- 3. Observability Tables
CREATE TABLE IF NOT EXISTS public.logs_app_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ts TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    level TEXT NOT NULL CHECK (level IN ('debug', 'info', 'warn', 'error', 'critical')),
    area TEXT NOT NULL, -- e.g., 'auth', 'cms', 'contact', 'admin'
    route TEXT, -- e.g., '/', '/admin/pages', '/contact'
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
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_logs_app_events_ts ON public.logs_app_events(ts DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_logs_app_events_level_area ON public.logs_app_events(level, area);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_logs_errors_ts ON public.logs_errors(ts DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_logs_errors_area ON public.logs_errors(area);

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

-- 5. Homepage Preview Optimization RPC
CREATE OR REPLACE FUNCTION public.get_homepage_previews(
    p_blog_limit INT DEFAULT 3,
    p_project_limit INT DEFAULT 6,
    p_service_limit INT DEFAULT 3
)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
    blog_data JSONB;
    project_data JSONB;
    service_data JSONB;
BEGIN
    -- Get blog previews
    SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
            'id', id,
            'title', title,
            'excerpt', excerpt,
            'slug', slug,
            'published_at', published_at,
            'tags', tags
        ) ORDER BY published_at DESC
    ), '[]'::jsonb)
    INTO blog_data
    FROM (
        SELECT id, title, excerpt, slug, published_at, tags
        FROM public.blog_posts
        WHERE status = 'published'
        ORDER BY published_at DESC
        LIMIT p_blog_limit
    ) blog_subset;

    -- Get project previews with first image
    SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
            'id', p.id,
            'title', p.title,
            'excerpt', p.excerpt,
            'slug', p.slug,
            'published_at', p.published_at,
            'first_image', pi.url
        ) ORDER BY p.published_at DESC
    ), '[]'::jsonb)
    INTO project_data
    FROM (
        SELECT id, title, excerpt, slug, published_at
        FROM public.projects
        WHERE status = 'published'
        ORDER BY published_at DESC
        LIMIT p_project_limit
    ) p
    LEFT JOIN LATERAL (
        SELECT url 
        FROM public.project_images 
        WHERE project_id = p.id 
        ORDER BY sort_order ASC, created_at ASC 
        LIMIT 1
    ) pi ON true;

    -- Get service previews
    SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
            'id', id,
            'title', title,
            'excerpt', excerpt,
            'slug', slug,
            'published_at', published_at
        ) ORDER BY published_at DESC
    ), '[]'::jsonb)
    INTO service_data
    FROM (
        SELECT id, title, excerpt, slug, published_at
        FROM public.services
        WHERE status = 'published'
        ORDER BY published_at DESC
        LIMIT p_service_limit
    ) service_subset;

    -- Combine results
    result := jsonb_build_object(
        'blog_posts', blog_data,
        'projects', project_data,
        'services', service_data
    );

    RETURN result;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- 6. Rate Limiting for Public RPCs
CREATE OR REPLACE FUNCTION public.check_rate_limit(
    p_identifier TEXT,
    p_max_requests INT DEFAULT 10,
    p_window_minutes INT DEFAULT 1
)
RETURNS BOOLEAN AS $$
DECLARE
    request_count INT;
    window_start TIMESTAMPTZ;
BEGIN
    window_start := NOW() - (p_window_minutes || ' minutes')::INTERVAL;
    
    -- Count requests in the current window
    SELECT COUNT(*)
    INTO request_count
    FROM public.logs_app_events
    WHERE meta->>'rate_limit_key' = p_identifier
    AND ts > window_start;
    
    -- Log this request
    INSERT INTO public.logs_app_events (level, area, message, meta)
    VALUES ('info', 'rate_limit', 'Rate limit check', jsonb_build_object('rate_limit_key', p_identifier));
    
    RETURN request_count < p_max_requests;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Health Check RPC
CREATE OR REPLACE FUNCTION public.health_check()
RETURNS JSONB AS $$
DECLARE
    db_status TEXT := 'ok';
    table_counts JSONB;
BEGIN
    -- Get basic table counts
    SELECT jsonb_build_object(
        'pages', (SELECT COUNT(*) FROM public.pages WHERE status = 'published'),
        'blog_posts', (SELECT COUNT(*) FROM public.blog_posts WHERE status = 'published'),
        'projects', (SELECT COUNT(*) FROM public.projects WHERE status = 'published'),
        'services', (SELECT COUNT(*) FROM public.services WHERE status = 'published'),
        'profiles', (SELECT COUNT(*) FROM public.profiles)
    ) INTO table_counts;
    
    RETURN jsonb_build_object(
        'status', db_status,
        'timestamp', NOW(),
        'database', 'connected',
        'counts', table_counts
    );
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'status', 'error',
        'timestamp', NOW(),
        'database', 'error',
        'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Log Retention Cleanup Function
CREATE OR REPLACE FUNCTION public.cleanup_old_logs()
RETURNS VOID AS $$
DECLARE
    deleted_events INT;
    deleted_errors INT;
BEGIN
    -- Delete old app events (30 days)
    DELETE FROM public.logs_app_events 
    WHERE ts < NOW() - INTERVAL '30 days';
    GET DIAGNOSTICS deleted_events = ROW_COUNT;
    
    -- Delete old error logs (30 days)
    DELETE FROM public.logs_errors 
    WHERE ts < NOW() - INTERVAL '30 days';
    GET DIAGNOSTICS deleted_errors = ROW_COUNT;
    
    -- Log the cleanup
    INSERT INTO public.logs_app_events (level, area, message, meta)
    VALUES ('info', 'maintenance', 'Log cleanup completed', 
            jsonb_build_object('deleted_events', deleted_events, 'deleted_errors', deleted_errors));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. PII Redaction Helper Function
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

-- 10. Enable RLS on settings table if not already enabled
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;