/**
 * Standardized Admin Card Component
 * Provides consistent card layout and styling across admin components
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Download, Plus } from 'lucide-react';

interface AdminCardAction {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  variant?: 'default' | 'outline' | 'secondary' | 'destructive';
  disabled?: boolean;
  loading?: boolean;
}

interface AdminCardProps {
  title: string;
  description?: string;
  badge?: {
    text: string;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  };
  actions?: AdminCardAction[];
  children: React.ReactNode;
  className?: string;
  loading?: boolean;
  error?: string;
}

export function StandardAdminCard({
  title,
  description,
  badge,
  actions = [],
  children,
  className = '',
  loading = false,
  error
}: AdminCardProps) {
  return (
    <Card className={`relative ${className}`}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg font-semibold">{title}</CardTitle>
              {badge && (
                <Badge variant={badge.variant || 'default'}>
                  {badge.text}
                </Badge>
              )}
            </div>
            {description && (
              <CardDescription className="text-sm">
                {description}
              </CardDescription>
            )}
          </div>
          
          {actions.length > 0 && (
            <div className="flex items-center gap-2">
              {actions.map((action, index) => (
                <Button
                  key={index}
                  variant={action.variant || 'outline'}
                  size="sm"
                  onClick={action.onClick}
                  disabled={action.disabled || loading}
                  className="gap-2"
                >
                  <action.icon className={`h-4 w-4 ${action.loading ? 'animate-spin' : ''}`} />
                  {action.label}
                </Button>
              ))}
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {error ? (
          <div className="rounded-md bg-destructive/10 p-4">
            <div className="text-sm text-destructive">{error}</div>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-2 text-muted-foreground">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span className="text-sm">Loading...</span>
            </div>
          </div>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}

// Pre-configured admin cards for common use cases
export function AdminTableCard({
  title,
  description,
  totalItems,
  onRefresh,
  onExport,
  onCreate,
  children,
  loading = false,
  error
}: {
  title: string;
  description?: string;
  totalItems?: number;
  onRefresh?: () => void;
  onExport?: () => void;
  onCreate?: () => void;
  children: React.ReactNode;
  loading?: boolean;
  error?: string;
}) {
  const actions: AdminCardAction[] = [];
  
  if (onRefresh) {
    actions.push({
      label: 'Refresh',
      icon: RefreshCw,
      onClick: onRefresh,
      variant: 'outline',
      loading
    });
  }
  
  if (onExport && totalItems && totalItems > 0) {
    actions.push({
      label: 'Export',
      icon: Download,
      onClick: onExport,
      variant: 'outline'
    });
  }
  
  if (onCreate) {
    actions.push({
      label: 'Create',
      icon: Plus,
      onClick: onCreate,
      variant: 'default'
    });
  }

  return (
    <StandardAdminCard
      title={title}
      description={description}
      badge={totalItems !== undefined ? {
        text: `${totalItems} items`,
        variant: 'secondary'
      } : undefined}
      actions={actions}
      loading={loading}
      error={error}
    >
      {children}
    </StandardAdminCard>
  );
}

export function AdminStatsCard({
  title,
  value,
  subtitle,
  trend,
  icon: Icon,
  loading = false
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
    label: string;
  };
  icon?: React.ComponentType<{ className?: string }>;
  loading?: boolean;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">
              {title}
            </p>
            {loading ? (
              <div className="h-8 w-20 bg-muted animate-pulse rounded" />
            ) : (
              <p className="text-2xl font-bold">
                {typeof value === 'number' ? value.toLocaleString() : value}
              </p>
            )}
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
            {trend && (
              <div className={`flex items-center gap-1 text-xs ${
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              }`}>
                <span>{trend.isPositive ? '↗' : '↘'}</span>
                <span>{Math.abs(trend.value)}% {trend.label}</span>
              </div>
            )}
          </div>
          {Icon && (
            <Icon className="h-8 w-8 text-muted-foreground/50" />
          )}
        </div>
      </CardContent>
    </Card>
  );
}