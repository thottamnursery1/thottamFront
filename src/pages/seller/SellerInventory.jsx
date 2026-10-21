import { useEffect, useState } from 'react';
import { sellerAPI } from '../../services/api';
import { formatPrice } from '../../utils/helpers';
import Pagination from '../../components/Pagination';
import { PageSpinner } from '../../components/Spinner';
import Modal from '../../components/Modal';
import toast from 'react-hot-toast';
import { ExclamationTriangleIcon, ArchiveBoxIcon } from '@heroicons/react/24/outline';

const FALLBACK = 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=80';

function stockClass(stock, threshold) {
  if (stock === 0) return 'text-red-600';
  if (stock <= threshold) return 'text-amber-600';
  return 'text-primary-800';
}

export default function SellerInventory() {
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [lowStock, setLowStock] = useState(false);
  const [page, setPage] = useState(1);
  const [adjustForm, setAdjustForm] = useState(null);
  const [adjusting, setAdjusting] = useState(false);

  const fetchInventory = async (p = 1) => {
    setLoading(true);
    try {
      const res = await sellerAPI.inventory({ page: p, limit: 20, lowStock: lowStock || undefined });
      setProducts(res.data.products || []);
      setPagination(res.data.pagination || { page: 1, pages: 1, total: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInventory(page); }, [page, lowStock]); // eslint-disable-line

  const openAdjust = (product) => setAdjustForm({
    productId: product._id,
    productName: product.name,
    quantity: '',
    reason: '',
  });

  const handleAdjust = async (event) => {
    event.preventDefault();
    setAdjusting(true);
    try {
      await sellerAPI.adjustInventory({
        productId: adjustForm.productId,
        quantity: Number(adjustForm.quantity),
        reason: adjustForm.reason,
      });
      toast.success('Inventory adjusted.');
      setAdjustForm(null);
      fetchInventory(page);
    } finally {
      setAdjusting(false);
    }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="page-title">Inventory</h1>
          <p className="page-subtitle">{pagination.total} products in this shop</p>
        </div>
        <button
          type="button"
          onClick={() => { setLowStock((value) => !value); setPage(1); }}
          className="inline-flex items-center gap-2.5 self-start rounded-full border border-line bg-white px-3 py-2 text-sm font-medium text-gray-700"
          aria-pressed={lowStock}
        >
          <span className="relative h-6 w-10 rounded-full transition-colors" style={{ background: lowStock ? '#d97706' : '#D1D5DB' }}>
            <span className="absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-transform" style={{ transform: lowStock ? 'translateX(20px)' : 'translateX(4px)' }} />
          </span>
          <ExclamationTriangleIcon className="h-4 w-4 text-amber-500" />
          Low stock only
        </button>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="py-16"><PageSpinner /></div>
        ) : products.length === 0 ? (
          <div className="empty-state py-16">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100">
              <ArchiveBoxIcon className="h-6 w-6 text-gray-400" />
            </div>
            <p className="text-sm text-gray-500">{lowStock ? 'Nothing in this shop is low on stock.' : 'This shop has no products yet.'}</p>
          </div>
        ) : (
          <>
            <ul className="divide-y divide-gray-100 md:hidden">
              {products.map((product) => (
                <li key={product._id} className="space-y-3 p-4">
                  <div className="flex items-center gap-3">
                    <img src={product.images?.[0]?.url || FALLBACK} alt="" className="h-12 w-12 shrink-0 rounded-xl object-cover" onError={(event) => { event.target.src = FALLBACK; }} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-gray-900">{product.name}</p>
                      <p className="truncate text-xs text-gray-500">{product.category?.name || 'Uncategorised'}{product.sku ? ` · ${product.sku}` : ''}</p>
                    </div>
                  </div>
                  <dl className="grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <dt className="text-xs text-gray-400">Price</dt>
                      <dd className="font-semibold text-gray-900">{formatPrice(product.price)}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-gray-400">Stock</dt>
                      <dd className={`font-bold ${stockClass(product.stock, product.lowStockThreshold)}`}>{product.stock}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-gray-400">Threshold</dt>
                      <dd className="text-gray-700">{product.lowStockThreshold}</dd>
                    </div>
                  </dl>
                  <button type="button" onClick={() => openAdjust(product)} className="btn-outline w-full py-2 text-sm">Adjust stock</button>
                </li>
              ))}
            </ul>

            <div className="hidden overflow-x-auto md:block">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Threshold</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product._id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <img src={product.images?.[0]?.url || FALLBACK} alt="" className="h-9 w-9 shrink-0 rounded-lg object-cover" onError={(event) => { event.target.src = FALLBACK; }} />
                          <span className="text-sm font-medium text-gray-900">{product.name}</span>
                        </div>
                      </td>
                      <td className="text-gray-600">{product.category?.name || '—'}</td>
                      <td className="font-semibold text-gray-900">{formatPrice(product.price)}</td>
                      <td><span className={`text-sm font-bold ${stockClass(product.stock, product.lowStockThreshold)}`}>{product.stock}</span></td>
                      <td className="text-sm text-gray-500">{product.lowStockThreshold}</td>
                      <td>
                        <button type="button" onClick={() => openAdjust(product)} className="text-xs font-medium text-primary-700 hover:text-primary-500">Adjust</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {!loading && <Pagination page={pagination.page} pages={pagination.pages} onPageChange={setPage} />}

      {adjustForm && (
        <Modal open onClose={() => setAdjustForm(null)} title="Adjust stock" size="sm">
          <form onSubmit={handleAdjust} className="space-y-4 p-5">
            <p className="rounded-lg bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700">{adjustForm.productName}</p>
            <div className="field">
              <label className="label">Quantity change</label>
              <input
                type="number"
                value={adjustForm.quantity}
                onChange={(event) => setAdjustForm({ ...adjustForm, quantity: event.target.value })}
                className="input text-sm"
                required
                placeholder="+10 to add, -5 to remove"
              />
            </div>
            <div className="field">
              <label className="label">Reason</label>
              <textarea
                value={adjustForm.reason}
                onChange={(event) => setAdjustForm({ ...adjustForm, reason: event.target.value })}
                className="input resize-none text-sm"
                rows={2}
                required
                placeholder="Restock, damaged plants, or a correction"
              />
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={adjusting} className="btn-primary flex-1">{adjusting ? 'Saving…' : 'Save stock'}</button>
              <button type="button" onClick={() => setAdjustForm(null)} className="btn-ghost flex-1">Cancel</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
