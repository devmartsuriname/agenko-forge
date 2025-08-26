-- Sample blog categories for testing
INSERT INTO public.blog_categories (name, slug, description, color, status) VALUES
('Digital Marketing', 'digital-marketing', 'Latest trends and strategies in digital marketing', '#3B82F6', 'published'),
('Web Design', 'web-design', 'Tips and insights about modern web design', '#10B981', 'published'),
('SEO', 'seo', 'Search engine optimization best practices', '#8B5CF6', 'published'),
('Social Media', 'social-media', 'Social media marketing strategies and tips', '#F59E0B', 'published')
ON CONFLICT (slug) DO NOTHING;