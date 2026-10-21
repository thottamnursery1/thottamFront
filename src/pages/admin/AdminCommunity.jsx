import { useEffect, useState } from 'react';
import { communityAPI } from '../../services/api';
import { formatPrice, formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';

const TABS = ['overview', 'sellers', 'listings', 'reports', 'settlements', 'audit'];

export default function AdminCommunity() {
  const [tab, setTab] = useState('overview');
  const [metrics, setMetrics] = useState(null);
  const [sellers, setSellers] = useState([]);
  const [listings, setListings] = useState([]);
  const [reports, setReports] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [logs, setLogs] = useState([]);
  const [reference, setReference] = useState('');

  const load = async (next = tab) => {
    if (next === 'overview') setMetrics((await communityAPI.metrics()).data.metrics);
    if (next === 'sellers') setSellers((await communityAPI.adminSellers()).data.sellers);
    if (next === 'listings') setListings((await communityAPI.adminListings()).data.products);
    if (next === 'reports') setReports((await communityAPI.adminReports()).data.reports);
    if (next === 'settlements') setSettlements((await communityAPI.settlements()).data.settlements);
    if (next === 'audit') setLogs((await communityAPI.audit()).data.logs);
  };

  useEffect(() => { load(tab); }, [tab]);

  const review = async (id, status) => {
    const reason = status === 'rejected' ? window.prompt('Rejection reason') : '';
    if (status === 'rejected' && !reason) return;
    await communityAPI.reviewSeller(id, { status, reason, payoutVerificationStatus: status === 'approved' ? 'verified' : undefined });
    toast.success('Seller updated.');
    load('sellers');
  };

  const act = async (id, action) => {
    await communityAPI.settlementAction(id, { action, payoutReference: reference, reason: 'Recorded by marketplace finance.' });
    toast.success('Settlement updated.');
    setReference('');
    load('settlements');
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="page-title">Community marketplace</h1>
        <p className="page-subtitle">Applications, moderation, commissions, and confirmed payouts. Figures come from order and ledger records.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {TABS.map((item) => (
          <button key={item} type="button" onClick={() => setTab(item)} className={`px-3 py-1.5 rounded-full text-sm capitalize ${tab === item ? 'bg-primary-700 text-white' : 'bg-white border border-line'}`}>{item}</button>
        ))}
      </div>

      {tab === 'overview' && metrics && (
        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-3">
          {[
            ['GMV', formatPrice(metrics.gmv)],
            ['Commission', formatPrice(metrics.commission)],
            ['Refunds', formatPrice(metrics.refunds)],
            ['Active listings', metrics.activeListings],
            ['Community orders', metrics.communityOrders],
            ['Failed payments', metrics.failedPayments],
            ['Payout exceptions', metrics.reconciliationExceptions],
            ['Delivery collected', formatPrice(metrics.deliveryCollected)],
          ].map(([label, value]) => (
            <div key={label} className="card p-4"><p className="text-xs text-muted">{label}</p><p className="text-xl font-semibold mt-1">{value}</p></div>
          ))}
        </div>
      )}

      {tab === 'sellers' && (
        <div className="space-y-3">
          {sellers.length === 0 && <p className="text-sm text-muted">No community applications yet.</p>}
          {sellers.map((seller) => (
            <article key={seller._id} className="card p-4 flex flex-col md:flex-row md:items-center gap-3 justify-between">
              <div>
                <p className="font-medium">{seller.displayName} · {seller.status}</p>
                <p className="text-sm text-muted">{seller.user?.email} · {seller.sellerType?.replaceAll('_', ' ')} · payout {seller.payout?.verificationStatus}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button className="btn-outline text-sm" type="button" onClick={() => review(seller._id, 'approved')}>Approve</button>
                <button className="btn-outline text-sm" type="button" onClick={() => review(seller._id, 'rejected')}>Reject</button>
                <button className="btn-outline text-sm" type="button" onClick={() => review(seller._id, 'suspended')}>Suspend</button>
                <button className="btn-outline text-sm" type="button" onClick={() => review(seller._id, 'approved')}>Reactivate</button>
              </div>
            </article>
          ))}
        </div>
      )}

      {tab === 'listings' && (
        <div className="space-y-3">
          {listings.map((product) => (
            <article key={product._id} className="card p-4 flex justify-between gap-3">
              <div>
                <p className="font-medium">{product.name}</p>
                <p className="text-sm text-muted">{product.communitySeller?.displayName} · {product.moderationStatus}</p>
              </div>
              <div className="flex gap-2">
                <button className="btn-outline text-sm" type="button" onClick={() => communityAPI.moderateListing(product._id, { action: 'clear' }).then(() => load('listings'))}>Clear</button>
                <button className="btn-outline text-sm" type="button" onClick={() => communityAPI.moderateListing(product._id, { action: 'flag', note: 'Needs review' }).then(() => load('listings'))}>Flag</button>
                <button className="btn-outline text-sm" type="button" onClick={() => communityAPI.moderateListing(product._id, { action: 'remove' }).then(() => load('listings'))}>Remove</button>
              </div>
            </article>
          ))}
        </div>
      )}

      {tab === 'reports' && (
        <div className="space-y-3">
          {reports.length === 0 && <p className="text-sm text-muted">No reports.</p>}
          {reports.map((report) => (
            <article key={report._id} className="card p-4">
              <p className="font-medium">{report.reason} · {report.status}</p>
              <p className="text-sm mt-1">{report.details}</p>
              <div className="flex gap-2 mt-3">
                <button className="btn-outline text-sm" type="button" onClick={() => communityAPI.resolveReport(report._id, { status: 'resolved', resolution: 'Reviewed' }).then(() => load('reports'))}>Resolve</button>
                <button className="btn-outline text-sm" type="button" onClick={() => communityAPI.resolveReport(report._id, { status: 'dismissed' }).then(() => load('reports'))}>Dismiss</button>
              </div>
            </article>
          ))}
        </div>
      )}

      {tab === 'settlements' && (
        <div className="space-y-3">
          <label className="text-sm block max-w-sm">Payout reference for confirmation
            <input className="input mt-1" value={reference} onChange={(e) => setReference(e.target.value)} placeholder="Provider transfer id" />
          </label>
          {settlements.map((row) => (
            <article key={row._id} className="card p-4">
              <p className="font-medium">{row.orderNumber} · {formatPrice(row.sellerPayable)} · {row.status}</p>
              <p className="text-sm text-muted">{row.communitySeller?.displayName} · commission {formatPrice(row.commissionAmount)} · delivery {formatPrice(row.deliveryAllocation)}</p>
              {row.exception && <p className="text-sm text-red-600 mt-1">{row.exception}</p>}
              <div className="flex flex-wrap gap-2 mt-3">
                <button className="btn-outline text-sm" type="button" onClick={() => act(row._id, 'initiate')}>Initiate payout</button>
                <button className="btn-outline text-sm" type="button" onClick={() => act(row._id, 'paid')}>Confirm paid</button>
                <button className="btn-outline text-sm" type="button" onClick={() => act(row._id, 'fail')}>Mark failed</button>
              </div>
            </article>
          ))}
        </div>
      )}

      {tab === 'audit' && (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <tbody>
              {logs.map((log) => (
                <tr key={log._id} className="border-t border-line">
                  <td className="p-3">{formatDate(log.createdAt)}</td>
                  <td className="p-3">{log.action}</td>
                  <td className="p-3">{log.performedBy?.name || 'System'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
