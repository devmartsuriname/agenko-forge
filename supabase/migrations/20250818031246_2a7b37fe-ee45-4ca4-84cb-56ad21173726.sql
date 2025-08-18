-- Add SEO fields to all content tables

-- Add SEO fields to pages table
ALTER TABLE pages ADD COLUMN IF NOT EXISTS seo_title TEXT;
ALTER TABLE pages ADD COLUMN IF NOT EXISTS seo_description TEXT;
ALTER TABLE pages ADD COLUMN IF NOT EXISTS seo_canonical_url TEXT;
ALTER TABLE pages ADD COLUMN IF NOT EXISTS seo_og_image TEXT;
ALTER TABLE pages ADD COLUMN IF NOT EXISTS seo_robots TEXT DEFAULT 'index,follow';
ALTER TABLE pages ADD COLUMN IF NOT EXISTS seo_schema_type TEXT DEFAULT 'WebPage';

-- Add SEO fields to blog_posts table
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS seo_title TEXT;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS seo_description TEXT;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS seo_canonical_url TEXT;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS seo_og_image TEXT;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS seo_robots TEXT DEFAULT 'index,follow';
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS seo_schema_type TEXT DEFAULT 'Article';

-- Add SEO fields to projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS seo_title TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS seo_description TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS seo_canonical_url TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS seo_og_image TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS seo_robots TEXT DEFAULT 'index,follow';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS seo_schema_type TEXT DEFAULT 'CreativeWork';

-- Add SEO fields to services table
ALTER TABLE services ADD COLUMN IF NOT EXISTS seo_title TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS seo_description TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS seo_canonical_url TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS seo_og_image TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS seo_robots TEXT DEFAULT 'index,follow';
ALTER TABLE services ADD COLUMN IF NOT EXISTS seo_schema_type TEXT DEFAULT 'Service';