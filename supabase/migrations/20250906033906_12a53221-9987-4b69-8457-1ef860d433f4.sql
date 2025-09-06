-- Fix ambiguous column reference in get_cta_analytics function
CREATE OR REPLACE FUNCTION get_cta_analytics(days_back INTEGER DEFAULT 7)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    result JSONB;
    start_date TIMESTAMPTZ;
    total_interactions INTEGER;
    email_signups INTEGER;
    conversion_rate NUMERIC;
    top_cta_types JSONB;
    daily_interactions JSONB;
BEGIN
    start_date := NOW() - (days_back || ' days')::INTERVAL;
    
    -- Get total interactions
    SELECT COUNT(*)
    INTO total_interactions
    FROM cta_interactions
    WHERE created_at >= start_date;
    
    -- Get email signups
    SELECT COUNT(*)
    INTO email_signups
    FROM email_subscriptions
    WHERE created_at >= start_date;
    
    -- Calculate conversion rate
    conversion_rate := CASE 
        WHEN total_interactions > 0 THEN (email_signups::NUMERIC / total_interactions) * 100
        ELSE 0
    END;
    
    -- Get top CTA types
    SELECT COALESCE(jsonb_agg(
        jsonb_build_object('cta_type', cta_type, 'count', count)
        ORDER BY count DESC
    ), '[]'::jsonb)
    INTO top_cta_types
    FROM (
        SELECT cta_type, COUNT(*) as count
        FROM cta_interactions
        WHERE created_at >= start_date
        GROUP BY cta_type
        ORDER BY count DESC
        LIMIT 5
    ) top_ctas;
    
    -- Get daily interactions for the last 7 days (fixed ambiguous column reference)
    SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
            'date', to_char(days.day, 'Mon DD'),
            'interactions', COALESCE(ci.interactions, 0),
            'signups', COALESCE(es.signups, 0)
        )
        ORDER BY days.day
    ), '[]'::jsonb)
    INTO daily_interactions
    FROM (
        SELECT 
            generate_series(
                date_trunc('day', start_date),
                date_trunc('day', NOW()),
                '1 day'::interval
            )::date as day
    ) days
    LEFT JOIN (
        SELECT 
            created_at::date as interaction_day,
            COUNT(*) as interactions
        FROM cta_interactions
        WHERE created_at >= start_date
        GROUP BY created_at::date
    ) ci ON days.day = ci.interaction_day
    LEFT JOIN (
        SELECT 
            created_at::date as signup_day,
            COUNT(*) as signups
        FROM email_subscriptions
        WHERE created_at >= start_date
        GROUP BY created_at::date
    ) es ON days.day = es.signup_day;
    
    -- Build result
    result := jsonb_build_object(
        'total_interactions', total_interactions,
        'email_signups', email_signups,
        'conversion_rate', conversion_rate,
        'top_cta_types', top_cta_types,
        'daily_interactions', daily_interactions
    );
    
    RETURN result;
END;
$$;