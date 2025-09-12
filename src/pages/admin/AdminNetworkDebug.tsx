/**
 * Admin Network Debug Page
 * Full-featured network debugging interface for administrators
 */

import React from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { NetworkDebugPanel } from '@/components/admin/NetworkDebugPanel';
import { useAuth } from '@/lib/auth';
import { Navigate } from 'react-router-dom';
import { SEOHead } from '@/lib/seo';

export default function AdminNetworkDebug() {
  const { user, userRole } = useAuth();

  // Only admin users can access network debugging
  if (!user || userRole !== 'admin') {
    return <Navigate to="/admin/login" replace />; 
  }

  return (
    <>
      <SEOHead 
        title="Network Debug - Admin Panel"
        description="Network debugging and monitoring tools for administrators"
      />
      
      <AdminLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Network Debug</h1>
            <p className="text-muted-foreground">
              Monitor and debug network requests in real-time
            </p>
          </div>
          
          <NetworkDebugPanel />
        </div>
      </AdminLayout>
    </>
  );
}