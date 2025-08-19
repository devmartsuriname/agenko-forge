import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Send, Eye, Calendar, Mail } from 'lucide-react';
import { Proposal } from '@/types/proposal';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SendEngineProps {
  proposals: Proposal[];
  onSent: () => void;
  onCancel: () => void;
}

export function SendEngine({ proposals, onSent, onCancel }: SendEngineProps) {
  const [deliveryMethod, setDeliveryMethod] = useState<'link' | 'pdf' | 'both'>('both');
  const [emailData, setEmailData] = useState({
    subject: proposals.length === 1 ? proposals[0].subject : 'Your Proposal',
    body: `Dear {{client_name}},\n\nPlease find attached your proposal for review.\n\nBest regards,\n{{sender_name}}`,
    trackOpens: true,
    sendCopy: false,
    scheduleDate: ''
  });
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  const handleSend = async () => {
    setSending(true);
    
    try {
      const sendPromises = proposals.map(proposal => 
        supabase.functions.invoke('send-proposal', {
          body: {
            proposal_id: proposal.id,
            delivery_method: deliveryMethod,
            custom_subject: emailData.subject,
            custom_body: emailData.body,
            track_opens: emailData.trackOpens,
            send_copy: emailData.sendCopy,
            schedule_date: emailData.scheduleDate || null
          }
        })
      );

      const results = await Promise.all(sendPromises);
      
      // Check for errors
      const errors = results.filter(result => result.error);
      if (errors.length > 0) {
        throw new Error(errors.map(e => e.error.message).join(', '));
      }

      toast({
        title: 'Success',
        description: `${proposals.length} proposal(s) sent successfully`
      });

      onSent();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setSending(false);
    }
  };

  const insertToken = (field: 'subject' | 'body', token: string) => {
    setEmailData(prev => ({
      ...prev,
      [field]: prev[field] + `{{${token}}}`
    }));
  };

  const TOKENS = [
    { name: 'client_name', label: 'Client Name' },
    { name: 'client_company', label: 'Company' },
    { name: 'sender_name', label: 'Sender Name' },
    { name: 'proposal_link', label: 'Proposal Link' },
    { name: 'total_amount', label: 'Total Amount' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Send Proposals</h2>
          <p className="text-muted-foreground">
            Sending {proposals.length} proposal(s) to clients
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={sending}>
            <Send className="h-4 w-4 mr-2" />
            {sending ? 'Sending...' : 'Send Now'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Selected Proposals */}
        <Card>
          <CardHeader>
            <CardTitle>Selected Proposals</CardTitle>
            <CardDescription>
              Proposals that will be sent
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {proposals.map(proposal => (
                <div key={proposal.id} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <p className="font-medium text-sm">{proposal.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {proposal.proposal_recipients?.length || 0} recipient(s)
                    </p>
                  </div>
                  <Badge variant="outline">{proposal.status}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Delivery Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Delivery Method</CardTitle>
            <CardDescription>
              Choose how to deliver the proposals
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <RadioGroup
              value={deliveryMethod}
              onValueChange={(value: any) => setDeliveryMethod(value)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="link" id="link" />
                <Label htmlFor="link">Link Only</Label>
              </div>
              <p className="text-xs text-muted-foreground ml-6">
                Send a secure link to view online
              </p>
              
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pdf" id="pdf" />
                <Label htmlFor="pdf">PDF Attachment</Label>
              </div>
              <p className="text-xs text-muted-foreground ml-6">
                Generate and attach PDF file
              </p>
              
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="both" id="both" />
                <Label htmlFor="both">Both Link & PDF</Label>
              </div>
              <p className="text-xs text-muted-foreground ml-6">
                Best of both worlds (recommended)
              </p>
            </RadioGroup>

            <div className="space-y-3 pt-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="track"
                  checked={emailData.trackOpens}
                  onCheckedChange={(checked) => 
                    setEmailData(prev => ({ ...prev, trackOpens: checked as boolean }))
                  }
                />
                <Label htmlFor="track">Track opens/clicks</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="copy"
                  checked={emailData.sendCopy}
                  onCheckedChange={(checked) =>
                    setEmailData(prev => ({ ...prev, sendCopy: checked as boolean }))
                  }
                />
                <Label htmlFor="copy">Send me a copy</Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="schedule">Schedule Send (Optional)</Label>
              <Input
                id="schedule"
                type="datetime-local"
                value={emailData.scheduleDate}
                onChange={(e) => setEmailData(prev => ({ ...prev, scheduleDate: e.target.value }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Email Compose */}
        <Card>
          <CardHeader>
            <CardTitle>Email Content</CardTitle>
            <CardDescription>
              Customize the email sent to clients
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject Line</Label>
              <Input
                id="subject"
                value={emailData.subject}
                onChange={(e) => setEmailData(prev => ({ ...prev, subject: e.target.value }))}
              />
              <div className="flex flex-wrap gap-1">
                {TOKENS.map(token => (
                  <Badge
                    key={token.name}
                    variant="outline"
                    className="text-xs cursor-pointer hover:bg-primary/10"
                    onClick={() => insertToken('subject', token.name)}
                  >
                    {token.label}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="body">Email Body</Label>
              <Textarea
                id="body"
                value={emailData.body}
                onChange={(e) => setEmailData(prev => ({ ...prev, body: e.target.value }))}
                rows={8}
              />
              <div className="flex flex-wrap gap-1">
                {TOKENS.map(token => (
                  <Badge
                    key={token.name}
                    variant="outline"
                    className="text-xs cursor-pointer hover:bg-primary/10"
                    onClick={() => insertToken('body', token.name)}
                  >
                    {token.label}
                  </Badge>
                ))}
              </div>
            </div>

            <Card className="bg-muted/50">
              <CardContent className="p-3">
                <h4 className="font-medium text-sm mb-2">Preview:</h4>
                <div className="text-sm space-y-1">
                  <p><strong>Subject:</strong> {emailData.subject}</p>
                  <div className="border-t pt-2">
                    <div className="whitespace-pre-wrap">{emailData.body}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}