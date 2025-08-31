import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { HeroSection } from '@/lib/sections/schema';
import { ResponsiveImage } from '@/components/ui/responsive-image';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { FloatingElement } from '@/components/ui/FloatingElement';

interface HeroSectionProps {
  section: HeroSection;
}

export function HeroSectionComponent({ section }: HeroSectionProps) {
  const { data } = section;

  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 pt-16 gradient-overlay animated-bg overflow-hidden">
      {/* Floating background elements */}
      <FloatingElement className="absolute top-20 left-10 w-16 h-16 bg-primary/10 rounded-full blur-xl">
        <div />
      </FloatingElement>
      <FloatingElement variant="delayed" className="absolute bottom-32 right-16 w-24 h-24 bg-primary/5 rounded-full blur-2xl">
        <div />
      </FloatingElement>
      
      {data.backgroundImage && (
        <div className="absolute inset-0 parallax-bg">
          <div className="w-full h-full aspect-[16/9] sm:aspect-[21/9] lg:aspect-[32/9]">
            {typeof data.backgroundImage === 'string' ? (
              <ResponsiveImage
                src={data.backgroundImage}
                alt="Hero background"
                className="w-full h-full object-cover"
                priority={true}
                aspectRatio="var(--hero-aspect-ratio, 16 / 9)"
                sizes="100vw"
                loading="eager"
                fetchPriority="high"
              />
            ) : (
              <img
                src={data.backgroundImage.src}
                srcSet={data.backgroundImage.srcset}
                sizes={data.backgroundImage.sizes}
                alt={data.backgroundImage.alt || "Hero background"}
                width={data.backgroundImage.width}
                height={data.backgroundImage.height}
                className="w-full h-full object-cover"
                loading="eager"
                fetchPriority="high"
              />
            )}
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-black/80" />
        </div>
      )}
      
      <div className="relative z-10 max-w-7xl mx-auto text-center">
        <div className="max-w-4xl mx-auto">
          {data.subtitle && (
            <ScrollReveal direction="down" delay={0.2}>
              <p className="text-primary text-lg mb-4 font-medium tracking-wide glow-green">
                {data.subtitle}
              </p>
            </ScrollReveal>
          )}
          
          <ScrollReveal direction="up" delay={0.4}>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              {data.title}
            </h1>
          </ScrollReveal>
          
          {data.description && (
            <ScrollReveal direction="up" delay={0.6}>
              <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed max-w-3xl mx-auto">
                {data.description}
              </p>
            </ScrollReveal>
          )}
          
          {data.ctaText && data.ctaLink && (
            <ScrollReveal direction="scale" delay={0.8}>
              <div className="mb-16">
                <Button 
                  asChild 
                  size="lg" 
                  className="bg-primary hover:bg-primary/90 text-white px-8 py-4 text-lg rounded-full micro-interact hover-morph shadow-glow"
                >
                  <Link to={data.ctaLink}>
                    {data.ctaText}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </ScrollReveal>
          )}
        </div>
        
        {data.stats && data.stats.length > 0 && (
          <ScrollReveal direction="up" delay={1.0} stagger>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {data.stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-primary mb-2 glow-green">
                    {stat.number}
                  </div>
                  <div className="text-white/80 text-sm md:text-base">
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