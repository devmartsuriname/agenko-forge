import { useState } from 'react';
import { LazyImageWithFallback } from './LazyImageWithFallback';

interface OptimizedAssetImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  publicFallback?: string;
}

export const OptimizedAssetImage = ({ 
  src, 
  alt, 
  className,
  fallbackSrc,
  publicFallback 
}: OptimizedAssetImageProps) => {
  const [hasError, setHasError] = useState(false);

  // Create fallback chain: src -> fallbackSrc -> publicFallback -> placeholder
  const getFallbackSrc = () => {
    if (!hasError && fallbackSrc) return fallbackSrc;
    if (publicFallback) return publicFallback;
    return '/placeholder.svg'; // Default Lovable placeholder
  };

  return (
    <LazyImageWithFallback
      src={src}
      fallbackSrc={getFallbackSrc()}
      alt={alt}
      className={className}
      onError={() => setHasError(true)}
    />
  );
};