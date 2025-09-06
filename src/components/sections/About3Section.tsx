import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { FloatingElement } from "@/components/ui/FloatingElement";
import { ProgressScrubbing } from "@/components/ui/ProgressScrubbing";
import type { AboutSection } from '@/lib/sections/schema';

interface About3SectionProps {
  section: AboutSection;
}

export function About3Section({ section }: About3SectionProps) {
  const { data } = section;

  // Enhanced About3 layout - force simple layout for user preference
  const hasEnhancedLayout = false; // Temporarily use simple layout

  // If it's the legacy layout, fall back to the original AboutSection component
  if (!hasEnhancedLayout) {
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
                  {data.features.map((feature, index) => (
                    <div key={index} className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <span className="h-6 w-6 text-primary">{feature.icon}</span>
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
                  ))}
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

  // Enhanced About3 layout
  const companiesTitle = data.companiesTitle || "Trusted by industry leaders";
  const achievementsTitle = data.achievementsTitle || "Our Impact in Numbers";
  const achievementsDescription = data.achievementsDescription || "Delivering exceptional results through innovative solutions and dedicated partnerships.";

  return (
    <section className="relative py-20 px-4 bg-background overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <FloatingElement variant="default" className="absolute top-20 left-10 w-96 h-96 bg-primary/3 rounded-full blur-3xl opacity-30"><div /></FloatingElement>
        <FloatingElement variant="delayed" className="absolute bottom-20 right-10 w-80 h-80 bg-accent/5 rounded-full blur-3xl opacity-40"><div /></FloatingElement>
        <ProgressScrubbing intensity={0.3} direction="up" className="absolute top-1/3 left-1/4 w-72 h-72 bg-muted/20 rounded-full blur-2xl opacity-20"><div /></ProgressScrubbing>
      </div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Main Content Grid - Restored 2-Column Layout */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column: Content */}
          <ScrollReveal direction="left" delay={0.1}>
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                {data.title}
              </h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                {data.description}
              </p>
              
              {/* Companies Section */}
              {data.companies && data.companies.length > 0 && (
                <ScrollReveal direction="up" delay={0.3}>
                  <div className="mb-8">
                    <p className="text-sm text-muted-foreground mb-4">{companiesTitle}</p>
                    <div className="flex flex-wrap gap-6">
                      {data.companies.map((company, idx) => (
                        <ScrollReveal key={company.src + idx} direction="scale" delay={0.4 + idx * 0.1}>
                          <div className="group">
                            <img
                              src={company.src}
                              alt={company.alt}
                              className="h-6 w-auto opacity-70 hover:opacity-100 transition-all duration-300 group-hover:scale-110 filter grayscale hover:grayscale-0"
                            />
                          </div>
                        </ScrollReveal>
                      ))}
                    </div>
                  </div>
                </ScrollReveal>
              )}
              
              {/* Achievements Section */}
              {data.achievements && data.achievements.length > 0 && (
                <ScrollReveal direction="up" delay={0.4}>
                  <div className="mb-8">
                    <h3 className="text-xl font-semibold text-foreground mb-2">{achievementsTitle}</h3>
                    <p className="text-muted-foreground mb-6">{achievementsDescription}</p>
                    <div className="grid grid-cols-2 gap-6">
                      {data.achievements.map((item, idx) => (
                        <ScrollReveal key={item.label + idx} direction="scale" delay={0.5 + idx * 0.1}>
                          <div className="text-center group hover:transform hover:scale-105 transition-transform duration-300">
                            <div className="text-2xl md:text-3xl font-bold text-primary mb-1 group-hover:text-primary/90 transition-colors duration-300">
                              {item.value}
                            </div>
                            <div className="text-sm text-muted-foreground">{item.label}</div>
                          </div>
                        </ScrollReveal>
                      ))}
                    </div>
                  </div>
                </ScrollReveal>
              )}
            </div>
          </ScrollReveal>
          
          {/* Right Column: Image with Breakout */}
          <ScrollReveal direction="right" delay={0.2}>
            <div className="order-first lg:order-last relative">
              {/* Main Image */}
              {data.mainImage && (
                <div className="group relative overflow-hidden rounded-2xl">
                  <img
                    src={data.mainImage.src}
                    alt={data.mainImage.alt}
                    className="w-full h-96 lg:h-[500px] object-cover rounded-2xl shadow-2xl transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              )}
              
              {/* Breakout Card */}
              {data.breakout && (
                <ScrollReveal direction="up" delay={0.5}>
                  <div className="absolute -bottom-8 -left-8 group bg-card p-6 rounded-xl shadow-xl border hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 max-w-sm">
                    <div className="flex items-start space-x-4">
                      <img
                        src={data.breakout.src}
                        alt={data.breakout.alt}
                        className="h-12 w-12 object-contain transition-transform duration-300 group-hover:scale-110"
                        onError={(e) => {
                          console.error('Logo failed to load:', data.breakout.src);
                          // Try fallback path
                          e.currentTarget.src = '/images/logo.png';
                        }}
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors duration-300">
                          {data.breakout.title}
                        </h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          {data.breakout.description}
                        </p>
                        {data.breakout.buttonText && data.breakout.buttonUrl && (
                          <Button variant="outline" size="sm" className="group-hover:border-primary group-hover:text-primary transition-colors duration-300" asChild>
                            <a href={data.breakout.buttonUrl} target="_blank" rel="noopener noreferrer">
                              {data.breakout.buttonText}
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              )}
              
              {/* Secondary Image - positioned below main image if present */}
              {data.secondaryImage && (
                <ScrollReveal direction="up" delay={0.6}>
                  <div className="mt-6 group relative overflow-hidden rounded-xl">
                    <img
                      src={data.secondaryImage.src}
                      alt={data.secondaryImage.alt}
                      className="w-full h-48 object-cover rounded-xl transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
                  </div>
                </ScrollReveal>
              )}
            </div>
          </ScrollReveal>
        </div>

      </div>
    </section>
  );
}