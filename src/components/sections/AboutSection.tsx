import { Card, CardContent } from '@/components/ui/card';
import { Zap, Shield, Rocket, Star, Users, Award } from 'lucide-react';
import type { AboutSection } from '@/lib/sections/schema';

interface AboutSectionProps {
  section: AboutSection;
}

const iconMap = {
  Zap,
  Shield,
  Rocket,
  Star,
  Users,
  Award,
};

export function AboutSectionComponent({ section }: AboutSectionProps) {
  const { data } = section;

  return (
    <section className="py-20 px-4 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              {data.title}
            </h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              {data.description}
            </p>
            
            {data.features && data.features.length > 0 && (
              <div className="grid gap-6">
                {data.features.map((feature, index) => {
                  const IconComponent = iconMap[feature.icon as keyof typeof iconMap] || Star;
                  
                  return (
                    <div key={index} className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <IconComponent className="h-6 w-6 text-primary" />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground mb-2">
                          {feature.title}
                        </h3>
                        <p className="text-muted-foreground">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          
          {data.image && (
            <div className="order-first lg:order-last">
              <div className="relative">
                {typeof data.image === 'string' ? (
                  <img 
                    src={data.image} 
                    alt={data.title}
                    className="w-full h-96 lg:h-[500px] object-cover rounded-2xl shadow-2xl"
                    loading="lazy"
                  />
                ) : (
                  <img 
                    src={data.image.src} 
                    srcSet={data.image.srcset}
                    sizes={data.image.sizes}
                    alt={data.image.alt || data.title}
                    width={data.image.width}
                    height={data.image.height}
                    className="w-full h-96 lg:h-[500px] object-cover rounded-2xl shadow-2xl"
                    loading="lazy"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl" />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}