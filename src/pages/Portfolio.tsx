import { useQuery } from '@tanstack/react-query';
import { useState, useMemo } from 'react';
import { SEOHead } from '@/lib/seo';
import { cms } from '@/lib/cms';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AutoBreadcrumb } from '@/components/ui/breadcrumb';
import { PortfolioFilters } from '@/components/ui/PortfolioFilters';
import { Link } from 'react-router-dom';

const Portfolio = () => {
  const { data: projects = [] } = useQuery({
    queryKey: ['published-projects'],
    queryFn: cms.getPublishedProjects,
  });

  const [filters, setFilters] = useState({
    search: '',
    technologies: [] as string[],
    categories: [] as string[],
    sortBy: 'newest' as 'newest' | 'oldest' | 'title'
  });

  // Extract unique technologies and categories from projects
  const { availableTechnologies, availableCategories } = useMemo(() => {
    const technologies = new Set<string>();
    const categories = new Set<string>();
    
    projects.forEach(project => {
      // Add common technologies as example data
      ['React', 'Node.js', 'TypeScript', 'Python', 'AWS', 'MongoDB'].forEach(tech => technologies.add(tech));
      // Add common categories as example data
      ['Website', 'Mobile App', 'E-commerce', 'Dashboard', 'API'].forEach(cat => categories.add(cat));
    });
    
    return {
      availableTechnologies: Array.from(technologies),
      availableCategories: Array.from(categories)
    };
  }, [projects]);

  // Filter and sort projects
  const filteredProjects = useMemo(() => {
    let filtered = projects.filter(project => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch = 
          project.title.toLowerCase().includes(searchLower) ||
          project.excerpt?.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }
      
      return true;
    });

    // Sort projects
    switch (filters.sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.published_at || b.created_at).getTime() - new Date(a.published_at || a.created_at).getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.published_at || a.created_at).getTime() - new Date(b.published_at || b.created_at).getTime());
        break;
      case 'title':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
    }

    return filtered;
  }, [projects, filters]);

  return (
    <>
      <SEOHead 
        title="Our Portfolio - Devmart"
        description="Explore our portfolio of successful technology projects, innovative solutions, and digital transformations that have helped businesses achieve their goals."
        keywords={['portfolio', 'technology projects', 'innovation cases', 'devmart work']}
      />
      
      <div className="min-h-screen bg-agenko-dark">
        <Navigation />
        
        {/* Breadcrumb */}
        <div className="container mx-auto px-4 pt-8">
          <AutoBreadcrumb />
        </div>
        
        {/* Hero Section */}
        <section className="py-32 px-4 pt-16">
          <div className="max-w-6xl mx-auto text-center">
            <div className="flex items-center justify-center mb-6">
              <Badge variant="outline" className="mb-4 px-4 py-2 text-sm font-medium border-agenko-green/20 bg-agenko-green/5 text-agenko-green">
                Our Portfolio
              </Badge>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-agenko-white leading-tight mb-6">
              Our{' '}
              <span className="bg-gradient-to-r from-agenko-green to-agenko-green-hover bg-clip-text text-transparent">
                Creative Work
              </span>
            </h1>
            <p className="text-xl text-agenko-gray-light max-w-3xl mx-auto mb-12 leading-relaxed">
              Discover our portfolio of innovative digital solutions that have helped businesses across various industries 
              achieve remarkable growth and success.
            </p>
          </div>
        </section>

        {/* Portfolio Grid */}
        <section className="py-12 px-4">
          <div className="max-w-6xl mx-auto">
            {/* Filters */}
            <PortfolioFilters
              onFilterChange={setFilters}
              technologies={availableTechnologies}
              categories={availableCategories}
            />
            
            {/* Results Count */}
            <div className="mb-6">
              <p className="text-agenko-gray-light">
                Showing {filteredProjects.length} of {projects.length} projects
                {filters.search && ` matching "${filters.search}"`}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProjects.map((project) => (
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

            {filteredProjects.length === 0 && projects.length > 0 && (
              <div className="text-center py-16 lg:col-span-3">
                <p className="text-agenko-gray-light text-xl">No projects match your current filters.</p>
              </div>
            )}

            {projects.length === 0 && (
              <div className="text-center py-16 lg:col-span-3">
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