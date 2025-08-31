import { useQuery } from '@tanstack/react-query';
import { SEOHead } from '@/lib/seo';
import { cms } from '@/lib/cms';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Building, Zap, Palette, Target, Globe, Smartphone } from 'lucide-react';
import { Link } from 'react-router-dom';

const Services = () => {
  const { data: services = [] } = useQuery({
    queryKey: ['published-services'],
    queryFn: cms.getPublishedServices,
  });

  const serviceIcons = [Building, Zap, Palette, Target, Globe, Smartphone];

  return (
    <>
      <SEOHead 
        title="Our Services - Devmart"
        description="Explore our comprehensive technology services including software development, digital innovation, AI solutions, and strategic technology consulting."
        keywords={['technology services', 'software development', 'digital innovation', 'AI solutions', 'consulting']}
      />
      
      <div className="min-h-screen bg-agenko-dark">
        <Navigation />
        
        {/* Hero Section */}
        <section className="py-32 px-4 pt-24">
          <div className="max-w-6xl mx-auto text-center">
            <div className="inline-block px-4 py-2 bg-agenko-dark-lighter rounded-full text-agenko-green text-sm font-medium mb-6">
              Our Services
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-agenko-white leading-tight mb-6">
              Comprehensive <span className="text-gradient">Digital Solutions</span>
            </h1>
            <p className="text-xl text-agenko-gray-light max-w-3xl mx-auto mb-12">
              We offer a full range of digital marketing and design services to help your business thrive in the digital landscape. From strategy to execution, we've got you covered.
            </p>
          </div>
        </section>

        {/* Services Grid */}
        <section className="py-12 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service, index) => {
                const IconComponent = serviceIcons[index % serviceIcons.length];
                
                return (
                  <Card key={service.id} className="bg-agenko-dark-lighter border-agenko-gray/20 hover:border-agenko-green/20 transition-all duration-300 group">
                    <CardContent className="p-8">
                      <div className="w-16 h-16 bg-agenko-dark rounded-xl flex items-center justify-center mb-6 group-hover:bg-agenko-green transition-colors duration-300">
                        <IconComponent className="w-8 h-8 text-agenko-green group-hover:text-agenko-dark" />
                      </div>
                      <h3 className="text-xl font-bold text-agenko-white mb-4">{service.title}</h3>
                      <p className="text-agenko-gray-light mb-6 line-clamp-3">{service.excerpt}</p>
                      <Link to={`/services/${service.slug}`}>
                        <Button variant="outline-green" size="sm">
                          Learn More
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-24 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-block px-4 py-2 bg-agenko-dark-lighter rounded-full text-agenko-green text-sm font-medium mb-6">
                Why Choose Us
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-agenko-white mb-6">
                25+ Years of Digital Excellence
              </h2>
              <p className="text-agenko-gray-light max-w-3xl mx-auto">
                Our experienced team delivers cutting-edge solutions that drive real results for businesses of all sizes.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-20 h-20 bg-agenko-green rounded-full flex items-center justify-center mx-auto mb-6">
                  <Target className="w-10 h-10 text-agenko-dark" />
                </div>
                <h3 className="text-xl font-bold text-agenko-white mb-4">Strategic Approach</h3>
                <p className="text-agenko-gray-light">
                  Data-driven strategies tailored to your business goals and target audience.
                </p>
              </div>

              <div className="text-center">
                <div className="w-20 h-20 bg-agenko-green rounded-full flex items-center justify-center mx-auto mb-6">
                  <Zap className="w-10 h-10 text-agenko-dark" />
                </div>
                <h3 className="text-xl font-bold text-agenko-white mb-4">Fast Delivery</h3>
                <p className="text-agenko-gray-light">
                  Quick turnaround times without compromising on quality or attention to detail.
                </p>
              </div>

              <div className="text-center">
                <div className="w-20 h-20 bg-agenko-green rounded-full flex items-center justify-center mx-auto mb-6">
                  <Building className="w-10 h-10 text-agenko-dark" />
                </div>
                <h3 className="text-xl font-bold text-agenko-white mb-4">Proven Results</h3>
                <p className="text-agenko-gray-light">
                  Track record of successful projects and satisfied clients across various industries.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Process Section */}
        <section className="py-24 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-block px-4 py-2 bg-agenko-dark-lighter rounded-full text-agenko-green text-sm font-medium mb-6">
                Our Process
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-agenko-white mb-6">
                How We Work
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                { step: '01', title: 'Discovery', description: 'Understanding your business goals and requirements' },
                { step: '02', title: 'Strategy', description: 'Developing a comprehensive digital strategy' },
                { step: '03', title: 'Execution', description: 'Implementing solutions with precision and care' },
                { step: '04', title: 'Optimization', description: 'Continuous improvement and performance monitoring' },
              ].map((item, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-agenko-green rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-agenko-dark font-bold text-lg">{item.step}</span>
                  </div>
                  <h3 className="text-xl font-bold text-agenko-white mb-4">{item.title}</h3>
                  <p className="text-agenko-gray-light text-sm">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-agenko-white mb-6">
              Ready to start your project?
            </h2>
            <p className="text-agenko-gray-light text-xl mb-8">
              Let's discuss how our services can help achieve your business goals.
            </p>
            <Link to="/contact">
              <Button variant="hero" size="lg" className="text-lg px-12 py-6">
                Get Started Today
              </Button>
            </Link>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default Services;