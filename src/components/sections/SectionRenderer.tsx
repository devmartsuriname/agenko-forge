import { HeroSectionComponent } from './HeroSection';
import { AboutSectionComponent } from './AboutSection';
import { ServicesPreviewSectionComponent } from './ServicesPreviewSection';
import { PortfolioPreviewSectionComponent } from './PortfolioPreviewSection';
import { TestimonialsSectionComponent } from './TestimonialsSection';
import { BlogPreviewSectionComponent } from './BlogPreviewSection';
import { CtaSectionComponent } from './CtaSection';
import type { Section } from '@/lib/sections/schema';

interface SectionRendererProps {
  sections: Section[];
}

export function SectionRenderer({ sections }: SectionRendererProps) {
  return (
    <div className="section-renderer">
      {sections.map((section) => {
        switch (section.type) {
          case 'hero':
            return <HeroSectionComponent key={section.id} section={section} />;
          case 'about':
            return <AboutSectionComponent key={section.id} section={section} />;
          case 'servicesPreview':
            return <ServicesPreviewSectionComponent key={section.id} section={section} />;
          case 'portfolioPreview':
            return <PortfolioPreviewSectionComponent key={section.id} section={section} />;
          case 'testimonials':
            return <TestimonialsSectionComponent key={section.id} section={section} />;
          case 'blogPreview':
            return <BlogPreviewSectionComponent key={section.id} section={section} />;
          case 'cta':
            return <CtaSectionComponent key={section.id} section={section} />;
          default:
            console.warn(`Unknown section type: ${(section as any).type}`);
            return null;
        }
      })}
    </div>
  );
}