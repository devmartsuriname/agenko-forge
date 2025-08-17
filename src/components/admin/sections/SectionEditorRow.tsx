import { useState, useRef, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2, GripVertical, ArrowUp, ArrowDown, Move } from 'lucide-react';
import { Section, SectionSchema, SECTION_TYPES } from '@/lib/sections/schema';
import { adminToast } from '@/lib/toast-utils';
import { ScreenReaderAnnouncer, KeyboardShortcuts } from '@/lib/accessibility';
import { cn } from '@/lib/utils';

interface SectionEditorRowProps {
  section: Section;
  index: number;
  totalSections: number;
  onUpdate: (section: Section) => void;
  onRemove: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  onFocus?: () => void;
}

export function SectionEditorRow({ 
  section, 
  index,
  totalSections,
  onUpdate, 
  onRemove, 
  onMoveUp, 
  onMoveDown,
  canMoveUp,
  canMoveDown,
  onFocus
}: SectionEditorRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const rowRef = useRef<HTMLDivElement>(null);
  const announcer = ScreenReaderAnnouncer.getInstance();

  const sectionType = SECTION_TYPES.find(type => type.type === section.type);
  const sectionTitle = section.data.title || sectionType?.label || 'Untitled Section';

  const updateSectionData = (updates: Partial<Section['data']>) => {
    try {
      const updatedSection = {
        ...section,
        data: { ...section.data, ...updates }
      };
      
      // Validate with Zod
      SectionSchema.parse(updatedSection);
      onUpdate(updatedSection);
    } catch (error) {
      console.error('Section validation failed:', error);
      adminToast.error('Invalid section data', 'Please check your input values');
    }
  };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isFocused) return;

    if (KeyboardShortcuts.moveUp(e)) {
      e.preventDefault();
      if (canMoveUp && onMoveUp) {
        onMoveUp();
        announcer.announce(`Moved "${sectionTitle}" up to position ${index}`, 'assertive');
        
        // Maintain focus after move
        setTimeout(() => {
          rowRef.current?.focus();
        }, 100);
      }
    } else if (KeyboardShortcuts.moveDown(e)) {
      e.preventDefault();
      if (canMoveDown && onMoveDown) {
        onMoveDown();
        announcer.announce(`Moved "${sectionTitle}" down to position ${index + 2}`, 'assertive');
        
        // Maintain focus after move
        setTimeout(() => {
          rowRef.current?.focus();
        }, 100);
      }
    } else if (KeyboardShortcuts.enter(e) || KeyboardShortcuts.space(e)) {
      e.preventDefault();
      setIsExpanded(!isExpanded);
      announcer.announce(`${isExpanded ? 'Collapsed' : 'Expanded'} "${sectionTitle}" section editor`);
    }
  }, [isFocused, canMoveUp, canMoveDown, onMoveUp, onMoveDown, index, sectionTitle, isExpanded]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleMoveUp = () => {
    if (onMoveUp) {
      onMoveUp();
      announcer.announce(`Moved "${sectionTitle}" up to position ${index}`, 'assertive');
    }
  };

  const handleMoveDown = () => {
    if (onMoveDown) {
      onMoveDown();
      announcer.announce(`Moved "${sectionTitle}" down to position ${index + 2}`, 'assertive');
    }
  };

  const handleRemove = () => {
    onRemove();
    announcer.announce(`Removed "${sectionTitle}" section`, 'assertive');
  };

  const handleFocus = () => {
    setIsFocused(true);
    onFocus?.();
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  return (
    <Card 
      ref={rowRef}
      className={cn(
        "transition-all duration-200",
        isFocused && "ring-2 ring-primary ring-offset-2",
        isExpanded && "border-primary/50"
      )}
      tabIndex={0}
      role="listitem"
      aria-label={`Section ${index + 1} of ${totalSections}: ${sectionTitle}. Press Enter to edit, Ctrl+Arrow to reorder`}
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Drag handle for visual consistency */}
            <div className="text-muted-foreground cursor-grab" aria-hidden="true">
              <GripVertical className="h-4 w-4" />
            </div>
            
            <div>
              <CardTitle className="text-sm font-medium">
                {sectionTitle}
              </CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-xs">
                  {sectionType?.label}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Position {index + 1} of {totalSections}
                </span>
              </div>
            </div>
          </div>
          
          {/* Keyboard Navigation Controls */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMoveUp}
              disabled={!canMoveUp}
              aria-label={`Move ${sectionTitle} up (Ctrl+↑)`}
              title="Ctrl+↑"
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMoveDown}
              disabled={!canMoveDown}
              aria-label={`Move ${sectionTitle} down (Ctrl+↓)`}
              title="Ctrl+↓"
            >
              <ArrowDown className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              aria-expanded={isExpanded}
              aria-label={`${isExpanded ? 'Collapse' : 'Expand'} section editor`}
            >
              <Move className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              aria-label={`Remove ${sectionTitle} section`}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
        
        {/* Quick preview of section content */}
        {!isExpanded && (
          <div className="text-xs text-muted-foreground mt-2 line-clamp-2">
            {section.data.description || section.data.title || 'No description available'}
          </div>
        )}
      </CardHeader>
      
      {/* Expanded section editor */}
      {isExpanded && (
        <CardContent className="pt-0">
          <div className="space-y-4" role="group" aria-label={`${sectionTitle} section editor`}>
            {section.type === 'hero' && (
              <HeroSectionEditor section={section} updateSectionData={updateSectionData} />
            )}
            {section.type === 'about' && (
              <AboutSectionEditor section={section} updateSectionData={updateSectionData} />
            )}
            {section.type === 'servicesPreview' && (
              <ServicesPreviewEditor section={section} updateSectionData={updateSectionData} />
            )}
            {section.type === 'portfolioPreview' && (
              <PortfolioPreviewEditor section={section} updateSectionData={updateSectionData} />
            )}
            {section.type === 'testimonials' && (
              <TestimonialsSectionEditor section={section} updateSectionData={updateSectionData} />
            )}
            {section.type === 'blogPreview' && (
              <BlogPreviewEditor section={section} updateSectionData={updateSectionData} />
            )}
            {section.type === 'cta' && (
              <CtaSectionEditor section={section} updateSectionData={updateSectionData} />
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}

// Individual section editors
function HeroSectionEditor({ 
  section, 
  updateSectionData 
}: { 
  section: Section; 
  updateSectionData: (updates: any) => void; 
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor={`hero-title-${section.id}`}>Title *</Label>
          <Input
            id={`hero-title-${section.id}`}
            value={section.data.title || ''}
            onChange={(e) => updateSectionData({ title: e.target.value })}
            placeholder="Welcome to Devmart"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`hero-subtitle-${section.id}`}>Subtitle</Label>
          <Input
            id={`hero-subtitle-${section.id}`}
            value={(section.data as any).subtitle || ''}
            onChange={(e) => updateSectionData({ subtitle: e.target.value })}
            placeholder="Your Technology Partner"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor={`hero-description-${section.id}`}>Description</Label>
        <Textarea
          id={`hero-description-${section.id}`}
          value={(section.data as any).description || ''}
          onChange={(e) => updateSectionData({ description: e.target.value })}
          placeholder="We build innovative solutions that drive business growth."
          rows={3}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor={`hero-cta-text-${section.id}`}>CTA Text</Label>
          <Input
            id={`hero-cta-text-${section.id}`}
            value={(section.data as any).ctaText || ''}
            onChange={(e) => updateSectionData({ ctaText: e.target.value })}
            placeholder="Get Started"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`hero-cta-link-${section.id}`}>CTA Link</Label>
          <Input
            id={`hero-cta-link-${section.id}`}
            value={(section.data as any).ctaLink || ''}
            onChange={(e) => updateSectionData({ ctaLink: e.target.value })}
            placeholder="/contact"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor={`hero-bg-image-${section.id}`}>Background Image URL</Label>
        <Input
          id={`hero-bg-image-${section.id}`}
          value={(section.data as any).backgroundImage || ''}
          onChange={(e) => updateSectionData({ backgroundImage: e.target.value })}
          placeholder="https://example.com/hero-image.jpg"
          type="url"
        />
      </div>
    </div>
  );
}

function AboutSectionEditor({ 
  section, 
  updateSectionData 
}: { 
  section: Section; 
  updateSectionData: (updates: any) => void; 
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor={`about-title-${section.id}`}>Title *</Label>
        <Input
          id={`about-title-${section.id}`}
          value={section.data.title || ''}
          onChange={(e) => updateSectionData({ title: e.target.value })}
          placeholder="About Devmart"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`about-description-${section.id}`}>Description *</Label>
        <Textarea
          id={`about-description-${section.id}`}
          value={(section.data as any).description || ''}
          onChange={(e) => updateSectionData({ description: e.target.value })}
          placeholder="We are a technology company focused on delivering innovative solutions."
          rows={4}
        />
      </div>
    </div>
  );
}

