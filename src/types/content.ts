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
  seo_title?: string;
  seo_description?: string;
  seo_canonical_url?: string;
  seo_og_image?: string;
  seo_robots?: string;
  seo_schema_type?: string;
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
  seo_title?: string;
  seo_description?: string;
  seo_canonical_url?: string;
  seo_og_image?: string;
  seo_robots?: string;
  seo_schema_type?: string;
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color: string;
  status: 'draft' | 'published';
  created_at?: string;
  updated_at?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  body?: any; // JSONB
  tags?: string[];
  feature_image_url?: string;
  status: 'draft' | 'published';
  published_at?: string;
  created_at?: string;
  updated_at?: string;
  categories?: BlogCategory[];
  seo_title?: string;
  seo_description?: string;
  seo_canonical_url?: string;
  seo_og_image?: string;
  seo_robots?: string;
  seo_schema_type?: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  status: 'draft' | 'published';
  sort_order: number;
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
  seo_title?: string;
  seo_description?: string;
  seo_canonical_url?: string;
  seo_og_image?: string;
  seo_robots?: string;
  seo_schema_type?: string;
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