import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import { QuoteFormData, QuoteWizardStep } from '@/types/quote';
import { ContactInfoStep } from './steps/ContactInfoStep';
import { ServiceDetailsStep } from './steps/ServiceDetailsStep';
import { BudgetTimelineStep } from './steps/BudgetTimelineStep';
import { ReviewStep } from './steps/ReviewStep';
import { SuccessStep } from './steps/SuccessStep';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface QuoteWizardProps {
  initialData?: Partial<QuoteFormData>;
  onComplete?: (data: QuoteFormData) => void;
}

const WIZARD_STEPS: QuoteWizardStep[] = [
  {
    id: 1,
    title: "Contact Information",
    description: "Tell us about yourself",
    fields: ['name', 'email'],
    isValid: (data) => !!(data.name && data.email)
  },
  {
    id: 2,
    title: "Service Details",
    description: "What can we help you with?",
    fields: ['serviceType', 'projectScope'],
    isValid: (data) => !!(data.serviceType && data.projectScope && data.projectScope.length >= 10)
  },
  {
    id: 3,
    title: "Budget & Timeline",
    description: "Help us understand your project constraints",
    fields: ['budgetRange', 'timeline'],
    isValid: (data) => !!(data.budgetRange && data.timeline)
  },
  {
    id: 4,
    title: "Review & Submit",
    description: "Review your information before submitting",
    fields: [],
    isValid: () => true
  }
];

