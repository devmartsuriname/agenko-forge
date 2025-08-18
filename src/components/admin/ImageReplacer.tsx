import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { adminToast } from '@/lib/toast-utils';
import { Upload, Image as ImageIcon, X, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageData {
  src: string;
  srcset?: string;
  sizes?: string;
  alt?: string;
  width?: number;
  height?: number;
}

interface ImageReplacerProps {
  sectionType: string;
  sectionId: string;
  currentImage?: ImageData | string;
  onImageUpdate: (imageData: ImageData) => void;
  className?: string;
}

export function ImageReplacer({
  sectionType,
  sectionId,
  currentImage,
  onImageUpdate,
  className
}: ImageReplacerProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentImageSrc = typeof currentImage === 'string' ? currentImage : currentImage?.src;

  const validateFile = (file: File): string | null => {
    const maxSize = 1.5 * 1024 * 1024; // 1.5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    
    if (file.size > maxSize) {
      return 'File size must be less than 1.5MB';
    }
    
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      return 'Only JPEG, PNG, and WebP files are allowed';
    }
    
    return null;
  };

  const uploadImage = async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      adminToast.error('Invalid file', validationError);
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Create preview
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('sectionType', sectionType);
      formData.append('sectionId', sectionId);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Authentication required');
      }

      const response = await supabase.functions.invoke('upload-section-image', {
        body: formData,
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (response.error) {
        throw new Error(response.error.message || 'Upload failed');
      }

      const { image } = response.data;
      onImageUpdate(image);
      
      // Clean up preview
      URL.revokeObjectURL(preview);
      setPreviewUrl(null);
      
      adminToast.success('Image uploaded successfully');
      
      // Announce success for screen readers
      announceToScreenReader('Image upload completed successfully');

    } catch (error) {
      console.error('Upload error:', error);
      adminToast.error('Upload failed', error.message);
      
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
      
      // Announce error for screen readers
      announceToScreenReader('Image upload failed. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const announceToScreenReader = (message: string) => {
    const liveRegion = document.getElementById('image-replacer-live-region');
    if (liveRegion) {
      liveRegion.textContent = message;
      setTimeout(() => {
        liveRegion.textContent = '';
      }, 1000);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    // Only set dragging to false if we're leaving the component entirely
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    
    if (imageFile) {
      uploadImage(imageFile);
    } else {
      adminToast.error('No valid image file found');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadImage(file);
    }
  };

  const clearPreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="space-y-2">
        <Label className="text-sm font-medium">
          Section Image
          <span className="text-xs text-muted-foreground ml-2">
            (Max 1.5MB • JPG, PNG, WebP • Auto-crops to 16:9)
          </span>
        </Label>
        
        {/* Current/Preview Image */}
        {(currentImageSrc || previewUrl) && (
          <div className="relative">
            <img
              src={previewUrl || currentImageSrc}
              alt={typeof currentImage === 'object' ? currentImage?.alt : 'Section image'}
              className="w-full max-w-sm h-auto rounded-lg border bg-muted"
              style={{ aspectRatio: '16/9', objectFit: 'cover' }}
            />
            {previewUrl && (
              <Button
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={clearPreview}
                disabled={isUploading}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
        
        {/* Upload Area */}
        <Card
          className={cn(
            "border-2 border-dashed transition-colors cursor-pointer",
            isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25",
            isUploading && "pointer-events-none opacity-50"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !isUploading && fileInputRef.current?.click()}
        >
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            {isUploading ? (
              <div className="space-y-4 w-full max-w-xs">
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Processing image...</p>
                  <Progress value={uploadProgress} className="w-full" />
                  <p className="text-xs text-muted-foreground">{uploadProgress}%</p>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-4">
                  {isDragging ? (
                    <Upload className="h-6 w-6 text-primary" />
                  ) : (
                    <ImageIcon className="h-6 w-6 text-primary" />
                  )}
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">
                    {isDragging ? 'Drop image here' : 'Replace section image'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Drag & drop or click to select
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
        
        {/* File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleFileSelect}
          className="hidden"
          disabled={isUploading}
          aria-label="Select image file for section"
        />
        
        {/* Warning about 16:9 ratio */}
        <div className="flex items-start space-x-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-amber-800">
            <p className="font-medium">Automatic 16:9 Processing</p>
            <p>Images will be automatically cropped or letterboxed to maintain 16:9 aspect ratio for optimal display.</p>
          </div>
        </div>
      </div>
      
      {/* Screen Reader Live Region */}
      <div
        id="image-replacer-live-region"
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      />
    </div>
  );
}