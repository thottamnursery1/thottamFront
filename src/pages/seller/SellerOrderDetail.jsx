import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { sellerAPI } from '../../services/api';
import { formatPrice } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function SellerOrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [tracking, setTracking] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    sellerAPI.getOrder(id).then((res) => {
      setOrder(res.data.order);
      setTracking(res.data.order.fulfillment?.trackingNumber || '');
    });
  }, [id]);

  const update = async (status) => {
    setBusy(true);
    try {
      const res = await sellerAPI.fulfill(id, { status, trackingNumber: tracking });
      setOrder(res.data.order);
      toast.success(`Marked ${status}.`);
    } finally {
      setBusy(false);
    }
  };

  if (!order) return <div className="h-40 skeleton rounded-2xl" />;
  const address = order.shippingAddress;

  return (
    <div className="max-w-3xl space-y-4">
      <h1 className="text-4xl">{order.orderNumber}</h1>
      <p className="text-sm text-muted">Payment {order.paymentStatus} · Fulfilment {order.fulfillment?.fulfillmentStatus}</p>
      <section className="bg-white border border-line rounded-2xl p-5">
        <h2 className="text-2xl mb-3">Your items</h2>
        {order.items.map((item) => (
          <div key={item._id} className="flex justify-between text-sm py-2 border-b border-line">
            <span>{item.name} × {item.quantity}</span>
            <span>{formatPrice(item.price * item.quantity)}</span>
          </div>
        ))}
      </section>
      <section className="bg-white border border-line rounded-2xl p-5">
        <h2 className="text-2xl mb-2">Delivery</h2>
        <p className="text-sm">{address.fullName}<br />{address.phone}<br />{address.line1}{address.line2 ? `, ${address.line2}` : ''}<br />{address.city}, {address.state} {address.postalCode}</p>
      </section>
      <section className={`rounded-2xl p-5 border ${order.needsCartonBox === false ? 'bg-primary-50 border-primary-200' : 'bg-white border-line'}`}>
        <h2 className="text-2xl mb-2">Packing</h2>
        {order.needsCartonBox === true && (
          <p className="text-sm font-semibold text-gray-900">📦 Carton box requested</p>
        )}
        {order.needsCartonBox === false && (
          <p className="text-sm font-semibold text-primary-800">🌿 Carton box skipped</p>
        )}
        {order.needsCartonBox === true || order.needsCartonBox === false ? (
          <p className="text-sm text-gray-700 mt-2">{order.packagingNote || 'Essential protective packaging stays with the plants so they arrive safely.'}</p>
        ) : (
          <p className="text-sm text-muted">Carton preference was not recorded. Use the nursery&apos;s usual protective packing.</p>
        )}
      </section>
      <section className="bg-white border border-line rounded-2xl p-5 space-y-3">
        <h2 className="text-2xl">Fulfilment</h2>
        <label className="text-sm block">Tracking number<input className="input mt-1" value={tracking} onChange={(e) => setTracking(e.target.value)} /></label>
        <div className="flex flex-wrap gap-2">
          {['processing', 'dispatched', 'delivered'].map((status) => (
            <button key={status} disabled={busy} onClick={() => update(status)} className="btn-outline capitalize">{status}</button>
          ))}
        </div>
      </section>
    </div>
  );
}
