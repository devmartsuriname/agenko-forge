import { useQuery } from '@tanstack/react-query';
import { cms } from '@/lib/cms';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { CarouselBase } from '@/components/ui/carousel/CarouselBase';
import type { BlogPreviewSection } from '@/lib/sections/schema';

interface BlogPreviewCarouselProps {
  section: BlogPreviewSection;
}

export function BlogPreviewCarousel({ section }: BlogPreviewCarouselProps) {
  const { data } = section;

  const { data: blogPosts = [], isLoading } = useQuery({
    queryKey: ['published-blog-posts', data.limit],
    queryFn: () => cms.getPublishedBlogPosts(data.limit),
  });

  // Estimate reading time (simple calculation: ~200 words per minute)
  const estimateReadingTime = (content: string | null) => {
    if (!content) return '5 min read';
    const wordCount = content.split(/\s+/).length;
    const minutes = Math.ceil(wordCount / 200);
    return `${minutes} min read`;
  };

  if (isLoading) {
    const mockSlides = Array.from({ length: data.limit }).map((_, index) => (
      <Card key={index} className="h-full animate-pulse">
        <CardHeader>
          <div className="h-4 bg-muted rounded w-1/3 mb-2"></div>
          <div className="h-6 bg-muted rounded w-3/4"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded w-5/6"></div>
            <div className="h-4 bg-muted rounded w-2/3"></div>
          </div>
          <div className="flex gap-2 mt-4">
            <div className="h-5 bg-muted rounded w-12"></div>
            <div className="h-5 bg-muted rounded w-16"></div>
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

  const slides = blogPosts.map((post) => (
    <Link
      key={post.id}
      to={`/blog/${post.slug}`}
      className="block h-full focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-lg"
    >
      <Card className="h-full group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer">
        <CardHeader>
          <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-2">
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>
                {post.published_at 
                  ? format(new Date(post.published_at), 'MMM d, yyyy')
                  : 'Draft'
                }
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>{estimateReadingTime(post.body ? JSON.stringify(post.body) : null)}</span>
            </div>
          </div>
          
          <CardTitle className="text-xl group-hover:text-primary transition-colors line-clamp-2">
            {post.title}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {post.excerpt && (
            <p className="text-muted-foreground line-clamp-3">
              {post.excerpt}
            </p>
          )}
          
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {post.tags.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{post.tags.length - 2}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
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
          {slides}
        </CarouselBase>
      </div>
    </section>
  );
}