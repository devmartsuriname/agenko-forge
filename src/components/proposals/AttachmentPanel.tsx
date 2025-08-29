import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Upload, 
  File, 
  Trash2, 
  Download,
  AlertCircle,
  CheckCircle2,
  Loader2
} from 'lucide-react';

interface Attachment {
  id: string;
  filename: string;
  size_bytes: number;
  mime_type: string;
  storage_key: string;
  created_at: string;
}

interface AttachmentPanelProps {
  proposalId: string | null;
  attachments: Attachment[];
  onAttachmentsChange: (attachments: Attachment[]) => void;
  maxSizeMB?: number;
  disabled?: boolean;
}

export function AttachmentPanel({ 
  proposalId, 
  attachments, 
  onAttachmentsChange, 
  maxSizeMB = 10,
  disabled = false 
}: AttachmentPanelProps) {
  const { toast } = useToast();
  const [uploading, setUploading] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateFile = (file: File): string | null => {
    const maxBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxBytes) {
      return `File size exceeds ${maxSizeMB}MB limit`;
    }
    
    // For images, enforce specific MIME types
    const allowedImageTypes = ['image/webp', 'image/jpeg', 'image/png'];
    if (file.type.startsWith('image/') && !allowedImageTypes.includes(file.type)) {
      return `Image type not supported. Please use WEBP, JPEG, or PNG format.`;
    }
    
    return null;
  };

  const uploadFile = async (file: File) => {
    if (!proposalId) {
      toast({
        title: 'Error',
        description: 'Please save the proposal before adding attachments',
        variant: 'destructive',
      });
      return;
    }

    const error = validateFile(file);
    if (error) {
      toast({
        title: 'Upload Error',
        description: error,
        variant: 'destructive',
      });
      return;
    }

    setUploading(file.name);
    setUploadProgress(0);

    try {
      // Generate unique storage key
      const timestamp = Date.now();
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const storageKey = `proposals/${proposalId}/attachments/${timestamp}-${sanitizedName}`;

      // Upload to storage (using direct Supabase client)
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('media')
        .upload(storageKey, file);

      if (uploadError) throw uploadError;

      // Create database record
      const { data: attachment, error: dbError } = await supabase
        .from('proposal_attachments')
        .insert({
          proposal_id: proposalId,
          filename: file.name,
          size_bytes: file.size,
          mime_type: file.type || 'application/octet-stream',
          storage_key: storageKey
        })
        .select()
        .single();

      if (dbError) throw dbError;

      // Update attachments list
      onAttachmentsChange([...attachments, attachment]);

      // Log the upload event
      try {
        await supabase.rpc('log_app_event', {
          p_level: 'info',
          p_area: 'proposals-attachments',
          p_message: `Attachment uploaded to proposal ${proposalId}`,
          p_meta: {
            proposal_id: proposalId,
            filename: file.name.substring(0, 20) + (file.name.length > 20 ? '...' : ''), // Masked filename
            file_size: file.size,
            mime_type: file.type
          }
        });
      } catch (logError) {
        console.warn('Failed to log attachment upload:', logError);
      }

      toast({
        title: 'Success',
        description: `${file.name.substring(0, 20) + (file.name.length > 20 ? '...' : '')} uploaded successfully`,
      });
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload Failed',
        description: error.message || 'Failed to upload file',
        variant: 'destructive',
      });
    } finally {
      setUploading(null);
      setUploadProgress(0);
    }
  };

  const deleteAttachment = async (attachment: Attachment) => {
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('media')
        .remove([attachment.storage_key]);

      if (storageError) console.error('Storage delete error:', storageError);

      // Delete from database
      const { error: dbError } = await supabase
        .from('proposal_attachments')
        .delete()
        .eq('id', attachment.id);

      if (dbError) throw dbError;

      // Update attachments list
      onAttachmentsChange(attachments.filter(a => a.id !== attachment.id));

      // Log the deletion event
      try {
        await supabase.rpc('log_app_event', {
          p_level: 'info',
          p_area: 'proposals-attachments',
          p_message: `Attachment deleted from proposal`,
          p_meta: {
            proposal_id: proposalId,
            filename: attachment.filename.substring(0, 20) + (attachment.filename.length > 20 ? '...' : ''), // Masked filename
            attachment_id: attachment.id
          }
        });
      } catch (logError) {
        console.warn('Failed to log attachment deletion:', logError);
      }

      toast({
        title: 'Success',
        description: `${attachment.filename.substring(0, 20) + (attachment.filename.length > 20 ? '...' : '')} removed successfully`,
      });
    } catch (error: any) {
      console.error('Delete error:', error);
      toast({
        title: 'Delete Failed',
        description: error.message || 'Failed to remove attachment',
        variant: 'destructive',
      });
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    files.forEach(uploadFile);
  }, [disabled, proposalId, maxSizeMB]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setDragOver(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(uploadFile);
    e.target.value = ''; // Reset input
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Attachments</CardTitle>
        <CardDescription>
          Add files to include with this proposal (max {maxSizeMB}MB each)
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Drop Zone */}
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragOver 
              ? 'border-primary bg-primary/5' 
              : disabled 
                ? 'border-muted-foreground/25 bg-muted/25' 
                : 'border-muted-foreground/25 hover:border-muted-foreground/50'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <input
            type="file"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            id="attachment-upload"
            disabled={disabled}
          />
          
          {uploading ? (
            <div className="space-y-3">
              <Loader2 className="h-8 w-8 mx-auto animate-spin text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Uploading {uploading}...</p>
                <Progress value={uploadProgress} className="w-full mt-2" />
              </div>
            </div>
          ) : (
            <>
              <Upload className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">
                  {disabled ? 'Save proposal to add attachments' : 'Drop files here or click to browse'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Supports all file types, max {maxSizeMB}MB each
                </p>
              </div>
              
              {!disabled && (
                <label htmlFor="attachment-upload">
                  <Button variant="outline" size="sm" className="mt-3" asChild>
                    <span>Choose Files</span>
                  </Button>
                </label>
              )}
            </>
          )}
        </div>

        {/* Attachments List */}
        {attachments.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <File className="h-4 w-4" />
              Attached Files ({attachments.length})
            </h4>
            
            <div className="space-y-2">
              {attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="flex items-center gap-3 p-3 border rounded-lg bg-muted/25"
                >
                  <File className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {attachment.filename}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{formatFileSize(attachment.size_bytes)}</span>
                      <Badge variant="outline" className="text-xs">
                        {attachment.mime_type.split('/')[1]?.toUpperCase() || 'FILE'}
                      </Badge>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteAttachment(attachment)}
                    disabled={disabled}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info */}
        <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
          <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">About attachments:</p>
            <ul className="list-disc list-inside space-y-1 mt-1">
              <li>Recipients will receive secure download links in the email</li>
              <li>Links expire based on your proposal token settings</li>
              <li>Files are stored securely and encrypted</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}