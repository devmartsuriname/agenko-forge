import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { SEOHead } from '@/lib/seo';
import { cms } from '@/lib/cms';
import { generateMetaDescription } from '@/lib/seo';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
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
        <Navigation />
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
        <Navigation />
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
        title={`${service.title} - Agenko Digital Agency`}
        description={contentText}
        type="service"
        keywords={['digital marketing', service.title.toLowerCase(), 'agenko services']}
      />
      
      <div className="min-h-screen bg-agenko-dark">
        <Navigation />
        
        {/* Hero Section */}
        <section className="py-32 px-4 pt-24">
          <div className="max-w-4xl mx-auto">
            <Link 
              to="/services" 
              className="inline-flex items-center text-agenko-green hover:text-agenko-green-hover transition-colors mb-8"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Services
            </Link>
            
            <div className="inline-block px-4 py-2 bg-agenko-dark-lighter rounded-full text-agenko-green text-sm font-medium mb-6">
              Service Details
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-agenko-white leading-tight mb-6">
              {service.title}
            </h1>
            
            {service.excerpt && (
              <p className="text-xl text-agenko-gray-light mb-12">
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
        <section className="py-24 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-agenko-white mb-6">
              Ready to get started?
            </h2>
            <p className="text-agenko-gray-light text-xl mb-8">
              Let's discuss how {service.title.toLowerCase()} can help grow your business.
            </p>
            <Link to="/contact">
              <Button variant="hero" size="lg" className="text-lg px-12 py-6">
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