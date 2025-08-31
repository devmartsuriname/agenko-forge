import React, { useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ProposalAccept() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  
  const [status, setStatus] = React.useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = React.useState('');

  useEffect(() => {
    if (id && token) {
      acceptProposal();
    } else {
      setStatus('error');
      setMessage('Invalid proposal link');
    }
  }, [id, token]);

  const acceptProposal = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('proposal-action', {
        body: {
          proposal_id: id,
          token: token,
          action: 'accept'
        }
      });

      if (error) throw error;

      setStatus('success');
      setMessage('Proposal accepted successfully!');
    } catch (error: any) {
      setStatus('error');
      setMessage(error.message || 'Failed to accept proposal');
    }
  };

  const viewProposal = () => {
    navigate(`/proposal/${id}/view?token=${token}`);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Card className="max-w-md mx-auto">
        <CardContent className="p-8 text-center">
          {status === 'loading' && (
            <>
              <Loader2 className="mx-auto h-12 w-12 text-primary animate-spin mb-4" />
              <h2 className="text-xl font-semibold mb-2">Processing Your Response</h2>
              <p className="text-muted-foreground">
                Please wait while we confirm your acceptance...
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
              <h2 className="text-xl font-semibold mb-2 text-green-700">Proposal Accepted!</h2>
              <p className="text-muted-foreground mb-6">
                {message} We'll be in touch soon to get started on your project.
              </p>
              <div className="space-y-3">
                <Button onClick={viewProposal} className="w-full">
                  View Proposal Details
                </Button>
                <p className="text-sm text-muted-foreground">
                  Questions? Contact us at{' '}
                  <a href="mailto:proposals@devmart.sr" className="text-primary hover:underline">
                    proposals@devmart.sr
                  </a>
                </p>
              </div>
            </>
          )}

          {status === 'error' && (
            <>
              <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
              <h2 className="text-xl font-semibold mb-2 text-red-700">Error</h2>
              <p className="text-muted-foreground mb-6">
                {message}
              </p>
              <Button onClick={viewProposal} variant="outline" className="w-full">
                View Proposal
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}