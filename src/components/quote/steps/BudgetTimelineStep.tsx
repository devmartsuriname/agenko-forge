import React from 'react';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { QuoteFormData, BUDGET_RANGES, TIMELINE_OPTIONS } from '@/types/quote';
import { DollarSign, Clock } from 'lucide-react';

interface BudgetTimelineStepProps {
  data: QuoteFormData;
  onUpdate: (updates: Partial<QuoteFormData>) => void;
}

export function BudgetTimelineStep({ data, onUpdate }: BudgetTimelineStepProps) {
  return (
    <div className="space-y-8">
      {/* Budget Range */}
      <div>
        <Label className="text-sm font-medium mb-3 block flex items-center gap-2">
          <DollarSign className="h-4 w-4" />
          What's your budget range? *
        </Label>
        <div className="grid gap-3 md:grid-cols-2">
          {BUDGET_RANGES.map((budget) => (
            <Card
              key={budget.value}
              className={`cursor-pointer transition-colors hover:border-primary/50 ${
                data.budgetRange === budget.value ? 'border-primary bg-primary/5' : ''
              }`}
              onClick={() => onUpdate({ budgetRange: budget.value })}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{budget.label}</span>
                  {budget.value === 'not-sure' && (
                    <Badge variant="secondary" className="text-xs">
                      Recommended
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        {!data.budgetRange && (
          <p className="text-sm text-destructive mt-2">
            Please select a budget range
          </p>
        )}
        <div className="bg-yellow-50 dark:bg-yellow-950/20 p-3 rounded-lg mt-4">
          <p className="text-xs text-yellow-800 dark:text-yellow-200">
            💰 <strong>Budget tip:</strong> These ranges help us provide an accurate quote. 
            If you're unsure, select "Not sure" and we'll provide options at different price points.
          </p>
        </div>
      </div>

      {/* Timeline */}
      <div>
        <Label className="text-sm font-medium mb-3 block flex items-center gap-2">
          <Clock className="h-4 w-4" />
          When do you need this completed? *
        </Label>
        <div className="grid gap-3 md:grid-cols-2">
          {TIMELINE_OPTIONS.map((timeline) => (
            <Card
              key={timeline.value}
              className={`cursor-pointer transition-colors hover:border-primary/50 ${
                data.timeline === timeline.value ? 'border-primary bg-primary/5' : ''
              }`}
              onClick={() => onUpdate({ timeline: timeline.value })}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{timeline.label}</span>
                  {timeline.value === 'asap' && (
                    <Badge variant="destructive" className="text-xs">
                      Rush
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        {!data.timeline && (
          <p className="text-sm text-destructive mt-2">
            Please select a timeline
          </p>
        )}
        <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-lg mt-4">
          <p className="text-xs text-green-800 dark:text-green-200">
            ⏰ <strong>Timeline tip:</strong> Rush projects (ASAP) may include additional charges. 
            More flexible timelines often result in better pricing and quality.
          </p>
        </div>
      </div>
    </div>
  );
}