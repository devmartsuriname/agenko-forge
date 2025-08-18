import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, AlertTriangle, CheckCircle2 } from 'lucide-react';

export interface SEOData {
  seo_title?: string;
  seo_description?: string;
  seo_canonical_url?: string;
  seo_og_image?: string;
  seo_robots?: string;
  seo_schema_type?: string;
}

interface SEOEditorProps {
  seo: SEOData;
  onSEOChange: (seo: SEOData) => void;
  fallbackTitle: string;
  fallbackDescription?: string;
  entityType: 'page' | 'blog' | 'project' | 'service';
  slug?: string;
  disabled?: boolean;
}

const SCHEMA_TYPES = {
  page: ['WebPage', 'AboutPage', 'ContactPage', 'FAQPage'],
  blog: ['Article', 'BlogPosting', 'NewsArticle'],
  project: ['CreativeWork', 'Product', 'SoftwareApplication'],
  service: ['Service', 'Product', 'ProfessionalService']
};

const ROBOTS_OPTIONS = [
  'index,follow',
  'index,nofollow', 
  'noindex,follow',
  'noindex,nofollow'
];

export function SEOEditor({ 
  seo, 
  onSEOChange, 
  fallbackTitle, 
  fallbackDescription = '', 
  entityType, 
  slug,
  disabled = false 
}: SEOEditorProps) {
  const [showPreview, setShowPreview] = useState(false);

  const updateSEO = (field: keyof SEOData, value: string) => {
    onSEOChange({
      ...seo,
      [field]: value || undefined
    });
  };

  const validateURL = (url: string): boolean => {
    if (!url) return true;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const getDisplayTitle = () => seo.seo_title || fallbackTitle;
  const getDisplayDescription = () => seo.seo_description || fallbackDescription;
  
  const titleLength = getDisplayTitle().length;
  const descriptionLength = getDisplayDescription().length;
  
  const titleStatus = titleLength === 0 ? 'empty' : titleLength <= 60 ? 'good' : 'warning';
  const descriptionStatus = descriptionLength === 0 ? 'empty' : descriptionLength <= 160 ? 'good' : 'warning';

  const StatusIcon = ({ status }: { status: string }) => {
    switch (status) {
      case 'good':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>SEO Optimization</CardTitle>
          <CardDescription>
            Configure search engine optimization settings for this {entityType}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="seo-title">SEO Title</Label>
              <div className="flex items-center space-x-2">
                <StatusIcon status={titleStatus} />
                <Badge variant={titleStatus === 'good' ? 'default' : titleStatus === 'warning' ? 'destructive' : 'secondary'}>
                  {titleLength}/60
                </Badge>
              </div>
            </div>
            <Input
              id="seo-title"
              value={seo.seo_title || ''}
              onChange={(e) => updateSEO('seo_title', e.target.value)}
              placeholder={`Override default: "${fallbackTitle}"`}
              disabled={disabled}
              maxLength={100}
            />
            <p className="text-sm text-muted-foreground">
              {seo.seo_title ? 'Custom SEO title' : 'Using default title from content'} 
              {titleLength > 60 && ' • Too long for optimal display'}
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="seo-description">Meta Description</Label>
              <div className="flex items-center space-x-2">
                <StatusIcon status={descriptionStatus} />
                <Badge variant={descriptionStatus === 'good' ? 'default' : descriptionStatus === 'warning' ? 'destructive' : 'secondary'}>
                  {descriptionLength}/160
                </Badge>
              </div>
            </div>
            <Textarea
              id="seo-description"
              value={seo.seo_description || ''}
              onChange={(e) => updateSEO('seo_description', e.target.value)}
              placeholder={fallbackDescription ? `Override default: "${fallbackDescription}"` : 'Enter meta description'}
              disabled={disabled}
              rows={3}
              maxLength={200}
            />
            <p className="text-sm text-muted-foreground">
              {seo.seo_description ? 'Custom meta description' : 'Using default from excerpt/content'}
              {descriptionLength > 160 && ' • Too long for optimal display'}
            </p>
          </div>

          {/* Advanced Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="seo-robots">Robots</Label>
              <Select 
                value={seo.seo_robots || 'index,follow'} 
                onValueChange={(value) => updateSEO('seo_robots', value)}
                disabled={disabled}
              >
                <SelectTrigger id="seo-robots">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROBOTS_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="seo-schema-type">Schema Type</Label>
              <Select 
                value={seo.seo_schema_type || SCHEMA_TYPES[entityType][0]} 
                onValueChange={(value) => updateSEO('seo_schema_type', value)}
                disabled={disabled}
              >
                <SelectTrigger id="seo-schema-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SCHEMA_TYPES[entityType].map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Canonical URL */}
          <div className="space-y-2">
            <Label htmlFor="seo-canonical">Canonical URL</Label>
            <Input
              id="seo-canonical"
              type="url"
              value={seo.seo_canonical_url || ''}
              onChange={(e) => updateSEO('seo_canonical_url', e.target.value)}
              placeholder="https://example.com/canonical-url"
              disabled={disabled}
            />
            {seo.seo_canonical_url && !validateURL(seo.seo_canonical_url) && (
              <p className="text-sm text-destructive">Please enter a valid URL</p>
            )}
            <p className="text-sm text-muted-foreground">
              Leave empty to use default URL structure
            </p>
          </div>

          {/* OG Image */}
          <div className="space-y-2">
            <Label htmlFor="seo-og-image">Open Graph Image URL</Label>
            <Input
              id="seo-og-image"
              type="url"
              value={seo.seo_og_image || ''}
              onChange={(e) => updateSEO('seo_og_image', e.target.value)}
              placeholder="https://example.com/image.jpg"
              disabled={disabled}
            />
            <p className="text-sm text-muted-foreground">
              Image for social media sharing (recommended: 1200x630px)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Search Preview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Search Preview</CardTitle>
              <CardDescription>How this will appear in search results</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
            >
              <Eye className="h-4 w-4 mr-2" />
              {showPreview ? 'Hide' : 'Show'} Preview
            </Button>
          </div>
        </CardHeader>
        {showPreview && (
          <CardContent>
            <div className="border rounded-lg p-4 bg-background">
              <div className="text-blue-600 hover:underline text-lg cursor-pointer">
                {getDisplayTitle()}
              </div>
              <div className="text-green-700 text-sm">
                https://yoursite.com/{slug || 'page-url'}
              </div>
              <div className="text-gray-600 text-sm mt-1">
                {getDisplayDescription() || 'No description available'}
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}