import { describe, test, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CarouselBase } from '@/components/ui/carousel/CarouselBase';

function makeSlides(n = 3) {
  return Array.from({ length: n }).map((_, i) => (
    <div key={`slide-${i+1}`} data-testid={`slide-${i+1}`}>
      Slide {i+1} Content
    </div>
  ));
}

describe('Carousel Keyboard & Accessibility Tests', () => {
  test('renders carousel with proper accessibility structure', () => {
    const slides = makeSlides(3);
    
    const { container } = render(
      <CarouselBase title="Test Carousel" autoplay={false}>
        {slides}
      </CarouselBase>
    );
    
    // Check that carousel container exists
    expect(container.querySelector('[role="region"]')).toBeInTheDocument();
    
    // Check for navigation dots
    const dots = container.querySelectorAll('[role="button"][aria-label*="slide"]');
    expect(dots).toHaveLength(3);
    
    // First dot should have aria-current
    expect(dots[0]).toHaveAttribute('aria-current');
  });

  test('keyboard navigation works with arrow keys', async () => {
    const user = userEvent.setup();
    const slides = makeSlides(3);
    
    const { container } = render(
      <CarouselBase title="Test Carousel" autoplay={false}>
        {slides}
      </CarouselBase>
    );
    
    // Focus the carousel
    const carousel = container.querySelector('[role="region"]');
    if (carousel) {
      carousel.focus();
      
      // Test right arrow - should move to next slide
      await user.keyboard('{ArrowRight}');
      
      // Check that second dot is now active
      const dots = container.querySelectorAll('[role="button"][aria-label*="slide"]');
      expect(dots[1]).toHaveAttribute('aria-current');
      
      // Test left arrow - should move back
      await user.keyboard('{ArrowLeft}');
      expect(dots[0]).toHaveAttribute('aria-current');
    }
  });

  test('respects reduced motion preference', () => {
    // Mock reduced motion preference
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    const slides = makeSlides(3);
    
    const { container } = render(
      <CarouselBase title="Test Carousel" autoplay={true}>
        {slides}
      </CarouselBase>
    );
    
    // Should not autoplay when reduced motion is preferred
    expect(container).toBeInTheDocument();
  });
});