import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, Eye, Download, AlertCircle } from 'lucide-react';
import { Proposal, PROPOSAL_STATUS_LABELS, PROPOSAL_STATUS_COLORS } from '@/types/proposal';

export default function ProposalView() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  useEffect(() => {
    if (id && token) {
      fetchProposal();
      recordView();
    }
  }, [id, token]);

  const fetchProposal = async () => {
    try {
      const { data, error } = await supabase
        .from('proposals')
        .select(`
          *,
          proposal_recipients (
            id, email, name, role, viewed_at
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setProposal(data as Proposal);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Proposal not found or invalid access token",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const recordView = async () => {
    try {
      await supabase.functions.invoke('proposal-action', {
        body: {
          proposal_id: id,
          token: token,
          action: 'view'
        }
      });
    } catch (error) {
      console.error('Error recording view:', error);
    }
  };

  const handleAccept = async () => {
    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke('proposal-action', {
        body: {
          proposal_id: id,
          token: token,
          action: 'accept'
        }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Proposal accepted successfully!",
      });

      fetchProposal();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
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

      toast({
        title: "Proposal Declined",
        description: "Thank you for your response.",
      });

      setShowRejectDialog(false);
      fetchProposal();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const isExpired = proposal?.expires_at && new Date(proposal.expires_at) < new Date();
  const canRespond = proposal && !['accepted', 'rejected', 'expired'].includes(proposal.status) && !isExpired;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-lg">Loading proposal...</div>
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Proposal Not Found</h2>
            <p className="text-muted-foreground">
              The proposal you're looking for doesn't exist or the access link is invalid.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium mb-4">
            Proposal
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            {proposal.title}
          </h1>
          <div className="flex justify-center mb-4">
            <Badge className={PROPOSAL_STATUS_COLORS[proposal.status]}>
              {PROPOSAL_STATUS_LABELS[proposal.status]}
            </Badge>
          </div>
          {isExpired && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-2xl mx-auto">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
                <div>
                  <h3 className="font-medium text-red-800">Proposal Expired</h3>
                  <p className="text-red-700">This proposal expired on {new Date(proposal.expires_at!).toLocaleDateString()}.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Proposal Content */}
        <div className="max-w-4xl mx-auto">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Eye className="w-5 h-5 mr-2" />
                Proposal Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <div dangerouslySetInnerHTML={{ __html: proposal.content }} />
              </div>
              
              {proposal.total_amount && (
                <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-lg">
                  <div className="text-center">
                    <h3 className="text-lg font-medium text-green-800 mb-2">Total Investment</h3>
                    <div className="text-4xl font-bold text-green-600">
                      {formatCurrency(proposal.total_amount, proposal.currency)}
                    </div>
                  </div>
                </div>
              )}

              {proposal.expires_at && !isExpired && (
                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-yellow-500 mr-3" />
                    <div>
                      <h4 className="font-medium text-yellow-800">Response Required</h4>
                      <p className="text-yellow-700">
                        Please respond by {new Date(proposal.expires_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          {canRespond && (
            <Card>
              <CardHeader>
                <CardTitle>Your Response</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    onClick={handleAccept}
                    disabled={submitting}
                    className="bg-green-600 hover:bg-green-700 text-white px-8 py-3"
                    size="lg"
                  >
                    <CheckCircle className="w-5 h-5 mr-2" />
                    {submitting ? 'Processing...' : 'Accept Proposal'}
                  </Button>

                  <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        className="border-red-300 text-red-600 hover:bg-red-50 px-8 py-3"
                        size="lg"
                      >
                        <XCircle className="w-5 h-5 mr-2" />
                        Decline Proposal
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Decline Proposal</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <p className="text-muted-foreground">
                          We'd appreciate knowing why you're declining this proposal. This helps us improve our services.
                        </p>
                        <div>
                          <Label htmlFor="rejection-reason">Reason (optional)</Label>
                          <Textarea
                            id="rejection-reason"
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="Please let us know why you're declining..."
                            rows={4}
                          />
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button 
                            variant="outline" 
                            onClick={() => setShowRejectDialog(false)}
                          >
                            Cancel
                          </Button>
                          <Button 
                            onClick={handleReject}
                            disabled={submitting}
                            variant="destructive"
                          >
                            {submitting ? 'Processing...' : 'Decline Proposal'}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="mt-6 text-center text-sm text-muted-foreground">
                  <p>
                    Questions about this proposal? Contact us at{' '}
                    <a href="mailto:proposals@agenko.com" className="text-primary hover:underline">
                      proposals@agenko.com
                    </a>
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Status Message for Already Responded */}
          {!canRespond && proposal.status !== 'draft' && (
            <Card>
              <CardContent className="p-8 text-center">
                {proposal.status === 'accepted' && (
                  <div className="text-green-600">
                    <CheckCircle className="mx-auto h-12 w-12 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Proposal Accepted</h3>
                    <p className="text-muted-foreground">
                      Thank you for accepting our proposal! We'll be in touch soon to get started.
                    </p>
                  </div>
                )}
                {proposal.status === 'rejected' && (
                  <div className="text-red-600">
                    <XCircle className="mx-auto h-12 w-12 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Proposal Declined</h3>
                    <p className="text-muted-foreground">
                      Thank you for your response. We appreciate you taking the time to review our proposal.
                    </p>
                    {proposal.rejection_reason && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">
                          <strong>Reason:</strong> {proposal.rejection_reason}
                        </p>
                      </div>
                    )}
                  </div>
                )}
                {(proposal.status === 'expired' || isExpired) && (
                  <div className="text-gray-600">
                    <AlertCircle className="mx-auto h-12 w-12 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Proposal Expired</h3>
                    <p className="text-muted-foreground">
                      This proposal has expired. Please contact us if you're still interested.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-16 text-sm text-muted-foreground">
          <p>© 2024 Devmart. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}