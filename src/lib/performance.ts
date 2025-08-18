/**
 * Performance utilities for hero preload and CLS optimization
 */

import type { Section, HeroSection } from './sections/schema';

/**
 * Checks if the user is on a slow connection (2G or reduced data mode)
 */
export function isSlowConnection(): boolean {
  if (typeof navigator === 'undefined') return false;
  
  // Check for Save-Data header support
  if ('connection' in navigator) {
    const connection = (navigator as any).connection;
    if (connection?.saveData) return true;
    if (connection?.effectiveType === '2g' || connection?.effectiveType === 'slow-2g') return true;
  }
  
  return false;
}

/**
 * Injects a preload link for the hero image when hero is the first section
 */
export function injectHeroPreload(sections: Section[]): void {
  // Skip in slow connections or reduced data mode
  if (isSlowConnection()) return;
  
  // Check if first section is a hero with background image
  const firstSection = sections[0];
  if (!firstSection || firstSection.type !== 'hero') return;
  
  const heroSection = firstSection as HeroSection;
  const backgroundImage = heroSection.data.backgroundImage;
  
  if (!backgroundImage) return;
  
  const imageUrl = typeof backgroundImage === 'string' ? backgroundImage : backgroundImage.src;
  const srcset = typeof backgroundImage === 'object' ? backgroundImage.srcset : undefined;
  const sizes = typeof backgroundImage === 'object' ? backgroundImage.sizes : '100vw';
  
  // Check if preload link already exists to avoid duplicates
  const existingPreload = document.querySelector(`link[rel="preload"][href="${imageUrl}"]`);
  if (existingPreload) return;
  
  // Create and inject preload link with responsive attributes
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  link.href = imageUrl;
  link.setAttribute('fetchpriority', 'high');
  
  // Add responsive attributes for better preloading
  if (srcset) {
    link.setAttribute('imagesrcset', srcset);
    link.setAttribute('imagesizes', sizes);
  }
  
  // Add to head
  document.head.appendChild(link);
}

/**
 * Creates a responsive image srcset for Supabase Storage WebP variants
 */
export function createImageSrcSet(baseUrl: string, sizes: number[] = [320, 640, 960, 1200]): string {
  if (!baseUrl.includes('storage/v1/object/public/media') || !baseUrl.includes('-1200.webp')) {
    return '';
  }
  
  return sizes
    .map(width => `${baseUrl.replace('-1200.webp', `-${width}.webp`)} ${width}w`)
    .join(', ');
}

/**
 * Gets responsive image sizes attribute for hero images
 */
export function getHeroImageSizes(): string {
  return '100vw';
}

/**
 * Gets responsive image sizes attribute for card images (blog/portfolio)
 */
export function getCardImageSizes(): string {
  return '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';
}