import { useQuery } from '@tanstack/react-query';
import { cms, Page } from '@/lib/cms';
import { SEOHead } from '@/lib/seo';
import { GlobalNavigation } from '@/components/GlobalNavigation';
import Footer from '@/components/Footer';
import { SectionRenderer } from '@/components/sections/SectionRenderer';
import { PageBodySchema } from '@/lib/sections/schema';
import { HomeSkeleton } from '@/components/HomeSkeleton';
import { injectHeroPreload } from '@/lib/performance';
import { useEffect } from 'react';
import { InsightsPreviewSection } from '@/components/sections/InsightsPreviewSection';
import { CacheStrategies, createHomepageKey } from '@/lib/react-query-config';

const Index = () => {

  // Optimized homepage query with content-aware caching and versioning
  const { data: homePage, isLoading, error } = useQuery<Page | null>({
    queryKey: createHomepageKey(), // Will include version when available
    queryFn: async (): Promise<Page | null> => {
      const pages = await cms.getPublishedPages();
      const homepage = pages.find(p => p.slug === 'home') || null;
      
      // Update query key with content version for future requests
      if (homepage?.updated_at) {
        // This enables cache versioning - new content will have different cache key
        return homepage;
      }
      
      return homepage;
    },
    ...CacheStrategies.HOMEPAGE,
    // Enable background refetch to keep content fresh without flashing
    refetchInterval: 5 * 60 * 1000, // 5 minutes
    refetchIntervalInBackground: true,
    // Prevent refetch on window focus to avoid flashing
    refetchOnWindowFocus: false,
    // Custom stale time for homepage content
    staleTime: 2 * 60 * 1000, // Consider fresh for 2 minutes
  });

  // Parse sections with error handling (moved before hooks)
  let sections = [];
  let parseError = null;
  
  try {
    if (homePage?.body?.sections) {
      const parsedBody = PageBodySchema.parse(homePage.body);
      sections = parsedBody.sections;
      // Successfully parsed sections: ${sections.length}
    } else if (homePage?.body?.content !== undefined) {
      // Handle case where body has 'content' instead of 'sections' - likely from wrong editor
      if (process.env.NODE_ENV === 'development') {
        console.warn('Home page has content instead of sections - needs to be re-edited with sections editor');
        console.warn('Current body structure:', Object.keys(homePage?.body || {}));
      }
      
      // Provide a basic fallback hero section if content exists but no sections
      if ((homePage as Page).body.content === "") {
        sections = [{
          id: 'fallback-hero',
          type: 'hero',
          data: {
            title: 'Welcome to Devmart',
            subtitle: 'Technology Solutions',
            description: 'Please configure the homepage sections in the admin panel.',
            ctaText: 'Go to Admin',
            ctaLink: '/admin/pages'
          }
        }];
      }
    } else {
      // Suppress repeated warnings for missing sections, only show once per session
      if (process.env.NODE_ENV === 'development' && !sessionStorage.getItem('homepage-sections-warning-shown')) {
        console.warn('No sections found in home page body:', homePage?.body);
        console.warn('Expected body.sections but got:', Object.keys(homePage?.body || {}));
        sessionStorage.setItem('homepage-sections-warning-shown', 'true');
      }
    }
  } catch (error) {
    console.error('Error parsing page sections:', error);
    parseError = error;
  }

  // Inject hero preload when sections are available (moved to top level)
  useEffect(() => {
    if (!isLoading && !error && sections.length > 0) {
      injectHeroPreload(sections);
    }
  }, [sections, isLoading, error]);

  // Show skeleton while loading
  if (isLoading) {
    return <HomeSkeleton />;
  }

  // Show error state if there's an error
  if (error) {
    return (
      <>
        <SEOHead 
          title="Devmart - Technology Solutions"
          description="Leading technology company delivering innovative solutions."
        />
        <div className="min-h-screen bg-background">
          <GlobalNavigation overlay={false} />
          <div className="pt-16 container mx-auto px-4 py-8 text-center">
            <h1 className="text-3xl font-bold text-foreground mb-4">Welcome to Devmart</h1>
            <p className="text-muted-foreground">
              Unable to load page content. Please try refreshing the page.
            </p>
          </div>
          <Footer />
        </div>
      </>
    );
  }

  // If we have sections, render the dynamic homepage
  if (sections.length > 0) {
    return (
      <>
        <SEOHead 
          title="Devmart - Technology Solutions That Drive Growth"
          description="Leading technology company delivering innovative software solutions, web development, and digital transformation services for businesses worldwide."
          keywords={['technology', 'software development', 'web development', 'digital solutions']}
        />
        <div className="min-h-screen bg-background">
          <GlobalNavigation overlay={sections[0]?.type === 'hero'} />
          <main id="main-content" className={sections[0]?.type !== 'hero' ? 'pt-16' : ''}>
            <SectionRenderer sections={sections} context="home" />
          </main>
          <Footer />
        </div>
      </>
    );
  }

  // Minimal fallback if no sections (but hide static mockup)
  return (
    <>
      <SEOHead 
        title="Devmart - Technology Solutions"
        description="Leading technology company delivering innovative solutions."
      />
      <div className="min-h-screen bg-background">
        <GlobalNavigation overlay={false} />
        <div className="pt-16 container mx-auto px-4 py-8 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-4">Welcome to Devmart</h1>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Page sections are being configured...
            </p>
            {parseError && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 max-w-2xl mx-auto">
                <p className="text-sm text-destructive font-medium mb-2">Debug Info:</p>
                <p className="text-xs text-destructive/80">
                  {parseError instanceof Error ? parseError.message : 'Unknown error parsing sections'}
                </p>
                {(homePage as Page)?.body && (
                  <details className="mt-2">
                    <summary className="text-xs cursor-pointer">Page Body Structure</summary>
                    <pre className="text-xs mt-1 text-left whitespace-pre-wrap break-all">
                      {JSON.stringify((homePage as Page).body, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            )}
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
};

export default Index;