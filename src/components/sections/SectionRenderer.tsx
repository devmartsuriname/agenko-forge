import { useLocation } from 'react-router-dom';
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
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <div className="section-renderer">
      {sections.map((section) => {
        // Force grid layout for portfolio and blog sections on non-homepage routes
        let sectionToRender = section;
        if (!isHomePage && (section.type === 'portfolioPreview' || section.type === 'blogPreview')) {
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