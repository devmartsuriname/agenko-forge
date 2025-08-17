import { useQuery } from '@tanstack/react-query';
import { cms } from '@/lib/cms';
import { SEOHead } from '@/lib/seo';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { SectionRenderer } from '@/components/sections/SectionRenderer';
import { PageBodySchema } from '@/lib/sections/schema';
import { Skeleton } from '@/components/ui/skeleton';

export default function HomePage() {
  const { data: page, isLoading, error } = useQuery({
    queryKey: ['homepage'],
    queryFn: async () => {
      const pages = await cms.getPublishedPages();
      return pages.find(p => p.slug === 'home') || null;
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-16">
          <Skeleton className="h-96 w-full" />
          <div className="container mx-auto px-4 py-8 space-y-8">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-16 container mx-auto px-4 py-8 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-4">Welcome to Devmart</h1>
          <p className="text-muted-foreground">
            {error ? 'Error loading page content' : 'Homepage content not found'}
          </p>
        </div>
        <Footer />
      </div>
    );
  }

  // Parse sections from page body
  let sections = [];
  try {
    if (page.body?.sections) {
      const parsedBody = PageBodySchema.parse(page.body);
      sections = parsedBody.sections;
    }
  } catch (error) {
    console.error('Error parsing page sections:', error);
  }

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
          {sections.length > 0 ? (
            <SectionRenderer sections={sections} context="home" />
          ) : (
            <div className="container mx-auto px-4 py-8 text-center">
              <h1 className="text-3xl font-bold text-foreground mb-4">Welcome to Devmart</h1>
              <p className="text-muted-foreground">Homepage sections are being configured...</p>
            </div>
          )}
        </main>
        <Footer />
      </div>
    </>
  );
}