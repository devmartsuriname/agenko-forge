-- Phase 1: Critical Database Fixes - Blog Categories Foreign Key Relationships

-- Add missing foreign key constraints to fix blog categories relationship errors
ALTER TABLE public.blog_post_categories 
ADD CONSTRAINT fk_blog_post_categories_post_id 
FOREIGN KEY (blog_post_id) REFERENCES public.blog_posts(id) ON DELETE CASCADE;

ALTER TABLE public.blog_post_categories 
ADD CONSTRAINT fk_blog_post_categories_category_id 
FOREIGN KEY (category_id) REFERENCES public.blog_categories(id) ON DELETE CASCADE;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_blog_post_categories_post_id ON public.blog_post_categories(blog_post_id);
CREATE INDEX IF NOT EXISTS idx_blog_post_categories_category_id ON public.blog_post_categories(category_id);

-- Add unique constraint to prevent duplicate category assignments
ALTER TABLE public.blog_post_categories 
ADD CONSTRAINT unique_blog_post_category 
UNIQUE (blog_post_id, category_id);

-- Update the CMS helper function for better blog category fetching
CREATE OR REPLACE FUNCTION public.get_blog_post_categories(post_id UUID)
RETURNS TABLE(
  id UUID,
  name TEXT,
  slug TEXT,
  color TEXT,
  description TEXT
)
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    bc.id,
    bc.name,
    bc.slug,
    bc.color,
    bc.description
  FROM blog_categories bc
  INNER JOIN blog_post_categories bpc ON bc.id = bpc.category_id
  WHERE bpc.blog_post_id = post_id
  AND bc.status = 'published';
$$;