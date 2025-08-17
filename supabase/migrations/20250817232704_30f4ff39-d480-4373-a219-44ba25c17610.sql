-- Fix parameter defaults for logging functions
CREATE OR REPLACE FUNCTION public.log_app_event(
    p_level TEXT,
    p_area TEXT,
    p_message TEXT,
    p_route TEXT DEFAULT NULL,
    p_user_id UUID DEFAULT NULL,
    p_meta JSONB DEFAULT '{}'::jsonb
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
    INSERT INTO public.logs_app_events (level, area, route, user_id, message, meta)
    VALUES (
        p_level,
        p_area,
        COALESCE(p_route, ''),
        COALESCE(p_user_id, auth.uid()),
        public.redact_pii(p_message),
        p_meta
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.log_error(
    p_area TEXT,
    p_message TEXT,
    p_route TEXT DEFAULT NULL,
    p_user_id UUID DEFAULT NULL,
    p_error_code TEXT DEFAULT NULL,
    p_stack TEXT DEFAULT NULL,
    p_meta JSONB DEFAULT '{}'::jsonb
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
    INSERT INTO public.logs_errors (area, route, user_id, error_code, message, stack, meta)
    VALUES (
        p_area,
        COALESCE(p_route, ''),
        COALESCE(p_user_id, auth.uid()),
        p_error_code,
        public.redact_pii(p_message),
        public.redact_pii(p_stack),
        p_meta
    );
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.log_app_event TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_error TO authenticated;