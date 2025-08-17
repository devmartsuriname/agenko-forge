import { HeroSectionComponent } from './HeroSection';
import { AboutSectionComponent } from './AboutSection';
import { ServicesPreviewSectionComponent } from './ServicesPreviewSection';
import { PortfolioPreviewSectionComponent } from './PortfolioPreviewSection';
import { TestimonialsSectionComponent } from './TestimonialsSection';
import { BlogPreviewSectionComponent } from './BlogPreviewSection';
import { CtaSectionComponent } from './CtaSection';
import type { Section } from '@/lib/sections/schema';

type SectionContext = 'home' | 'list' | 'detail';

interface SectionRendererProps {
  sections: Section[];
  context?: SectionContext;
}

export function SectionRenderer({ sections, context = 'home' }: SectionRendererProps) {

  return (
    <div className="section-renderer">
      {sections.map((section) => {
        // Force grid layout for portfolio and blog sections on non-home contexts
        let sectionToRender = section;
        if (context !== 'home' && (section.type === 'portfolioPreview' || section.type === 'blogPreview')) {
          sectionToRender = {
            ...section,
            data: {
              ...section.data,
              layout: 'grid' as const
            }
          };
        }

        switch (sectionToRender.type) {
          case 'hero':
            return <HeroSectionComponent key={sectionToRender.id} section={sectionToRender} />;
          case 'about':
            return <AboutSectionComponent key={sectionToRender.id} section={sectionToRender} />;
          case 'servicesPreview':
            return <ServicesPreviewSectionComponent key={sectionToRender.id} section={sectionToRender} />;
          case 'portfolioPreview':
            return <PortfolioPreviewSectionComponent key={sectionToRender.id} section={sectionToRender} />;
          case 'testimonials':
            return <TestimonialsSectionComponent key={sectionToRender.id} section={sectionToRender} />;
          case 'blogPreview':
            return <BlogPreviewSectionComponent key={sectionToRender.id} section={sectionToRender} />;
          case 'cta':
            return <CtaSectionComponent key={sectionToRender.id} section={sectionToRender} />;
          default:
            console.warn(`Unknown section type: ${(sectionToRender as any).type}`);
            return null;
        }
      })}
    </div>
  );
}