import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { communityAPI } from '../../services/api';
import { formatPrice } from '../../utils/helpers';

const LABELS = {
  accrued: 'Accrued',
  eligible: 'Ready for payout',
  payoutInProgress: 'Payout initiated',
  paid: 'Paid',
  failed: 'Payout failed',
};

export default function CommunityHome() {
  const [data, setData] = useState(null);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    communityAPI.earnings().then((res) => setData(res.data)).catch(() => setData({ summary: {}, settlements: [] }));
    communityAPI.orders().then((res) => setOrders(res.data.orders || [])).catch(() => {});
  }, []);

  if (!data) return <div className="h-40 skeleton rounded-2xl" />;
  const summary = data.summary || {};

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Community selling</h1>
          <p className="page-subtitle">Earnings stay unpaid until Thottam confirms a payout reference.</p>
        </div>
        <Link to="/community/products/new" className="btn-primary">New listing</Link>
      </div>
      <div className="grid sm:grid-cols-2 xl:grid-cols-5 gap-3">
        {Object.entries(LABELS).map(([key, label]) => (
          <div key={key} className="card p-4">
            <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
            <p className="text-xl font-semibold mt-1">{formatPrice(summary[key] || 0)}</p>
          </div>
        ))}
      </div>
      <div className="card p-5">
        <h2 className="font-semibold mb-3">Recent orders</h2>
        {orders.length === 0 && <p className="text-sm text-muted">Paid orders for your plants will appear here.</p>}
        <div className="space-y-2">
          {orders.slice(0, 5).map((order) => (
            <Link key={order._id} to="/community/orders" className="flex justify-between gap-3 text-sm border-b border-line py-2">
              <span>{order.orderNumber}</span>
              <span className="text-muted">{order.fulfillmentStatus}</span>
              <span>{formatPrice(order.amounts?.sellerPayable || 0)}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
