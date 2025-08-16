import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Motion animation variants for staggered entrance
const slideVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.15,
      delay: index * 0.06,
      ease: [0.4, 0, 0.2, 1], // Standard ease-out
    },
  }),
};

interface CarouselBaseProps {
  children: React.ReactNode[];
  title: string;
  slidesPerView?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
  };
  gap?: number;
  autoplay?: boolean;
  intervalMs?: number;
  loop?: boolean;
  showArrows?: boolean;
  showDots?: boolean;
  className?: string;
}

export function CarouselBase({
  children,
  title,
  slidesPerView = { xs: 1, sm: 1, md: 2, lg: 3 },
  gap = 16,
  autoplay = false,
  intervalMs = 6000,
  loop = true,
  showArrows = true,
  showDots = true,
  className
}: CarouselBaseProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout>();
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  // Check for reduced motion preference
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);
      
      const handleChange = (e: MediaQueryListEvent) => {
        setPrefersReducedMotion(e.matches);
      };
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, []);

  // Trigger animation on mount
  useEffect(() => {
    if (!prefersReducedMotion && !hasAnimated) {
      const timer = setTimeout(() => {
        setHasAnimated(true);
      }, 100);
      return () => clearTimeout(timer);
    } else if (prefersReducedMotion) {
      setHasAnimated(true);
    }
  }, []);

  // Get current slides per view based on viewport
  const getCurrentSlidesPerView = useCallback(() => {
    if (typeof window === 'undefined') return slidesPerView.lg || 3;
    
    const width = window.innerWidth;
    if (width < 640) return slidesPerView.xs || 1;
    if (width < 768) return slidesPerView.sm || 1;
    if (width < 1024) return slidesPerView.md || 2;
    return slidesPerView.lg || 3;
  }, [slidesPerView]);

  const [currentSlidesPerView, setCurrentSlidesPerView] = useState(getCurrentSlidesPerView);

  // Update slides per view on resize
  useEffect(() => {
    const handleResize = () => {
      setCurrentSlidesPerView(getCurrentSlidesPerView());
    };
    
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [getCurrentSlidesPerView]);

  const totalSlides = children.length;
  const maxIndex = loop ? totalSlides : Math.max(0, totalSlides - currentSlidesPerView);

  // Navigation functions
  const goToNext = useCallback(() => {
    if (loop) {
      setCurrentIndex((prev) => (prev + 1) % totalSlides);
    } else {
      setCurrentIndex((prev) => Math.min(prev + 1, maxIndex));
    }
  }, [loop, totalSlides, maxIndex]);

  const goToPrev = useCallback(() => {
    if (loop) {
      setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
    } else {
      setCurrentIndex((prev) => Math.max(prev - 1, 0));
    }
  }, [loop, totalSlides]);

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(Math.max(0, Math.min(index, maxIndex)));
  }, [maxIndex]);

  // Autoplay functionality
  useEffect(() => {
    if (autoplay && !isHovered && !prefersReducedMotion && totalSlides > 1) {
      intervalRef.current = setInterval(goToNext, intervalMs);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = undefined;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoplay, isHovered, prefersReducedMotion, goToNext, intervalMs, totalSlides]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      goToPrev();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      goToNext();
    }
  }, [goToPrev, goToNext]);

  // Touch navigation
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      goToNext();
    } else if (isRightSwipe) {
      goToPrev();
    }
  };

  // Calculate transform
  const slideWidth = 100 / currentSlidesPerView;
  const translateX = loop 
    ? -currentIndex * slideWidth 
    : -Math.min(currentIndex, maxIndex) * slideWidth;

  // Calculate visible slide indices for dots
  const getVisibleSlideIndices = () => {
    if (loop) {
      return Array.from({ length: totalSlides }, (_, i) => i);
    }
    return Array.from({ length: Math.ceil(totalSlides / currentSlidesPerView) }, (_, i) => i);
  };

  const visibleSlideIndices = getVisibleSlideIndices();

  if (totalSlides === 0) {
    return null;
  }

  return (
    <section
      role="region"
      aria-label={title}
      className={cn("relative", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div
        ref={containerRef}
        className="overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="flex transition-transform ease-out"
          style={{
            transform: `translateX(${translateX}%)`,
            gap: `${gap}px`,
            transitionDuration: prefersReducedMotion ? '0ms' : '300ms',
          }}
          aria-live="off"
        >
          {children.map((child, index) => {
            const isVisible = loop 
              ? true 
              : index >= currentIndex && index < currentIndex + currentSlidesPerView;
            
            return (
              <div
                key={index}
                className={cn(
                  "flex-shrink-0 transition-opacity ease-out",
                  hasAnimated && !prefersReducedMotion && isVisible 
                    ? "opacity-100 animate-fade-in" 
                    : hasAnimated 
                    ? "opacity-100" 
                    : "opacity-0"
                )}
                style={{ 
                  width: `calc(${slideWidth}% - ${gap * (currentSlidesPerView - 1) / currentSlidesPerView}px)`,
                  animationDelay: !prefersReducedMotion && hasAnimated ? `${index * 60}ms` : '0ms',
                  transitionDuration: prefersReducedMotion ? '0ms' : '150ms',
                }}
                aria-hidden={
                  loop 
                    ? false 
                    : index < currentIndex || index >= currentIndex + currentSlidesPerView
                }
              >
                {child}
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation Arrows */}
      {showArrows && totalSlides > currentSlidesPerView && (
        <>
          <Button
            variant="outline"
            size="icon"
            className={cn(
              "absolute left-2 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full",
              "bg-background/80 backdrop-blur-sm border-2",
              "hover:bg-background hover:scale-110 transition-all ease-out",
              "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
              (!loop && currentIndex === 0) && "opacity-50 cursor-not-allowed"
            )}
            style={{ transitionDuration: prefersReducedMotion ? '0ms' : '120ms' }}
            onClick={goToPrev}
            disabled={!loop && currentIndex === 0}
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            className={cn(
              "absolute right-2 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full",
              "bg-background/80 backdrop-blur-sm border-2",
              "hover:bg-background hover:scale-110 transition-all ease-out",
              "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
              (!loop && currentIndex >= maxIndex) && "opacity-50 cursor-not-allowed"
            )}
            style={{ transitionDuration: prefersReducedMotion ? '0ms' : '120ms' }}
            onClick={goToNext}
            disabled={!loop && currentIndex >= maxIndex}
            aria-label="Next slide"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </>
      )}

      {/* Dots Navigation */}
      {showDots && totalSlides > currentSlidesPerView && (
        <div className="flex justify-center mt-6 gap-2" role="tablist" aria-label="Slide navigation">
          {visibleSlideIndices.map((index) => {
            const isActive = loop 
              ? index === currentIndex 
              : index === Math.floor(currentIndex / currentSlidesPerView);
            
            return (
              <button
                key={index}
                className={cn(
                  "w-3 h-3 rounded-full transition-all ease-out",
                  "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                  isActive 
                    ? "bg-primary scale-110" 
                    : "bg-muted hover:bg-muted-foreground/30"
                )}
                style={{ transitionDuration: prefersReducedMotion ? '0ms' : '120ms' }}
                onClick={() => goToSlide(loop ? index : index * currentSlidesPerView)}
                aria-label={`Go to slide ${index + 1}`}
                aria-current={isActive ? 'true' : undefined}
                role="tab"
                tabIndex={isActive ? 0 : -1}
              />
            );
          })}
        </div>
      )}
    </section>
  );
}