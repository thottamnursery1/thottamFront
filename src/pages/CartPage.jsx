import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatPrice } from '../utils/helpers';
import { TrashIcon, MinusIcon, PlusIcon, ShoppingBagIcon, TagIcon } from '@heroicons/react/24/outline';

export default function CartPage() {
  const { cart, summary, loading, updateItem, removeItem, applyCoupon, removeCoupon } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [couponInput, setCouponInput] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  const handleCoupon = async (e) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    try { await applyCoupon(couponInput.trim()); setCouponInput(''); }
    finally { setCouponLoading(false); }
  };

  const handleCheckout = () => {
    if (!isAuthenticated) { navigate('/login', { state: { from: { pathname: '/checkout' } } }); return; }
    navigate('/checkout');
  };

  if (!isAuthenticated) {
    return (
      <div className="container-custom py-20 text-center">
        <ShoppingBagIcon className="w-16 h-16 text-gray-200 mx-auto mb-4" />
        <h2 className="text-2xl font-display font-semibold text-gray-800 mb-3">Your cart is empty</h2>
        <p className="text-gray-500 mb-6">Please login to view your cart.</p>
        <Link to="/login" className="btn-primary">Login</Link>
      </div>
    );
  }

  if (!loading && cart.items?.length === 0) {
    return (
      <div className="container-custom py-20 text-center">
        <ShoppingBagIcon className="w-16 h-16 text-gray-200 mx-auto mb-4" />
        <h2 className="text-2xl font-display font-semibold text-gray-800 mb-3">Your cart is empty</h2>
        <p className="text-gray-500 mb-6">Looks like you haven't added anything yet.</p>
        <Link to="/products" className="btn-primary">Start Shopping</Link>
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      <h1 className="text-3xl font-display font-bold text-gray-900 mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart items */}
        <div className="lg:col-span-2 space-y-6">
          {Object.entries((cart.items || []).reduce((groups, item) => {
            const key = item.nurseryName || 'Root & Bloom';
            groups[key] = groups[key] || [];
            groups[key].push(item);
            return groups;
          }, {})).map(([nurseryName, items]) => (
            <section key={nurseryName} className="space-y-3">
              <h2 className="text-sm uppercase tracking-[0.14em] text-muted">Ships from {nurseryName}</h2>
              {items.map((item) => (
            <div key={item._id} className="bg-white rounded-2xl shadow-card p-4 flex gap-4">
              <Link to={`/products/${item.product?.slug || item.product?._id || item.product}`}>
                <img
                  src={item.image || 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=200'}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded-xl flex-shrink-0"
                  onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=200'; }}
                />
              </Link>
              <div className="flex-1 min-w-0">
                <Link to={`/products/${item.product?.slug || item.product?._id || item.product}`}>
                  <h3 className="font-medium text-gray-900 text-sm hover:text-primary-600 transition-colors line-clamp-2">{item.name}</h3>
                </Link>
                {item.variantName && <p className="text-xs text-gray-500 mt-0.5">{item.variantName}</p>}
                <p className="font-semibold text-gray-900 mt-1">{formatPrice(item.price)}</p>
              </div>
              <div className="flex flex-col items-end gap-3">
                <button onClick={() => removeItem(item._id)} className="text-gray-400 hover:text-red-500 transition-colors p-1">
                  <TrashIcon className="w-4 h-4" />
                </button>
                <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                  <button onClick={() => updateItem(item._id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                    className="px-2 py-1.5 hover:bg-gray-50 disabled:opacity-40">
                    <MinusIcon className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-3 py-1.5 text-sm font-semibold min-w-[2rem] text-center">{item.quantity}</span>
                  <button onClick={() => updateItem(item._id, item.quantity + 1)}
                    className="px-2 py-1.5 hover:bg-gray-50">
                    <PlusIcon className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-sm font-semibold text-gray-900">{formatPrice(item.price * item.quantity)}</p>
              </div>
            </div>
              ))}
            </section>
          ))}
        </div>

        {/* Order summary */}
        <div className="space-y-4">
          {/* Coupon */}
          <div className="bg-white rounded-2xl shadow-card p-5">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <TagIcon className="w-5 h-5 text-primary-500" /> Apply Coupon
            </h3>
            {summary.couponCode ? (
              <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                <div>
                  <span className="text-sm font-semibold text-green-700">{summary.couponCode}</span>
                  <p className="text-xs text-green-600">You saved {formatPrice(summary.couponDiscount)}</p>
                </div>
                <button onClick={removeCoupon} className="text-xs text-red-500 hover:text-red-600 font-medium">Remove</button>
              </div>
            ) : (
              <form onSubmit={handleCoupon} className="flex gap-2">
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  placeholder="Enter coupon code"
                  className="input py-2 text-sm uppercase"
                />
                <button type="submit" disabled={couponLoading} className="btn-primary py-2 px-4 text-sm flex-shrink-0">
                  {couponLoading ? '...' : 'Apply'}
                </button>
              </form>
            )}
          </div>

          {/* Summary */}
          <div className="bg-white rounded-2xl shadow-card p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Order Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({summary.itemCount} items)</span>
                <span>{formatPrice(summary.subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery</span>
                <span className={summary.shippingCharge === 0 ? 'text-green-600 font-medium' : ''}>
                  {summary.shippingCharge === 0 ? 'FREE' : formatPrice(summary.shippingCharge)}
                </span>
              </div>
              {summary.couponDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Coupon Discount</span>
                  <span>− {formatPrice(summary.couponDiscount)}</span>
                </div>
              )}
              {summary.taxAmount > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>Tax ({summary.taxPercent}%)</span>
                  <span>{formatPrice(summary.taxAmount)}</span>
                </div>
              )}
              <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-gray-900 text-base">
                <span>Total</span>
                <span>{formatPrice(summary.totalAmount)}</span>
              </div>
            </div>

            {summary.shippingCharge > 0 && (
              <p className="text-xs text-gray-500 mt-2">
                Add {formatPrice(999 - summary.subtotal)} more to get free delivery.
              </p>
            )}

            <button onClick={handleCheckout} className="btn-primary w-full mt-5 py-3">
              Proceed to Checkout
            </button>
            <Link to="/products" className="block text-center text-sm text-primary-600 hover:underline mt-3">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
