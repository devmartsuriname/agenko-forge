import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function ErrorBoundaryTest() {
  const [shouldError, setShouldError] = useState(false);

  if (shouldError) {
    throw new Error('Test error for error boundary validation');
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Error Boundary Test</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4">Click the button below to test error boundary functionality:</p>
        <Button 
          variant="destructive"
          onClick={() => setShouldError(true)}
        >
          Trigger Error
        </Button>
      </CardContent>
    </Card>
  );
}