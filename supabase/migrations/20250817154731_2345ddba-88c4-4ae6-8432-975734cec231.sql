-- A) DB Index Hardening for Project Images and Performance

-- 1) Avoid duplicate sort positions per project
CREATE UNIQUE INDEX IF NOT EXISTS ux_project_images_project_sort
  ON project_images (project_id, sort_order);

-- 2) Avoid duplicate URLs per project (optional but recommended)
CREATE UNIQUE INDEX IF NOT EXISTS ux_project_images_project_url
  ON project_images (project_id, url)
  WHERE url IS NOT NULL;

-- 3) Performance indexes for common queries
CREATE INDEX IF NOT EXISTS ix_projects_slug ON projects (slug);
CREATE INDEX IF NOT EXISTS ix_projects_published ON projects (status, published_at DESC);
CREATE INDEX IF NOT EXISTS ix_blog_posts_slug ON blog_posts (slug);
CREATE INDEX IF NOT EXISTS ix_blog_posts_published ON blog_posts (status, published_at DESC);

-- 4) Create media storage bucket for local images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

-- 5) Storage policies for media bucket
CREATE POLICY "Anyone can view media files" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'media');

CREATE POLICY "Admins can upload media files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'media' AND get_current_user_role() = 'admin');

CREATE POLICY "Admins can update media files" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'media' AND get_current_user_role() = 'admin');

CREATE POLICY "Admins can delete media files" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'media' AND get_current_user_role() = 'admin');