-- Sample FAQ entries for testing
INSERT INTO public.faqs (question, answer, status, sort_order) VALUES
('What services does Agenko Digital Agency offer?', 
 'We offer comprehensive digital marketing services including web design, SEO, social media marketing, content creation, branding, and digital advertising campaigns to help your business grow online.',
 'published', 1),

('How long does it take to complete a typical project?', 
 'Project timelines vary depending on complexity and scope. A basic website typically takes 2-4 weeks, while comprehensive digital marketing campaigns can take 3-6 months to fully implement and show results.',
 'published', 2),

('Do you provide ongoing support after project completion?', 
 'Yes, we offer various support packages including website maintenance, content updates, SEO monitoring, and ongoing digital marketing management to ensure your continued success.',
 'published', 3),

('What is your pricing structure?', 
 'Our pricing is project-based and tailored to your specific needs. We offer competitive rates and flexible payment options. Contact us for a personalized quote based on your requirements.',
 'published', 4),

('Can you help improve my existing website?', 
 'Absolutely! We can audit your current website and digital presence, then provide recommendations and implement improvements to enhance performance, user experience, and search engine rankings.',
 'published', 5);

-- Sample blog categories for testing
INSERT INTO public.blog_categories (name, slug, description, color, status) VALUES
('Digital Marketing', 'digital-marketing', 'Latest trends and strategies in digital marketing', '#3B82F6', 'published'),
('Web Design', 'web-design', 'Tips and insights about modern web design', '#10B981', 'published'),
('SEO', 'seo', 'Search engine optimization best practices', '#8B5CF6', 'published'),
('Social Media', 'social-media', 'Social media marketing strategies and tips', '#F59E0B', 'published');

-- Sample blog posts with categories
DO $$
DECLARE
    blog_post_id UUID;
    category_id UUID;
BEGIN
    -- Insert sample blog post
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
        '{"blocks":[{"type":"paragraph","data":{"text":"Digital marketing continues to evolve at breakneck speed. As we navigate through 2024, businesses must stay ahead of emerging trends to maintain competitive advantage and drive meaningful engagement with their audiences."}}]}'::jsonb,
        'published',
        NOW(),
        ARRAY['digital marketing', 'trends', '2024', 'AI', 'personalization'],
        'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=630&fit=crop'
    ) RETURNING id INTO blog_post_id;
    
    -- Link to Digital Marketing category
    SELECT id INTO category_id FROM public.blog_categories WHERE slug = 'digital-marketing' LIMIT 1;
    INSERT INTO public.blog_post_categories (blog_post_id, category_id) VALUES (blog_post_id, category_id);
    
    -- Insert another sample blog post
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
        '{"blocks":[{"type":"paragraph","data":{"text":"Modern web design is more than just making things look pretty. It's about creating intuitive, accessible experiences that guide users effortlessly toward their goals while reflecting your brand's unique personality."}}]}'::jsonb,
        'published',
        NOW() - INTERVAL '3 days',
        ARRAY['web design', 'UX', 'user experience', 'branding'],
        'https://images.unsplash.com/photo-1559028012-481c04fa702d?w=1200&h=630&fit=crop'
    ) RETURNING id INTO blog_post_id;
    
    -- Link to Web Design category
    SELECT id INTO category_id FROM public.blog_categories WHERE slug = 'web-design' LIMIT 1;
    INSERT INTO public.blog_post_categories (blog_post_id, category_id) VALUES (blog_post_id, category_id);
END $$;