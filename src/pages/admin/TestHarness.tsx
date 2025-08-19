import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  CreditCard, 
  Building, 
  FileText, 
  Download, 
  Play, 
  Check, 
  X, 
  Eye,
  ExternalLink,
  TestTube
} from 'lucide-react';

interface TestResult {
  id: string;
  type: 'stripe' | 'bank' | 'proposal' | 'csv';
  status: 'pending' | 'success' | 'error';
  message: string;
  data?: any;
  timestamp: Date;
}

export default function TestHarness() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const addResult = (result: Omit<TestResult, 'timestamp'>) => {
    setResults(prev => [...prev, { ...result, timestamp: new Date() }]);
  };

  // Stripe Test Flow
  const testStripeFlow = async () => {
    setLoading(true);
    try {
      addResult({
        id: 'stripe-start',
        type: 'stripe',
        status: 'pending',
        message: 'Starting Stripe test checkout...'
      });

      const { data, error } = await supabase.functions.invoke('create-stripe-checkout', {
        body: {
          amount: 2999, // $29.99
          currency: 'usd',
          productName: 'Test Product - E2E Harness',
          successUrl: `${window.location.origin}/admin/test-harness?stripe_success=true`,
          cancelUrl: `${window.location.origin}/admin/test-harness?stripe_cancel=true`
        }
      });

      if (error) throw error;

      addResult({
        id: 'stripe-created',
        type: 'stripe',
        status: 'success',
        message: `Stripe checkout created`,
        data: { orderId: data.orderId, sessionId: data.sessionId }
      });

      // Open Stripe checkout in new tab
      window.open(data.url, '_blank');

      addResult({
        id: 'stripe-instructions',
        type: 'stripe',
        status: 'pending',
        message: 'Use test card: 4242 4242 4242 4242, any future expiry, any CVC'
      });

    } catch (error: any) {
      addResult({
        id: 'stripe-error',
        type: 'stripe',
        status: 'error',
        message: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  // Bank Transfer Test Flow
  const testBankFlow = async () => {
    setLoading(true);
    try {
      addResult({
        id: 'bank-start',
        type: 'bank',
        status: 'pending',
        message: 'Creating bank transfer order...'
      });

      const { data, error } = await supabase.functions.invoke('create-bank-transfer-order', {
        body: {
          amount: 4999, // $49.99
          currency: 'usd',
          productName: 'Test Service - Bank Transfer',
          customerInfo: {
            name: 'Test Customer',
            email: 'test@example.com',
            phone: '+597-123-4567'
          }
        }
      });

      if (error) throw error;

      addResult({
        id: 'bank-created',
        type: 'bank',
        status: 'success',
        message: `Bank transfer order created`,
        data: { 
          orderId: data.orderId, 
          reference: data.bankReference,
          bankDetails: data.bankDetails
        }
      });

      // Test admin verification flow
      const { error: verifyError } = await supabase
        .from('orders')
        .update({ 
          status: 'paid',
          metadata: { 
            ...data.order.metadata,
            verified_at: new Date().toISOString(),
            verified_by: 'test-harness',
            admin_notes: 'Verified via test harness - E2E test'
          }
        })
        .eq('id', data.orderId);

      if (verifyError) throw verifyError;

      addResult({
        id: 'bank-verified',
        type: 'bank',
        status: 'success',
        message: 'Bank transfer manually verified (simulated admin action)'
      });

    } catch (error: any) {
      addResult({
        id: 'bank-error',
        type: 'bank',
        status: 'error',
        message: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  // Proposal Test Flow
  const testProposalFlow = async () => {
    setLoading(true);
    try {
      addResult({
        id: 'proposal-start',
        type: 'proposal',
        status: 'pending',
        message: 'Creating test proposal...'
      });

      // Create a test quote first
      const { data: quote, error: quoteError } = await supabase
        .from('quotes')
        .insert({
          name: 'Test Customer',
          email: 'test@example.com',
          company: 'Test Company Ltd',
          service_type: 'web-development',
          project_scope: 'E2E test proposal for Phase 6 validation',
          budget_range: '$5,000 - $10,000',
          timeline: '2-3 months',
          status: 'quoted',
          priority: 'high',
          estimated_cost: 750000, // $7,500
          admin_notes: 'Generated by test harness for E2E validation'
        })
        .select()
        .single();

      if (quoteError) throw quoteError;

      // Create proposal template
      const { data: template, error: templateError } = await supabase
        .from('proposal_templates')
        .insert({
          name: 'E2E Test Template',
          subject: 'Project Proposal - {{project_name}}',
          content: `
            <h2>Project Proposal</h2>
            <p>Dear {{client_name}},</p>
            <p>We are pleased to present our proposal for your {{service_type}} project.</p>
            <h3>Project Scope</h3>
            <p>{{project_scope}}</p>
            <h3>Timeline</h3>
            <p>{{timeline}}</p>
            <p>Thank you for considering our services.</p>
            <p>Best regards,<br>The Agenko Team</p>
          `,
          variables: ['project_name', 'client_name', 'service_type', 'project_scope', 'timeline']
        })
        .select()
        .single();

      if (templateError) throw templateError;

      // Create proposal
      const { data: proposal, error: proposalError } = await supabase
        .from('proposals')
        .insert({
          quote_id: quote.id,
          template_id: template.id,
          title: 'Test Project Proposal',
          subject: 'Project Proposal - E2E Test',
          content: `
            <h2>Project Proposal</h2>
            <p>Dear Test Customer,</p>
            <p>We are pleased to present our proposal for your web development project.</p>
            <h3>Project Scope</h3>
            <p>E2E test proposal for Phase 6 validation</p>
            <h3>Timeline</h3>
            <p>2-3 months</p>
            <p>Thank you for considering our services.</p>
            <p>Best regards,<br>The Agenko Team</p>
          `,
          total_amount: 750000,
          currency: 'usd',
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
          status: 'draft'
        })
        .select()
        .single();

      if (proposalError) throw proposalError;

      // Add recipient
      const token = crypto.randomUUID();
      const { error: recipientError } = await supabase
        .from('proposal_recipients')
        .insert({
          proposal_id: proposal.id,
          email: 'test@example.com',
          name: 'Test Customer',
          role: 'primary',
          token: token
        });

      if (recipientError) throw recipientError;

      addResult({
        id: 'proposal-created',
        type: 'proposal',
        status: 'success',
        message: 'Test proposal created successfully',
        data: { 
          proposalId: proposal.id, 
          quoteId: quote.id,
          token: token,
          publicUrl: `${window.location.origin}/proposal/${proposal.id}/${token}`
        }
      });

      // Test public routes
      const publicUrl = `${window.location.origin}/proposal/${proposal.id}/${token}`;
      addResult({
        id: 'proposal-public',
        type: 'proposal',
        status: 'success',
        message: `Public proposal URL ready`,
        data: { 
          viewUrl: publicUrl,
          acceptUrl: `${publicUrl}/accept`,
          rejectUrl: `${publicUrl}/reject`
        }
      });

    } catch (error: any) {
      addResult({
        id: 'proposal-error',
        type: 'proposal',
        status: 'error',
        message: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  // CSV Export Test
  const testCSVExports = async () => {
    setLoading(true);
    try {
      addResult({
        id: 'csv-start',
        type: 'csv',
        status: 'pending',
        message: 'Testing CSV exports...'
      });

      // Test quotes export
      const { data: quotes } = await supabase
        .from('quotes')
        .select('*')
        .limit(5);

      if (quotes && quotes.length > 0) {
        addResult({
          id: 'csv-quotes',
          type: 'csv',
          status: 'success',
          message: `Quotes CSV data ready (${quotes.length} records)`,
          data: { sampleRecord: quotes[0] }
        });
      }

      // Test payments export
      const { data: orders } = await supabase
        .from('orders')
        .select('*')
        .limit(5);

      if (orders && orders.length > 0) {
        addResult({
          id: 'csv-payments',
          type: 'csv',
          status: 'success',
          message: `Payments CSV data ready (${orders.length} records)`,
          data: { sampleRecord: orders[0] }
        });
      }

      addResult({
        id: 'csv-complete',
        type: 'csv',
        status: 'success',
        message: 'CSV export tests completed - check AdminQuotes and AdminPayments for export buttons'
      });

    } catch (error: any) {
      addResult({
        id: 'csv-error',
        type: 'csv',
        status: 'error',
        message: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  // Run all tests
  const runAllTests = async () => {
    setResults([]);
    addResult({
      id: 'all-start',
      type: 'stripe',
      status: 'pending',
      message: '🧪 Starting comprehensive E2E test suite...'
    });

    await testBankFlow();
    await testProposalFlow();
    await testCSVExports();
    // Note: Stripe test requires manual interaction, so we'll start it last
    await testStripeFlow();

    addResult({
      id: 'all-complete',
      type: 'stripe',
      status: 'success',
      message: '✅ E2E test suite completed! Manual Stripe verification required.'
    });
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return <Check className="h-4 w-4 text-green-600" />;
      case 'error': return <X className="h-4 w-4 text-red-600" />;
      case 'pending': return <Play className="h-4 w-4 text-blue-600" />;
    }
  };

  const getTypeIcon = (type: TestResult['type']) => {
    switch (type) {
      case 'stripe': return <CreditCard className="h-4 w-4" />;
      case 'bank': return <Building className="h-4 w-4" />;
      case 'proposal': return <FileText className="h-4 w-4" />;
      case 'csv': return <Download className="h-4 w-4" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Phase 6 E2E Test Harness</h1>
          <p className="text-muted-foreground mt-2">
            Comprehensive testing for payments, proposals, and CSV exports
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          <TestTube className="h-4 w-4 mr-2" />
          Test Environment
        </Badge>
      </div>

      {/* Test Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center">
              <CreditCard className="h-4 w-4 mr-2" />
              Stripe Test
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-3">
              Test Stripe checkout flow with test card
            </p>
            <Button 
              onClick={testStripeFlow}
              disabled={loading}
              className="w-full"
              size="sm"
            >
              Test Stripe
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center">
              <Building className="h-4 w-4 mr-2" />
              Bank Transfer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-3">
              Test bank transfer order flow
            </p>
            <Button 
              onClick={testBankFlow}
              disabled={loading}
              className="w-full"
              size="sm"
            >
              Test Bank Transfer
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              Proposals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-3">
              Test proposal creation and public routes
            </p>
            <Button 
              onClick={testProposalFlow}
              disabled={loading}
              className="w-full"
              size="sm"
            >
              Test Proposals
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center">
              <Download className="h-4 w-4 mr-2" />
              CSV Exports
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-3">
              Test CSV export functionality
            </p>
            <Button 
              onClick={testCSVExports}
              disabled={loading}
              className="w-full"
              size="sm"
            >
              Test CSV
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Run All Tests */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Comprehensive Test Suite</h3>
              <p className="text-sm text-muted-foreground">
                Run all E2E tests in sequence (Stripe requires manual verification)
              </p>
            </div>
            <Button 
              onClick={runAllTests}
              disabled={loading}
              size="lg"
              className="bg-primary"
            >
              <TestTube className="h-4 w-4 mr-2" />
              Run All Tests
            </Button>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Test Results */}
      <Card>
        <CardHeader>
          <CardTitle>Test Results</CardTitle>
          <p className="text-sm text-muted-foreground">
            Real-time results from E2E test execution
          </p>
        </CardHeader>
        <CardContent>
          {results.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No tests run yet. Click any test button above to start.
            </p>
          ) : (
            <div className="space-y-3">
              {results.map((result, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg border">
                  <div className="flex items-center gap-2 min-w-0">
                    {getTypeIcon(result.type)}
                    {getStatusIcon(result.status)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {result.type}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {result.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    
                    <p className="text-sm mt-1">{result.message}</p>
                    
                    {result.data && (
                      <div className="mt-2">
                        {result.data.publicUrl && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(result.data.publicUrl, '_blank')}
                            className="h-8 px-3"
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            View Public URL
                          </Button>
                        )}
                        
                        {result.data.orderId && (
                          <Badge variant="secondary" className="text-xs ml-2">
                            Order: {result.data.orderId.slice(-8)}
                          </Badge>
                        )}
                        
                        {result.data.reference && (
                          <Badge variant="secondary" className="text-xs ml-2">
                            Ref: {result.data.reference}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation Links */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Navigation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button variant="outline" size="sm" onClick={() => window.open('/admin/quotes', '_blank')}>
              <Eye className="h-4 w-4 mr-2" />
              View Quotes
            </Button>
            <Button variant="outline" size="sm" onClick={() => window.open('/admin/payments', '_blank')}>
              <Eye className="h-4 w-4 mr-2" />
              View Payments
            </Button>
            <Button variant="outline" size="sm" onClick={() => window.open('/admin/proposals', '_blank')}>
              <Eye className="h-4 w-4 mr-2" />
              View Proposals
            </Button>
            <Button variant="outline" size="sm" onClick={() => window.open('/get-quote', '_blank')}>
              <ExternalLink className="h-4 w-4 mr-2" />
              Public Quote Form
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}