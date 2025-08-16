import { useQuery } from '@tanstack/react-query';
import { cms } from '@/lib/cms';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import type { BlogPreviewSection } from '@/lib/sections/schema';

interface BlogPreviewSectionProps {
  section: BlogPreviewSection;
}

export function BlogPreviewSectionComponent({ section }: BlogPreviewSectionProps) {
  const { data } = section;

  const { data: blogPosts = [], isLoading } = useQuery({
    queryKey: ['published-blog-posts', data.limit],
    queryFn: () => cms.getPublishedBlogPosts(data.limit),
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
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
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
          {blogPosts.map((post) => (
            <Card key={post.id} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-2">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {post.published_at 
                      ? format(new Date(post.published_at), 'MMM d, yyyy')
                      : 'Draft'
                    }
                  </span>
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
                    {post.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {post.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{post.tags.length - 3} more
                      </Badge>
                    )}
                  </div>
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
        
        {data.showAll && blogPosts.length >= data.limit && (
          <div className="text-center mt-12">
            <Button asChild size="lg">
              <Link to="/blog">
                View All Posts
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}