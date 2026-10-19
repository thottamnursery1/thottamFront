import { useWishlist } from '../context/WishlistContext';
import ProductCard from '../components/ProductCard';
import { Link } from 'react-router-dom';
import { HeartIcon } from '@heroicons/react/24/outline';

export default function WishlistPage() {
  const { wishlist } = useWishlist();

  return (
    <div className="container-custom py-8">
      <h1 className="text-3xl font-display font-bold text-gray-900 mb-8">My Wishlist</h1>

      {wishlist.length === 0 ? (
        <div className="text-center py-20">
          <HeartIcon className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Your wishlist is empty</h3>
          <p className="text-gray-500 mb-6">Save your favourite plants and come back to them anytime.</p>
          <Link to="/products" className="btn-primary">Explore Plants</Link>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-6">{wishlist.length} item{wishlist.length !== 1 ? 's' : ''}</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {wishlist.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
