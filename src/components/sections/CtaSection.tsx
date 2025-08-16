import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { CtaSection } from '@/lib/sections/schema';

interface CtaSectionProps {
  section: CtaSection;
}

export function CtaSectionComponent({ section }: CtaSectionProps) {
  const { data } = section;

  return (
    <section className="relative py-20 px-4 overflow-hidden">
      {data.backgroundImage && (
        <div className="absolute inset-0">
          <img 
            src={data.backgroundImage} 
            alt="CTA background" 
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/70" />
        </div>
      )}
      
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
          {data.title}
        </h2>
        
        {data.description && (
          <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
            {data.description}
          </p>
        )}
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button 
            asChild 
            size="lg" 
            className="bg-primary hover:bg-primary/90 text-white px-8 py-4 text-lg rounded-full transition-all duration-300 hover:scale-105"
          >
            <Link to={data.primaryCta.link}>
              {data.primaryCta.text}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          
          {data.secondaryCta && (
            <Button 
              asChild 
              variant="outline" 
              size="lg" 
              className="border-white text-white hover:bg-white hover:text-primary px-8 py-4 text-lg rounded-full transition-all duration-300"
            >
              <Link to={data.secondaryCta.link}>
                {data.secondaryCta.text}
              </Link>
            </Button>
          )}
        </div>
      </div>
      
      {!data.backgroundImage && (
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary/80" />
      )}
    </section>
  );
}