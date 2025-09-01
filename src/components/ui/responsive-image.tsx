import { cn } from "@/lib/utils";
import { ImgHTMLAttributes } from "react";

interface ResponsiveImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt' | 'sizes' | 'loading'> {
  src: string;
  alt: string;
  sizes?: string;
  priority?: boolean;
  aspectRatio?: string;
  loading?: "eager" | "lazy";
}

export function ResponsiveImage({
  src,
  alt,
  className,
  sizes = "100vw",
  priority = false,
  aspectRatio = "16/9",
  loading = "lazy",
  ...rest
}: ResponsiveImageProps) {
  
  // Generate srcset from the main URL if it's a Supabase Storage WebP
  const generateSrcSet = (baseUrl: string): string => {
    if (!baseUrl.includes('storage/v1/object/public/media') || !baseUrl.includes('-1200.webp')) {
      return '';
    }
    
    const variants = [320, 640, 960, 1200];
    return variants
      .map(width => `${baseUrl.replace('-1200.webp', `-${width}.webp`)} ${width}w`)
      .join(', ');
  };

  const srcset = generateSrcSet(src);
  
  return (
    <img
      src={src}
      srcSet={srcset || undefined}
      sizes={sizes}
      alt={alt}
      loading={priority ? "eager" : loading}
      fetchPriority={priority ? "high" : "auto"}
      className={cn(
        "w-full h-full object-cover",
        className
      )}
      style={{
        aspectRatio: aspectRatio,
        objectFit: 'cover'
      }}
      {...rest}
    />
  );
}