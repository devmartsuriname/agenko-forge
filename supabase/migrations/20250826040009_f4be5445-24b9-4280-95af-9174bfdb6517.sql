-- Sample blog posts with categories and feature images
DO $$
DECLARE
    blog_post_id UUID;
    category_id UUID;
BEGIN
    -- Insert sample blog post 1
    INSERT INTO public.blog_posts (
        title, 
        slug, 
        excerpt, 
        body, 
        status, 
        published_at,
        tags,
        feature_image_url
    ) VALUES (
        '10 Essential Digital Marketing Trends for 2024',
        '10-essential-digital-marketing-trends-2024',
        'Discover the top digital marketing trends that will shape business success in 2024, from AI-powered personalization to voice search optimization.',
        '{"blocks":[{"type":"paragraph","data":{"text":"Digital marketing continues to evolve at breakneck speed. As we navigate through 2024, businesses must stay ahead of emerging trends to maintain competitive advantage and drive meaningful engagement with their audiences."}},{"type":"header","data":{"text":"AI-Powered Personalization","level":2}},{"type":"paragraph","data":{"text":"Artificial intelligence is revolutionizing how we deliver personalized experiences to customers, making every interaction more relevant and impactful."}}]}'::jsonb,
        'published',
        NOW(),
        ARRAY['digital marketing', 'trends', '2024', 'AI', 'personalization'],
        'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=630&fit=crop'
    ) RETURNING id INTO blog_post_id;
    
    -- Link to Digital Marketing category
    SELECT id INTO category_id FROM public.blog_categories WHERE slug = 'digital-marketing' LIMIT 1;
    INSERT INTO public.blog_post_categories (blog_post_id, category_id) VALUES (blog_post_id, category_id)
    ON CONFLICT DO NOTHING;
    
    -- Insert sample blog post 2
    INSERT INTO public.blog_posts (
        title, 
        slug, 
        excerpt, 
        body, 
        status, 
        published_at,
        tags,
        feature_image_url
    ) VALUES (
        'The Art of Modern Web Design: Creating User-Centric Experiences',
        'art-modern-web-design-user-centric-experiences',
        'Learn how to create compelling web designs that prioritize user experience while maintaining aesthetic appeal and brand consistency.',
        '{"blocks":[{"type":"paragraph","data":{"text":"Modern web design is more than just making things look pretty. Its about creating intuitive, accessible experiences that guide users effortlessly toward their goals while reflecting your brands unique personality."}},{"type":"header","data":{"text":"User Experience First","level":2}},{"type":"paragraph","data":{"text":"Every design decision should be made with the user in mind, from navigation structure to color choices."}}]}'::jsonb,
        'published',
        NOW() - INTERVAL '3 days',
        ARRAY['web design', 'UX', 'user experience', 'branding'],
        'https://images.unsplash.com/photo-1559028012-481c04fa702d?w=1200&h=630&fit=crop'
    ) RETURNING id INTO blog_post_id;
    
    -- Link to Web Design category
    SELECT id INTO category_id FROM public.blog_categories WHERE slug = 'web-design' LIMIT 1;
    INSERT INTO public.blog_post_categories (blog_post_id, category_id) VALUES (blog_post_id, category_id)
    ON CONFLICT DO NOTHING;

    -- Insert sample blog post 3
    INSERT INTO public.blog_posts (
        title, 
        slug, 
        excerpt, 
        body, 
        status, 
        published_at,
        tags,
        feature_image_url
    ) VALUES (
        'SEO in 2024: Advanced Strategies That Actually Work',
        'seo-2024-advanced-strategies-that-work',
        'Discover the latest SEO techniques and strategies that are driving real results in 2024, beyond traditional keyword optimization.',
        '{"blocks":[{"type":"paragraph","data":{"text":"Search engine optimization has evolved significantly. Modern SEO requires a holistic approach that combines technical excellence with user-focused content strategy."}},{"type":"header","data":{"text":"Core Web Vitals Matter More Than Ever","level":2}},{"type":"paragraph","data":{"text":"Google continues to prioritize user experience metrics, making site speed and performance critical ranking factors."}}]}'::jsonb,
        'published',
        NOW() - INTERVAL '1 day',
        ARRAY['SEO', 'search engine optimization', 'core web vitals', 'Google'],
        'https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=1200&h=630&fit=crop'
    ) RETURNING id INTO blog_post_id;
    
    -- Link to SEO category
    SELECT id INTO category_id FROM public.blog_categories WHERE slug = 'seo' LIMIT 1;
    INSERT INTO public.blog_post_categories (blog_post_id, category_id) VALUES (blog_post_id, category_id)
    ON CONFLICT DO NOTHING;
END $$;