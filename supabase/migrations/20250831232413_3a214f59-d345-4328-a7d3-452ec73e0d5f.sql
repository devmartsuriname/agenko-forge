-- Phase 2: Content Architecture Expansion
-- Tables: case_studies, lab_projects, jobs

-- Case Studies table
CREATE TABLE public.case_studies (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    summary TEXT,
    client TEXT,
    industry TEXT,
    services TEXT[],
    tech_stack TEXT[],
    metrics JSONB DEFAULT '[]'::jsonb,
    hero_image TEXT,
    gallery TEXT[],
    body TEXT,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    published_at TIMESTAMP WITH TIME ZONE,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Lab Projects table
CREATE TABLE public.lab_projects (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    summary TEXT,
    demo_url TEXT,
    repo_url TEXT,
    hero_image TEXT,
    tags TEXT[],
    body TEXT,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    published_at TIMESTAMP WITH TIME ZONE,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Jobs table
CREATE TABLE public.jobs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    team TEXT,
    location TEXT,
    work_mode TEXT CHECK (work_mode IN ('remote', 'hybrid', 'onsite')),
    type TEXT CHECK (type IN ('full-time', 'part-time', 'contract', 'intern')),
    description TEXT,
    responsibilities TEXT[],
    requirements TEXT[],
    benefits TEXT[],
    apply_url TEXT,
    email TEXT,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed', 'draft')),
    published_at TIMESTAMP WITH TIME ZONE,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_case_studies_slug ON public.case_studies(slug);
CREATE INDEX idx_case_studies_published ON public.case_studies(published_at DESC) WHERE status = 'published';
CREATE INDEX idx_lab_projects_slug ON public.lab_projects(slug);
CREATE INDEX idx_lab_projects_published ON public.lab_projects(published_at DESC) WHERE status = 'published';
CREATE INDEX idx_jobs_slug ON public.jobs(slug);
CREATE INDEX idx_jobs_published ON public.jobs(published_at DESC) WHERE status IN ('open', 'closed');

-- Enable RLS
ALTER TABLE public.case_studies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for case_studies
CREATE POLICY "Anyone can view published case studies" 
ON public.case_studies 
FOR SELECT 
USING (status = 'published');

CREATE POLICY "Editors and admins can view all case studies" 
ON public.case_studies 
FOR SELECT 
USING (get_current_user_role() = ANY (ARRAY['admin'::text, 'editor'::text]));

CREATE POLICY "Editors and admins can create case studies" 
ON public.case_studies 
FOR INSERT 
WITH CHECK (get_current_user_role() = ANY (ARRAY['admin'::text, 'editor'::text]));

CREATE POLICY "Editors and admins can update case studies" 
ON public.case_studies 
FOR UPDATE 
USING (get_current_user_role() = ANY (ARRAY['admin'::text, 'editor'::text]));

CREATE POLICY "Only admins can delete case studies" 
ON public.case_studies 
FOR DELETE 
USING (get_current_user_role() = 'admin'::text);

-- RLS Policies for lab_projects
CREATE POLICY "Anyone can view published lab projects" 
ON public.lab_projects 
FOR SELECT 
USING (status = 'published');

CREATE POLICY "Editors and admins can view all lab projects" 
ON public.lab_projects 
FOR SELECT 
USING (get_current_user_role() = ANY (ARRAY['admin'::text, 'editor'::text]));

CREATE POLICY "Editors and admins can create lab projects" 
ON public.lab_projects 
FOR INSERT 
WITH CHECK (get_current_user_role() = ANY (ARRAY['admin'::text, 'editor'::text]));

CREATE POLICY "Editors and admins can update lab projects" 
ON public.lab_projects 
FOR UPDATE 
USING (get_current_user_role() = ANY (ARRAY['admin'::text, 'editor'::text]));

CREATE POLICY "Only admins can delete lab projects" 
ON public.lab_projects 
FOR DELETE 
USING (get_current_user_role() = 'admin'::text);

-- RLS Policies for jobs
CREATE POLICY "Anyone can view open jobs" 
ON public.jobs 
FOR SELECT 
USING (status IN ('open', 'closed'));

CREATE POLICY "Editors and admins can view all jobs" 
ON public.jobs 
FOR SELECT 
USING (get_current_user_role() = ANY (ARRAY['admin'::text, 'editor'::text]));

CREATE POLICY "Editors and admins can create jobs" 
ON public.jobs 
FOR INSERT 
WITH CHECK (get_current_user_role() = ANY (ARRAY['admin'::text, 'editor'::text]));

CREATE POLICY "Editors and admins can update jobs" 
ON public.jobs 
FOR UPDATE 
USING (get_current_user_role() = ANY (ARRAY['admin'::text, 'editor'::text]));

CREATE POLICY "Only admins can delete jobs" 
ON public.jobs 
FOR DELETE 
USING (get_current_user_role() = 'admin'::text);

-- Add triggers for updated_at
CREATE TRIGGER update_case_studies_updated_at
    BEFORE UPDATE ON public.case_studies
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_lab_projects_updated_at
    BEFORE UPDATE ON public.lab_projects
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at
    BEFORE UPDATE ON public.jobs
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();