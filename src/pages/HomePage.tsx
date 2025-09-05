import { useQuery } from '@tanstack/react-query';
import { cms, type Page } from '@/lib/cms';
import { SEOHead } from '@/lib/seo';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { SectionRenderer } from '@/components/sections/SectionRenderer';
import { PageBodySchema } from '@/lib/sections/schema';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertCircle } from 'lucide-react';

export default function HomePage() {
  const { data: page, isLoading, error, refetch } = useQuery<Page | null>({
    queryKey: ['homepage'],
    queryFn: async (): Promise<Page | null> => {
      console.log('🔍 [Homepage] Fetching published pages...');
      const pages = await cms.getPublishedPages();
      console.log('📄 [Homepage] All pages:', pages?.length || 0);
      
      const homePage = pages.find(p => p.slug === 'home');
      console.log('🏠 [Homepage] Home page found:', !!homePage);
      
      if (homePage) {
        console.log('📊 [Homepage] Home page data:', {
          id: homePage.id,
          title: homePage.title,
          slug: homePage.slug,
          status: homePage.status,
          hasBody: !!homePage.body,
          sectionsCount: homePage.body?.sections?.length || 0
        });
        console.log('🎯 [Homepage] Raw sections data:', homePage.body);
      }
      
      return homePage || null;
    },
    staleTime: 0, // Always fetch fresh data
    gcTime: 0, // Don't cache (gcTime replaces cacheTime in newer versions)
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
        <div className="pt-16 container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-foreground mb-4">Welcome to Devmart</h1>
            <p className="text-muted-foreground mb-6">
              {error ? `Error loading page content: ${error.message}` : 'Homepage content not found'}
            </p>
            <Button onClick={() => refetch()} disabled={isLoading} className="mb-8">
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh Content
            </Button>
          </div>
          
          {/* Debug Information */}
          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-sm">
            <h3 className="font-semibold mb-2">Debug Information:</h3>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Error: {error ? error.message : 'No error'}</li>
              <li>• Page Found: {page ? 'Yes' : 'No'}</li>
              <li>• Loading State: {isLoading ? 'Loading' : 'Complete'}</li>
              <li>• Check browser console for detailed logs</li>
            </ul>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Parse sections from page body
  let sections = [];
  let parseError = null;
  
  console.log('🔍 [Homepage] Starting section parsing...');
  console.log('📦 [Homepage] Page body structure:', {
    hasBody: !!page.body,
    bodyType: typeof page.body,
    hasSections: !!page.body?.sections,
    sectionsType: typeof page.body?.sections,
    sectionsIsArray: Array.isArray(page.body?.sections),
    sectionsLength: page.body?.sections?.length || 0
  });

  try {
    if (page.body?.sections) {
      console.log('✅ [Homepage] Found sections, attempting to parse...');
      console.log('📋 [Homepage] Raw sections:', page.body.sections);
      
      // First, let's try to parse the sections directly without the schema
      sections = page.body.sections;
      console.log('🎯 [Homepage] Direct sections assignment successful:', sections.length, 'sections');
      
      // Now try schema validation (but don't fail if it doesn't work)
      try {
        const parsedBody = PageBodySchema.parse(page.body);
        sections = parsedBody.sections;
        console.log('✅ [Homepage] Schema validation successful!');
      } catch (schemaError) {
        console.warn('⚠️ [Homepage] Schema validation failed, using raw sections:', schemaError);
        // Keep the raw sections we assigned above
      }
    } else {
      console.log('❌ [Homepage] No sections found in page body');
    }
  } catch (error) {
    console.error('❌ [Homepage] Error parsing page sections:', error);
    parseError = error;
    sections = []; // Reset to empty array on error
  }

  console.log('🏁 [Homepage] Final sections count:', sections.length);
  if (sections.length > 0) {
    console.log('📑 [Homepage] Section types:', sections.map(s => s.type));
  }

  return (
    <>
      <SEOHead 
        title="Devmart - Technology Solutions That Drive Growth"
        description="Leading technology company delivering innovative software solutions, web development, and digital transformation services for businesses worldwide."
        keywords={['technology', 'software development', 'web development', 'digital solutions']}
      />
      <div className="min-h-screen bg-background">
        {/* Only show Navigation if first section is not hero (hero handles its own nav) */}
        {(sections.length === 0 || sections[0]?.type !== 'hero') && <Navigation />}
        <main className={(sections.length === 0 || sections[0]?.type !== 'hero') ? 'pt-16' : ''}>
          {sections.length > 0 ? (
            <SectionRenderer sections={sections} context="home" />
          ) : (
            <div className="container mx-auto px-4 py-8">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-foreground mb-4">Welcome to Devmart</h1>
                <p className="text-muted-foreground mb-6">Homepage sections are being configured...</p>
                <Button onClick={() => refetch()} disabled={isLoading}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh Content
                </Button>
              </div>
              
              {/* Debug Panel for Section Issues */}
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 p-4 rounded-lg text-sm max-w-2xl mx-auto">
                <h3 className="font-semibold mb-2 text-yellow-800 dark:text-yellow-200">Debug: No Sections Found</h3>
                <div className="space-y-2 text-yellow-700 dark:text-yellow-300">
                  <p><strong>Page Found:</strong> {page ? 'Yes' : 'No'}</p>
                  <p><strong>Page Title:</strong> {page?.title || 'N/A'}</p>
                  <p><strong>Page Slug:</strong> {page?.slug || 'N/A'}</p>
                  <p><strong>Page Status:</strong> {page?.status || 'N/A'}</p>
                  <p><strong>Has Body:</strong> {page?.body ? 'Yes' : 'No'}</p>
                  <p><strong>Sections in Body:</strong> {page?.body?.sections?.length || 0}</p>
                  <p><strong>Parse Error:</strong> {parseError ? parseError.message : 'None'}</p>
                  <p className="text-xs mt-2">Check browser console for detailed logs</p>
                </div>
              </div>
            </div>
          )}
        </main>
        <Footer />
      </div>
    </>
  );
}