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
  console.log('🎨 [SectionRenderer] Rendering sections:', {
    count: sections.length,
    context,
    types: sections.map(s => s.type)
  });

  if (!sections || sections.length === 0) {
    console.warn('⚠️ [SectionRenderer] No sections to render');
    return null;
  }

  return (
    <div className="section-renderer">
      {sections.map((section, index) => {
        console.log(`🔧 [SectionRenderer] Rendering section ${index + 1}/${sections.length}:`, {
          type: section.type,
          id: section.id,
          hasData: !!section.data
        });
        
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
              console.log('🦸 [SectionRenderer] Rendering hero section');
              return <HeroSectionComponent key={sectionToRender.id} section={sectionToRender} />;
            case 'about':
              console.log('ℹ️ [SectionRenderer] Rendering about section');
              return <About3Section key={sectionToRender.id} section={sectionToRender} />;
            case 'servicesPreview':
              console.log('🛠️ [SectionRenderer] Rendering services preview section');
              return <ServicesPreviewSectionComponent key={sectionToRender.id} section={sectionToRender} />;
            case 'portfolioPreview':
              console.log('💼 [SectionRenderer] Rendering portfolio preview section');
              return <PortfolioPreviewSectionComponent key={sectionToRender.id} section={sectionToRender} />;
            case 'testimonials':
              console.log('💬 [SectionRenderer] Rendering testimonials section');
              return <TestimonialsSectionComponent key={sectionToRender.id} section={sectionToRender} />;
            case 'blogPreview':
              console.log('📝 [SectionRenderer] Rendering blog preview section');
              return <BlogPreviewSectionComponent key={sectionToRender.id} section={sectionToRender} />;
            case 'cta':
              console.log('📢 [SectionRenderer] Rendering CTA section');
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