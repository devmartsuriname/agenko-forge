import { useQuery } from '@tanstack/react-query';
import { cms } from '@/lib/cms';
import { SEOHead } from '@/lib/seo';
import heroImage from '@/assets/hero-image.jpg';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Building, Zap, Palette, Star, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SectionRenderer } from '@/components/sections/SectionRenderer';
import { PageBodySchema } from '@/lib/sections/schema';

const Index = () => {
  // Try to get homepage sections first
  const { data: homePage } = useQuery({
    queryKey: ['homepage'],
    queryFn: async () => {
      const pages = await cms.getPublishedPages();
      return pages.find(p => p.slug === 'home') || null;
    },
  });

  const { data: services = [] } = useQuery({
    queryKey: ['published-services'],
    queryFn: cms.getPublishedServices,
  });

  const { data: projects = [] } = useQuery({
    queryKey: ['published-projects'],
    queryFn: cms.getPublishedProjects,
  });

  const { data: blogPosts = [] } = useQuery({
    queryKey: ['published-blog-posts'],
    queryFn: () => cms.getPublishedBlogPosts(3),
  });

  // Check if we have homepage sections
  let sections = [];
  try {
    if (homePage?.body?.sections) {
      const parsedBody = PageBodySchema.parse(homePage.body);
      sections = parsedBody.sections;
    }
  } catch (error) {
    console.error('Error parsing page sections:', error);
  }

  // If we have sections, use the new dynamic rendering
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
            <SectionRenderer sections={sections} />
          </main>
          <Footer />
        </div>
      </>
    );
  }

  // Fallback to static content if no sections are configured
  const stats = [
    { number: '15k+', label: 'Project Complete' },
    { number: '28+', label: 'Years Experience' },
    { number: '30+', label: 'Team Member' },
    { number: '49+', label: 'Awards Winning' },
  ];

  return (
    <>
      <SEOHead 
        title="Agenko Digital Agency - Innovative Marketing Solutions"
        description="A leading digital agency specializing in creative solutions that drive business growth, enhance brand visibility, and increase customer engagement."
        keywords={['digital marketing', 'web design', 'branding', 'business growth']}
      />
      <div className="min-h-screen bg-agenko-dark">
        <Navigation />
        
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center px-4 pt-16">
          <div className="absolute inset-0">
            <img 
              src={heroImage} 
              alt="Professional team collaborating" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/60" />
          </div>
          
          <div className="relative z-10 max-w-7xl mx-auto text-center">
            <div className="max-w-4xl mx-auto">
              <p className="text-primary text-lg mb-4 font-medium tracking-wide">
                Digital Agency · Suriname & Caribbean
              </p>
              
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                We Design <span className="text-primary">Digital Experiences</span> That Matter
              </h1>
              
              <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed max-w-3xl mx-auto">
                Transforming businesses through innovative design, development, and digital marketing strategies that drive real results.
              </p>
              
              <div className="mb-16">
                <Button 
                  asChild 
                  size="lg" 
                  className="bg-primary hover:bg-primary/90 text-white px-8 py-4 text-lg rounded-full transition-all duration-300 hover:scale-105"
                >
                  <Link to="/contact">
                    Start Your Project
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                    {stat.number}
                  </div>
                  <div className="text-white/80 text-sm md:text-base">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Services Section */}
        {services.length > 0 && (
          <section className="py-20 px-4 bg-background">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  Our Services
                </h2>
                <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                  We offer comprehensive digital solutions to help your business thrive in the modern world.
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {services.slice(0, 6).map((service) => (
                  <Card key={service.id} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <CardContent className="p-6">
                      <h3 className="text-xl font-semibold text-foreground mb-3 group-hover:text-primary transition-colors">
                        {service.title}
                      </h3>
                      {service.excerpt && (
                        <p className="text-muted-foreground mb-4 line-clamp-3">
                          {service.excerpt}
                        </p>
                      )}
                      <Button variant="outline" asChild className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <Link to={`/services/${service.slug}`}>
                          Learn More
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {services.length > 6 && (
                <div className="text-center mt-12">
                  <Button asChild size="lg">
                    <Link to="/services">
                      View All Services
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Projects Section */}
        {projects.length > 0 && (
          <section className="py-20 px-4 bg-muted/50">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  Recent Work
                </h2>
                <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                  Explore our portfolio of successful projects and see how we've helped businesses achieve their goals.
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {projects.slice(0, 6).map((project) => {
                  const firstImage = project.project_images?.[0];
                  
                  return (
                    <Card key={project.id} className="group overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                      {firstImage && (
                        <div className="relative h-48 overflow-hidden">
                          <img 
                            src={firstImage.url} 
                            alt={firstImage.alt || project.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}
                      
                      <CardContent className="p-6">
                        <h3 className="text-xl font-semibold text-foreground mb-3 group-hover:text-primary transition-colors">
                          {project.title}
                        </h3>
                        {project.excerpt && (
                          <p className="text-muted-foreground mb-4 line-clamp-3">
                            {project.excerpt}
                          </p>
                        )}
                        <Button variant="outline" asChild className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                          <Link to={`/portfolio/${project.slug}`}>
                            View Project
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
              
              {projects.length > 6 && (
                <div className="text-center mt-12">
                  <Button asChild size="lg">
                    <Link to="/portfolio">
                      View All Projects
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Blog Section */}
        {blogPosts.length > 0 && (
          <section className="py-20 px-4 bg-background">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  Latest Insights
                </h2>
                <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                  Stay updated with our latest thoughts, industry trends, and expert insights.
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {blogPosts.map((post) => (
                  <Card key={post.id} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <CardContent className="p-6">
                      <h3 className="text-xl font-semibold text-foreground mb-3 group-hover:text-primary transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                      {post.excerpt && (
                        <p className="text-muted-foreground mb-4 line-clamp-3">
                          {post.excerpt}
                        </p>
                      )}
                      <Button variant="outline" asChild className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <Link to={`/blog/${post.slug}`}>
                          Read More
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <div className="text-center mt-12">
                <Button asChild size="lg">
                  <Link to="/blog">
                    View All Posts
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
          </section>
        )}

        {/* CTA Section */}
        <section className="relative py-20 px-4 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary/80" />
          
          <div className="relative z-10 max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
              Ready to Transform Your Business?
            </h2>
            
            <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
              Let's discuss your project and create something amazing together. Get in touch today for a free consultation.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                asChild 
                size="lg" 
                variant="secondary"
                className="bg-white text-primary hover:bg-white/90 px-8 py-4 text-lg rounded-full transition-all duration-300 hover:scale-105"
              >
                <Link to="/contact">
                  Start Your Project
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              
              <Button 
                asChild 
                variant="outline" 
                size="lg" 
                className="border-white text-white hover:bg-white hover:text-primary px-8 py-4 text-lg rounded-full transition-all duration-300"
              >
                <Link to="/portfolio">
                  View Our Work
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default Index;