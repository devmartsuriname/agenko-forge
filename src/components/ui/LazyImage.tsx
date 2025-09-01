import React, { useState, useRef, useEffect } from 'react';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  placeholderSrc?: string;
  quality?: number;
}

// Simple image optimization helper inline
const optimizeImage = (src: string, width?: number, height?: number): string => {
  if (!src || typeof window === 'undefined') return src;

  // If it's a Supabase storage URL, add optimization parameters
  if (src.includes('supabase.co')) {
    const url = new URL(src);
    if (width) url.searchParams.set('width', width.toString());
    if (height) url.searchParams.set('height', height.toString());
    url.searchParams.set('quality', '85');
    url.searchParams.set('format', 'webp');
    return url.toString();
  }

  return src;
};

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  width,
  height,
  className = '',
  placeholderSrc,
  quality = 85,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [inView, setInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const [currentSrc, setCurrentSrc] = useState(placeholderSrc || '');

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { 
        threshold: 0.1,
        rootMargin: '50px 0px'
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (inView && !isLoaded) {
      const optimizedSrc = optimizeImage(src, width, height);
      
      // Preload the image
      const img = new Image();
      img.onload = () => {
        setCurrentSrc(optimizedSrc);
        setIsLoaded(true);
      };
      img.onerror = () => {
        setCurrentSrc(src); // Fallback to original
        setIsLoaded(true);
      };
      img.src = optimizedSrc;
    }
  }, [inView, src, width, height, isLoaded]);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <img
        ref={imgRef}
        src={currentSrc}
        alt={alt}
        width={width}
        height={height}
        className={`transition-opacity duration-500 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        } ${className}`}
        loading="lazy"
        decoding="async"
        {...props}
      />
      
      {/* Loading placeholder */}
      {!isLoaded && (
        <div 
          className={`absolute inset-0 bg-gradient-to-r from-agenko-dark-lighter via-agenko-gray/20 to-agenko-dark-lighter animate-pulse`}
          style={{ aspectRatio: width && height ? `${width}/${height}` : 'auto' }}
        />
      )}
      
      {/* Progressive enhancement: blur-to-sharp loading */}
      {!isLoaded && placeholderSrc && (
        <img
          src={placeholderSrc}
          alt=""
          className="absolute inset-0 filter blur-sm scale-105 opacity-50"
          aria-hidden="true"
        />
      )}
    </div>
  );
};

// HOC for lazy loading existing images
export const withLazyLoading = <P extends object>(
  Component: React.ComponentType<P & { src?: string }>
) => {
  return React.forwardRef<any, P & { src?: string; lazyLoading?: boolean }>((props, ref) => {
    const { src, lazyLoading = true, ...rest } = props;
    
    if (!lazyLoading || !src) {
      return <Component ref={ref} src={src} {...(rest as P)} />;
    }
    
    return (
      <LazyImage
        ref={ref}
        src={src}
        alt=""
        {...(rest as any)}
      />
    );
  });
};