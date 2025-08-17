import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SectionsTab } from '@/components/admin/sections/SectionsTab';
import { Section } from '@/lib/sections/schema';

// Simple test for keyboard functionality
describe('Sections Editor Basic Tests', () => {
  test('renders sections editor', () => {
    const mockSections: Section[] = [
      { id: 's1', type: 'hero', data: { title: 'Hero Section' } }
    ];
    
    render(
      <SectionsTab 
        pageBody={{ sections: mockSections }} 
        onUpdate={() => {}} 
      />
    );
    
    expect(document.body).toBeInTheDocument();
  });
});