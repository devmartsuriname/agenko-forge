import { Card, CardContent } from '@/components/ui/card';
import { Star } from 'lucide-react';
import type { TestimonialsSection } from '@/lib/sections/schema';

interface TestimonialsSectionProps {
  section: TestimonialsSection;
}

export function TestimonialsSectionComponent({ section }: TestimonialsSectionProps) {
  const { data } = section;

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
          {data.testimonials.map((testimonial, index) => (
            <Card key={index} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, starIndex) => (
                    <Star 
                      key={starIndex} 
                      className="h-5 w-5 fill-yellow-400 text-yellow-400" 
                    />
                  ))}
                </div>
                
                <blockquote className="text-muted-foreground mb-6 italic leading-relaxed">
                  "{testimonial.content}"
                </blockquote>
                
                <div className="flex items-center space-x-4">
                  {testimonial.avatar && (
                    <img 
                      src={testimonial.avatar} 
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full object-cover"
                      loading="lazy"
                    />
                  )}
                  <div>
                    <div className="font-semibold text-foreground">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {testimonial.role} at {testimonial.company}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}