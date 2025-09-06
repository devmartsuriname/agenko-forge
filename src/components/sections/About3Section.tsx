import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { FloatingElement } from "@/components/ui/FloatingElement";
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
    <section className="py-32">
      <div className="container mx-auto">
        {/* Header Section */}
        <ScrollReveal direction="up" className="mb-14 grid gap-5 text-center md:grid-cols-2 md:text-left" stagger>
          <h1 className="text-5xl font-semibold text-foreground">{data.title}</h1>
          <p className="text-muted-foreground">{data.description}</p>
        </ScrollReveal>

        {/* Main Content Grid */}
        <ScrollReveal direction="left" delay={0.2}>
          <div className="grid gap-7 lg:grid-cols-3">
            {/* Main Image */}
            {data.mainImage && (
              <img
                src={data.mainImage.src}
                alt={data.mainImage.alt}
                className="size-full max-h-[620px] rounded-xl object-cover lg:col-span-2"
              />
            )}
            
            {/* Side Content */}
            <div className="flex flex-col gap-7 md:flex-row lg:flex-col">
              {/* Breakout Section */}
              {data.breakout && (
                <FloatingElement variant="default">
                  <div className="flex flex-col justify-between gap-6 rounded-xl bg-muted p-7 md:w-1/2 lg:w-auto">
                    <img
                      src={data.breakout.src}
                      alt={data.breakout.alt}
                      className="mr-auto h-12"
                    />
                    <div>
                      <p className="mb-2 text-lg font-semibold text-foreground">{data.breakout.title}</p>
                      <p className="text-muted-foreground">{data.breakout.description}</p>
                    </div>
                    {data.breakout.buttonText && data.breakout.buttonUrl && (
                      <Button variant="outline" className="mr-auto" asChild>
                        <a href={data.breakout.buttonUrl} target="_blank" rel="noopener noreferrer">
                          {data.breakout.buttonText}
                        </a>
                      </Button>
                    )}
                  </div>
                </FloatingElement>
              )}
              
              {/* Secondary Image */}
              {data.secondaryImage && (
                <FloatingElement variant="delayed">
                  <img
                    src={data.secondaryImage.src}
                    alt={data.secondaryImage.alt}
                    className="grow basis-0 rounded-xl object-cover md:w-1/2 lg:min-h-0 lg:w-auto"
                  />
                </FloatingElement>
              )}
            </div>
          </div>
        </ScrollReveal>

        {/* Companies Section */}
        {data.companies && data.companies.length > 0 && (
          <ScrollReveal direction="up" delay={0.4}>
            <div className="py-32">
              <p className="text-center text-muted-foreground">{companiesTitle}</p>
              <div className="mt-8 flex flex-wrap justify-center gap-8">
                {data.companies.map((company, idx) => (
                  <div className="flex items-center gap-3" key={company.src + idx}>
                    <img
                      src={company.src}
                      alt={company.alt}
                      className="h-6 w-auto md:h-8 opacity-70 hover:opacity-100 transition-opacity"
                    />
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        )}

        {/* Achievements Section */}
        {data.achievements && data.achievements.length > 0 && (
          <ScrollReveal direction="scale" delay={0.6}>
            <div className="relative overflow-hidden rounded-xl bg-muted p-10 md:p-16">
              <div className="flex flex-col gap-4 text-center md:text-left">
                <h2 className="text-4xl font-semibold text-foreground">{achievementsTitle}</h2>
                <p className="max-w-screen-sm text-muted-foreground">
                  {achievementsDescription}
                </p>
              </div>
              <div className="mt-10 flex flex-wrap justify-between gap-10 text-center">
                {data.achievements.map((item, idx) => (
                  <div className="flex flex-col gap-4" key={item.label + idx}>
                    <p className="text-muted-foreground">{item.label}</p>
                    <span className="text-4xl font-semibold md:text-5xl text-primary">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
              {/* Decorative Grid Pattern */}
              <div className="pointer-events-none absolute -top-1 right-1 z-10 hidden h-full w-full bg-[linear-gradient(to_right,hsl(var(--muted-foreground))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--muted-foreground))_1px,transparent_1px)] bg-[size:80px_80px] opacity-15 [mask-image:linear-gradient(to_bottom_right,#000,transparent,transparent)] md:block"></div>
            </div>
          </ScrollReveal>
        )}
      </div>
    </section>
  );
}