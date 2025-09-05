import { ArrowRight } from "lucide-react";
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import type { HeroSection } from '@/lib/sections/schema';

interface HeroSectionProps {
  section: HeroSection;
}

export function HeroSectionComponent({ section }: HeroSectionProps) {
  const { data } = section;

  // Use CMS data with fallbacks to new design defaults
  const title = data.title || "Unbeatable Pricing for Dynamic Development Tools";
  const subtitle = data.subtitle || "Join the revolution today!";
  const description = data.description || "Delivering unmatched web solutions every day at unbeatable rates. Our tools redefine cost-effectiveness for modern businesses.";
  const ctaText = data.ctaText || "Start Your 7 Day Free Trial";
  const ctaLink = data.ctaLink || "/get-quote";

  return (
    <div className="relative min-h-screen overflow-x-hidden overflow-y-auto bg-gradient-to-br from-agenko-dark via-agenko-dark/95 to-black">
      {/* Noise Pattern - Overlay on Background */}
      <div className="absolute inset-0 z-10 bg-grainy opacity-40"></div>
      
      {/* Reduced Opacity Background Pattern */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent"></div>
      </div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-10 w-72 h-72 bg-agenko-green/5 rounded-full blur-3xl floating-element"></div>
        <div className="absolute top-1/3 right-10 w-96 h-96 bg-primary/3 rounded-full blur-3xl floating-element-delayed"></div>
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-agenko-green/5 rounded-full blur-3xl floating-element"></div>
      </div>

      {/* Content container */}
      <div className="relative z-20">
        {/* Badge */}
        {subtitle && (
          <div className="flex justify-center pt-24 pb-8">
            <div className="flex max-w-fit items-center justify-center space-x-2 rounded-full bg-white/10 px-6 py-3 backdrop-blur-sm border border-white/20">
              <span className="text-sm font-medium text-white">
                {subtitle}
              </span>
              <ArrowRight className="h-4 w-4 text-white" />
            </div>
          </div>
        )}

        {/* Hero section */}
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-5xl mx-auto">
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold leading-tight text-white mb-8">
              {title}
            </h1>
            {description && (
              <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
                {description}
              </p>
            )}
            <div className="flex flex-col items-center justify-center space-y-4 sm:flex-row sm:space-x-6 sm:space-y-0 mb-20">
              <Button asChild className="bg-agenko-green text-agenko-dark hover:bg-agenko-green/90 font-semibold px-8 py-4 text-lg">
                <Link to={ctaLink}>
                  {ctaText}
                </Link>
              </Button>
              <Button 
                asChild 
                variant="outline" 
                className="border-agenko-green text-agenko-green hover:bg-agenko-green/10 px-8 py-4 text-lg"
              >
                <Link to="/portfolio">
                  View Our Work
                </Link>
              </Button>
            </div>
          </div>

          {/* Hero Image Section */}
          <div className="relative mx-auto mb-24 w-full max-w-7xl px-4">
            {/* Glow effect behind image */}
            <div className="absolute inset-0 bg-gradient-to-r from-agenko-green/20 via-primary/20 to-agenko-green/20 blur-3xl scale-110 opacity-50"></div>
            
            {/* Image container */}
            <div className="relative">
              {data.backgroundImage ? (
                <div className="relative w-full h-auto">
                  {typeof data.backgroundImage === 'string' ? (
                    <img
                      src={data.backgroundImage}
                      alt="Hero showcase"
                      className="relative w-full h-auto shadow-2xl rounded-lg border border-white/10"
                    />
                  ) : (
                    <img
                      src={data.backgroundImage.src}
                      srcSet={data.backgroundImage.srcset}
                      sizes={data.backgroundImage.sizes}
                      alt={data.backgroundImage.alt || "Hero showcase"}
                      width={data.backgroundImage.width}
                      height={data.backgroundImage.height}
                      className="relative w-full h-auto shadow-2xl rounded-lg border border-white/10"
                    />
                  )}
                </div>
              ) : (
                <img
                  src="https://kikxai.netlify.app/_next/image?url=%2Fassets%2Fhero-image.png&w=1920&q=75"
                  alt="Hero showcase"
                  className="relative w-full h-auto shadow-2xl rounded-lg border border-white/10"
                />
              )}
            </div>
          </div>

          {/* Stats section if available from CMS */}
          {data.stats && data.stats.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto pb-20">
              {data.stats.map((stat, index) => (
                <div key={index} className="text-center transform hover:scale-105 transition-transform duration-300">
                  <div className="text-4xl md:text-5xl font-bold text-agenko-green mb-3">
                    {stat.number}
                  </div>
                  <div className="text-white/80 text-base md:text-lg">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}