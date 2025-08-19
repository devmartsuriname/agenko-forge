import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle, ArrowLeft, Home } from 'lucide-react';

export default function PaymentCanceled() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <XCircle className="w-10 h-10 text-red-600" />
          </div>
          <CardTitle className="text-2xl text-red-700">Payment Canceled</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="text-center text-muted-foreground">
            <p>Your payment was canceled. No charges were made.</p>
          </div>

          <div className="flex flex-col gap-3 pt-4">
            <Button asChild>
              <Link to="/admin/test-harness">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Test Harness
              </Link>
            </Button>
            
            <Button variant="outline" asChild>
              <Link to="/">
                <Home className="w-4 h-4 mr-2" />
                Go to Homepage
              </Link>
            </Button>
          </div>

          <div className="text-xs text-center text-muted-foreground mt-4">
            This was a test transaction using Stripe test mode.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}