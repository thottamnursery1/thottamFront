import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { sellerAPI } from '../../services/api';
import { formatPrice } from '../../utils/helpers';
import { PlusIcon, MagnifyingGlassIcon, PencilIcon, TrashIcon, CubeIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = [
  { label: 'All',       value: '' },
  { label: 'Published', value: 'published' },
  { label: 'Pending',   value: 'pending' },
  { label: 'Draft',     value: 'draft' },
  { label: 'Rejected',  value: 'rejected' },
];

const APPROVAL_BADGE = {
  approved:  'badge-green',
  pending:   'badge-orange',
  rejected:  'badge-red',
  published: 'badge-green',
  draft:     'badge-gray',
};

export default function SellerProducts({ client = sellerAPI, basePath = '/seller/products' }) {
  const [products, setProducts] = useState([]);
  const [search,   setSearch]   = useState('');
  const [status,   setStatus]   = useState('');
  const [loading,  setLoading]  = useState(true);

  const load = (params = { search, status }) => {
    setLoading(true);
    client.products(params)
      .then((res) => setProducts(res.data.products || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []); // eslint-disable-line

  const handleDelete = async (product) => {
    if (!window.confirm(`Remove "${product.name}"? This cannot be undone.`)) return;
    await client.deleteProduct(product._id);
    toast.success('Product removed.');
    load();
  };

  return (
    <div className="space-y-5 animate-fade-in">

      <div className="page-header">
        <div>
          <h1 className="page-title">Products</h1>
          <p className="page-subtitle">{products.length} in your catalog</p>
        </div>
        <Link to={`${basePath}/new`} className="btn-primary gap-2">
          <PlusIcon className="w-4 h-4" /> Add Product
        </Link>
      </div>

      {/* Search + filter */}
      <div className="card p-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <form
          onSubmit={(e) => { e.preventDefault(); load({ search, status }); }}
          className="flex gap-2 flex-1 min-w-0"
        >
          <div className="relative flex-1 min-w-0">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search your plants…" className="input pl-9 text-sm" />
          </div>
          <button type="submit" className="btn-primary text-sm px-4">Search</button>
        </form>
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 flex-shrink-0">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { setStatus(opt.value); load({ search, status: opt.value }); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
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
                <li key={product._id} className="flex items-center gap-4 px-4 py-3.5 hover:bg-gray-50/70 transition-colors group">
                  {/* Image */}
                  <img
                    src={product.images?.[0]?.url || 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=60'}
                    alt={product.name}
                    className="w-12 h-12 rounded-xl object-cover flex-shrink-0 border border-gray-100"
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=60'; }}
                  />
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-gray-900 text-sm truncate">{product.name}</p>
                      <span className={`badge text-xs ${APPROVAL_BADGE[badgeKey] || 'badge-gray'} capitalize`}>
                        {badgeKey.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {formatPrice(product.price)} · {product.stock} in stock
                    </p>
                  </div>
                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link
                      to={`${basePath}/${product._id}/edit`}
                      className="btn-icon"
                      title="Edit"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(product)}
                      className="btn-icon text-red-400 hover:bg-red-50 hover:text-red-600"
                      title="Delete"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
