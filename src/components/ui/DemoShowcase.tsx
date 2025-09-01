import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, ExternalLink, Github, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useReducedMotionSafe } from '@/hooks/useReducedMotionSafe';

interface DemoShowcaseProps {
  title: string;
  description: string;
  demoUrl?: string;
  repoUrl?: string;
  posterImage?: string;
  tags: string[];
  embedType?: 'iframe' | 'video';
  embedUrl?: string;
  className?: string;
}

export function DemoShowcase({
  title,
  description,
  demoUrl,
  repoUrl,
  posterImage,
  tags,
  embedType = 'iframe',
  embedUrl,
  className,
}: DemoShowcaseProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [error, setError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { prefersReducedMotion } = useReducedMotionSafe();

  // Intersection observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleLoadDemo = () => {
    if (!prefersReducedMotion) {
      setIsLoaded(true);
    } else {
      // For reduced motion, open in new tab instead
      if (demoUrl) {
        window.open(demoUrl, '_blank', 'noopener,noreferrer');
      }
    }
  };

  const handleEmbedLoad = () => {
    setError(false);
  };

  const handleEmbedError = () => {
    setError(true);
  };

  return (
    <Card ref={containerRef} className={cn("overflow-hidden", className)}>
      <CardContent className="p-0">
        {/* Demo Preview Area */}
        <div className="aspect-video bg-muted relative overflow-hidden">
          {!isLoaded && (
            // Poster/Placeholder
            <div className="absolute inset-0">
              {posterImage ? (
                <img
                  src={posterImage}
                  alt={`${title} preview`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Play className="w-8 h-8 text-primary" />
                    </div>
                    <p className="text-sm text-muted-foreground">Live Demo Available</p>
                  </div>
                </div>
              )}
              
              {/* Play overlay */}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                <Button
                  onClick={handleLoadDemo}
                  size="lg"
                  className="bg-primary/90 hover:bg-primary text-primary-foreground rounded-full"
                >
                  <Play className="w-6 h-6 mr-2" />
                  {prefersReducedMotion ? 'Open Demo' : 'Load Demo'}
                </Button>
              </div>
            </div>
          )}

          {/* Lazy-loaded embed */}
          {isLoaded && isVisible && embedUrl && (
            <div className="absolute inset-0">
              {error ? (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-4">
                      Demo temporarily unavailable
                    </p>
                    {demoUrl && (
                      <Button asChild variant="outline" size="sm">
                        <a href={demoUrl} target="_blank" rel="noopener noreferrer">
                          Open in New Tab
                          <ExternalLink className="w-4 h-4 ml-2" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  {embedType === 'iframe' ? (
                    <iframe
                      src={embedUrl}
                      className="w-full h-full border-0"
                      loading="lazy"
                      onLoad={handleEmbedLoad}
                      onError={handleEmbedError}
                      sandbox="allow-scripts allow-same-origin allow-forms"
                      title={`${title} Demo`}
                    />
                  ) : (
                    <video
                      src={embedUrl}
                      className="w-full h-full object-cover"
                      controls
                      onLoadedData={handleEmbedLoad}
                      onError={handleEmbedError}
                      preload="metadata"
                    />
                  )}
                  
                  {/* Loading indicator */}
                  <div className="absolute inset-0 bg-muted flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>

          {/* Title & Description */}
          <h3 className="text-xl font-semibold text-foreground mb-3">
            {title}
          </h3>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            {description}
          </p>

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            {demoUrl && (
              <Button asChild variant="outline" size="sm">
                <a href={demoUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Live Demo
                </a>
              </Button>
            )}
            
            {repoUrl && (
              <Button asChild variant="ghost" size="sm">
                <a href={repoUrl} target="_blank" rel="noopener noreferrer">
                  <Github className="w-4 h-4 mr-2" />
                  View Code
                </a>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}