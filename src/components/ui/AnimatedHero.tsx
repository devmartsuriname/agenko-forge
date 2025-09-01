import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { FloatingElement } from '@/components/ui/FloatingElement';
import { useScrollProgress } from '@/hooks/useScrollProgress';
import { cn } from '@/lib/utils';

interface AnimatedHeroProps {
  headline: string;
  subhead?: string;
  description?: string;
  ctaText?: string;
  ctaLink?: string;
  backgroundMedia?: ReactNode;
  stats?: Array<{
    number: string;
    label: string;
  }>;
  className?: string;
}

export function AnimatedHero({
  headline,
  subhead,
  description,
  ctaText,
  ctaLink,
  backgroundMedia,
  stats,
  className,
}: AnimatedHeroProps) {
  const { progress, getParallaxTransform } = useScrollProgress({
    threshold: 0.1,
  });

  return (
    <section className={cn(
      "relative min-h-screen flex items-center justify-center overflow-hidden",
      "bg-gradient-to-br from-background via-background/95 to-background/90",
      className
    )}>
      {/* Animated background elements */}
      <FloatingElement className="absolute top-20 left-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl">
        <div />
      </FloatingElement>
      <FloatingElement 
        variant="delayed" 
        className="absolute bottom-20 right-16 w-48 h-48 bg-primary/3 rounded-full blur-3xl"
      >
        <div />
      </FloatingElement>
      
      {/* Parallax background */}
      {backgroundMedia && (
        <div 
          className="absolute inset-0 z-0"
          style={{
            transform: getParallaxTransform('background'),
          }}
        >
          {backgroundMedia}
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/60 to-background/80" />
        </div>
      )}
      
      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 pt-16 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Subhead */}
          {subhead && (
            <ScrollReveal direction="down" delay={0.2}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
                <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                <span className="text-primary text-sm font-medium">
                  {subhead}
                </span>
              </div>
            </ScrollReveal>
          )}
          
          {/* Main headline with progressive reveal */}
          <ScrollReveal direction="up" delay={0.4}>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight">
              <span className="inline-block">
                {headline.split(' ').map((word, index) => (
                  <span
                    key={index}
                    className="inline-block mr-4 last:mr-0"
                    style={{
                      animationDelay: `${0.4 + index * 0.1}s`,
                      transform: `translateY(${Math.max(0, (0.5 - progress) * 20)}px)`,
                    }}
                  >
                    {word.includes('•') ? (
                      <span className="text-primary">{word.replace('•', '')}</span>
                    ) : (
                      word
                    )}
                  </span>
                ))}
              </span>
            </h1>
          </ScrollReveal>
          
          {/* Description */}
          {description && (
            <ScrollReveal direction="up" delay={0.6}>
              <p 
                className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed max-w-3xl mx-auto"
                style={{
                  transform: `translateY(${Math.max(0, (0.3 - progress) * 15)}px)`,
                }}
              >
                {description}
              </p>
            </ScrollReveal>
          )}
          
          {/* CTA Button */}
          {ctaText && ctaLink && (
            <ScrollReveal direction="scale" delay={0.8}>
              <div className="mb-16">
                <Button 
                  asChild 
                  size="lg" 
                  className={cn(
                    "bg-primary hover:bg-primary/90 text-primary-foreground",
                    "px-8 py-4 text-lg rounded-full",
                    "transform hover:scale-105 transition-all duration-300",
                    "shadow-lg hover:shadow-xl shadow-primary/25"
                  )}
                >
                  <Link to={ctaLink}>
                    {ctaText}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </ScrollReveal>
          )}
        </div>
        
        {/* Stats with staggered reveal */}
        {stats && stats.length > 0 && (
          <ScrollReveal direction="up" delay={1.0} stagger>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <div 
                  key={index} 
                  className="text-center transform hover:scale-105 transition-transform duration-300"
                  style={{
                    animationDelay: `${1.0 + index * 0.1}s`,
                  }}
                >
                  <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                    {stat.number}
                  </div>
                  <div className="text-muted-foreground text-sm md:text-base">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </ScrollReveal>
        )}
      </div>
    </section>
  );
}