import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { EmptyState } from '@/components/admin/EmptyState';
import { LoadingListSkeleton } from '@/components/admin/LoadingSkeleton';
import { adminToast } from '@/lib/toast-utils';
import { ProjectImage } from '@/types/content';
import { adminCms } from '@/lib/admin-cms';
import { 
  Image, 
  Plus, 
  Trash2, 
  ChevronUp, 
  ChevronDown, 
  GripVertical,
  ImageIcon
} from 'lucide-react';

interface GalleryManagerProps {
  projectId: string;
  images: ProjectImage[];
  onImagesChange: (images: ProjectImage[]) => void;
  loading?: boolean;
  disabled?: boolean;
}

export function GalleryManager({ 
  projectId, 
  images, 
  onImagesChange, 
  loading = false,
  disabled = false 
}: GalleryManagerProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newImage, setNewImage] = useState({ url: '', alt: '' });
  const [deleteConfirm, setDeleteConfirm] = useState<ProjectImage | null>(null);
  const [processing, setProcessing] = useState(false);
  const announceRef = useRef<HTMLDivElement>(null);

  const announceChange = (message: string) => {
    if (announceRef.current) {
      announceRef.current.textContent = message;
    }
  };

  const handleAddImage = async () => {
    if (!newImage.url.trim()) {
      adminToast.validationError('Image URL is required');
      return;
    }

    setProcessing(true);
    try {
      const sortOrder = images.length;
      await adminCms.addProjectImage(projectId, newImage.url, newImage.alt, sortOrder);
      
      // Refresh images
      const updatedImages = await adminCms.getProjectImages(projectId);
      onImagesChange(updatedImages);
      
      setNewImage({ url: '', alt: '' });
      setShowAddDialog(false);
      adminToast.success('Image Added', 'Successfully added image to gallery');
      announceChange(`Added new image. Gallery now has ${updatedImages.length} images.`);
    } catch (error) {
      console.error('Error adding image:', error);
      adminToast.error('Failed to Add', 'Unable to add image to gallery');
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteImage = async (image: ProjectImage) => {
    setProcessing(true);
    try {
      await adminCms.deleteProjectImage(image.id);
      
      // Refresh images
      const updatedImages = await adminCms.getProjectImages(projectId);
      onImagesChange(updatedImages);
      
      adminToast.success('Image Removed', 'Successfully removed image from gallery');
      announceChange(`Removed image. Gallery now has ${updatedImages.length} images.`);
    } catch (error) {
      console.error('Error deleting image:', error);
      adminToast.error('Failed to Remove', 'Unable to remove image from gallery');
    } finally {
      setProcessing(false);
      setDeleteConfirm(null);
    }
  };

  const moveImage = async (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === images.length - 1)
    ) {
      return;
    }

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const newImages = [...images];
    [newImages[index], newImages[newIndex]] = [newImages[newIndex], newImages[index]];

    setProcessing(true);
    try {
      // Update sort orders in database
      await Promise.all(
        newImages.map((img, idx) =>
          adminCms.updateProjectImageOrder(img.id, idx)
        )
      );

      onImagesChange(newImages);
      announceChange(`Moved image ${direction}. New position: ${newIndex + 1} of ${newImages.length}`);
      adminToast.success('Order Updated', 'Image order has been saved');
    } catch (error) {
      console.error('Error reordering images:', error);
      adminToast.error('Failed to Reorder', 'Unable to save new image order');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Project Gallery</CardTitle>
          <CardDescription>Loading gallery images...</CardDescription>
        </CardHeader>
        <CardContent>
          <LoadingListSkeleton />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Project Gallery</CardTitle>
            <CardDescription>
              Manage images for this project ({images.length} images)
            </CardDescription>
          </div>
          
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button disabled={disabled}>
                <Plus className="h-4 w-4 mr-2" />
                Add Image
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Gallery Image</DialogTitle>
                <DialogDescription>
                  Add a new image to the project gallery
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="image-url">Image URL*</Label>
                  <Input
                    id="image-url"
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    value={newImage.url}
                    onChange={(e) => setNewImage(prev => ({ ...prev, url: e.target.value }))}
                    disabled={processing}
                    aria-describedby="url-help"
                  />
                  <p id="url-help" className="text-sm text-muted-foreground mt-1">
                    Enter a valid image URL (jpg, png, webp, etc.)
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="image-alt">Alt Text</Label>
                  <Input
                    id="image-alt"
                    placeholder="Describe the image for accessibility"
                    value={newImage.alt}
                    onChange={(e) => setNewImage(prev => ({ ...prev, alt: e.target.value }))}
                    disabled={processing}
                    aria-describedby="alt-help"
                  />
                  <p id="alt-help" className="text-sm text-muted-foreground mt-1">
                    Optional but recommended for accessibility
                  </p>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowAddDialog(false)}
                  disabled={processing}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddImage}
                  disabled={processing || !newImage.url.trim()}
                >
                  {processing ? 'Adding...' : 'Add Image'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent>
        {images.length === 0 ? (
          <EmptyState
            icon={ImageIcon}
            title="No images yet"
            description="Add your first image to showcase this project's visual elements and demonstrate your work quality."
            actionLabel="Add First Image"
            actionTo="#"
            className="border-0"
          />
        ) : (
          <div className="space-y-3">
            {images.map((image, index) => (
              <div
                key={image.id}
                className="flex items-center gap-3 p-3 border rounded-lg bg-card"
              >
                <GripVertical className="h-4 w-4 text-muted-foreground" />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline">
                      {index + 1}
                    </Badge>
                    <span className="text-sm font-medium truncate">
                      {image.alt || 'Untitled Image'}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {image.url}
                  </p>
                </div>
                
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => moveImage(index, 'up')}
                    disabled={index === 0 || processing || disabled}
                    aria-label={`Move image up. Current position: ${index + 1} of ${images.length}`}
                  >
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => moveImage(index, 'down')}
                    disabled={index === images.length - 1 || processing || disabled}
                    aria-label={`Move image down. Current position: ${index + 1} of ${images.length}`}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setDeleteConfirm(image)}
                    disabled={processing || disabled}
                    aria-label={`Delete image: ${image.alt || 'Untitled'}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <ConfirmDialog
        open={!!deleteConfirm}
        onOpenChange={() => setDeleteConfirm(null)}
        title="Remove Image"
        description={
          <>
            Are you sure you want to remove this image from the gallery?
            <br /><br />
            <strong>"{deleteConfirm?.alt || 'Untitled Image'}"</strong>
            <br /><br />
            This action cannot be undone.
          </>
        }
        confirmLabel="Remove Image"
        variant="destructive"
        onConfirm={() => deleteConfirm && handleDeleteImage(deleteConfirm)}
        loading={processing}
      />

      {/* Screen reader announcements */}
      <div
        ref={announceRef}
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
      />
    </Card>
  );
}