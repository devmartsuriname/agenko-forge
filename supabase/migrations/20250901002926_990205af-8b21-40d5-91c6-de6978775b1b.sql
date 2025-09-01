-- Create proper seed data with manual insertion to avoid constraint issues
DO $$
DECLARE
    admin_user_id uuid;
BEGIN
    -- Get the admin user ID
    SELECT id INTO admin_user_id FROM public.profiles WHERE role = 'admin' LIMIT 1;
    
    IF admin_user_id IS NULL THEN
        RAISE NOTICE 'No admin user found. Skipping seed data insertion.';
        RETURN;
    END IF;

    -- Insert case studies (checking if they don't already exist)
    INSERT INTO public.case_studies (
        slug, title, summary, client, industry, services, tech_stack, 
        hero_image, gallery, body, metrics, status, published_at, created_by
    ) 
    SELECT * FROM (VALUES
        (
            'ecommerce-platform-redesign',
            'E-commerce Platform Redesign',
            'Complete overhaul of legacy e-commerce platform resulting in 150% increase in conversions and 40% faster page load times.',
            'TechCorp Inc.',
            'E-commerce',
            ARRAY['UX/UI Design', 'Frontend Development', 'Performance Optimization'],
            ARRAY['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Shopify API'],
            'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=1200&q=80',
            ARRAY[
                'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1556742111-a301076d9d18?auto=format&fit=crop&w=800&q=80'
            ],
            '<h2>The Challenge</h2><p>TechCorp''s legacy e-commerce platform was struggling with poor user experience, slow load times, and declining conversion rates.</p><h2>Our Solution</h2><p>We redesigned the entire user experience from the ground up, implementing modern web technologies and performance optimization techniques.</p>',
            '[
                {"label": "Conversion Rate Increase", "value": 150, "unit": "%"},
                {"label": "Page Load Time Improvement", "value": 40, "unit": "%"},
                {"label": "Mobile Traffic Increase", "value": 85, "unit": "%"},
                {"label": "Customer Satisfaction", "value": 94, "unit": "%"}
            ]'::jsonb,
            'published',
            now() - interval '30 days',
            admin_user_id
        )
    ) AS new_data(slug, title, summary, client, industry, services, tech_stack, hero_image, gallery, body, metrics, status, published_at, created_by)
    WHERE NOT EXISTS (SELECT 1 FROM public.case_studies WHERE slug = new_data.slug);

    -- Insert lab projects (checking if they don't already exist)
    INSERT INTO public.lab_projects (
        slug, title, summary, demo_url, repo_url, hero_image, tags, body, 
        status, published_at, created_by
    )
    SELECT * FROM (VALUES
        (
            'ai-code-reviewer',
            'AI Code Reviewer',
            'An intelligent code review assistant powered by machine learning that provides automated feedback on code quality, security vulnerabilities, and best practices.',
            'https://ai-reviewer.devmart.sr',
            'https://github.com/devmart/ai-code-reviewer',
            'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
            ARRAY['AI/ML', 'Developer Tools', 'TypeScript', 'Python', 'OpenAI'],
            '<h2>Overview</h2><p>Our AI Code Reviewer leverages advanced machine learning models to provide intelligent feedback on code submissions.</p>',
            'published',
            now() - interval '20 days',
            admin_user_id
        )
    ) AS new_data(slug, title, summary, demo_url, repo_url, hero_image, tags, body, status, published_at, created_by)
    WHERE NOT EXISTS (SELECT 1 FROM public.lab_projects WHERE slug = new_data.slug);

    RAISE NOTICE 'Successfully inserted seed data (avoiding duplicates)';
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error inserting seed data: %', SQLERRM;
END $$;