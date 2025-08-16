import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-agenko-dark border-t border-agenko-dark-lighter">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand & Description */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-agenko-green rounded-full flex items-center justify-center">
                <span className="text-agenko-dark font-bold text-lg">A</span>
              </div>
              <span className="text-agenko-white font-heading font-bold text-xl">Agenko</span>
            </Link>
            <p className="text-agenko-gray-light text-sm mb-6 max-w-sm">
              Agenko creative digital agency delivering innovate web Development marketing.
            </p>
            <div className="flex items-center space-x-2">
              <Input
                type="email"
                placeholder="Email Address"
                className="bg-agenko-dark-lighter border-agenko-gray text-agenko-white placeholder:text-agenko-gray"
              />
              <Button variant="cta" size="sm">
                Subscribe
              </Button>
            </div>
          </div>

          {/* Main Address */}
          <div>
            <h3 className="text-agenko-white font-semibold mb-4">Main Address</h3>
            <div className="space-y-3 text-agenko-gray-light text-sm">
              <p>6801 Hollywood Blvd, Los Angeles, CA 90028</p>
            </div>
            <h4 className="text-agenko-white font-semibold mt-6 mb-3">Sub-Address</h4>
            <div className="space-y-3 text-agenko-gray-light text-sm">
              <p>200 Santa Monica Pier, Santa Monica, CA 90401</p>
            </div>
          </div>

          {/* Our Links */}
          <div>
            <h3 className="text-agenko-white font-semibold mb-4">Our Link</h3>
            <ul className="space-y-3 text-agenko-gray-light text-sm">
              <li><Link to="/about" className="hover:text-agenko-green transition-colors">About us</Link></li>
              <li><Link to="/services" className="hover:text-agenko-green transition-colors">Services</Link></li>
              <li><Link to="/portfolio" className="hover:text-agenko-green transition-colors">Our Project</Link></li>
              <li><Link to="/pricing" className="hover:text-agenko-green transition-colors">FAQ</Link></li>
              <li><Link to="/contact" className="hover:text-agenko-green transition-colors">Contact us</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-agenko-white font-semibold mb-4">Contact</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-agenko-gray-light text-sm">
                <Mail size={16} className="text-agenko-green" />
                <span>info@agenko.com</span>
              </div>
              <div className="flex items-center space-x-2 text-agenko-gray-light text-sm">
                <Phone size={16} className="text-agenko-green" />
                <span>+555-759-9854</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-agenko-dark-lighter mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-agenko-gray text-sm">
              © 2025 <span className="text-agenko-green">Agenko</span> - All Rights Reserved.
            </p>
            <div className="flex space-x-6 text-agenko-gray-light text-sm">
              <Link to="/terms-conditions" className="hover:text-agenko-green transition-colors">
                Terms & Condition
              </Link>
              <Link to="/privacy-policy" className="hover:text-agenko-green transition-colors">
                Privacy Policy
              </Link>
              <Link to="/contact" className="hover:text-agenko-green transition-colors">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;