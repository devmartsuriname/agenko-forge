import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Palette, Mail, Shield, Paperclip, Upload } from 'lucide-react';
import { ProposalSettings } from '@/types/settings';

interface ProposalsTabProps {
  settings: ProposalSettings;
  onChange: (settings: ProposalSettings) => void;
  errors: Record<string, string>;
  onClearError: (field: string) => void;
}

export function ProposalsTab({ settings, onChange, errors, onClearError }: ProposalsTabProps) {
  const handleBrandingChange = (field: keyof ProposalSettings['branding'], value: string) => {
    onChange({
      ...settings,
      branding: { ...settings.branding, [field]: value }
    });
    onClearError(`branding.${field}`);
  };

  const handleEmailChange = (field: keyof ProposalSettings['email'], value: string | boolean) => {
    onChange({
      ...settings,
      email: { ...settings.email, [field]: value }
    });
    onClearError(`email.${field}`);
  };

  const handleTokensChange = (field: keyof ProposalSettings['tokens'], value: number | boolean) => {
    onChange({
      ...settings,
      tokens: { ...settings.tokens, [field]: value }
    });
    onClearError(`tokens.${field}`);
  };

  const handleAttachmentsChange = (field: keyof ProposalSettings['attachments'], value: number | boolean) => {
    onChange({
      ...settings,
      attachments: { ...settings.attachments, [field]: value }
    });
    onClearError(`attachments.${field}`);
  };

  // Media picker placeholder (would integrate with existing media management)
  const handleMediaPick = (field: string) => {
    // TODO: Integrate with existing Media Picker component
    console.log('Open media picker for', field);
  };

  return (
    <div className="space-y-6">
      {/* Branding */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Branding & Visual Identity
          </CardTitle>
          <CardDescription>
            Customize the appearance of proposals and emails
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Light Mode Logo</Label>
              <div className="flex gap-2">
                <Input
                  value={settings.branding.logo_url_light || ''}
                  onChange={(e) => handleBrandingChange('logo_url_light', e.target.value)}
                  placeholder="https://example.com/logo-light.png"
                  className={errors['branding.logo_url_light'] ? 'border-destructive' : ''}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleMediaPick('logo_url_light')}
                >
                  <Upload className="h-4 w-4" />
                </Button>
              </div>
              {errors['branding.logo_url_light'] && (
                <p className="text-sm text-destructive">{errors['branding.logo_url_light']}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Dark Mode Logo</Label>
              <div className="flex gap-2">
                <Input
                  value={settings.branding.logo_url_dark || ''}
                  onChange={(e) => handleBrandingChange('logo_url_dark', e.target.value)}
                  placeholder="https://example.com/logo-dark.png"
                  className={errors['branding.logo_url_dark'] ? 'border-destructive' : ''}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleMediaPick('logo_url_dark')}
                >
                  <Upload className="h-4 w-4" />
                </Button>
              </div>
              {errors['branding.logo_url_dark'] && (
                <p className="text-sm text-destructive">{errors['branding.logo_url_dark']}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="primary_color">Primary Brand Color</Label>
            <div className="flex gap-2">
              <Input
                id="primary_color"
                type="color"
                value={settings.branding.primary_color || '#6366f1'}
                onChange={(e) => handleBrandingChange('primary_color', e.target.value)}
                className="w-16 h-10 p-1 border rounded cursor-pointer"
              />
              <Input
                type="text"
                value={settings.branding.primary_color || '#6366f1'}
                onChange={(e) => handleBrandingChange('primary_color', e.target.value)}
                placeholder="#6366f1"
                className={`flex-1 ${errors['branding.primary_color'] ? 'border-destructive' : ''}`}
              />
            </div>
            {errors['branding.primary_color'] && (
              <p className="text-sm text-destructive">{errors['branding.primary_color']}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="footer_note">Footer Note</Label>
            <Textarea
              id="footer_note"
              value={settings.branding.footer_note_md || ''}
              onChange={(e) => handleBrandingChange('footer_note_md', e.target.value)}
              placeholder="Thank you for your business! | www.devmart.sr"
              rows={2}
              className={errors['branding.footer_note_md'] ? 'border-destructive' : ''}
            />
            {errors['branding.footer_note_md'] && (
              <p className="text-sm text-destructive">{errors['branding.footer_note_md']}</p>
            )}
            <p className="text-sm text-muted-foreground">
              Markdown supported. Appears at the bottom of proposals and PDFs.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Email Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Configuration
          </CardTitle>
          <CardDescription>
            Configure email sending and signatures
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="from_name">From Name</Label>
              <Input
                id="from_name"
                value={settings.email.from_name}
                onChange={(e) => handleEmailChange('from_name', e.target.value)}
                placeholder="Devmart Team"
                className={errors['email.from_name'] ? 'border-destructive' : ''}
              />
              {errors['email.from_name'] && (
                <p className="text-sm text-destructive">{errors['email.from_name']}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="from_email">From Email (Display Only)</Label>
              <Input
                id="from_email"
                value={settings.email.from_email}
                onChange={(e) => handleEmailChange('from_email', e.target.value)}
                placeholder="proposals@devmart.sr"
                className={errors['email.from_email'] ? 'border-destructive' : ''}
              />
              {errors['email.from_email'] && (
                <p className="text-sm text-destructive">{errors['email.from_email']}</p>
              )}
              <p className="text-sm text-muted-foreground">
                Actual sending is handled by server configuration
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reply_to">Reply-To Email (Optional)</Label>
            <Input
              id="reply_to"
              value={settings.email.reply_to || ''}
              onChange={(e) => handleEmailChange('reply_to', e.target.value)}
              placeholder="contact@devmart.sr"
              className={errors['email.reply_to'] ? 'border-destructive' : ''}
            />
            {errors['email.reply_to'] && (
              <p className="text-sm text-destructive">{errors['email.reply_to']}</p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>BCC myself on sent proposals</Label>
              <p className="text-sm text-muted-foreground">
                Receive a copy of every proposal sent
              </p>
            </div>
            <Switch
              checked={settings.email.bcc_me}
              onCheckedChange={(checked) => handleEmailChange('bcc_me', checked)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="signature">Email Signature</Label>
            <Textarea
              id="signature"
              value={settings.email.signature_html || ''}
              onChange={(e) => handleEmailChange('signature_html', e.target.value)}
              placeholder="Best regards,<br>The Devmart Team<br><a href='https://devmart.sr'>devmart.sr</a>"
              rows={3}
              className={errors['email.signature_html'] ? 'border-destructive' : ''}
            />
            {errors['email.signature_html'] && (
              <p className="text-sm text-destructive">{errors['email.signature_html']}</p>
            )}
            <p className="text-sm text-muted-foreground">
              HTML supported. Keep it simple and professional.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Security & Tokens */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security & Access Control
          </CardTitle>
          <CardDescription>
            Configure proposal tokens and access control
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label>Token Expiration (Hours)</Label>
            <div className="px-3">
              <Slider
                value={[settings.tokens.ttl_hours]}
                onValueChange={([value]) => handleTokensChange('ttl_hours', value)}
                max={720}
                min={24}
                step={24}
                className="w-full"
              />
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>1 day</span>
              <span className="font-medium">{settings.tokens.ttl_hours} hours ({Math.floor(settings.tokens.ttl_hours / 24)} days)</span>
              <span>30 days</span>
            </div>
            <p className="text-sm text-muted-foreground">
              How long proposal links remain accessible
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Single-use tokens</Label>
              <p className="text-sm text-muted-foreground">
                Tokens become invalid after first access (higher security)
              </p>
            </div>
            <Switch
              checked={settings.tokens.single_use}
              onCheckedChange={(checked) => handleTokensChange('single_use', checked)}
            />
          </div>

          {settings.tokens.single_use && (
            <div className="p-3 bg-orange-50 border border-orange-200 rounded-md">
              <p className="text-sm text-orange-700">
                <strong>Note:</strong> Single-use tokens provide higher security but may cause issues 
                if clients need to revisit proposals. Consider your workflow carefully.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Attachments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Paperclip className="h-5 w-5" />
            Attachments & Media
          </CardTitle>
          <CardDescription>
            Configure attachment handling for proposals
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable attachments</Label>
              <p className="text-sm text-muted-foreground">
                Allow adding files to proposals and emails
              </p>
            </div>
            <Switch
              checked={settings.attachments.enabled}
              onCheckedChange={(checked) => handleAttachmentsChange('enabled', checked)}
            />
          </div>

          {settings.attachments.enabled && (
            <div className="space-y-3">
              <Label>Maximum file size (MB)</Label>
              <div className="px-3">
                <Slider
                  value={[settings.attachments.max_mb]}
                  onValueChange={([value]) => handleAttachmentsChange('max_mb', value)}
                  max={50}
                  min={1}
                  step={1}
                  className="w-full"
                />
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>1 MB</span>
                <span className="font-medium">{settings.attachments.max_mb} MB</span>
                <span>50 MB</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Accepted formats: PDF, DOCX, PPTX, images (PNG, JPG, GIF)
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}