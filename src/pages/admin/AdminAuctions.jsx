import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { auctionAPI } from '../../services/api';
import { formatPrice } from '../../utils/helpers';

export default function AdminAuctions() {
  const [data, setData] = useState(null);
  const [busy, setBusy] = useState('');

  const load = () => auctionAPI.adminPayments().then((res) => setData(res.data)).catch(() => setData({ payments: [], totals: {} }));
  useEffect(() => { load(); }, []);

  const refund = async (payment) => {
    setBusy(payment._id);
    try {
      await auctionAPI.refund(payment._id, { reason: 'Refunded from auction settlements' });
      toast.success('Refund sent to Razorpay.');
      load();
    } finally {
      setBusy('');
    }
  };

  if (!data) return <div className="h-40 skeleton rounded-[14px]" />;
  const totals = data.totals || {};

  return (
    <div className="space-y-5">
      <div>
        <h1 className="page-title">Auction settlements</h1>
        <p className="page-subtitle">Each paid auction keeps the donor share and the Thottam commission. Route transfers run when the donor account is linked.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          ['Collected', totals.collected],
          ['Donor 80%', totals.donor],
          ['Thottam 20%', totals.platform],
        ].map(([label, value]) => (
          <div key={label} className="rounded-[14px] bg-white p-4 shadow-card">
            <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
            <p className="mt-1 font-display text-2xl text-primary-900">{formatPrice(value || 0)}</p>
          </div>
        ))}
      </div>
      <div className="space-y-3">
        {(data.payments || []).length === 0 && <p className="text-sm text-muted">No auction payments yet.</p>}
        {(data.payments || []).map((payment) => (
          <div key={payment._id} className="rounded-[14px] bg-white p-4 shadow-card">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="font-medium text-ink">{payment.auctionName}</p>
                <p className="text-sm text-muted">{payment.payerName} paid · donor {payment.donorName}</p>
                <p className="mt-1 text-sm">Bid {formatPrice(payment.amount)} · Donor {formatPrice(payment.donorShare)} · Thottam {formatPrice(payment.platformShare)}</p>
                <p className="mt-1 text-xs capitalize text-muted">{payment.status} · transfer {String(payment.transferStatus || '').replaceAll('_', ' ')} {payment.transferId ? `· ${payment.transferId}` : ''}</p>
              </div>
              {payment.status === 'paid' && (
                <button type="button" className="btn-outline h-10 whitespace-nowrap px-3" disabled={busy === payment._id} onClick={() => refund(payment)}>
                  {busy === payment._id ? 'Refunding…' : 'Refund'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
