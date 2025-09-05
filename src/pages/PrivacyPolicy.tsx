import { GlobalNavigation } from '@/components/GlobalNavigation';
import Footer from '@/components/Footer';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-agenko-dark">
      <GlobalNavigation overlay={false} />
      <div className="pt-24 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-agenko-white mb-4">Privacy Policy</h1>
          <p className="text-agenko-gray-light">Your privacy is important to us.</p>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;