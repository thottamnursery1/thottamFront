import { useEffect, useState } from 'react';
import { categoryAPI, adminAPI } from '../../services/api';
import { PageSpinner } from '../../components/Spinner';
import { PlusIcon, PencilIcon, TrashIcon, Squares2X2Icon } from '@heroicons/react/24/outline';
import Modal from '../../components/Modal';
import toast from 'react-hot-toast';

const emptyForm = { name: '', description: '', icon: '', isActive: true, sortOrder: 0 };

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [form,       setForm]       = useState(null);
  const [saving,     setSaving]     = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await categoryAPI.getAll();
      setCategories(res.data.categories || []);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (form._id) { await adminAPI.updateCategory(form._id, form); toast.success('Category updated.'); }
      else          { await adminAPI.createCategory(form);            toast.success('Category created.'); }
      setForm(null);
      fetchCategories();
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category? This will fail if products are assigned to it.')) return;
    try { await adminAPI.deleteCategory(id); toast.success('Category deleted.'); fetchCategories(); } catch { /* toast from interceptor */ }
  };

  if (loading) return <PageSpinner />;

  return (
    <div className="space-y-5 animate-fade-in">

      <div className="page-header">
        <div>
          <h1 className="page-title">Categories</h1>
          <p className="page-subtitle">{categories.length} configured</p>
        </div>
        <button onClick={() => setForm({ ...emptyForm })} className="btn-primary gap-2">
          <PlusIcon className="w-4 h-4" /> Add Category
        </button>
      </div>

      {categories.length === 0 ? (
        <div className="card">
          <div className="empty-state py-16">
            <Squares2X2Icon className="w-10 h-10 text-gray-300 mb-3" />
            <p className="text-sm text-gray-500">No categories yet.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <div key={cat._id} className="card p-5 flex flex-col items-center text-center hover:shadow-card-hover transition-shadow group">
              <div className="w-14 h-14 rounded-2xl bg-primary-50 flex items-center justify-center text-3xl mb-3 group-hover:scale-110 transition-transform">
                {cat.icon || '🪴'}
              </div>
              <h3 className="font-semibold text-gray-900 text-sm leading-tight">{cat.name}</h3>
              {cat.description && (
                <p className="text-xs text-gray-400 mt-1 line-clamp-2 leading-relaxed">{cat.description}</p>
              )}
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100 w-full justify-center">
                <span className={`badge text-xs ${cat.isActive ? 'badge-green' : 'badge-gray'}`}>
                  {cat.isActive ? 'Active' : 'Inactive'}
                </span>
                <button
                  onClick={() => setForm({ ...cat })}
                  className="btn-icon w-7 h-7"
                  title="Edit"
                >
                  <PencilIcon className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(cat._id)}
                  className="btn-icon w-7 h-7 text-red-400 hover:bg-red-50 hover:text-red-600"
                  title="Delete"
                >
                  <TrashIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {form && (
        <Modal open onClose={() => setForm(null)} title={form._id ? 'Edit Category' : 'New Category'} size="sm">
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div className="field">
              <label className="label">Name *</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input" required maxLength={50} placeholder="Indoor Plants" />
            </div>
            <div className="field">
              <label className="label">Icon / Emoji</label>
              <input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })}
                className="input text-2xl" placeholder="🪴" maxLength={10} />
            </div>
            <div className="field">
              <label className="label">Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="input resize-none" rows={2} maxLength={500} placeholder="Short description…" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="field">
                <label className="label">Sort Order</label>
                <input type="number" min="0" value={form.sortOrder}
                  onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} className="input" />
              </div>
              <div className="field">
                <label className="label">Status</label>
                <select value={String(form.isActive)}
                  onChange={(e) => setForm({ ...form, isActive: e.target.value === 'true' })} className="input">
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 pt-1">
              <button type="submit" disabled={saving} className="btn-primary flex-1">
                {saving ? 'Saving…' : form._id ? 'Update' : 'Create'}
              </button>
              <button type="button" onClick={() => setForm(null)} className="btn-ghost flex-1">Cancel</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
