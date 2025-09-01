-- Update the helper function to return all required BlogCategory fields
CREATE OR REPLACE FUNCTION public.get_blog_post_categories(post_id UUID)
RETURNS TABLE(
  id UUID,
  name TEXT,
  slug TEXT,
  color TEXT,
  description TEXT,
  status TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
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
    bc.description,
    bc.status,
    bc.created_at,
    bc.updated_at
  FROM blog_categories bc
  INNER JOIN blog_post_categories bpc ON bc.id = bpc.category_id
  WHERE bpc.blog_post_id = post_id
  AND bc.status = 'published';
$$;