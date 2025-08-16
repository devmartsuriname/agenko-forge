import { useQuery } from '@tanstack/react-query';
import { cms } from '@/lib/cms';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { PortfolioPreviewSection } from '@/lib/sections/schema';

interface PortfolioPreviewSectionProps {
  section: PortfolioPreviewSection;
}

export function PortfolioPreviewSectionComponent({ section }: PortfolioPreviewSectionProps) {
  const { data } = section;

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['published-projects', data.limit],
    queryFn: () => cms.getPublishedProjects().then(projects => projects.slice(0, data.limit)),
  });

  if (isLoading) {
    return (
      <section className="py-20 px-4 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {data.title}
            </h2>
            {data.description && (
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                {data.description}
              </p>
            )}
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: data.limit }).map((_, index) => (
              <Card key={index} className="animate-pulse">
                <div className="h-48 bg-muted"></div>
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-3/4"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded"></div>
                    <div className="h-4 bg-muted rounded w-5/6"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 px-4 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {data.title}
          </h2>
          {data.description && (
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              {data.description}
            </p>
          )}
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project) => {
            const firstImage = project.project_images?.[0];
            
            return (
              <Card key={project.id} className="group overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                {firstImage && (
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={firstImage.url} 
                      alt={firstImage.alt || project.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <ExternalLink className="h-5 w-5 text-white" />
                    </div>
                  </div>
                )}
                
                <CardHeader>
                  <CardTitle className="text-xl group-hover:text-primary transition-colors">
                    {project.title}
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {project.excerpt && (
                    <p className="text-muted-foreground line-clamp-3">
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
        
        {data.showAll && projects.length >= data.limit && (
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
  );
}