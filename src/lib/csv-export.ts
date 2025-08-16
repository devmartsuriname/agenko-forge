// Enhanced CSV export utility with UTF-8 BOM support
export function exportToCSV(data: any[], filename: string, options: {
  includeTimestamp?: boolean;
  customHeaders?: string[];
} = {}) {
  if (data.length === 0) {
    throw new Error('No data to export');
  }

  const { includeTimestamp = true, customHeaders } = options;
  
  // Get headers from first data object or use custom headers
  const headers = customHeaders || Object.keys(data[0]);
  
  // Create CSV content with proper escaping
  const csvContent = [
    // Header row
    headers.join(','),
    // Data rows
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        
        // Handle null/undefined values
        if (value === null || value === undefined) {
          return '';
        }
        
        // Convert to string
        const stringValue = String(value);
        
        // Escape values that contain commas, quotes, or newlines
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        
        return stringValue;
      }).join(',')
    )
  ].join('\n');

  // Add UTF-8 BOM for proper encoding
  const BOM = '\uFEFF';
  const csvWithBOM = BOM + csvContent;
  
  // Generate filename with timestamp if requested
  let finalFilename = filename;
  if (includeTimestamp) {
    const now = new Date();
    const timestamp = now.toISOString().split('T')[0].replace(/-/g, ''); // YYYYMMDD
    const extension = filename.split('.').pop();
    const baseName = filename.replace(`.${extension}`, '');
    finalFilename = `${baseName}_${timestamp}.${extension}`;
  }

  // Create and trigger download
  const blob = new Blob([csvWithBOM], { 
    type: 'text/csv;charset=utf-8;' 
  });
  
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = finalFilename;
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up object URL
  URL.revokeObjectURL(link.href);
  
  return finalFilename;
}

// Chunked export for large datasets
export async function exportLargeCSV(
  dataFetcher: (offset: number, limit: number) => Promise<any[]>,
  totalCount: number,
  filename: string,
  options: {
    chunkSize?: number;
    onProgress?: (progress: number) => void;
    customHeaders?: string[];
  } = {}
) {
  const { chunkSize = 1000, onProgress, customHeaders } = options;
  
  let allData: any[] = [];
  let offset = 0;
  
  while (offset < totalCount) {
    const chunk = await dataFetcher(offset, chunkSize);
    allData = allData.concat(chunk);
    offset += chunkSize;
    
    if (onProgress) {
      const progress = Math.min((offset / totalCount) * 100, 100);
      onProgress(progress);
    }
  }
  
  return exportToCSV(allData, filename, { customHeaders });
}

// Specific export functions for admin data
export const adminExports = {
  contactSubmissions: (submissions: any[]) => {
    const headers = ['id', 'name', 'email', 'subject', 'created_at'];
    return exportToCSV(submissions, 'contact_submissions.csv', { customHeaders: headers });
  },
  
  projects: (projects: any[]) => {
    const headers = ['id', 'title', 'slug', 'status', 'published_at', 'created_at'];
    return exportToCSV(projects, 'projects.csv', { customHeaders: headers });
  },
  
  blogPosts: (posts: any[]) => {
    const headers = ['id', 'title', 'slug', 'status', 'tags', 'published_at', 'created_at'];
    return exportToCSV(posts, 'blog_posts.csv', { customHeaders: headers });
  },
  
  services: (services: any[]) => {
    const headers = ['id', 'title', 'slug', 'status', 'published_at', 'created_at'];
    return exportToCSV(services, 'services.csv', { customHeaders: headers });
  }
};