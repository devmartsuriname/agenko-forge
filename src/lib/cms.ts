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
          const { data: categoriesData, error: categoriesError } = await supabase
            .rpc('get_blog_post_categories', { post_id: post.id });

          if (categoriesError) {
            console.warn('Error fetching categories for post:', post.id, categoriesError);
            return { 
              ...post, 
              status: post.status as 'draft' | 'published',
              categories: [] 
            };
          }

          // Map the raw data to BlogCategory type
          const categories: BlogCategory[] = (categoriesData || []).map(cat => ({
            id: cat.id,
            name: cat.name,
            slug: cat.slug,
            color: cat.color,
            description: cat.description,
            status: cat.status as 'draft' | 'published',
            created_at: cat.created_at,
            updated_at: cat.updated_at
          }));

          return { 
            ...post, 
            status: post.status as 'draft' | 'published',
            categories 
          };
        } catch (error) {
          console.warn('Error fetching categories for post:', post.id, error);
          return { 
            ...post, 
            status: post.status as 'draft' | 'published',
            categories: [] 
          };
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
    if (process.env.NODE_ENV === 'development') {
      console.log('📚 [CMS] Fetching published pages...');
    }
    
    const { data, error } = await supabase
      .from('pages')
      .select('*')
      .eq('status', 'published')
      .order('published_at', { ascending: false });

    if (error) {
      console.error('❌ [CMS] Error fetching pages:', error);
      throw error;
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ [CMS] Raw pages data from DB:', data);
    }
    
    // Process pages and ensure body field is properly parsed
    const processedPages = (data || []).map(page => {
      let processedBody: any = page.body;
      
      if (process.env.NODE_ENV === 'development') {
        console.log('🔍 [CMS] Processing page body for:', page.slug, {
          bodyType: typeof page.body,
          bodyValue: page.body,
          isNull: page.body === null,
          isString: typeof page.body === 'string'
        });
      }
      
      // If body is a string, try to parse it as JSON
      if (typeof page.body === 'string') {
        try {
          processedBody = JSON.parse(page.body);
          if (process.env.NODE_ENV === 'development') {
            console.log('🔄 [CMS] Parsed string body for page:', page.slug);
          }
        } catch (e) {
          if (process.env.NODE_ENV === 'development') {
            console.warn('⚠️ [CMS] Failed to parse body JSON for page:', page.slug, e);
          }
          processedBody = null;
        }
      }
      
      // Handle special case where body might be wrapped in extra structure
      if (processedBody && typeof processedBody === 'object' && !Array.isArray(processedBody)) {
        const bodyObj = processedBody as Record<string, any>;
        
        // Check if body has a _type and value structure (PostgreSQL JSON artifact)
        if (bodyObj._type === 'undefined' && bodyObj.value === 'undefined') {
          if (process.env.NODE_ENV === 'development') {
            console.warn('⚠️ [CMS] Found undefined body structure for page:', page.slug);
          }
          processedBody = null;
        }
        // If body is wrapped in a value property, unwrap it
        else if (bodyObj.value && typeof bodyObj.value === 'object') {
          processedBody = bodyObj.value;
          if (process.env.NODE_ENV === 'development') {
            console.log('🔄 [CMS] Unwrapped body.value for page:', page.slug);
          }
        }
      }
      
      const finalPage = {
        ...page,
        body: processedBody
      };
      
      const sectionsCount = (processedBody && 
                           typeof processedBody === 'object' && 
                           !Array.isArray(processedBody) && 
                           processedBody.sections && 
                           Array.isArray(processedBody.sections)) ? 
                           processedBody.sections.length : 0;
      
      if (process.env.NODE_ENV === 'development') {
        console.log('📄 [CMS] Processed page:', {
          slug: page.slug,
          title: page.title,
          hasBody: !!processedBody,
          bodyType: typeof processedBody,
          hasSections: sectionsCount > 0,
          sectionsCount,
          rawBodyType: typeof page.body,
          bodyPreview: processedBody ? JSON.stringify(processedBody).substring(0, 200) + '...' : 'null'
        });
      }
      
      return finalPage;
    });
    
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ [CMS] Pages processed successfully:', {
        count: processedPages.length,
        pages: processedPages.map(p => {
          const sectionsCount = (p.body && 
                               typeof p.body === 'object' && 
                               !Array.isArray(p.body) && 
                               p.body.sections && 
                               Array.isArray(p.body.sections)) ? 
                               p.body.sections.length : 0;
          return { 
            slug: p.slug, 
            title: p.title, 
            hasBody: !!p.body,
            sectionsCount
          };
        })
      });
    }
    
    return processedPages as Page[];
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
    try {
      const { data, error } = await supabase
        .rpc('get_blog_post_categories', { post_id: postId });

      if (error) throw error;
      
      return (data || []).map(cat => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        color: cat.color,
        description: cat.description,
        status: cat.status as 'draft' | 'published',
        created_at: cat.created_at,
        updated_at: cat.updated_at
      }));
    } catch (error) {
      console.warn('Error fetching categories for post:', postId, error);
      return [];
    }
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