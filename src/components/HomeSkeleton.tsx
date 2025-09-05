import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { GlobalNavigation } from '@/components/GlobalNavigation';
import Footer from '@/components/Footer';

export function HomeSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <GlobalNavigation overlay={false} />
      
      {/* Hero Section Skeleton */}
      <section className="relative min-h-screen flex items-center justify-center px-4 pt-16">
        <div className="w-full h-full absolute inset-0 bg-muted animate-pulse" />
        <div className="relative z-10 max-w-7xl mx-auto text-center">
          <Skeleton className="h-6 w-64 mx-auto mb-4" />
          <Skeleton className="h-16 w-full max-w-4xl mx-auto mb-6" />
          <Skeleton className="h-6 w-full max-w-3xl mx-auto mb-8" />
          <Skeleton className="h-12 w-48 mx-auto mb-16" />
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="text-center">
                <Skeleton className="h-8 w-16 mx-auto mb-2" />
                <Skeleton className="h-4 w-20 mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section Skeleton */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <Skeleton className="h-10 w-64 mx-auto mb-4" />
            <Skeleton className="h-6 w-full max-w-3xl mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex items-start gap-4">
                  <Skeleton className="h-12 w-12 rounded-full flex-shrink-0" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
              ))}
            </div>
            <Skeleton className="h-80 w-full rounded-lg" />
          </div>
        </div>
      </section>

      {/* Services Section Skeleton */}
      <section className="py-20 px-4 bg-muted/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <Skeleton className="h-10 w-48 mx-auto mb-4" />
            <Skeleton className="h-6 w-full max-w-3xl mx-auto" />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="bg-background rounded-lg p-6 space-y-4">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Portfolio Section Skeleton */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <Skeleton className="h-10 w-48 mx-auto mb-4" />
            <Skeleton className="h-6 w-full max-w-3xl mx-auto" />
          </div>
          <div className="flex items-center gap-4 mb-6">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex gap-4 flex-1 overflow-hidden">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex-shrink-0 w-80 bg-background rounded-lg overflow-hidden">
                  <Skeleton className="h-48 w-full" />
                  <div className="p-6 space-y-3">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>
              ))}
            </div>
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
          <div className="flex justify-center gap-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-3 w-3 rounded-full" />
            ))}
          </div>
        </div>
      </section>

      {/* Blog Section Skeleton */}
      <section className="py-20 px-4 bg-muted/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <Skeleton className="h-10 w-48 mx-auto mb-4" />
            <Skeleton className="h-6 w-full max-w-3xl mx-auto" />
          </div>
          <div className="flex items-center gap-4 mb-6">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex gap-4 flex-1 overflow-hidden">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex-shrink-0 w-80 bg-background rounded-lg p-6 space-y-4">
                  <div className="flex items-center gap-4 text-sm">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-full" />
                  <div className="flex gap-2">
                    <Skeleton className="h-5 w-12" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                </div>
              ))}
            </div>
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
          <div className="flex justify-center gap-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-3 w-3 rounded-full" />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section Skeleton */}
      <section className="py-20 px-4">
        <div className="w-full h-64 bg-muted animate-pulse rounded-lg flex items-center justify-center">
          <div className="text-center space-y-4">
            <Skeleton className="h-12 w-96 mx-auto" />
            <Skeleton className="h-6 w-80 mx-auto" />
            <div className="flex gap-4 justify-center">
              <Skeleton className="h-12 w-32" />
              <Skeleton className="h-12 w-32" />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}