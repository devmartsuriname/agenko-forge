import { Helmet } from 'react-helmet-async';
import { generateBreadcrumbStructuredData, generateWebsiteStructuredData } from './seo-advanced';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'service';
  publishedAt?: string;
  modifiedAt?: string;
  author?: string;
  tags?: string[];
  gscVerificationCode?: string;
  structuredData?: any;
  breadcrumbs?: Array<{ name: string; url: string }>;
  canonical?: string;
  noindex?: boolean;
  nofollow?: boolean;
}

export function SEOHead({
  title,
  description,
  keywords = [],
  image,
  url,
  type = 'website',
  publishedAt,
  modifiedAt,
  author,
  tags = [],
  gscVerificationCode,
  structuredData,
  breadcrumbs,
  canonical,
  noindex = false,
  nofollow = false,
}: SEOProps) {
  const siteName = 'Devmart';
  const defaultDescription = 'Innovative technology solutions for Caribbean and global markets. A leading tech company specializing in cutting-edge digital solutions, AI innovation, and reliable technology services.';
  const defaultKeywords = ['technology solutions', 'digital innovation', 'caribbean tech', 'software development', 'devmart'];
  
  const fullTitle = title ? `${title} | ${siteName}` : siteName;
  const seoDescription = description || defaultDescription;
  const seoKeywords = [...keywords, ...defaultKeywords].join(', ');
  const currentUrl = url || canonical || (typeof window !== 'undefined' ? window.location.href : '');
  const seoImage = image || '/og-image.jpg';
  const storageOrigin = 'https://dvgubqqjvmsepkilnkak.supabase.co';

  // Robots meta tag
  const robotsContent = `${noindex ? 'noindex' : 'index'}, ${nofollow ? 'nofollow' : 'follow'}`;

  // JSON-LD Schema
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteName,
    description: defaultDescription,
    url: typeof window !== 'undefined' ? window.location.origin : '',
    logo: typeof window !== 'undefined' ? `${window.location.origin}/logo.png` : '',
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+555-759-9854',
      contactType: 'customer service',
      email: 'info@devmart.sr'
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: '6801 Hollywood Blvd',
      addressLocality: 'Los Angeles',
      addressRegion: 'CA',
      postalCode: '90028',
      addressCountry: 'US'
    },
    sameAs: [
      'https://twitter.com/devmart',
      'https://linkedin.com/company/devmart',
      'https://facebook.com/devmart'
    ]
  };

  const schemas: any[] = [organizationSchema];

  // Add Website schema for homepage
  if (type === 'website' && (!title || title.includes('Devmart'))) {
    schemas.push(generateWebsiteStructuredData());
  }

  // Add Breadcrumb schema
  if (breadcrumbs && breadcrumbs.length > 1) {
    schemas.push(generateBreadcrumbStructuredData(breadcrumbs));
  }

  // Add Article schema for blog posts
  if (type === 'article' && publishedAt) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: title,
      description: seoDescription,
      image: seoImage,
      author: {
        '@type': 'Organization',
        name: siteName,
      },
      publisher: {
        '@type': 'Organization',
        name: siteName,
        logo: {
          '@type': 'ImageObject',
          url: typeof window !== 'undefined' ? `${window.location.origin}/logo.png` : '',
        },
      },
      datePublished: publishedAt,
      dateModified: modifiedAt || publishedAt,
      keywords: tags.join(', '),
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': currentUrl,
      },
    });
  }

  // Add Service schema for service pages
  if (type === 'service') {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: title,
      description: seoDescription,
      provider: {
        '@type': 'Organization',
        name: siteName,
      },
      serviceType: 'Digital Marketing Service',
    });
  }

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={seoDescription} />
      <meta name="keywords" content={seoKeywords} />
      <meta name="author" content={author || siteName} />
      
      {/* Viewport and Mobile */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="robots" content={robotsContent} />
      
      {/* Performance hints */}
      <meta name="theme-color" content="#A1FF4C" />
      <meta name="msapplication-TileColor" content="#161A1E" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      
      {/* Google Search Console Verification */}
      {gscVerificationCode && (
        <meta name="google-site-verification" content={gscVerificationCode} />
      )}
      
      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={seoDescription} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:image" content={seoImage} />
      <meta property="og:image:alt" content={title || siteName} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content="en_US" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@devmart" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={seoDescription} />
      <meta name="twitter:image" content={seoImage} />
      
      {/* Article specific */}
      {type === 'article' && publishedAt && (
        <>
          <meta property="article:published_time" content={publishedAt} />
          {modifiedAt && <meta property="article:modified_time" content={modifiedAt} />}
          {author && <meta property="article:author" content={author} />}
          {tags.map(tag => (
            <meta key={tag} property="article:tag" content={tag} />
          ))}
        </>
      )}
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonical || currentUrl} />
      
      {/* Preconnect to external domains for better performance */}
      <link rel="preconnect" href={storageOrigin} crossOrigin="anonymous" />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      
      {/* DNS prefetch for external resources */}
      <link rel="dns-prefetch" href={storageOrigin} />
      <link rel="dns-prefetch" href="https://www.google-analytics.com" />
      
      {/* JSON-LD Schema */}
      {schemas.map((schema, index) => (
        <script key={`schema-${index}`} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
      
      {/* Custom Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
}

// Utility function to extract text from JSON content
export function extractTextFromContent(content: any): string {
  if (!content || !content.blocks) return '';
  
  return content.blocks
    .filter((block: any) => block.type === 'paragraph')
    .map((block: any) => block.data?.text || '')
    .join(' ')
    .substring(0, 160);
}

// Generate meta description from content
export function generateMetaDescription(content: any, fallback: string): string {
  const extracted = extractTextFromContent(content);
  return extracted || fallback;
}