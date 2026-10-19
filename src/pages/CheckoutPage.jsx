import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { paymentAPI, userAPI } from '../services/api';
import { formatPrice } from '../utils/helpers';
import { MapPinIcon, PlusIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import CartonBoxDialog from '../components/CartonBoxDialog';

const STATES = ['Andhra Pradesh','Assam','Bihar','Chhattisgarh','Delhi','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal'];

const emptyAddress = { fullName: '', phone: '', line1: '', line2: '', city: '', state: '', postalCode: '', country: 'India' };

export default function CheckoutPage() {
  const { cart, summary, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [address, setAddress] = useState(emptyAddress);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [useNewAddress, setUseNewAddress] = useState(true);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [cartonOpen, setCartonOpen] = useState(false);

  useEffect(() => {
    userAPI.getProfile().then((r) => {
      const addrs = r.data.user?.addresses || [];
      setSavedAddresses(addrs);
      if (addrs.length > 0) {
        const def = addrs.find((a) => a.isDefault) || addrs[0];
        setSelectedAddressId(def._id);
        setAddress(def);
        setUseNewAddress(false);
      }
    }).catch(() => {});
  }, []);

  const validate = () => {
    const errs = {};
    if (!address.fullName.trim()) errs.fullName = 'Full name is required';
    if (!/^[6-9]\d{9}$/.test(address.phone)) errs.phone = 'Enter a valid 10-digit mobile number';
    if (!address.line1.trim()) errs.line1 = 'Address is required';
    if (!address.city.trim()) errs.city = 'City is required';
    if (!address.state) errs.state = 'State is required';
    if (!/^\d{6}$/.test(address.postalCode)) errs.postalCode = 'Enter a valid 6-digit PIN code';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSelectAddress = (addr) => {
    setSelectedAddressId(addr._id);
    setAddress(addr);
    setUseNewAddress(false);
    setErrors({});
  };

  const loadRazorpayScript = () =>
    new Promise((resolve) => {
      if (document.getElementById('razorpay-script')) { resolve(true); return; }
      const script = document.createElement('script');
      script.id = 'razorpay-script';
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const openPackagingChoice = () => {
    if (!validate()) { toast.error('Please fix the errors before proceeding.'); return; }
    if (!cart.items?.length) { toast.error('Your cart is empty.'); return; }
    setCartonOpen(true);
  };

  const handlePay = async (needsCartonBox) => {
    if (needsCartonBox !== true && needsCartonBox !== false) {
      toast.error('Please choose whether you need a carton box.');
      setCartonOpen(true);
      return;
    }
    if (!validate()) { toast.error('Please fix the errors before proceeding.'); return; }
    if (!cart.items?.length) { toast.error('Your cart is empty.'); return; }

    setCartonOpen(false);
    setLoading(true);
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) { toast.error('Could not load payment gateway. Please try again.'); return; }

      const shippingAddress = {
        fullName: address.fullName,
        phone: address.phone,
        line1: address.line1,
        line2: address.line2,
        city: address.city,
        state: address.state,
        postalCode: address.postalCode,
        country: address.country,
      };

      const res = await paymentAPI.createOrder({ shippingAddress, couponCode: cart.couponCode, needsCartonBox });
      const { order, razorpayOrder, key } = res.data;

      const options = {
        key,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: 'Green Roots Nursery',
        description: `Order #${order.orderNumber}`,
        order_id: razorpayOrder.id,
        prefill: {
          name: user?.name,
          email: user?.email,
          contact: address.phone,
        },
        theme: { color: '#28623D' },
        handler: async (response) => {
          try {
            await paymentAPI.verify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: order._id,
            });
            // Clear the cart in the frontend context so the badge resets immediately
            try { await clearCart(); } catch { /* non-critical */ }
            navigate(`/order-success/${order._id}`);
          } catch {
            toast.error('Payment verification failed. Please contact support.');
            navigate(`/orders/${order._id}`);
          }
        },
        modal: {
          ondismiss: () => {
            toast('Payment cancelled. Your order is still saved.', { icon: 'ℹ️' });
            navigate(`/orders/${order._id}`);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (response) => {
        toast.error(`Payment failed: ${response.error.description}`);
        navigate(`/orders/${order._id}`);
      });
      rzp.open();
    } catch {
      // Error toast handled by API interceptor
    } finally {
      setLoading(false);
    }
  };

  const setAddr = (key, val) => setAddress((prev) => ({ ...prev, [key]: val }));

  return (
    <div className="container-custom py-8">
      <h1 className="text-3xl font-display font-bold text-gray-900 mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Delivery Address */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-card p-6">
            <h2 className="font-display font-semibold text-gray-900 mb-5 flex items-center gap-2">
              <MapPinIcon className="w-5 h-5 text-primary-500" /> Delivery Address
            </h2>

            {/* Saved addresses */}
            {savedAddresses.length > 0 && (
              <div className="space-y-3 mb-5">
                {savedAddresses.map((addr) => (
                  <label key={addr._id}
                    className={`flex gap-3 p-4 border-2 rounded-xl cursor-pointer transition-colors ${
                      selectedAddressId === addr._id && !useNewAddress ? 'border-primary-400 bg-primary-50' : 'border-gray-200 hover:border-primary-200'
                    }`}>
                    <input type="radio" name="address" checked={selectedAddressId === addr._id && !useNewAddress}
                      onChange={() => handleSelectAddress(addr)} className="mt-1" />
                    <div className="flex-1 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-800">{addr.fullName}</span>
                        <span className="badge badge-green text-xs">{addr.label}</span>
                        {addr.isDefault && <span className="badge bg-primary-100 text-primary-700 text-xs">Default</span>}
                      </div>
                      <p className="text-gray-600 mt-0.5">{addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}, {addr.city}, {addr.state} – {addr.postalCode}</p>
                      <p className="text-gray-500">📞 {addr.phone}</p>
                    </div>
                  </label>
                ))}
                <button onClick={() => { setUseNewAddress(true); setSelectedAddressId(null); setAddress(emptyAddress); }}
                  className={`flex items-center gap-2 p-4 border-2 border-dashed rounded-xl w-full text-sm text-gray-600 hover:border-primary-400 hover:text-primary-600 transition-colors ${useNewAddress ? 'border-primary-400 bg-primary-50 text-primary-600' : 'border-gray-200'}`}>
                  <PlusIcon className="w-4 h-4" /> Add New Address
                </button>
              </div>
            )}

            {/* New address form */}
            {(useNewAddress || savedAddresses.length === 0) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Full Name <span className="text-red-500">*</span></label>
                  <input value={address.fullName} onChange={(e) => setAddr('fullName', e.target.value)}
                    className={`input ${errors.fullName ? 'input-error' : ''}`} />
                  {errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName}</p>}
                </div>
                <div>
                  <label className="label">Phone Number <span className="text-red-500">*</span></label>
                  <input type="tel" value={address.phone} onChange={(e) => setAddr('phone', e.target.value)}
                    className={`input ${errors.phone ? 'input-error' : ''}`} />
                  {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label className="label">Address Line 1 <span className="text-red-500">*</span></label>
                  <input value={address.line1} onChange={(e) => setAddr('line1', e.target.value)}
                    className={`input ${errors.line1 ? 'input-error' : ''}`} />
                  {errors.line1 && <p className="text-xs text-red-500 mt-1">{errors.line1}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label className="label">Address Line 2 (optional)</label>
                  <input value={address.line2} onChange={(e) => setAddr('line2', e.target.value)}
                    className="input" />
                </div>
                <div>
                  <label className="label">City <span className="text-red-500">*</span></label>
                  <input value={address.city} onChange={(e) => setAddr('city', e.target.value)}
                    className={`input ${errors.city ? 'input-error' : ''}`} />
                  {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city}</p>}
                </div>
                <div>
                  <label className="label">State <span className="text-red-500">*</span></label>
                  <select value={address.state} onChange={(e) => setAddr('state', e.target.value)}
                    className={`input ${errors.state ? 'input-error' : ''}`}>
                    <option value="">Select State</option>
                    {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  {errors.state && <p className="text-xs text-red-500 mt-1">{errors.state}</p>}
                </div>
                <div>
                  <label className="label">PIN Code <span className="text-red-500">*</span></label>
                  <input value={address.postalCode} onChange={(e) => setAddr('postalCode', e.target.value)}
                    className={`input ${errors.postalCode ? 'input-error' : ''}`} />
                  {errors.postalCode && <p className="text-xs text-red-500 mt-1">{errors.postalCode}</p>}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Order summary */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl shadow-card p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Order Summary</h3>

            {/* Items */}
            <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
              {cart.items?.map((item) => (
                <div key={item._id} className="flex gap-2">
                  <img src={item.image || 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=60'}
                    alt={item.name} className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=60'; }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-800 line-clamp-1">{item.name}</p>
                    {item.nurseryName && <p className="text-xs text-muted">{item.nurseryName}</p>}
                    {item.variantName && <p className="text-xs text-gray-500">{item.variantName}</p>}
                    <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                  </div>
                  <span className="text-xs font-semibold text-gray-900 flex-shrink-0">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="space-y-2 text-sm border-t border-gray-100 pt-3">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span><span>{formatPrice(summary.subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery</span>
                <span className={summary.shippingCharge === 0 ? 'text-green-600' : ''}>
                  {summary.shippingCharge === 0 ? 'FREE' : formatPrice(summary.shippingCharge)}
                </span>
              </div>
              {summary.couponDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span><span>− {formatPrice(summary.couponDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-gray-900 text-base border-t border-gray-100 pt-2">
                <span>Total</span><span>{formatPrice(summary.totalAmount)}</span>
              </div>
            </div>

            <button onClick={openPackagingChoice} disabled={loading} className="btn-primary w-full mt-5 py-3">
              {loading ? 'Processing...' : `Pay ${formatPrice(summary.totalAmount)}`}
            </button>
            <p className="text-xs text-center text-muted mt-2">You&apos;ll choose packaging before payment.</p>

            <div className="mt-3 flex items-center justify-center gap-2 text-xs text-gray-400">
              <span>🔒</span> Secured by Razorpay
            </div>
          </div>
        </div>
      </div>
      <CartonBoxDialog
        open={cartonOpen}
        busy={loading}
        onClose={() => { if (!loading) setCartonOpen(false); }}
        onConfirm={handlePay}
      />
    </div>
  );
}
