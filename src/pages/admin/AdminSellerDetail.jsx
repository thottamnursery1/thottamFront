import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import { formatPrice } from '../../utils/helpers';
import { ArrowLeftIcon, BuildingStorefrontIcon, CurrencyRupeeIcon, ShoppingBagIcon, CubeIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

function InfoRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex gap-3 py-2 border-b border-gray-50 last:border-0">
      <span className="text-xs text-gray-400 w-28 flex-shrink-0 pt-0.5">{label}</span>
      <span className="text-sm text-gray-800 font-medium">{value}</span>
    </div>
  );
}

export default function AdminSellerDetail() {
  const { id }  = useParams();
  const [data,  setData]  = useState(null);
  const [reason, setReason] = useState('');
  const [reviewed, setReviewed] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = () => adminAPI.getSeller(id).then((res) => setData(res.data));
  useEffect(() => { load(); }, [id]);

  if (!data) return (
    <div className="space-y-4">
      <div className="h-8 skeleton rounded-xl w-48" />
      <div className="h-36 skeleton rounded-[14px]" />
      <div className="h-64 skeleton rounded-[14px]" />
    </div>
  );

  const { seller, products, performance } = data;

  const STATUS_COLOR = {
    approved:  'badge-green',
    pending:   'badge-orange',
    rejected:  'badge-red',
    changes_requested: 'badge-orange',
    suspended: 'badge-gray',
  };

  const review = async (action, extra = {}) => {
    setBusy(true);
    try {
      await adminAPI.reviewSeller(id, { action, reason, paymentReviewed: reviewed, ...extra });
      toast.success('Shop review saved.');
      setReason('');
      await load();
    } catch {
      // The API toast already explains why approval was refused.
    } finally {
      setBusy(false);
    }
  };

  const methods = seller.paymentMethods || {};
  const methodRows = [
    methods.upi?.enabled && { key: 'upi', label: 'UPI ID', detail: methods.upi.upiId, status: methods.upi.verificationStatus },
    methods.qr?.enabled && { key: 'qr', label: 'GPay / UPI QR code', detail: methods.qr.fileName || 'Image uploaded', status: methods.qr.verificationStatus, image: methods.qr.imageData },
    methods.gateway?.enabled && { key: 'gateway', label: 'Bank account / payment gateway', detail: [methods.gateway.accountHolder, methods.gateway.bankName, methods.gateway.ifsc, methods.gateway.accountLast4 ? `ending ${methods.gateway.accountLast4}` : ''].filter(Boolean).join(' · '), status: `${methods.gateway.verificationStatus} · onboarding ${methods.gateway.onboardingStatus}` },
  ].filter(Boolean);

  return (
    <div className="space-y-5 max-w-4xl animate-fade-in">

      <Link to="/admin/sellers" className="inline-flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-700">
        <ArrowLeftIcon className="w-4 h-4" /> Back to Sellers
      </Link>

      {/* ── Header ───────────────────────────────────────── */}
      <div className="card p-5 flex flex-wrap items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0">
          <BuildingStorefrontIcon className="w-6 h-6 text-primary-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="page-title">{seller.name}</h1>
            <span className={`badge ${STATUS_COLOR[seller.status] || 'badge-gray'} capitalize`}>{seller.status}</span>
          </div>
          <p className="text-sm text-gray-500 mt-0.5">
            {seller.ownerName} · {seller.email} · {seller.phone}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {[seller.address?.line1, seller.address?.city, seller.address?.state, seller.address?.postalCode].filter(Boolean).join(', ')}
          </p>
        </div>
      </div>

      <div className="card p-5 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-gray-900">Payment details</p>
          <span className={`badge text-xs ${data.paymentSetupSatisfied ? 'badge-green' : 'badge-red'}`}>
            {data.paymentSetupSatisfied ? 'Payment setup ready' : 'Payment setup missing'}
          </span>
        </div>
        <p className="text-xs text-gray-500">A UPI ID or QR image is not proof that the account is verified. Review these details before approving the shop.</p>
        {!methodRows.length && <p className="text-sm text-gray-500">No payment method is configured.</p>}
        {methodRows.map((method) => (
          <div key={method.key} className="rounded-xl border border-gray-100 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium text-gray-900">{method.label}</p>
              <p className="text-xs capitalize text-gray-500">{String(method.status || '').replaceAll('_', ' ')}</p>
            </div>
            <p className="mt-1 text-sm text-gray-700">{method.detail}</p>
            {method.image && <img src={method.image} alt="UPI QR code" className="mt-2 h-28 w-28 rounded-lg object-contain bg-gray-50" />}
            <div className="mt-3 flex gap-2">
              <button type="button" className="btn-outline text-xs py-1.5 px-3" disabled={busy} onClick={() => review('set_payment_status', { method: method.key, verificationStatus: 'verified' })}>Mark verified</button>
              <button type="button" className="btn-outline text-xs py-1.5 px-3" disabled={busy} onClick={() => review('set_payment_status', { method: method.key, verificationStatus: 'rejected' })}>Reject method</button>
            </div>
          </div>
        ))}
        {seller.status !== 'approved' && (
          <div className="space-y-3 border-t border-gray-100 pt-4">
            <label className="flex items-start gap-2 text-sm text-gray-700">
              <input type="checkbox" className="mt-1" checked={reviewed} onChange={(event) => setReviewed(event.target.checked)} />
              I have reviewed the shop registration and payment details.
            </label>
            <textarea className="input" rows={2} placeholder="Reason, if you are rejecting or requesting changes" value={reason} onChange={(event) => setReason(event.target.value)} />
            <div className="flex flex-wrap gap-2">
              <button type="button" className="btn-primary text-sm" disabled={busy || !reviewed || !data.paymentSetupSatisfied} onClick={() => review(seller.status === 'suspended' ? 'reactivate' : 'approve')}>
                {seller.status === 'suspended' ? 'Reactivate shop' : 'Approve shop'}
              </button>
              <button type="button" className="btn-outline text-sm" disabled={busy} onClick={() => review('request_changes')}>Request changes</button>
              <button type="button" className="btn-outline text-sm text-red-600" disabled={busy} onClick={() => review('reject')}>Reject</button>
            </div>
          </div>
        )}
      </div>

      {/* ── Performance + details ────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-5 flex flex-col gap-2">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
            <CurrencyRupeeIcon className="w-4.5 h-4.5 text-emerald-600" />
          </div>
          <p className="text-xl font-bold text-gray-900 mt-1">{formatPrice(performance?.sales || 0)}</p>
          <p className="text-xs text-gray-500">Paid Sales</p>
        </div>
        <div className="card p-5 flex flex-col gap-2">
          <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
            <ShoppingBagIcon className="w-4.5 h-4.5 text-blue-600" />
          </div>
          <p className="text-xl font-bold text-gray-900 mt-1">{performance?.orders || 0}</p>
          <p className="text-xs text-gray-500">Total Orders</p>
        </div>
        <div className="card p-5 flex flex-col gap-2">
          <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center">
            <CubeIcon className="w-4.5 h-4.5 text-purple-600" />
          </div>
          <p className="text-xl font-bold text-gray-900 mt-1">{products?.length || 0}</p>
          <p className="text-xs text-gray-500">Products Listed</p>
        </div>
      </div>

      {/* ── Products table ───────────────────────────────── */}
      <div className="card overflow-hidden">
        <div className="panel-header">
          <p className="panel-title">Products</p>
          <span className="text-xs text-gray-400">{products?.length} listed</span>
        </div>
        {!products?.length ? (
          <div className="empty-state py-12">
            <p className="text-sm text-gray-400">No products listed yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Approval</th>
                  <th>Live</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p._id}>
                    <td className="font-medium text-gray-900">{p.name}</td>
                    <td className="font-semibold text-gray-900">{formatPrice(p.price)}</td>
                    <td>
                      <span className={`font-semibold text-sm ${p.stock === 0 ? 'text-red-600' : p.stock <= 5 ? 'text-amber-600' : 'text-gray-700'}`}>
                        {p.stock}
                      </span>
                    </td>
                    <td>
                      <span className={`badge text-xs ${
                        p.approvalStatus === 'approved' ? 'badge-green'
                        : p.approvalStatus === 'rejected' ? 'badge-red'
                        : 'badge-orange'
                      }`}>
                        {p.approvalStatus || 'pending'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge text-xs ${p.isActive ? 'badge-green' : 'badge-gray'}`}>
                        {p.isActive ? 'Live' : 'Hidden'}
                      </span>
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
