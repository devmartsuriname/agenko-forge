import { describe, test, expect } from 'vitest';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SectionsTab } from '@/components/admin/sections/SectionsTab';
import { Section } from '@/lib/sections/schema';

function makeSections(): Section[] {
  return [
    { type: 'hero' as const, id: 's1', data: { title: 'Hero' } },
    { type: 'about' as const, id: 's2', data: { title: 'About' } },
    { type: 'servicesPreview' as const, id: 's3', data: { title: 'Services' } },
  ];
}

describe('Sections Editor Keyboard Reordering Tests', () => {
  test('renders sections editor with proper structure', () => {
    const mockSections: Section[] = makeSections();
    
    const { container } = render(
      <SectionsTab 
        pageBody={{ sections: mockSections }} 
        onUpdate={() => {}} 
      />
    );
    
    // Check that sections list is rendered with proper role
    const sectionsList = container.querySelector('[role="list"]');
    expect(sectionsList).toBeInTheDocument();
    expect(sectionsList).toHaveAttribute('aria-label', expect.stringContaining('Page sections'));
  });

  test('keyboard navigation help is displayed', () => {
    const mockSections: Section[] = makeSections();
    
    const { container } = render(
      <SectionsTab 
        pageBody={{ sections: mockSections }} 
        onUpdate={() => {}} 
      />
    );
    
    // Check that keyboard help section exists
    const helpSection = container.querySelector('[aria-label="Keyboard navigation help"]');
    expect(helpSection).toBeInTheDocument();
    expect(helpSection).toHaveTextContent('Ctrl+↑/↓');
  });

  test('sections are rendered with proper accessibility attributes', () => {
    const mockSections: Section[] = makeSections();
    
    const { container } = render(
      <SectionsTab 
        pageBody={{ sections: mockSections }} 
        onUpdate={() => {}} 
      />
    );
    
    // Check that sections are rendered
    const sectionCards = container.querySelectorAll('[role="listitem"]');
    expect(sectionCards).toHaveLength(3);
    
    // Each section should be focusable and have proper attributes
    sectionCards.forEach((card) => {
      expect(card).toHaveAttribute('tabIndex');
    });
  });
});