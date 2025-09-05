import { useState } from "react";
import { ArrowRight, Menu, X, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import logo from '@/assets/logo.png';

interface GlobalNavigationProps {
  /** Whether to use transparent overlay (for homepage) or solid background */
  overlay?: boolean;
}

export function GlobalNavigation({ overlay = false }: GlobalNavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Main navigation items
  const mainNavItems = [
    { label: "Services", href: "/services" },
    { label: "Portfolio", href: "/portfolio" },
    { label: "About", href: "/about" },
    { label: "Pricing", href: "/pricing" },
    { label: "Contact", href: "/contact" },
  ];

  // Solutions dropdown items
  const solutionsItems = [
    { label: "Insights", href: "/insights" },
    { label: "Case Studies", href: "/case-studies" },
    { label: "Innovation Lab", href: "/innovation-lab" },
  ];

  // Company dropdown items
  const companyItems = [
    { label: "Blog", href: "/blog" },
    { label: "Careers", href: "/careers" },
    { label: "FAQ", href: "/faq" },
  ];

  // All mobile menu items (flattened for mobile)
  const allMobileItems = [
    ...mainNavItems,
    { label: "Insights", href: "/insights" },
    { label: "Case Studies", href: "/case-studies" },
    { label: "Innovation Lab", href: "/innovation-lab" },
    { label: "Blog", href: "/blog" },
    { label: "Careers", href: "/careers" },
    { label: "FAQ", href: "/faq" },
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  const isSolutionsActive = solutionsItems.some(item => isActive(item.href));
  const isCompanyActive = companyItems.some(item => isActive(item.href));

  return (
    <div className={`relative ${overlay ? 'absolute inset-x-0 top-0 z-20' : 'relative z-10'}`}>
      {/* Background for non-overlay mode */}
      {!overlay && (
        <div className="absolute inset-0 bg-black">
          <div className="absolute inset-0 bg-noise opacity-30"></div>
        </div>
      )}

      {/* Gradient background for overlay mode */}
      {overlay && (
        <>
          <div className="flex flex-col items-end absolute -right-60 -top-10 blur-xl -z-10 ">
            <div className="h-[10rem] rounded-full w-[60rem] bg-gradient-to-b blur-[6rem] from-purple-600 to-sky-600"></div>
            <div className="h-[10rem] rounded-full w-[90rem] bg-gradient-to-b blur-[6rem] from-pink-900 to-yellow-400"></div>
            <div className="h-[10rem] rounded-full w-[60rem] bg-gradient-to-b blur-[6rem] from-yellow-600 to-sky-500"></div>
          </div>
          <div className="absolute inset-0 -z-10 bg-noise opacity-30"></div>
        </>
      )}

      {/* Navigation */}
      <nav className="container mx-auto flex items-center justify-between px-4 py-4 mt-6 relative z-10">
        <Link to="/" className="flex items-center">
          <img src={logo} alt="Devmart Logo" className="h-8 w-auto object-contain" />
          {!overlay && <span className="ml-2 text-xl font-bold text-white">Devmart</span>}
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center space-x-6">
          <div className="flex items-center space-x-6">
            {mainNavItems.map((item) => (
              <NavItem 
                key={item.href}
                label={item.label} 
                href={item.href} 
                active={isActive(item.href)}
              />
            ))}
            
            {/* Solutions Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center space-x-1 text-white hover:text-white/80 transition-colors">
                <span>Solutions</span>
                <ChevronDown className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-agenko-dark/95 border-agenko-green/20 backdrop-blur-sm">
                {solutionsItems.map((item) => (
                  <DropdownMenuItem key={item.href} asChild>
                    <Link 
                      to={item.href}
                      className={`text-white hover:text-white/80 ${isActive(item.href) ? 'bg-white/10' : ''}`}
                    >
                      {item.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Company Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center space-x-1 text-white hover:text-white/80 transition-colors">
                <span>Company</span>
                <ChevronDown className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-agenko-dark/95 border-agenko-green/20 backdrop-blur-sm">
                {companyItems.map((item) => (
                  <DropdownMenuItem key={item.href} asChild>
                    <Link 
                      to={item.href}
                      className={`text-white hover:text-white/80 ${isActive(item.href) ? 'bg-white/10' : ''}`}
                    >
                      {item.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button variant="hero" asChild>
              <Link to="/get-quote">Get Started</Link>
            </Button>
          </div>
        </div>

        {/* Mobile menu button */}
        <button
          className="lg:hidden"
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
            className="fixed inset-0 z-50 flex flex-col p-4 bg-black/95 lg:hidden"
          >
            <div className="flex items-center justify-between">
              <Link to="/" className="flex items-center" onClick={() => setMobileMenuOpen(false)}>
                <img src={logo} alt="Devmart Logo" className="h-8 w-auto object-contain" />
                {!overlay && <span className="ml-2 text-xl font-bold text-white">Devmart</span>}
              </Link>
              <button onClick={() => setMobileMenuOpen(false)}>
                <X className="h-6 w-6 text-white" />
              </button>
            </div>
            <div className="mt-8 flex flex-col space-y-6">
              {allMobileItems.map((item) => (
                <MobileNavItem 
                  key={item.href}
                  label={item.label} 
                  href={item.href} 
                  onClick={() => setMobileMenuOpen(false)}
                  active={isActive(item.href)}
                />
              ))}
              <div className="pt-4">
                <Button 
                  asChild 
                  variant="hero" 
                  className="w-full justify-start"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Link to="/get-quote" className="flex items-center">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface NavItemProps {
  label: string;
  href: string;
  active?: boolean;
}

function NavItem({ label, href, active }: NavItemProps) {
  return (
    <Link 
      to={href} 
      className={`text-white hover:text-white/80 transition-colors ${active ? 'font-semibold' : ''}`}
    >
      {label}
    </Link>
  );
}

interface MobileNavItemProps extends NavItemProps {
  onClick: () => void;
}

function MobileNavItem({ label, href, onClick, active }: MobileNavItemProps) {
  return (
    <Link 
      to={href} 
      onClick={onClick}
      className={`flex items-center justify-between text-white hover:text-white/80 transition-colors ${active ? 'font-semibold' : ''}`}
    >
      <span>{label}</span>
      <ArrowRight className="h-4 w-4" />
    </Link>
  );
}