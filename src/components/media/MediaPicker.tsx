import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { adminCms } from '@/lib/admin-cms';
import { supabase } from '@/integrations/supabase/client';
import { 
  Image as ImageIcon, 
  Upload, 
  Search, 
  CheckCircle2, 
  Loader2,
  FileImage,
  ExternalLink
} from 'lucide-react';

interface MediaFile {
  name: string;
  path: string;
  size: number;
  created_at: string;
  isReferenced: boolean;
  metadata?: any;
}

interface MediaPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (media: { url: string; alt: string; width?: number; height?: number }) => void;
  uploadPath?: string; // Optional path like "proposals/templates/"
}

export function MediaPicker({ open, onOpenChange, onSelect, uploadPath = "proposals/" }: MediaPickerProps) {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);
  const [altText, setAltText] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  useEffect(() => {
    if (open) {
      fetchMediaFiles();
    }
  }, [open]);

  const fetchMediaFiles = async () => {
    try {
      setLoading(true);
      const { files } = await adminCms.getAllMediaFiles({
        page: 0,
        limit: 50,
        filter: 'all'
      });
      
      // Filter for images only
      const imageFiles = files.filter(file => 
        file.name.match(/\.(jpg|jpeg|png|gif|webp)$/i)
      );
      
      setMediaFiles(imageFiles);
    } catch (error) {
      console.error('Error fetching media files:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFileUrl = (path: string): string => {
    return `https://dvgubqqjvmsepkilnkak.supabase.co/storage/v1/object/public/media/${path}`;
  };

  const filteredFiles = mediaFiles.filter(file =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    file.path.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectFile = (file: MediaFile) => {
    setSelectedFile(file);
    setAltText(file.name.replace(/\.(jpg|jpeg|png|gif|webp)$/i, ''));
  };

  const handleConfirmSelection = () => {
    if (selectedFile) {
      onSelect({
        url: getFileUrl(selectedFile.path),
        alt: altText || selectedFile.name,
        width: 800, // Default width
        height: 600 // Default height
      });
      onOpenChange(false);
      setSelectedFile(null);
      setAltText('');
    }
  };

  const validateFile = (file: File): string | null => {
    const maxBytes = 10 * 1024 * 1024; // 10MB limit
    if (file.size > maxBytes) {
      return `File size exceeds 10MB limit`;
    }
    
    // Only allow specific image types
    const allowedTypes = ['image/webp', 'image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      return `Image type not supported. Please use WEBP, JPEG, or PNG format.`;
    }
    
    return null;
  };

  const handleUpload = async () => {
    if (!uploadFile) return;

    const error = validateFile(uploadFile);
    if (error) {
      console.error('Validation error:', error);
      return;
    }

    setUploading(true);
    try {
      // Generate unique storage key for inline images
      const timestamp = Date.now();
      const sanitizedName = uploadFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const storageKey = `${uploadPath}inline/${timestamp}-${sanitizedName}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('media')
        .upload(storageKey, uploadFile);

      if (uploadError) throw uploadError;

      // Refresh the media files list
      await fetchMediaFiles();
      
      setUploadFile(null);
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Insert Image</DialogTitle>
          <DialogDescription>
            Choose an existing image or upload a new one
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="existing" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="existing">Choose Existing</TabsTrigger>
            <TabsTrigger value="upload">Upload New</TabsTrigger>
          </TabsList>

          <TabsContent value="existing" className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search images..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <ScrollArea className="h-64 border rounded-md p-4">
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {filteredFiles.map((file) => (
                    <div
                      key={file.path}
                      className={`relative group cursor-pointer border-2 rounded-lg p-2 ${
                        selectedFile?.path === file.path 
                          ? 'border-primary bg-primary/5' 
                          : 'border-transparent hover:border-muted-foreground/50'
                      }`}
                      onClick={() => handleSelectFile(file)}
                    >
                      <div className="aspect-square bg-muted rounded-md flex items-center justify-center overflow-hidden">
                        <img
                          src={getFileUrl(file.path)}
                          alt={file.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                      <p className="text-xs text-center mt-1 truncate" title={file.name}>
                        {file.name}
                      </p>
                      {selectedFile?.path === file.path && (
                        <div className="absolute top-1 right-1">
                          <CheckCircle2 className="h-4 w-4 text-primary bg-background rounded-full" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>

            {selectedFile && (
              <>
                <Separator />
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="alt-text">Alt Text</Label>
                    <Input
                      id="alt-text"
                      placeholder="Describe the image for accessibility"
                      value={altText}
                      onChange={(e) => setAltText(e.target.value)}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleConfirmSelection}>
                      Insert Image
                    </Button>
                  </div>
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="upload" className="space-y-4">
            <div 
              className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center"
              onDrop={(e) => {
                e.preventDefault();
                const files = Array.from(e.dataTransfer.files);
                if (files.length > 0 && files[0].type.startsWith('image/')) {
                  setUploadFile(files[0]);
                }
              }}
              onDragOver={(e) => e.preventDefault()}
            >
              <input
                type="file"
                accept="image/webp,image/jpeg,image/png"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setUploadFile(file);
                }}
                className="hidden"
                id="image-upload"
              />
              
              {uploading ? (
                <div className="space-y-4">
                  <Loader2 className="h-8 w-8 mx-auto animate-spin" />
                  <p>Uploading image...</p>
                </div>
              ) : uploadFile ? (
                <div className="space-y-4">
                  <FileImage className="h-12 w-12 text-primary mx-auto" />
                  <div>
                    <p className="font-medium">{uploadFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(uploadFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <div className="flex gap-2 justify-center">
                    <Button variant="outline" onClick={() => setUploadFile(null)}>
                      Cancel
                    </Button>
                    <Button onClick={handleUpload}>
                      Upload
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium">Upload New Image</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Drag & drop or click to select (WEBP, JPEG, PNG only, max 10MB)
                  </p>
                  <label htmlFor="image-upload">
                    <Button variant="outline" asChild>
                      <span>Choose Image</span>
                    </Button>
                  </label>
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}