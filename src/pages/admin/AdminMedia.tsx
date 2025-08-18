import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { SEOHead } from '@/lib/seo';
import { adminCms } from '@/lib/admin-cms';
import { useAuth } from '@/lib/auth';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { 
  Plus, 
  Image, 
  ExternalLink, 
  Trash2, 
  Search, 
  Filter,
  RefreshCw,
  FileImage,
  AlertTriangle,
  CheckCircle2,
  Clock,
  FolderOpen,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface MediaFile {
  name: string;
  path: string;
  size: number;
  created_at: string;
  isReferenced: boolean;
  metadata?: any;
}

function AdminMedia() {
  const { isEditor } = useAuth();
  const { toast } = useToast();
  
  // Media files state
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  
  // Pagination and filters
  const [currentPage, setCurrentPage] = useState(0);
  const [filter, setFilter] = useState<'all' | 'referenced' | 'unreferenced'>('all');
  const [folderFilter, setFolderFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Deletion state
  const [deleteConfirm, setDeleteConfirm] = useState<{ file: MediaFile | null; open: boolean }>({ file: null, open: false });
  const [deleting, setDeleting] = useState(false);
  
  // Orphan scan state
  const [orphanScanData, setOrphanScanData] = useState<{
    timestamp: string;
    totalFiles: number;
    referencedFiles: number;
    orphanedCount: number;
    orphanedFiles: string[];
  } | null>(null);
  const [scanLoading, setScanLoading] = useState(false);

  useEffect(() => {
    fetchMediaFiles();
    fetchOrphanScanData();
  }, [currentPage, filter, folderFilter]);

  useEffect(() => {
    // Reset to page 0 when filters change
    setCurrentPage(0);
  }, [filter, folderFilter, searchQuery]);

  const fetchMediaFiles = async () => {
    try {
      setLoading(true);
      const { files, totalCount, hasMore } = await adminCms.getAllMediaFiles({
        page: currentPage,
        limit: 20,
        filter,
        folder: folderFilter || undefined
      });
      
      // Apply client-side search if needed
      let filteredFiles = files;
      if (searchQuery) {
        filteredFiles = files.filter(file => 
          file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          file.path.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      
      setMediaFiles(filteredFiles);
      setTotalCount(totalCount);
      setHasMore(hasMore);
    } catch (error) {
      console.error('Error fetching media files:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch media files',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchOrphanScanData = async () => {
    try {
      const data = await adminCms.getLatestOrphanScan();
      setOrphanScanData(data);
    } catch (error) {
      console.error('Error fetching orphan scan data:', error);
    }
  };

  const handleDeleteFile = async () => {
    if (!deleteConfirm.file) return;
    
    try {
      setDeleting(true);
      await adminCms.deleteMediaFile(deleteConfirm.file.path);
      
      toast({
        title: 'Success',
        description: 'File deleted successfully',
      });
      
      fetchMediaFiles();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete file',
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
      setDeleteConfirm({ file: null, open: false });
    }
  };

  const handleTriggerOrphanScan = async () => {
    try {
      setScanLoading(true);
      await adminCms.triggerOrphanScan();
      
      toast({
        title: 'Success',
        description: 'Orphan scan triggered. Results will be available shortly.',
      });
      
      // Refresh scan data after a short delay
      setTimeout(() => {
        fetchOrphanScanData();
      }, 3000);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to trigger orphan scan',
        variant: 'destructive',
      });
    } finally {
      setScanLoading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFileUrl = (path: string): string => {
    return `https://dvgubqqjvmsepkilnkak.supabase.co/storage/v1/object/public/media/${path}`;
  };

  const getFolderOptions = (): string[] => {
    const folders = new Set<string>();
    mediaFiles.forEach(file => {
      const parts = file.path.split('/');
      if (parts.length > 1) {
        folders.add(parts[0]);
        if (parts.length > 2) {
          folders.add(`${parts[0]}/${parts[1]}`);
        }
      }
    });
    return Array.from(folders).sort();
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
            <p className="text-muted-foreground">Browse and manage your storage files</p>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleTriggerOrphanScan}
              disabled={scanLoading}
            >
              {scanLoading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Search className="h-4 w-4 mr-2" />
              )}
              Scan Orphans
            </Button>
          </div>
        </div>

        {/* Orphan Scan Status */}
        {orphanScanData && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-warning" />
                Latest Orphan Scan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Scan Date</p>
                  <p className="font-medium">{formatDate(orphanScanData.timestamp)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Total Files</p>
                  <p className="font-medium">{orphanScanData.totalFiles}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Referenced</p>
                  <p className="font-medium text-success">{orphanScanData.referencedFiles}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Orphaned</p>
                  <p className="font-medium text-warning">{orphanScanData.orphanedCount}</p>
                </div>
              </div>
              {orphanScanData.orphanedFiles.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground mb-2">Recent orphaned files:</p>
                  <div className="bg-muted p-2 rounded text-xs space-y-1 max-h-20 overflow-y-auto">
                    {orphanScanData.orphanedFiles.slice(0, 10).map((file, index) => (
                      <div key={index} className="text-muted-foreground">{file}</div>
                    ))}
                    {orphanScanData.orphanedFiles.length > 10 && (
                      <div className="text-muted-foreground italic">
                        ... and {orphanScanData.orphanedFiles.length - 10} more
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="search" className="sr-only">Search files</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Search files..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={filter} onValueChange={(value: 'all' | 'referenced' | 'unreferenced') => setFilter(value)}>
                <SelectTrigger className="w-full sm:w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Files</SelectItem>
                  <SelectItem value="referenced">Referenced</SelectItem>
                  <SelectItem value="unreferenced">Unreferenced</SelectItem>
                </SelectContent>
              </Select>

              <Select value={folderFilter} onValueChange={setFolderFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <FolderOpen className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="All Folders" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Folders</SelectItem>
                  {getFolderOptions().map(folder => (
                    <SelectItem key={folder} value={folder}>{folder}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Media Files */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Media Files ({totalCount})</span>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                {currentPage > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                    disabled={loading}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                )}
                <span>Page {currentPage + 1}</span>
                {hasMore && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => p + 1)}
                    disabled={loading}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : mediaFiles.length === 0 ? (
              <div className="text-center py-12">
                <FileImage className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No media files found.</p>
                <p className="text-sm text-muted-foreground mt-2">
                  {filter === 'all' ? 'No files in storage yet.' : `No ${filter} files found.`}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {mediaFiles.map((file) => (
                  <div key={file.path} className="border rounded-lg p-4">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                        {file.name.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                          <img
                            src={getFileUrl(file.path)}
                            alt={file.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                              (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        <FileImage className="h-8 w-8 text-muted-foreground hidden" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-sm truncate">{file.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{file.path}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              <span>{formatFileSize(file.size)}</span>
                              <span>{formatDate(file.created_at)}</span>
                              <Badge 
                                variant={file.isReferenced ? "default" : "secondary"}
                                className="text-xs"
                              >
                                {file.isReferenced ? (
                                  <>
                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                    Referenced
                                  </>
                                ) : (
                                  <>
                                    <Clock className="h-3 w-3 mr-1" />
                                    Unreferenced
                                  </>
                                )}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 ml-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(getFileUrl(file.path), '_blank')}
                              title="View file"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeleteConfirm({ file, open: true })}
                              disabled={file.isReferenced}
                              title={file.isReferenced ? "Cannot delete referenced file" : "Delete file"}
                              className={file.isReferenced ? "text-muted-foreground" : "text-destructive hover:text-destructive"}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          open={deleteConfirm.open}
          onOpenChange={(open) => setDeleteConfirm({ file: deleteConfirm.file, open })}
          title="Delete Media File"
          description={`Are you sure you want to delete "${deleteConfirm.file?.name}"? This action cannot be undone.`}
          confirmLabel="Delete"
          variant="destructive"
          onConfirm={handleDeleteFile}
          loading={deleting}
        />
      </div>
    </>
  );
}

export default AdminMedia;