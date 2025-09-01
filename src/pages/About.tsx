import { useQuery } from '@tanstack/react-query';
import { SEOHead } from '@/lib/seo';
import { cms } from '@/lib/cms';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Building, Zap, Palette, Target } from 'lucide-react';
import heroImage from '@/assets/hero-image.jpg';
import { Link } from 'react-router-dom';
import { TimelineShowcase } from '@/components/ui/TimelineShowcase';
import { AutoBreadcrumb } from '@/components/ui/breadcrumb';

const About = () => {
  const { data: aboutPage } = useQuery({
    queryKey: ['page-about'],
    queryFn: () => cms.getPageBySlug('about'),
  });

  const processSteps = [
    {
      icon: Target,
      title: 'Research',
      description: 'We are a leading innovative marketing agency, specializing in analyzing market trends and consumer behavior.'
    },
    {
      icon: Zap,
      title: 'Planning',
      description: 'We are a leading innovative marketing agency, specializing in strategic planning and goal setting.'
    },
    {
      icon: Building,
      title: 'Development',
      description: 'We are a leading innovative marketing agency, specializing in creative development and implementation.'
    },
    {
      icon: Palette,
      title: 'Deployment',
      description: 'We are a leading innovative marketing agency, specializing in successful deployment and optimization.'
    }
  ];

  const stats = [
    { number: '15k+', label: 'Project Complete' },
    { number: '28+', label: 'Years Experience' },
    { number: '30+', label: 'Team Member' },
    { number: '49+', label: 'Awards Winning' },
  ];

  const companyTimeline = [
    {
      id: '1',
      year: '2020',
      title: 'Foundation & Vision',
      description: 'Devmart was founded with a mission to bridge the gap between innovative technology and business growth. Starting as a small team of passionate developers in Suriname.',
      achievements: [
        'Established core team of 5 developers',
        'Completed first 10 client projects',
        'Developed proprietary project management system'
      ],
      badge: 'Genesis',
      isHighlight: true
    },
    {
      id: '2', 
      year: '2021',
      title: 'Growth & Expansion',
      description: 'Rapid growth phase with expanding client base and service offerings. We began specializing in modern web technologies and digital transformation.',
      achievements: [
        'Reached 50+ completed projects',
        'Expanded team to 15 members',
        'Launched innovation lab initiative',
        'Introduced agile development processes'
      ]
    },
    {
      id: '3',
      year: '2022',
      title: 'Innovation Leadership',
      description: 'Became recognized as a leading technology partner in the region, focusing on cutting-edge solutions and emerging technologies.',
      achievements: [
        'Won "Best Digital Agency" award',
        'Implemented AI-powered development tools',
        'Launched mentorship program',
        'Achieved 98% client retention rate'
      ],
      badge: 'Excellence'
    },
    {
      id: '4',
      year: '2023',
      title: 'Digital Transformation',
      description: 'Pivoted to focus on comprehensive digital transformation, helping businesses modernize their entire technology stack.',
      achievements: [
        'Completed 200+ projects milestone',
        'Expanded internationally',
        'Developed proprietary frameworks',
        'Launched DevLab for R&D'
      ]
    },
    {
      id: '5',
      year: '2024',
      title: 'Future Ready',
      description: 'Leading the charge in next-generation web technologies, AI integration, and sustainable digital practices.',
      achievements: [
        'Team of 30+ specialists',
        'Carbon-neutral development practices', 
        'AI-first development approach',
        'Industry thought leadership'
      ],
      badge: 'Innovation',
      isHighlight: true
    }
  ];

  return (
    <>
      <SEOHead 
        title="About Us - Devmart"
        description="Learn about Devmart, a leading innovative technology company specializing in cutting-edge solutions that drive business growth with expertise in Caribbean and global markets."
        keywords={['about devmart', 'technology company', 'caribbean tech', 'innovation solutions']}
      />
      
      <div className="min-h-screen bg-agenko-dark">
        <Navigation />
        
        {/* Hero Section */}
        <section className="py-32 px-4 pt-24">
          <div className="max-w-6xl mx-auto">
            <AutoBreadcrumb />
            <div className="text-center mb-16">
              <div className="inline-block px-4 py-2 bg-agenko-dark-lighter rounded-full text-agenko-green text-sm font-medium mb-6">
                About Us
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-agenko-white leading-tight mb-6">
                We are a leading <span className="text-gradient">innovative marketing agency</span>
              </h1>
              <p className="text-xl text-agenko-gray-light max-w-3xl mx-auto mb-12">
                {aboutPage?.body?.blocks?.[0]?.data?.text || 
                 "We are a leading innovative marketing agency, specializing in creative solutions that drive business growth, enhance brand visibility, and increase customer engagement using data-driven approaches."}
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="relative">
                <div className="bg-agenko-dark-lighter rounded-2xl p-8">
                  <img 
                    src={heroImage} 
                    alt="About Devmart Agency" 
                    className="w-full h-96 object-cover rounded-xl"
                    loading="eager"
                  />
                </div>
              </div>
              
              <div>
                <div className="inline-block px-4 py-2 bg-agenko-dark-lighter rounded-full text-agenko-green text-sm font-medium mb-6">
                  About Us
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-agenko-white mb-6">
                  Digital Agency With 25+ Years Experience
                </h2>
                <p className="text-agenko-gray-light mb-6">
                  We are a Digital Agency with over 25 years of experience, specializing in delivering cutting-edge digital solutions, including web design, marketing, and branding, to help businesses achieve sustainable growth and success.
                </p>
                <p className="text-agenko-gray-light mb-8">
                  Our experienced team combines creativity with technical expertise to create innovative digital experiences that drive results and exceed expectations.
                </p>
                <Link to="/contact">
                  <Button variant="hero" size="lg">
                    Get Started Today
                  </Button>
                </Link>
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

        {/* Process Section */}
        <section className="py-24 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-block px-4 py-2 bg-agenko-dark-lighter rounded-full text-agenko-green text-sm font-medium mb-6">
                How We Are
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-agenko-white mb-6">
                We are leading Innovative marketing agency.
              </h2>
              <p className="text-agenko-gray-light max-w-3xl mx-auto">
                Leading Innovation marketing agency We are a leading innovative marketing agency, specializing in creative solutions that drive business growth, enhance brand visibility.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {processSteps.map((step, index) => {
                const IconComponent = step.icon;
                return (
                  <Card key={index} className="bg-agenko-dark-lighter border-agenko-gray/20 text-center group hover:border-agenko-green/20 transition-all duration-300">
                    <CardContent className="p-8">
                      <div className="w-16 h-16 bg-agenko-dark rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:bg-agenko-green transition-colors duration-300">
                        <IconComponent className="w-8 h-8 text-agenko-green group-hover:text-agenko-dark" />
                      </div>
                      <h3 className="text-xl font-bold text-agenko-white mb-4">{step.title}</h3>
                      <p className="text-agenko-gray-light text-sm">{step.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-24 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="relative">
                <div className="bg-agenko-dark-lighter rounded-2xl p-8">
                  <img 
                    src={heroImage} 
                    alt="Our Mission" 
                    className="w-full h-96 object-cover rounded-xl"
                    loading="lazy"
                  />
                </div>
              </div>

              <div>
                <div className="inline-block px-4 py-2 bg-agenko-dark-lighter rounded-full text-agenko-green text-sm font-medium mb-6">
                  Our Mission
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-agenko-white mb-6">
                  Empowering Digital Transformation
                </h2>
                <p className="text-agenko-gray-light mb-6">
                  Our mission is to empower businesses across the Caribbean and globally with innovative digital solutions that drive meaningful growth and sustainable success in today's rapidly evolving digital landscape.
                </p>
                <p className="text-agenko-gray-light mb-8">
                  We believe in building long-term partnerships with our clients, combining cutting-edge technology with strategic thinking to deliver exceptional results that exceed expectations and create lasting impact.
                </p>
                <Link to="/services">
                  <Button variant="cta" size="lg">
                    Our Services
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Company Timeline */}
        <TimelineShowcase 
          items={companyTimeline}
          title="Our Journey"
          subtitle="From startup to industry leader - the milestones that shaped Devmart"
        />

        {/* CTA Section */}
        <section className="py-24 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-agenko-white mb-6">
              Ready to grow your business with us?
            </h2>
            <p className="text-agenko-gray-light text-xl mb-8">
              Let's work together to create innovative solutions that drive your business forward.
            </p>
            <div className="flex justify-center">
              <Link to="/contact">
                <Button variant="hero" size="lg" className="text-lg px-12 py-6 text-agenko-dark bg-agenko-green hover:bg-agenko-green-hover">
                  Start Your Project
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default About;