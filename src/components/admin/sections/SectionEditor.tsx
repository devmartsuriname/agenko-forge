import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { Section, SectionSchema, SECTION_TYPES } from '@/lib/sections/schema';
import { adminToast } from '@/lib/toast-utils';

interface SectionEditorProps {
  section: Section;
  onUpdate: (section: Section) => void;
  onRemove: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
}

export function SectionEditor({ 
  section, 
  onUpdate, 
  onRemove, 
  onMoveUp, 
  onMoveDown,
  canMoveUp,
  canMoveDown 
}: SectionEditorProps) {
  const [isExpanded, setIsExpanded] = useState(false);

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

  const renderHeroEditor = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="hero-title">Title *</Label>
          <Input
            id="hero-title"
            value={section.data.title || ''}
            onChange={(e) => updateSectionData({ title: e.target.value })}
            placeholder="Welcome to Devmart"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="hero-subtitle">Subtitle</Label>
          <Input
            id="hero-subtitle"
            value={(section.data as any).subtitle || ''}
            onChange={(e) => updateSectionData({ subtitle: e.target.value })}
            placeholder="Your Technology Partner"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="hero-description">Description</Label>
        <Textarea
          id="hero-description"
          value={(section.data as any).description || ''}
          onChange={(e) => updateSectionData({ description: e.target.value })}
          placeholder="We build innovative solutions that drive business growth."
          rows={3}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="hero-cta-text">CTA Text</Label>
          <Input
            id="hero-cta-text"
            value={(section.data as any).ctaText || ''}
            onChange={(e) => updateSectionData({ ctaText: e.target.value })}
            placeholder="Get Started"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="hero-cta-link">CTA Link</Label>
          <Input
            id="hero-cta-link"
            value={(section.data as any).ctaLink || ''}
            onChange={(e) => updateSectionData({ ctaLink: e.target.value })}
            placeholder="/contact"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="hero-bg-image">Background Image URL</Label>
        <Input
          id="hero-bg-image"
          value={(section.data as any).backgroundImage || ''}
          onChange={(e) => updateSectionData({ backgroundImage: e.target.value })}
          placeholder="https://example.com/hero-image.jpg"
          type="url"
        />
      </div>
    </div>
  );

  const renderAboutEditor = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="about-title">Title *</Label>
        <Input
          id="about-title"
          value={section.data.title || ''}
          onChange={(e) => updateSectionData({ title: e.target.value })}
          placeholder="About Devmart"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="about-description">Description *</Label>
        <Textarea
          id="about-description"
          value={(section.data as any).description || ''}
          onChange={(e) => updateSectionData({ description: e.target.value })}
          placeholder="We are a technology company focused on delivering innovative solutions."
          rows={4}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="about-image">Image URL</Label>
        <Input
          id="about-image"
          value={(section.data as any).image || ''}
          onChange={(e) => updateSectionData({ image: e.target.value })}
          placeholder="https://example.com/about-image.jpg"
          type="url"
        />
      </div>
    </div>
  );

  const renderServicePreviewEditor = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="services-title">Title *</Label>
        <Input
          id="services-title"
          value={section.data.title || ''}
          onChange={(e) => updateSectionData({ title: e.target.value })}
          placeholder="Our Services"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="services-description">Description</Label>
        <Textarea
          id="services-description"
          value={(section.data as any).description || ''}
          onChange={(e) => updateSectionData({ description: e.target.value })}
          placeholder="Comprehensive technology solutions for your business."
          rows={3}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="services-limit">Number to Show</Label>
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
        
        <div className="flex items-center space-x-2">
          <Switch
            id="services-show-all"
            checked={(section.data as any).showAll || false}
            onCheckedChange={(checked) => updateSectionData({ showAll: checked })}
          />
          <Label htmlFor="services-show-all">Show "View All" Link</Label>
        </div>
      </div>
    </div>
  );

  const renderPortfolioPreviewEditor = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="portfolio-title">Title *</Label>
        <Input
          id="portfolio-title"
          value={section.data.title || ''}
          onChange={(e) => updateSectionData({ title: e.target.value })}
          placeholder="Our Work"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="portfolio-description">Description</Label>
        <Textarea
          id="portfolio-description"
          value={(section.data as any).description || ''}
          onChange={(e) => updateSectionData({ description: e.target.value })}
          placeholder="Explore our portfolio of successful projects."
          rows={3}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="portfolio-limit">Number to Show</Label>
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
        
        <div className="flex items-center space-x-2">
          <Switch
            id="portfolio-show-all"
            checked={(section.data as any).showAll || false}
            onCheckedChange={(checked) => updateSectionData({ showAll: checked })}
          />
          <Label htmlFor="portfolio-show-all">Show "View All" Link</Label>
        </div>
      </div>
    </div>
  );

  const renderBlogPreviewEditor = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="blog-title">Title *</Label>
        <Input
          id="blog-title"
          value={section.data.title || ''}
          onChange={(e) => updateSectionData({ title: e.target.value })}
          placeholder="Latest Insights"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="blog-description">Description</Label>
        <Textarea
          id="blog-description"
          value={(section.data as any).description || ''}
          onChange={(e) => updateSectionData({ description: e.target.value })}
          placeholder="Stay updated with our latest thoughts and industry trends."
          rows={3}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="blog-limit">Number to Show</Label>
          <Select
            value={String((section.data as any).limit || 3)}
            onValueChange={(value) => updateSectionData({ limit: parseInt(value) })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[3, 6, 9, 12].map((num) => (
                <SelectItem key={num} value={String(num)}>
                  {num} Posts
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="blog-show-all"
            checked={(section.data as any).showAll || false}
            onCheckedChange={(checked) => updateSectionData({ showAll: checked })}
          />
          <Label htmlFor="blog-show-all">Show "View All" Link</Label>
        </div>
      </div>
    </div>
  );

  const renderCtaEditor = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="cta-title">Title *</Label>
        <Input
          id="cta-title"
          value={section.data.title || ''}
          onChange={(e) => updateSectionData({ title: e.target.value })}
          placeholder="Ready to Get Started?"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="cta-description">Description</Label>
        <Textarea
          id="cta-description"
          value={(section.data as any).description || ''}
          onChange={(e) => updateSectionData({ description: e.target.value })}
          placeholder="Let's discuss your project and how we can help."
          rows={3}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="cta-primary-text">Primary CTA Text *</Label>
          <Input
            id="cta-primary-text"
            value={(section.data as any).primaryCta?.text || ''}
            onChange={(e) => updateSectionData({ 
              primaryCta: { 
                ...(section.data as any).primaryCta, 
                text: e.target.value 
              } 
            })}
            placeholder="Start Your Project"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cta-primary-link">Primary CTA Link *</Label>
          <Input
            id="cta-primary-link"
            value={(section.data as any).primaryCta?.link || ''}
            onChange={(e) => updateSectionData({ 
              primaryCta: { 
                ...(section.data as any).primaryCta, 
                link: e.target.value 
              } 
            })}
            placeholder="/contact"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="cta-bg-image">Background Image URL</Label>
        <Input
          id="cta-bg-image"
          value={(section.data as any).backgroundImage || ''}
          onChange={(e) => updateSectionData({ backgroundImage: e.target.value })}
          placeholder="https://example.com/cta-background.jpg"
          type="url"
        />
      </div>
    </div>
  );

  const renderEditor = () => {
    switch (section.type) {
      case 'hero':
        return renderHeroEditor();
      case 'about':
        return renderAboutEditor();
      case 'servicesPreview':
        return renderServicePreviewEditor();
      case 'portfolioPreview':
        return renderPortfolioPreviewEditor();
      case 'blogPreview':
        return renderBlogPreviewEditor();
      case 'cta':
        return renderCtaEditor();
      case 'testimonials':
        return (
          <div className="text-center text-muted-foreground py-8">
            <p>Testimonials editor coming soon</p>
            <p className="text-sm">Use the JSON editor for now</p>
          </div>
        );
      default:
        return (
          <div className="text-center text-muted-foreground py-8">
            <p>Unknown section type: {(section as any).type}</p>
          </div>
        );
    }
  };

  const sectionType = SECTION_TYPES.find(t => t.type === section.type);

  return (
    <Card className="relative">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex flex-col space-y-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={onMoveUp}
                disabled={!canMoveUp}
                className="h-4 w-6 p-0 hover:bg-muted"
              >
                <GripVertical className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onMoveDown}
                disabled={!canMoveDown}
                className="h-4 w-6 p-0 hover:bg-muted"
              >
                <GripVertical className="h-3 w-3" />
              </Button>
            </div>
            
            <div>
              <CardTitle className="text-lg">{section.data.title || 'Untitled Section'}</CardTitle>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant="secondary">{sectionType?.label || section.type}</Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  {isExpanded ? 'Collapse' : 'Expand'}
                </Button>
              </div>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent>
          {renderEditor()}
        </CardContent>
      )}
    </Card>
  );
}