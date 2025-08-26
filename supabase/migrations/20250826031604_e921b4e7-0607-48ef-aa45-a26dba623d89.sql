-- Phase 7.1: Blog Categories, Feature Image, and FAQ Management

-- 1. Create blog_categories table
CREATE TABLE public.blog_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT DEFAULT '#10b981',
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for blog_categories
ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;

-- RLS policies for blog_categories
CREATE POLICY "Anyone can view published categories" 
ON public.blog_categories 
FOR SELECT 
USING (status = 'published');

CREATE POLICY "Editors and admins can view all categories" 
ON public.blog_categories 
FOR SELECT 
USING (get_current_user_role() = ANY (ARRAY['admin'::text, 'editor'::text]));

CREATE POLICY "Editors and admins can create categories" 
ON public.blog_categories 
FOR INSERT 
WITH CHECK (get_current_user_role() = ANY (ARRAY['admin'::text, 'editor'::text]));

CREATE POLICY "Editors and admins can update categories" 
ON public.blog_categories 
FOR UPDATE 
USING (get_current_user_role() = ANY (ARRAY['admin'::text, 'editor'::text]));

CREATE POLICY "Only admins can delete categories" 
ON public.blog_categories 
FOR DELETE 
USING (get_current_user_role() = 'admin');

-- 2. Create blog_post_categories junction table
CREATE TABLE public.blog_post_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  blog_post_id UUID NOT NULL,
  category_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(blog_post_id, category_id)
);

-- Enable RLS for blog_post_categories
ALTER TABLE public.blog_post_categories ENABLE ROW LEVEL SECURITY;

-- RLS policies for blog_post_categories
CREATE POLICY "Anyone can view published post categories" 
ON public.blog_post_categories 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.blog_posts 
  WHERE id = blog_post_categories.blog_post_id 
  AND status = 'published'
));

CREATE POLICY "Editors and admins can view all post categories" 
ON public.blog_post_categories 
FOR SELECT 
USING (get_current_user_role() = ANY (ARRAY['admin'::text, 'editor'::text]));

CREATE POLICY "Editors and admins can manage post categories" 
ON public.blog_post_categories 
FOR ALL 
USING (get_current_user_role() = ANY (ARRAY['admin'::text, 'editor'::text]));

-- 3. Add feature_image_url to blog_posts
ALTER TABLE public.blog_posts 
ADD COLUMN feature_image_url TEXT;

-- 4. Create faqs table
CREATE TABLE public.faqs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for faqs
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;

-- RLS policies for faqs
CREATE POLICY "Anyone can view published faqs" 
ON public.faqs 
FOR SELECT 
USING (status = 'published');

CREATE POLICY "Editors and admins can view all faqs" 
ON public.faqs 
FOR SELECT 
USING (get_current_user_role() = ANY (ARRAY['admin'::text, 'editor'::text]));

CREATE POLICY "Editors and admins can create faqs" 
ON public.faqs 
FOR INSERT 
WITH CHECK (get_current_user_role() = ANY (ARRAY['admin'::text, 'editor'::text]));

CREATE POLICY "Editors and admins can update faqs" 
ON public.faqs 
FOR UPDATE 
USING (get_current_user_role() = ANY (ARRAY['admin'::text, 'editor'::text]));

CREATE POLICY "Only admins can delete faqs" 
ON public.faqs 
FOR DELETE 
USING (get_current_user_role() = 'admin');

-- 5. Create triggers for updated_at columns
CREATE TRIGGER update_blog_categories_updated_at
BEFORE UPDATE ON public.blog_categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_faqs_updated_at
BEFORE UPDATE ON public.faqs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 6. Create indexes for better performance
CREATE INDEX idx_blog_categories_status ON public.blog_categories(status);
CREATE INDEX idx_blog_categories_slug ON public.blog_categories(slug);
CREATE INDEX idx_blog_post_categories_blog_post_id ON public.blog_post_categories(blog_post_id);
CREATE INDEX idx_blog_post_categories_category_id ON public.blog_post_categories(category_id);
CREATE INDEX idx_faqs_status ON public.faqs(status);
CREATE INDEX idx_faqs_sort_order ON public.faqs(sort_order);