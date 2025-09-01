import { supabase } from '@/integrations/supabase/client';
import { logger, LogArea } from '@/lib/observability';

export interface Page {
  id: string;
  title: string;
  slug: string;
  body: any;
  status: 'draft' | 'published';
  published_at?: string;
  created_at: string;
  updated_at: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  body: any;
  tags?: string[];
  feature_image_url?: string;
  status: 'draft' | 'published';
  published_at?: string;
  created_at: string;
  updated_at: string;
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

export interface Project {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  body: any;
  status: 'draft' | 'published';
  published_at?: string;
  created_at: string;
  updated_at: string;
  project_images?: ProjectImage[];
}

export interface Service {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: any;
  status: 'draft' | 'published';
  published_at?: string;
  created_at: string;
  updated_at: string;
}

export interface HomepagePreview {
  blog_posts: Array<{
    id: string;
    title: string;
    excerpt?: string;
    slug: string;
    published_at?: string;
    tags?: string[];
  }>;
  projects: Array<{
    id: string;
    title: string;
    excerpt?: string;
    slug: string;
    published_at?: string;
    first_image?: string;
  }>;
  services: Array<{
    id: string;
    title: string;
    excerpt?: string;
    slug: string;
    published_at?: string;
  }>;
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

export interface ProjectImage {
  id: string;
  project_id: string;
  url: string;
  alt: string | null;
  sort_order: number;
  created_at: string;
}

// CMS Functions
export const cms = {
  /**
   * Get optimized homepage previews using single RPC call
   */
  async getHomepagePreviews(
    blogLimit: number = 3,
    projectLimit: number = 6,
    serviceLimit: number = 3
  ): Promise<HomepagePreview> {
    try {
      const { data, error } = await supabase.rpc('get_homepage_previews', {
        p_blog_limit: blogLimit,
        p_project_limit: projectLimit,
        p_service_limit: serviceLimit
      });

      if (error) {
        await logger.error(LogArea.CMS, 'Failed to fetch homepage previews', error);
        throw error;
      }

      // Type assertion for the RPC response
      const typedData = data as unknown as HomepagePreview;

      await logger.info(LogArea.CMS, 'Homepage previews fetched successfully', {
        blog_count: typedData.blog_posts?.length || 0,
        project_count: typedData.projects?.length || 0,
        service_count: typedData.services?.length || 0
      });

      return typedData;
    } catch (error) {
      await logger.error(LogArea.CMS, 'Homepage previews fetch failed', error as Error);
      
      // Fallback to empty results
      return {
        blog_posts: [],
        projects: [],
        services: []
      };
    }
  },
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

  async getPublishedBlogPostsWithCategories(limit?: number): Promise<(BlogPost & { categories?: BlogCategory[] })[]> {
    // First get the blog posts
    let query = supabase
      .from('blog_posts')
      .select('*')
      .eq('status', 'published')
      .order('published_at', { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }

    const { data: posts, error: postsError } = await query;
    if (postsError) throw postsError;

    if (!posts || posts.length === 0) return [];

    // Get categories for each post using the new helper function
    const postsWithCategories = await Promise.all(
      posts.map(async (post) => {
        try {
          const { data: categories, error: categoriesError } = await supabase
            .rpc('get_blog_post_categories', { post_id: post.id });

          if (categoriesError) {
            console.warn('Error fetching categories for post:', post.id, categoriesError);
            return { ...post, categories: [] };
          }

          return { ...post, categories: categories || [] };
        } catch (error) {
          console.warn('Error fetching categories for post:', post.id, error);
          return { ...post, categories: [] };
        }
      })
    );

    return postsWithCategories as (BlogPost & { categories?: BlogCategory[] })[];
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
  async getPublishedPages(): Promise<Page[]> {
    const { data, error } = await supabase
      .from('pages')
      .select('*')
      .eq('status', 'published')
      .order('published_at', { ascending: false });

    if (error) throw error;
    return (data || []) as Page[];
  },

  // Get published blog categories
  getPublishedBlogCategories: async (): Promise<BlogCategory[]> => {
    const { data, error } = await supabase
      .from('blog_categories')
      .select('*')
      .eq('status', 'published')
      .order('name', { ascending: true });
    
    if (error) throw error;
    return (data || []).map(item => ({
      ...item,
      status: item.status as 'draft' | 'published'
    }));
  },

  // Get blog posts by category
  getBlogPostsByCategory: async (categorySlug: string, limit?: number): Promise<BlogPost[]> => {
    let query = supabase
      .from('blog_posts')
      .select(`
        *,
        blog_post_categories!inner(
          blog_categories!inner(slug)
        )
      `)
      .eq('status', 'published')
      .eq('blog_post_categories.blog_categories.slug', categorySlug)
      .order('published_at', { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;
    if (error) throw error;
    
    return (data || []).map(item => ({
      ...item,
      status: item.status as 'draft' | 'published'
    }));
  },

  async getBlogPostCategories(postId: string): Promise<BlogCategory[]> {
    const { data, error } = await supabase
      .from('blog_post_categories')
      .select(`
        blog_categories!inner(
          id,
          name,
          slug,
          color,
          description,
          status,
          created_at,
          updated_at
        )
      `)
      .eq('blog_post_id', postId);

    if (error) throw error;
    
    return (data || []).map(item => ({
      id: (item as any).blog_categories.id,
      name: (item as any).blog_categories.name,
      slug: (item as any).blog_categories.slug,
      color: (item as any).blog_categories.color,
      description: (item as any).blog_categories.description,
      status: (item as any).blog_categories.status as 'draft' | 'published',
      created_at: (item as any).blog_categories.created_at,
      updated_at: (item as any).blog_categories.updated_at
    }));
  },

  // Get category by slug
  getBlogCategoryBySlug: async (slug: string): Promise<BlogCategory | null> => {
    const { data, error } = await supabase
      .from('blog_categories')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle();
    
    if (error) throw error;
    return data ? {
      ...data,
      status: data.status as 'draft' | 'published'
    } : null;
  },

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
  // CAPTCHA verification implementation would go here
  // For demo purposes, return true
  return Promise.resolve(true);
}