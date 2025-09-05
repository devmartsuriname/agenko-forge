import { useState } from "react";
import { ArrowRight, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import type { HeroSection } from '@/lib/sections/schema';
import logo from '@/assets/logo.png';

interface HeroSectionProps {
  section: HeroSection;
}

export function HeroSectionComponent({ section }: HeroSectionProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data } = section;

  // Use CMS data with fallbacks to new design defaults
  const title = data.title || "Unbeatable Pricing for Dynamic Development Tools";
  const subtitle = data.subtitle || "Join the revolution today!";
  const description = data.description || "Delivering unmatched web solutions every day at unbeatable rates. Our tools redefine cost-effectiveness for modern businesses.";
  const ctaText = data.ctaText || "Start Your 7 Day Free Trial";
  const ctaLink = data.ctaLink || "/get-quote";

  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      {/* Gradient background with grain effect */}
      <div className="flex flex-col items-end absolute -right-60 -top-10 blur-xl z-0 ">
        <div className="h-[10rem] rounded-full w-[60rem] z-1 bg-gradient-to-b blur-[6rem] from-purple-600 to-sky-600"></div>
        <div className="h-[10rem] rounded-full w-[90rem] z-1 bg-gradient-to-b blur-[6rem] from-pink-900 to-yellow-400"></div>
        <div className="h-[10rem] rounded-full w-[60rem] z-1 bg-gradient-to-b blur-[6rem] from-yellow-600 to-sky-500"></div>
      </div>
      <div className="absolute inset-0 z-0 bg-noise opacity-30"></div>

      {/* Content container */}
      <div className="relative z-10">
        {/* Navigation */}
        <nav className="container mx-auto flex items-center justify-between px-4 py-4 mt-6">
          <Link to="/" className="flex items-center">
            <img src={logo} alt="Logo" className="h-8 w-8" />
            <span className="ml-2 text-xl font-bold text-white">Devmart</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <div className="flex items-center space-x-6">
              <NavItem label="Services" href="/services" />
              <NavItem label="Portfolio" href="/portfolio" />
              <NavItem label="About" href="/about" />
              <NavItem label="Pricing" href="/pricing" />
            </div>
            <div className="flex items-center space-x-3">
              <Button asChild className="bg-white text-black hover:bg-white/90">
                <Link to="/contact">Get Started</Link>
              </Button>
            </div>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span className="sr-only">Toggle menu</span>
            {mobileMenuOpen ? (
              <X className="h-6 w-6 text-white" />
            ) : (
              <Menu className="h-6 w-6 text-white" />
            )}
          </button>
        </nav>

        {/* Mobile Navigation Menu with animation */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ y: "-100%" }}
              animate={{ y: 0 }}
              exit={{ y: "-100%" }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-50 flex flex-col p-4 bg-black/95 md:hidden"
            >
              <div className="flex items-center justify-between">
                <Link to="/" className="flex items-center" onClick={() => setMobileMenuOpen(false)}>
                  <img src={logo} alt="Logo" className="h-8 w-8" />
                  <span className="ml-2 text-xl font-bold text-white">Devmart</span>
                </Link>
                <button onClick={() => setMobileMenuOpen(false)}>
                  <X className="h-6 w-6 text-white" />
                </button>
              </div>
              <div className="mt-8 flex flex-col space-y-6">
                <MobileNavItem label="Services" href="/services" onClick={() => setMobileMenuOpen(false)} />
                <MobileNavItem label="Portfolio" href="/portfolio" onClick={() => setMobileMenuOpen(false)} />
                <MobileNavItem label="About" href="/about" onClick={() => setMobileMenuOpen(false)} />
                <MobileNavItem label="Pricing" href="/pricing" onClick={() => setMobileMenuOpen(false)} />
                <div className="pt-4">
                  <Button 
                    asChild 
                    variant="outline" 
                    className="w-full justify-start border-gray-700 text-white hover:bg-white/10"
                  >
                    <Link to="/contact" onClick={() => setMobileMenuOpen(false)}>
                      Contact Us
                    </Link>
                  </Button>
                </div>
                <Button asChild className="bg-white text-black hover:bg-white/90">
                  <Link to="/get-quote" onClick={() => setMobileMenuOpen(false)}>
                    Get Started For Free
                  </Link>
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Badge */}
        {subtitle && (
          <div className="mx-auto mt-6 flex max-w-fit items-center justify-center space-x-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm">
            <span className="text-sm font-medium text-white">
              {subtitle}
            </span>
            <ArrowRight className="h-4 w-4 text-white" />
          </div>
        )}

        {/* Hero section */}
        <div className="container mx-auto mt-12 px-4 text-center">
          <h1 className="mx-auto max-w-4xl text-5xl font-bold leading-tight text-white md:text-6xl lg:text-7xl">
            {title}
          </h1>
          {description && (
            <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-300">
              {description}
            </p>
          )}
          <div className="mt-10 flex flex-col items-center justify-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
            <Button asChild className="bg-white text-black hover:bg-white/90">
              <Link to={ctaLink}>
                {ctaText}
              </Link>
            </Button>
            <Button 
              asChild 
              variant="outline" 
              className="border-gray-600 text-white hover:bg-white/10"
            >
              <Link to="/portfolio">
                View Our Work
              </Link>
            </Button>
          </div>

          {/* Hero Image Section */}
          <div className="relative mx-auto my-20 w-full max-w-6xl">
            <div className="absolute inset-0 rounded shadow-lg bg-white blur-[10rem] bg-grainy opacity-20" />

            {/* Use CMS background image if available, otherwise show placeholder */}
            {data.backgroundImage ? (
              <div className="relative w-full h-auto">
                {typeof data.backgroundImage === 'string' ? (
                  <img
                    src={data.backgroundImage}
                    alt="Hero showcase"
                    className="relative w-full h-auto shadow-md grayscale-100 rounded"
                  />
                ) : (
                  <img
                    src={data.backgroundImage.src}
                    srcSet={data.backgroundImage.srcset}
                    sizes={data.backgroundImage.sizes}
                    alt={data.backgroundImage.alt || "Hero showcase"}
                    width={data.backgroundImage.width}
                    height={data.backgroundImage.height}
                    className="relative w-full h-auto shadow-md grayscale-100 rounded"
                  />
                )}
              </div>
            ) : (
              <img
                src="https://kikxai.netlify.app/_next/image?url=%2Fassets%2Fhero-image.png&w=1920&q=75"
                alt="Hero showcase"
                className="relative w-full h-auto shadow-md grayscale-100 rounded"
              />
            )}
          </div>

          {/* Stats section if available from CMS */}
          {data.stats && data.stats.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto mt-16">
              {data.stats.map((stat, index) => (
                <div key={index} className="text-center transform hover:scale-105 transition-transform duration-300">
                  <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                    {stat.number}
                  </div>
                  <div className="text-white/80 text-sm md:text-base">
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

function NavItem({
  label,
  href,
}: {
  label: string;
  href: string;
}) {
  return (
    <Link
      to={href}
      className="flex items-center text-sm text-gray-300 hover:text-white transition-colors"
    >
      <span>{label}</span>
    </Link>
  );
}

function MobileNavItem({ 
  label, 
  href, 
  onClick 
}: { 
  label: string; 
  href: string; 
  onClick: () => void;
}) {
  return (
    <Link
      to={href}
      onClick={onClick}
      className="flex items-center justify-between border-b border-gray-800 pb-2 text-lg text-white"
    >
      <span>{label}</span>
      <ArrowRight className="h-4 w-4 text-gray-400" />
    </Link>
  );
}