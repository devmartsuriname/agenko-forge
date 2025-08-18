import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.55.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ProposalActionRequest {
  proposal_id: string;
  token: string;
  action: 'accept' | 'reject' | 'view';
  rejection_reason?: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get client info for logging
    const clientIP = req.headers.get('x-forwarded-for') || 
                    req.headers.get('x-real-ip') || 
                    'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    const { proposal_id, token, action, rejection_reason }: ProposalActionRequest = await req.json();

    if (!proposal_id || !token || !action) {
      throw new Error('Missing required parameters');
    }

    // Verify token and get recipient
    const { data: recipient, error: recipientError } = await supabase
      .from('proposal_recipients')
      .select('id, email, name, proposal_id')
      .eq('proposal_id', proposal_id)
      .eq('token', token)
      .single();

    if (recipientError || !recipient) {
      throw new Error('Invalid token or proposal not found');
    }

    // Get current proposal
    const { data: proposal, error: proposalError } = await supabase
      .from('proposals')
      .select('id, status, expires_at')
      .eq('id', proposal_id)
      .single();

    if (proposalError || !proposal) {
      throw new Error('Proposal not found');
    }

    // Check if proposal is expired
    if (proposal.expires_at && new Date(proposal.expires_at) < new Date()) {
      // Update proposal status to expired if not already
      if (proposal.status !== 'expired') {
        await supabase
          .from('proposals')
          .update({ status: 'expired' })
          .eq('id', proposal_id);
      }
      throw new Error('This proposal has expired');
    }

    // Check if proposal is already accepted or rejected
    if (['accepted', 'rejected'].includes(proposal.status)) {
      throw new Error(`This proposal has already been ${proposal.status}`);
    }

    let updateData: any = {};
    let eventDetails: any = {
      recipient_email: recipient.email,
      recipient_name: recipient.name,
      ip_address: clientIP,
      user_agent: userAgent
    };

    switch (action) {
      case 'view':
        // Update recipient viewed timestamp
        await supabase
          .from('proposal_recipients')
          .update({ viewed_at: new Date().toISOString() })
          .eq('id', recipient.id);
        
        // Update proposal status to viewed if it's still sent
        if (proposal.status === 'sent') {
          updateData.status = 'viewed';
        }
        break;

      case 'accept':
        updateData = {
          status: 'accepted',
          accepted_at: new Date().toISOString()
        };
        break;

      case 'reject':
        updateData = {
          status: 'rejected',
          rejected_at: new Date().toISOString(),
          ...(rejection_reason && { rejection_reason })
        };
        eventDetails.rejection_reason = rejection_reason;
        break;

      default:
        throw new Error('Invalid action');
    }

    // Update proposal if needed
    if (Object.keys(updateData).length > 0) {
      const { error: updateError } = await supabase
        .from('proposals')
        .update(updateData)
        .eq('id', proposal_id);

      if (updateError) {
        throw new Error('Failed to update proposal');
      }
    }

    // Log the event
    await supabase
      .from('proposal_events')
      .insert({
        proposal_id: proposal_id,
        event_type: action,
        user_email: recipient.email,
        details: eventDetails,
        ip_address: clientIP,
        user_agent: userAgent
      });

    // Get updated proposal for response
    const { data: updatedProposal } = await supabase
      .from('proposals')
      .select('id, title, status, content, total_amount, currency')
      .eq('id', proposal_id)
      .single();

    return new Response(
      JSON.stringify({
        success: true,
        action: action,
        proposal: updatedProposal,
        message: action === 'view' ? 'Proposal viewed' : 
                action === 'accept' ? 'Proposal accepted successfully!' :
                'Proposal declined'
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error('Error in proposal-action function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
});