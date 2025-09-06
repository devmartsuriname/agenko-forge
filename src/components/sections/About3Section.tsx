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

  // Enhanced About3 layout - check for new fields more robustly
  const hasEnhancedLayout = !!(
    data.mainImage || 
    data.secondaryImage || 
    data.breakout || 
    (data.companies && Array.isArray(data.companies) && data.companies.length > 0) || 
    (data.achievements && Array.isArray(data.achievements) && data.achievements.length > 0)
  );

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
    <section className="relative py-32 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <FloatingElement variant="default" className="absolute top-20 left-10 w-96 h-96 bg-primary/3 rounded-full blur-3xl opacity-30"><div /></FloatingElement>
        <FloatingElement variant="delayed" className="absolute bottom-20 right-10 w-80 h-80 bg-accent/5 rounded-full blur-3xl opacity-40"><div /></FloatingElement>
        <ProgressScrubbing intensity={0.3} direction="up" className="absolute top-1/3 left-1/4 w-72 h-72 bg-muted/20 rounded-full blur-2xl opacity-20"><div /></ProgressScrubbing>
      </div>
      
      <div className="container mx-auto relative z-10">
        {/* Header Section */}
        <ScrollReveal direction="up" delay={0.1}>
          <div className="mb-14 grid gap-5 text-center md:grid-cols-2 md:text-left">
            <h1 className="text-5xl font-semibold text-foreground">{data.title}</h1>
            <p className="text-muted-foreground">{data.description}</p>
          </div>
        </ScrollReveal>

        {/* Main Content Grid */}
        <div className="grid gap-7 lg:grid-cols-3">
          {/* Main Image */}
          {data.mainImage && (
            <ScrollReveal direction="left" delay={0.2}>
              <div className="group relative overflow-hidden rounded-xl">
                <img
                  src={data.mainImage.src}
                  alt={data.mainImage.alt}
                  className="size-full max-h-[620px] rounded-xl object-cover lg:col-span-2 transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
              </div>
            </ScrollReveal>
          )}
          
          {/* Side Content */}
          <ScrollReveal direction="right" delay={0.3} stagger>
            <div className="flex flex-col gap-7 md:flex-row lg:flex-col">
              {/* Breakout Section */}
              {data.breakout && (
                <div className="group flex flex-col justify-between gap-6 rounded-xl bg-muted p-7 md:w-1/2 lg:w-auto hover:bg-muted/80 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                  <img
                    src={data.breakout.src}
                    alt={data.breakout.alt}
                    className="mr-auto h-12 transition-transform duration-300 group-hover:scale-110"
                  />
                  <div>
                    <p className="mb-2 text-lg font-semibold text-foreground group-hover:text-primary transition-colors duration-300">{data.breakout.title}</p>
                    <p className="text-muted-foreground">{data.breakout.description}</p>
                  </div>
                  {data.breakout.buttonText && data.breakout.buttonUrl && (
                    <Button variant="outline" className="mr-auto group-hover:border-primary group-hover:text-primary transition-colors duration-300" asChild>
                      <a href={data.breakout.buttonUrl} target="_blank" rel="noopener noreferrer">
                        {data.breakout.buttonText}
                      </a>
                    </Button>
                  )}
                </div>
              )}
            
              {/* Secondary Image */}
              {data.secondaryImage && (
                <div className="group relative overflow-hidden rounded-xl">
                  <img
                    src={data.secondaryImage.src}
                    alt={data.secondaryImage.alt}
                    className="grow basis-0 rounded-xl object-cover md:w-1/2 lg:min-h-0 lg:w-auto transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
                </div>
              )}
            </div>
          </ScrollReveal>
        </div>

        {/* Companies Section */}
        {data.companies && data.companies.length > 0 && (
          <ScrollReveal direction="up" delay={0.4}>
            <div className="py-32">
              <p className="text-center text-muted-foreground mb-2">{companiesTitle}</p>
              <div className="mt-8 flex flex-wrap justify-center gap-8">
                {data.companies.map((company, idx) => (
                  <ScrollReveal key={company.src + idx} direction="scale" delay={0.5 + idx * 0.1}>
                    <div className="flex items-center gap-3 group">
                      <img
                        src={company.src}
                        alt={company.alt}
                        className="h-6 w-auto md:h-8 opacity-70 hover:opacity-100 transition-all duration-300 group-hover:scale-110 filter grayscale hover:grayscale-0"
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
          <ScrollReveal direction="up" delay={0.5}>
            <div className="relative overflow-hidden rounded-xl bg-muted p-10 md:p-16 group hover:bg-muted/90 transition-colors duration-500">
              <div className="flex flex-col gap-4 text-center md:text-left relative z-10">
                <h2 className="text-4xl font-semibold text-foreground">{achievementsTitle}</h2>
                <p className="max-w-screen-sm text-muted-foreground">
                  {achievementsDescription}
                </p>
              </div>
              <div className="mt-10 flex flex-wrap justify-between gap-10 text-center relative z-10">
                {data.achievements.map((item, idx) => (
                  <ScrollReveal key={item.label + idx} direction="scale" delay={0.6 + idx * 0.1}>
                    <div className="flex flex-col gap-4 group-hover:transform group-hover:scale-105 transition-transform duration-300">
                      <p className="text-muted-foreground">{item.label}</p>
                      <span className="text-4xl font-semibold md:text-5xl text-primary group-hover:text-primary/90 transition-colors duration-300">
                        {item.value}
                      </span>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
              {/* Decorative Grid Pattern */}
              <div className="pointer-events-none absolute -top-1 right-1 z-10 hidden h-full w-full bg-[linear-gradient(to_right,hsl(var(--muted-foreground))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--muted-foreground))_1px,transparent_1px)] bg-[size:80px_80px] opacity-15 [mask-image:linear-gradient(to_bottom_right,#000,transparent,transparent)] md:block group-hover:opacity-25 transition-opacity duration-500"></div>
              {/* Subtle floating background element */}
              <ProgressScrubbing intensity={0.2} direction="right" className="absolute top-10 right-10 w-32 h-32 bg-primary/5 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"><div /></ProgressScrubbing>
            </div>
          </ScrollReveal>
        )}
      </div>
    </section>
  );
}