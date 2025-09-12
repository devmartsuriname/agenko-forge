/**
 * Network Debug Panel Component
 * Provides a comprehensive interface for monitoring network requests
 */

import React, { useState, useEffect } from 'react';
import { networkDebugger, NetworkRequest, NetworkStats } from '@/lib/network-debug';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Trash2, RefreshCw, Globe, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export const NetworkDebugPanel: React.FC = () => {
  const [requests, setRequests] = useState<NetworkRequest[]>([]);
  const [stats, setStats] = useState<NetworkStats | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<NetworkRequest | null>(null);
  const [filterMethod, setFilterMethod] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchUrl, setSearchUrl] = useState<string>('');
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);

  const refreshData = () => {
    const allRequests = networkDebugger.getRequests();
    const filteredRequests = networkDebugger.getFilteredRequests({
      method: filterMethod !== 'all' ? filterMethod : undefined,
      status: filterStatus !== 'all' ? parseInt(filterStatus) : undefined,
      url: searchUrl || undefined
    });
    
    setRequests(filteredRequests);
    setStats(networkDebugger.getStats());
  };

  useEffect(() => {
    refreshData();
    
    if (autoRefresh) {
      const interval = setInterval(refreshData, 1000);
      return () => clearInterval(interval);
    }
  }, [filterMethod, filterStatus, searchUrl, autoRefresh]);

  const handleClearRequests = () => {
    networkDebugger.clearRequests();
    setSelectedRequest(null);
    refreshData();
  };

  const handleExportRequests = () => {
    const data = networkDebugger.exportRequests();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `network-debug-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getStatusBadgeVariant = (status?: number) => {
    if (!status) return 'destructive';
    if (status >= 200 && status < 300) return 'default';
    if (status >= 300 && status < 400) return 'secondary';
    return 'destructive';
  };

  const getMethodBadgeVariant = (method: string) => {
    switch (method.toUpperCase()) {
      case 'GET': return 'outline';
      case 'POST': return 'default';
      case 'PUT': return 'secondary';
      case 'DELETE': return 'destructive';
      default: return 'outline';
    }
  };

  const formatDuration = (duration?: number) => {
    if (!duration) return 'N/A';
    return `${duration.toFixed(0)}ms`;
  };

  const formatSize = (size?: number) => {
    if (!size) return 'N/A';
    if (size < 1024) return `${size}B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)}KB`;
    return `${(size / (1024 * 1024)).toFixed(1)}MB`;
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Network Debug Panel</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <RefreshCw className={`h-4 w-4 ${autoRefresh ? 'animate-spin' : ''}`} />
            {autoRefresh ? 'Auto' : 'Manual'}
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportRequests}>
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" size="sm" onClick={handleClearRequests}>
            <Trash2 className="h-4 w-4" />
            Clear
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Requests</p>
                  <p className="text-2xl font-bold">{stats.totalRequests}</p>
                </div>
                <Globe className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Success Rate</p>
                  <p className="text-2xl font-bold text-green-600">
                    {((1 - stats.errorRate) * 100).toFixed(1)}%
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Response</p>
                  <p className="text-2xl font-bold">{formatDuration(stats.averageResponseTime)}</p>
                </div>
                <Clock className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Failed</p>
                  <p className="text-2xl font-bold text-red-600">{stats.failedRequests}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Method</label>
              <Select value={filterMethod} onValueChange={setFilterMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Methods</SelectItem>
                  <SelectItem value="GET">GET</SelectItem>
                  <SelectItem value="POST">POST</SelectItem>
                  <SelectItem value="PUT">PUT</SelectItem>
                  <SelectItem value="DELETE">DELETE</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium">Status</label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="200">200 OK</SelectItem>
                  <SelectItem value="400">400 Bad Request</SelectItem>
                  <SelectItem value="401">401 Unauthorized</SelectItem>
                  <SelectItem value="404">404 Not Found</SelectItem>
                  <SelectItem value="500">500 Server Error</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium">URL Filter</label>
              <Input
                placeholder="Search URLs..."
                value={searchUrl}
                onChange={(e) => setSearchUrl(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Request List */}
        <Card>
          <CardHeader>
            <CardTitle>Requests ({requests.length})</CardTitle>
            <CardDescription>Click on a request to view details</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-96">
              <div className="p-4 space-y-2">
                {requests.map((request) => (
                  <div
                    key={request.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedRequest?.id === request.id 
                        ? 'bg-muted border-primary' 
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setSelectedRequest(request)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant={getMethodBadgeVariant(request.method)}>
                          {request.method}
                        </Badge>
                        {request.status && (
                          <Badge variant={getStatusBadgeVariant(request.status)}>
                            {request.status}
                          </Badge>
                        )}
                        {request.error && (
                          <Badge variant="destructive">ERROR</Badge>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatDuration(request.duration)}
                      </span>
                    </div>
                    <p className="text-sm font-mono truncate">{request.url}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(request.timestamp)} ago
                    </p>
                  </div>
                ))}
                {requests.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No requests found
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Request Details */}
        <Card>
          <CardHeader>
            <CardTitle>Request Details</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedRequest ? (
              <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="general">General</TabsTrigger>
                  <TabsTrigger value="headers">Headers</TabsTrigger>
                  <TabsTrigger value="request">Request</TabsTrigger>
                  <TabsTrigger value="response">Response</TabsTrigger>
                </TabsList>
                
                <TabsContent value="general" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Method</label>
                      <p className="text-sm">{selectedRequest.method}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Status</label>
                      <p className="text-sm">{selectedRequest.status || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Duration</label>
                      <p className="text-sm">{formatDuration(selectedRequest.duration)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Size</label>
                      <p className="text-sm">{formatSize(selectedRequest.size)}</p>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">URL</label>
                    <p className="text-sm font-mono break-all">{selectedRequest.url}</p>
                  </div>
                  {selectedRequest.error && (
                    <div>
                      <label className="text-sm font-medium text-red-600">Error</label>
                      <p className="text-sm text-red-600">{selectedRequest.error}</p>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="headers">
                  <ScrollArea className="h-64">
                    <pre className="text-xs font-mono">
                      {JSON.stringify(selectedRequest.headers || {}, null, 2)}
                    </pre>
                  </ScrollArea>
                </TabsContent>
                
                <TabsContent value="request">
                  <ScrollArea className="h-64">
                    <pre className="text-xs font-mono">
                      {JSON.stringify(selectedRequest.requestBody || {}, null, 2)}
                    </pre>
                  </ScrollArea>
                </TabsContent>
                
                <TabsContent value="response">
                  <ScrollArea className="h-64">
                    <pre className="text-xs font-mono">
                      {JSON.stringify(selectedRequest.responseBody || {}, null, 2)}
                    </pre>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Select a request to view details
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NetworkDebugPanel;