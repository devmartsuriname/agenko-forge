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

  const handleUpload = async () => {
    if (!uploadFile) return;

    setUploading(true);
    try {
      // Simple file upload without progress - would need to be implemented in adminCms
      console.log('Upload functionality needs to be implemented in adminCms');
      
      // For now, just show that it would work
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
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
              <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium">Upload Feature</p>
              <p className="text-sm text-muted-foreground">
                Upload functionality will be available in a future update
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}