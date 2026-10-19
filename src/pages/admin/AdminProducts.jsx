import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import { formatPrice } from '../../utils/helpers';
import Pagination from '../../components/Pagination';
import { PageSpinner } from '../../components/Spinner';
import { PlusIcon, MagnifyingGlassIcon, CheckCircleIcon, XCircleIcon, EyeIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const STATUS_TABS = [
  { label: 'All',      value: '' },
  { label: 'Pending',  value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
];

const APPROVAL_STYLES = {
  approved: 'bg-emerald-100 text-emerald-800',
  pending:  'bg-amber-100 text-amber-700',
  rejected: 'bg-red-100 text-red-700',
};

function ApprovalBadge({ status }) {
  return (
    <span className={`badge text-xs ${APPROVAL_STYLES[status] || 'bg-gray-100 text-gray-600'}`}>
      {status || 'pending'}
    </span>
  );
}

function StockBadge({ stock }) {
  if (stock === 0)  return <span className="badge bg-red-100 text-red-700 text-xs">Out of stock</span>;
  if (stock <= 5)   return <span className="badge bg-amber-100 text-amber-700 text-xs">{stock} left</span>;
  return <span className="text-xs text-gray-500">{stock} in stock</span>;
}

export default function AdminProducts() {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'super_admin';

  const [products,   setProducts]   = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');
  const [approval,   setApproval]   = useState('');
  const [page,       setPage]       = useState(1);
  const [moderating, setModerating] = useState(null);

  const fetchProducts = async (p = 1, q = search, ap = approval) => {
    setLoading(true);
    try {
      const res = await adminAPI.getCatalog({ page: p, limit: 16, search: q || undefined, approval: ap || undefined });
      setProducts(res.data.products || []);
      setPagination(res.data.pagination || { page: 1, pages: 1, total: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(page, search, approval); }, [page, approval]); // eslint-disable-line

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchProducts(1, search, approval);
  };

  const moderate = async (product, action) => {
    setModerating(product._id);
    try {
      await adminAPI.moderateProduct(product._id, { approvalStatus: action, isActive: action === 'approved' });
      toast.success(action === 'approved' ? 'Product approved and published.' : 'Product rejected.');
      fetchProducts(page, search, approval);
    } finally {
      setModerating(null);
    }
  };

  const pendingCount = products.filter((p) => p.approvalStatus === 'pending').length;

  return (
    <div className="space-y-5 animate-fade-in">

      {/* ── Page header ──────────────────────────────────── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Products</h1>
          <p className="page-subtitle">
            {pagination.total} total
            {pendingCount > 0 && !approval && (
              <span className="ml-2 badge bg-amber-100 text-amber-700">{pendingCount} pending review</span>
            )}
          </p>
        </div>
        {!isSuperAdmin && (
          <Link to="/admin/products/new" className="btn-primary gap-2">
            <PlusIcon className="w-4 h-4" /> Add Product
          </Link>
        )}
      </div>

      {/* ── Filter bar ───────────────────────────────────── */}
      <div className="card p-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-0">
          <div className="relative flex-1 min-w-0">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products…"
              className="input pl-9 text-sm"
            />
          </div>
          <button type="submit" className="btn-primary text-sm px-4">Search</button>
        </form>
        {/* Approval tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 flex-shrink-0">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => { setApproval(tab.value); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                approval === tab.value ? 'bg-white text-primary-800 shadow-sm' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Product grid ─────────────────────────────────── */}
      {loading ? <PageSpinner /> : products.length === 0 ? (
        <div className="card">
          <div className="empty-state py-20">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
              <span className="text-2xl">🪴</span>
            </div>
            <p className="text-sm font-semibold text-gray-700 mb-1">No products found</p>
            <p className="text-xs text-gray-400">Try a different search or filter.</p>
          </div>
        </div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
            {products.map((p) => {
              const isPending  = p.approvalStatus === 'pending';
              const isApproved = p.approvalStatus === 'approved';
              const busy       = moderating === p._id;
              return (
                <div key={p._id} className="card flex flex-col group hover:shadow-card-hover transition-shadow duration-200 overflow-hidden">
                  {/* Image */}
                  <div className="relative h-44 bg-gray-100 overflow-hidden flex-shrink-0">
                    <img
                      src={p.images?.[0]?.url || 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=400'}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=400'; }}
                    />
                    <div className="absolute top-2.5 left-2.5 flex gap-1.5 flex-wrap">
                      <ApprovalBadge status={p.approvalStatus} />
                    </div>
                    {p.discountPercent > 0 && (
                      <div className="absolute top-2.5 right-2.5 bg-terracotta-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                        {p.discountPercent}% off
                      </div>
                    )}
                  </div>

                  {/* Body */}
                  <div className="p-4 flex flex-col flex-1 gap-2.5">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-primary-600 font-semibold uppercase tracking-wide truncate">{p.nursery?.name || '—'}</p>
                      <h3 className="font-semibold text-gray-900 leading-snug mt-0.5 line-clamp-2 text-sm">{p.name}</h3>
                      {p.sku && <p className="text-[11px] text-gray-400 mt-0.5 font-mono">{p.sku}</p>}
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <span className="text-base font-bold text-gray-900">{formatPrice(p.price)}</span>
                        {p.mrp > p.price && (
                          <span className="text-xs text-gray-400 line-through ml-1.5">{formatPrice(p.mrp)}</span>
                        )}
                      </div>
                      <StockBadge stock={p.stock} />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2 border-t border-gray-100">
                      <a
                        href={`/products/${p.slug || p._id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-icon"
                        title="View on store"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </a>

                      {!isSuperAdmin && (
                        <Link
                          to={`/admin/products/${p._id}/edit`}
                          className="flex-1 text-center text-xs font-semibold py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-gray-700"
                        >
                          Edit
                        </Link>
                      )}

                      {isPending && (
                        <>
                          <button
                            disabled={busy}
                            onClick={() => moderate(p, 'approved')}
                            className="flex-1 inline-flex items-center justify-center gap-1 text-xs font-semibold py-1.5 rounded-lg bg-primary-700 text-white hover:bg-primary-600 disabled:opacity-50 transition-colors"
                          >
                            <CheckCircleIcon className="w-3.5 h-3.5" /> Approve
                          </button>
                          <button
                            disabled={busy}
                            onClick={() => moderate(p, 'rejected')}
                            className="w-8 flex items-center justify-center rounded-lg border border-red-200 text-red-500 hover:bg-red-50 disabled:opacity-50 transition-colors"
                            title="Reject"
                          >
                            <XCircleIcon className="w-4 h-4" />
                          </button>
                        </>
                      )}

                      {isApproved && (
                        <button
                          disabled={busy}
                          onClick={() => moderate(p, 'rejected')}
                          className="flex-1 text-xs font-semibold py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors"
                        >
                          Unpublish
                        </button>
                      )}

                      {p.approvalStatus === 'rejected' && (
                        <button
                          disabled={busy}
                          onClick={() => moderate(p, 'approved')}
                          className="flex-1 inline-flex items-center justify-center gap-1 text-xs font-semibold py-1.5 rounded-lg bg-primary-700 text-white hover:bg-primary-600 disabled:opacity-50 transition-colors"
                        >
                          <CheckCircleIcon className="w-3.5 h-3.5" /> Re-approve
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <Pagination page={pagination.page} pages={pagination.pages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
