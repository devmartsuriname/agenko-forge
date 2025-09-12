-- Database Performance Optimization for Services and Related Tables

-- Add performance indexes for services table
CREATE INDEX IF NOT EXISTS idx_services_status ON services(status);
CREATE INDEX IF NOT EXISTS idx_services_published_at ON services(published_at DESC) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_services_updated_at ON services(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_services_slug ON services(slug);
CREATE INDEX IF NOT EXISTS idx_services_status_updated_at ON services(status, updated_at DESC);

-- Add performance indexes for other content tables that might be queried together
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts(published_at DESC) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_blog_posts_status_updated_at ON blog_posts(status, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_published_at ON projects(published_at DESC) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_projects_status_updated_at ON projects(status, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_pages_status ON pages(status);
CREATE INDEX IF NOT EXISTS idx_pages_status_updated_at ON pages(status, updated_at DESC);

-- Add indexes for profiles table (frequently accessed for role checks)
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Add indexes for logs tables (if they grow large)
CREATE INDEX IF NOT EXISTS idx_logs_app_events_ts ON logs_app_events(ts DESC);
CREATE INDEX IF NOT EXISTS idx_logs_app_events_area ON logs_app_events(area);
CREATE INDEX IF NOT EXISTS idx_logs_app_events_level ON logs_app_events(level);
CREATE INDEX IF NOT EXISTS idx_logs_app_events_user_id ON logs_app_events(user_id) WHERE user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_logs_errors_ts ON logs_errors(ts DESC);
CREATE INDEX IF NOT EXISTS idx_logs_errors_area ON logs_errors(area);
CREATE INDEX IF NOT EXISTS idx_logs_errors_user_id ON logs_errors(user_id) WHERE user_id IS NOT NULL;

-- Add partial indexes for frequently accessed settings
CREATE INDEX IF NOT EXISTS idx_settings_public_keys ON settings(key) WHERE key IN (
    'site_title', 'contact_email', 'company_name', 'contact_phone', 
    'contact_address', 'business_hours', 'footer_legal_text', 
    'facebook_url', 'linkedin_url', 'twitter_url', 'instagram_url'
);

-- Analyze tables to update statistics for query planner
ANALYZE services;
ANALYZE blog_posts; 
ANALYZE projects;
ANALYZE pages;
ANALYZE profiles;
ANALYZE settings;