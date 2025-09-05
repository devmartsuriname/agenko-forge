import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { SEOHead } from '@/lib/seo';
import { cms } from '@/lib/cms';
import { generateMetaDescription } from '@/lib/seo';
import { GlobalNavigation } from '@/components/GlobalNavigation';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AutoBreadcrumb } from '@/components/ui/breadcrumb';
import { ArrowLeft, CheckCircle } from 'lucide-react';

const ServiceDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  
  const { data: service, isLoading } = useQuery({
    queryKey: ['service', slug],
    queryFn: () => cms.getServiceBySlug(slug!),
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-agenko-dark">
        <GlobalNavigation overlay={false} />
        <div className="pt-24 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-agenko-dark-lighter rounded mb-4"></div>
              <div className="h-12 bg-agenko-dark-lighter rounded mb-6"></div>
              <div className="h-4 bg-agenko-dark-lighter rounded mb-2"></div>
              <div className="h-4 bg-agenko-dark-lighter rounded mb-2"></div>
              <div className="h-4 bg-agenko-dark-lighter rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-agenko-dark">
        <GlobalNavigation overlay={false} />
        <div className="pt-24 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold text-agenko-white mb-4">Service Not Found</h1>
            <p className="text-agenko-gray-light mb-8">The service you're looking for doesn't exist.</p>
            <Link to="/services">
              <Button variant="cta">
                Back to Services
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const contentText = generateMetaDescription(service.content, service.excerpt || '');

  return (
    <>
      <SEOHead 
        title={`${service.title} - Devmart`}
        description={contentText}
        type="service"
        keywords={['technology solutions', service.title.toLowerCase(), 'devmart services']}
      />
      
      <div className="min-h-screen bg-agenko-dark">
        <GlobalNavigation overlay={false} />
        
        {/* Breadcrumb */}
        <div className="container mx-auto px-4 pt-8">
          <AutoBreadcrumb />
        </div>
        
        {/* Hero Section */}
        <section className="py-32 px-4 pt-16">
          <div className="max-w-4xl mx-auto">
            <Link 
              to="/services" 
              className="inline-flex items-center text-agenko-green hover:text-agenko-green-hover transition-colors mb-8"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Services
            </Link>
            
            <div className="flex items-center justify-center mb-6">
              <Badge variant="outline" className="px-4 py-2 text-sm font-medium border-agenko-green/20 bg-agenko-green/5 text-agenko-green">
                Service Details
              </Badge>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-agenko-white leading-tight mb-6 text-center">
              {service.title}
            </h1>
            
            {service.excerpt && (
              <p className="text-xl text-agenko-gray-light mb-12 leading-relaxed text-center max-w-3xl mx-auto">
                {service.excerpt}
              </p>
            )}
          </div>
        </section>

        {/* Content Section */}
        <section className="py-12 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="prose prose-lg prose-invert max-w-none">
              {service.content?.blocks?.map((block: any, index: number) => {
                switch (block.type) {
                  case 'paragraph':
                    return (
                      <p key={index} className="text-agenko-gray-light mb-6 leading-relaxed">
                        {block.data.text}
                      </p>
                    );
                  case 'header':
                    return (
                      <h2 key={index} className="text-2xl md:text-3xl font-bold text-agenko-white mb-6 mt-12">
                        {block.data.text}
                      </h2>
                    );
                  case 'list':
                    return (
                      <ul key={index} className="space-y-3 mb-8">
                        {block.data.items.map((item: string, itemIndex: number) => (
                          <li key={itemIndex} className="flex items-start space-x-3">
                            <CheckCircle className="w-5 h-5 text-agenko-green mt-0.5 flex-shrink-0" />
                            <span className="text-agenko-gray-light">{item}</span>
                          </li>
                        ))}
                      </ul>
                    );
                  default:
                    return null;
                }
              })}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-agenko-white text-center mb-16">
              What's Included
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                'Strategic Planning',
                'Creative Design',
                'Technical Implementation',
                'Performance Optimization',
                'Ongoing Support',
                'Analytics & Reporting'
              ].map((feature, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-agenko-green mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold text-agenko-white mb-2">{feature}</h3>
                    <p className="text-agenko-gray-light text-sm">
                      Professional {feature.toLowerCase()} tailored to your business needs.
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-4 bg-gradient-to-br from-agenko-green/5 via-agenko-dark to-agenko-dark">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-agenko-white mb-6">
              Ready to{' '}
              <span className="bg-gradient-to-r from-agenko-green to-agenko-green-hover bg-clip-text text-transparent">
                get started?
              </span>
            </h2>
            <p className="text-agenko-gray-light text-xl mb-8 leading-relaxed">
              Let's discuss how {service.title.toLowerCase()} can help grow your business.
            </p>
            <Link to="/contact">
              <Button variant="hero" size="lg" className="text-lg px-12 py-6 bg-agenko-green hover:bg-agenko-green-hover text-agenko-dark font-semibold">
                Start Your Project
              </Button>
            </Link>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default ServiceDetail;