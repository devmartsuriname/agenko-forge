import React, { useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { XCircle, AlertCircle, CheckCircle } from 'lucide-react';

export default function ProposalReject() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  
  const [rejectionReason, setRejectionReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleReject = async () => {
    if (!id || !token) return;

    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke('proposal-action', {
        body: {
          proposal_id: id,
          token: token,
          action: 'reject',
          rejection_reason: rejectionReason
        }
      });

      if (error) throw error;

      setSubmitted(true);
    } catch (error: any) {
      console.error('Error rejecting proposal:', error);
      alert(error.message || 'Failed to decline proposal');
    } finally {
      setSubmitting(false);
    }
  };

  const viewProposal = () => {
    navigate(`/proposal/${id}/view?token=${token}`);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Response Recorded</h2>
            <p className="text-muted-foreground mb-6">
              Thank you for your response. We appreciate you taking the time to review our proposal.
            </p>
            <div className="space-y-3">
              <Button onClick={viewProposal} variant="outline" className="w-full">
                View Proposal Details
              </Button>
              <p className="text-sm text-muted-foreground">
                Changed your mind? Contact us at{' '}
                <a href="mailto:proposals@agenko.com" className="text-primary hover:underline">
                  proposals@agenko.com
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!id || !token) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Invalid Link</h2>
            <p className="text-muted-foreground">
              The proposal link is invalid or has expired.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <XCircle className="mx-auto h-16 w-16 text-red-500 mb-4" />
            <h1 className="text-3xl font-bold mb-2">Decline Proposal</h1>
            <p className="text-muted-foreground">
              We understand this proposal may not be the right fit. Your feedback helps us improve.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Tell us why (optional)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="rejection-reason">
                  What led to your decision? This helps us serve you better in the future.
                </Label>
                <Textarea
                  id="rejection-reason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g., Budget constraints, timeline doesn't work, different approach needed..."
                  rows={6}
                  className="mt-2"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-blue-500 mr-3 mt-0.5" />
                  <div className="text-sm">
                    <h4 className="font-medium text-blue-800 mb-1">Still interested in working together?</h4>
                    <p className="text-blue-700">
                      Even if this specific proposal isn't right, we'd love to discuss other options that might better fit your needs.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  onClick={handleReject}
                  disabled={submitting}
                  variant="destructive"
                  className="flex-1"
                >
                  {submitting ? 'Processing...' : 'Confirm Decline'}
                </Button>
                <Button
                  onClick={viewProposal}
                  variant="outline"
                  className="flex-1"
                >
                  Back to Proposal
                </Button>
              </div>

              <div className="text-center pt-4">
                <p className="text-sm text-muted-foreground">
                  Questions? Contact us at{' '}
                  <a href="mailto:proposals@agenko.com" className="text-primary hover:underline">
                    proposals@agenko.com
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}