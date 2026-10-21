import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { sellerAPI } from '../../services/api';
import { formatPrice } from '../../utils/helpers';
import { PlusIcon, MagnifyingGlassIcon, PencilIcon, TrashIcon, CubeIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import ConfirmDialog from '../../components/ConfirmDialog';

const STATUS_OPTIONS = [
  { label: 'All',       value: '' },
  { label: 'Published', value: 'published' },
  { label: 'Pending',   value: 'pending' },
  { label: 'Draft',     value: 'draft' },
  { label: 'Rejected',  value: 'rejected' },
];

const APPROVAL_BADGE = {
  approved: 'badge-green',
  pending: 'badge-orange',
  rejected: 'badge-red',
  published: 'badge-green',
  draft: 'badge-gray',
  out_of_stock: 'badge-red',
};

const statusLabel = (value) => String(value || 'pending').replace(/_/g, ' ');

export default function SellerProducts({ client = sellerAPI, basePath = '/seller/products' }) {
  const [products, setProducts] = useState([]);
  const [search,   setSearch]   = useState('');
  const [status,   setStatus]   = useState('');
  const [loading,  setLoading]  = useState(true);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [removing, setRemoving] = useState(false);

  const load = (params = { search, status }) => {
    setLoading(true);
    client.products(params)
      .then((res) => setProducts(res.data.products || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []); // eslint-disable-line

  const handleDelete = async () => {
    if (!pendingDelete) return;
    setRemoving(true);
    try {
      await client.deleteProduct(pendingDelete._id);
      toast.success('Product removed.');
      setPendingDelete(null);
      load();
    } finally {
      setRemoving(false);
    }
  };

  return (
    <div className="space-y-5 animate-fade-in">

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="page-title">Products</h1>
          <p className="page-subtitle">{products.length} in your catalog</p>
        </div>
        <Link to={`${basePath}/new`} className="btn-primary w-full justify-center sm:w-auto">
          <PlusIcon className="h-4 w-4" /> Add Product
        </Link>
      </div>

      <div className="space-y-3 rounded-[14px] bg-white p-3 shadow-card sm:p-4">
        <form
          onSubmit={(e) => { e.preventDefault(); load({ search, status }); }}
          className="flex gap-2"
        >
          <div className="relative min-w-0 flex-1">
            <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search your plants…" className="input pl-9 text-sm" />
          </div>
          <button type="submit" className="btn-primary shrink-0 px-4 text-sm">Search</button>
        </form>
        <div className="grid grid-cols-3 gap-1 rounded-xl bg-gray-100 p-1 sm:grid-cols-5">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { setStatus(opt.value); load({ search, status: opt.value }); }}
              className={`rounded-lg px-2 py-2 text-center text-xs font-semibold transition-all ${
                status === opt.value ? 'bg-white text-primary-800 shadow-sm' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Product list */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="h-20 skeleton rounded-[14px]" />)}
        </div>
      ) : products.length === 0 ? (
        <div className="card">
          <div className="empty-state py-16">
            <CubeIcon className="w-10 h-10 text-gray-300 mb-3" />
            <p className="text-sm font-semibold text-gray-600 mb-1">Your bench is clear</p>
            <p className="text-xs text-gray-400 mb-4">Add a plant and it'll wait here until the platform approves it.</p>
            <Link to={`${basePath}/new`} className="btn-primary gap-2 text-sm">
              <PlusIcon className="w-4 h-4" /> Add Product
            </Link>
          </div>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <ul className="divide-y divide-gray-50">
            {products.map((product) => {
              const badgeKey = product.listingStatus || product.approvalStatus || 'pending';
              return (
                <li key={product._id} className="flex items-center gap-3 px-3 py-3 transition-colors hover:bg-gray-50/70 sm:gap-4 sm:px-4 sm:py-3.5">
                  <img
                    src={product.images?.[0]?.url || 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=120'}
                    alt=""
                    className="h-14 w-14 shrink-0 rounded-xl border border-gray-100 object-cover"
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=120'; }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-gray-900">{product.name}</p>
                    <span className={`badge mt-1 text-xs capitalize ${APPROVAL_BADGE[badgeKey] || 'badge-gray'}`}>
                      {statusLabel(badgeKey)}
                    </span>
                    <p className="mt-1 text-xs text-gray-500">
                      {formatPrice(product.price)} · {product.stock} in stock
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <Link
                      to={`${basePath}/${product._id}/edit`}
                      className="btn-icon"
                      aria-label={`Edit ${product.name}`}
                    >
                      <PencilIcon className="h-4 w-4" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => setPendingDelete(product)}
                      className="btn-icon text-red-400 hover:bg-red-50 hover:text-red-600"
                      aria-label={`Remove ${product.name}`}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title={pendingDelete ? `Remove ${pendingDelete.name}?` : 'Remove product?'}
        message="This plant will leave your catalog. This cannot be undone."
        confirmLabel="Remove"
        cancelLabel="Keep it"
        busy={removing}
        onConfirm={handleDelete}
        onClose={() => { if (!removing) setPendingDelete(null); }}
      />
    </div>
  );
}
