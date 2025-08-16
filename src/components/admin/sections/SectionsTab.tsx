import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, RotateCcw } from 'lucide-react';
import { SectionEditor } from './SectionEditor';
import { Section, createDefaultSection, SECTION_TYPES, PageBodySchema } from '@/lib/sections/schema';
import { adminToast } from '@/lib/toast-utils';
import { EmptyState } from '@/components/admin/EmptyState';

interface SectionsTabProps {
  pageBody: any;
  onUpdate: (body: any) => void;
}

export function SectionsTab({ pageBody, onUpdate }: SectionsTabProps) {
  const [selectedSectionType, setSelectedSectionType] = useState<string>('');

  // Parse existing sections or initialize empty array
  const getSections = (): Section[] => {
    try {
      if (!pageBody?.sections) return [];
      return Array.isArray(pageBody.sections) ? pageBody.sections : [];
    } catch (error) {
      console.error('Error parsing sections:', error);
      return [];
    }
  };

  const sections = getSections();

  const updateSections = (newSections: Section[]) => {
    try {
      const newBody = {
        sections: newSections
      };
      
      // Validate with Zod
      PageBodySchema.parse(newBody);
      onUpdate(newBody);
    } catch (error) {
      console.error('Sections validation failed:', error);
      adminToast.error('Invalid sections data', 'Please check your section configuration');
    }
  };

  const addSection = () => {
    if (!selectedSectionType) {
      adminToast.warning('Please select a section type');
      return;
    }

    try {
      const newSection = createDefaultSection(selectedSectionType as any);
      const newSections = [...sections, newSection];
      updateSections(newSections);
      setSelectedSectionType('');
      adminToast.success('Section added successfully');
    } catch (error) {
      console.error('Error adding section:', error);
      adminToast.error('Failed to add section');
    }
  };

  const updateSection = (index: number, updatedSection: Section) => {
    const newSections = [...sections];
    newSections[index] = updatedSection;
    updateSections(newSections);
  };

  const removeSection = (index: number) => {
    const newSections = sections.filter((_, i) => i !== index);
    updateSections(newSections);
    adminToast.success('Section removed');
  };

  const moveSectionUp = (index: number) => {
    if (index === 0) return;
    
    const newSections = [...sections];
    [newSections[index - 1], newSections[index]] = [newSections[index], newSections[index - 1]];
    updateSections(newSections);
  };

  const moveSectionDown = (index: number) => {
    if (index === sections.length - 1) return;
    
    const newSections = [...sections];
    [newSections[index], newSections[index + 1]] = [newSections[index + 1], newSections[index]];
    updateSections(newSections);
  };

  const resetToHomepageLayout = () => {
    const defaultSections: Section[] = [
      createDefaultSection('hero'),
      createDefaultSection('about'),
      createDefaultSection('servicesPreview'),
      createDefaultSection('portfolioPreview'),
      createDefaultSection('testimonials'),
      createDefaultSection('blogPreview'),
      createDefaultSection('cta'),
    ];
    
    updateSections(defaultSections);
    adminToast.success('Reset to default homepage layout');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle>Page Sections</CardTitle>
          <CardDescription>
            Build your page using dynamic sections. Drag to reorder, edit content inline.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Select value={selectedSectionType} onValueChange={setSelectedSectionType}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose section type to add" />
                </SelectTrigger>
                <SelectContent>
                  {SECTION_TYPES.map((type) => (
                    <SelectItem key={type.type} value={type.type}>
                      <div className="flex flex-col">
                        <span className="font-medium">{type.label}</span>
                        <span className="text-xs text-muted-foreground">{type.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Button onClick={addSection} disabled={!selectedSectionType}>
              <Plus className="h-4 w-4 mr-2" />
              Add Section
            </Button>
            
            <Button variant="outline" onClick={resetToHomepageLayout}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset to Homepage Layout
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sections List */}
      {sections.length === 0 ? (
        <EmptyState
          icon={Plus}
          title="No sections yet"
          description="Add your first section to start building your page layout."
          actionLabel="Add Section"
          actionTo="#"
        />
      ) : (
        <div className="space-y-4" role="list" aria-label="Page sections">
          {sections.map((section, index) => (
            <div key={section.id} role="listitem">
              <SectionEditor
                section={section}
                onUpdate={(updatedSection) => updateSection(index, updatedSection)}
                onRemove={() => removeSection(index)}
                onMoveUp={() => moveSectionUp(index)}
                onMoveDown={() => moveSectionDown(index)}
                canMoveUp={index > 0}
                canMoveDown={index < sections.length - 1}
              />
            </div>
          ))}
        </div>
      )}
      
      {/* Live update feedback */}
      <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
        <p className="font-medium mb-1">💡 Pro Tips:</p>
        <ul className="list-disc list-inside space-y-1 text-xs">
          <li>Changes auto-save when you edit section content</li>
          <li>Use the grip handles to reorder sections</li>
          <li>Preview sections will automatically pull published content</li>
          <li>Reset button restores recommended homepage layout</li>
        </ul>
      </div>
    </div>
  );
}