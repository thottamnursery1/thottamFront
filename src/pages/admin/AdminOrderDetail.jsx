import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { orderAPI, adminAPI } from '../../services/api';
import { formatPrice, formatDate, getOrderStatusColor, orderStatusLabel, getPaymentStatusColor } from '../../utils/helpers';
import { PageSpinner } from '../../components/Spinner';
import { ArrowLeftIcon, TruckIcon, MapPinIcon, ReceiptRefundIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = ['confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

export default function AdminOrderDetail() {
  const { id } = useParams();
  const [order,         setOrder]         = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [statusForm,    setStatusForm]    = useState({ orderStatus: '', trackingNumber: '', trackingUrl: '' });
  const [updating,      setUpdating]      = useState(false);
  const [refundAmount,  setRefundAmount]  = useState('');
  const [refundReason,  setRefundReason]  = useState('');
  const [refunding,     setRefunding]     = useState(false);

  const load = () => {
    orderAPI.getOne(id).then((r) => {
      setOrder(r.data.order);
      setStatusForm({
        orderStatus:    r.data.order.orderStatus,
        trackingNumber: r.data.order.trackingNumber || '',
        trackingUrl:    r.data.order.trackingUrl    || '',
      });
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]); // eslint-disable-line

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const res = await adminAPI.updateOrderStatus(id, statusForm);
      setOrder(res.data.order);
      toast.success('Order status updated.');
    } finally { setUpdating(false); }
  };

  const handleRefund = async (e) => {
    e.preventDefault();
    if (!window.confirm(`Refund ₹${refundAmount || order.pricing.totalAmount} to customer?`)) return;
    setRefunding(true);
    try {
      const res = await adminAPI.initiateRefund(id, {
        amount: refundAmount ? Number(refundAmount) : undefined,
        reason: refundReason,
      });
      toast.success(res.data.message);
      const updated = await orderAPI.getOne(id);
      setOrder(updated.data.order);
      setRefundAmount('');
      setRefundReason('');
    } finally { setRefunding(false); }
  };

  if (loading) return <PageSpinner />;
  if (!order)  return <div className="card p-10 text-center text-sm text-gray-400">Order not found.</div>;

  return (
    <div className="space-y-5 max-w-5xl animate-fade-in">

      {/* Back + header */}
      <div>
        <Link to="/admin/orders" className="inline-flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-700 mb-4">
          <ArrowLeftIcon className="w-4 h-4" /> Back to Orders
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="page-title font-mono">{order.orderNumber}</h1>
            <p className="page-subtitle mt-0.5">Placed on {formatDate(order.createdAt)}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className={getOrderStatusColor(order.orderStatus)}>{orderStatusLabel(order.orderStatus)}</span>
            <span className={getPaymentStatusColor(order.paymentStatus)}>{order.paymentStatus.replace(/_/g, ' ')}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* ── Left column ─────────────────────────────── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Items */}
          <div className="card overflow-hidden">
            <div className="panel-header">
              <p className="panel-title">Order Items</p>
              <span className="text-xs text-gray-400">{order.items?.length} item{order.items?.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="p-5 space-y-4">
              {order.items?.map((item) => (
                <div key={item._id} className="flex gap-4">
                  <img
                    src={item.image || 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=80'}
                    alt={item.name}
                    className="w-14 h-14 object-cover rounded-xl flex-shrink-0 border border-gray-100"
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=80'; }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm">{item.name}</p>
                    {item.variantName && <p className="text-xs text-gray-400 mt-0.5">{item.variantName}</p>}
                    <p className="text-xs text-gray-500 mt-0.5">Qty {item.quantity} × {formatPrice(item.price)}</p>
                  </div>
                  <span className="font-semibold text-gray-900 text-sm flex-shrink-0">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            {/* Pricing */}
            <div className="border-t border-gray-100 mx-5 pb-5 pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>{formatPrice(order.pricing?.subtotal)}</span></div>
              <div className="flex justify-between text-gray-500">
                <span>Delivery</span>
                <span>{order.pricing?.shippingCharge === 0 ? 'FREE' : formatPrice(order.pricing?.shippingCharge)}</span>
              </div>
              {order.pricing?.couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-600"><span>Discount</span><span>− {formatPrice(order.pricing.couponDiscount)}</span></div>
              )}
              <div className="flex justify-between font-bold text-gray-900 text-base pt-2 border-t border-gray-100">
                <span>Total</span><span>{formatPrice(order.pricing?.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Customer & address */}
          <div className="card p-5 space-y-5">
            <div>
              <p className="section-label mb-3">Customer</p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {order.user?.name?.charAt(0)?.toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-sm text-gray-900">{order.user?.name}</p>
                  <p className="text-xs text-gray-400">{order.user?.email}</p>
                  {order.user?.phone && <p className="text-xs text-gray-400">{order.user.phone}</p>}
                </div>
              </div>
            </div>
            <div className="border-t border-gray-100 pt-4">
              <p className="section-label mb-3 flex items-center gap-2">
                <MapPinIcon className="w-3.5 h-3.5" /> Delivery Address
              </p>
              <div className="text-sm text-gray-700 space-y-0.5">
                <p className="font-medium">{order.shippingAddress?.fullName}</p>
                <p className="text-gray-500">{order.shippingAddress?.line1}{order.shippingAddress?.line2 ? `, ${order.shippingAddress.line2}` : ''}</p>
                <p className="text-gray-500">{order.shippingAddress?.city}, {order.shippingAddress?.state} – {order.shippingAddress?.postalCode}</p>
                <p className="text-gray-500">📞 {order.shippingAddress?.phone}</p>
              </div>
            </div>
            {/* Packaging */}
            {(order.needsCartonBox === true || order.needsCartonBox === false) && (
              <div className="border-t border-gray-100 pt-4">
                <p className="section-label mb-2">Packaging</p>
                <p className="text-sm text-gray-600">
                  {order.needsCartonBox ? '📦 Carton box requested.' : '🌿 Carton box skipped.'}
                  {' '}Essential plant protection stays with the order.
                </p>
              </div>
            )}
            {/* Payment IDs */}
            {order.razorpayPaymentId && (
              <div className="border-t border-gray-100 pt-4">
                <p className="section-label mb-2">Payment Reference</p>
                <div className="text-xs text-gray-400 font-mono space-y-0.5">
                  <p>Order ID: {order.razorpayOrderId}</p>
                  <p>Payment ID: {order.razorpayPaymentId}</p>
                </div>
              </div>
            )}
          </div>

          {/* Refund history */}
          {order.refunds?.length > 0 && (
            <div className="card overflow-hidden">
              <div className="panel-header">
                <p className="panel-title flex items-center gap-2"><ReceiptRefundIcon className="w-4 h-4" /> Refunds</p>
              </div>
              <ul className="divide-y divide-gray-50">
                {order.refunds.map((r, i) => (
                  <li key={i} className="flex items-start justify-between gap-3 px-5 py-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{formatPrice(r.amount)}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{r.reason}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{formatDate(r.createdAt)}</p>
                    </div>
                    <span className={`badge text-xs ${r.status === 'processed' ? 'badge-green' : r.status === 'failed' ? 'badge-red' : 'badge-orange'}`}>
                      {r.status}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* ── Right column ────────────────────────────── */}
        <div className="space-y-4">

          {/* Update status */}
          <div className="card p-5">
            <p className="panel-title flex items-center gap-2 mb-4">
              <TruckIcon className="w-4 h-4 text-primary-500" /> Update Status
            </p>
            <form onSubmit={handleStatusUpdate} className="space-y-3">
              <div className="field">
                <label className="label">Order Status</label>
                <select
                  value={statusForm.orderStatus}
                  onChange={(e) => setStatusForm({ ...statusForm, orderStatus: e.target.value })}
                  className="input text-sm"
                >
                  {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{orderStatusLabel(s)}</option>)}
                </select>
              </div>
              <div className="field">
                <label className="label">Tracking Number</label>
                <input
                  value={statusForm.trackingNumber}
                  onChange={(e) => setStatusForm({ ...statusForm, trackingNumber: e.target.value })}
                  className="input text-sm" placeholder="Optional"
                />
              </div>
              <div className="field">
                <label className="label">Tracking URL</label>
                <input
                  value={statusForm.trackingUrl}
                  onChange={(e) => setStatusForm({ ...statusForm, trackingUrl: e.target.value })}
                  className="input text-sm" placeholder="https://…" type="url"
                />
              </div>
              <button type="submit" disabled={updating} className="btn-primary w-full">
                {updating ? 'Updating…' : 'Update Status'}
              </button>
            </form>
          </div>

          {/* Initiate refund */}
          {order.paymentStatus === 'paid' && (
            <div className="card p-5">
              <p className="panel-title flex items-center gap-2 mb-4">
                <ReceiptRefundIcon className="w-4 h-4 text-amber-500" /> Initiate Refund
              </p>
              <form onSubmit={handleRefund} className="space-y-3">
                <div className="field">
                  <label className="label">Amount (₹) — leave empty for full</label>
                  <input
                    type="number" step="0.01" min="0" max={order.pricing.totalAmount}
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(e.target.value)}
                    className="input text-sm"
                    placeholder={`Max ₹${order.pricing.totalAmount}`}
                  />
                </div>
                <div className="field">
                  <label className="label">Reason *</label>
                  <textarea
                    value={refundReason}
                    onChange={(e) => setRefundReason(e.target.value)}
                    className="input text-sm resize-none" rows={2}
                    placeholder="Refund reason" required
                  />
                </div>
                <button type="submit" disabled={refunding} className="btn-terracotta w-full">
                  {refunding ? 'Processing…' : 'Initiate Refund'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
