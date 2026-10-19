import { Link, useLocation } from 'react-router-dom';
import { HeartIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';
import { useCart } from '../context/CartContext';

export default function FloatingCart() {
  const { itemCount } = useCart();
  const { pathname } = useLocation();
  if (pathname.startsWith('/admin') || pathname.startsWith('/seller') || pathname.startsWith('/checkout')) return null;

  return (
    <div className="fixed bottom-5 right-4 z-40 flex flex-col gap-2">
      <Link to="/wishlist" className="glass-panel w-12 h-12 rounded-full flex items-center justify-center text-primary-700" aria-label="Wishlist">
        <HeartIcon className="w-5 h-5" />
      </Link>
      <Link to="/cart" className="glass-panel relative w-14 h-14 rounded-full flex items-center justify-center text-primary-700" aria-label={`Cart, ${itemCount} items`}>
        <ShoppingBagIcon className="w-6 h-6" />
        {itemCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full bg-primary-700 text-white text-[10px] font-bold flex items-center justify-center">
            {itemCount}
          </span>
        )}
      </Link>
    </div>
  );
}
