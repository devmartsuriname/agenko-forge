import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { SEOHead } from '@/lib/seo';
import { adminCms } from '@/lib/admin-cms';
import { BlogPost } from '@/types/content';
import { useAuth } from '@/lib/auth';
import { generateSlug, ensureUniqueSlug } from '@/lib/admin-utils';
import { ArrowLeft, Save, Eye, X, Plus } from 'lucide-react';

function AdminBlogEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isEditor } = useAuth();
  const { toast } = useToast();
  const isEditing = Boolean(id);

  const [post, setPost] = useState<Partial<BlogPost>>({
    title: '',
    slug: '',
    excerpt: '',
    body: {},
    tags: [],
    status: 'draft',
  });
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    if (isEditing && id) {
      fetchPost(id);
    }
  }, [id]);

  const fetchPost = async (postId: string) => {
    try {
      const data = await adminCms.getBlogPost(postId);
      setPost(data);
    } catch (error) {
      console.error('Error fetching blog post:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch blog post',
        variant: 'destructive',
      });
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

  const handleAddTag = () => {
    if (!newTag.trim()) return;
    
    const tag = newTag.trim().toLowerCase();
    const currentTags = post.tags || [];
    
    if (currentTags.includes(tag)) {
      toast({
        title: 'Error',
        description: 'Tag already exists',
        variant: 'destructive',
      });
      return;
    }

    if (currentTags.length >= 10) {
      toast({
        title: 'Error',
        description: 'Maximum 10 tags allowed',
        variant: 'destructive',
      });
      return;
    }

    if (tag.length > 50) {
      toast({
        title: 'Error',
        description: 'Tag must be 50 characters or less',
        variant: 'destructive',
      });
      return;
    }

    setPost(prev => ({
      ...prev,
      tags: [...currentTags, tag]
    }));
    setNewTag('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setPost(prev => ({
      ...prev,
      tags: (prev.tags || []).filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSave = async () => {
    if (!post.title?.trim()) {
      toast({
        title: 'Error',
        description: 'Blog post title is required',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      const now = new Date().toISOString();
      const publishedAt = post.status === 'published' && !post.published_at ? now : post.published_at;

      if (isEditing && id) {
        await adminCms.updateBlogPost(id, {
          ...post,
          published_at: publishedAt,
        });
      } else {
        const created = await adminCms.createBlogPost({
          title: post.title!,
          slug: post.slug!,
          excerpt: post.excerpt || null,
          body: post.body || {},
          tags: post.tags || [],
          status: post.status!,
          published_at: publishedAt,
        });
        navigate(`/admin/blog/${created.id}/edit`);
      }

      toast({
        title: 'Success',
        description: `Blog post ${isEditing ? 'updated' : 'created'} successfully`,
      });
    } catch (error) {
      console.error('Error saving blog post:', error);
      toast({
        title: 'Error',
        description: `Failed to ${isEditing ? 'update' : 'create'} blog post`,
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
        <p className="text-muted-foreground">You don't have permission to edit blog posts.</p>
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
        title={`${isEditing ? 'Edit' : 'New'} Blog Post - Admin Panel`}
        description="Edit blog post content"
      />
      
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Post Details</CardTitle>
                <CardDescription>Basic information about your blog post</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={post.title || ''}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="Enter blog post title"
                  />
                </div>

                <div>
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    value={post.slug || ''}
                    onChange={(e) => setPost(prev => ({ ...prev, slug: e.target.value }))}
                    placeholder="blog-post-slug"
                  />
                </div>

                <div>
                  <Label htmlFor="excerpt">Excerpt</Label>
                  <Textarea
                    id="excerpt"
                    value={post.excerpt || ''}
                    onChange={(e) => setPost(prev => ({ ...prev, excerpt: e.target.value }))}
                    placeholder="Brief description of the blog post"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="body">Content</Label>
                  <Textarea
                    id="body"
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
                  />
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
                  <Label htmlFor="status">Status</Label>
                  <Select value={post.status} onValueChange={(value) => setPost(prev => ({ ...prev, status: value as 'draft' | 'published' }))}>
                    <SelectTrigger>
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
                    <span className="text-sm font-medium">Status</span>
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

            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
                <CardDescription>Add tags to categorize your post</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add a tag"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                  />
                  <Button type="button" onClick={handleAddTag} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}

                <p className="text-xs text-muted-foreground">
                  Maximum 10 tags, 50 characters each
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}

export default AdminBlogEditor;
