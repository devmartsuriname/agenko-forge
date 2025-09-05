import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { SEOHead, generateMetaDescription } from '@/lib/seo';
import { cms } from '@/lib/cms';
import { GlobalNavigation } from '@/components/GlobalNavigation';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AutoBreadcrumb } from '@/components/ui/breadcrumb';
import { ArrowLeft, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

const ProjectDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const { data: project, isLoading } = useQuery({
    queryKey: ['project', slug],
    queryFn: () => cms.getProjectBySlug(slug!),
    enabled: !!slug,
  });

  const { data: allProjects = [] } = useQuery({
    queryKey: ['all-projects'],
    queryFn: () => cms.getPublishedProjects(),
  });

  const relatedProjects = allProjects.filter(p => p.id !== project?.id).slice(0, 3);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-agenko-dark">
        <GlobalNavigation overlay={false} />
        <div className="pt-24 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-agenko-dark-lighter rounded mb-4"></div>
              <div className="h-12 bg-agenko-dark-lighter rounded mb-6"></div>
              <div className="aspect-video bg-agenko-dark-lighter rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-agenko-dark">
        <GlobalNavigation overlay={false} />
        <div className="pt-24 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold text-agenko-white mb-4">Project Not Found</h1>
            <Link to="/portfolio">
              <Button variant="cta">Back to Portfolio</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const images = project.project_images || [];
  const contentText = generateMetaDescription(project.body, project.excerpt || '');

  return (
    <>
      <SEOHead 
        title={`${project.title} - Devmart Portfolio`}
        description={contentText}
        type="article"
        keywords={[project.title.toLowerCase(), 'portfolio', 'web design']}
      />
      
      <div className="min-h-screen bg-agenko-dark">
        <GlobalNavigation overlay={false} />
        
        {/* Breadcrumb */}
        <div className="container mx-auto px-4 pt-8">
          <AutoBreadcrumb />
        </div>
        
        <section className="py-32 px-4 pt-16">
          <div className="max-w-6xl mx-auto">
            <Link to="/portfolio" className="inline-flex items-center text-agenko-green hover:text-agenko-green-hover transition-colors mb-8">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Portfolio
            </Link>
            
            <div className="flex items-center justify-center mb-6">
              <Badge variant="outline" className="px-4 py-2 text-sm font-medium border-agenko-green/20 bg-agenko-green/5 text-agenko-green">
                Portfolio Project
              </Badge>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-agenko-white mb-6 text-center">
              {project.title}
            </h1>
            {project.excerpt && (
              <p className="text-xl text-agenko-gray-light mb-12 text-center max-w-3xl mx-auto leading-relaxed">
                {project.excerpt}
              </p>
            )}

            {/* Image Gallery */}
            {images.length > 0 && (
              <div className="mb-12">
                <div className="relative aspect-video bg-agenko-dark-lighter rounded-xl overflow-hidden mb-4">
                  <img 
                    src={images[currentImageIndex]?.url} 
                    alt={images[currentImageIndex]?.alt || project.title}
                    className="w-full h-full object-cover"
                  />
                  {images.length > 1 && (
                    <>
                      <button 
                        onClick={() => setCurrentImageIndex(prev => prev > 0 ? prev - 1 : images.length - 1)}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-agenko-dark/80 text-agenko-white p-2 rounded-full hover:bg-agenko-green hover:text-agenko-dark transition-colors"
                      >
                        <ChevronLeft className="w-6 h-6" />
                      </button>
                      <button 
                        onClick={() => setCurrentImageIndex(prev => prev < images.length - 1 ? prev + 1 : 0)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-agenko-dark/80 text-agenko-white p-2 rounded-full hover:bg-agenko-green hover:text-agenko-dark transition-colors"
                      >
                        <ChevronRight className="w-6 h-6" />
                      </button>
                    </>
                  )}
                </div>
                
                {images.length > 1 && (
                  <div className="flex space-x-2 overflow-x-auto">
                    {images.map((image, index) => (
                      <button
                        key={image.id}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                          index === currentImageIndex ? 'border-agenko-green' : 'border-agenko-gray/20'
                        }`}
                      >
                        <img src={image.url} alt={image.alt || ''} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="lg:col-span-2">
                <div className="prose prose-lg prose-invert max-w-none">
                  {project.body?.blocks?.map((block: any, index: number) => {
                    switch (block.type) {
                      case 'paragraph':
                        return <p key={index} className="text-agenko-gray-light mb-6 leading-relaxed">{block.data.text}</p>;
                      case 'header':
                        return <h2 key={index} className="text-2xl font-bold text-agenko-white mb-6 mt-8">{block.data.text}</h2>;
                      default:
                        return null;
                    }
                  })}
                </div>
              </div>

              <div>
                <Card className="bg-agenko-dark-lighter border-agenko-gray/20 mb-8">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-agenko-white mb-4">Project Details</h3>
                    <div className="space-y-3 text-sm">
                      <div><span className="text-agenko-gray-light">Category:</span> <span className="text-agenko-white">Web Design</span></div>
                      <div><span className="text-agenko-gray-light">Technologies:</span> <span className="text-agenko-white">React, TypeScript</span></div>
                      <div><span className="text-agenko-gray-light">Timeline:</span> <span className="text-agenko-white">6 weeks</span></div>
                    </div>
                  </CardContent>
                </Card>
                
                <Link to="/contact?subject=Project Inquiry">
                  <Button variant="hero" className="w-full">Start Your Project</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Related Projects */}
        {relatedProjects.length > 0 && (
          <section className="py-24 px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-agenko-white mb-12 text-center">Related Projects</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {relatedProjects.map((relatedProject) => (
                  <Card key={relatedProject.id} className="bg-agenko-dark-lighter border-agenko-gray/20 overflow-hidden group">
                    <div className="aspect-video bg-gradient-to-br from-agenko-green/20 to-agenko-dark flex items-center justify-center">
                      <span className="text-agenko-green text-4xl font-bold">{relatedProject.title.charAt(0)}</span>
                    </div>
                    <CardContent className="p-6">
                      <h3 className="text-lg font-bold text-agenko-white mb-2">{relatedProject.title}</h3>
                      <Link to={`/portfolio/${relatedProject.slug}`} className="text-agenko-green hover:text-agenko-green-hover">
                        View Project →
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )}

        <Footer />
      </div>
    </>
  );
};

export default ProjectDetail;