import { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';
import { formatDate, formatPrice } from '../../utils/helpers';
import { PageSpinner } from '../../components/Spinner';
import { PlusIcon, PencilIcon, TrashIcon, TagIcon } from '@heroicons/react/24/outline';
import Modal from '../../components/Modal';
import toast from 'react-hot-toast';

const emptyForm = {
  code: '', description: '', discountType: 'percentage', discountValue: '',
  maxDiscountAmount: '', minOrderAmount: '', maxUsageCount: '', maxUsagePerUser: 1,
  validFrom: '', validUntil: '', isActive: true,
};

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form,    setForm]    = useState(null);
  const [saving,  setSaving]  = useState(false);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getCoupons();
      setCoupons(res.data.coupons);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchCoupons(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        discountValue:    Number(form.discountValue),
        maxDiscountAmount: form.maxDiscountAmount ? Number(form.maxDiscountAmount) : undefined,
        minOrderAmount:   form.minOrderAmount ? Number(form.minOrderAmount) : 0,
        maxUsageCount:    form.maxUsageCount ? Number(form.maxUsageCount) : null,
        maxUsagePerUser:  Number(form.maxUsagePerUser),
      };
      if (form._id) { await adminAPI.updateCoupon(form._id, payload); toast.success('Coupon updated.'); }
      else          { await adminAPI.createCoupon(payload);            toast.success('Coupon created.'); }
      setForm(null);
      fetchCoupons();
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this coupon permanently?')) return;
    await adminAPI.deleteCoupon(id);
    toast.success('Coupon deleted.');
    fetchCoupons();
  };

  if (loading) return <PageSpinner />;

  return (
    <div className="space-y-5 animate-fade-in">

      <div className="page-header">
        <div>
          <h1 className="page-title">Coupons</h1>
          <p className="page-subtitle">{coupons.length} configured</p>
        </div>
        <button onClick={() => setForm({ ...emptyForm })} className="btn-primary gap-2">
          <PlusIcon className="w-4 h-4" /> Add Coupon
        </button>
      </div>

      {coupons.length === 0 ? (
        <div className="card">
          <div className="empty-state py-16">
            <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mb-3">
              <TagIcon className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-sm text-gray-500">No coupons yet. Create your first one.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {coupons.map((c) => {
            const now      = new Date();
            const isActive = c.isActive && now >= new Date(c.validFrom) && now <= new Date(c.validUntil);
            return (
              <div key={c._id} className="card p-5 flex flex-col gap-3 hover:shadow-card-hover transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0">
                      <TagIcon className="w-4 h-4 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-bold text-primary-700 font-mono text-base">{c.code}</p>
                      {c.description && <p className="text-xs text-gray-400 mt-0.5">{c.description}</p>}
                    </div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button onClick={() => setForm(c)} className="btn-icon"><PencilIcon className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleDelete(c._id)} className="btn-icon text-red-400 hover:bg-red-50 hover:text-red-600"><TrashIcon className="w-3.5 h-3.5" /></button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className={`badge text-xs ${isActive ? 'badge-green' : 'badge-gray'}`}>
                      {isActive ? 'Active' : 'Inactive'}
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      {c.discountType === 'percentage' ? `${c.discountValue}%` : `₹${c.discountValue}`} off
                      {c.maxDiscountAmount && c.discountType === 'percentage' && ` (max ${formatPrice(c.maxDiscountAmount)})`}
                    </span>
                  </div>
                  {c.minOrderAmount > 0 && (
                    <p className="text-xs text-gray-500">Min order {formatPrice(c.minOrderAmount)}</p>
                  )}
                  <p className="text-xs text-gray-500">
                    Used {c.usedCount} / {c.maxUsageCount ?? '∞'} · max {c.maxUsagePerUser} per customer
                  </p>
                </div>

                <div className="border-t border-gray-100 pt-2.5">
                  <p className="text-xs text-gray-400">
                    {formatDate(c.validFrom)} — {formatDate(c.validUntil)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Form Modal */}
      {form && (
        <Modal open onClose={() => setForm(null)} title={form._id ? 'Edit Coupon' : 'New Coupon'} size="lg">
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="field">
                <label className="label">Code *</label>
                <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  className="input font-mono uppercase" required maxLength={20} placeholder="SAVE10" />
              </div>
              <div className="field">
                <label className="label">Status</label>
                <select value={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.value === 'true' })} className="input">
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
            </div>
            <div className="field">
              <label className="label">Description</label>
              <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="input" placeholder="e.g. 10% off your first order" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="field">
                <label className="label">Discount Type *</label>
                <select value={form.discountType} onChange={(e) => setForm({ ...form, discountType: e.target.value })} className="input" required>
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (₹)</option>
                </select>
              </div>
              <div className="field">
                <label className="label">Value *</label>
                <input type="number" step="0.01" min="0" value={form.discountValue}
                  onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                  className="input" required placeholder={form.discountType === 'percentage' ? '10' : '100'} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="field">
                <label className="label">Min Order (₹)</label>
                <input type="number" step="0.01" min="0" value={form.minOrderAmount}
                  onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })} className="input" placeholder="0" />
              </div>
              <div className="field">
                <label className="label">Max Discount Cap (₹)</label>
                <input type="number" step="0.01" min="0" value={form.maxDiscountAmount}
                  onChange={(e) => setForm({ ...form, maxDiscountAmount: e.target.value })} className="input" placeholder="No cap" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="field">
                <label className="label">Valid From *</label>
                <input type="datetime-local" value={form.validFrom}
                  onChange={(e) => setForm({ ...form, validFrom: e.target.value })} className="input" required />
              </div>
              <div className="field">
                <label className="label">Valid Until *</label>
                <input type="datetime-local" value={form.validUntil}
                  onChange={(e) => setForm({ ...form, validUntil: e.target.value })} className="input" required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="field">
                <label className="label">Max Total Uses</label>
                <input type="number" min="1" value={form.maxUsageCount}
                  onChange={(e) => setForm({ ...form, maxUsageCount: e.target.value })} className="input" placeholder="Unlimited" />
              </div>
              <div className="field">
                <label className="label">Max Per Customer *</label>
                <input type="number" min="1" value={form.maxUsagePerUser}
                  onChange={(e) => setForm({ ...form, maxUsagePerUser: e.target.value })} className="input" required />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={saving} className="btn-primary flex-1">
                {saving ? 'Saving…' : form._id ? 'Update Coupon' : 'Create Coupon'}
              </button>
              <button type="button" onClick={() => setForm(null)} className="btn-ghost flex-1">Cancel</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
