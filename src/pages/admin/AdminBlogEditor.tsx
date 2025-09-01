import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { SEOHead } from '@/lib/seo';
import { adminCms } from '@/lib/admin-cms';
import { BlogPost } from '@/types/content';
import { useAuth } from '@/lib/auth';
import { generateSlug, ensureUniqueSlug, isValidUUID } from '@/lib/admin-utils';
import { adminToast } from '@/lib/toast-utils';
import { LoadingCardSkeleton } from '@/components/admin/LoadingSkeleton';
import { TagInput } from '@/components/admin/TagInput';
import { SEOEditor, SEOData } from '@/components/admin/SEOEditor';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CategorySelector } from '@/components/admin/CategorySelector';
import { MediaPicker } from '@/components/media/MediaPicker';
import { ArrowLeft, Save, Eye, Image, Upload } from 'lucide-react';

function AdminBlogEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isEditor } = useAuth();
  const isEditing = id !== 'new' && isValidUUID(id || '');

  const [post, setPost] = useState<Partial<BlogPost>>({
    title: '',
    slug: '',
    excerpt: '',
    body: {},
    tags: [],
    status: 'draft',
    feature_image_url: '',
    seo_title: '',
    seo_description: '',
    seo_canonical_url: '',
    seo_og_image: '',
    seo_robots: 'index,follow',
    seo_schema_type: 'Article',
  });
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEditing && id && isValidUUID(id)) {
      fetchPost(id);
    }
  }, [id, isEditing]);

  const fetchPost = async (postId: string) => {
    try {
      const data = await adminCms.getBlogPost(postId);
      setPost(data);
      
      // Set categories if they exist
      if (data.categories) {
        setSelectedCategoryIds(data.categories.map(cat => cat.id));
      }
    } catch (error) {
      console.error('Error fetching blog post:', error);
      if (error instanceof Error && error.message.includes('permission')) {
        adminToast.permissionDenied('view blog posts');
      } else {
        adminToast.error('Failed to Load', 'Unable to load blog post');
      }
      navigate('/admin/blog');
    } finally {
      setLoading(false);
    }
  };

  const handleTitleChange = async (title: string) => {
    setPost(prev => ({ ...prev, title }));
    
    if (!isEditing && title.trim()) {
      const baseSlug = generateSlug(title);
      const uniqueSlug = await ensureUniqueSlug('blog_posts', baseSlug);
      setPost(prev => ({ ...prev, slug: uniqueSlug }));
    }
  };

  const handleSave = async () => {
    if (!post.title?.trim()) {
      adminToast.validationError('Title is required');
      return;
    }

    setSaving(true);
    try {
      const slug = await ensureUniqueSlug('blog_posts', generateSlug(post.title), isEditing ? post.id : undefined);
      const postData = {
        title: post.title!,
        slug,
        excerpt: post.excerpt || '',
        body: post.body || {},
        tags: post.tags || [],
        status: post.status!,
        feature_image_url: post.feature_image_url || '',
        published_at: post.status === 'published' && !post.published_at ? new Date().toISOString() : post.published_at,
        seo_title: post.seo_title,
        seo_description: post.seo_description,
        seo_canonical_url: post.seo_canonical_url,
        seo_og_image: post.seo_og_image,
        seo_robots: post.seo_robots,
        seo_schema_type: post.seo_schema_type,
      };

      if (isEditing) {
        await adminCms.updateBlogPost(post.id!, postData, selectedCategoryIds);
        adminToast.updated('Blog Post', post.title);
      } else {
        const newPost = await adminCms.createBlogPost(postData, selectedCategoryIds);
        adminToast.created('Blog Post', post.title);
        navigate(`/admin/blog/${newPost.id}/edit`);
      }
    } catch (error) {
      console.error('Error saving blog post:', error);
      if (error instanceof Error && error.message.includes('permission')) {
        adminToast.permissionDenied('save blog posts');
      } else {
        adminToast.error('Failed to Save', 'Unable to save blog post. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  if (!isEditor) {
    return (
      <div className="text-center py-8">
        <h1 className="text-2xl font-bold text-destructive mb-2">Access Denied</h1>
        <p className="text-muted-foreground">You don't have permission to edit blog posts.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <>
        <SEOHead 
          title={`${isEditing ? 'Edit' : 'Create'} Blog Post - Admin Panel`}
          description="Blog post editor"
        />
        <meta name="robots" content="noindex,nofollow" />
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => navigate('/admin/blog')} disabled>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Blog
            </Button>
            <Button disabled>
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>
          <LoadingCardSkeleton />
        </div>
      </>
    );
  }

  return (
    <>
      <SEOHead 
        title={`${isEditing ? 'Edit' : 'Create'} Blog Post - Admin Panel`}
        description="Blog post editor"
      />
      <meta name="robots" content="noindex,nofollow" />
      
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => navigate('/admin/blog')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Blog
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {isEditing ? 'Edit Blog Post' : 'New Blog Post'}
              </h1>
              {post.slug && (
                <p className="text-muted-foreground">/blog/{post.slug}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {post.status === 'published' && post.slug && (
              <Button variant="outline" asChild>
                <a href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer">
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </a>
              </Button>
            )}
            <Button onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Post'}
            </Button>
          </div>
        </div>

        <Tabs defaultValue="content" className="space-y-6">
          <TabsList>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
          </TabsList>

          <TabsContent value="content">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Post Details</CardTitle>
                    <CardDescription>Basic information about your blog post</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <Label htmlFor="blog-title">Title *</Label>
                      <Input
                        id="blog-title"
                        placeholder="Enter blog post title"
                        value={post.title || ''}
                        onChange={(e) => handleTitleChange(e.target.value)}
                        disabled={saving}
                        aria-describedby="title-help"
                        required
                      />
                      <p id="title-help" className="text-sm text-muted-foreground mt-1">
                        A clear, descriptive title for your blog post
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="blog-slug">URL Slug</Label>
                      <Input
                        id="blog-slug"
                        placeholder="url-friendly-slug"
                        value={post.slug || ''}
                        onChange={(e) => setPost(prev => ({ ...prev, slug: e.target.value }))}
                        disabled={saving}
                        aria-describedby="slug-help"
                      />
                      <p id="slug-help" className="text-sm text-muted-foreground mt-1">
                        Auto-generated from title, or customize manually
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="blog-excerpt">Excerpt</Label>
                      <Textarea
                        id="blog-excerpt"
                        placeholder="Brief description of the blog post"
                        value={post.excerpt || ''}
                        onChange={(e) => setPost(prev => ({ ...prev, excerpt: e.target.value }))}
                        disabled={saving}
                        rows={3}
                        aria-describedby="excerpt-help"
                      />
                      <p id="excerpt-help" className="text-sm text-muted-foreground mt-1">
                        A short summary that appears in blog listings and search results
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="blog-content">Content</Label>
                      <Textarea
                        id="blog-content"
                        value={typeof post.body === 'object' ? JSON.stringify(post.body, null, 2) : ''}
                        onChange={(e) => {
                          try {
                            const parsed = JSON.parse(e.target.value || '{}');
                            setPost(prev => ({ ...prev, body: parsed }));
                          } catch {
                            // Invalid JSON, keep as is for now
                          }
                        }}
                        placeholder="Blog post content (JSON format)"
                        rows={15}
                        className="font-mono text-sm"
                        disabled={saving}
                        aria-describedby="content-help"
                      />
                      <p id="content-help" className="text-sm text-muted-foreground mt-1">
                        Rich content in JSON format (future rich text editor)
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Publishing</CardTitle>
                    <CardDescription>Control post visibility</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="blog-status">Status</Label>
                      <Select value={post.status} onValueChange={(value) => setPost(prev => ({ ...prev, status: value as 'draft' | 'published' }))}>
                        <SelectTrigger id="blog-status">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="published">Published</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="pt-4 border-t">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Current Status</span>
                        <Badge variant={post.status === 'published' ? 'default' : 'secondary'}>
                          {post.status}
                        </Badge>
                      </div>
                      {post.published_at && (
                        <p className="text-sm text-muted-foreground mt-2">
                          Published {new Date(post.published_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <CategorySelector
                  selectedCategoryIds={selectedCategoryIds}
                  onCategoryChange={setSelectedCategoryIds}
                  disabled={saving}
                />

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Image className="w-4 h-4 mr-2" />
                      Feature Image
                    </CardTitle>
                    <CardDescription>Set a feature image for this blog post</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {post.feature_image_url ? (
                      <div className="space-y-3">
                        <div className="aspect-video rounded-lg overflow-hidden border">
                          <img
                            src={post.feature_image_url}
                            alt="Feature image preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowMediaPicker(true)}
                            disabled={saving}
                          >
                            <Upload className="w-4 h-4 mr-1" />
                            Change Image
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setPost(prev => ({ ...prev, feature_image_url: '' }))}
                            disabled={saving}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                        <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <Button
                          variant="outline"
                          onClick={() => setShowMediaPicker(true)}
                          disabled={saving}
                        >
                          Select Feature Image
                        </Button>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Feature images appear in blog listings and social media previews. Recommended size: 1200x630px.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="seo">
            <SEOEditor
              seo={{
                seo_title: post.seo_title,
                seo_description: post.seo_description,
                seo_canonical_url: post.seo_canonical_url,
                seo_og_image: post.seo_og_image,
                seo_robots: post.seo_robots,
                seo_schema_type: post.seo_schema_type,
              }}
              onSEOChange={(seo: SEOData) => setPost(prev => ({ ...prev, ...seo }))}
              fallbackTitle={post.title || 'Untitled Post'}
              fallbackDescription={post.excerpt || ''}
              entityType="blog"
              slug={post.slug}
              disabled={saving}
            />
          </TabsContent>
        </Tabs>

        <MediaPicker
          open={showMediaPicker}
          onOpenChange={setShowMediaPicker}
          onSelect={(media) => {
            setPost(prev => ({ ...prev, feature_image_url: media.url }));
            setShowMediaPicker(false);
          }}
          uploadPath="blog/"
        />
      </div>
    </>
  );
}

export default AdminBlogEditor;
