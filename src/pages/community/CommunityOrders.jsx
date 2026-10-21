import { useEffect, useState } from 'react';
import { communityAPI } from '../../services/api';
import { formatPrice } from '../../utils/helpers';
import toast from 'react-hot-toast';

const STEPS = ['processing', 'dispatched', 'delivered', 'cancelled'];

export default function CommunityOrders() {
  const [orders, setOrders] = useState([]);
  const [selected, setSelected] = useState(null);

  const load = () => communityAPI.orders().then((res) => setOrders(res.data.orders || []));
  useEffect(() => { load(); }, []);

  const update = async (status) => {
    if (status === 'cancelled' && !window.confirm('Cancel your part of this order and request a refund review?')) return;
    await communityAPI.fulfill(selected._id, { fulfillmentStatus: status });
    toast.success('Fulfilment updated. Payment status is unchanged.');
    const res = await communityAPI.getOrder(selected._id);
    setSelected(res.data.order);
    load();
  };

  return (
    <div className="grid lg:grid-cols-[280px_1fr] gap-4">
      <div className="space-y-3">
        <h1 className="page-title">Orders</h1>
        {orders.length === 0 && <p className="text-sm text-muted">No paid orders yet.</p>}
        {orders.map((order) => (
          <button key={order._id} type="button" onClick={() => setSelected(order)} className={`card p-3 w-full text-left ${selected?._id === order._id ? 'ring-2 ring-primary-500' : ''}`}>
            <p className="font-medium text-sm">{order.orderNumber}</p>
            <p className="text-xs text-muted">{order.fulfillmentStatus} · Payment {order.paymentStatus}</p>
          </button>
        ))}
      </div>
      {selected && (
        <div className="card p-5 space-y-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted">You fulfil these items</p>
            <h2 className="text-xl font-semibold">{selected.orderNumber}</h2>
          </div>
          {selected.items.map((item) => (
            <div key={item._id} className="flex justify-between text-sm border-b border-line py-2">
              <span>{item.name} × {item.quantity}</span>
              <span>{formatPrice(item.price * item.quantity)}</span>
            </div>
          ))}
          <div className="text-sm space-y-1">
            <p>Delivery: {selected.deliveryMethod?.replace('_', ' ') || 'local delivery'} · prep {selected.dispatchPrepHours || 0}h</p>
            <p>Ship to {selected.shippingAddress?.fullName}, {selected.shippingAddress?.line1}, {selected.shippingAddress?.city} {selected.shippingAddress?.postalCode}</p>
            <p>Phone {selected.shippingAddress?.phone}</p>
            <p>Product {formatPrice(selected.amounts.productSubtotal)} · delivery {formatPrice(selected.amounts.deliveryAllocation)} · commission {formatPrice(selected.amounts.commissionAmount)}</p>
            <p className="font-medium">Seller payable {formatPrice(selected.amounts.sellerPayable)} · {selected.settlementStatus}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {STEPS.map((step) => (
              <button key={step} type="button" className="btn-outline capitalize" onClick={() => update(step)}>{step}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
