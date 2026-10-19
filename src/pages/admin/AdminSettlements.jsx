import { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';
import { formatPrice, formatDate } from '../../utils/helpers';
import { BanknotesIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function AdminSettlements() {
  const [rows,    setRows]    = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    adminAPI.getSettlements()
      .then((res) => setRows(res.data.settlements))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const STATUS_BADGE = {
    recorded:  'bg-amber-100 text-amber-700',
    paid:      'bg-emerald-100 text-emerald-800',
    reversed:  'bg-red-100 text-red-700',
  };

  return (
    <div className="space-y-5 animate-fade-in">

      <div className="page-header">
        <div>
          <h1 className="page-title">Settlements</h1>
          <p className="page-subtitle">Nursery payouts · manual reconciliation</p>
        </div>
      </div>

      <div className="card p-4 bg-amber-50 border border-amber-100 text-sm text-amber-800 rounded-[14px]">
        Settlements track what each nursery is owed. Marking one paid is a manual record — it does not trigger a Razorpay transfer.
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="divide-y divide-gray-50">
            {[...Array(5)].map((_, i) => <div key={i} className="h-16 skeleton m-4 rounded-xl" />)}
          </div>
        ) : rows.length === 0 ? (
          <div className="empty-state py-16">
            <BanknotesIcon className="w-10 h-10 text-gray-300 mb-3" />
            <p className="text-sm text-gray-500">No settlements yet. They appear after a verified payment.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nursery</th>
                  <th>Order</th>
                  <th>Seller Amount</th>
                  <th>Commission</th>
                  <th>Method</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row._id}>
                    <td className="font-semibold text-gray-900">{row.nursery?.name || '—'}</td>
                    <td className="text-xs font-mono text-gray-500">{row.orderNumber || row.order?.orderNumber || '—'}</td>
                    <td className="font-bold text-gray-900">{formatPrice(row.sellerAmount)}</td>
                    <td className="text-gray-500">{formatPrice(row.commissionAmount)}</td>
                    <td className="text-gray-500 capitalize">{row.method || '—'}</td>
                    <td className="text-xs text-gray-400 whitespace-nowrap">{formatDate(row.createdAt)}</td>
                    <td>
                      <span className={`badge text-xs ${STATUS_BADGE[row.status] || 'bg-gray-100 text-gray-600'}`}>
                        {row.status}
                      </span>
                    </td>
                    <td>
                      {row.status === 'recorded' && (
                        <button
                          onClick={async () => {
                            await adminAPI.markSettlementPaid(row._id);
                            toast.success('Marked as paid.');
                            load();
                          }}
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-primary-600 hover:text-primary-700"
                        >
                          <CheckCircleIcon className="w-4 h-4" /> Mark Paid
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
