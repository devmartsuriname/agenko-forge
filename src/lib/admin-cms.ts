import { supabase } from '@/integrations/supabase/client';
import { ProjectImage, Service, Project, BlogPost, BlogCategory, FAQ, Page, ContactSubmission } from '@/types/content';

// Admin CMS functions with full CRUD capabilities
export const adminCms = {
  // Services
  async getAllServices(): Promise<Service[]> {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return (data || []) as Service[];
  },

  async createService(service: Omit<Service, 'id' | 'created_at' | 'updated_at'>): Promise<Service> {
    const { data, error } = await supabase
      .from('services')
      .insert(service)
      .select()
      .single();

    if (error) throw error;
    return data as Service;
  },

  async updateService(id: string, updates: Partial<Service>): Promise<Service> {
    const { data, error } = await supabase
      .from('services')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Service;
  },

  async getService(id: string): Promise<Service | null> {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return null;
    return data as Service;
  },

  async deleteService(id: string): Promise<void> {
    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Projects
  async getAllProjects(): Promise<Project[]> {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        project_images (*)
      `)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return (data || []) as Project[];
  },

  async createProject(project: Omit<Project, 'id' | 'created_at' | 'updated_at'>): Promise<Project> {
    const { data, error } = await supabase
      .from('projects')
      .insert(project)
      .select()
      .single();

    if (error) throw error;
    return data as Project;
  },

  async updateProject(id: string, updates: Partial<Project>): Promise<Project> {
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Project;
  },

  async deleteProject(id: string): Promise<void> {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getProject(id: string): Promise<Project> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Project;
  },

  // Blog Posts
  async getAllBlogPosts(): Promise<BlogPost[]> {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return (data || []) as BlogPost[];
  },

  async createBlogPost(post: Omit<BlogPost, 'id' | 'created_at' | 'updated_at'>): Promise<BlogPost> {
    const { data, error } = await supabase
      .from('blog_posts')
      .insert(post)
      .select()
      .single();

    if (error) throw error;
    return data as BlogPost;
  },

  async updateBlogPost(id: string, updates: Partial<BlogPost>): Promise<BlogPost> {
    const { data, error } = await supabase
      .from('blog_posts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as BlogPost;
  },

  async getBlogPost(id: string): Promise<BlogPost> {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as BlogPost;
  },

  async deleteBlogPost(id: string): Promise<void> {
    const { error } = await supabase
      .from('blog_posts')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Pages
  async getAllPages(): Promise<Page[]> {
    const { data, error } = await supabase
      .from('pages')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return (data || []) as Page[];
  },

  async createPage(page: Omit<Page, 'id' | 'created_at' | 'updated_at'>): Promise<Page> {
    const { data, error } = await supabase
      .from('pages')
      .insert(page)
      .select()
      .single();

    if (error) throw error;
    return data as Page;
  },

  async updatePage(id: string, updates: Partial<Page>): Promise<Page> {
    const { data, error } = await supabase
      .from('pages')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Page;
  },

  async deletePage(id: string): Promise<void> {
    const { error } = await supabase
      .from('pages')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Contact Submissions
  async getAllContactSubmissions(): Promise<ContactSubmission[]> {
    const { data, error } = await supabase
      .from('contact_submissions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as ContactSubmission[];
  },

  // Settings
  async updateSetting(key: string, value: any): Promise<void> {
    const { error } = await supabase
      .from('settings')
      .upsert({ key, value })
      .eq('key', key);

    if (error) throw error;
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

  // Users (Profiles)
  async getAllProfiles(): Promise<Array<{id: string; email: string; role: string; created_at: string; updated_at: string}>> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async updateUserRole(userId: string, role: string): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', userId);

    if (error) throw error;
  },

  // Project Images Management
  async getAllProjectImages(): Promise<ProjectImage[]> {
    const { data, error } = await supabase
      .from('project_images')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  // Media Library Management
  async getAllMediaFiles(options: {
    page?: number;
    limit?: number;
    filter?: 'all' | 'referenced' | 'unreferenced';
    folder?: string;
  } = {}): Promise<{
    files: Array<{
      name: string;
      path: string;
      size: number;
      created_at: string;
      isReferenced: boolean;
      metadata?: any;
    }>;
    totalCount: number;
    hasMore: boolean;
  }> {
    const { page = 0, limit = 20 } = options;
    
    // Get all files from storage
    const { data: storageFiles, error: storageError } = await supabase.storage
      .from('media')
      .list('', {
        limit: 1000,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' }
      });

    if (storageError) throw storageError;

    // Recursively collect all files
    const allFiles: any[] = [];
    
    async function collectFiles(prefix = '', files: any[] = storageFiles || []) {
      for (const file of files) {
        const fullPath = prefix ? `${prefix}/${file.name}` : file.name;
        
        if (file.metadata === null) {
          // This is a folder, get its contents
          const { data: subFiles } = await supabase.storage
            .from('media')
            .list(fullPath, {
              limit: 1000,
              offset: 0,
              sortBy: { column: 'created_at', order: 'desc' }
            });
          
          if (subFiles) {
            await collectFiles(fullPath, subFiles);
          }
        } else {
          // This is a file
          allFiles.push({
            name: file.name,
            path: fullPath,
            size: file.metadata?.size || 0,
            created_at: file.created_at,
            metadata: file.metadata
          });
        }
      }
    }

    await collectFiles();

    // Get referenced files
    const referencedFiles = await this.getReferencedFiles();

    // Add reference status
    const filesWithStatus = allFiles.map(file => ({
      ...file,
      isReferenced: referencedFiles.has(file.path)
    }));

    // Apply filters
    let filteredFiles = filesWithStatus;
    
    if (options.filter === 'referenced') {
      filteredFiles = filesWithStatus.filter(f => f.isReferenced);
    } else if (options.filter === 'unreferenced') {
      filteredFiles = filesWithStatus.filter(f => !f.isReferenced);
    }

    if (options.folder) {
      filteredFiles = filteredFiles.filter(f => f.path.startsWith(options.folder));
    }

    // Paginate
    const startIndex = page * limit;
    const endIndex = startIndex + limit;
    const paginatedFiles = filteredFiles.slice(startIndex, endIndex);

    return {
      files: paginatedFiles,
      totalCount: filteredFiles.length,
      hasMore: endIndex < filteredFiles.length
    };
  },

  async getReferencedFiles(): Promise<Set<string>> {
    const referencedFiles = new Set<string>();

    // Check project_images
    const { data: projectImages } = await supabase
      .from('project_images')
      .select('url');

    projectImages?.forEach(img => {
      if (img.url?.includes('/storage/v1/object/public/media/')) {
        const path = img.url.split('/storage/v1/object/public/media/')[1];
        if (path) referencedFiles.add(decodeURIComponent(path));
      }
    });

    // Check pages
    const { data: pages } = await supabase
      .from('pages')
      .select('body');

    pages?.forEach(page => {
      if (page.body && typeof page.body === 'object') {
        const pageBody = page.body as any;
        if (pageBody.sections && Array.isArray(pageBody.sections)) {
          pageBody.sections.forEach((section: any) => {
            if (section.data) {
              const checkImageField = (field: any) => {
                if (typeof field === 'string' && field.includes('/storage/v1/object/public/media/')) {
                  const path = field.split('/storage/v1/object/public/media/')[1];
                  if (path) referencedFiles.add(decodeURIComponent(path));
                } else if (field?.src?.includes('/storage/v1/object/public/media/')) {
                  const path = field.src.split('/storage/v1/object/public/media/')[1];
                  if (path) referencedFiles.add(decodeURIComponent(path));
                }
              };
              checkImageField(section.data.image);
              checkImageField(section.data.backgroundImage);
            }
          });
        }
      }
    });

    // Check blog posts (hero_url doesn't exist in current schema, so skip it)
    const { data: blogPosts } = await supabase
      .from('blog_posts')
      .select('body');

    blogPosts?.forEach(post => {
      if (post.body) {
        const bodyStr = JSON.stringify(post.body);
        const mediaMatches = bodyStr.match(/\/storage\/v1\/object\/public\/media\/([^"')\s]+)/g);
        mediaMatches?.forEach(match => {
          const path = match.split('/storage/v1/object/public/media/')[1];
          if (path) referencedFiles.add(decodeURIComponent(path));
        });
      }
    });

    return referencedFiles;
  },

  async deleteMediaFile(filePath: string): Promise<void> {
    // Check if file is referenced
    const referencedFiles = await this.getReferencedFiles();
    if (referencedFiles.has(filePath)) {
      throw new Error('Cannot delete referenced file. Remove all references first.');
    }

    const { error } = await supabase.storage
      .from('media')
      .remove([filePath]);

    if (error) throw error;
  },

  async getLatestOrphanScan(): Promise<{
    timestamp: string;
    totalFiles: number;
    referencedFiles: number;
    orphanedCount: number;
    orphanedFiles: string[];
  } | null> {
    const { data, error } = await supabase
      .from('logs_app_events')
      .select('ts, meta')
      .eq('area', 'storage-orphan-scan')
      .order('ts', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) return null;

    const meta = data.meta as any;
    return {
      timestamp: data.ts,
      totalFiles: meta?.total_files || 0,
      referencedFiles: meta?.referenced_files || 0,
      orphanedCount: meta?.orphaned_count || 0,
      orphanedFiles: meta?.orphaned_files || []
    };
  },

  // Blog Categories CRUD
  async getAllBlogCategories(): Promise<BlogCategory[]> {
    const { data, error } = await supabase
      .from('blog_categories')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) throw error;
    return (data || []).map(item => ({
      ...item,
      status: item.status as 'draft' | 'published'
    }));
  },

  async createBlogCategory(category: Omit<BlogCategory, 'id' | 'created_at' | 'updated_at'>): Promise<BlogCategory> {
    const { data, error } = await supabase
      .from('blog_categories')
      .insert(category)
      .select()
      .single();
    
    if (error) throw error;
    return {
      ...data,
      status: data.status as 'draft' | 'published'
    };
  },

  async updateBlogCategory(id: string, updates: Partial<BlogCategory>): Promise<BlogCategory> {
    const { data, error } = await supabase
      .from('blog_categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return {
      ...data,
      status: data.status as 'draft' | 'published'
    };
  },

  async deleteBlogCategory(id: string): Promise<void> {
    const { error } = await supabase
      .from('blog_categories')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // FAQs CRUD
  async getAllFAQs(): Promise<FAQ[]> {
    const { data, error } = await supabase
      .from('faqs')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return (data || []).map(item => ({
      ...item,
      status: item.status as 'draft' | 'published'
    }));
  },

  async createFAQ(faq: Omit<FAQ, 'id' | 'created_at' | 'updated_at'>): Promise<FAQ> {
    const { data, error } = await supabase
      .from('faqs')
      .insert(faq)
      .select()
      .single();
    
    if (error) throw error;
    return {
      ...data,
      status: data.status as 'draft' | 'published'
    };
  },

  async updateFAQ(id: string, updates: Partial<FAQ>): Promise<FAQ> {
    const { data, error } = await supabase
      .from('faqs')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return {
      ...data,
      status: data.status as 'draft' | 'published'
    };
  },

  async deleteFAQ(id: string): Promise<void> {
    const { error } = await supabase
      .from('faqs')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Export CSV
  exportToCSV,

  async triggerOrphanScan(): Promise<void> {
    const { error } = await supabase.functions.invoke('storage-orphan-scan', {
      body: { manual_trigger: true }
    });

    if (error) throw error;
  },

  async getProjectImages(projectId: string): Promise<ProjectImage[]> {
    const { data, error } = await supabase
      .from('project_images')
      .select('*')
      .eq('project_id', projectId)
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async addProjectImage(projectId: string, url: string, alt?: string, sortOrder?: number): Promise<void> {
    const { error } = await supabase
      .from('project_images')
      .insert({
        project_id: projectId,
        url,
        alt,
        sort_order: sortOrder || 0,
      });

    if (error) throw error;
  },

  async updateProjectImageOrder(imageId: string, sortOrder: number): Promise<void> {
    const { error } = await supabase
      .from('project_images')
      .update({ sort_order: sortOrder })
      .eq('id', imageId);

    if (error) throw error;
  },

  async deleteProjectImage(imageId: string): Promise<void> {
    const { error } = await supabase
      .from('project_images')
      .delete()
      .eq('id', imageId);

    if (error) throw error;
  },
};

// CSV Export utility
export function exportToCSV(data: any[], filename: string) {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Escape values that contain commas or quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value || '';
      }).join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}