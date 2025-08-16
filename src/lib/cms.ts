import { supabase } from '@/integrations/supabase/client';

export interface Service {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: any;
  status: 'draft' | 'published';
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  body: any;
  status: 'draft' | 'published';
  published_at: string | null;
  created_at: string;
  updated_at: string;
  project_images?: ProjectImage[];
}

export interface ProjectImage {
  id: string;
  project_id: string;
  url: string;
  alt: string | null;
  sort_order: number;
  created_at: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  body: any;
  status: 'draft' | 'published';
  published_at: string | null;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface Page {
  id: string;
  slug: string;
  title: string;
  body: any;
  status: 'draft' | 'published';
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  ip: string | null;
  created_at: string;
}

export interface Settings {
  key: string;
  value: any;
  updated_at: string;
}

// CMS Functions
export const cms = {
  // Services
  async getPublishedServices(): Promise<Service[]> {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('status', 'published')
      .order('published_at', { ascending: false });

    if (error) throw error;
    return (data || []) as Service[];
  },

  async getServiceBySlug(slug: string): Promise<Service | null> {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .single();

    if (error) return null;
    return data as Service;
  },

  // Projects
  async getPublishedProjects(): Promise<Project[]> {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        project_images (*)
      `)
      .eq('status', 'published')
      .order('published_at', { ascending: false });

    if (error) throw error;
    return (data || []) as Project[];
  },

  async getProjectBySlug(slug: string): Promise<Project | null> {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        project_images (*)
      `)
      .eq('slug', slug)
      .eq('status', 'published')
      .single();

    if (error) return null;
    return data as Project;
  },

  // Blog Posts
  async getPublishedBlogPosts(limit?: number): Promise<BlogPost[]> {
    let query = supabase
      .from('blog_posts')
      .select('*')
      .eq('status', 'published')
      .order('published_at', { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as BlogPost[];
  },

  async getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .single();

    if (error) return null;
    return data as BlogPost;
  },

  // Pages
  async getPageBySlug(slug: string): Promise<Page | null> {
    const { data, error } = await supabase
      .from('pages')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .single();

    if (error) return null;
    return data as Page;
  },

  // Settings
  async getSetting(key: string): Promise<any> {
    const { data, error } = await supabase
      .from('settings')
      .select('value')
      .eq('key', key)
      .single();

    if (error) return null;
    return data?.value;
  },

  async getAllSettings(): Promise<Record<string, any>> {
    const { data, error } = await supabase
      .from('settings')
      .select('*');

    if (error) throw error;
    
    const settings: Record<string, any> = {};
    data?.forEach(setting => {
      settings[setting.key] = setting.value;
    });
    
    return settings;
  },

  // Contact Submissions
  async submitContact(submission: {
    name: string;
    email: string;
    subject?: string;
    message: string;
  }) {
    // This would be called from a server action/API route
    // Including client IP and rate limiting
    const { error } = await supabase
      .from('contact_submissions')
      .insert({
        ...submission,
        ip: null, // Would be set server-side
      });

    if (error) throw error;
  },
};

// Utility function to generate slug from title
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// CAPTCHA verification stub
export async function verifyCaptcha(token: string): Promise<boolean> {
  // TODO: Implement actual CAPTCHA verification
  // For now, return true (stub implementation)
  console.log('CAPTCHA verification stub - token:', token);
  return true;
}