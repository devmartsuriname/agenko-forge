import React, { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, ChevronDown, Copy, AlertCircle, Database } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { LoadingListSkeleton } from './LoadingSkeleton';

interface EventLogEntry {
  id: string;
  ts: string;
  level: string;
  area: string;
  route?: string;
  user_id?: string;
  message: string;
  meta: any; // Changed from Record<string, any> to any to handle Json type
}

interface EventLogDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entityType: 'quotes' | 'payments';
  entityId: string;
  entityLabel: string;
}

export function EventLogDrawer({ 
  open, 
  onOpenChange, 
  entityType, 
  entityId, 
  entityLabel 
}: EventLogDrawerProps) {
  const [events, setEvents] = useState<EventLogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (open && entityId) {
      fetchEvents();
    }
  }, [open, entityId, entityType]);

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: fetchError } = await supabase
        .from('logs_app_events')
        .select('id, ts, level, area, route, user_id, message, meta')
        .eq('area', entityType)
        .eq('meta->>entity_id', entityId)
        .order('ts', { ascending: false })
        .limit(10);

      if (fetchError) throw fetchError;
      
      // Type assertion to handle Json type from Supabase
      setEvents((data || []).map(item => ({
        ...item,
        meta: item.meta || {}
      })) as EventLogEntry[]);
    } catch (err: any) {
      console.error('Error fetching events:', err);
      setError(err.message || 'Failed to fetch events');
      toast.error('Failed to load event logs');
    } finally {
      setLoading(false);
    }
  };

  const formatRelativeTime = (timestamp: string) => {
    const now = new Date();
    const eventTime = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - eventTime.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const getLevelBadge = (level: string) => {
    const variants: Record<string, any> = {
      debug: 'outline',
      info: 'secondary',
      warn: 'default',
      error: 'destructive',
      critical: 'destructive'
    };

    return (
      <Badge variant={variants[level] || 'secondary'} className="text-xs">
        {level.toUpperCase()}
      </Badge>
    );
  };

  const maskEmail = (email: string) => {
    if (!email || !email.includes('@')) return email;
    const [local, domain] = email.split('@');
    const maskedLocal = local.length > 3 
      ? `${local.slice(0, 2)}***${local.slice(-1)}`
      : '***';
    return `${maskedLocal}@${domain}`;
  };

  const getActorDisplay = (event: EventLogEntry) => {
    const userId = event.user_id;
    const metaEmail = event.meta?.user_email;
    
    if (metaEmail) return maskEmail(metaEmail);
    if (userId) return `User: ${userId.slice(0, 8)}...`;
    return 'System';
  };

  const toggleEventExpanded = (eventId: string) => {
    const newExpanded = new Set(expandedEvents);
    if (newExpanded.has(eventId)) {
      newExpanded.delete(eventId);
    } else {
      newExpanded.add(eventId);
    }
    setExpandedEvents(newExpanded);
  };

  const copyEventJSON = (event: EventLogEntry) => {
    const sanitizedEvent = {
      id: event.id,
      timestamp: event.ts,
      level: event.level,
      area: event.area,
      route: event.route,
      message: event.message,
      metadata: event.meta
    };
    
    navigator.clipboard.writeText(JSON.stringify(sanitizedEvent, null, 2));
    toast.success('Event JSON copied to clipboard');
  };

  const renderLoadingState = () => (
    <div className="space-y-4">
      <LoadingListSkeleton />
    </div>
  );

  const renderEmptyState = () => (
    <Card className="p-8">
      <CardContent className="text-center">
        <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium text-muted-foreground mb-2">No Events Found</h3>
        <p className="text-sm text-muted-foreground">
          No recent events found for this {entityType.slice(0, -1)}.
        </p>
      </CardContent>
    </Card>
  );

  const renderErrorState = () => (
    <Card className="p-8">
      <CardContent className="text-center">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h3 className="text-lg font-medium text-destructive mb-2">Failed to Load Events</h3>
        <p className="text-sm text-muted-foreground mb-4">{error}</p>
        <Button onClick={fetchEvents} variant="outline" size="sm">
          Try Again
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        className="w-[90vw] sm:w-[600px] sm:max-w-[600px]" 
        aria-labelledby="event-log-title"
        aria-describedby="event-log-description"
      >
        <SheetHeader>
          <SheetTitle id="event-log-title" className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Event Log
          </SheetTitle>
          <SheetDescription id="event-log-description">
            Recent events for {entityLabel}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {loading && renderLoadingState()}
          {error && !loading && renderErrorState()}
          {!loading && !error && events.length === 0 && renderEmptyState()}
          
          {!loading && !error && events.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground mb-4">
                Showing last {events.length} events
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-20">Time</TableHead>
                    <TableHead className="w-20">Level</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead className="w-24">Actor</TableHead>
                    <TableHead className="w-16"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.map((event) => (
                    <React.Fragment key={event.id}>
                      <TableRow className="cursor-pointer hover:bg-muted/50">
                        <TableCell className="text-xs text-muted-foreground">
                          {formatRelativeTime(event.ts)}
                        </TableCell>
                        <TableCell>
                          {getLevelBadge(event.level)}
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {event.message.length > 60 
                            ? `${event.message.slice(0, 60)}...` 
                            : event.message}
                        </TableCell>
                        <TableCell className="text-xs">
                          {getActorDisplay(event)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyEventJSON(event)}
                              className="h-6 w-6 p-0"
                              aria-label="Copy event JSON"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                            <Collapsible>
                              <CollapsibleTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleEventExpanded(event.id)}
                                  className="h-6 w-6 p-0"
                                  aria-label="Toggle event details"
                                >
                                  <ChevronDown 
                                    className={`h-3 w-3 transition-transform ${
                                      expandedEvents.has(event.id) ? 'rotate-180' : ''
                                    }`} 
                                  />
                                </Button>
                              </CollapsibleTrigger>
                            </Collapsible>
                          </div>
                        </TableCell>
                      </TableRow>
                      
                      {expandedEvents.has(event.id) && (
                        <TableRow>
                          <TableCell colSpan={5} className="bg-muted/30 p-4">
                            <Collapsible open={expandedEvents.has(event.id)}>
                              <CollapsibleContent>
                                <div className="space-y-3">
                                  <div>
                                    <h4 className="text-sm font-medium mb-1">Full Message</h4>
                                    <p className="text-xs font-mono bg-background p-2 rounded border">
                                      {event.message}
                                    </p>
                                  </div>
                                  
                                  <div>
                                    <h4 className="text-sm font-medium mb-1">Details</h4>
                                    <div className="text-xs space-y-1">
                                      <div>ID: {event.id}</div>
                                      <div>Timestamp: {new Date(event.ts).toLocaleString()}</div>
                                      {event.route && <div>Route: {event.route}</div>}
                                    </div>
                                  </div>

                                  {Object.keys(event.meta).length > 0 && (
                                    <div>
                                      <h4 className="text-sm font-medium mb-1">Metadata</h4>
                                      <pre className="text-xs font-mono bg-background p-2 rounded border overflow-x-auto">
                                        {JSON.stringify(event.meta, null, 2)}
                                      </pre>
                                    </div>
                                  )}
                                </div>
                              </CollapsibleContent>
                            </Collapsible>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}