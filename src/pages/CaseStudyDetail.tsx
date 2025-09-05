import { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AutoBreadcrumb } from '@/components/ui/breadcrumb';
import { supabase } from '@/integrations/supabase/client';
import { GlobalNavigation } from '@/components/GlobalNavigation';
import Footer from '@/components/Footer';
import { CaseStudyStory } from '@/components/ui/CaseStudyStory';
import { ExternalLink, ArrowRight } from 'lucide-react';

interface CaseStudyMetric {
  label: string;
  value: string;
  description: string;
}

interface CaseStudy {
  id: string;
  title: string;
  slug: string;
  summary?: string;
  client?: string;
  industry?: string;
  services?: string[];
  tech_stack?: string[];
  hero_image?: string;
  metrics?: CaseStudyMetric[];
  body?: string;
  status: string;
  published_at?: string;
}

export default function CaseStudyDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [caseStudy, setCaseStudy] = useState<CaseStudy | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchCaseStudy();
    }
  }, [slug]);

  const fetchCaseStudy = async () => {
    try {
      const { data, error } = await supabase
        .from('case_studies')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          setNotFound(true);
        } else {
          throw error;
        }
      } else {
        setCaseStudy({
          ...data,
          metrics: (data.metrics as any) || []
        });
      }
    } catch (error) {
      console.error('Error fetching case study:', error);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-agenko-dark">
        <GlobalNavigation overlay={false} />
        <main className="pt-20">
          <div className="container mx-auto px-4 py-16">
            <div className="animate-pulse space-y-8">
              <div className="h-8 bg-agenko-dark-lighter rounded w-3/4"></div>
              <div className="h-64 bg-agenko-dark-lighter rounded"></div>
              <div className="space-y-4">
                <div className="h-4 bg-agenko-dark-lighter rounded w-full"></div>
                <div className="h-4 bg-agenko-dark-lighter rounded w-3/4"></div>
                <div className="h-4 bg-agenko-dark-lighter rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (notFound || !caseStudy) {
    return <Navigate to="/case-studies" replace />;
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "name": caseStudy.title,
    "description": caseStudy.summary,
    "author": {
      "@type": "Organization",
      "name": "Devmart"
    },
    "datePublished": caseStudy.published_at,
    "image": caseStudy.hero_image,
    "keywords": caseStudy.tech_stack?.join(", "),
    "about": {
      "@type": "Thing",
      "name": caseStudy.industry
    }
  };

  return (
    <div className="min-h-screen bg-agenko-dark">
      <Helmet>
        <title>{caseStudy.title} | Case Studies | Devmart</title>
        <meta name="description" content={caseStudy.summary} />
        <meta property="og:title" content={`${caseStudy.title} | Devmart Case Studies`} />
        <meta property="og:description" content={caseStudy.summary} />
        <meta property="og:type" content="article" />
        {caseStudy.hero_image && <meta property="og:image" content={caseStudy.hero_image} />}
        <meta property="article:published_time" content={caseStudy.published_at} />
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      <GlobalNavigation overlay={false} />
      
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 pt-8">
        <AutoBreadcrumb />
      </div>
      
      <main className="pt-12">
        {/* Hero Section */}
        <section className="py-16 bg-gradient-to-br from-agenko-green/5 via-agenko-dark to-agenko-dark relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-agenko-green/10 via-transparent to-agenko-green/5" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center space-y-6">
              <div className="flex items-center justify-center space-x-2">
                <Badge variant="outline" className="border-agenko-green/30 bg-agenko-green/10 text-agenko-green">
                  {caseStudy.industry}
                </Badge>
                {caseStudy.client && (
                  <Badge variant="secondary" className="bg-agenko-dark-lighter text-agenko-white">
                    {caseStudy.client}
                  </Badge>
                )}
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold text-agenko-white leading-tight">
                {caseStudy.title}
              </h1>
              
              {caseStudy.summary && (
                <p className="text-xl text-agenko-gray-light max-w-3xl mx-auto leading-relaxed">
                  {caseStudy.summary}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Hero Image */}
        {caseStudy.hero_image && (
          <section className="py-8">
            <div className="container mx-auto px-4">
              <div className="max-w-6xl mx-auto">
                <img
                  src={caseStudy.hero_image}
                  alt={caseStudy.title}
                  className="w-full h-96 object-cover rounded-lg shadow-lg"
                />
              </div>
            </div>
          </section>
        )}

        {/* Key Metrics */}
        {caseStudy.metrics && caseStudy.metrics.length > 0 && (
          <section className="py-16 bg-agenko-dark-lighter/50">
            <div className="container mx-auto px-4">
              <div className="max-w-6xl mx-auto">
                <h2 className="text-3xl font-bold text-center mb-12 text-agenko-white">
                  Key{' '}
                  <span className="bg-gradient-to-r from-agenko-green to-agenko-green-hover bg-clip-text text-transparent">
                    Results
                  </span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {caseStudy.metrics.map((metric, index) => (
                    <Card key={index} className="text-center bg-agenko-dark-lighter border-agenko-gray/20">
                      <CardContent className="p-8">
                        <div className="text-4xl font-bold text-agenko-green mb-2">
                          {metric.value}
                        </div>
                        <div className="text-lg font-semibold mb-2 text-agenko-white">
                          {metric.label}
                        </div>
                        <p className="text-agenko-gray-light">
                          {metric.description}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Enhanced Case Study Story */}
        <CaseStudyStory
          title={caseStudy.title}
          client={caseStudy.client}
          industry={caseStudy.industry}
          summary={caseStudy.summary}
          challenge={<p>{caseStudy.body ? caseStudy.body.split('\n\n')[0] : 'Challenge details coming soon.'}</p>}
          approach={<p>{caseStudy.body ? caseStudy.body.split('\n\n')[1] : 'Approach details coming soon.'}</p>}
          outcome={<p>{caseStudy.body ? caseStudy.body.split('\n\n')[2] : 'Outcome details coming soon.'}</p>}
          metrics={caseStudy.metrics?.map(m => ({ ...m, value: parseFloat(m.value) || 0 })) || []}
          techStack={caseStudy.tech_stack?.map(tech => ({ name: tech, category: 'tool' as const })) || []}
          heroImage={caseStudy.hero_image}
          ctaText="Get Your Quote"
          ctaLink="/get-quote"
        />

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-br from-agenko-green/5 via-agenko-dark to-agenko-dark">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center space-y-8">
              <h2 className="text-3xl font-bold text-agenko-white">
                Ready to Achieve{' '}
                <span className="bg-gradient-to-r from-agenko-green to-agenko-green-hover bg-clip-text text-transparent">
                  Similar Results?
                </span>
              </h2>
              <p className="text-xl text-agenko-gray-light leading-relaxed">
                Let's discuss how we can help transform your business with innovative solutions.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="bg-agenko-green hover:bg-agenko-green-hover text-agenko-dark font-semibold">
                  <a href="/get-quote">Get Your Quote</a>
                </Button>
                <Button variant="outline" size="lg" asChild className="border-agenko-green text-agenko-green hover:bg-agenko-green hover:text-agenko-dark">
                  <a href="/case-studies">View More Case Studies</a>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}