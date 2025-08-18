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
import { ImageReplacer } from '@/components/admin/ImageReplacer';

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
      
      {/* Background Image Replacer */}
      <ImageReplacer
        sectionType="hero"
        sectionId={section.id}
        currentImage={(section.data as any).backgroundImage}
        onImageUpdate={(imageData) => updateSectionData({ backgroundImage: imageData })}
      />
    </div>
  );

  const renderAboutEditor = () => {
    const features = (section.data as any).features || [];
    
    const addFeature = () => {
      const newFeatures = [...features, { icon: 'Star', title: '', description: '' }];
      updateSectionData({ features: newFeatures });
    };
    
    const updateFeature = (index: number, updates: Partial<{ icon: string; title: string; description: string }>) => {
      const newFeatures = [...features];
      newFeatures[index] = { ...newFeatures[index], ...updates };
      updateSectionData({ features: newFeatures });
    };
    
    const removeFeature = (index: number) => {
      const newFeatures = features.filter((_: any, i: number) => i !== index);
      updateSectionData({ features: newFeatures });
    };
    
    return (
      <div className="space-y-6">
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
          
          <div className="space-y-2 border-l-4 border-primary pl-4">
            <Label htmlFor="about-image" className="text-base font-semibold">Image URL (Optional)</Label>
            <Input
              id="about-image"
              value={(section.data as any).image || ''}
              onChange={(e) => updateSectionData({ image: e.target.value })}
              placeholder="https://example.com/about-image.jpg"
              type="url"
              className="border-primary/20"
            />
            <p className="text-xs text-muted-foreground">Add an image to display alongside the about content</p>
          </div>
        </div>

        {/* Features Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold">Features (Optional)</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addFeature}
              className="flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Feature</span>
            </Button>
          </div>
          
          {features.length > 0 && (
            <div className="space-y-4">
              {features.map((feature: any, index: number) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Feature #{index + 1}</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFeature(index)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor={`feature-${index}-icon`}>Icon</Label>
                      <Input
                        id={`feature-${index}-icon`}
                        value={feature.icon || ''}
                        onChange={(e) => updateFeature(index, { icon: e.target.value })}
                        placeholder="Star"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`feature-${index}-title`}>Title</Label>
                      <Input
                        id={`feature-${index}-title`}
                        value={feature.title || ''}
                        onChange={(e) => updateFeature(index, { title: e.target.value })}
                        placeholder="Feature Title"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`feature-${index}-description`}>Description</Label>
                      <Input
                        id={`feature-${index}-description`}
                        value={feature.description || ''}
                        onChange={(e) => updateFeature(index, { description: e.target.value })}
                        placeholder="Feature description"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

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

      {/* Background Image Replacer */}
      <ImageReplacer
        sectionType="servicesPreview"
        sectionId={section.id}
        currentImage={(section.data as any).backgroundImage}
        onImageUpdate={(imageData) => updateSectionData({ backgroundImage: imageData })}
      />
    </div>
  );

  const renderPortfolioPreviewEditor = () => {
    const isCarousel = (section.data as any).layout === 'carousel';
    
    return (
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
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          
          <div className="space-y-2">
            <Label htmlFor="portfolio-layout">Display Style</Label>
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
          
          <div className="flex items-center space-x-2 pt-6">
            <Switch
              id="portfolio-show-all"
              checked={(section.data as any).showAll || false}
              onCheckedChange={(checked) => updateSectionData({ showAll: checked })}
            />
            <Label htmlFor="portfolio-show-all">Show "View All" Link</Label>
          </div>
        </div>

        {/* Carousel Settings */}
        {isCarousel && (
          <div className="border rounded-lg p-4 space-y-4 bg-muted/50">
            <h4 className="font-semibold text-sm">Carousel Settings</h4>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="portfolio-slides-xs">Mobile (XS)</Label>
                <Select
                  value={String((section.data as any).carousel?.slidesPerView?.xs || 1)}
                  onValueChange={(value) => updateSectionData({ 
                    carousel: { 
                      ...(section.data as any).carousel, 
                      slidesPerView: { 
                        ...(section.data as any).carousel?.slidesPerView, 
                        xs: parseInt(value) 
                      } 
                    } 
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3].map((num) => (
                      <SelectItem key={num} value={String(num)}>{num}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="portfolio-slides-sm">Small (SM)</Label>
                <Select
                  value={String((section.data as any).carousel?.slidesPerView?.sm || 1)}
                  onValueChange={(value) => updateSectionData({ 
                    carousel: { 
                      ...(section.data as any).carousel, 
                      slidesPerView: { 
                        ...(section.data as any).carousel?.slidesPerView, 
                        sm: parseInt(value) 
                      } 
                    } 
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3].map((num) => (
                      <SelectItem key={num} value={String(num)}>{num}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="portfolio-slides-md">Medium (MD)</Label>
                <Select
                  value={String((section.data as any).carousel?.slidesPerView?.md || 2)}
                  onValueChange={(value) => updateSectionData({ 
                    carousel: { 
                      ...(section.data as any).carousel, 
                      slidesPerView: { 
                        ...(section.data as any).carousel?.slidesPerView, 
                        md: parseInt(value) 
                      } 
                    } 
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4].map((num) => (
                      <SelectItem key={num} value={String(num)}>{num}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="portfolio-slides-lg">Large (LG)</Label>
                <Select
                  value={String((section.data as any).carousel?.slidesPerView?.lg || 3)}
                  onValueChange={(value) => updateSectionData({ 
                    carousel: { 
                      ...(section.data as any).carousel, 
                      slidesPerView: { 
                        ...(section.data as any).carousel?.slidesPerView, 
                        lg: parseInt(value) 
                      } 
                    } 
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6].map((num) => (
                      <SelectItem key={num} value={String(num)}>{num}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="portfolio-autoplay"
                  checked={(section.data as any).carousel?.autoplay || false}
                  onCheckedChange={(checked) => updateSectionData({ 
                    carousel: { 
                      ...(section.data as any).carousel, 
                      autoplay: checked 
                    } 
                  })}
                />
                <Label htmlFor="portfolio-autoplay">Autoplay</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="portfolio-loop"
                  checked={(section.data as any).carousel?.loop !== false}
                  onCheckedChange={(checked) => updateSectionData({ 
                    carousel: { 
                      ...(section.data as any).carousel, 
                      loop: checked 
                    } 
                  })}
                />
                <Label htmlFor="portfolio-loop">Loop</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="portfolio-arrows"
                  checked={(section.data as any).carousel?.showArrows !== false}
                  onCheckedChange={(checked) => updateSectionData({ 
                    carousel: { 
                      ...(section.data as any).carousel, 
                      showArrows: checked 
                    } 
                  })}
                />
                <Label htmlFor="portfolio-arrows">Arrows</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="portfolio-dots"
                  checked={(section.data as any).carousel?.showDots !== false}
                  onCheckedChange={(checked) => updateSectionData({ 
                    carousel: { 
                      ...(section.data as any).carousel, 
                      showDots: checked 
                    } 
                  })}
                />
                <Label htmlFor="portfolio-dots">Dots</Label>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Aspect Ratio</Label>
                <Select
                  value={(section.data as any).carousel?.aspectRatio || '16/9'}
                  onValueChange={(value) => updateSectionData({ 
                    carousel: { 
                      ...(section.data as any).carousel, 
                      aspectRatio: value as '16/9' | '4/3' | '1/1'
                    } 
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="16/9">16:9 (Widescreen)</SelectItem>
                    <SelectItem value="4/3">4:3 (Standard)</SelectItem>
                    <SelectItem value="1/1">1:1 (Square)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Image Fit</Label>
                <Select
                  value={(section.data as any).carousel?.imageFit || 'cover'}
                  onValueChange={(value) => updateSectionData({ 
                    carousel: { 
                      ...(section.data as any).carousel, 
                      imageFit: value as 'cover' | 'contain'
                    } 
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cover">Cover (Crop to fit)</SelectItem>
                    <SelectItem value="contain">Contain (Show full image)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderBlogPreviewEditor = () => {
    const isCarousel = (section.data as any).layout === 'carousel';
    
    return (
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
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          
          <div className="space-y-2">
            <Label htmlFor="blog-layout">Display Style</Label>
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
          
          <div className="flex items-center space-x-2 pt-6">
            <Switch
              id="blog-show-all"
              checked={(section.data as any).showAll || false}
              onCheckedChange={(checked) => updateSectionData({ showAll: checked })}
            />
            <Label htmlFor="blog-show-all">Show "View All" Link</Label>
          </div>
        </div>

        {/* Carousel Settings */}
        {isCarousel && (
          <div className="border rounded-lg p-4 space-y-4 bg-muted/50">
            <h4 className="font-semibold text-sm">Carousel Settings</h4>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="blog-slides-xs">Mobile (XS)</Label>
                <Select
                  value={String((section.data as any).carousel?.slidesPerView?.xs || 1)}
                  onValueChange={(value) => updateSectionData({ 
                    carousel: { 
                      ...(section.data as any).carousel, 
                      slidesPerView: { 
                        ...(section.data as any).carousel?.slidesPerView, 
                        xs: parseInt(value) 
                      } 
                    } 
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3].map((num) => (
                      <SelectItem key={num} value={String(num)}>{num}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="blog-slides-sm">Small (SM)</Label>
                <Select
                  value={String((section.data as any).carousel?.slidesPerView?.sm || 1)}
                  onValueChange={(value) => updateSectionData({ 
                    carousel: { 
                      ...(section.data as any).carousel, 
                      slidesPerView: { 
                        ...(section.data as any).carousel?.slidesPerView, 
                        sm: parseInt(value) 
                      } 
                    } 
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3].map((num) => (
                      <SelectItem key={num} value={String(num)}>{num}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="blog-slides-md">Medium (MD)</Label>
                <Select
                  value={String((section.data as any).carousel?.slidesPerView?.md || 2)}
                  onValueChange={(value) => updateSectionData({ 
                    carousel: { 
                      ...(section.data as any).carousel, 
                      slidesPerView: { 
                        ...(section.data as any).carousel?.slidesPerView, 
                        md: parseInt(value) 
                      } 
                    } 
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4].map((num) => (
                      <SelectItem key={num} value={String(num)}>{num}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="blog-slides-lg">Large (LG)</Label>
                <Select
                  value={String((section.data as any).carousel?.slidesPerView?.lg || 3)}
                  onValueChange={(value) => updateSectionData({ 
                    carousel: { 
                      ...(section.data as any).carousel, 
                      slidesPerView: { 
                        ...(section.data as any).carousel?.slidesPerView, 
                        lg: parseInt(value) 
                      } 
                    } 
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6].map((num) => (
                      <SelectItem key={num} value={String(num)}>{num}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="blog-autoplay"
                  checked={(section.data as any).carousel?.autoplay || false}
                  onCheckedChange={(checked) => updateSectionData({ 
                    carousel: { 
                      ...(section.data as any).carousel, 
                      autoplay: checked 
                    } 
                  })}
                />
                <Label htmlFor="blog-autoplay">Autoplay</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="blog-loop"
                  checked={(section.data as any).carousel?.loop !== false}
                  onCheckedChange={(checked) => updateSectionData({ 
                    carousel: { 
                      ...(section.data as any).carousel, 
                      loop: checked 
                    } 
                  })}
                />
                <Label htmlFor="blog-loop">Loop</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="blog-arrows"
                  checked={(section.data as any).carousel?.showArrows !== false}
                  onCheckedChange={(checked) => updateSectionData({ 
                    carousel: { 
                      ...(section.data as any).carousel, 
                      showArrows: checked 
                    } 
                  })}
                />
                <Label htmlFor="blog-arrows">Arrows</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="blog-dots"
                  checked={(section.data as any).carousel?.showDots !== false}
                  onCheckedChange={(checked) => updateSectionData({ 
                    carousel: { 
                      ...(section.data as any).carousel, 
                      showDots: checked 
                    } 
                  })}
                />
                <Label htmlFor="blog-dots">Dots</Label>
              </div>
            </div>
          </div>
        )}

        {/* Background Image Replacer */}
        <ImageReplacer
          sectionType="blogPreview"
          sectionId={section.id}
          currentImage={(section.data as any).backgroundImage}
          onImageUpdate={(imageData) => updateSectionData({ backgroundImage: imageData })}
        />
      </div>
    );
  };

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
      
      {/* Background Image Replacer */}
      <ImageReplacer
        sectionType="cta"
        sectionId={section.id}
        currentImage={(section.data as any).backgroundImage}
        onImageUpdate={(imageData) => updateSectionData({ backgroundImage: imageData })}
      />
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
        <CardContent className="max-h-none overflow-visible">
          {renderEditor()}
        </CardContent>
      )}
    </Card>
  );
}