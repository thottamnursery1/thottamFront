import { useEffect, useState } from 'react';
import { communityAPI } from '../../services/api';
import { formatPrice, formatDate } from '../../utils/helpers';

const STATUS = {
  accrued: 'Accrued — not paid',
  eligible: 'Eligible — payout not sent',
  payout_initiated: 'Payout initiated — waiting for provider confirmation',
  paid: 'Paid',
  failed: 'Payout failed',
  reversed: 'Reversed',
};

export default function CommunityEarnings() {
  const [data, setData] = useState(null);
  useEffect(() => { communityAPI.earnings().then((res) => setData(res.data)); }, []);
  if (!data) return <div className="h-40 skeleton rounded-2xl" />;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="page-title">Earnings</h1>
        <p className="page-subtitle">Commission is calculated on the plant price. Delivery is recorded separately. A row is paid only after finance confirms the payout reference.</p>
      </div>
      <div className="overflow-x-auto card">
        <table className="w-full text-sm">
          <thead className="text-left text-muted">
            <tr>
              <th className="p-3">Order</th>
              <th className="p-3">Product</th>
              <th className="p-3">Commission</th>
              <th className="p-3">Delivery</th>
              <th className="p-3">Payable</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {data.settlements.length === 0 && (
              <tr><td className="p-4 text-muted" colSpan="6">No settlement records yet.</td></tr>
            )}
            {data.settlements.map((row) => (
              <tr key={row._id} className="border-t border-line">
                <td className="p-3">{row.orderNumber}<div className="text-xs text-muted">{formatDate(row.createdAt)}</div></td>
                <td className="p-3">{formatPrice(row.productSubtotal)}</td>
                <td className="p-3">{formatPrice(row.commissionAmount)}</td>
                <td className="p-3">{formatPrice(row.deliveryAllocation)}</td>
                <td className="p-3">{formatPrice(row.sellerPayable)}</td>
                <td className="p-3">{STATUS[row.status] || row.status}{row.payoutReference ? ` · ${row.payoutReference}` : ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
