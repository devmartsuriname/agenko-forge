import { toast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, Info, AlertTriangle } from 'lucide-react';

export const adminToast = {
  success: (title: string, description?: string) => {
    toast({
      title: `✓ ${title}`,
      description,
      variant: 'default',
    });
  },

  error: (title: string, description?: string) => {
    toast({
      title: `✗ ${title}`,
      description,
      variant: 'destructive',
    });
  },

  info: (title: string, description?: string) => {
    toast({
      title: `ℹ ${title}`,
      description,
      variant: 'default',
    });
  },

  warning: (title: string, description?: string) => {
    toast({
      title: `⚠ ${title}`,
      description,
      variant: 'destructive',
    });
  },

  // Specific action toasts with context
  created: (itemType: string, itemName?: string) => {
    adminToast.success(
      `Created ${itemType}`,
      itemName ? `"${itemName}" has been created successfully.` : undefined
    );
  },

  updated: (itemType: string, itemName?: string) => {
    adminToast.success(
      `Updated ${itemType}`,
      itemName ? `"${itemName}" has been saved successfully.` : undefined
    );
  },

  deleted: (itemType: string, itemName?: string) => {
    adminToast.success(
      `Deleted ${itemType}`,
      itemName ? `"${itemName}" has been permanently deleted.` : undefined
    );
  },

  published: (itemType: string, itemName?: string) => {
    adminToast.success(
      `Published ${itemType}`,
      itemName ? `"${itemName}" is now live on your website.` : undefined
    );
  },

  unpublished: (itemType: string, itemName?: string) => {
    adminToast.info(
      `Unpublished ${itemType}`,
      itemName ? `"${itemName}" is now in draft mode.` : undefined
    );
  },

  exported: (itemType: string, filename?: string) => {
    adminToast.success(
      `Exported ${itemType}`,
      filename ? `Downloaded as "${filename}"` : undefined
    );
  },

  // Error scenarios
  networkError: () => {
    adminToast.error(
      'Network Error',
      'Unable to connect to the server. Please check your connection and try again.'
    );
  },

  permissionDenied: (action?: string) => {
    adminToast.error(
      'Permission Denied',
      action ? `You don't have permission to ${action}.` : 'You don\'t have permission to perform this action.'
    );
  },

  validationError: (message?: string) => {
    adminToast.error(
      'Validation Error',
      message || 'Please check your input and try again.'
    );
  },

  generateProgress: (type: string) => {
    adminToast.info(
      `Generating ${type}...`,
      'This may take a moment for large datasets.'
    );
  }
};