import { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';
import { formatPrice } from '../../utils/helpers';
import Pagination from '../../components/Pagination';
import { PageSpinner } from '../../components/Spinner';
import Modal from '../../components/Modal';
import toast from 'react-hot-toast';
import { ExclamationTriangleIcon, ArchiveBoxIcon } from '@heroicons/react/24/outline';

export default function AdminInventory() {
  const [products,   setProducts]   = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading,    setLoading]    = useState(true);
  const [lowStock,   setLowStock]   = useState(false);
  const [page,       setPage]       = useState(1);
  const [adjustForm, setAdjustForm] = useState(null);
  const [adjusting,  setAdjusting]  = useState(false);

  const fetchInventory = async (p = 1) => {
    setLoading(true);
    try {
      const res = await adminAPI.getInventory({ page: p, limit: 20, lowStock: lowStock || undefined });
      setProducts(res.data.products);
      setPagination(res.data.pagination);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInventory(page); }, [page, lowStock]); // eslint-disable-line

  const handleAdjust = async (e) => {
    e.preventDefault();
    setAdjusting(true);
    try {
      await adminAPI.adjustInventory({
        productId: adjustForm.productId,
        quantity:  Number(adjustForm.quantity),
        reason:    adjustForm.reason,
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

      <div className="page-header">
        <div>
          <h1 className="page-title">Inventory</h1>
          <p className="page-subtitle">{pagination.total} products</p>
        </div>
        {/* Low-stock toggle */}
        <label className="flex items-center gap-2.5 cursor-pointer select-none">
          <div
            onClick={() => { setLowStock((v) => !v); setPage(1); }}
            className="relative w-10 h-6 rounded-full transition-colors duration-200"
            style={{ background: lowStock ? '#d97706' : '#D1D5DB' }}
          >
            <div
              className="absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200"
              style={{ transform: lowStock ? 'translateX(20px)' : 'translateX(4px)' }}
            />
          </div>
          <span className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
            <ExclamationTriangleIcon className="w-4 h-4 text-amber-500" /> Low Stock Only
          </span>
        </label>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="py-16"><PageSpinner /></div>
        ) : products.length === 0 ? (
          <div className="empty-state py-16">
            <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mb-3">
              <ArchiveBoxIcon className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-sm text-gray-500">{lowStock ? 'No low-stock products 🎉' : 'No products found'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Threshold</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => {
                  const isLow = p.stock <= p.lowStockThreshold;
                  return (
                    <tr key={p._id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <img
                            src={p.images?.[0]?.url || 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=40'}
                            alt={p.name}
                            className="w-9 h-9 object-cover rounded-lg flex-shrink-0"
                            onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=40'; }}
                          />
                          <span className="font-medium text-gray-900 line-clamp-1 text-sm">{p.name}</span>
                        </div>
                      </td>
                      <td className="text-xs text-gray-400 font-mono">{p.sku || '—'}</td>
                      <td className="text-gray-600">{p.category?.name || '—'}</td>
                      <td className="font-semibold text-gray-900">{formatPrice(p.price)}</td>
                      <td>
                        <span className={`font-bold text-sm ${p.stock === 0 ? 'text-red-600' : isLow ? 'text-amber-600' : 'text-gray-800'}`}>
                          {p.stock}
                        </span>
                      </td>
                      <td className="text-gray-400 text-sm">{p.lowStockThreshold}</td>
                      <td>
                        <button
                          onClick={() => setAdjustForm({ productId: p._id, productName: p.name, quantity: '', reason: '' })}
                          className="text-xs font-medium text-primary-600 hover:text-primary-700"
                        >
                          Adjust
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {!loading && <Pagination page={pagination.page} pages={pagination.pages} onPageChange={setPage} />}

      {/* Adjust Modal */}
      {adjustForm && (
        <Modal open onClose={() => setAdjustForm(null)} title="Adjust Inventory" size="sm">
          <form onSubmit={handleAdjust} className="p-5 space-y-4">
            <p className="text-sm font-medium text-gray-700 bg-gray-50 px-3 py-2 rounded-lg">{adjustForm.productName}</p>
            <div className="field">
              <label className="label">Quantity Adjustment *</label>
              <input
                type="number"
                value={adjustForm.quantity}
                onChange={(e) => setAdjustForm({ ...adjustForm, quantity: e.target.value })}
                className="input text-sm" required
                placeholder="+10 to add stock, -5 to remove"
              />
              <p className="text-xs text-gray-400 mt-1">Positive to add, negative to deduct.</p>
            </div>
            <div className="field">
              <label className="label">Reason *</label>
              <textarea
                value={adjustForm.reason}
                onChange={(e) => setAdjustForm({ ...adjustForm, reason: e.target.value })}
                className="input text-sm resize-none" rows={2} required
                placeholder="e.g. Restocking, Damaged goods, Correction"
              />
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={adjusting} className="btn-primary flex-1">
                {adjusting ? 'Saving…' : 'Adjust Stock'}
              </button>
              <button type="button" onClick={() => setAdjustForm(null)} className="btn-ghost flex-1">Cancel</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
