import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, TrendingUp } from 'lucide-react';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

interface CaseStudy {
  id: string;
  title: string;
  slug: string;
  summary: string;
  client: string;
  industry: string;
  services: string[];
  tech_stack: string[];
  metrics: Array<{ label: string; value: string; unit?: string; delta?: string }>;
  hero_image?: string;
  published_at: string;
}

const CaseStudies = () => {
  const { elementRef: heroRef, isVisible: heroVisible } = useScrollReveal();
  const { elementRef: gridRef, isVisible: gridVisible } = useScrollReveal();

  const { data: caseStudies = [], isLoading } = useQuery({
    queryKey: ['case-studies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('case_studies')
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false });

      if (error) throw error;
      return data || [];
    }
  });

  return (
    <>
      <Helmet>
        <title>Case Studies - Devmart</title>
        <meta name="description" content="Explore our successful digital transformation projects. Real results, proven strategies, and measurable impact for businesses worldwide." />
        <meta property="og:title" content="Case Studies - Devmart" />
        <meta property="og:description" content="Explore our successful digital transformation projects. Real results, proven strategies, and measurable impact for businesses worldwide." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://devmart.sr/case-studies" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": "Case Studies",
            "description": "Digital transformation success stories and project outcomes",
            "url": "https://devmart.sr/case-studies",
            "mainEntity": {
              "@type": "ItemList",
              "itemListElement": caseStudies.map((study, index) => ({
                "@type": "CreativeWork",
                "position": index + 1,
                "name": study.title,
                "description": study.summary,
                "url": `https://devmart.sr/case-studies/${study.slug}`
              }))
            }
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-agenko-dark">
        <Navigation />

        <main id="main-content">
          {/* Hero Section */}
          <section 
            ref={heroRef}
            className={`relative pt-24 pb-16 px-4 transition-all duration-1000 ${
              heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-agenko-white mb-6">
                Case Studies
              </h1>
              <p className="text-xl text-agenko-gray-light mb-8 max-w-2xl mx-auto">
                Explore our successful digital transformation projects. Real results, proven strategies, and measurable impact for businesses worldwide.
              </p>
            </div>
          </section>

          {/* Case Studies Grid */}
          <section 
            ref={gridRef}
            className={`pb-20 px-4 transition-all duration-1000 delay-200 ${
              gridVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <div className="max-w-6xl mx-auto">
              {isLoading ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-agenko-dark-lighter rounded-lg p-8 animate-pulse">
                      <div className="h-6 bg-agenko-gray/20 rounded mb-4"></div>
                      <div className="h-20 bg-agenko-gray/20 rounded mb-6"></div>
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="h-16 bg-agenko-gray/20 rounded"></div>
                        <div className="h-16 bg-agenko-gray/20 rounded"></div>
                      </div>
                      <div className="h-4 bg-agenko-gray/20 rounded w-1/3"></div>
                    </div>
                  ))}
                </div>
              ) : caseStudies.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {caseStudies.map((study, index) => (
                    <article 
                      key={study.id}
                      className={`group bg-agenko-dark-lighter hover:bg-agenko-dark-lighter/80 rounded-lg overflow-hidden border border-agenko-gray/20 hover:border-agenko-green/20 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] animate-fade-in`}
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      {study.hero_image && (
                        <div className="aspect-video overflow-hidden">
                          <img 
                            src={study.hero_image} 
                            alt={study.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}
                      
                      <div className="p-8">
                        {/* Client & Industry */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {study.client && (
                            <Badge variant="outline" className="text-xs border-agenko-gray/20 text-agenko-gray-light">
                              {study.client}
                            </Badge>
                          )}
                          {study.industry && (
                            <Badge variant="secondary" className="text-xs bg-agenko-green/10 text-agenko-green">
                              {study.industry}
                            </Badge>
                          )}
                        </div>

                        <h3 className="text-2xl font-semibold text-agenko-white mb-4 group-hover:text-agenko-green transition-colors">
                          <Link to={`/case-studies/${study.slug}`} className="story-link">
                            {study.title}
                          </Link>
                        </h3>
                        
                        {study.summary && (
                          <p className="text-agenko-gray-light mb-6 line-clamp-3">
                            {study.summary}
                          </p>
                        )}

                        {/* Key Metrics */}
                        {study.metrics && Array.isArray(study.metrics) && study.metrics.length > 0 && (
                          <div className="grid grid-cols-2 gap-4 mb-6">
                            {study.metrics.slice(0, 2).map((metric, i) => {
                              const metricData = metric as { label: string; value: string; unit?: string; delta?: string };
                              return (
                              <div key={i} className="bg-agenko-dark/50 rounded-lg p-4 text-center">
                                <div className="flex items-center justify-center gap-1 mb-1">
                                  <span className="text-2xl font-bold text-agenko-green">
                                    {metricData.value}
                                  </span>
                                  {metricData.unit && (
                                    <span className="text-sm text-agenko-gray-light">
                                      {metricData.unit}
                                    </span>
                                  )}
                                  {metricData.delta && (
                                    <TrendingUp className="h-4 w-4 text-green-500" />
                                  )}
                                </div>
                                <p className="text-xs text-agenko-gray-light">
                                  {metricData.label}
                                </p>
                              </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Services */}
                        {study.services && Array.isArray(study.services) && study.services.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-6">
                            {study.services.slice(0, 3).map((service) => (
                              <span
                                key={service}
                                className="px-3 py-1 bg-agenko-green/10 text-agenko-green text-xs rounded-full"
                              >
                                {service}
                              </span>
                            ))}
                            {study.services.length > 3 && (
                              <span className="px-3 py-1 bg-agenko-gray/10 text-agenko-gray-light text-xs rounded-full">
                                +{study.services.length - 3} more
                              </span>
                            )}
                          </div>
                        )}

                        <Button variant="outline" size="sm" asChild className="group-hover:border-agenko-green group-hover:text-agenko-green border-agenko-gray/20 text-agenko-gray-light">
                          <Link to={`/case-studies/${study.slug}`} className="flex items-center gap-2">
                            View Case Study
                            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                          </Link>
                        </Button>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-agenko-gray-light text-lg">No case studies available yet.</p>
                  <p className="text-agenko-gray-light mt-2">Check back soon for detailed project showcases.</p>
                </div>
              )}
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-16 px-4 bg-agenko-dark-lighter/50">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-agenko-white mb-4">
                Ready for Similar Results?
              </h2>
              <p className="text-agenko-gray-light mb-8 max-w-2xl mx-auto">
                Let's discuss how we can help you achieve measurable business outcomes through digital transformation.
              </p>
              <Button size="lg" variant="hero" asChild>
                <Link to="/contact">
                  Request a Similar Outcome
                </Link>
              </Button>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default CaseStudies;