import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { orderAPI } from '../services/api';
import { formatPrice, formatDate, getOrderStatusColor, orderStatusLabel, getPaymentStatusColor } from '../utils/helpers';
import Pagination from '../components/Pagination';
import { PageSpinner } from '../components/Spinner';
import { ShoppingBagIcon } from '@heroicons/react/24/outline';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  const fetchOrders = async (page = 1) => {
    setLoading(true);
    try {
      const res = await orderAPI.getMyOrders({ page, limit: 10 });
      setOrders(res.data.orders);
      setPagination(res.data.pagination);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  if (loading) return <PageSpinner />;

  return (
    <div className="container-custom py-8 max-w-4xl">
      <h1 className="text-3xl font-display font-bold text-gray-900 mb-8">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <ShoppingBagIcon className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No orders yet</h3>
          <p className="text-gray-500 mb-6">Start shopping to see your orders here.</p>
          <Link to="/products" className="btn-primary">Shop Now</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="bg-white rounded-2xl shadow-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Order Number</p>
                  <p className="font-bold text-gray-900">{order.orderNumber}</p>
                  <p className="text-xs text-gray-500 mt-1">{formatDate(order.createdAt)}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className={getOrderStatusColor(order.orderStatus)}>
                    {orderStatusLabel(order.orderStatus)}
                  </span>
                  <span className={getPaymentStatusColor(order.paymentStatus)}>
                    {order.paymentStatus.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>

              {/* Items preview */}
              <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide pb-1">
                {order.items?.slice(0, 4).map((item) => (
                  <img key={item._id}
                    src={item.image || 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=60'}
                    alt={item.name}
                    className="w-14 h-14 object-cover rounded-lg flex-shrink-0 border border-gray-100"
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=60'; }}
                    title={item.name}
                  />
                ))}
                {order.items?.length > 4 && (
                  <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center text-xs text-gray-500 flex-shrink-0">
                    +{order.items.length - 4}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm text-gray-500">{order.items?.length} item{order.items?.length !== 1 ? 's' : ''}</span>
                  <span className="font-bold text-gray-900 ml-3">{formatPrice(order.pricing?.totalAmount)}</span>
                </div>
                <Link to={`/orders/${order._id}`} className="btn-outline py-2 text-sm">View Details</Link>
              </div>
            </div>
          ))}

          <div className="mt-6">
            <Pagination page={pagination.page} pages={pagination.pages} onPageChange={fetchOrders} />
          </div>
        </div>
      )}
    </div>
  );
}
