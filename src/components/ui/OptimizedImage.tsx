/**
 * Optimized image component with advanced performance features
 */
import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ResponsiveImage } from './responsive-image';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  aspectRatio?: string;
  loading?: "eager" | "lazy";
  onLoad?: () => void;
  onError?: () => void;
  placeholder?: string;
  blurDataURL?: string;
}

export function OptimizedImage({
  src,
  alt,
  className,
  sizes = "100vw",
  priority = false,
  aspectRatio = "16/9",
  loading = "lazy",
  onLoad,
  onError,
  placeholder,
  blurDataURL,
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || loading === 'eager') {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px',
        threshold: 0.1,
      }
    );

    const currentRef = imgRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [priority, loading]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  return (
    <div 
      ref={imgRef}
      className={cn(
        'relative overflow-hidden',
        className
      )}
      style={{ aspectRatio }}
    >
      {/* Placeholder/Blur */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-muted animate-pulse">
          {blurDataURL && (
            <img
              src={blurDataURL}
              alt=""
              className="w-full h-full object-cover filter blur-sm scale-110"
              aria-hidden="true"
            />
          )}
          {placeholder && !blurDataURL && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-muted-foreground text-sm">{placeholder}</span>
            </div>
          )}
        </div>
      )}

      {/* Error State */}
      {hasError && (
        <div className="absolute inset-0 bg-muted flex items-center justify-center">
          <div className="text-center p-4">
            <div className="text-muted-foreground text-sm mb-2">
              Failed to load image
            </div>
            <div className="text-xs text-muted-foreground opacity-75">
              {alt}
            </div>
          </div>
        </div>
      )}

      {/* Actual Image */}
      {isInView && !hasError && (
        <ResponsiveImage
          src={src}
          alt={alt}
          sizes={sizes}
          priority={priority}
          aspectRatio={aspectRatio}
          loading={loading}
          className={cn(
            'transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0'
          )}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}

      {/* Loading overlay */}
      {isInView && !isLoaded && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" />
        </div>
      )}
    </div>
  );
}