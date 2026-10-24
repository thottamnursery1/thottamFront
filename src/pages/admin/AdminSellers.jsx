import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import { BuildingStorefrontIcon, CheckCircleIcon, XCircleIcon, PauseCircleIcon, PlayCircleIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = ['', 'pending', 'changes_requested', 'approved', 'rejected', 'suspended'];

const STATUS_BADGE = {
  approved:  'badge-green',
  pending:   'badge-orange',
  rejected:  'badge-red',
  changes_requested: 'badge-orange',
  suspended: 'badge-gray',
};

export default function AdminSellers() {
  const [sellers,       setSellers]       = useState([]);
  const [status,        setStatus]        = useState('');
  const [pendingAction, setPendingAction] = useState(null);
  const [reason,        setReason]        = useState('');
  const [loading,       setLoading]       = useState(true);

  const load = (s = status) => {
    setLoading(true);
    adminAPI.getSellers(s ? { status: s } : {})
      .then((res) => setSellers(res.data.sellers))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []); // eslint-disable-line

  const confirm = async () => {
    if (!pendingAction) return;
    await adminAPI.reviewSeller(pendingAction.id, { action: pendingAction.action, reason });
    toast.success('Seller updated.');
    setPendingAction(null);
    setReason('');
    load();
  };

  return (
    <div className="space-y-5 animate-fade-in">

      <div className="page-header">
        <div>
          <h1 className="page-title">Sellers</h1>
          <p className="page-subtitle">Nursery shop approvals and management</p>
        </div>
      </div>

      {/* Filter */}
      <div className="card p-4">
        <div className="flex flex-wrap items-center gap-2">
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s}
              onClick={() => { setStatus(s); load(s); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize ${
                status === s
                  ? 'bg-primary-700 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {s || 'All'}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <div key={i} className="h-20 skeleton rounded-[14px]" />)}
        </div>
      ) : sellers.length === 0 ? (
        <div className="card">
          <div className="empty-state py-16">
            <BuildingStorefrontIcon className="w-10 h-10 text-gray-300 mb-3" />
            <p className="text-sm text-gray-500">No sellers match this filter.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {sellers.map((seller) => (
            <div key={seller._id} className="card p-4 flex flex-col sm:flex-row sm:items-center gap-4 hover:shadow-card-hover transition-shadow">
              {/* Avatar + info */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0">
                  <BuildingStorefrontIcon className="w-5 h-5 text-primary-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link to={`/admin/sellers/${seller._id}`} className="font-semibold text-gray-900 hover:text-primary-700 text-sm">
                      {seller.name}
                    </Link>
                    <span className={`badge text-xs ${STATUS_BADGE[seller.status] || 'badge-gray'} capitalize`}>
                      {seller.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5 truncate">
                    {seller.ownerName} · {seller.address?.city} · {seller.email}
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap gap-2 flex-shrink-0">
                {seller.status !== 'approved' && seller.status !== 'suspended' && (
                  <Link to={`/admin/sellers/${seller._id}`} className="btn-primary gap-1.5 text-xs py-1.5 px-3">
                    <CheckCircleIcon className="w-3.5 h-3.5" /> Review
                  </Link>
                )}
                {seller.status === 'pending' && (
                  <button
                    onClick={() => setPendingAction({ id: seller._id, action: 'reject', name: seller.name })}
                    className="btn-outline gap-1.5 text-xs py-1.5 px-3 border-red-200 text-red-600 hover:bg-red-50"
                  >
                    <XCircleIcon className="w-3.5 h-3.5" /> Reject
                  </button>
                )}
                {seller.status === 'approved' && (
                  <button
                    onClick={() => setPendingAction({ id: seller._id, action: 'suspend', name: seller.name })}
                    className="btn-outline gap-1.5 text-xs py-1.5 px-3"
                  >
                    <PauseCircleIcon className="w-3.5 h-3.5" /> Suspend
                  </button>
                )}
                {seller.status === 'suspended' && (
                  <Link to={`/admin/sellers/${seller._id}`} className="btn-outline gap-1.5 text-xs py-1.5 px-3">
                    <PlayCircleIcon className="w-3.5 h-3.5" /> Review to reactivate
                  </Link>
                )}
                <Link to={`/admin/sellers/${seller._id}`} className="btn-ghost text-xs py-1.5 px-3">
                  Details →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirm modal */}
      {pendingAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => { setPendingAction(null); setReason(''); }} />
          <div className="relative card p-6 max-w-md w-full animate-fade-in-up" role="dialog" aria-modal="true">
            <h2 className="text-base font-semibold text-gray-900 mb-1 capitalize">
              {pendingAction.action} "{pendingAction.name}"?
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              {pendingAction.action === 'approve'
                ? 'This opens the Shop Admin and Product Admin workspaces for this nursery.'
                : pendingAction.action === 'reject'
                  ? 'Please provide a reason for the rejection.'
                  : 'This will prevent the nursery from accepting new orders.'}
            </p>
            {(pendingAction.action === 'reject' || pendingAction.action === 'suspend') && (
              <textarea
                className="input mb-4 resize-none"
                placeholder="Reason (optional)"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={2}
              />
            )}
            <div className="flex gap-3">
              <button onClick={confirm} className="btn-primary flex-1">Confirm</button>
              <button onClick={() => { setPendingAction(null); setReason(''); }} className="btn-ghost flex-1">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
