import { SEOHead } from '@/lib/seo';
import { cms } from '@/lib/cms';
import { useQuery } from '@tanstack/react-query';
import heroImage from '@/assets/hero-image.jpg';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Building, Zap, Palette, Star, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Index = () => {
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
              className="w-full h-full object-cover opacity-60"
              loading="eager"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-agenko-dark/90 to-agenko-dark/70"></div>
          </div>
          
          <div className="relative z-10 max-w-6xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-agenko-white leading-tight mb-6">
              Agency For Growth Through<br />
              <span className="text-gradient">Innovative Marketing.</span>
            </h1>
            <p className="text-xl md:text-2xl text-agenko-gray-light max-w-3xl mx-auto mb-12">
              A digital marketing agency focused delivering innovative strategies to accelerate business growth, enhance brand visibility, and increase customer engagement, using data-driven approaches.
            </p>
            <Link to="/contact">
              <Button variant="hero" size="lg" className="text-lg px-12 py-6">
                LET'S TALK
              </Button>
            </Link>
          </div>

          {/* Brand Logos */}
          <div className="absolute bottom-16 left-0 right-0 z-10">
            <div className="max-w-6xl mx-auto px-4">
              <div className="flex justify-center items-center space-x-8 md:space-x-12 opacity-60">
                <div className="text-agenko-gray-light font-bold text-lg">EPA</div>
                <div className="text-agenko-gray-light font-bold text-lg">Bradency</div>
                <div className="text-agenko-gray-light font-bold text-lg">360 AGENCY</div>
                <div className="text-agenko-gray-light font-bold text-lg">directy</div>
                <div className="text-agenko-gray-light font-bold text-lg">barbarian.</div>
                <div className="text-agenko-gray-light font-bold text-lg hidden md:block">SHIPYARD</div>
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className="py-24 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <div className="inline-block px-4 py-2 bg-agenko-dark-lighter rounded-full text-agenko-green text-sm font-medium mb-6">
                  About Us
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-agenko-white mb-6">
                  Strategic growth powered by Agenko Agency!
                </h2>
                <p className="text-agenko-gray-light mb-6">
                  At Agenko Agency, we specialize in delivering strategic growth solutions tailored to elevate your business to new heights. By combining innovative strategies, data-driven insights, and creative expertise, we help companies unlock their full potential.
                </p>
                <p className="text-agenko-gray-light mb-8">
                  Our dedicated team works closely with clients to understand their unique goals, crafting customized plans that drive measurable results.
                </p>
                <Link to="/about">
                  <Button variant="cta" size="lg">
                    LEARN MORE
                  </Button>
                </Link>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-8 mt-12">
                  {stats.slice(0, 2).map((stat, index) => (
                    <div key={index}>
                      <div className="text-3xl font-bold text-agenko-white mb-2">{stat.number}</div>
                      <div className="text-agenko-gray-light text-sm">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative">
                <div className="bg-agenko-dark-lighter rounded-2xl p-8">
                  <div className="bg-agenko-green rounded-xl p-6 text-center mb-6">
                    <div className="text-agenko-dark text-4xl font-bold">24+</div>
                    <div className="text-agenko-dark text-sm font-medium">Years On The Market</div>
                  </div>
                  <img 
                    src={heroImage} 
                    alt="Professional businessman" 
                    className="w-full h-64 object-cover rounded-xl"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-4xl md:text-5xl font-bold text-agenko-white mb-2">{stat.number}</div>
                  <div className="text-agenko-gray-light">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section className="py-24 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-block px-4 py-2 bg-agenko-dark-lighter rounded-full text-agenko-green text-sm font-medium mb-6">
                Our Service
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-agenko-white mb-6">
                We are Digital Agency With 25+ Years Experience
              </h2>
              <p className="text-agenko-gray-light max-w-3xl mx-auto">
                We are a Digital Agency with over 25 years of experience, specializing in delivering cutting-edge digital solutions, including web design, marketing, and branding, to help businesses achieve sustainable growth and success.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {services.slice(0, 3).map((service, index) => {
                const icons = [Building, Zap, Palette];
                const IconComponent = icons[index] || Building;
                
                return (
                  <Card key={service.id} className="bg-agenko-dark-lighter border-agenko-gray/20 hover:border-agenko-green/20 transition-all duration-300 group">
                    <CardContent className="p-8">
                      <div className="w-16 h-16 bg-agenko-dark rounded-xl flex items-center justify-center mb-6 group-hover:bg-agenko-green transition-colors duration-300">
                        <IconComponent className="w-8 h-8 text-agenko-green group-hover:text-agenko-dark" />
                      </div>
                      <h3 className="text-xl font-bold text-agenko-white mb-4">{service.title}</h3>
                      <p className="text-agenko-gray-light mb-6">{service.excerpt}</p>
                      <Link to={`/services/${service.slug}`}>
                        <Button variant="cta" size="sm">
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

        {/* Portfolio Preview */}
        <section className="py-24 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-end mb-16">
              <div>
                <div className="inline-block px-4 py-2 bg-agenko-dark-lighter rounded-full text-agenko-green text-sm font-medium mb-6">
                  Complete Work
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-agenko-white">
                  We are leading Innovative marketing agency.
                </h2>
              </div>
              <Link to="/portfolio">
                <Button variant="cta">
                  LEARN MORE
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {projects.slice(0, 2).map((project) => (
                <Card key={project.id} className="bg-agenko-dark-lighter border-agenko-gray/20 overflow-hidden group hover:border-agenko-green/20 transition-all duration-300">
                  <div className="aspect-video bg-agenko-gray/10 relative overflow-hidden">
                    {project.project_images && project.project_images[0] ? (
                      <img 
                        src={project.project_images[0].url} 
                        alt={project.project_images[0].alt || project.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-agenko-green/20 to-agenko-dark flex items-center justify-center">
                        <span className="text-agenko-green text-6xl font-bold">{project.title.charAt(0)}</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-agenko-dark/20"></div>
                  </div>
                  <CardContent className="p-6">
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="px-3 py-1 bg-agenko-dark text-agenko-green text-xs rounded-full">Website</span>
                      <span className="px-3 py-1 bg-agenko-dark text-agenko-green text-xs rounded-full">UI/UX</span>
                    </div>
                    <h3 className="text-xl font-bold text-agenko-white mb-2">{project.title}</h3>
                    <p className="text-agenko-gray-light text-sm">{project.excerpt}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonial Section */}
        <section className="py-24 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <div className="inline-block px-4 py-2 bg-agenko-dark-lighter rounded-full text-agenko-green text-sm font-medium mb-6">
                  Client Feedback
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-agenko-white mb-6">
                  Hear from Our Satisfied Clients Feedback
                </h2>
                <p className="text-agenko-gray-light mb-8">
                  Discover how our clients achieved success with Binorly Agency's expert web design and development, delivering outstanding digital solutions.
                </p>

                <div className="flex items-center space-x-2 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-agenko-green text-agenko-green" />
                  ))}
                </div>

                <blockquote className="text-agenko-gray-light text-lg mb-6 italic">
                  "Binorly Agency completely transformed our online presence! Their exceptional website development expertise went beyond expectations, creating a visually stunning and user-friendly website. The team's attention to detail and commitment to!"
                </blockquote>

                <div>
                  <div className="font-bold text-agenko-white text-lg">Mr. David Liam</div>
                  <div className="text-agenko-gray text-sm">CEO & Founder</div>
                </div>
              </div>

              <div className="relative">
                <div className="bg-agenko-dark-lighter rounded-2xl p-2">
                  <img 
                    src={heroImage} 
                    alt="Client testimonial" 
                    className="w-full h-96 object-cover rounded-xl"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Blog Preview */}
        <section className="py-24 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-block px-4 py-2 bg-agenko-dark-lighter rounded-full text-agenko-green text-sm font-medium mb-6">
                Latest Blogs
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-agenko-white mb-6">
                Expert Insights and News Stay Ahead with Us
              </h2>
              <p className="text-agenko-gray-light max-w-3xl mx-auto">
                Explore expert insights, industry trends, and the latest digital news to keep your business informed and ahead of the competition
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {blogPosts.map((post) => (
                <Card key={post.id} className="bg-agenko-dark-lighter border-agenko-gray/20 overflow-hidden group hover:border-agenko-green/20 transition-all duration-300">
                  <div className="aspect-video bg-gradient-to-br from-agenko-green/20 to-agenko-dark flex items-center justify-center">
                    <span className="text-agenko-green text-6xl font-bold">{post.title.charAt(0)}</span>
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4 text-agenko-gray text-sm mb-4">
                      <span>Web Design</span>
                      <span>•</span>
                      <span>{new Date(post.published_at || post.created_at).toLocaleDateString()}</span>
                    </div>
                    <h3 className="text-xl font-bold text-agenko-white mb-3 line-clamp-2">{post.title}</h3>
                    <Link 
                      to={`/blog/${post.slug}`}
                      className="inline-flex items-center text-agenko-green hover:text-agenko-green-hover transition-colors"
                    >
                      Read More <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-agenko-white mb-6">
              Ground-up to product design Sector.
            </h2>
            <Link to="/contact">
              <Button variant="cta" size="lg" className="text-lg px-12 py-6">
                Contact With Us
              </Button>
            </Link>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default Index;
