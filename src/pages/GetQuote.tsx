import React, { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SEOHead } from '@/lib/seo';
import { QuoteWizard } from '@/components/quote/QuoteWizard';
import { QuoteFormData } from '@/types/quote';
import { AutoBreadcrumb } from '@/components/ui/breadcrumb';
import { Badge } from '@/components/ui/badge';
import { GlobalNavigation } from '@/components/GlobalNavigation';
import Footer from '@/components/Footer';

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
        <GlobalNavigation overlay={false} />
        {/* Breadcrumb */}
        <div className="container mx-auto px-4 pt-8">
          <AutoBreadcrumb />
        </div>
        
        <div className="container mx-auto px-4 py-16">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="flex items-center justify-center mb-6">
              <Badge variant="outline" className="mb-4 px-4 py-2 text-sm font-medium border-primary/20 bg-primary/5 text-primary">
                Free Consultation
              </Badge>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              Get Your{' '}
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Project Quote
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Tell us about your project and we'll provide a detailed, no-obligation quote within 24 hours. 
              Our guided wizard helps us understand your specific needs and requirements.
            </p>
          </div>

          {/* Quote Wizard */}
          <QuoteWizard initialData={initialData} />
        </div>
        <Footer />
      </div>
    </>
  );
}