// Content types for CMS
export interface ProjectImage {
  id: string;
  project_id: string;
  url: string;
  alt?: string;
  sort_order?: number;
  created_at?: string;
}

export interface Service {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content?: any; // JSONB
  status: 'draft' | 'published';
  published_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  body?: any; // JSONB
  status: 'draft' | 'published';
  published_at?: string;
  created_at?: string;
  updated_at?: string;
  project_images?: ProjectImage[];
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  body?: any; // JSONB
  tags?: string[];
  status: 'draft' | 'published';
  published_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Page {
  id: string;
  title: string;
  slug: string;
  body?: any; // JSONB
  status: 'draft' | 'published';
  published_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  ip?: string;
  created_at?: string;
}