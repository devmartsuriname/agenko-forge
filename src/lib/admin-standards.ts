/**
 * Admin UI Standards & Utilities
 * Provides consistent patterns and utilities for admin components
 */

import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

// Standard admin colors and variants
export const ADMIN_COLORS = {
  primary: 'hsl(var(--primary))',
  secondary: 'hsl(var(--secondary))',
  success: 'hsl(var(--success))',
  warning: 'hsl(var(--warning))',
  destructive: 'hsl(var(--destructive))',
  muted: 'hsl(var(--muted))',
} as const;

// Standard status variants
export const STATUS_VARIANTS = {
  published: 'default',
  draft: 'secondary',
  archived: 'outline',
  pending: 'secondary',
  approved: 'default',
  rejected: 'destructive',
  active: 'default',
  inactive: 'secondary',
} as const;

// Standard loading states
export const LOADING_STATES = {
  idle: 'idle',
  loading: 'loading',
  success: 'success',
  error: 'error',
} as const;

// Admin table configuration
export interface AdminTableConfig {
  title: string;
  description?: string;
  searchPlaceholder?: string;
  enableSearch?: boolean;
  enableExport?: boolean;
  enableRefresh?: boolean;
  itemsPerPage?: number;
}

// Standard admin form validation
export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
}

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'url' | 'textarea' | 'select' | 'checkbox' | 'color' | 'file';
  placeholder?: string;
  description?: string;
  validation?: ValidationRule;
  options?: { value: string; label: string }[];
}

// Standard admin actions
export const createStandardActions = (
  entityName: string,
  onEdit?: (id: string) => void,
  onDelete?: (id: string) => void,
  onDuplicate?: (id: string) => void
) => ({
  edit: onEdit ? {
    label: `Edit ${entityName}`,
    icon: 'Edit',
    action: onEdit,
    variant: 'default' as const,
  } : null,
  delete: onDelete ? {
    label: `Delete ${entityName}`,
    icon: 'Trash2',
    action: onDelete,
    variant: 'destructive' as const,
    requireConfirm: true,
  } : null,
  duplicate: onDuplicate ? {
    label: `Duplicate ${entityName}`,
    icon: 'Copy',
    action: onDuplicate,
    variant: 'outline' as const,
  } : null,
});

// Standard toast messages
export const showSuccessToast = (message: string) => {
  toast({
    title: 'Success',
    description: message,
    variant: 'default',
  });
};

export const showErrorToast = (message: string, error?: any) => {
  console.error('Admin Error:', error);
  toast({
    title: 'Error',
    description: message,
    variant: 'destructive',
  });
};

export const showWarningToast = (message: string) => {
  toast({
    title: 'Warning',
    description: message,
    variant: 'default',
  });
};

// Standard confirmation dialog
export const showConfirmDialog = (
  title: string,
  message: string,
  onConfirm: () => void,
  confirmText = 'Confirm',
  cancelText = 'Cancel'
) => {
  // This would integrate with a confirmation dialog component
  if (window.confirm(`${title}\n\n${message}`)) {
    onConfirm();
  }
};

// Standard data fetching with error handling
export const fetchWithErrorHandling = async <T>(
  fetchFn: () => Promise<T>,
  errorMessage: string = 'Failed to fetch data'
): Promise<T | null> => {
  try {
    return await fetchFn();
  } catch (error) {
    showErrorToast(errorMessage, error);
    return null;
  }
};

// Standard form validation
export const validateForm = (data: Record<string, any>, fields: FormField[]): Record<string, string> => {
  const errors: Record<string, string> = {};

  fields.forEach(field => {
    const value = data[field.name];
    const validation = field.validation;

    if (!validation) return;

    // Required validation
    if (validation.required && (!value || value.toString().trim() === '')) {
      errors[field.name] = `${field.label} is required`;
      return;
    }

    // Skip other validations if field is empty and not required
    if (!value) return;

    // Length validations
    if (validation.minLength && value.toString().length < validation.minLength) {
      errors[field.name] = `${field.label} must be at least ${validation.minLength} characters`;
      return;
    }

    if (validation.maxLength && value.toString().length > validation.maxLength) {
      errors[field.name] = `${field.label} must be no more than ${validation.maxLength} characters`;
      return;
    }

    // Pattern validation
    if (validation.pattern && !validation.pattern.test(value.toString())) {
      errors[field.name] = `${field.label} format is invalid`;
      return;
    }

    // Custom validation
    if (validation.custom) {
      const customError = validation.custom(value);
      if (customError) {
        errors[field.name] = customError;
        return;
      }
    }
  });

  return errors;
};

// Standard database operations with logging
export const logAdminAction = async (
  action: string,
  entityType: string,
  entityId?: string,
  metadata?: Record<string, any>
) => {
  try {
    await supabase.rpc('log_app_event', {
      p_level: 'info',
      p_area: 'admin',
      p_message: `Admin ${action} ${entityType}${entityId ? ` (${entityId})` : ''}`,
      p_meta: metadata || {}
    });
  } catch (error) {
    console.warn('Failed to log admin action:', error);
  }
};

// Standard export functionality
export const exportToCSV = (data: any[], filename: string, columns?: string[]) => {
  if (!data.length) {
    showWarningToast('No data to export');
    return;
  }

  const headers = columns || Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        return typeof value === 'string' && value.includes(',') 
          ? `"${value.replace(/"/g, '""')}"` 
          : value;
      }).join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  showSuccessToast(`${filename}.csv exported successfully`);
};

// Standard pagination utilities
export const calculatePagination = (totalItems: number, itemsPerPage: number = 10, currentPage: number = 1) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

  return {
    totalPages,
    currentPage,
    itemsPerPage,
    startIndex,
    endIndex,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
    totalItems,
  };
};

// Standard search utilities
export const filterData = <T extends Record<string, any>>(
  data: T[],
  searchTerm: string,
  searchFields: (keyof T)[]
): T[] => {
  if (!searchTerm.trim()) return data;

  const term = searchTerm.toLowerCase();
  return data.filter(item =>
    searchFields.some(field => {
      const value = item[field];
      return value && value.toString().toLowerCase().includes(term);
    })
  );
};

// Standard status badge helper
export const getStatusBadgeVariant = (status: string): keyof typeof STATUS_VARIANTS => {
  return (STATUS_VARIANTS as any)[status.toLowerCase()] || 'outline';
};