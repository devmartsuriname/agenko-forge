import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Search, Filter, Eye, CheckCircle, XCircle, Clock, CreditCard, Building2, Download, MoreHorizontal, Activity } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Order, Payment } from '@/types/payment';
import { toast } from 'sonner';
import { exportToCSV } from '@/lib/csv-export';
import { EventLogDrawer } from '@/components/admin/EventLogDrawer';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface OrderWithPayments extends Order {
  payments: Payment[];
}

export default function AdminPayments() {
  const [orders, setOrders] = useState<OrderWithPayments[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [providerFilter, setProviderFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<OrderWithPayments | null>(null);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [eventLogOpen, setEventLogOpen] = useState(false);
  const [eventLogEntityId, setEventLogEntityId] = useState<string>('');
  const [eventLogEntityLabel, setEventLogEntityLabel] = useState<string>('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          payments (*)
        `)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      setOrders((ordersData || []) as OrderWithPayments[]);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string, notes?: string) => {
    setVerifying(true);
    try {
      // Update order status
      const { error: orderError } = await supabase
        .from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', orderId);

      if (orderError) throw orderError;

      // Create payment record for verification
      if (status === 'paid' || status === 'failed') {
        const order = orders.find(o => o.id === orderId);
        if (order) {
          const { error: paymentError } = await supabase
            .from('payments')
            .insert({
              order_id: orderId,
              provider: order.provider,
              amount: order.amount,
              currency: order.currency,
              status: status,
              admin_notes: notes,
              provider_data: { manual_verification: true }
            });

          if (paymentError) throw paymentError;
        }
      }

      toast.success(`Order ${status} successfully`);
      fetchOrders();
      setSelectedOrder(null);
      setVerificationNotes('');
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('Failed to update order status');
    } finally {
      setVerifying(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.provider_order_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesProvider = providerFilter === 'all' || order.provider === providerFilter;

    return matchesSearch && matchesStatus && matchesProvider;
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; icon: any }> = {
      pending: { variant: 'secondary', icon: Clock },
      paid: { variant: 'default', icon: CheckCircle },
      failed: { variant: 'destructive', icon: XCircle },
      canceled: { variant: 'outline', icon: XCircle },
      awaiting_verification: { variant: 'secondary', icon: Clock }
    };

    const config = variants[status] || variants.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  const getProviderIcon = (provider: string) => {
    return provider === 'stripe' ? CreditCard : Building2;
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const handleExportCSV = () => {
    try {
      const exportData = filteredOrders.map(order => ({
        id: order.id,
        provider: order.provider,
        amount_cents: order.amount,
        currency: order.currency,
        status: order.status,
        created_at: new Date(order.created_at).toISOString(),
        order_id: order.provider_order_id || ''
      }));

      const headers = ['id', 'provider', 'amount_cents', 'currency', 'status', 'created_at', 'order_id'];
      const filename = exportToCSV(exportData, 'payments.csv', { customHeaders: headers });
      toast.success(`Exported ${exportData.length} payments to ${filename}`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export payments');
    }
  };

  const handleViewEvents = (order: OrderWithPayments) => {
    setEventLogEntityId(order.id);
    setEventLogEntityLabel(`Order ${order.id.slice(0, 8)}... (${order.email})`);
    setEventLogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading payments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Payment Management</h1>
        <p className="text-muted-foreground">
          Manage and verify customer payments
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by email, order ID, or reference..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="awaiting_verification">Awaiting Verification</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="canceled">Canceled</SelectItem>
              </SelectContent>
            </Select>

            <Select value={providerFilter} onValueChange={setProviderFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Providers</SelectItem>
                <SelectItem value="stripe">Stripe</SelectItem>
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Orders ({filteredOrders.length})</CardTitle>
              <CardDescription>
                Recent payment orders and their verification status
              </CardDescription>
            </div>
            <Button 
              onClick={handleExportCSV}
              variant="outline"
              size="sm"
              disabled={filteredOrders.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => {
                  const ProviderIcon = getProviderIcon(order.provider);
                  
                  return (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-xs">
                        {order.id.slice(0, 8)}...
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{order.email}</div>
                          {order.provider_order_id && (
                            <div className="text-xs text-muted-foreground font-mono">
                              {order.provider_order_id}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {formatAmount(order.amount, order.currency)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <ProviderIcon className="h-4 w-4" />
                          {order.provider.replace('_', ' ')}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(order.status)}
                      </TableCell>
                      <TableCell className="text-xs">
                        {formatDate(order.created_at)}
                      </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setSelectedOrder(order)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-3xl">
                                <DialogHeader>
                                  <DialogTitle>Order Details</DialogTitle>
                                  <DialogDescription>
                                    Order ID: {order.id}
                                  </DialogDescription>
                                </DialogHeader>
                                
                                {selectedOrder && selectedOrder.id === order.id && (
                                  <OrderDetailsDialog 
                                    order={selectedOrder}
                                    onUpdateStatus={updateOrderStatus}
                                    verificationNotes={verificationNotes}
                                    setVerificationNotes={setVerificationNotes}
                                    verifying={verifying}
                                  />
                                )}
                              </DialogContent>
                            </Dialog>

                            {/* Event Log button - visible on md+ screens */}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewEvents(order)}
                              className="hidden md:flex"
                              title="View Events"
                            >
                              <Activity className="h-4 w-4" />
                            </Button>

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-background border shadow-md">
                                <DropdownMenuItem 
                                  onClick={() => handleViewEvents(order)}
                                  className="cursor-pointer"
                                >
                                  <Activity className="h-4 w-4 mr-2" />
                                  View Events
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <EventLogDrawer 
        open={eventLogOpen}
        onOpenChange={setEventLogOpen}
        entityType="payments"
        entityId={eventLogEntityId}
        entityLabel={eventLogEntityLabel}
      />
    </div>
  );
}

interface OrderDetailsDialogProps {
  order: OrderWithPayments;
  onUpdateStatus: (orderId: string, status: string, notes?: string) => Promise<void>;
  verificationNotes: string;
  setVerificationNotes: (notes: string) => void;
  verifying: boolean;
}

function OrderDetailsDialog({ 
  order, 
  onUpdateStatus, 
  verificationNotes, 
  setVerificationNotes, 
  verifying 
}: OrderDetailsDialogProps) {
  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const canVerify = order.status === 'awaiting_verification';

  return (
    <div className="space-y-6">
      {/* Order Information */}
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label className="text-sm font-medium">Customer Email</Label>
          <p className="text-sm">{order.email}</p>
        </div>
        <div>
          <Label className="text-sm font-medium">Amount</Label>
          <p className="text-sm">{formatAmount(order.amount, order.currency)}</p>
        </div>
        <div>
          <Label className="text-sm font-medium">Provider</Label>
          <p className="text-sm capitalize">{order.provider.replace('_', ' ')}</p>
        </div>
        <div>
          <Label className="text-sm font-medium">Status</Label>
          <div className="mt-1">
            <Badge variant="secondary">{order.status.replace('_', ' ')}</Badge>
          </div>
        </div>
        <div>
          <Label className="text-sm font-medium">Created</Label>
          <p className="text-sm">{formatDate(order.created_at)}</p>
        </div>
        <div>
          <Label className="text-sm font-medium">Updated</Label>
          <p className="text-sm">{formatDate(order.updated_at)}</p>
        </div>
      </div>

      {/* Provider Order ID */}
      {order.provider_order_id && (
        <div>
          <Label className="text-sm font-medium">Provider Order ID</Label>
          <p className="text-sm font-mono bg-muted p-2 rounded">
            {order.provider_order_id}
          </p>
        </div>
      )}

      {/* Metadata */}
      {order.metadata && Object.keys(order.metadata).length > 0 && (
        <div>
          <Label className="text-sm font-medium">Order Metadata</Label>
          <pre className="text-xs bg-muted p-2 rounded overflow-auto">
            {JSON.stringify(order.metadata, null, 2)}
          </pre>
        </div>
      )}

      {/* Payment History */}
      {order.payments && order.payments.length > 0 && (
        <div>
          <Label className="text-sm font-medium">Payment History</Label>
          <div className="space-y-2 mt-2">
            {order.payments.map((payment) => (
              <div key={payment.id} className="border rounded p-3 text-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <Badge variant="outline">{payment.status}</Badge>
                    <p className="mt-1">Amount: {formatAmount(payment.amount, payment.currency)}</p>
                    <p>Created: {formatDate(payment.created_at)}</p>
                    {payment.admin_notes && (
                      <p className="text-muted-foreground">Notes: {payment.admin_notes}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Verification Actions */}
      {canVerify && (
        <div className="space-y-4 border-t pt-4">
          <div>
            <Label htmlFor="verification-notes">Verification Notes</Label>
            <Textarea
              id="verification-notes"
              placeholder="Add notes about the verification..."
              value={verificationNotes}
              onChange={(e) => setVerificationNotes(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={() => onUpdateStatus(order.id, 'paid', verificationNotes)}
              disabled={verifying}
              className="flex items-center gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              Approve Payment
            </Button>
            <Button
              variant="destructive"
              onClick={() => onUpdateStatus(order.id, 'failed', verificationNotes)}
              disabled={verifying}
              className="flex items-center gap-2"
            >
              <XCircle className="h-4 w-4" />
              Reject Payment
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}