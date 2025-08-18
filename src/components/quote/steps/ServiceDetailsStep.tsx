import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { QuoteFormData, SERVICE_TYPES } from '@/types/quote';

interface ServiceDetailsStepProps {
  data: QuoteFormData;
  onUpdate: (updates: Partial<QuoteFormData>) => void;
}

export function ServiceDetailsStep({ data, onUpdate }: ServiceDetailsStepProps) {
  return (
    <div className="space-y-6">
      {/* Service Type Selection */}
      <div>
        <Label className="text-sm font-medium mb-3 block">
          What type of service do you need? *
        </Label>
        <div className="grid gap-3 md:grid-cols-2">
          {SERVICE_TYPES.map((service) => (
            <Card
              key={service.value}
              className={`cursor-pointer transition-colors hover:border-primary/50 ${
                data.serviceType === service.value ? 'border-primary bg-primary/5' : ''
              }`}
              onClick={() => onUpdate({ serviceType: service.value })}
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl" role="img" aria-hidden="true">
                    {service.icon}
                  </span>
                  <span className="font-medium text-sm">{service.label}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        {!data.serviceType && (
          <p className="text-sm text-destructive mt-2">
            Please select a service type
          </p>
        )}
      </div>

      {/* Project Scope */}
      <div>
        <Label htmlFor="project-scope" className="text-sm font-medium">
          Project Description *
        </Label>
        <Textarea
          id="project-scope"
          value={data.projectScope}
          onChange={(e) => onUpdate({ projectScope: e.target.value })}
          placeholder="Please describe your project in detail. Include specific features, functionality, design requirements, target audience, and any technical specifications you have in mind..."
          className="mt-2 min-h-[120px]"
          required
          aria-describedby="scope-help scope-error"
        />
        <div className="flex justify-between items-start mt-2">
          <p id="scope-help" className="text-xs text-muted-foreground">
            Minimum 10 characters. The more detail you provide, the more accurate our quote will be.
          </p>
          <span className="text-xs text-muted-foreground">
            {data.projectScope.length}/10 min
          </span>
        </div>
        {data.projectScope.length > 0 && data.projectScope.length < 10 && (
          <p id="scope-error" className="text-sm text-destructive mt-1">
            Please provide more details (minimum 10 characters)
          </p>
        )}
      </div>

      {/* Tips */}
      <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
        <h3 className="font-medium text-sm mb-2 text-blue-900 dark:text-blue-100">
          💡 Tips for a better quote
        </h3>
        <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
          <li>• Mention any existing systems or platforms you're using</li>
          <li>• Include design preferences or examples of sites/apps you like</li>
          <li>• Specify if you need ongoing maintenance or just development</li>
          <li>• Let us know about any compliance requirements (GDPR, accessibility, etc.)</li>
        </ul>
      </div>
    </div>
  );
}