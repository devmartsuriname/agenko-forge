import { useQuery } from '@tanstack/react-query';
import { cms } from '@/lib/cms';
import { SEOHead } from '@/lib/seo';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { SectionRenderer } from '@/components/sections/SectionRenderer';
import { PageBodySchema } from '@/lib/sections/schema';
import { HomeSkeleton } from '@/components/HomeSkeleton';
import { injectHeroPreload } from '@/lib/performance';
import { useEffect } from 'react';
import { InsightsPreviewSection } from '@/components/sections/InsightsPreviewSection';

const Index = () => {

  const { data: homePage, isLoading, error } = useQuery({
    queryKey: ['homepage'],
    queryFn: async () => {
      const pages = await cms.getPublishedPages();
      return pages.find(p => p.slug === 'home') || null;
    },
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
      console.warn('Home page has content instead of sections - needs to be re-edited with sections editor');
      console.warn('Current body structure:', Object.keys(homePage?.body || {}));
      
      // Provide a basic fallback hero section if content exists but no sections
      if (homePage.body.content === "") {
        // Creating fallback hero section since content is empty
        sections = [{
          id: 'fallback-hero',
          type: 'hero',
          data: {
            title: 'Welcome to Devmart',
            subtitle: 'Technology Solutions',
            description: 'Please re-edit the homepage sections in the admin to restore full content.',
            ctaText: 'Go to Admin',
            ctaLink: '/admin/pages'
          }
        }];
      }
    } else {
      console.warn('No sections found in home page body:', homePage?.body);
      console.warn('Expected body.sections but got:', Object.keys(homePage?.body || {}));
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
          <Navigation />
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
          {/* Only show Navigation if first section is not hero (hero handles its own nav) */}
          {sections[0]?.type !== 'hero' && <Navigation />}
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
        <Navigation />
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
                {homePage?.body && (
                  <details className="mt-2">
                    <summary className="text-xs cursor-pointer">Page Body Structure</summary>
                    <pre className="text-xs mt-1 text-left whitespace-pre-wrap break-all">
                      {JSON.stringify(homePage.body, null, 2)}
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