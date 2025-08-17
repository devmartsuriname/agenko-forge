-- Add remaining functions for Phase 5A

-- Homepage Preview Optimization RPC
CREATE OR REPLACE FUNCTION public.get_homepage_previews(
    p_blog_limit INT DEFAULT 3,
    p_project_limit INT DEFAULT 6,
    p_service_limit INT DEFAULT 3
)
RETURNS JSONB 
LANGUAGE plpgsql 
STABLE 
SECURITY DEFINER
SET search_path = 'public'
AS $$
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
$$;

-- Rate Limiting for Public RPCs
CREATE OR REPLACE FUNCTION public.check_rate_limit(
    p_identifier TEXT,
    p_max_requests INT DEFAULT 10,
    p_window_minutes INT DEFAULT 1
)
RETURNS BOOLEAN 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = 'public'
AS $$
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
$$;

-- Health Check RPC
CREATE OR REPLACE FUNCTION public.health_check()
RETURNS JSONB 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = 'public'
AS $$
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
$$;

-- Log Retention Cleanup Function
CREATE OR REPLACE FUNCTION public.cleanup_old_logs()
RETURNS VOID 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = 'public'
AS $$
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
$$;