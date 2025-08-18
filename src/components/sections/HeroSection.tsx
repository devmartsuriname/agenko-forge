import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { HeroSection } from '@/lib/sections/schema';

interface HeroSectionProps {
  section: HeroSection;
}

export function HeroSectionComponent({ section }: HeroSectionProps) {
  const { data } = section;

  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 pt-16">
      {data.backgroundImage && (
        <div className="absolute inset-0">
          <div className="w-full h-full aspect-[16/9] sm:aspect-[21/9] lg:aspect-[32/9]">
            <img 
              src={data.backgroundImage} 
              alt="Hero background" 
              className="w-full h-full object-cover"
              loading="eager"
              {...({ fetchpriority: "high" } as any)}
              style={{ 
                aspectRatio: 'var(--hero-aspect-ratio, 16 / 9)',
                objectFit: 'cover',
                transformOrigin: 'center',
                willChange: 'transform'
              }}
            />
          </div>
          <div className="absolute inset-0 bg-black/60" />
        </div>
      )}
      
      <div className="relative z-10 max-w-7xl mx-auto text-center">
        <div className="max-w-4xl mx-auto">
          {data.subtitle && (
            <p className="text-primary text-lg mb-4 font-medium tracking-wide">
              {data.subtitle}
            </p>
          )}
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            {data.title}
          </h1>
          
          {data.description && (
            <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed max-w-3xl mx-auto">
              {data.description}
            </p>
          )}
          
          {data.ctaText && data.ctaLink && (
            <div className="mb-16">
              <Button 
                asChild 
                size="lg" 
                className="bg-primary hover:bg-primary/90 text-white px-8 py-4 text-lg rounded-full transition-all duration-300 hover:scale-105"
              >
                <Link to={data.ctaLink}>
                  {data.ctaText}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          )}
        </div>
        
        {data.stats && data.stats.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {data.stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                  {stat.number}
                </div>
                <div className="text-white/80 text-sm md:text-base">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}