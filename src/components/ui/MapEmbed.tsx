import React, { useState } from 'react';
import { MapPin, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface MapEmbedProps {
  address: string;
  embedUrl?: string;
  directionsUrl?: string;
  className?: string;
  showDirectionsButton?: boolean;
  height?: string;
}

export function MapEmbed({ 
  address,
  embedUrl,
  directionsUrl,
  className = "",
  showDirectionsButton = true,
  height = "300px"
}: MapEmbedProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  // Default to Paramaribo, Suriname if no specific embed URL
  const defaultEmbedUrl = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31789.923456789!2d-55.203611!3d5.8333333!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNcKwNTAnMDAuMCJOIDU1wrAxMicxMy4wIlc!5e0!3m2!1sen!2ssr!4v1234567890";
  
  const defaultDirectionsUrl = "https://www.google.com/maps/dir/?api=1&destination=" + encodeURIComponent(address);

  const finalEmbedUrl = embedUrl || defaultEmbedUrl;
  const finalDirectionsUrl = directionsUrl || defaultDirectionsUrl;

  return (
    <Card className={className}>
      <CardContent className="p-0">
        <div className="relative">
          {/* Loading placeholder */}
          {!isLoaded && (
            <div 
              className="flex items-center justify-center bg-muted animate-pulse"
              style={{ height }}
            >
              <MapPin className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
          
          {/* Map iframe */}
          <iframe
            src={finalEmbedUrl}
            width="100%"
            height={height}
            style={{ border: 0, display: isLoaded ? 'block' : 'none' }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            onLoad={() => setIsLoaded(true)}
            title={`Map showing location of ${address}`}
            className="rounded-t-lg"
          />
          
          {/* Address overlay */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className="bg-background/95 backdrop-blur-sm rounded-lg p-3 shadow-lg">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span className="font-medium text-sm">Our Location</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{address}</p>
                </div>
                
                {showDirectionsButton && (
                  <Button 
                    size="sm" 
                    asChild
                    className="flex-shrink-0"
                  >
                    <a 
                      href={finalDirectionsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Directions
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}