import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { SEOHead } from '@/lib/seo';
import { adminCms } from '@/lib/admin-cms';
import { useAuth } from '@/lib/auth';
import { Save, Upload, Palette, Phone, Mail, MapPin, Globe, Search, FileText } from 'lucide-react';

interface SiteSettings {
  // Basic Info
  site_title: string;
  site_description: string;
  
  // Appearance
  logo_light_url: string;
  logo_dark_url: string;
  favicon_url: string;
  primary_color: string;
  secondary_color: string;
  
  // Contact Info
  contact_phone: string;
  contact_email: string;
  contact_address: string;
  facebook_url: string;
  linkedin_url: string;
  twitter_url: string;
  instagram_url: string;
  
  // SEO Defaults
  seo_title_template: string;
  seo_default_description: string;
  seo_default_og_image: string;
  
  // Footer
  footer_content: string;
  footer_legal_text: string;
  footer_links: string;
}

export default function Settings() {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<SiteSettings>({
    site_title: '',
    site_description: '',
    logo_light_url: '',
    logo_dark_url: '',
    favicon_url: '',
    primary_color: '#2563eb',
    secondary_color: '#7c3aed',
    contact_phone: '',
    contact_email: '',
    contact_address: '',
    facebook_url: '',
    linkedin_url: '',
    twitter_url: '',
    instagram_url: '',
    seo_title_template: '%s | %site_title%',
    seo_default_description: '',
    seo_default_og_image: '',
    footer_content: '',
    footer_legal_text: '',
    footer_links: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const data = await adminCms.getAllSettings();
      setSettings({
        site_title: data.site_title || '',
        site_description: data.site_description || '',
        logo_light_url: data.logo_light_url || '',
        logo_dark_url: data.logo_dark_url || '',
        favicon_url: data.favicon_url || '',
        primary_color: data.primary_color || '#2563eb',
        secondary_color: data.secondary_color || '#7c3aed',
        contact_phone: data.contact_phone || '',
        contact_email: data.contact_email || '',
        contact_address: data.contact_address || '',
        facebook_url: data.facebook_url || '',
        linkedin_url: data.linkedin_url || '',
        twitter_url: data.twitter_url || '',
        instagram_url: data.instagram_url || '',
        seo_title_template: data.seo_title_template || '%s | %site_title%',
        seo_default_description: data.seo_default_description || '',
        seo_default_og_image: data.seo_default_og_image || '',
        footer_content: data.footer_content || '',
        footer_legal_text: data.footer_legal_text || '',
        footer_links: data.footer_links || '',
      });
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch settings',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const validateUrl = (url: string, field: string) => {
    if (!url) return true;
    try {
      new URL(url);
      return true;
    } catch {
      setErrors(prev => ({ ...prev, [field]: 'Please enter a valid URL' }));
      return false;
    }
  };

  const validateEmail = (email: string, field: string) => {
    if (!email) return true;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(email);
    if (!isValid) {
      setErrors(prev => ({ ...prev, [field]: 'Please enter a valid email address' }));
    }
    return isValid;
  };

  const validateColor = (color: string, field: string) => {
    const colorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    const isValid = colorRegex.test(color);
    if (!isValid) {
      setErrors(prev => ({ ...prev, [field]: 'Please enter a valid hex color (e.g., #2563eb)' }));
    }
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    // Validate all fields
    const validations = [
      validateEmail(settings.contact_email, 'contact_email'),
      validateUrl(settings.facebook_url, 'facebook_url'),
      validateUrl(settings.linkedin_url, 'linkedin_url'),
      validateUrl(settings.twitter_url, 'twitter_url'),
      validateUrl(settings.instagram_url, 'instagram_url'),
      validateUrl(settings.logo_light_url, 'logo_light_url'),
      validateUrl(settings.logo_dark_url, 'logo_dark_url'),
      validateUrl(settings.favicon_url, 'favicon_url'),
      validateUrl(settings.seo_default_og_image, 'seo_default_og_image'),
      validateColor(settings.primary_color, 'primary_color'),
      validateColor(settings.secondary_color, 'secondary_color'),
    ];

    if (!validations.every(Boolean)) {
      toast({
        title: 'Validation Error',
        description: 'Please fix the validation errors below',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);

    try {
      // Update all settings
      const settingsToUpdate = Object.entries(settings).map(([key, value]) =>
        adminCms.updateSetting(key, value as string)
      );
      
      await Promise.all(settingsToUpdate);

      toast({
        title: 'Success',
        description: 'Settings saved successfully',
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to save settings',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (key: keyof SiteSettings, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    // Clear error when user starts typing
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: '' }));
    }
  };

  if (!isAdmin) {
    return (
      <div className="text-center py-8">
        <h1 className="text-2xl font-bold text-destructive mb-2">Access Denied</h1>
        <p className="text-muted-foreground">Only administrators can manage settings.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <SEOHead 
        title="Settings - Admin Panel"
        description="Manage site settings and configuration"
      />
      
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">Manage site settings and configuration</p>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="general" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              General
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Appearance
            </TabsTrigger>
            <TabsTrigger value="contact" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Contact
            </TabsTrigger>
            <TabsTrigger value="seo" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              SEO
            </TabsTrigger>
            <TabsTrigger value="footer" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Footer
            </TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* General Tab */}
            <TabsContent value="general" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Site Information</CardTitle>
                  <CardDescription>Basic information about your website</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="site_title">Site Title</Label>
                    <Input
                      id="site_title"
                      value={settings.site_title}
                      onChange={(e) => handleInputChange('site_title', e.target.value)}
                      placeholder="Agenko Agency"
                      aria-describedby="site-title-help"
                    />
                    <p id="site-title-help" className="text-sm text-muted-foreground">
                      This appears in browser tabs and search results
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="site_description">Site Description</Label>
                    <Textarea
                      id="site_description"
                      value={settings.site_description}
                      onChange={(e) => handleInputChange('site_description', e.target.value)}
                      placeholder="Professional agency services for digital transformation"
                      rows={3}
                      aria-describedby="site-desc-help"
                    />
                    <p id="site-desc-help" className="text-sm text-muted-foreground">
                      A brief description of your website for search engines
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Appearance Tab */}
            <TabsContent value="appearance" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Branding</CardTitle>
                  <CardDescription>Upload logos and customize colors</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="logo_light_url">Light Mode Logo URL</Label>
                      <Input
                        id="logo_light_url"
                        type="url"
                        value={settings.logo_light_url}
                        onChange={(e) => handleInputChange('logo_light_url', e.target.value)}
                        placeholder="https://example.com/logo-light.png"
                        className={errors.logo_light_url ? 'border-destructive' : ''}
                      />
                      {errors.logo_light_url && (
                        <p className="text-sm text-destructive">{errors.logo_light_url}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="logo_dark_url">Dark Mode Logo URL</Label>
                      <Input
                        id="logo_dark_url"
                        type="url"
                        value={settings.logo_dark_url}
                        onChange={(e) => handleInputChange('logo_dark_url', e.target.value)}
                        placeholder="https://example.com/logo-dark.png"
                        className={errors.logo_dark_url ? 'border-destructive' : ''}
                      />
                      {errors.logo_dark_url && (
                        <p className="text-sm text-destructive">{errors.logo_dark_url}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="favicon_url">Favicon URL</Label>
                    <Input
                      id="favicon_url"
                      type="url"
                      value={settings.favicon_url}
                      onChange={(e) => handleInputChange('favicon_url', e.target.value)}
                      placeholder="https://example.com/favicon.png"
                      className={errors.favicon_url ? 'border-destructive' : ''}
                    />
                    {errors.favicon_url && (
                      <p className="text-sm text-destructive">{errors.favicon_url}</p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      Use PNG format. Recommended size: 32x32 or 64x64 pixels
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="primary_color">Primary Color</Label>
                      <div className="flex gap-2">
                        <Input
                          id="primary_color"
                          type="color"
                          value={settings.primary_color}
                          onChange={(e) => handleInputChange('primary_color', e.target.value)}
                          className="w-16 h-10 p-1 border rounded cursor-pointer"
                        />
                        <Input
                          type="text"
                          value={settings.primary_color}
                          onChange={(e) => handleInputChange('primary_color', e.target.value)}
                          placeholder="#2563eb"
                          className={`flex-1 ${errors.primary_color ? 'border-destructive' : ''}`}
                        />
                      </div>
                      {errors.primary_color && (
                        <p className="text-sm text-destructive">{errors.primary_color}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="secondary_color">Secondary Color</Label>
                      <div className="flex gap-2">
                        <Input
                          id="secondary_color"
                          type="color"
                          value={settings.secondary_color}
                          onChange={(e) => handleInputChange('secondary_color', e.target.value)}
                          className="w-16 h-10 p-1 border rounded cursor-pointer"
                        />
                        <Input
                          type="text"
                          value={settings.secondary_color}
                          onChange={(e) => handleInputChange('secondary_color', e.target.value)}
                          placeholder="#7c3aed"
                          className={`flex-1 ${errors.secondary_color ? 'border-destructive' : ''}`}
                        />
                      </div>
                      {errors.secondary_color && (
                        <p className="text-sm text-destructive">{errors.secondary_color}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Contact Tab */}
            <TabsContent value="contact" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                  <CardDescription>Business contact details and social media links</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contact_email" className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Contact Email
                      </Label>
                      <Input
                        id="contact_email"
                        type="email"
                        value={settings.contact_email}
                        onChange={(e) => handleInputChange('contact_email', e.target.value)}
                        placeholder="hello@agenko.com"
                        className={errors.contact_email ? 'border-destructive' : ''}
                      />
                      {errors.contact_email && (
                        <p className="text-sm text-destructive">{errors.contact_email}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="contact_phone" className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Contact Phone
                      </Label>
                      <Input
                        id="contact_phone"
                        type="tel"
                        value={settings.contact_phone}
                        onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact_address" className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Business Address
                    </Label>
                    <Textarea
                      id="contact_address"
                      value={settings.contact_address}
                      onChange={(e) => handleInputChange('contact_address', e.target.value)}
                      placeholder="123 Business St, City, State 12345"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Social Media Links</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="facebook_url">Facebook URL</Label>
                        <Input
                          id="facebook_url"
                          type="url"
                          value={settings.facebook_url}
                          onChange={(e) => handleInputChange('facebook_url', e.target.value)}
                          placeholder="https://facebook.com/agenkoteam"
                          className={errors.facebook_url ? 'border-destructive' : ''}
                        />
                        {errors.facebook_url && (
                          <p className="text-sm text-destructive">{errors.facebook_url}</p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="linkedin_url">LinkedIn URL</Label>
                        <Input
                          id="linkedin_url"
                          type="url"
                          value={settings.linkedin_url}
                          onChange={(e) => handleInputChange('linkedin_url', e.target.value)}
                          placeholder="https://linkedin.com/company/agenko"
                          className={errors.linkedin_url ? 'border-destructive' : ''}
                        />
                        {errors.linkedin_url && (
                          <p className="text-sm text-destructive">{errors.linkedin_url}</p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="twitter_url">Twitter URL</Label>
                        <Input
                          id="twitter_url"
                          type="url"
                          value={settings.twitter_url}
                          onChange={(e) => handleInputChange('twitter_url', e.target.value)}
                          placeholder="https://twitter.com/agenkoteam"
                          className={errors.twitter_url ? 'border-destructive' : ''}
                        />
                        {errors.twitter_url && (
                          <p className="text-sm text-destructive">{errors.twitter_url}</p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="instagram_url">Instagram URL</Label>
                        <Input
                          id="instagram_url"
                          type="url"
                          value={settings.instagram_url}
                          onChange={(e) => handleInputChange('instagram_url', e.target.value)}
                          placeholder="https://instagram.com/agenkoteam"
                          className={errors.instagram_url ? 'border-destructive' : ''}
                        />
                        {errors.instagram_url && (
                          <p className="text-sm text-destructive">{errors.instagram_url}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* SEO Tab */}
            <TabsContent value="seo" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>SEO Defaults</CardTitle>
                  <CardDescription>Default SEO settings for pages without custom values</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="seo_title_template">Title Template</Label>
                    <Input
                      id="seo_title_template"
                      value={settings.seo_title_template}
                      onChange={(e) => handleInputChange('seo_title_template', e.target.value)}
                      placeholder="%s | %site_title%"
                      aria-describedby="title-template-help"
                    />
                    <p id="title-template-help" className="text-sm text-muted-foreground">
                      Use %s for page title and %site_title% for site name. Example: "About Us | Agenko Agency"
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="seo_default_description">Default Meta Description</Label>
                    <Textarea
                      id="seo_default_description"
                      value={settings.seo_default_description}
                      onChange={(e) => handleInputChange('seo_default_description', e.target.value)}
                      placeholder="Professional agency services for digital transformation..."
                      rows={3}
                      maxLength={160}
                      aria-describedby="meta-desc-help"
                    />
                    <p id="meta-desc-help" className="text-sm text-muted-foreground">
                      {160 - settings.seo_default_description.length} characters remaining. Used when pages don't have custom descriptions.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="seo_default_og_image">Default Open Graph Image</Label>
                    <Input
                      id="seo_default_og_image"
                      type="url"
                      value={settings.seo_default_og_image}
                      onChange={(e) => handleInputChange('seo_default_og_image', e.target.value)}
                      placeholder="https://example.com/og-image.jpg"
                      className={errors.seo_default_og_image ? 'border-destructive' : ''}
                      aria-describedby="og-image-help"
                    />
                    {errors.seo_default_og_image && (
                      <p className="text-sm text-destructive">{errors.seo_default_og_image}</p>
                    )}
                    <p id="og-image-help" className="text-sm text-muted-foreground">
                      Recommended size: 1200x630px. Used for social media previews when pages don't have custom images.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Footer Tab */}
            <TabsContent value="footer" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Footer Content</CardTitle>
                  <CardDescription>Customize footer links, content, and legal text</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="footer_content">Footer Description</Label>
                    <Textarea
                      id="footer_content"
                      value={settings.footer_content}
                      onChange={(e) => handleInputChange('footer_content', e.target.value)}
                      placeholder="We are a digital agency focused on delivering exceptional results..."
                      rows={3}
                      aria-describedby="footer-content-help"
                    />
                    <p id="footer-content-help" className="text-sm text-muted-foreground">
                      Brief description or company mission statement for the footer
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="footer_links">Footer Links (JSON)</Label>
                    <Textarea
                      id="footer_links"
                      value={settings.footer_links}
                      onChange={(e) => handleInputChange('footer_links', e.target.value)}
                      placeholder={JSON.stringify([
                        { title: "Company", links: [{ text: "About", href: "/about" }, { text: "Contact", href: "/contact" }] },
                        { title: "Services", links: [{ text: "Web Design", href: "/services/web-design" }] }
                      ], null, 2)}
                      rows={8}
                      className="font-mono text-sm"
                      aria-describedby="footer-links-help"
                    />
                    <p id="footer-links-help" className="text-sm text-muted-foreground">
                      JSON format with title and links array. Each link needs text and href properties.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="footer_legal_text">Legal/Copyright Text</Label>
                    <Input
                      id="footer_legal_text"
                      value={settings.footer_legal_text}
                      onChange={(e) => handleInputChange('footer_legal_text', e.target.value)}
                      placeholder="© 2024 Agenko Agency. All rights reserved."
                      aria-describedby="footer-legal-help"
                    />
                    <p id="footer-legal-help" className="text-sm text-muted-foreground">
                      Copyright notice and legal text displayed at the bottom of the footer
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button type="submit" disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save All Settings'}
              </Button>
            </div>
          </form>
        </Tabs>
      </div>
    </>
  );
}