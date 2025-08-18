import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface StorageObject {
  name: string;
  id: string;
  updated_at: string;
  created_at: string;
  last_accessed_at: string | null;
  metadata: {
    eTag: string;
    size: number;
    mimetype: string;
    cacheControl: string;
    lastModified: string;
    contentLength: number;
    httpStatusCode: number;
  };
}

interface OrphanScanResult {
  totalFiles: number;
  referencedFiles: number;
  orphanedFiles: string[];
  scanDuration: number;
  timestamp: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const startTime = Date.now();
    const timestamp = new Date().toISOString();
    
    console.log(`[${timestamp}] Starting storage orphan scan`);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get all files from media bucket
    const { data: storageFiles, error: storageError } = await supabase.storage
      .from('media')
      .list('', {
        limit: 1000,
        offset: 0,
        sortBy: { column: 'name', order: 'asc' }
      });

    if (storageError) {
      throw new Error(`Failed to list storage files: ${storageError.message}`);
    }

    console.log(`Found ${storageFiles?.length || 0} files in storage`);

    // Collect all files recursively (including subdirectories)
    const allFiles: string[] = [];
    
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
              sortBy: { column: 'name', order: 'asc' }
            });
          
          if (subFiles) {
            await collectFiles(fullPath, subFiles);
          }
        } else {
          // This is a file
          allFiles.push(fullPath);
        }
      }
    }

    await collectFiles();
    console.log(`Total files found (including subdirectories): ${allFiles.length}`);

    // Get all referenced files from database
    const referencedFiles = new Set<string>();

    // 1. Check project_images table
    const { data: projectImages, error: projectImagesError } = await supabase
      .from('project_images')
      .select('url');

    if (projectImagesError) {
      console.error('Error fetching project images:', projectImagesError);
    } else {
      projectImages?.forEach(img => {
        const url = img.url;
        if (url && url.includes('/storage/v1/object/public/media/')) {
          const path = url.split('/storage/v1/object/public/media/')[1];
          if (path) {
            referencedFiles.add(decodeURIComponent(path));
          }
        }
      });
    }

    // 2. Check pages for section images
    const { data: pages, error: pagesError } = await supabase
      .from('pages')
      .select('body');

    if (pagesError) {
      console.error('Error fetching pages:', pagesError);
    } else {
      pages?.forEach(page => {
        if (page.body && typeof page.body === 'object') {
          const pageBody = page.body as any;
          if (pageBody.sections && Array.isArray(pageBody.sections)) {
            pageBody.sections.forEach((section: any) => {
              if (section.data) {
                // Check various image fields in sections
                const checkImageField = (field: any) => {
                  if (typeof field === 'string' && field.includes('/storage/v1/object/public/media/')) {
                    const path = field.split('/storage/v1/object/public/media/')[1];
                    if (path) {
                      referencedFiles.add(decodeURIComponent(path));
                    }
                  } else if (typeof field === 'object' && field?.src) {
                    if (field.src.includes('/storage/v1/object/public/media/')) {
                      const path = field.src.split('/storage/v1/object/public/media/')[1];
                      if (path) {
                        referencedFiles.add(decodeURIComponent(path));
                      }
                    }
                  }
                };

                // Check common image fields
                checkImageField(section.data.image);
                checkImageField(section.data.backgroundImage);
              }
            });
          }
        }
      });
    }

    // 3. Check blog_posts for any image references
    const { data: blogPosts, error: blogError } = await supabase
      .from('blog_posts')
      .select('body');

    if (blogError) {
      console.error('Error fetching blog posts:', blogError);
    } else {
      blogPosts?.forEach(post => {
        if (post.body) {
          const bodyStr = JSON.stringify(post.body);
          const mediaMatches = bodyStr.match(/\/storage\/v1\/object\/public\/media\/([^"')\s]+)/g);
          mediaMatches?.forEach(match => {
            const path = match.split('/storage/v1/object/public/media/')[1];
            if (path) {
              referencedFiles.add(decodeURIComponent(path));
            }
          });
        }
      });
    }

    // 4. Check services for any image references
    const { data: services, error: servicesError } = await supabase
      .from('services')
      .select('content');

    if (servicesError) {
      console.error('Error fetching services:', servicesError);
    } else {
      services?.forEach(service => {
        if (service.content) {
          const contentStr = JSON.stringify(service.content);
          const mediaMatches = contentStr.match(/\/storage\/v1\/object\/public\/media\/([^"')\s]+)/g);
          mediaMatches?.forEach(match => {
            const path = match.split('/storage/v1/object/public/media/')[1];
            if (path) {
              referencedFiles.add(decodeURIComponent(path));
            }
          });
        }
      });
    }

    // 5. Check projects for any image references in body
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('body');

    if (projectsError) {
      console.error('Error fetching projects:', projectsError);
    } else {
      projects?.forEach(project => {
        if (project.body) {
          const bodyStr = JSON.stringify(project.body);
          const mediaMatches = bodyStr.match(/\/storage\/v1\/object\/public\/media\/([^"')\s]+)/g);
          mediaMatches?.forEach(match => {
            const path = match.split('/storage/v1/object/public/media/')[1];
            if (path) {
              referencedFiles.add(decodeURIComponent(path));
            }
          });
        }
      });
    }

    console.log(`Referenced files found: ${referencedFiles.size}`);

    // Find orphaned files
    const orphanedFiles = allFiles.filter(file => !referencedFiles.has(file));
    
    const scanDuration = Date.now() - startTime;
    
    const result: OrphanScanResult = {
      totalFiles: allFiles.length,
      referencedFiles: referencedFiles.size,
      orphanedFiles,
      scanDuration,
      timestamp
    };

    console.log(`Scan completed in ${scanDuration}ms`);
    console.log(`Total files: ${result.totalFiles}`);
    console.log(`Referenced files: ${result.referencedFiles}`);
    console.log(`Orphaned files: ${result.orphanedFiles.length}`);

    // Log the scan results
    const { error: logError } = await supabase
      .from('logs_app_events')
      .insert({
        level: 'info',
        area: 'storage-orphan-scan',
        message: `Storage orphan scan completed: ${result.orphanedFiles.length} orphaned files found out of ${result.totalFiles} total files`,
        meta: {
          total_files: result.totalFiles,
          referenced_files: result.referencedFiles,
          orphaned_count: result.orphanedFiles.length,
          scan_duration_ms: result.scanDuration,
          orphaned_files: result.orphanedFiles.slice(0, 50), // Limit to first 50 to avoid log size issues
          scan_timestamp: result.timestamp
        }
      });

    if (logError) {
      console.error('Failed to log scan results:', logError);
    }

    // If there are orphaned files, log them in chunks if there are many
    if (result.orphanedFiles.length > 0) {
      const chunks = [];
      for (let i = 0; i < result.orphanedFiles.length; i += 100) {
        chunks.push(result.orphanedFiles.slice(i, i + 100));
      }

      for (let i = 0; i < chunks.length; i++) {
        const { error: chunkLogError } = await supabase
          .from('logs_app_events')
          .insert({
            level: 'info',
            area: 'storage-orphan-scan-detail',
            message: `Orphaned files chunk ${i + 1}/${chunks.length}`,
            meta: {
              chunk_number: i + 1,
              total_chunks: chunks.length,
              files: chunks[i],
              scan_timestamp: result.timestamp
            }
          });

        if (chunkLogError) {
          console.error(`Failed to log chunk ${i + 1}:`, chunkLogError);
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        result
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Error in storage-orphan-scan function:', error);
    
    // Log the error
    try {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      await supabase
        .from('logs_app_events')
        .insert({
          level: 'error',
          area: 'storage-orphan-scan',
          message: `Storage orphan scan failed: ${error.message}`,
          meta: {
            error: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString()
          }
        });
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'An unexpected error occurred'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});