import React from 'react';
import { SEOHead } from '@/lib/seo';
import { QuoteWizard } from '@/components/quote/QuoteWizard';

export default function GetQuote() {
  return (
    <>
      <SEOHead 
        title="Get a Quote - Free Project Estimate"
        description="Get a detailed quote for your project. Our guided wizard helps us understand your needs to provide an accurate estimate within 24 hours."
        canonicalUrl="/get-quote"
      />
      
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
              Get Your Project Quote
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Tell us about your project and we'll provide a detailed, no-obligation quote within 24 hours.
            </p>
          </div>

          {/* Quote Wizard */}
          <QuoteWizard />
        </div>
      </div>
    </>
  );
}