-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'editor', 'viewer')) DEFAULT 'viewer',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create services table
CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT,
  content JSONB,
  status TEXT NOT NULL CHECK (status IN ('draft', 'published')) DEFAULT 'draft',
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create projects table
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT,
  body JSONB,
  status TEXT NOT NULL CHECK (status IN ('draft', 'published')) DEFAULT 'draft',
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create project images table
CREATE TABLE public.project_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create blog posts table
CREATE TABLE public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT,
  body JSONB,
  status TEXT NOT NULL CHECK (status IN ('draft', 'published')) DEFAULT 'draft',
  published_at TIMESTAMPTZ,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create pages table
CREATE TABLE public.pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  body JSONB,
  status TEXT NOT NULL CHECK (status IN ('draft', 'published')) DEFAULT 'draft',
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create contact submissions table
CREATE TABLE public.contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  ip TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create settings table for site configuration
CREATE TABLE public.settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Create function to get current user role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- RLS Policies

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Admins can update all profiles" ON public.profiles
  FOR UPDATE USING (public.get_current_user_role() = 'admin');

-- Services policies
CREATE POLICY "Anyone can view published services" ON public.services
  FOR SELECT USING (status = 'published');

CREATE POLICY "Editors and admins can view all services" ON public.services
  FOR SELECT USING (public.get_current_user_role() IN ('admin', 'editor'));

CREATE POLICY "Editors and admins can create services" ON public.services
  FOR INSERT WITH CHECK (public.get_current_user_role() IN ('admin', 'editor'));

CREATE POLICY "Editors and admins can update services" ON public.services
  FOR UPDATE USING (public.get_current_user_role() IN ('admin', 'editor'));

CREATE POLICY "Only admins can delete services" ON public.services
  FOR DELETE USING (public.get_current_user_role() = 'admin');

-- Projects policies
CREATE POLICY "Anyone can view published projects" ON public.projects
  FOR SELECT USING (status = 'published');

CREATE POLICY "Editors and admins can view all projects" ON public.projects
  FOR SELECT USING (public.get_current_user_role() IN ('admin', 'editor'));

CREATE POLICY "Editors and admins can create projects" ON public.projects
  FOR INSERT WITH CHECK (public.get_current_user_role() IN ('admin', 'editor'));

CREATE POLICY "Editors and admins can update projects" ON public.projects
  FOR UPDATE USING (public.get_current_user_role() IN ('admin', 'editor'));

CREATE POLICY "Only admins can delete projects" ON public.projects
  FOR DELETE USING (public.get_current_user_role() = 'admin');

-- Project images policies
CREATE POLICY "Anyone can view images of published projects" ON public.project_images
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.projects 
      WHERE id = project_images.project_id AND status = 'published'
    )
  );

CREATE POLICY "Editors and admins can view all project images" ON public.project_images
  FOR SELECT USING (public.get_current_user_role() IN ('admin', 'editor'));

CREATE POLICY "Editors and admins can manage project images" ON public.project_images
  FOR ALL USING (public.get_current_user_role() IN ('admin', 'editor'));

-- Blog posts policies
CREATE POLICY "Anyone can view published blog posts" ON public.blog_posts
  FOR SELECT USING (status = 'published');

CREATE POLICY "Editors and admins can view all blog posts" ON public.blog_posts
  FOR SELECT USING (public.get_current_user_role() IN ('admin', 'editor'));

CREATE POLICY "Editors and admins can create blog posts" ON public.blog_posts
  FOR INSERT WITH CHECK (public.get_current_user_role() IN ('admin', 'editor'));

CREATE POLICY "Editors and admins can update blog posts" ON public.blog_posts
  FOR UPDATE USING (public.get_current_user_role() IN ('admin', 'editor'));

CREATE POLICY "Only admins can delete blog posts" ON public.blog_posts
  FOR DELETE USING (public.get_current_user_role() = 'admin');

-- Pages policies
CREATE POLICY "Anyone can view published pages" ON public.pages
  FOR SELECT USING (status = 'published');

CREATE POLICY "Editors and admins can view all pages" ON public.pages
  FOR SELECT USING (public.get_current_user_role() IN ('admin', 'editor'));

CREATE POLICY "Editors and admins can create pages" ON public.pages
  FOR INSERT WITH CHECK (public.get_current_user_role() IN ('admin', 'editor'));

CREATE POLICY "Editors and admins can update pages" ON public.pages
  FOR UPDATE USING (public.get_current_user_role() IN ('admin', 'editor'));

