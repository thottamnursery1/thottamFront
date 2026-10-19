import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { sellerAPI } from '../../services/api';
import { formatDate, formatPrice } from '../../utils/helpers';
import { ShoppingBagIcon, FunnelIcon } from '@heroicons/react/24/outline';

const FULFILLMENT_OPTIONS = ['', 'pending', 'processing', 'dispatched', 'delivered'];

const FULFILLMENT_BADGE = {
  pending:    'bg-amber-100 text-amber-700',
  processing: 'bg-blue-100 text-blue-700',
  dispatched: 'bg-purple-100 text-purple-700',
  delivered:  'bg-emerald-100 text-emerald-800',
  cancelled:  'bg-red-100 text-red-700',
};

export default function SellerOrders() {
  const [orders,      setOrders]      = useState([]);
  const [fulfillment, setFulfillment] = useState('');
  const [loading,     setLoading]     = useState(true);

  const load = (status = fulfillment) => {
    setLoading(true);
    sellerAPI.orders(status ? { fulfillment: status } : {})
      .then((res) => setOrders(res.data.orders))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []); // eslint-disable-line

  return (
    <div className="space-y-5 animate-fade-in">

      <div className="page-header">
        <div>
          <h1 className="page-title">Orders</h1>
          <p className="page-subtitle">Manage and fulfil your nursery's orders</p>
        </div>
      </div>

      {/* Filter */}
      <div className="card p-4 flex flex-wrap items-center gap-2">
        <FunnelIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
        {FULFILLMENT_OPTIONS.map((s) => (
          <button
            key={s}
            onClick={() => { setFulfillment(s); load(s); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize ${
              fulfillment === s
                ? 'bg-primary-700 text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {s || 'All'}
          </button>
        ))}
      </div>

      {/* Orders */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 skeleton rounded-[14px]" />)}
        </div>
      ) : orders.length === 0 ? (
        <div className="card">
          <div className="empty-state py-16">
            <ShoppingBagIcon className="w-10 h-10 text-gray-300 mb-3" />
            <p className="text-sm font-semibold text-gray-600 mb-1">No orders yet</p>
            <p className="text-xs text-gray-400">Orders for your nursery will appear here.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Link
              key={order._id}
              to={`/seller/orders/${order._id}`}
              className="card p-4 flex flex-col sm:flex-row sm:items-center gap-3 hover:shadow-card-hover transition-shadow group"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="font-mono text-sm font-semibold text-gray-900 group-hover:text-primary-700 transition-colors">
                    {order.orderNumber}
                  </span>
                  <span className={`badge text-xs ${FULFILLMENT_BADGE[order.fulfillment?.fulfillmentStatus] || 'bg-gray-100 text-gray-600'} capitalize`}>
                    {order.fulfillment?.fulfillmentStatus || 'pending'}
                  </span>
                  {order.needsCartonBox === true  && <span className="badge bg-amber-50 text-amber-700 text-xs">📦 Carton</span>}
                  {order.needsCartonBox === false && <span className="badge bg-primary-50 text-primary-700 text-xs">🌿 No carton</span>}
                </div>
                <p className="text-sm text-gray-500">
                  {order.shippingAddress?.fullName}
                  {order.shippingAddress?.city && ` · ${order.shippingAddress.city}`}
                </p>
              </div>
              <div className="flex items-center gap-4 flex-shrink-0">
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{formatPrice(order.fulfillment?.subtotal || 0)}</p>
                  <p className="text-xs text-gray-400">{formatDate(order.createdAt)}</p>
                </div>
                <span className="text-gray-300 group-hover:text-primary-500 transition-colors text-lg">→</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
