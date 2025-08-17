-- Phase 5B.1: Blog Seed Boost to 6 + Counts Update

-- Add 4 additional published blog posts (idempotent)
INSERT INTO blog_posts (
    slug, 
    title, 
    excerpt, 
    body, 
    tags, 
    status, 
    published_at
) VALUES 
(
    'ux-that-converts',
    'UX That Converts',
    'Design moves that drive action.',
    '{"blocks": [{"type": "p", "text": "Practical patterns for conversion without dark patterns. Learn how to create user experiences that guide users naturally toward desired actions while maintaining trust and transparency."}]}'::jsonb,
    ARRAY['ux', 'conversion'],
    'published',
    now()
),
(
    'ship-faster-with-guardrails',
    'Ship Faster With Guardrails',
    'Speed + safety via checklists and RLS.',
    '{"blocks": [{"type": "p", "text": "Guardrails let you move fast while staying safe. Discover how proper processes, automated checks, and row-level security can accelerate development without compromising quality."}]}'::jsonb,
    ARRAY['process', 'quality'],
    'published',
    now()
),
(
    'seo-primer-for-founders',
    'SEO Primer for Founders',
    'What actually matters early.',
    '{"blocks": [{"type": "p", "text": "Focus on IA, content depth, and performance budgets. A practical guide to SEO fundamentals that drive organic growth from day one."}]}'::jsonb,
    ARRAY['seo', 'content'],
    'published',
    now()
),
(
    'analytics-that-matter',
    'Analytics That Matter',
    'Signals, not noise.',
    '{"blocks": [{"type": "p", "text": "Define events that map to business outcomes. Learn to implement analytics that provide actionable insights rather than vanity metrics."}]}'::jsonb,
    ARRAY['analytics', 'growth'],
    'published',
    now()
)
ON CONFLICT (slug) DO NOTHING;

-- Update homepage sections to ensure both carousels show 6 items
UPDATE pages 
SET body = jsonb_set(
    jsonb_set(
        COALESCE(body, '{}'::jsonb),
        '{sections}',
        COALESCE(body->'sections', '[]'::jsonb)
    ),
    '{sections}',
    (
        SELECT jsonb_agg(
            CASE 
                WHEN section->>'type' = 'blogPreview' THEN 
                    jsonb_set(section, '{data,limit}', '6'::jsonb)
                WHEN section->>'type' = 'portfolioPreview' THEN 
                    jsonb_set(section, '{data,limit}', '6'::jsonb)
                ELSE section
            END
        )
        FROM jsonb_array_elements(COALESCE(body->'sections', '[]'::jsonb)) as section
    )
)
WHERE slug = 'home' AND status = 'published';

-- Verification
DO $$
DECLARE
    blog_count int;
    project_count int;
    homepage_sections jsonb;
BEGIN
    -- Check blog count
    SELECT COUNT(*) INTO blog_count 
    FROM blog_posts 
    WHERE status = 'published';
    
    -- Check project count  
    SELECT COUNT(*) INTO project_count 
    FROM projects 
    WHERE status = 'published';
    
    -- Check homepage sections
    SELECT body->'sections' INTO homepage_sections
    FROM pages 
    WHERE slug = 'home' AND status = 'published';
    
    RAISE NOTICE 'Published blog posts: %', blog_count;
    RAISE NOTICE 'Published projects: %', project_count;
    RAISE NOTICE 'Homepage sections updated: %', (homepage_sections IS NOT NULL);
    
    IF blog_count >= 6 AND project_count >= 6 THEN
        RAISE NOTICE '✅ SUCCESS: Both carousels have sufficient content (≥6 items each)';
    ELSE
        RAISE WARNING '❌ WARNING: Insufficient content for carousels!';
    END IF;
END $$;