CREATE POLICY "Only admins can delete pages" ON public.pages
  FOR DELETE USING (public.get_current_user_role() = 'admin');

-- Contact submissions policies (admin only)
CREATE POLICY "Only admins can view contact submissions" ON public.contact_submissions
  FOR SELECT USING (public.get_current_user_role() = 'admin');

-- Settings policies
CREATE POLICY "Anyone can view settings" ON public.settings
  FOR SELECT USING (true);

CREATE POLICY "Only admins can manage settings" ON public.settings
  FOR ALL USING (public.get_current_user_role() = 'admin');

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at columns
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_services_updated_at
  BEFORE UPDATE ON public.services
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pages_updated_at
  BEFORE UPDATE ON public.pages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_settings_updated_at
  BEFORE UPDATE ON public.settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'viewer');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert default settings
INSERT INTO public.settings (key, value) VALUES 
('site_title', '"Agenko Digital Agency"'),
('site_description', '"Innovative marketing solutions for business growth"'),
('social_links', '{"twitter": "", "linkedin": "", "facebook": "", "instagram": ""}'),
('contact_info', '{"email": "info@agenko.com", "phone": "+555-759-9854", "address": "6801 Hollywood Blvd, Los Angeles, CA 90028"}');

-- Seed sample content
INSERT INTO public.services (slug, title, excerpt, content, status, published_at) VALUES
('business-service', 'Business Service', 'Offering a wide range of business services, including consulting, strategy development, and operational support to drive efficiency.', '{"blocks": [{"type": "paragraph", "data": {"text": "Our business services help companies streamline operations and achieve sustainable growth through strategic consulting and operational excellence."}}]}', 'published', NOW()),
('intelligent-architecture', 'Intelligent Architecture', 'Advanced architectural solutions designed to optimize performance, scalability, and user experience across digital platforms.', '{"blocks": [{"type": "paragraph", "data": {"text": "We design intelligent systems that adapt to your business needs and scale with your growth."}}]}', 'published', NOW()),
('branding-service', 'Branding Service', 'Comprehensive branding solutions that help businesses establish strong brand identity and market presence.', '{"blocks": [{"type": "paragraph", "data": {"text": "Build a memorable brand that resonates with your target audience and drives business success."}}]}', 'published', NOW());

INSERT INTO public.projects (slug, title, excerpt, body, status, published_at) VALUES
('daily-schedule-app', 'Daily Schedule Mobile App', 'A daily schedule app designed to help users efficiently plan, organize, activities.', '{"blocks": [{"type": "paragraph", "data": {"text": "Modern mobile application with intuitive UI/UX for productivity and time management."}}]}', 'published', NOW()),
('nexus-production-website', 'Nexus Production Landing Page', 'A production company delivering innovative solutions for film, video, and media.', '{"blocks": [{"type": "paragraph", "data": {"text": "Responsive website design with modern aesthetics and seamless user experience."}}]}', 'published', NOW());

INSERT INTO public.blog_posts (slug, title, excerpt, body, status, published_at, tags) VALUES
('creative-javanese-designer', 'Creative Javanese a Lead Designer & Mobile UI/UX Core Checklist', 'Essential checklist for mobile UI/UX design following modern design principles.', '{"blocks": [{"type": "paragraph", "data": {"text": "A comprehensive guide to creating exceptional mobile user interfaces."}}]}', 'published', NOW(), ARRAY['design', 'mobile', 'ux']),
('defensive-guide-creative-workflow', 'Defensive Guide to Make a Daily More Creative Website Productive Working Flow', 'Strategies to improve creative workflow and productivity in web development.', '{"blocks": [{"type": "paragraph", "data": {"text": "Learn how to optimize your creative process for better results."}}]}', 'published', NOW(), ARRAY['productivity', 'workflow', 'web-design']);

INSERT INTO public.pages (slug, title, body, status, published_at) VALUES
('about', 'About Us', '{"blocks": [{"type": "paragraph", "data": {"text": "We are a leading innovative marketing agency, specializing in creative solutions that drive business growth, enhance brand visibility, and increase customer engagement using data-driven approaches."}}]}', 'published', NOW()),
('privacy-policy', 'Privacy Policy', '{"blocks": [{"type": "paragraph", "data": {"text": "Your privacy is important to us. This policy outlines how we collect, use, and protect your personal information."}}]}', 'published', NOW()),
('terms-conditions', 'Terms & Conditions', '{"blocks": [{"type": "paragraph", "data": {"text": "By using our services, you agree to these terms and conditions."}}]}', 'published', NOW());