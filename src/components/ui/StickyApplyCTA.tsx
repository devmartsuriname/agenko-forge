import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useReducedMotionSafe } from '@/hooks/useReducedMotionSafe';

interface StickyApplyCTAProps {
  title: string;
  ctaText?: string;
  ctaLink: string;
  showThreshold?: number; // Scroll percentage to show the CTA
  className?: string;
}

export function StickyApplyCTA({
  title,
  ctaText = "Apply Now",
  ctaLink,
  showThreshold = 0.2,
  className,
}: StickyApplyCTAProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const { prefersReducedMotion } = useReducedMotionSafe();

  useEffect(() => {
    if (isDismissed || prefersReducedMotion) return;

    const handleScroll = () => {
      const scrollPercent = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
      setIsVisible(scrollPercent > showThreshold);
    };

    handleScroll(); // Initial check
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [showThreshold, isDismissed, prefersReducedMotion]);

  // Don't show if reduced motion is preferred or dismissed
  if (prefersReducedMotion || isDismissed || !isVisible) {
    return null;
  }

  return (
    <div className={cn(
      "fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md",
      "transform transition-all duration-300 ease-out",
      isVisible ? "translate-y-0 opacity-100" : "translate-y-full opacity-0",
      className
    )}>
      <div className="bg-card/95 backdrop-blur-md border border-border/50 rounded-2xl p-4 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-foreground truncate">
              {title}
            </h3>
            <p className="text-xs text-muted-foreground">
              Ready to join our team?
            </p>
          </div>
          
          <div className="flex items-center gap-2 ml-4">
            <Button
              asChild
              size="sm"
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
            >
              <Link to={ctaLink}>
                {ctaText}
                <ArrowRight className="ml-1 w-3 h-3" />
              </Link>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="w-8 h-8 p-0 text-muted-foreground hover:text-foreground"
              onClick={() => setIsDismissed(true)}
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}