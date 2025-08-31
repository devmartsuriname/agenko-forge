import { useQuery } from '@tanstack/react-query';
import { SEOHead } from '@/lib/seo';
import { cms } from '@/lib/cms';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';

const Portfolio = () => {
  const { data: projects = [] } = useQuery({
    queryKey: ['published-projects'],
    queryFn: cms.getPublishedProjects,
  });

  return (
    <>
      <SEOHead 
        title="Our Portfolio - Devmart"
        description="Explore our portfolio of successful technology projects, innovative solutions, and digital transformations that have helped businesses achieve their goals."
        keywords={['portfolio', 'technology projects', 'innovation cases', 'devmart work']}
      />
      
      <div className="min-h-screen bg-agenko-dark">
        <Navigation />
        
        {/* Hero Section */}
        <section className="py-32 px-4 pt-24">
          <div className="max-w-6xl mx-auto text-center">
            <div className="inline-block px-4 py-2 bg-agenko-dark-lighter rounded-full text-agenko-green text-sm font-medium mb-6">
              Our Portfolio
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-agenko-white leading-tight mb-6">
              Our <span className="text-gradient">Creative Work</span>
            </h1>
            <p className="text-xl text-agenko-gray-light max-w-3xl mx-auto mb-12">
              Discover our portfolio of innovative digital solutions that have helped businesses across various industries achieve remarkable growth and success.
            </p>
          </div>
        </section>

        {/* Portfolio Grid */}
        <section className="py-12 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {projects.map((project) => (
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
                    <div className="absolute inset-0 bg-agenko-dark/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <Link 
                      to={`/portfolio/${project.slug}`}
                      className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    >
                      <span className="bg-agenko-green text-agenko-dark px-6 py-2 rounded-full font-semibold">
                        View Project
                      </span>
                    </Link>
                  </div>
                  
                  <CardContent className="p-6">
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="px-3 py-1 bg-agenko-dark text-agenko-green text-xs rounded-full">Website</span>
                      <span className="px-3 py-1 bg-agenko-dark text-agenko-green text-xs rounded-full">UI/UX</span>
                    </div>
                    <h3 className="text-xl font-bold text-agenko-white mb-2">{project.title}</h3>
                    <p className="text-agenko-gray-light text-sm line-clamp-2">{project.excerpt}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {projects.length === 0 && (
              <div className="text-center py-16">
                <p className="text-agenko-gray-light text-xl">No projects available yet.</p>
              </div>
            )}
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
                How We Create Success
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                { step: '01', title: 'Discovery', description: 'Understanding your vision and requirements' },
                { step: '02', title: 'Design', description: 'Creating innovative and user-centered designs' },
                { step: '03', title: 'Develop', description: 'Building robust and scalable solutions' },
                { step: '04', title: 'Deploy', description: 'Launching and optimizing for success' },
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
              Let's create something amazing together
            </h2>
            <p className="text-agenko-gray-light text-xl mb-8">
              Ready to start your next project? We'd love to hear about your vision.
            </p>
            <Link to="/contact">
              <button className="bg-agenko-green text-agenko-dark hover:bg-agenko-green-hover font-semibold px-12 py-6 rounded-full text-lg transition-all duration-300 transform hover:scale-105">
                Start Your Project
              </button>
            </Link>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default Portfolio;