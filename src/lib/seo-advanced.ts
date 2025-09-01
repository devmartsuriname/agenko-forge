// Advanced SEO utilities and generators

interface SitemapEntry {
  url: string;
  lastModified?: string;
  changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

interface BreadcrumbItem {
  name: string;
  url: string;
}

// Generate structured data for breadcrumbs
export const generateBreadcrumbStructuredData = (breadcrumbs: BreadcrumbItem[]) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: crumb.url,
    })),
  };
};

// Generate FAQ structured data
export const generateFAQStructuredData = (faqs: Array<{ question: string; answer: string }>) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
};

// Generate Local Business structured data
export const generateLocalBusinessStructuredData = () => {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': 'https://devmart.sr/#business',
    name: 'Devmart',
    description: 'Leading technology company delivering innovative solutions',
    url: 'https://devmart.sr',
    telephone: '+555-759-9854',
    email: 'info@devmart.sr',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '6801 Hollywood Blvd',
      addressLocality: 'Los Angeles',
      addressRegion: 'CA',
      postalCode: '90028',
      addressCountry: 'US',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: '34.1026',
      longitude: '-118.3287',
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '09:00',
        closes: '18:00',
      },
    ],
    sameAs: [
      'https://twitter.com/devmart',
      'https://linkedin.com/company/devmart',
      'https://facebook.com/devmart',
    ],
  };
};

// Generate Service structured data
export const generateServiceStructuredData = (service: {
  name: string;
  description: string;
  category?: string;
  price?: string;
}) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.name,
    description: service.description,
    category: service.category || 'Technology Services',
    provider: {
      '@type': 'Organization',
      name: 'Devmart',
      url: 'https://devmart.sr',
    },
    serviceType: 'Digital Technology Service',
    ...(service.price && {
      offers: {
        '@type': 'Offer',
        price: service.price,
        priceCurrency: 'USD',
      },
    }),
  };
};

// Generate Product structured data for case studies
export const generateCaseStudyStructuredData = (caseStudy: {
  title: string;
  description: string;
  industry: string;
  client?: string;
  results?: Array<{ metric: string; value: string }>;
}) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: caseStudy.title,
    description: caseStudy.description,
    about: {
      '@type': 'Thing',
      name: caseStudy.industry,
    },
    author: {
      '@type': 'Organization',
      name: 'Devmart',
    },
    ...(caseStudy.client && {
      sponsor: {
        '@type': 'Organization',
        name: caseStudy.client,
      },
    }),
  };
};

// Generate WebSite structured data with search action
export const generateWebsiteStructuredData = () => {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': 'https://devmart.sr/#website',
    name: 'Devmart',
    description: 'Technology solutions for Caribbean and global markets',
    url: 'https://devmart.sr',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://devmart.sr/search?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Devmart',
      logo: {
        '@type': 'ImageObject',
        url: 'https://devmart.sr/logo.png',
      },
    },
  };
};

// Sitemap generator
export class SitemapGenerator {
  private entries: SitemapEntry[] = [];

  addEntry(entry: SitemapEntry) {
    this.entries.push(entry);
  }

  addStaticPages() {
    const staticPages = [
      { url: '/', priority: 1.0, changeFrequency: 'weekly' as const },
      { url: '/about', priority: 0.8, changeFrequency: 'monthly' as const },
      { url: '/services', priority: 0.9, changeFrequency: 'weekly' as const },
      { url: '/portfolio', priority: 0.8, changeFrequency: 'weekly' as const },
      { url: '/blog', priority: 0.7, changeFrequency: 'daily' as const },
      { url: '/case-studies', priority: 0.8, changeFrequency: 'weekly' as const },
      { url: '/pricing', priority: 0.7, changeFrequency: 'monthly' as const },
      { url: '/contact', priority: 0.6, changeFrequency: 'monthly' as const },
      { url: '/get-quote', priority: 0.9, changeFrequency: 'monthly' as const },
      { url: '/faq', priority: 0.5, changeFrequency: 'monthly' as const },
    ];

    staticPages.forEach(page => {
      this.addEntry({
        url: `https://devmart.sr${page.url}`,
        priority: page.priority,
        changeFrequency: page.changeFrequency,
        lastModified: new Date().toISOString(),
      });
    });
  }

  generateXML(): string {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${this.entries.map(entry => `  <url>
    <loc>${entry.url}</loc>
    ${entry.lastModified ? `<lastmod>${entry.lastModified}</lastmod>` : ''}
    ${entry.changeFrequency ? `<changefreq>${entry.changeFrequency}</changefreq>` : ''}
    ${entry.priority ? `<priority>${entry.priority}</priority>` : ''}
  </url>`).join('\n')}
</urlset>`;
    
    return xml;
  }
}

// Robots.txt generator
export const generateRobotsTxt = (sitemapUrl?: string): string => {
  return `User-agent: *
Allow: /

# Crawl-delay for better server performance
Crawl-delay: 1

# Block admin and api paths
Disallow: /admin/
Disallow: /api/

# Block search result pages to avoid duplicate content
Disallow: /search?*

# Allow important assets
Allow: /assets/
Allow: /images/
Allow: /*.css$
Allow: /*.js$

${sitemapUrl ? `Sitemap: ${sitemapUrl}` : 'Sitemap: https://devmart.sr/sitemap.xml'}`;
};

// Meta tags optimizer
export const optimizeMetaTags = (content: string): Array<{ name: string; content: string }> => {
  const wordCount = content.split(' ').length;
  const readingTime = Math.ceil(wordCount / 200); // 200 WPM average
  
  return [
    { name: 'reading-time', content: `${readingTime} min read` },
    { name: 'word-count', content: wordCount.toString() },
    { name: 'content-language', content: 'en-US' },
    { name: 'theme-color', content: '#A1FF4C' }, // Agenko green
    { name: 'msapplication-TileColor', content: '#161A1E' }, // Agenko dark
  ];
};

// Social media meta tags generator
export const generateSocialMetaTags = (data: {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: string;
}) => {
  const baseUrl = 'https://devmart.sr';
  
  return {
    // Open Graph
    'og:title': data.title,
    'og:description': data.description,
    'og:image': data.image || `${baseUrl}/og-image.jpg`,
    'og:url': data.url || baseUrl,
    'og:type': data.type || 'website',
    'og:site_name': 'Devmart',
    'og:locale': 'en_US',
    
    // Twitter
    'twitter:card': 'summary_large_image',
    'twitter:site': '@devmart',
    'twitter:creator': '@devmart',
    'twitter:title': data.title,
    'twitter:description': data.description,
    'twitter:image': data.image || `${baseUrl}/og-image.jpg`,
    
    // LinkedIn
    'linkedin:owner-id': 'devmart-company',
  };
};