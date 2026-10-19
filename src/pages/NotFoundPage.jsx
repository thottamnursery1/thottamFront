import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 text-center">
      <div>
        <div className="text-8xl mb-6">🪴</div>
        <h1 className="text-5xl font-display font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-3">Page Not Found</h2>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">
          Looks like this page has wilted away. Let's get you back to the garden.
        </p>
        <div className="flex gap-4 justify-center">
          <Link to="/" className="btn-primary">Go Home</Link>
          <Link to="/products" className="btn-outline">Browse Plants</Link>
        </div>
      </div>
    </div>
  );
}
