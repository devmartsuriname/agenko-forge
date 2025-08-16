import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { SEOHead } from '@/lib/seo';

const Contact = () => {
  return (
    <>
      <SEOHead title="Contact Us - Agenko Digital Agency" />
      <div className="min-h-screen bg-agenko-dark">
        <Navigation />
        <section className="py-32 px-4 pt-24">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-agenko-white mb-6">
              Let's <span className="text-gradient">Talk</span>
            </h1>
            <p className="text-xl text-agenko-gray-light mb-12">
              Ready to start your project? Get in touch with us today.
            </p>
            <Button variant="hero" size="lg">
              Contact Form Coming Soon
            </Button>
          </div>
        </section>
        <Footer />
      </div>
    </>
  );
};

export default Contact;