export function QuoteWizard({ initialData = {}, onComplete }: QuoteWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isComplete, setIsComplete] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [quoteId, setQuoteId] = useState<string | null>(null);
  
  // Get URL parameters for prefilling
  const [urlParams] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return {
        service: params.get('service'),
        budget: params.get('budget'),
        timeline: params.get('timeline')
      };
    }
    return {};
  });
  
  const [formData, setFormData] = useState<QuoteFormData>(() => {
    const baseData = {
      name: '',
      email: '',
      company: '',
      phone: '',
      serviceType: '',
      projectScope: '',
      budgetRange: '',
      timeline: '',
      additionalRequirements: '',
      ...initialData
    };

    // Try to load from localStorage first
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('quote-wizard-data');
      if (saved && Object.keys(initialData).length === 0) {
        try {
          const parsed = JSON.parse(saved);
          baseData.name = parsed.name || baseData.name;
          baseData.email = parsed.email || baseData.email;
          baseData.company = parsed.company || baseData.company;
          baseData.phone = parsed.phone || baseData.phone;
          baseData.serviceType = parsed.serviceType || baseData.serviceType;
          baseData.projectScope = parsed.projectScope || baseData.projectScope;
          baseData.budgetRange = parsed.budgetRange || baseData.budgetRange;
          baseData.timeline = parsed.timeline || baseData.timeline;
          baseData.additionalRequirements = parsed.additionalRequirements || baseData.additionalRequirements;
        } catch (error) {
          console.error('Error parsing saved quote data:', error);
        }
      }
    }

    // Apply URL parameters for prefilling (override saved data)
    if (urlParams.service) {
      // Map service names from pricing page to our service types
      const serviceMap: Record<string, string> = {
        'starter': 'web-development',
        'business': 'e-commerce',
        'pro': 'custom-software',
        'enterprise': 'consulting'
      };
      baseData.serviceType = serviceMap[urlParams.service] || urlParams.service;
    }
    
    if (urlParams.budget) {
      // Map pricing to budget ranges
      const budgetMap: Record<string, string> = {
        '2999': '5k-15k',
        '5999': '5k-15k', 
        '9999': '15k-50k',
        'custom': 'not-sure'
      };
      baseData.budgetRange = budgetMap[urlParams.budget] || urlParams.budget;
    }
    
    if (urlParams.timeline) {
      baseData.timeline = urlParams.timeline;
    }

    return baseData;
  });

  // Auto-save form data to localStorage (skip initial effect to avoid overriding URL params)
  useEffect(() => {
    let isFirstRun = true;
    return () => {
      if (!isFirstRun) {
        localStorage.setItem('quote-wizard-data', JSON.stringify(formData));
      }
      isFirstRun = false;
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('quote-wizard-data', JSON.stringify(formData));
  }, [formData]);

  const updateFormData = (updates: Partial<QuoteFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const currentStepData = WIZARD_STEPS.find(step => step.id === currentStep);
  const progress = ((currentStep - 1) / (WIZARD_STEPS.length - 1)) * 100;

  const canGoNext = () => {
    if (!currentStepData) return false;
    return currentStepData.isValid(formData);
  };

  const canGoPrevious = () => {
    return currentStep > 1 && !isComplete;
  };

  const goToNext = () => {
    if (!canGoNext()) return;
    
    if (currentStep < WIZARD_STEPS.length) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const goToPrevious = () => {
    if (canGoPrevious()) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke('submit-quote-request', {
        body: {
          name: formData.name,
          email: formData.email,
          company: formData.company,
          phone: formData.phone,
          serviceType: formData.serviceType,
          projectScope: formData.projectScope,
          budgetRange: formData.budgetRange,
          timeline: formData.timeline,
          additionalRequirements: formData.additionalRequirements
        }
      });

      if (error) {
        throw new Error(error.message || 'Failed to submit quote request');
      }

      // Clear saved data
      localStorage.removeItem('quote-wizard-data');
      
      setQuoteId(data.quoteId);
      setIsComplete(true);
      toast.success('Quote request submitted successfully!');
      onComplete?.(formData);

    } catch (error) {
      console.error('Quote submission error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit quote request';
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const renderCurrentStep = () => {
    if (isComplete) {
      return <SuccessStep quoteId={quoteId} formData={formData} />;
    }

    switch (currentStep) {
      case 1:
        return (
          <ContactInfoStep
            data={formData}
            onUpdate={updateFormData}
          />
        );
      case 2:
        return (
          <ServiceDetailsStep
            data={formData}
            onUpdate={updateFormData}
          />
        );
      case 3:
        return (
          <BudgetTimelineStep
            data={formData}
            onUpdate={updateFormData}
          />
        );
      case 4:
        return (
          <ReviewStep
            data={formData}
            onUpdate={updateFormData}
            onSubmit={handleSubmit}
            submitting={submitting}
          />
        );
      default:
        return null;
    }
  };

  if (isComplete) {
    return (
      <div className="max-w-2xl mx-auto">
        <SuccessStep quoteId={quoteId} formData={formData} />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Progress Header */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <CardTitle className="text-lg">
                Step {currentStep} of {WIZARD_STEPS.length}
              </CardTitle>
              <CardDescription>
                {currentStepData?.title}
              </CardDescription>
            </div>
            <div className="text-sm text-muted-foreground">
              {Math.round(progress)}% Complete
            </div>
          </div>
          <Progress value={progress} className="w-full" />
        </CardHeader>
      </Card>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle>{currentStepData?.title}</CardTitle>
          <CardDescription>{currentStepData?.description}</CardDescription>
        </CardHeader>
        <CardContent>
          {renderCurrentStep()}
        </CardContent>
      </Card>

      {/* Navigation */}
      {!isComplete && currentStep < WIZARD_STEPS.length && (
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={goToPrevious}
            disabled={!canGoPrevious()}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          <Button
            onClick={goToNext}
            disabled={!canGoNext()}
            className="flex items-center gap-2"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Step Indicators */}
      <div className="flex justify-center space-x-2">
        {WIZARD_STEPS.map((step) => (
          <div
            key={step.id}
            className={`w-3 h-3 rounded-full transition-colors ${
              step.id < currentStep
                ? 'bg-primary'
                : step.id === currentStep
                ? 'bg-primary/70'
                : 'bg-muted'
            }`}
            aria-label={`Step ${step.id}: ${step.title}`}
          />
        ))}
      </div>
    </div>
  );
}