function ServicesPreviewEditor({ 
  section, 
  updateSectionData 
}: { 
  section: Section; 
  updateSectionData: (updates: any) => void; 
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor={`services-title-${section.id}`}>Title *</Label>
        <Input
          id={`services-title-${section.id}`}
          value={section.data.title || ''}
          onChange={(e) => updateSectionData({ title: e.target.value })}
          placeholder="Our Services"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`services-limit-${section.id}`}>Number to Show</Label>
        <Select
          value={String((section.data as any).limit || 6)}
          onValueChange={(value) => updateSectionData({ limit: parseInt(value) })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[3, 6, 9, 12].map((num) => (
              <SelectItem key={num} value={String(num)}>
                {num} Services
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

function PortfolioPreviewEditor({ 
  section, 
  updateSectionData 
}: { 
  section: Section; 
  updateSectionData: (updates: any) => void; 
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor={`portfolio-title-${section.id}`}>Title *</Label>
        <Input
          id={`portfolio-title-${section.id}`}
          value={section.data.title || ''}
          onChange={(e) => updateSectionData({ title: e.target.value })}
          placeholder="Our Work"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor={`portfolio-limit-${section.id}`}>Number to Show</Label>
          <Select
            value={String((section.data as any).limit || 6)}
            onValueChange={(value) => updateSectionData({ limit: parseInt(value) })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[3, 6, 9, 12].map((num) => (
                <SelectItem key={num} value={String(num)}>
                  {num} Projects
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor={`portfolio-layout-${section.id}`}>Display Style</Label>
          <Select
            value={(section.data as any).layout || 'grid'}
            onValueChange={(value) => updateSectionData({ layout: value as 'grid' | 'carousel' })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="grid">Grid</SelectItem>
              <SelectItem value="carousel">Carousel</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

function TestimonialsSectionEditor({ 
  section, 
  updateSectionData 
}: { 
  section: Section; 
  updateSectionData: (updates: any) => void; 
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor={`testimonials-title-${section.id}`}>Title *</Label>
        <Input
          id={`testimonials-title-${section.id}`}
          value={section.data.title || ''}
          onChange={(e) => updateSectionData({ title: e.target.value })}
          placeholder="What Our Clients Say"
        />
      </div>
    </div>
  );
}

function BlogPreviewEditor({ 
  section, 
  updateSectionData 
}: { 
  section: Section; 
  updateSectionData: (updates: any) => void; 
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor={`blog-title-${section.id}`}>Title *</Label>
        <Input
          id={`blog-title-${section.id}`}
          value={section.data.title || ''}
          onChange={(e) => updateSectionData({ title: e.target.value })}
          placeholder="Latest from Our Blog"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`blog-layout-${section.id}`}>Display Style</Label>
        <Select
          value={(section.data as any).layout || 'grid'}
          onValueChange={(value) => updateSectionData({ layout: value as 'grid' | 'carousel' })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="grid">Grid</SelectItem>
            <SelectItem value="carousel">Carousel</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

function CtaSectionEditor({ 
  section, 
  updateSectionData 
}: { 
  section: Section; 
  updateSectionData: (updates: any) => void; 
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor={`cta-title-${section.id}`}>Title *</Label>
        <Input
          id={`cta-title-${section.id}`}
          value={section.data.title || ''}
          onChange={(e) => updateSectionData({ title: e.target.value })}
          placeholder="Ready to Get Started?"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor={`cta-button-text-${section.id}`}>Button Text</Label>
          <Input
            id={`cta-button-text-${section.id}`}
            value={(section.data as any).buttonText || ''}
            onChange={(e) => updateSectionData({ buttonText: e.target.value })}
            placeholder="Contact Us"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`cta-button-link-${section.id}`}>Button Link</Label>
          <Input
            id={`cta-button-link-${section.id}`}
            value={(section.data as any).buttonLink || ''}
            onChange={(e) => updateSectionData({ buttonLink: e.target.value })}
            placeholder="/contact"
          />
        </div>
      </div>
    </div>
  );
}