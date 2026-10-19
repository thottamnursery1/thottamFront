import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { productAPI, reviewAPI, nurseryAPI, enquiryAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';
import StarRating from '../components/StarRating';
import { PageSpinner } from '../components/Spinner';
import { formatPrice, formatDate } from '../utils/helpers';
import {
  ShoppingCartIcon, HeartIcon, MinusIcon, PlusIcon,
  CheckBadgeIcon, TruckIcon, ArrowLeftIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ rating: 5, title: '', comment: '' });
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [pin, setPin] = useState('');
  const [pinResult, setPinResult] = useState(null);
  const [pinLoading, setPinLoading] = useState(false);
  const [enquiry, setEnquiry] = useState('');
  const [sendingEnquiry, setSendingEnquiry] = useState(false);

  useEffect(() => {
    setLoading(true);
    productAPI.getOne(id)
      .then((res) => {
        setData(res.data);
        setSelectedVariant(res.data.product?.variants?.[0] || null);
      })
      .finally(() => setLoading(false));

    reviewAPI.getByProduct(id).then((r) => setReviews(r.data.reviews || [])).catch(() => {});
  }, [id]);

  if (loading) return <PageSpinner />;
  if (!data) return <div className="text-center py-20 text-gray-500">Product not found.</div>;

  const { product, related, fromNursery } = data;
  const inWishlist = isInWishlist(product._id);
  const effectivePrice = selectedVariant?.price || product.price;
  const effectiveStock = selectedVariant?.stock ?? product.stock;
  const inStock = effectiveStock > 0;

  const handleAddToCart = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    if (!inStock) return;
    await addToCart(product._id, quantity, selectedVariant?._id || null);
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    await addToCart(product._id, quantity, selectedVariant?._id || null);
    navigate('/checkout');
  };

  const handleWishlist = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    await toggleWishlist(product._id);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { navigate('/login'); return; }
    setSubmitting(true);
    try {
      await reviewAPI.add(product._id, newReview);
      toast.success('Review submitted!');
      setNewReview({ rating: 5, title: '', comment: '' });
      const r = await reviewAPI.getByProduct(product._id);
      setReviews(r.data.reviews || []);
    } finally {
      setSubmitting(false);
    }
  };

  const TABS = [
    { id: 'description', label: 'Description' },
    { id: 'care', label: 'Plant Care' },
    { id: 'reviews', label: `Reviews (${reviews.length})` },
  ];

  return (
    <div className="container-custom py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-primary-600">Home</Link>
        <span>/</span>
        <Link to="/products" className="hover:text-primary-600">Products</Link>
        <span>/</span>
        <span className="text-gray-800 truncate max-w-xs">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16">
        {/* Images */}
        <div className="space-y-3">
          <div className="aspect-square rounded-2xl overflow-hidden bg-gray-50">
            <img
              src={product.images?.[activeImage]?.url || 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=600'}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          {product.images?.length > 1 && (
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {product.images.map((img, i) => (
                <button key={i} onClick={() => setActiveImage(i)}
                  className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-colors ${
                    activeImage === i ? 'border-primary-500' : 'border-transparent'
                  }`}>
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product info */}
        <div>
          {product.category && (
            <Link to={`/products?category=${product.category.slug}`}
              className="text-sm text-primary-600 font-medium hover:underline">{product.category.name}</Link>
          )}
          <h1 className="text-3xl font-display text-gray-900 mt-2 mb-3">{product.name}</h1>
          {product.nursery?.name && (
            <div className="mb-4">
              <Link to={`/nurseries/${product.nursery.slug || product.nursery._id}`} className="text-sm text-primary-700 font-medium">
                Sold by {product.nursery.name}{product.nursery.address?.city ? ` · ${product.nursery.address.city}` : ''}
              </Link>
              {product.deliveryAvailability && <p className="text-sm text-muted mt-1">{product.deliveryAvailability}</p>}
              <form className="mt-3 flex flex-col sm:flex-row gap-2" onSubmit={async (event) => {
                event.preventDefault();
                if (!isAuthenticated) { navigate('/login'); return; }
                setSendingEnquiry(true);
                try {
                  const res = await enquiryAPI.create({ productId: product._id, message: enquiry });
                  toast.success(res.data.message);
                  setEnquiry('');
                } finally {
                  setSendingEnquiry(false);
                }
              }}>
                <input className="input" value={enquiry} onChange={(e) => setEnquiry(e.target.value)} placeholder="Ask this nursery a question" aria-label="Question for the nursery" />
                <button className="btn-outline" disabled={sendingEnquiry}>Send</button>
              </form>
            </div>
          )}

          {/* Rating */}
          {product.ratings?.count > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <StarRating rating={product.ratings.average} size="md" />
              <span className="text-sm text-gray-600">{product.ratings.average.toFixed(1)} ({product.ratings.count} reviews)</span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center gap-3 mb-5">
            <span className="text-3xl font-bold text-gray-900">{formatPrice(effectivePrice)}</span>
            {product.mrp && product.mrp > effectivePrice && (
              <>
                <span className="text-lg text-gray-400 line-through">{formatPrice(product.mrp)}</span>
                <span className="badge bg-terracotta-100 text-terracotta-600 text-sm">{product.discountPercent}% OFF</span>
              </>
            )}
          </div>

          {/* Short description */}
          {product.shortDescription && (
            <p className="text-gray-600 mb-5 leading-relaxed">{product.shortDescription}</p>
          )}

          {/* Plant info pills */}
          {product.plantInfo && (
            <div className="flex flex-wrap gap-2 mb-5">
              {product.plantInfo.sunlightRequirement !== 'N/A' && (
                <span className="bg-amber-50 text-amber-700 text-xs px-3 py-1.5 rounded-full">☀️ {product.plantInfo.sunlightRequirement}</span>
              )}
              {product.plantInfo.wateringFrequency !== 'N/A' && (
                <span className="bg-blue-50 text-blue-700 text-xs px-3 py-1.5 rounded-full">💧 {product.plantInfo.wateringFrequency}</span>
              )}
              {product.plantInfo.careLevel !== 'N/A' && (
                <span className="bg-green-50 text-green-700 text-xs px-3 py-1.5 rounded-full">🌱 {product.plantInfo.careLevel}</span>
              )}
              {product.plantInfo.petFriendly && (
                <span className="bg-pink-50 text-pink-700 text-xs px-3 py-1.5 rounded-full">🐾 Pet-Friendly</span>
              )}
              {product.plantInfo.airPurifying && (
                <span className="bg-teal-50 text-teal-700 text-xs px-3 py-1.5 rounded-full">🌬️ Air Purifying</span>
              )}
            </div>
          )}

          {/* Variants */}
          {product.variants?.length > 0 && (
            <div className="mb-5">
              <p className="text-sm font-medium text-gray-700 mb-2">Size / Variant:</p>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => (
                  <button key={v._id} onClick={() => setSelectedVariant(v)}
                    className={`px-4 py-2 rounded-lg text-sm border-2 font-medium transition-colors ${
                      selectedVariant?._id === v._id
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-200 text-gray-700 hover:border-primary-300'
                    } ${v.stock === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={v.stock === 0}>
                    {v.name} — {formatPrice(v.price)}
                    {v.stock === 0 && <span className="ml-1 text-xs text-red-500">(Out)</span>}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 mb-4">
            <input className="input max-w-[160px]" inputMode="numeric" placeholder="PIN code" value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))} aria-label="Delivery PIN code" />
            <button type="button" className="btn-outline py-2" disabled={pinLoading} onClick={async () => {
              setPinLoading(true);
              try {
                const res = await nurseryAPI.checkPin({ pin, nurseryId: product.nursery?._id });
                setPinResult(res.data);
              } finally { setPinLoading(false); }
            }}>Check delivery</button>
          </div>
          {pinResult && <p className={`text-sm mb-5 ${pinResult.ok ? 'text-primary-700' : 'text-terracotta-700'}`}>{pinResult.message}</p>}

          {/* Stock status */}
          <div className="flex items-center gap-2 mb-5">
            <div className={`w-2 h-2 rounded-full ${inStock ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className={`text-sm font-medium ${inStock ? 'text-green-600' : 'text-red-500'}`}>
              {inStock ? `In Stock (${effectiveStock} available)` : 'Out of Stock'}
            </span>
          </div>

          {/* Quantity selector */}
          {inStock && (
            <div className="flex items-center gap-3 mb-6">
              <span className="text-sm font-medium text-gray-700">Quantity:</span>
              <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 hover:bg-gray-50 transition-colors">
                  <MinusIcon className="w-4 h-4" />
                </button>
                <span className="px-4 py-2 text-sm font-semibold min-w-[3rem] text-center">{quantity}</span>
                <button onClick={() => setQuantity(Math.min(effectiveStock, quantity + 1))}
                  className="px-3 py-2 hover:bg-gray-50 transition-colors">
                  <PlusIcon className="w-4 h-4" />
                </button>
              </div>
              <span className="text-sm text-gray-500">Total: <strong>{formatPrice(effectivePrice * quantity)}</strong></span>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3 mb-6">
            <button onClick={handleAddToCart} disabled={!inStock}
              className="btn-primary flex-1 py-3">
              <ShoppingCartIcon className="w-5 h-5" />
              Add to Cart
            </button>
            <button onClick={handleBuyNow} disabled={!inStock}
              className="btn-terracotta flex-1 py-3">
              Buy Now
            </button>
            <button onClick={handleWishlist}
              className="p-3 border-2 border-gray-200 rounded-lg hover:border-red-300 transition-colors">
              {inWishlist ? <HeartSolid className="w-5 h-5 text-red-500" /> : <HeartIcon className="w-5 h-5 text-gray-500" />}
            </button>
          </div>

          {/* Trust signals */}
          <div className="space-y-2 border-t border-gray-100 pt-5">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <TruckIcon className="w-4 h-4 text-primary-500" />
              Free delivery on orders above ₹999
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <CheckBadgeIcon className="w-4 h-4 text-primary-500" />
              7-day plant health guarantee
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-card mb-12">
        <div className="flex border-b border-gray-100 overflow-x-auto scrollbar-hide">
          {TABS.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === 'description' && (
            <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed whitespace-pre-line">
              {product.description}
            </div>
          )}

          {activeTab === 'care' && product.plantInfo && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                ['☀️ Sunlight', product.plantInfo.sunlightRequirement],
                ['💧 Watering', product.plantInfo.wateringFrequency],
                ['🌱 Care Level', product.plantInfo.careLevel],
                ['🏠 Placement', product.plantInfo.indoorOutdoor],
                ['📏 Height', product.plantInfo.height],
                ['🪴 Pot Size', product.plantInfo.potSize],
                ['Soil', product.plantInfo.soil],
                ['Maintenance', product.plantInfo.maintenance],
              ].filter(([, v]) => v && v !== 'N/A').map(([label, val]) => (
                <div key={label} className="flex items-start gap-3">
                  <span className="text-2xl">{label.split(' ')[0]}</span>
                  <div>
                    <p className="text-xs text-gray-500">{label.includes(' ') ? label.slice(label.indexOf(' ') + 1) : label}</p>
                    <p className="text-sm font-medium text-gray-800">{val}</p>
                  </div>
                </div>
              ))}
              {product.plantInfo.careInstructions && (
                <div className="sm:col-span-2 bg-sage-50 rounded-xl p-4">
                  <p className="text-sm font-semibold text-gray-800 mb-1">Care Instructions</p>
                  <p className="text-sm text-gray-600 leading-relaxed">{product.plantInfo.careInstructions}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-6">
              {/* Review form */}
              <div className="bg-sage-50 rounded-xl p-5">
                <h4 className="font-semibold text-gray-900 mb-4">Write a Review</h4>
                <form onSubmit={handleReviewSubmit} className="space-y-3">
                  <div>
                    <label className="label">Rating</label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button key={n} type="button" onClick={() => setNewReview({ ...newReview, rating: n })}>
                          <svg className={`w-6 h-6 ${n <= newReview.rating ? 'text-yellow-400' : 'text-gray-200'}`}
                            fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </button>
                      ))}
                    </div>
                  </div>
                  <input type="text" placeholder="Review title (optional)" value={newReview.title}
                    onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
                    className="input text-sm" maxLength={100} />
                  <textarea rows={3} placeholder="Share your experience..." value={newReview.comment}
                    onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                    className="input text-sm resize-none" maxLength={1000} required />
                  <button type="submit" disabled={submitting} className="btn-primary text-sm py-2">
                    {submitting ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              </div>

              {/* Review list */}
              {reviews.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-8">No reviews yet. Be the first to review!</p>
              ) : (
                reviews.map((r) => (
                  <div key={r._id} className="border-b border-gray-100 pb-5">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900 text-sm">{r.user?.name}</span>
                          {r.isVerifiedPurchase && <span className="badge badge-green text-xs">✓ Verified</span>}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <StarRating rating={r.rating} size="sm" />
                          <span className="text-xs text-gray-400">{formatDate(r.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    {r.title && <p className="font-semibold text-gray-800 text-sm mb-1">{r.title}</p>}
                    <p className="text-sm text-gray-600 leading-relaxed">{r.comment}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {related?.length > 0 && (
        <section>
          <h2 className="section-title mb-6">You May Also Like</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {related.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        </section>
      )}
      {fromNursery?.length > 0 && (
        <section className="mt-12">
          <h2 className="section-title mb-6">More from this nursery</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {fromNursery.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}
