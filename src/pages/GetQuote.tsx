import React, { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SEOHead } from '@/lib/seo';
import { QuoteWizard } from '@/components/quote/QuoteWizard';
import { QuoteFormData } from '@/types/quote';

export default function GetQuote() {
  const [searchParams] = useSearchParams();
  
  const initialData = useMemo((): Partial<QuoteFormData> => {
    const service = searchParams.get('service');
    const budget = searchParams.get('budget');
    
    const data: Partial<QuoteFormData> = {};
    
    if (service) {
      // Map service names to service types
      const serviceMap: Record<string, string> = {
        'starter': 'Web Development',
        'professional': 'Web Development',
        'enterprise': 'Web Development',
        'custom': 'Custom Development'
      };
      data.serviceType = serviceMap[service.toLowerCase()] || 'Web Development';
    }
    
    if (budget && budget !== 'not-sure') {
      // Map budget values to budget ranges
      const budgetNum = parseInt(budget.replace(/[,$]/g, ''));
      if (budgetNum <= 5000) {
        data.budgetRange = '$1,000 - $5,000';
      } else if (budgetNum <= 10000) {
        data.budgetRange = '$5,000 - $10,000';
      } else if (budgetNum <= 25000) {
        data.budgetRange = '$10,000 - $25,000';
      } else {
        data.budgetRange = '$25,000+';
      }
    }
    
    return data;
  }, [searchParams]);
  return (
    <>
      <SEOHead 
        title="Get a Quote - Free Project Estimate"
        description="Get a detailed quote for your project. Our guided wizard helps us understand your needs to provide an accurate estimate within 24 hours."
        url="/get-quote"
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
          <QuoteWizard initialData={initialData} />
        </div>
      </div>
    </>
  );
}