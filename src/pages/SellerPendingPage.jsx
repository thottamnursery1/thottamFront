import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { nurseryAPI } from '../services/api';
import toast from 'react-hot-toast';

const LABELS = {
  pending: 'PENDING_APPROVAL',
  approved: 'APPROVED',
  rejected: 'REJECTED',
  suspended: 'SUSPENDED',
};

export default function SellerPendingPage() {
  const navigate = useNavigate();
  const { nursery, user, isShopAdmin, logout } = useAuth();
  const status = nursery?.status || 'pending';
  const [form, setForm] = useState({
    description: nursery?.description || '',
    phone: nursery?.phone || '',
    logo: nursery?.logo || '',
    line1: nursery?.address?.line1 || '',
    city: nursery?.address?.city || '',
    state: nursery?.address?.state || '',
    postalCode: nursery?.address?.postalCode || '',
  });

  const resubmit = async (event) => {
    event.preventDefault();
    const res = await nurseryAPI.updateApplication(form);
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
        {user?.role === 'shop_assistant' && !nursery ? (
          <span className="badge-orange">SHOP REQUIRED</span>
        ) : (
          <span className="badge-green">{LABELS[status] || status}</span>
        )}
        <p className="text-xs uppercase tracking-[0.18em] text-muted mt-4">Shop application</p>
        <h1 className="text-4xl mt-2">{nursery?.name || user?.name}</h1>
        {user?.role === 'product_admin' && !nursery && (
          <p className="mt-4 text-ink/80 leading-relaxed">A shop assignment is required before you can manage products. Ask a super admin or your shop admin to assign you to a shop.</p>
        )}
        {status === 'pending' && nursery && (
          <p className="mt-4 text-ink/80 leading-relaxed">Your shop registration request has been submitted successfully. You can access product management after your shop is approved.</p>
        )}
        {status === 'rejected' && nursery && (
          <p className="mt-4 text-ink/80 leading-relaxed">{nursery?.rejectionReason || 'This application was not approved.'}{isShopAdmin ? ' You can update the details below and resubmit.' : ''}</p>
        )}
        {status === 'suspended' && (
          <p className="mt-4 text-ink/80 leading-relaxed">This shop is suspended. Product management and publishing are blocked. Existing orders remain available to the platform for review.</p>
        )}
        {status === 'approved' && nursery && (
          <Link to={user?.role === 'product_admin' ? '/product-admin' : '/seller'} className="btn-primary mt-6">
            {user?.role === 'product_admin' ? 'Open product admin' : 'Open shop admin'}
          </Link>
        )}
        <dl className="mt-6 grid sm:grid-cols-2 gap-3 text-sm">
          <div><dt className="text-muted">Owner</dt><dd>{nursery?.ownerName || user?.name}</dd></div>
          <div><dt className="text-muted">Email</dt><dd>{nursery?.email || user?.email}</dd></div>
          <div><dt className="text-muted">Phone</dt><dd>{nursery?.phone || '—'}</dd></div>
          <div><dt className="text-muted">Shop ID</dt><dd>{nursery?.sellerCode || 'Assigned on save'}</dd></div>
          <div className="sm:col-span-2"><dt className="text-muted">Address</dt><dd>{[nursery?.address?.line1, nursery?.address?.city, nursery?.address?.state, nursery?.address?.postalCode].filter(Boolean).join(', ') || '—'}</dd></div>
        </dl>
        {(nursery?.documents || []).length > 0 && (
          <ul className="mt-4 text-sm space-y-1">
            {nursery.documents.map((doc) => <li key={doc.url}><a className="text-primary-700 underline" href={doc.url}>{doc.label || 'Document'}</a></li>)}
          </ul>
        )}
        <p className="mt-6 text-sm text-muted">Product management stays disabled until the status is APPROVED. A super admin reviews the shop, then the Product Admin workspace opens for this same shop.</p>
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
      {status === 'rejected' && isShopAdmin && (
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
          <button className="btn-primary">Resubmit for approval</button>
        </form>
      )}
    </div>
  );
}
