import { useQuery } from '@tanstack/react-query';
import { cms } from '@/lib/cms';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CarouselBase } from '@/components/ui/carousel/CarouselBase';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import type { PortfolioPreviewSection } from '@/lib/sections/schema';
import { cn } from '@/lib/utils';
import { ResponsiveImage } from '@/components/ui/responsive-image';

interface PortfolioPreviewCarouselProps {
  section: PortfolioPreviewSection;
}

export function PortfolioPreviewCarousel({ section }: PortfolioPreviewCarouselProps) {
  const { data } = section;

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['published-projects', data.limit],
    queryFn: () => cms.getPublishedProjects().then(projects => projects.slice(0, data.limit)),
  });

  // Get aspect ratio values
  const getAspectRatio = () => {
    const ratio = data.carousel?.aspectRatio || '16/9';
    switch (ratio) {
      case '16/9': return 16 / 9;
      case '4/3': return 4 / 3;
      case '1/1': return 1;
      default: return 16 / 9;
    }
  };

  const getImageClasses = () => {
    const fit = data.carousel?.imageFit || 'cover';
    return fit === 'cover' ? 'object-cover' : 'object-contain';
  };

  if (isLoading) {
    const mockSlides = Array.from({ length: data.limit }).map((_, index) => (
      <Card key={index} className="h-full animate-pulse overflow-hidden">
        <AspectRatio ratio={getAspectRatio()}>
          <div className="w-full h-full bg-muted"></div>
        </AspectRatio>
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
    ));

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
          <CarouselBase
            title={data.title}
            slidesPerView={data.carousel?.slidesPerView || { xs: 1, sm: 1, md: 2, lg: 3 }}
            gap={data.carousel?.gap || 16}
            autoplay={data.carousel?.autoplay || false}
            intervalMs={data.carousel?.intervalMs || 6000}
            loop={data.carousel?.loop || true}
            showArrows={data.carousel?.showArrows !== false}
            showDots={data.carousel?.showDots !== false}
          >
            {mockSlides}
          </CarouselBase>
        </div>
      </section>
    );
  }

  const slides = projects.map((project) => {
    const firstImage = project.project_images?.[0];
    
    return (
      <Link
        key={project.id}
        to={`/portfolio/${project.slug}`}
        className="block h-full focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-lg"
      >
        <Card className="h-full group overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer">
          <div className="relative">
            <AspectRatio ratio={getAspectRatio()}>
              {firstImage ? (
                <ResponsiveImage
                  src={firstImage.url}
                  alt={firstImage.alt || project.title}
                  className={cn(
                    "w-full h-full group-hover:scale-105 transition-transform duration-300",
                    getImageClasses()
                  )}
                  aspectRatio={`${getAspectRatio()}`}
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <span className="text-muted-foreground">No image</span>
                </div>
              )}
            </AspectRatio>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <ExternalLink className="h-5 w-5 text-white" />
            </div>
          </div>
          
          <CardHeader>
            <CardTitle className="text-xl group-hover:text-primary transition-colors line-clamp-2">
              {project.title}
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            {project.excerpt && (
              <p className="text-muted-foreground line-clamp-3">
                {project.excerpt}
              </p>
            )}
          </CardContent>
        </Card>
      </Link>
    );
  });

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
        
        <CarouselBase
          title={data.title}
          slidesPerView={data.carousel?.slidesPerView || { xs: 1, sm: 1, md: 2, lg: 3 }}
          gap={data.carousel?.gap || 16}
          autoplay={data.carousel?.autoplay || false}
          intervalMs={data.carousel?.intervalMs || 6000}
          loop={data.carousel?.loop || true}
          showArrows={data.carousel?.showArrows !== false}
          showDots={data.carousel?.showDots !== false}
        >
          {slides}
        </CarouselBase>
      </div>
    </section>
  );
}