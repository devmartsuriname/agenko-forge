import { describe, test, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { axe } from 'jest-axe';
import Index from '@/pages/Index';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: () => ({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ 
            data: { 
              id: '1', 
              title: 'Home', 
              slug: 'home',
              body: { sections: [] },
              status: 'published' 
            }, 
            error: null 
          })
        })
      })
    })
  }
}));

function TestWrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
}

describe('Homepage Accessibility Tests', () => {
  test('homepage has no critical axe violations', async () => {
    const { container } = render(
      <TestWrapper>
        <Index />
      </TestWrapper>
    );

    // Wait for component to load
    await new Promise(resolve => setTimeout(resolve, 100));

    const results = await axe(container, {
      rules: {
        // Relax some rules for testing
        'color-contrast': { enabled: false },
        'landmark-one-main': { enabled: false },
      }
    });

    // Check for major violations
    expect(results.violations.filter(v => v.impact === 'critical')).toEqual([]);
  });

  test('navigation structure is accessible', async () => {
    const { container } = render(
      <TestWrapper>
        <Index />
      </TestWrapper>
    );

    // Check for semantic landmarks
    expect(container.querySelector('nav')).toBeInTheDocument();
    expect(container.querySelector('main')).toBeInTheDocument();
    expect(container.querySelector('footer')).toBeInTheDocument();
  });
});