// Shared utilities for admin CRUD operations
import { supabase } from '@/integrations/supabase/client';

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim();
}

export async function ensureUniqueSlug(
  table: 'services' | 'projects' | 'blog_posts' | 'pages', 
  baseSlug: string, 
  excludeId?: string
): Promise<string> {
  let slug = baseSlug;
  let counter = 2;
  
  while (true) {
    let query = supabase
      .from(table)
      .select('id')
      .eq('slug', slug);
      
    if (excludeId) {
      query = query.neq('id', excludeId);
    }
    
    const { data } = await query.limit(1);
    
    if (!data || data.length === 0) {
      return slug;
    }
    
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

export function formatDate(date: string | null): string {
  if (!date) return 'Not published';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function getStatusBadgeVariant(status: string) {
  switch (status) {
    case 'published': return 'default';
    case 'draft': return 'secondary';
    default: return 'outline';
  }
}