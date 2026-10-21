import { Link, useNavigate } from 'react-router-dom';
import { HeartIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { formatPrice } from '../utils/helpers';
import StarRating from './StarRating';

const FALLBACK = 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&w=800&q=80';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const inWishlist = isInWishlist(product._id);
  const inStock = product.stock > 0;
  const image = product.images?.[0]?.url || FALLBACK;
  const isCommunity = product.listingSource === 'community';
  const sellerName = isCommunity ? product.communitySeller?.displayName : product.nursery?.name;
  const sellerTo = isCommunity
    ? `/community/sellers/${product.communitySeller?.slug || product.communitySeller?._id}`
    : `/nurseries/${product.nursery?.slug || product.nursery?._id}`;

  const handleAdd = async (event) => {
    event.preventDefault();
    if (!isAuthenticated) { navigate('/login'); return; }
    if (!inStock) return;
    await addToCart(product._id, 1);
  };

  const handleWish = async (event) => {
    event.preventDefault();
    if (!isAuthenticated) { navigate('/login'); return; }
    await toggleWishlist(product._id);
  };

  return (
    <article className="product-card group glass-panel rounded-[1.6rem] overflow-hidden flex flex-col">
      <div className="relative">
        <Link to={`/products/${product.slug || product._id}`} className="block aspect-[4/5] overflow-hidden bg-sage-100">
          <img src={image} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]" loading="lazy" />
        </Link>
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {isCommunity && <span className="badge bg-primary-700 text-white">Community Seller</span>}
          {!isCommunity && product.nursery && <span className="badge bg-white/90 text-primary-800">Nursery Seller</span>}
          {product.isBestSeller && <span className="badge bg-primary-700 text-white">Bestseller</span>}
          {product.isNewArrival && <span className="badge bg-sage-100 text-primary-800">New</span>}
          {product.discountPercent > 0 && <span className="badge bg-terracotta-500 text-white">{product.discountPercent}% off</span>}
        </div>
        <button onClick={handleWish} aria-label={inWishlist ? 'Remove from wishlist' : 'Save to wishlist'} className="absolute top-3 right-3 w-10 h-10 rounded-full glass flex items-center justify-center">
          {inWishlist ? <HeartSolid className="w-5 h-5 text-terracotta-500" /> : <HeartIcon className="w-5 h-5" />}
        </button>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-3 sm:p-4">
        {sellerName && (
          <Link to={sellerTo} className="truncate text-xs uppercase tracking-wide text-muted hover:text-primary-700">
            {sellerName}
          </Link>
        )}
        <Link to={`/products/${product.slug || product._id}`} className="font-medium leading-snug line-clamp-2 hover:text-primary-700">
          {product.name}
        </Link>
        {product.ratings?.count > 0 && (
          <StarRating rating={product.ratings.average} size="sm" showCount count={product.ratings.count} />
        )}
        <p className={`text-xs ${inStock ? 'text-primary-700' : 'text-terracotta-600'}`}>
          {inStock ? `${product.stock} in stock` : 'Unavailable'}
        </p>
        <div className="mt-auto flex items-end justify-between gap-2 pt-2">
          <div>
            <p className="font-semibold">{formatPrice(product.price)}</p>
            {product.mrp > product.price && <p className="text-xs text-muted line-through">{formatPrice(product.mrp)}</p>}
          </div>
          <button onClick={handleAdd} disabled={!inStock} className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-primary-700 px-3 text-sm text-white min-h-[40px] transition-colors hover:bg-primary-500 disabled:bg-line disabled:text-muted">
            <ShoppingBagIcon className="h-4 w-4" />
            Add
          </button>
        </div>
      </div>
    </article>
  );
}
