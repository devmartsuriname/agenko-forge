import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

const TermsConditions = () => {
  return (
    <div className="min-h-screen bg-agenko-dark">
      <Navigation />
      <div className="pt-24 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-agenko-white mb-4">Terms & Conditions</h1>
          <p className="text-agenko-gray-light">By using our services, you agree to these terms.</p>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default TermsConditions;