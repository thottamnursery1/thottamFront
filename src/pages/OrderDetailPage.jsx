import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { orderAPI, communityAPI } from '../services/api';
import { formatPrice, formatDate, getOrderStatusColor, orderStatusLabel, getPaymentStatusColor } from '../utils/helpers';
import { PageSpinner } from '../components/Spinner';
import {
  CheckCircleIcon, ClockIcon, TruckIcon, HomeIcon, XCircleIcon,
  MapPinIcon, ArrowLeftIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';

// Each step: key matches orderStatus, label and icon for display
const STEPS = [
  { key: 'confirmed',  label: 'Order Confirmed',  icon: CheckCircleIcon,  desc: 'Your order has been placed and confirmed.' },
  { key: 'processing', label: 'Processing',        icon: ClockIcon,        desc: 'Your plants are being carefully packed.' },
  { key: 'shipped',    label: 'Shipped',           icon: TruckIcon,        desc: 'Your order is on its way.' },
  { key: 'delivered',  label: 'Delivered',         icon: HomeIcon,         desc: 'Your order has been delivered.' },
];

// Estimated days from order creation per status
const EST_DAYS = { confirmed: '1–2', processing: '2–4', shipped: '4–7', delivered: null };

function estimatedDelivery(createdAt) {
  const base = new Date(createdAt);
  const low  = new Date(base); low.setDate(base.getDate() + 4);
  const high = new Date(base); high.setDate(base.getDate() + 7);
  const fmt  = (d) => d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  return `${fmt(low)} – ${fmt(high)}`;
}

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    orderAPI.getOne(id)
      .then((r) => setOrder(r.data.order))
      .finally(() => setLoading(false));
  }, [id]);

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    setCancelling(true);
    try {
      const res = await orderAPI.cancel(id, 'Cancelled by customer');
      setOrder(res.data.order);
      toast.success('Order cancelled successfully.');
    } catch {
      // error toast handled by API interceptor
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return <PageSpinner />;
  if (!order)  return <div className="container-custom py-20 text-center text-gray-500">Order not found.</div>;

  const isCancelled     = order.orderStatus === 'cancelled';
  const isPendingPayment = order.orderStatus === 'pending_payment';
  const canCancel       = ['confirmed', 'processing'].includes(order.orderStatus);
  const currentStep     = STEPS.findIndex((s) => s.key === order.orderStatus);
  const showTracker     = !isCancelled && !isPendingPayment;

  return (
    <div className="container-custom py-8 max-w-3xl">

      {/* Back link */}
      <Link to="/orders" className="inline-flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-700 mb-6">
        <ArrowLeftIcon className="w-4 h-4" /> Back to My Orders
      </Link>

      {/* ── Header card ─────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-card p-6 mb-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Order</p>
            <h1 className="text-xl font-display font-bold text-gray-900">{order.orderNumber}</h1>
            <p className="text-sm text-gray-500 mt-1">Placed on {formatDate(order.createdAt)}</p>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <span className={getOrderStatusColor(order.orderStatus)}>{orderStatusLabel(order.orderStatus)}</span>
            <span className={getPaymentStatusColor(order.paymentStatus)}>
              {order.paymentStatus.replace(/_/g, ' ')}
            </span>
            {canCancel && (
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="text-sm text-red-500 hover:text-red-600 font-medium border border-red-200 px-3 py-1 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-60"
              >
                {cancelling ? 'Cancelling…' : 'Cancel Order'}
              </button>
            )}
            {order.paymentStatus === 'paid' && (
              <button
                type="button"
                className="text-sm text-primary-700 border border-line px-3 py-1 rounded-lg"
                onClick={async () => {
                  const details = window.prompt('Describe the damaged or incorrect plant.');
                  if (!details) return;
                  await communityAPI.report({ orderId: order._id, reason: 'damaged', details });
                  toast.success('Report sent. Refunds are reviewed by Thottam.');
                }}
              >
                Report a plant
              </button>
            )}
          </div>
        </div>

        {/* ── Cancelled banner ── */}
        {isCancelled && (
          <div className="mt-5 flex items-start gap-3 bg-red-50 border border-red-100 rounded-xl p-4">
            <XCircleIcon className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-700">This order was cancelled</p>
              {order.cancellationReason && (
                <p className="text-xs text-red-500 mt-0.5">{order.cancellationReason}</p>
              )}
            </div>
          </div>
        )}

        {/* ── Pending payment banner ── */}
        {isPendingPayment && (
          <div className="mt-5 flex items-start gap-3 bg-yellow-50 border border-yellow-100 rounded-xl p-4">
            <ClockIcon className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-yellow-700">Payment is pending. Complete the payment to confirm your order.</p>
          </div>
        )}

        {/* ── Progress tracker ── */}
        {showTracker && (
          <div className="mt-6">
            {/* Step circles + connector line */}
            <div className="relative flex items-start justify-between">
              {/* Background connector */}
              <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 z-0" aria-hidden="true">
                <div
                  className="h-full bg-primary-500 transition-all duration-500"
                  style={{ width: currentStep >= 0 ? `${(currentStep / (STEPS.length - 1)) * 100}%` : '0%' }}
                />
              </div>

              {STEPS.map((step, i) => {
                const done    = i < currentStep;
                const active  = i === currentStep;
                const Icon    = step.icon;
                return (
                  <div key={step.key} className="relative z-10 flex flex-col items-center flex-1">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-colors ${
                        done   ? 'bg-primary-500 border-primary-500 text-white'
                        : active ? 'bg-white border-primary-500 text-primary-600'
                        :          'bg-white border-gray-200 text-gray-300'
                      }`}
                      aria-label={`${step.label}: ${done ? 'completed' : active ? 'current' : 'pending'}`}
                    >
                      {done
                        ? <CheckCircleSolid className="w-5 h-5" />
                        : <Icon className="w-4 h-4" />
                      }
                    </div>
                    <p className={`mt-2 text-xs font-medium text-center leading-tight ${
                      active ? 'text-primary-600' : done ? 'text-gray-600' : 'text-gray-400'
                    }`}>
                      {step.label}
                    </p>
                    {active && (
                      <p className="mt-0.5 text-[10px] text-gray-400 text-center leading-tight px-1 hidden sm:block">
                        {step.desc}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Current step description on mobile */}
            {currentStep >= 0 && (
              <p className="sm:hidden mt-4 text-xs text-center text-gray-500 italic">
                {STEPS[currentStep].desc}
              </p>
            )}

            {/* Estimated delivery */}
            {order.orderStatus !== 'delivered' && (
              <div className="mt-5 flex items-center gap-2 bg-primary-50 rounded-xl px-4 py-3">
                <TruckIcon className="w-4 h-4 text-primary-500 flex-shrink-0" />
                <p className="text-sm text-primary-700">
                  <span className="font-medium">Estimated delivery:</span>{' '}
                  {estimatedDelivery(order.createdAt)}
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── Tracking number ── */}
        {order.trackingNumber && (
          <div className="mt-4 flex items-center gap-3 p-3 bg-blue-50 rounded-xl text-sm text-blue-700">
            <TruckIcon className="w-4 h-4 flex-shrink-0" />
            <div>
              Tracking ID: <strong>{order.trackingNumber}</strong>
              {order.trackingUrl && (
                <a href={order.trackingUrl} target="_blank" rel="noreferrer"
                  className="ml-2 underline font-medium hover:text-blue-800">
                  Track Package →
                </a>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Order Items ─────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-card p-6 mb-5">
        <h2 className="font-semibold text-gray-900 mb-4">Order Items</h2>
        <div className="space-y-4">
          {order.items?.map((item) => (
            <div key={item._id} className="flex gap-4">
              <img
                src={item.image || 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=80'}
                alt={item.name}
                className="w-16 h-16 object-cover rounded-xl flex-shrink-0 border border-gray-100"
                onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=80'; }}
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 text-sm">{item.name}</p>
                {item.variantName && <p className="text-xs text-gray-400 mt-0.5">{item.variantName}</p>}
                {item.nurseryName && (
                  <p className="text-xs text-gray-400">
                    Fulfilled by {item.nurseryName} · {item.sellerKind === 'community' ? 'Community Seller' : 'Nursery Seller'}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-0.5">
                  {item.quantity} × {formatPrice(item.price)}
                </p>
              </div>
              <span className="font-semibold text-gray-900 text-sm flex-shrink-0">
                {formatPrice(item.price * item.quantity)}
              </span>
            </div>
          ))}
        </div>

        {/* Pricing breakdown */}
        <div className="border-t border-gray-100 mt-5 pt-4 space-y-2 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal</span><span>{formatPrice(order.pricing?.subtotal)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Delivery</span>
            <span className={order.pricing?.shippingCharge === 0 ? 'text-green-600 font-medium' : ''}>
              {order.pricing?.shippingCharge === 0 ? 'FREE' : formatPrice(order.pricing?.shippingCharge)}
            </span>
          </div>
          {order.pricing?.packagingFee > 0 && (
            <div className="flex justify-between text-gray-600">
              <span>Carton box</span><span>{formatPrice(order.pricing.packagingFee)}</span>
            </div>
          )}
          {order.pricing?.couponDiscount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Discount {order.pricing.couponCode && `(${order.pricing.couponCode})`}</span>
              <span>− {formatPrice(order.pricing.couponDiscount)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-gray-900 text-base border-t border-gray-100 pt-3">
            <span>Total Paid</span><span>{formatPrice(order.pricing?.totalAmount)}</span>
          </div>
        </div>
      </div>

      {/* ── Delivery Address ────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-card p-6 mb-5">
        <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <MapPinIcon className="w-4 h-4 text-primary-500" /> Delivery Address
        </h2>
        <div className="text-sm text-gray-700 space-y-1">
          <p className="font-medium">{order.shippingAddress?.fullName}</p>
          <p>{order.shippingAddress?.line1}{order.shippingAddress?.line2 ? `, ${order.shippingAddress.line2}` : ''}</p>
          <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} – {order.shippingAddress?.postalCode}</p>
          <p className="text-gray-500">📞 {order.shippingAddress?.phone}</p>
        </div>
        {order.needsCartonBox === true && (
          <p className="text-sm text-primary-700 mt-3 bg-primary-50 rounded-lg px-3 py-2">
            📦 Carton box packaging included.
          </p>
        )}
        {order.needsCartonBox === false && (
          <p className="text-sm text-gray-600 mt-3 bg-gray-50 rounded-lg px-3 py-2">
            🌿 Carton box skipped. Essential plant protection is still included.
          </p>
        )}
      </div>

      {/* ── Refunds ─────────────────────────────────────────────────── */}
      {order.refunds?.length > 0 && (
        <div className="bg-white rounded-2xl shadow-card p-6">
          <h2 className="font-semibold text-gray-900 mb-3">Refunds</h2>
          {order.refunds.map((r, i) => (
            <div key={i} className="flex justify-between text-sm py-2.5 border-b border-gray-50 last:border-0">
              <div>
                <span className="font-medium text-gray-900">{formatPrice(r.amount)}</span>
                <span className="ml-2 text-gray-500">{r.reason}</span>
              </div>
              <span className={`badge ${r.status === 'processed' ? 'badge-green' : r.status === 'failed' ? 'badge-red' : 'badge-orange'}`}>
                {r.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
