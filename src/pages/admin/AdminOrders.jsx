import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import {
  formatPrice, formatDate, getOrderStatusColor,
  orderStatusLabel, getPaymentStatusColor,
} from '../../utils/helpers';
import Pagination from '../../components/Pagination';
import { PageSpinner } from '../../components/Spinner';
import { FunnelIcon, ShoppingBagIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

const STATUS_OPTIONS  = ['', 'pending_payment', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
const PAYMENT_OPTIONS = ['', 'pending', 'paid', 'failed', 'refunded', 'partially_refunded'];

function EmptyState() {
  return (
    <div className="empty-state py-20">
      <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
        <ShoppingBagIcon className="w-7 h-7 text-gray-400" />
      </div>
      <p className="text-gray-700 font-semibold text-sm mb-1">No orders found</p>
      <p className="text-xs text-gray-400">Try adjusting the filters or check back later.</p>
    </div>
  );
}

export default function AdminOrders() {
  const [params, setParams] = useSearchParams();
  const [orders,     setOrders]     = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading,    setLoading]    = useState(true);

  const status        = params.get('status')        || '';
  const paymentStatus = params.get('paymentStatus') || '';
  const page          = Number(params.get('page'))  || 1;

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const query = { page, limit: 20 };
      if (status)        query.status        = status;
      if (paymentStatus) query.paymentStatus = paymentStatus;
      const res = await adminAPI.getOrders(query);
      setOrders(res.data.orders);
      setPagination(res.data.pagination);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, [page, status, paymentStatus]); // eslint-disable-line

  const setFilter = (key, val) => {
    const next = new URLSearchParams(params);
    if (val) next.set(key, val); else next.delete(key);
    next.set('page', '1');
    setParams(next);
  };

  const clearFilters = () => {
    setParams({});
  };

  const hasFilters = status || paymentStatus;

  return (
    <div className="space-y-5 animate-fade-in">

      {/* ── Page header ──────────────────────────────────── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Orders</h1>
          <p className="page-subtitle">
            {pagination.total.toLocaleString()} order{pagination.total !== 1 ? 's' : ''} total
          </p>
        </div>
      </div>

      {/* ── Filter bar ───────────────────────────────────── */}
      <div className="card overflow-hidden">
        <div className="filter-bar">
          <FunnelIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />

          <select
            value={status}
            onChange={(e) => setFilter('status', e.target.value)}
            className="filter-select"
            aria-label="Filter by order status"
          >
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.slice(1).map((s) => (
              <option key={s} value={s}>{orderStatusLabel(s)}</option>
            ))}
          </select>

          <select
            value={paymentStatus}
            onChange={(e) => setFilter('paymentStatus', e.target.value)}
            className="filter-select"
            aria-label="Filter by payment status"
          >
            <option value="">All Payments</option>
            {PAYMENT_OPTIONS.slice(1).map((s) => (
              <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
            ))}
          </select>

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="btn-ghost gap-1.5 text-xs py-1.5 px-3 ml-auto"
            >
              <ArrowPathIcon className="w-3.5 h-3.5" /> Clear
            </button>
          )}

          {hasFilters && (
            <span className="text-xs text-gray-400 ml-1">
              Filtering by: {[status && orderStatusLabel(status), paymentStatus].filter(Boolean).join(', ')}
            </span>
          )}
        </div>

        {/* ── Table ─────────────────────────────────────── */}
        {loading ? (
          <div className="py-16"><PageSpinner /></div>
        ) : orders.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th className="text-center">Items</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Payment</th>
                  <th>Date</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o._id}>
                    <td>
                      <span className="font-mono text-xs font-semibold text-gray-900">{o.orderNumber}</span>
                    </td>
                    <td>
                      <p className="font-medium text-gray-800 text-sm">{o.user?.name || '—'}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{o.user?.email}</p>
                    </td>
                    <td className="text-center text-gray-600">{o.items?.length || 0}</td>
                    <td className="font-semibold text-gray-900">{formatPrice(o.pricing?.totalAmount)}</td>
                    <td>
                      <span className={getOrderStatusColor(o.orderStatus)}>{orderStatusLabel(o.orderStatus)}</span>
                    </td>
                    <td>
                      <span className={getPaymentStatusColor(o.paymentStatus)}>
                        {o.paymentStatus.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="text-xs text-gray-400 whitespace-nowrap">{formatDate(o.createdAt)}</td>
                    <td>
                      <Link
                        to={`/admin/orders/${o._id}`}
                        className="text-xs font-medium text-primary-600 hover:text-primary-700"
                      >
                        View →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Pagination ────────────────────────────────────── */}
      {!loading && pagination.pages > 1 && (
        <Pagination
          page={pagination.page}
          pages={pagination.pages}
          onPageChange={(p) => setFilter('page', String(p))}
        />
      )}
    </div>
  );
}
