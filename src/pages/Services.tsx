import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { SEOHead } from '@/lib/seo';
import { cms } from '@/lib/cms';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { InteractiveServiceCard } from '@/components/ui/InteractiveServiceCard';
import { ServiceFilters } from '@/components/ui/ServiceFilters';
import { AnimatedHero } from '@/components/ui/AnimatedHero';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { Building, Zap, Palette, Target, Globe, Smartphone, Code, Cpu, Rocket } from 'lucide-react';
import { Link } from 'react-router-dom';

const Services = () => {
  const { data: services = [] } = useQuery({
    queryKey: ['published-services'],
    queryFn: cms.getPublishedServices,
  });

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const serviceIcons = [Building, Zap, Palette, Target, Globe, Smartphone, Code, Cpu, Rocket];
  
  // Mock service categories and metrics (would come from CMS in real app)
  const serviceCategories = ['Strategy', 'Development', 'Design', 'Analytics', 'Consulting'];
  
  const serviceMetrics = {
    'web-development': [
      { value: 40, label: 'Faster Load Times', suffix: '%', color: 'green' as const },
      { value: 95, label: 'Performance Score', color: 'blue' as const },
    ],
    'digital-marketing': [
      { value: 150, label: 'ROI Increase', suffix: '%', color: 'green' as const },
      { value: 60, label: 'Lead Growth', suffix: '%', color: 'purple' as const },
    ],
    'ui-ux-design': [
      { value: 25, label: 'User Engagement', suffix: '%', color: 'blue' as const },
      { value: 35, label: 'Conversion Rate', suffix: '%', color: 'green' as const },
    ],
  };

  // Enhanced services with categories and outcomes
  const enhancedServices = useMemo(() => 
    services.map((service, index) => ({
      ...service,
      category: serviceCategories[index % serviceCategories.length],
      metrics: serviceMetrics[service.slug as keyof typeof serviceMetrics] || [],
      outcomeText: getOutcomeText(service.slug),
    })), [services]
  );

  function getOutcomeText(slug: string): string {
    const outcomes: Record<string, string> = {
      'web-development': '40% faster page loads',
      'digital-marketing': '150% average ROI increase', 
      'ui-ux-design': '35% conversion improvement',
      'seo-optimization': '200% organic traffic growth',
      'brand-strategy': '3x brand recognition increase',
      'analytics-reporting': '50% faster decision making',
    };
    return outcomes[slug] || 'Proven results delivered';
  }

  // Filter services
  const filteredServices = useMemo(() => {
    return enhancedServices.filter(service => {
      const matchesCategory = !selectedCategory || service.category === selectedCategory;
      const matchesSearch = !searchQuery || 
        service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.excerpt?.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesCategory && matchesSearch;
    });
  }, [enhancedServices, selectedCategory, searchQuery]);

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
        <AnimatedHero
          headline="Comprehensive •Digital• Solutions"
          subhead="Our Services"
          description="We offer a full range of digital marketing and design services to help your business thrive in the digital landscape. From strategy to execution, we've got you covered."
          stats={[
            { number: '25+', label: 'Years Experience' },
            { number: '500+', label: 'Projects Delivered' },
            { number: '98%', label: 'Client Satisfaction' },
            { number: '24/7', label: 'Support Available' },
          ]}
          className="px-4"
        />

        {/* Services Section */}
        <section id="services" className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <ScrollReveal direction="up">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  Our Services
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Discover our comprehensive range of digital solutions designed to accelerate your business growth.
                </p>
              </div>
            </ScrollReveal>

            {/* Filters */}
            <ScrollReveal direction="up" delay={0.2}>
              <ServiceFilters
                categories={serviceCategories}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                className="mb-12"
              />
            </ScrollReveal>

            {/* Services Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredServices.map((service, index) => {
                const IconComponent = serviceIcons[index % serviceIcons.length];
                
                return (
                  <InteractiveServiceCard
                    key={service.id}
                    title={service.title}
                    excerpt={service.excerpt || ''}
                    slug={service.slug}
                    icon={IconComponent}
                    category={service.category}
                    metrics={service.metrics}
                    outcomeText={service.outcomeText}
                    delay={index * 0.1}
                  />
                );
              })}
            </div>

            {/* No results */}
            {filteredServices.length === 0 && (
              <ScrollReveal direction="up" delay={0.4}>
                <div className="text-center py-12">
                  <h3 className="text-xl font-semibold text-foreground mb-2">No services found</h3>
                  <p className="text-muted-foreground mb-4">
                    Try adjusting your filters or search query.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedCategory(null);
                      setSearchQuery('');
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              </ScrollReveal>
            )}
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