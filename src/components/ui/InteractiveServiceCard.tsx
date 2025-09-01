import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { LucideIcon, ArrowRight, TrendingUp } from 'lucide-react';
import { useCountUp } from '@/hooks/useCountUp';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { cn } from '@/lib/utils';

interface ServiceMetric {
  value: number;
  label: string;
  prefix?: string;
  suffix?: string;
  color?: 'green' | 'blue' | 'purple';
}

interface InteractiveServiceCardProps {
  title: string;
  excerpt: string;
  slug: string;
  icon: LucideIcon;
  category?: string;
  metrics?: ServiceMetric[];
  outcomeText?: string;
  className?: string;
  delay?: number;
}

export function InteractiveServiceCard({
  title,
  excerpt,
  slug,
  icon: IconComponent,
  category,
  metrics = [],
  outcomeText,
  className,
  delay = 0,
}: InteractiveServiceCardProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <ScrollReveal 
      direction="up" 
      delay={delay}
      className={cn("h-full", className)}
    >
      <Card 
        className={cn(
          "group h-full bg-card/50 backdrop-blur-sm border-border/50",
          "hover:border-primary/20 transition-all duration-300",
          "hover:shadow-glow hover:shadow-primary/10",
          "transform hover:scale-[1.02] hover:-translate-y-1",
          className
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onFocus={() => setIsHovered(true)}
        onBlur={() => setIsHovered(false)}
      >
        <CardContent className="p-6 h-full flex flex-col">
          {/* Category Badge */}
          {category && (
            <Badge 
              variant="secondary" 
              className="w-fit mb-4 text-xs font-medium bg-primary/10 text-primary border-primary/20"
            >
              {category}
            </Badge>
          )}

          {/* Icon with micro-animation */}
          <div className={cn(
            "w-14 h-14 rounded-xl flex items-center justify-center mb-4",
            "bg-primary/10 group-hover:bg-primary transition-all duration-300",
            "transform group-hover:scale-110 group-hover:rotate-6"
          )}>
            <IconComponent className={cn(
              "w-7 h-7 text-primary group-hover:text-primary-foreground",
              "transition-all duration-300"
            )} />
          </div>

          {/* Title */}
          <h3 className="text-xl font-semibold text-foreground mb-3 group-hover:text-primary transition-colors duration-300">
            {title}
          </h3>

          {/* Outcome highlight */}
          {outcomeText && (
            <div className={cn(
              "flex items-center gap-2 mb-3 p-2 rounded-lg",
              "bg-primary/5 border border-primary/10",
              "transform transition-all duration-300",
              isHovered ? "scale-105" : "scale-100"
            )}>
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-sm text-primary font-medium">{outcomeText}</span>
            </div>
          )}

          {/* Metrics with count-up animation */}
          {metrics.length > 0 && (
            <div className="grid grid-cols-2 gap-3 mb-4">
              {metrics.map((metric, index) => {
                const countUpValue = useCountUp({
                  end: metric.value,
                  duration: 1.2,
                  prefix: metric.prefix,
                  suffix: metric.suffix,
                  trigger: isVisible || isHovered,
                });

                return (
                  <div 
                    key={index}
                    className={cn(
                      "text-center p-2 rounded-lg bg-card border border-border/50",
                      "transform transition-all duration-300 group-hover:border-primary/20"
                    )}
                  >
                    <div className={cn(
                      "text-lg font-bold mb-1",
                      metric.color === 'green' && "text-green-500",
                      metric.color === 'blue' && "text-blue-500", 
                      metric.color === 'purple' && "text-purple-500",
                      !metric.color && "text-primary"
                    )}>
                      {countUpValue}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {metric.label}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Description */}
          <p className="text-muted-foreground mb-6 flex-grow leading-relaxed">
            {excerpt}
          </p>

          {/* CTA Button */}
          <Button 
            asChild
            variant="outline"
            className={cn(
              "w-full group-hover:bg-primary group-hover:text-primary-foreground",
              "group-hover:border-primary transition-all duration-300",
              "transform group-hover:scale-105"
            )}
          >
            <Link to={`/services/${slug}`} className="flex items-center justify-center gap-2">
              Learn More
              <ArrowRight className={cn(
                "w-4 h-4 transition-transform duration-300",
                "group-hover:translate-x-1"
              )} />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </ScrollReveal>
  );
}