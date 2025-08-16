import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { SEOHead } from '@/lib/seo';
import { adminCms } from '@/lib/admin-cms';
import { ProjectImage } from '@/lib/cms';
import { useAuth } from '@/lib/auth';
import { Plus, Image, ExternalLink } from 'lucide-react';

export default function AdminMedia() {
  const { isEditor } = useAuth();
  const { toast } = useToast();
  const [mediaItems, setMediaItems] = useState<ProjectImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newMedia, setNewMedia] = useState({ url: '', alt: '' });

  useEffect(() => {
    fetchMediaItems();
  }, []);

  const fetchMediaItems = async () => {
    try {
      // Get all project images as media references
      const data = await adminCms.getAllProjectImages();
      setMediaItems(data);
    } catch (error) {
      console.error('Error fetching media items:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch media items',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddMedia = async () => {
    if (!newMedia.url.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a media URL',
        variant: 'destructive',
      });
      return;
    }

    // For now, this is just a placeholder
    // In the future, this would integrate with actual media upload/storage
    toast({
      title: 'Info',
      description: 'Media upload feature is coming soon. Use project galleries to add images.',
      variant: 'default',
    });

    setShowAddDialog(false);
    setNewMedia({ url: '', alt: '' });
  };

  // Placeholder function for future signed URL generation
  const generateSignedUrl = async (url: string): Promise<string> => {
    // This is a stub for future Supabase Storage integration
    // Will generate time-limited signed URLs for secure media access
    return url;
  };

  if (!isEditor) {
    return (
      <div className="text-center py-8">
        <h1 className="text-2xl font-bold text-destructive mb-2">Access Denied</h1>
        <p className="text-muted-foreground">You don't have permission to access media management.</p>
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
        title="Media - Admin Panel"
        description="Manage media files and assets"
      />
      
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Media Library</h1>
            <p className="text-muted-foreground">Manage your media files and assets</p>
          </div>
          
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Media
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Media</DialogTitle>
                <DialogDescription>
                  Add a new media file to your library (Upload functionality coming soon)
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="mediaUrl">Media URL *</Label>
                  <Input
                    id="mediaUrl"
                    value={newMedia.url}
                    onChange={(e) => setNewMedia(prev => ({ ...prev, url: e.target.value }))}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                <div>
                  <Label htmlFor="mediaAlt">Alt Text / Description</Label>
                  <Input
                    id="mediaAlt"
                    value={newMedia.alt}
                    onChange={(e) => setNewMedia(prev => ({ ...prev, alt: e.target.value }))}
                    placeholder="Description of the media file"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddMedia}>
                    Add Media
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Media Grid */}
        <Card>
          <CardHeader>
            <CardTitle>Media Files ({mediaItems.length})</CardTitle>
            <CardDescription>
              Media files referenced in your projects. Upload functionality and storage management coming soon.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {mediaItems.length === 0 ? (
              <div className="text-center py-12">
                <Image className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No media files found.</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Add images to your projects to see them listed here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {mediaItems.map((item) => (
                  <div key={item.id} className="border rounded-lg overflow-hidden">
                    <div className="aspect-square relative">
                      <img
                        src={item.url}
                        alt={item.alt || 'Media file'}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder.svg';
                        }}
                      />
                    </div>
                    <div className="p-3">
                      <p className="font-medium text-sm truncate">
                        {item.alt || 'Untitled'}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {item.url}
                      </p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-muted-foreground">
                          Used in projects
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(item.url, '_blank')}
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Future Features Info */}
        <Card>
          <CardHeader>
            <CardTitle>Coming Soon</CardTitle>
            <CardDescription>Planned media management features</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium">File Upload</h4>
                <p className="text-sm text-muted-foreground">
                  Direct file upload with drag & drop support
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Storage Integration</h4>
                <p className="text-sm text-muted-foreground">
                  Supabase Storage integration with CDN delivery
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Image Processing</h4>
                <p className="text-sm text-muted-foreground">
                  Automatic resizing and optimization
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Signed URLs</h4>
                <p className="text-sm text-muted-foreground">
                  Secure, time-limited access to private media
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}