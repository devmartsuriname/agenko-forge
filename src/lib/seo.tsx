import { Helmet } from 'react-helmet-async';

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
}: SEOProps) {
  const siteName = 'Agenko Digital Agency';
  const defaultDescription = 'Innovative marketing solutions for business growth. A leading digital agency specializing in creative solutions that drive business growth, enhance brand visibility, and increase customer engagement.';
  const defaultKeywords = ['digital marketing', 'web design', 'branding', 'business growth', 'marketing agency'];
  
  const fullTitle = title ? `${title} | ${siteName}` : siteName;
  const seoDescription = description || defaultDescription;
  const seoKeywords = [...keywords, ...defaultKeywords].join(', ');
  const currentUrl = url || typeof window !== 'undefined' ? window.location.href : '';
  const seoImage = image || '/og-image.jpg'; // Default OG image
  const storageOrigin = 'https://dvgubqqjvmsepkilnkak.supabase.co';

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
      email: 'info@agenko.com'
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
      'https://twitter.com/agenko',
      'https://linkedin.com/company/agenko',
      'https://facebook.com/agenko'
    ]
  };

  const schemas: any[] = [organizationSchema];

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
      <meta name="robots" content="index, follow" />
      
      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={seoDescription} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:image" content={seoImage} />
      <meta property="og:image:alt" content={title || siteName} />
      <meta property="og:site_name" content={siteName} />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@agenko" />
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
      <link rel="canonical" href={currentUrl} />
      
      {/* Preconnect to Storage for faster image loading */}
      <link rel="preconnect" href={storageOrigin} crossOrigin="anonymous" />
      
      {/* JSON-LD Schema */}
      {schemas.map((schema, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
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