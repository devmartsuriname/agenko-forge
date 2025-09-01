import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MetricPill } from '@/components/ui/MetricPill';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { ArrowRight, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface CaseStudyMetric {
  value: number;
  label: string;
  prefix?: string;
  suffix?: string;
  delta?: number;
  deltaLabel?: string;
  color?: 'primary' | 'green' | 'blue' | 'purple' | 'orange';
}

interface TechBadgeProps {
  name: string;
  category?: 'frontend' | 'backend' | 'database' | 'cloud' | 'tool';
}

export function TechBadge({ name, category = 'tool' }: TechBadgeProps) {
  const categoryColors = {
    frontend: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    backend: 'bg-green-500/10 text-green-600 border-green-500/20',
    database: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
    cloud: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
    tool: 'bg-gray-500/10 text-gray-600 border-gray-500/20',
  };

  return (
    <Badge 
      variant="outline"
      className={cn(
        "text-xs font-medium transition-all duration-200 hover:scale-105",
        categoryColors[category]
      )}
    >
      {name}
    </Badge>
  );
}

interface CaseStudyStoryProps {
  title: string;
  client?: string;
  industry?: string;
  summary?: string;
  challenge: ReactNode;
  approach: ReactNode;
  outcome: ReactNode;
  metrics: CaseStudyMetric[];
  techStack: Array<{
    name: string;
    category?: TechBadgeProps['category'];
  }>;
  heroImage?: string;
  gallery?: string[];
  ctaText?: string;
  ctaLink?: string;
  className?: string;
}

export function CaseStudyStory({
  title,
  client,
  industry,
  summary,
  challenge,
  approach,
  outcome,
  metrics,
  techStack,
  heroImage,
  gallery,
  ctaText = "Request a similar outcome",
  ctaLink = "/contact",
  className,
}: CaseStudyStoryProps) {
  return (
    <div className={cn("space-y-16", className)}>
      {/* Hero Section */}
      <ScrollReveal direction="up">
        <div className="text-center max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-4 mb-6">
            {client && (
              <Badge variant="outline" className="text-sm">
                {client}
              </Badge>
            )}
            {industry && (
              <Badge variant="secondary" className="text-sm">
                {industry}
              </Badge>
            )}
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
            {title}
          </h1>
          
          {summary && (
            <p className="text-xl text-muted-foreground leading-relaxed">
              {summary}
            </p>
          )}
        </div>
      </ScrollReveal>

      {/* Hero Image */}
      {heroImage && (
        <ScrollReveal direction="scale" delay={0.2}>
          <div className="aspect-video rounded-2xl overflow-hidden shadow-2xl">
            <img
              src={heroImage}
              alt={`${title} - Case Study`}
              className="w-full h-full object-cover"
            />
          </div>
        </ScrollReveal>
      )}

      {/* Metrics */}
      {metrics.length > 0 && (
        <ScrollReveal direction="up" delay={0.4}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {metrics.map((metric, index) => (
              <MetricPill
                key={index}
                value={metric.value}
                label={metric.label}
                prefix={metric.prefix}
                suffix={metric.suffix}
                delta={metric.delta}
                deltaLabel={metric.deltaLabel}
                color={metric.color}
                size="lg"
                className="animate-fade-in"
              />
            ))}
          </div>
        </ScrollReveal>
      )}

      {/* Story Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Challenge */}
        <ScrollReveal direction="up" delay={0.6}>
          <Card className="h-full bg-card/50 border-border/50">
            <CardContent className="p-8">
              <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center mb-6">
                <div className="w-6 h-6 bg-red-500 rounded-full" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">Challenge</h3>
              <div className="text-muted-foreground leading-relaxed">
                {challenge}
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>

        {/* Approach */}
        <ScrollReveal direction="up" delay={0.8}>
          <Card className="h-full bg-card/50 border-border/50">
            <CardContent className="p-8">
              <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-6">
                <div className="w-6 h-6 bg-blue-500 rounded-full" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">Approach</h3>
              <div className="text-muted-foreground leading-relaxed">
                {approach}
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>

        {/* Outcome */}
        <ScrollReveal direction="up" delay={1.0}>
          <Card className="h-full bg-card/50 border-border/50">
            <CardContent className="p-8">
              <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center mb-6">
                <div className="w-6 h-6 bg-green-500 rounded-full" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">Outcome</h3>
              <div className="text-muted-foreground leading-relaxed">
                {outcome}
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>
      </div>

      {/* Tech Stack */}
      {techStack.length > 0 && (
        <ScrollReveal direction="up" delay={1.2}>
          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-foreground mb-6">Technology Stack</h3>
              <div className="flex flex-wrap gap-3">
                {techStack.map((tech, index) => (
                  <TechBadge
                    key={index}
                    name={tech.name}
                    category={tech.category}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>
      )}

      {/* Gallery */}
      {gallery && gallery.length > 0 && (
        <ScrollReveal direction="up" delay={1.4}>
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-foreground text-center">Project Gallery</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {gallery.map((image, index) => (
                <div
                  key={index}
                  className="aspect-video rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
                >
                  <img
                    src={image}
                    alt={`${title} - Gallery ${index + 1}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      )}

      {/* CTA */}
      <ScrollReveal direction="scale" delay={1.6}>
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Want similar results for your project?
            </h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Let's discuss how we can help you achieve comparable outcomes with a tailored solution for your business.
            </p>
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
              <Link to={ctaLink}>
                {ctaText}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </ScrollReveal>
    </div>
  );
}