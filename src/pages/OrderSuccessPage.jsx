import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { orderAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import { formatPrice, formatDate } from '../utils/helpers';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

export default function OrderSuccessPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const { fetchCart } = useCart();

  useEffect(() => {
    orderAPI.getOne(id).then((r) => setOrder(r.data.order)).catch(() => {});
    // Re-sync cart from server so the badge reflects the cleared state
    // (backend already wiped it during payment verification)
    fetchCart();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="container-custom py-16 max-w-2xl mx-auto text-center">
      <CheckCircleIcon className="w-20 h-20 text-green-500 mx-auto mb-6" />
      <h1 className="text-3xl font-display font-bold text-gray-900 mb-3">Order Confirmed!</h1>
      <p className="text-gray-600 mb-8">
        Thank you for your order. We've received your payment and will begin processing your order shortly.
      </p>

      {order && (
        <div className="bg-white rounded-2xl shadow-card p-6 text-left mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-sm text-gray-500">Order Number</p>
              <p className="font-bold text-gray-900 text-lg">{order.orderNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Placed on</p>
              <p className="font-medium text-gray-700">{formatDate(order.createdAt)}</p>
            </div>
          </div>

          <div className="space-y-3 mb-4">
            {order.items?.map((item) => (
              <div key={item._id} className="flex items-center gap-3">
                <img src={item.image || 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=60'}
                  alt={item.name} className="w-12 h-12 object-cover rounded-lg"
                  onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=60'; }} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">{item.name}</p>
                  <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                </div>
                <span className="text-sm font-semibold">{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-100 pt-4">
            <div className="flex justify-between font-bold text-gray-900">
              <span>Total Paid</span>
              <span>{formatPrice(order.pricing?.totalAmount)}</span>
            </div>
            <div className="mt-2 text-sm text-gray-600 space-y-1">
              <p>📍 Delivering to: {order.shippingAddress?.fullName}, {order.shippingAddress?.city}, {order.shippingAddress?.state}</p>
              {order.needsCartonBox === false && <p>🌿 Carton box skipped. Essential plant protection is still included.</p>}
              {order.needsCartonBox === true && <p>📦 A carton box will be used, with essential plant protection inside.</p>}
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link to={`/orders/${id}`} className="btn-primary">Track Your Order</Link>
        <Link to="/orders" className="btn-outline">My Orders</Link>
        <Link to="/products" className="btn-ghost">Continue Shopping</Link>
      </div>
    </div>
  );
}
