import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, TrendingUp, BarChart3, Lightbulb } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useScrollReveal } from '@/hooks/useScrollReveal';

interface InsightPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  tags: string[];
  published_at: string;
}

export function InsightsPreviewSection() {
  const { elementRef, isVisible } = useScrollReveal<HTMLElement>();

  const { data: insightPosts = [] } = useQuery({
    queryKey: ['insights-preview'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('id, title, slug, excerpt, tags, published_at')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      
      // Filter for strategic insight content
      const insightTags = [
        'industry-analysis', 'tech-trends', 'market-insights', 
        'digital-transformation', 'innovation', 'strategy', 
        'leadership', 'thought-leadership', 'future-tech'
      ];

      return (data || []).filter(post => {
        if (!post.tags || !Array.isArray(post.tags)) return false;
        return post.tags.some(tag => 
          insightTags.includes(tag.toLowerCase()) ||
          tag.toLowerCase().includes('insight') ||
          tag.toLowerCase().includes('trend') ||
          tag.toLowerCase().includes('analysis')
        );
      }).slice(0, 3);
    }
  });

  const insights = [
    {
      icon: TrendingUp,
      title: "Market Trends",
      description: "Latest developments shaping the digital landscape"
    },
    {
      icon: BarChart3,
      title: "Data-Driven Analysis", 
      description: "Strategic insights backed by industry research"
    },
    {
      icon: Lightbulb,
      title: "Innovation Insights",
      description: "Emerging technologies and their business impact"
    }
  ];

  return (
    <section ref={elementRef} className="py-20 px-4 bg-muted/30">
      <div className="container mx-auto">
        <div 
          className={`text-center mb-16 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Industry Insights
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Strategic analysis and thought leadership on digital transformation, 
            emerging technologies, and market trends.
          </p>
          
          {/* Insight Categories */}
          <div className="flex flex-wrap gap-8 justify-center mb-12">
            {insights.map((insight, index) => (
              <div 
                key={index}
                className={`flex items-center gap-3 transition-all duration-700 ${
                  isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
                }`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <insight.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-sm">{insight.title}</h3>
                  <p className="text-xs text-muted-foreground">{insight.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Insights Grid */}
        {insightPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {insightPosts.map((post, index) => (
              <Card 
                key={post.id}
                className={`group hover:shadow-lg transition-all duration-300 hover:scale-[1.02] ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                <CardContent className="p-6">
                  <div className="mb-4">
                    {post.tags && post.tags.slice(0, 2).map((tag) => (
                      <Badge key={tag} variant="secondary" className="mr-1 mb-1 text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  
                  <h3 className="font-semibold mb-3 group-hover:text-primary transition-colors">
                    <Link to={`/insights/${post.slug}`} className="line-clamp-2">
                      {post.title}
                    </Link>
                  </h3>
                  
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      {new Date(post.published_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                    <Link 
                      to={`/insights/${post.slug}`}
                      className="flex items-center gap-1 text-primary hover:text-primary/80 transition-colors"
                    >
                      Read More <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 mb-12">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Strategic Insights Coming Soon</h3>
            <p className="text-muted-foreground">
              We're developing in-depth industry analysis and thought leadership content.
            </p>
          </div>
        )}

        {/* CTA */}
        <div 
          className={`text-center transition-all duration-700 delay-500 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <Button asChild size="lg">
            <Link to="/insights" className="flex items-center gap-2">
              Explore All Insights
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}