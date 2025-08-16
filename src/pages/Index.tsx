import { SEOHead } from '@/lib/seo';
import heroImage from '@/assets/hero-image.jpg';
import { Button } from '@/components/ui/button';

const Index = () => {
  return (
    <>
      <SEOHead 
        title="Agenko Digital Agency - Innovative Marketing Solutions"
        description="A leading digital agency specializing in creative solutions that drive business growth, enhance brand visibility, and increase customer engagement."
        keywords={['digital marketing', 'web design', 'branding', 'business growth']}
      />
      <div className="min-h-screen bg-agenko-dark">
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center px-4">
          <div className="absolute inset-0">
            <img 
              src={heroImage} 
              alt="Professional team collaborating" 
              className="w-full h-full object-cover opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-agenko-dark/90 to-agenko-dark/70"></div>
          </div>
          
          <div className="relative z-10 max-w-6xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-agenko-white leading-tight mb-6">
              Agency For Growth Through<br />
              <span className="text-gradient">Innovative Marketing.</span>
            </h1>
            <p className="text-xl md:text-2xl text-agenko-gray-light max-w-3xl mx-auto mb-12">
              A digital marketing agency focused delivering innovative strategies to accelerate business growth, enhance brand visibility, and increase customer engagement, using data-driven approaches.
            </p>
            <Button variant="hero" size="lg" className="text-lg px-12 py-6">
              LET'S TALK
            </Button>
          </div>
        </section>
      </div>
    </>
  );
};

export default Index;
