import { useQuery } from '@tanstack/react-query';
import { cms } from '@/lib/cms';
import { SEOHead } from '@/lib/seo';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { SectionRenderer } from '@/components/sections/SectionRenderer';
import { PageBodySchema } from '@/lib/sections/schema';
import { HomeSkeleton } from '@/components/HomeSkeleton';

const Index = () => {

  const { data: homePage, isLoading, error } = useQuery({
    queryKey: ['homepage'],
    queryFn: async () => {
      const pages = await cms.getPublishedPages();
      return pages.find(p => p.slug === 'home') || null;
    },
  });

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

  // Parse sections with error handling
  let sections = [];
  try {
    if (homePage?.body?.sections) {
      const parsedBody = PageBodySchema.parse(homePage.body);
      sections = parsedBody.sections;
    }
  } catch (parseError) {
    console.error('Error parsing page sections:', parseError);
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
          <Navigation />
          <main className="pt-16">
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
          <p className="text-muted-foreground">
            Page sections are being configured...
          </p>
        </div>
        <Footer />
      </div>
    </>
  );
};

export default Index;