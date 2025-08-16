import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { SEOHead } from '@/lib/seo';
import { adminCms } from '@/lib/admin-cms';
import { Page } from '@/types/content';
import { useAuth } from '@/lib/auth';
import { generateSlug, ensureUniqueSlug } from '@/lib/admin-utils';
import { Save, ArrowLeft } from 'lucide-react';

function AdminPageEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isEditor } = useAuth();
  const { toast } = useToast();
  const isEditing = id !== 'new';
  
  const [page, setPage] = useState<Partial<Page>>({
    title: '',
    slug: '',
    body: {},
    status: 'draft',
    published_at: null,
  });
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEditing && id) {
      fetchPage(id);
    }
  }, [id, isEditing]);

  const fetchPage = async (pageId: string) => {
    try {
      const data = await adminCms.getAllPages();
      const foundPage = data.find(p => p.id === pageId);
      if (foundPage) {
        setPage(foundPage);
        setContent(foundPage.body?.content || '');
      } else {
        toast({
          title: 'Error',
          description: 'Page not found',
          variant: 'destructive',
        });
        navigate('/admin/pages');
      }
    } catch (error) {
      console.error('Error fetching page:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch page',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTitleChange = async (title: string) => {
    setPage(prev => ({ ...prev, title }));
    
    // Auto-generate slug for new pages
    if (!isEditing && title.trim()) {
      const baseSlug = generateSlug(title);
      const uniqueSlug = await ensureUniqueSlug('pages', baseSlug);
      setPage(prev => ({ ...prev, slug: uniqueSlug }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const pageData = {
        ...page,
        body: { content },
        published_at: page.status === 'published' && !page.published_at ? new Date().toISOString() : page.published_at,
      };

      if (isEditing && id) {
        await adminCms.updatePage(id, pageData);
        toast({
          title: 'Success',
          description: 'Page updated successfully',
        });
      } else {
        // Ensure unique slug before creating
        const uniqueSlug = await ensureUniqueSlug('pages', page.slug || generateSlug(page.title || ''));
        await adminCms.createPage({ ...pageData, slug: uniqueSlug } as Omit<Page, 'id' | 'created_at' | 'updated_at'>);
        toast({
          title: 'Success',
          description: 'Page created successfully',
        });
      }
      
      navigate('/admin/pages');
    } catch (error) {
      console.error('Error saving page:', error);
      toast({
        title: 'Error',
        description: 'Failed to save page',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (!isEditor) {
    return (
      <div className="text-center py-8">
        <h1 className="text-2xl font-bold text-destructive mb-2">Access Denied</h1>
        <p className="text-muted-foreground">You don't have permission to edit pages.</p>
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
        title={`${isEditing ? 'Edit' : 'New'} Page - Admin Panel`}
        description={`${isEditing ? 'Edit' : 'Create'} page content`}
      />
      
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate('/admin/pages')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Pages
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {isEditing ? 'Edit Page' : 'New Page'}
            </h1>
            <p className="text-muted-foreground">
              {isEditing ? 'Update page content' : 'Create a new page'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Page Details</CardTitle>
              <CardDescription>Basic information about the page</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={page.title || ''}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Enter page title"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={page.slug || ''}
                  onChange={(e) => setPage(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="page-url-slug"
                  required
                />
                <p className="text-sm text-muted-foreground">
                  This will be the URL: /{page.slug || 'page-url-slug'}
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={page.status || 'draft'}
                  onValueChange={(value) => setPage(prev => ({ ...prev, status: value as 'draft' | 'published' }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Content</CardTitle>
              <CardDescription>Page content and body text</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Enter page content..."
                  rows={15}
                  className="font-mono"
                />
                <p className="text-sm text-muted-foreground">
                  You can use Markdown syntax for formatting.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/admin/pages')}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Page'}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}

export default AdminPageEditor;