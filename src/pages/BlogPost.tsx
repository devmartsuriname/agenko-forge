import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

const BlogPost = () => {
  return (
    <div className="min-h-screen bg-agenko-dark">
      <Navigation />
      <div className="pt-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-agenko-white mb-4">Blog Post</h1>
          <p className="text-agenko-gray-light">Coming soon...</p>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default BlogPost;