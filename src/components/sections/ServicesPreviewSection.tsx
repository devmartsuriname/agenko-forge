import { useQuery } from '@tanstack/react-query';
import { cms } from '@/lib/cms';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { ServicesPreviewSection } from '@/lib/sections/schema';

interface ServicesPreviewSectionProps {
  section: ServicesPreviewSection;
}

export function ServicesPreviewSectionComponent({ section }: ServicesPreviewSectionProps) {
  const { data } = section;

  const { data: services = [], isLoading } = useQuery({
    queryKey: ['published-services', data.limit],
    queryFn: () => cms.getPublishedServices().then(services => services.slice(0, data.limit)),
  });

  if (isLoading) {
    return (
      <section className="py-20 px-4 bg-muted/50">
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
    <section className="py-20 px-4 bg-muted/50">
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
          {services.map((service) => (
            <Card key={service.id} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <CardTitle className="text-xl group-hover:text-primary transition-colors">
                  {service.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {service.excerpt && (
                  <p className="text-muted-foreground line-clamp-3">
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
        
        {data.showAll && services.length >= data.limit && (
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
  );
}