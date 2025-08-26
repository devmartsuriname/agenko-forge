import { useQuery } from '@tanstack/react-query';
import { cms } from '@/lib/cms';
import { supabase } from '@/integrations/supabase/client';

interface SitemapUrl {
  loc: string;
  lastmod: string;
  changefreq: string;
  priority: string;
}

const Sitemap = () => {
  const { data: sitemapData, isLoading } = useQuery({
    queryKey: ['sitemap'],
    queryFn: async (): Promise<SitemapUrl[]> => {
      const urls: SitemapUrl[] = [];
      const baseUrl = 'https://agenko.lovable.app';

      // Static pages
      const staticPages = [
        { path: '', priority: '1.0', changefreq: 'weekly' },
        { path: '/about', priority: '0.8', changefreq: 'monthly' },
        { path: '/services', priority: '0.9', changefreq: 'weekly' },
        { path: '/portfolio', priority: '0.9', changefreq: 'weekly' },
        { path: '/blog', priority: '0.9', changefreq: 'daily' },
        { path: '/pricing', priority: '0.8', changefreq: 'monthly' },
        { path: '/contact', priority: '0.7', changefreq: 'monthly' },
        { path: '/get-quote', priority: '0.8', changefreq: 'monthly' },
        { path: '/faq', priority: '0.7', changefreq: 'monthly' },
        { path: '/privacy-policy', priority: '0.3', changefreq: 'yearly' },
        { path: '/terms-conditions', priority: '0.3', changefreq: 'yearly' },
      ];

      staticPages.forEach(page => {
        urls.push({
          loc: baseUrl + page.path,
          lastmod: new Date().toISOString().split('T')[0],
          changefreq: page.changefreq,
          priority: page.priority
        });
      });

      try {
        // Blog posts
        const blogPosts = await cms.getPublishedBlogPosts();
        blogPosts.forEach(post => {
          urls.push({
            loc: `${baseUrl}/blog/${post.slug}`,
            lastmod: new Date(post.updated_at || post.published_at || post.created_at).toISOString().split('T')[0],
            changefreq: 'monthly',
            priority: '0.6'
          });
        });

        // Blog categories
        const { data: categories } = await supabase
          .from('blog_categories')
          .select('slug, updated_at')
          .eq('status', 'published');
        
        categories?.forEach(category => {
          urls.push({
            loc: `${baseUrl}/blog/category/${category.slug}`,
            lastmod: new Date(category.updated_at).toISOString().split('T')[0],
            changefreq: 'weekly',
            priority: '0.7'
          });
        });

        // Projects
        const projects = await cms.getPublishedProjects();
        projects.forEach(project => {
          urls.push({
            loc: `${baseUrl}/portfolio/${project.slug}`,
            lastmod: new Date(project.updated_at || project.published_at || project.created_at).toISOString().split('T')[0],
            changefreq: 'monthly',
            priority: '0.6'
          });
        });

        // Services
        const services = await cms.getPublishedServices();
        services.forEach(service => {
          urls.push({
            loc: `${baseUrl}/services/${service.slug}`,
            lastmod: new Date(service.updated_at || service.published_at || service.created_at).toISOString().split('T')[0],
            changefreq: 'monthly',
            priority: '0.7'
          });
        });

      } catch (error) {
        console.error('Error generating sitemap:', error);
      }

      return urls.sort((a, b) => parseFloat(b.priority) - parseFloat(a.priority));
    }
  });

  if (isLoading) {
    return (
      <div style={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
        Generating sitemap...
      </div>
    );
  }

  const generateXMLSitemap = (urls: SitemapUrl[]) => {
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`;
  };

  const xmlContent = sitemapData ? generateXMLSitemap(sitemapData) : '';

  return (
    <div style={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap', padding: '20px' }}>
      {xmlContent}
    </div>
  );
};

export default Sitemap;