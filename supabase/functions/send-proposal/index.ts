import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.55.0";
import { Resend } from "npm:resend@2.0.0";
import { getProposalSettings } from "../shared/settings-helper.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SendProposalRequest {
  proposal_id: string;
}

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

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

    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Authorization header required');
    }

    // Verify user is authenticated and has proper role
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Invalid authentication');
    }

    // Check user role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['admin', 'editor'].includes(profile.role)) {
      throw new Error('Insufficient permissions');
    }

    const { proposal_id }: SendProposalRequest = await req.json();

    if (!proposal_id) {
      throw new Error('Proposal ID is required');
    }

    // Get proposal settings
    const proposalSettings = await getProposalSettings();

    // Get proposal with recipients and attachments
    const { data: proposal, error: proposalError } = await supabase
      .from('proposals')
      .select(`
        id, title, subject, content, total_amount, currency, expires_at,
        proposal_recipients (
          id, email, name, role, token
        ),
        proposal_attachments (
          id, filename, storage_key, size_bytes, mime_type
        )
      `)
      .eq('id', proposal_id)
      .single();

    if (proposalError || !proposal) {
      throw new Error('Proposal not found');
    }

    if (proposal.proposal_recipients.length === 0) {
      throw new Error('No recipients found for proposal');
    }

    const baseUrl = Deno.env.get('SUPABASE_URL')?.replace('/v1', '') || 'https://your-app.com';
    
    // Generate signed URLs for attachments
    const attachmentLinks: string[] = [];
    if (proposal.proposal_attachments?.length > 0) {
      const ttlSeconds = proposalSettings.tokens.ttl_hours * 3600;
      
      for (const attachment of proposal.proposal_attachments) {
        try {
          const { data: signedUrl } = await supabase.storage
            .from('media')
            .createSignedUrl(attachment.storage_key, ttlSeconds);
          
          if (signedUrl?.signedUrl) {
            attachmentLinks.push(`
              <p style="margin: 8px 0;">
                <a href="${signedUrl.signedUrl}" style="color: #1a1a1a; text-decoration: none; padding: 8px 16px; background: #f8f9fa; border-radius: 6px; display: inline-block;">
                  📎 ${attachment.filename} (${Math.round(attachment.size_bytes / 1024)} KB)
                </a>
              </p>
            `);
          }
        } catch (error) {
          console.error('Error creating signed URL for attachment:', error);
        }
      }
    }
    
    // Send emails to all recipients
    const emailPromises = proposal.proposal_recipients.map(async (recipient: any) => {
      const acceptUrl = `${baseUrl}/proposal/${proposal.id}/accept?token=${recipient.token}`;
      const rejectUrl = `${baseUrl}/proposal/${proposal.id}/reject?token=${recipient.token}`;
      const viewUrl = `${baseUrl}/proposal/${proposal.id}/view?token=${recipient.token}`;

      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${proposal.subject}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); overflow: hidden; }
            .header { background: #1a1a1a; color: white; padding: 30px; text-align: center; }
            .content { padding: 30px; }
            .proposal-content { background: #f8f9fa; padding: 20px; border-radius: 6px; margin: 20px 0; }
            .actions { text-align: center; margin: 30px 0; }
            .btn { display: inline-block; padding: 12px 30px; margin: 0 10px; text-decoration: none; border-radius: 6px; font-weight: 500; }
            .btn-accept { background: #10b981; color: white; }
            .btn-reject { background: #ef4444; color: white; }
            .btn-view { background: #6366f1; color: white; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #666; }
            .amount { font-size: 24px; font-weight: bold; color: #10b981; text-align: center; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${proposal.title}</h1>
            </div>
            <div class="content">
              <p>Hello ${recipient.name || recipient.email},</p>
              
              <p>We're pleased to present you with our proposal for your project.</p>
              
              <div class="proposal-content">
                ${proposal.content}
              </div>
              
              ${proposal.total_amount ? `
                <div class="amount">
                  Total: $${(proposal.total_amount / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })} ${proposal.currency.toUpperCase()}
                </div>
              ` : ''}
              
              ${proposal.expires_at ? `
                <p><strong>This proposal expires on:</strong> ${new Date(proposal.expires_at).toLocaleDateString()}</p>
              ` : ''}
              
              ${attachmentLinks.length > 0 ? `
                <div style="margin: 20px 0; padding: 20px; background: #f8f9fa; border-radius: 6px;">
                  <h3 style="margin: 0 0 10px 0; font-size: 16px;">Attached Files:</h3>
                  ${attachmentLinks.join('')}
                </div>
              ` : ''}
              
              <div class="actions">
                <a href="${viewUrl}" class="btn btn-view">View Full Proposal</a>
                <a href="${acceptUrl}" class="btn btn-accept">Accept Proposal</a>
                <a href="${rejectUrl}" class="btn btn-reject">Decline Proposal</a>
              </div>
              
              <p>If you have any questions about this proposal, please don't hesitate to reach out to us.</p>
              
              <p>Best regards,<br>${proposalSettings.email.from_name}</p>
            </div>
            <div class="footer">
              <p>This proposal was sent securely. The action links above are unique to you.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      return resend.emails.send({
        from: `${proposalSettings.email.from_name} <${proposalSettings.email.from_email}>`,
        to: [recipient.email],
        subject: proposal.subject,
        html: emailHtml,
        ...(proposalSettings.email.reply_to ? { reply_to: proposalSettings.email.reply_to } : {}),
        ...(proposalSettings.email.bcc_me ? { bcc: [proposalSettings.email.from_email] } : {})
      });
    });

    const emailResults = await Promise.allSettled(emailPromises);
    
    // Count successful emails
    const successCount = emailResults.filter(result => result.status === 'fulfilled').length;
    const errorCount = emailResults.length - successCount;

    // Update proposal status to sent
    const { error: updateError } = await supabase
      .from('proposals')
      .update({ 
        status: 'sent',
        sent_at: new Date().toISOString()
      })
      .eq('id', proposal_id);

    if (updateError) {
      console.error('Error updating proposal status:', updateError);
    }

    // Log the send event
    await supabase
      .from('proposal_events')
      .insert({
        proposal_id: proposal_id,
        event_type: 'sent',
        user_id: user.id,
        details: {
          recipients_count: proposal.proposal_recipients.length,
          success_count: successCount,
          error_count: errorCount,
          email_results: emailResults.map((result, index) => ({
            recipient: proposal.proposal_recipients[index].email,
            success: result.status === 'fulfilled',
            error: result.status === 'rejected' ? result.reason : null
          }))
        }
      });

    return new Response(
      JSON.stringify({
        success: true,
        message: `Proposal sent to ${successCount} recipients${errorCount > 0 ? ` (${errorCount} failed)` : ''}`,
        sent_count: successCount,
        error_count: errorCount
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error('Error in send-proposal function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
});