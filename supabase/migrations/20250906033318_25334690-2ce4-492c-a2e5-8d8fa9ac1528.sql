-- Create database function for optimized CTA analytics
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
    
    -- Get daily interactions for the last 7 days
    SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
            'date', to_char(day, 'Mon DD'),
            'interactions', COALESCE(interactions, 0),
            'signups', COALESCE(signups, 0)
        )
        ORDER BY day
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
            created_at::date as day,
            COUNT(*) as interactions
        FROM cta_interactions
        WHERE created_at >= start_date
        GROUP BY created_at::date
    ) ci ON days.day = ci.day
    LEFT JOIN (
        SELECT 
            created_at::date as day,
            COUNT(*) as signups
        FROM email_subscriptions
        WHERE created_at >= start_date
        GROUP BY created_at::date
    ) es ON days.day = es.day;
    
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

-- Add indexes for better performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cta_interactions_created_at 
ON cta_interactions (created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cta_interactions_cta_type 
ON cta_interactions (cta_type);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_email_subscriptions_created_at 
ON email_subscriptions (created_at DESC);