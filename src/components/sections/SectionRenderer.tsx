import { HeroSectionComponent } from './HeroSection';
import { AboutSectionComponent } from './AboutSection';
import { About3Section } from './About3Section';
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
  // Only log in development
  if (process.env.NODE_ENV === 'development') {
    console.log('🎨 [SectionRenderer] Rendering sections:', {
      count: sections.length,
      context,
      types: sections.map(s => s.type)
    });
  }

  if (!sections || sections.length === 0) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️ [SectionRenderer] No sections to render');
    }
    return null;
  }

  return (
    <div className="section-renderer">
      {sections.map((section, index) => {
        // Reduced logging frequency
        if (process.env.NODE_ENV === 'development' && index === 0) {
          console.log(`🔧 [SectionRenderer] Rendering ${sections.length} sections starting with:`, {
            type: section.type,
            id: section.id
          });
        }
        
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

        try {
          switch (sectionToRender.type) {
            case 'hero':
              return <HeroSectionComponent key={sectionToRender.id} section={sectionToRender} />;
            case 'about':
              return <About3Section key={sectionToRender.id} section={sectionToRender} />;
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
              console.warn(`❌ [SectionRenderer] Unknown section type: ${(sectionToRender as any).type}`);
              return (
                <div key={`unknown-${index}`} className="p-4 bg-yellow-100 border border-yellow-400 rounded">
                  <p className="text-yellow-800">Unknown section type: {(sectionToRender as any).type}</p>
                </div>
              );
          }
        } catch (error) {
          console.error(`❌ [SectionRenderer] Error rendering section ${sectionToRender.type}:`, error);
          return (
            <div key={`error-${index}`} className="p-4 bg-red-100 border border-red-400 rounded">
              <p className="text-red-800">Error rendering {sectionToRender.type} section</p>
              <p className="text-red-600 text-sm">{error instanceof Error ? error.message : 'Unknown error'}</p>
            </div>
          );
        }
      })}
    </div>
  );
}