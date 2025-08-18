import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.55.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GeneratePDFRequest {
  proposal_id: string;
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

    const { proposal_id }: GeneratePDFRequest = await req.json();

    if (!proposal_id) {
      throw new Error('Proposal ID is required');
    }

    // Get proposal with recipients
    const { data: proposal, error: proposalError } = await supabase
      .from('proposals')
      .select(`
        id, title, subject, content, total_amount, currency, 
        created_at, status, expires_at,
        proposal_recipients (
          email, name, role
        )
      `)
      .eq('id', proposal_id)
      .single();

    if (proposalError || !proposal) {
      throw new Error('Proposal not found');
    }

    // Generate HTML content for PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${proposal.title} - Proposal</title>
        <style>
          @page { margin: 1in; size: letter; }
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            margin: 0; 
            padding: 0;
          }
          .header { 
            border-bottom: 3px solid #1a1a1a; 
            padding-bottom: 20px; 
            margin-bottom: 30px;
          }
          .company-name { 
            font-size: 24px; 
            font-weight: bold; 
            color: #1a1a1a; 
            margin-bottom: 5px;
          }
          .proposal-title { 
            font-size: 32px; 
            font-weight: bold; 
            margin: 20px 0; 
            color: #1a1a1a;
          }
          .meta-info { 
            background: #f8f9fa; 
            padding: 20px; 
            border-radius: 8px; 
            margin: 20px 0;
          }
          .meta-item { 
            margin-bottom: 10px; 
          }
          .meta-label { 
            font-weight: bold; 
            display: inline-block; 
            width: 120px;
          }
          .content { 
            margin: 30px 0; 
            line-height: 1.8;
          }
          .amount { 
            font-size: 28px; 
            font-weight: bold; 
            color: #10b981; 
            text-align: center; 
            margin: 30px 0; 
            padding: 20px; 
            background: #f0fdf4; 
            border-radius: 8px;
          }
          .recipients { 
            margin-top: 40px; 
          }
          .recipient { 
            margin-bottom: 10px; 
          }
          .footer { 
            margin-top: 50px; 
            padding-top: 20px; 
            border-top: 1px solid #e5e7eb; 
            font-size: 12px; 
            color: #6b7280;
          }
          .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 500;
            text-transform: uppercase;
          }
          .status-draft { background: #f3f4f6; color: #374151; }
          .status-sent { background: #dbeafe; color: #1e40af; }
          .status-viewed { background: #fef3c7; color: #d97706; }
          .status-accepted { background: #d1fae5; color: #065f46; }
          .status-rejected { background: #fee2e2; color: #dc2626; }
          .status-expired { background: #f3f4f6; color: #374151; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-name">Agenko Digital Agency</div>
          <div class="proposal-title">${proposal.title}</div>
          <span class="status-badge status-${proposal.status}">${proposal.status}</span>
        </div>
        
        <div class="meta-info">
          <div class="meta-item">
            <span class="meta-label">Proposal ID:</span>
            ${proposal.id}
          </div>
          <div class="meta-item">
            <span class="meta-label">Created:</span>
            ${new Date(proposal.created_at).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
          ${proposal.expires_at ? `
            <div class="meta-item">
              <span class="meta-label">Expires:</span>
              ${new Date(proposal.expires_at).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          ` : ''}
          <div class="meta-item">
            <span class="meta-label">Recipients:</span>
            ${proposal.proposal_recipients.map((r: any) => `${r.name || r.email} (${r.role})`).join(', ')}
          </div>
        </div>
        
        <div class="content">
          ${proposal.content}
        </div>
        
        ${proposal.total_amount ? `
          <div class="amount">
            Total Investment: $${(proposal.total_amount / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })} ${proposal.currency.toUpperCase()}
          </div>
        ` : ''}
        
        <div class="footer">
          <p>This proposal was generated on ${new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}.</p>
          <p>Agenko Digital Agency | proposals@agenko.com</p>
        </div>
      </body>
      </html>
    `;

    // For now, return the HTML content
    // In a production environment, you would use a PDF generation service
    // like Puppeteer, jsPDF, or a cloud service like PDFShift
    
    return new Response(htmlContent, {
      status: 200,
      headers: { 
        'Content-Type': 'text/html',
        'Content-Disposition': `attachment; filename="proposal-${proposal.id}.html"`,
        ...corsHeaders 
      },
    });

  } catch (error: any) {
    console.error('Error in generate-proposal-pdf function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
});