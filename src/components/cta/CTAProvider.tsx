import React from 'react';
import { ExitIntentModal } from './ExitIntentModal';
import { StickyNewsletterBar } from './StickyNewsletterBar';
import { ScrollProgressCTA } from './ScrollProgressCTA';

interface CTAProviderProps {
  children: React.ReactNode;
  enableExitIntent?: boolean;
  enableStickyBar?: boolean;
  enableScrollProgress?: boolean;
  // Page-specific overrides
  exitIntentConfig?: {
    title?: string;
    description?: string;
    incentive?: string;
  };
  scrollProgressConfig?: {
    triggerAtPercentage?: number;
    title?: string;
    subtitle?: string;
  };
}

export function CTAProvider({
  children,
  enableExitIntent = true,
  enableStickyBar = true,
  enableScrollProgress = true,
  exitIntentConfig,
  scrollProgressConfig
}: CTAProviderProps) {
  return (
    <>
      {children}
      
      {/* Exit Intent Modal */}
      {enableExitIntent && (
        <ExitIntentModal
          enabled={true}
          {...exitIntentConfig}
        />
      )}

      {/* Sticky Newsletter Bar */}
      {enableStickyBar && (
        <StickyNewsletterBar
          enabled={true}
        />
      )}

      {/* Scroll Progress CTA */}
      {enableScrollProgress && (
        <ScrollProgressCTA
          enabled={true}
          {...scrollProgressConfig}
        />
      )}
    </>
  );
}