import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, ArrowRight, Home } from 'lucide-react';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [orderData, setOrderData] = useState<any>(null);

  useEffect(() => {
    if (sessionId) {
      // In a real app, you'd verify the session with your backend
      // For the test harness, we'll just show success
      setOrderData({
        sessionId,
        amount: 2999,
        currency: 'USD',
        status: 'completed'
      });
    }
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-green-700">Payment Successful!</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="text-center text-muted-foreground">
            <p>Your payment has been processed successfully.</p>
          </div>

          {orderData && (
            <div className="space-y-3 p-4 bg-muted rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium">Session ID:</span>
                <Badge variant="secondary" className="font-mono text-xs">
                  {orderData.sessionId.slice(-12)}
                </Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="font-medium">Amount:</span>
                <span className="font-bold">${(orderData.amount / 100).toFixed(2)} {orderData.currency}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="font-medium">Status:</span>
                <Badge variant="default" className="bg-green-600">
                  {orderData.status}
                </Badge>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3 pt-4">
            <Button asChild>
              <Link to="/admin/test-harness">
                <ArrowRight className="w-4 h-4 mr-2" />
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
            This is a test transaction using Stripe test mode.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}