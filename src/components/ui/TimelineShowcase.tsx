import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Calendar } from 'lucide-react';
import { useScrollReveal } from '@/hooks/useScrollReveal';

interface TimelineItem {
  id: string;
  year: string;
  title: string;
  description: string;
  achievements?: string[];
  badge?: string;
  isHighlight?: boolean;
}

interface TimelineShowcaseProps {
  items: TimelineItem[];
  title?: string;
  subtitle?: string;
}

export function TimelineShowcase({ 
  items, 
  title = "Our Journey",
  subtitle = "Key milestones that shaped our story"
}: TimelineShowcaseProps) {
  const { elementRef, isVisible } = useScrollReveal<HTMLDivElement>({
    threshold: 0.1,
    triggerOnce: true
  });

  return (
    <section ref={elementRef} className="py-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{title}</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {subtitle}
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border hidden md:block" />
          
          <div className="space-y-8">
            {items.map((item, index) => (
              <div 
                key={item.id}
                className={`relative transition-all duration-700 ${
                  isVisible 
                    ? 'opacity-100 translate-x-0' 
                    : 'opacity-0 translate-x-8'
                }`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                {/* Timeline Dot */}
                <div className="absolute left-6 top-6 w-4 h-4 bg-primary rounded-full border-4 border-background shadow-lg hidden md:block" />
                
                <Card className={`ml-0 md:ml-20 ${item.isHighlight ? 'ring-2 ring-primary/20 bg-primary/5' : ''}`}>
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
                      <div className="flex items-center gap-3 mb-2 sm:mb-0">
                        <Badge variant={item.isHighlight ? 'default' : 'outline'} className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {item.year}
                        </Badge>
                        {item.badge && (
                          <Badge variant="secondary">{item.badge}</Badge>
                        )}
                      </div>
                    </div>

                    <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                    <p className="text-muted-foreground mb-4 leading-relaxed">
                      {item.description}
                    </p>

                    {item.achievements && item.achievements.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">Key Achievements:</h4>
                        <ul className="space-y-1">
                          {item.achievements.map((achievement, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                              {achievement}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}