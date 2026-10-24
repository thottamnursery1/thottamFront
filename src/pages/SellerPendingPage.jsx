import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { nurseryAPI } from '../services/api';
import { isProductManagerRole } from '../utils/helpers';
import toast from 'react-hot-toast';
import ShopPaymentMethods, { PAYMENT_REQUIRED_MESSAGE, paymentPayload, paymentReady, paymentsFromNursery } from '../components/ShopPaymentMethods';

const LABELS = {
  pending: 'PENDING_APPROVAL',
  approved: 'APPROVED',
  rejected: 'REJECTED',
  changes_requested: 'CHANGES_REQUESTED',
  suspended: 'SUSPENDED',
};

const applicationForm = (shop, account) => ({
  description: shop?.description || '',
  phone: shop?.phone || account?.phone || '',
  logo: shop?.logo || '',
  line1: shop?.address?.line1 || '',
  city: shop?.address?.city || '',
  state: shop?.address?.state || '',
  postalCode: shop?.address?.postalCode || '',
});

export default function SellerPendingPage() {
  const navigate = useNavigate();
  const { nursery, user, isShopAdmin, logout, updateNursery } = useAuth();
  const [shop, setShop] = useState(nursery);
  const status = shop?.status || nursery?.status || 'pending';
  const [form, setForm] = useState(() => applicationForm(nursery, user));
  const [payments, setPayments] = useState(() => paymentsFromNursery(nursery?.paymentMethods));

  useEffect(() => {
    const role = user?.role;
    const shouldLoad = Boolean(nursery?._id) || role === 'shop_admin' || role === 'seller';
    if (!user || !shouldLoad) return undefined;
    let active = true;
    nurseryAPI.myApplication()
      .then((res) => {
        const next = res.data?.nursery;
        if (!active || !next) return;
        setShop(next);
        updateNursery(next);
        setForm(applicationForm(next, user));
        setPayments(paymentsFromNursery(next.paymentMethods));
      })
      .catch(() => {});
    return () => { active = false; };
  }, [user, nursery?._id, updateNursery]);

  const shown = shop || nursery;
  const address = [shown?.address?.line1, shown?.address?.city, shown?.address?.state, shown?.address?.postalCode].filter(Boolean).join(', ');

  const resubmit = async (event) => {
    event.preventDefault();
    if (!paymentReady(payments).any) return;
    const res = await nurseryAPI.updateApplication({ ...form, paymentMethods: paymentPayload(payments) });
    toast.success(res.data.message);
    window.location.reload();
  };

  return (
    <div className="container-custom py-12 max-w-2xl">
      <div className="mb-6">
        <Link to="/" className="inline-flex items-center text-sm text-primary-700 hover:text-primary-800 font-medium">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Home
        </Link>
      </div>
      <div className="glass-panel rounded-[1.8rem] p-6 sm:p-8">
        {isProductManagerRole(user?.role) && !nursery ? (
          <span className="badge-orange">SHOP REQUIRED</span>
        ) : (
          <span className="badge-green">{LABELS[status] || status}</span>
        )}
        <p className="text-xs uppercase tracking-[0.18em] text-muted mt-4">Shop application</p>
        <h1 className="text-4xl mt-2">{shown?.name || user?.name}</h1>
        {isProductManagerRole(user?.role) && !nursery && (
          <p className="mt-4 text-ink/80 leading-relaxed">A shop assignment is required before you can manage products. Ask a super admin or your shop admin to assign you to a shop.</p>
        )}
        {status === 'pending' && shown && (
          <p className="mt-4 text-ink/80 leading-relaxed">Your shop registration request has been submitted successfully. You can access product management after your shop is approved.</p>
        )}
        {status === 'rejected' && shown && (
          <p className="mt-4 text-ink/80 leading-relaxed">{shown?.rejectionReason || 'This application was not approved.'}{isShopAdmin ? ' You can update the details below and resubmit.' : ''}</p>
        )}
        {status === 'changes_requested' && shown && (
          <p className="mt-4 text-ink/80 leading-relaxed">{shown?.rejectionReason || 'A super admin asked for changes.'}{isShopAdmin ? ' Update the payment methods if needed, then resubmit.' : ''}</p>
        )}
        {status === 'suspended' && (
          <p className="mt-4 text-ink/80 leading-relaxed">This shop is suspended. Product management and publishing are blocked. Existing orders remain available to the platform for review.</p>
        )}
        {status === 'approved' && shown && (
          <Link to={isProductManagerRole(user?.role) ? '/product-admin' : '/seller'} className="btn-primary mt-6">
            {isProductManagerRole(user?.role) ? 'Open product admin' : 'Open shop admin'}
          </Link>
        )}
        <dl className="mt-6 grid sm:grid-cols-2 gap-3 text-sm">
          <div><dt className="text-muted">Owner</dt><dd>{shown?.ownerName || user?.name}</dd></div>
          <div><dt className="text-muted">Email</dt><dd>{shown?.email || user?.email}</dd></div>
          <div><dt className="text-muted">Phone</dt><dd>{shown?.phone || user?.phone || '—'}</dd></div>
          <div><dt className="text-muted">Shop ID</dt><dd>{shown?.sellerCode || 'Assigned on save'}</dd></div>
          <div className="sm:col-span-2"><dt className="text-muted">Address</dt><dd>{address || '—'}</dd></div>
        </dl>
        {(shown?.documents || []).length > 0 && (
          <ul className="mt-4 text-sm space-y-1">
            {shown.documents.map((doc) => <li key={doc.url}><a className="text-primary-700 underline" href={doc.url}>{doc.label || 'Document'}</a></li>)}
          </ul>
        )}
        {shown?.paymentMethods && (
          <div className="mt-6 text-sm">
            <p className="text-muted">Payment methods</p>
            <ul className="mt-2 space-y-1">
              {shown.paymentMethods.upi?.enabled && <li>UPI {shown.paymentMethods.upi.upiId} · {shown.paymentMethods.upi.verificationStatus?.replaceAll('_', ' ')}</li>}
              {shown.paymentMethods.qr?.enabled && <li>QR code · {shown.paymentMethods.qr.verificationStatus?.replaceAll('_', ' ')}</li>}
              {shown.paymentMethods.gateway?.enabled && <li>Bank / gateway · {shown.paymentMethods.gateway.accountLast4 ? `account ending ${shown.paymentMethods.gateway.accountLast4}` : 'details saved'} · {shown.paymentMethods.gateway.verificationStatus?.replaceAll('_', ' ')}</li>}
              {!shown.paymentMethods.upi?.enabled && !shown.paymentMethods.qr?.enabled && !shown.paymentMethods.gateway?.enabled && <li>None configured</li>}
            </ul>
          </div>
        )}
        <p className="mt-6 text-sm text-muted">Product management stays disabled until the status is APPROVED and at least one valid payment method is configured. A super admin reviews the shop and the payment details first.</p>
        <div className="mt-6 pt-6 border-t border-line flex items-center justify-between">
          <Link to="/" className="text-sm text-primary-700 hover:underline">Browse products</Link>
          <button 
            onClick={() => { logout(); navigate('/login'); }}
            className="text-sm text-gray-600 hover:text-gray-900 underline"
          >
            Sign out
          </button>
        </div>
      </div>
      {['rejected', 'changes_requested'].includes(status) && isShopAdmin && (
        <form onSubmit={resubmit} className="glass-panel rounded-[1.8rem] p-6 mt-4 space-y-3">
          <h2 className="text-2xl">Resubmit application</h2>
          <label className="block text-sm">About the shop<textarea className="input mt-1" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
          <label className="block text-sm">Phone<input className="input mt-1" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label>
          <label className="block text-sm">Logo URL<input className="input mt-1" value={form.logo} onChange={(e) => setForm({ ...form, logo: e.target.value })} /></label>
          <label className="block text-sm">Address<input className="input mt-1" value={form.line1} onChange={(e) => setForm({ ...form, line1: e.target.value })} /></label>
          <div className="grid sm:grid-cols-3 gap-3">
            <input className="input" placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            <input className="input" placeholder="State" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
            <input className="input" placeholder="PIN" value={form.postalCode} onChange={(e) => setForm({ ...form, postalCode: e.target.value })} />
          </div>
          <ShopPaymentMethods value={payments} onChange={setPayments} />
          {!paymentReady(payments).any && (
            <p className="text-sm text-red-600" role="alert">{PAYMENT_REQUIRED_MESSAGE}</p>
          )}
          <button className="btn-primary" disabled={!paymentReady(payments).any}>Submit for Approval</button>
        </form>
      )}
    </div>
  );
}
