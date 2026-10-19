import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { adminAPI, categoryAPI, productAPI } from '../../services/api';
import { PageSpinner } from '../../components/Spinner';
import toast from 'react-hot-toast';

const SUNLIGHT_OPTIONS = ['Full Sun', 'Partial Sun', 'Shade', 'Indirect Light', 'N/A'];
const WATER_OPTIONS = ['Daily', 'Every 2-3 Days', 'Weekly', 'Bi-weekly', 'Monthly', 'N/A'];
const CARE_OPTIONS = ['Easy', 'Moderate', 'Expert', 'N/A'];
const PLACE_OPTIONS = ['Indoor', 'Outdoor', 'Both', 'N/A'];

const defaultForm = {
  name: '', description: '', shortDescription: '', category: '',
  price: '', mrp: '', stock: '', lowStockThreshold: 5, sku: '',
  isActive: true, isFeatured: false, isBestSeller: false, isNewArrival: false, isOnSale: false,
  tags: '',
  plantInfo: {
    sunlightRequirement: 'N/A', wateringFrequency: 'N/A', careLevel: 'N/A',
    indoorOutdoor: 'N/A', petFriendly: true, airPurifying: false,
    height: '', potSize: '', season: '', careInstructions: '',
  },
};

export default function AdminProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState(defaultForm);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [imageFiles, setImageFiles] = useState([]);
  const [imageLoading, setImageLoading] = useState(false);

  useEffect(() => {
    categoryAPI.getAll().then((r) => setCategories(r.data.categories || []));
    if (isEdit) {
      productAPI.getOne(id).then((r) => {
        const p = r.data.product;
        setForm({
          ...defaultForm, ...p,
          category: p.category?._id || p.category,
          tags: (p.tags || []).join(', '),
          plantInfo: { ...defaultForm.plantInfo, ...p.plantInfo },
        });
      }).finally(() => setLoading(false));
    }
  }, [id]);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));
  const setPI = (key, val) => setForm((f) => ({ ...f, plantInfo: { ...f.plantInfo, [key]: val } }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        mrp: form.mrp ? Number(form.mrp) : undefined,
        stock: Number(form.stock),
        tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      };

      let product;
      if (isEdit) {
        const res = await adminAPI.updateProduct(id, payload);
        product = res.data.product;
        toast.success('Product updated!');
      } else {
        const res = await adminAPI.createProduct(payload);
        product = res.data.product;
        toast.success('Product created!');
      }

      // Upload images if any
      if (imageFiles.length > 0) {
        setImageLoading(true);
        const formData = new FormData();
        imageFiles.forEach((f) => formData.append('images', f));
        await adminAPI.uploadImages(product._id, formData);
        setImageLoading(false);
      }

      navigate('/admin/products');
    } finally {
      setSaving(false);
      setImageLoading(false);
    }
  };

  if (loading) return <PageSpinner />;

  const Field = ({ label, children, className = '' }) => (
    <div className={className}>
      <label className="label">{label}</label>
      {children}
    </div>
  );

  const Input = ({ name, type = 'text', ...rest }) => (
    <input type={type} value={form[name] ?? ''} onChange={(e) => set(name, e.target.value)}
      className="input" {...rest} />
  );

  const PIInput = ({ name, type = 'text', ...rest }) => (
    <input type={type} value={form.plantInfo?.[name] ?? ''} onChange={(e) => setPI(name, e.target.value)}
      className="input" {...rest} />
  );

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/admin/products" className="text-sm text-primary-600 hover:underline">← Products</Link>
      </div>
      <h1 className="text-2xl font-display font-bold text-gray-900 mb-8">
        {isEdit ? 'Edit Product' : 'Add New Product'}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white rounded-2xl shadow-card p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Basic Information</h2>
          <Field label="Product Name *">
            <Input name="name" required placeholder="e.g. Money Plant (Pothos)" />
          </Field>
          <Field label="Short Description">
            <textarea value={form.shortDescription} onChange={(e) => set('shortDescription', e.target.value)}
              className="input resize-none" rows={2} maxLength={300} placeholder="One-line summary shown on product cards" />
          </Field>
          <Field label="Full Description *">
            <textarea value={form.description} onChange={(e) => set('description', e.target.value)}
              className="input resize-none" rows={5} required maxLength={2000} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Category *">
              <select value={form.category} onChange={(e) => set('category', e.target.value)}
                className="input" required>
                <option value="">Select category</option>
                {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </Field>
            <Field label="SKU">
              <Input name="sku" placeholder="Optional unique SKU" />
            </Field>
          </div>
          <Field label="Tags (comma-separated)">
            <Input name="tags" placeholder="e.g. air-purifying, low-light, beginner" />
          </Field>
        </div>

        {/* Pricing & Stock */}
        <div className="bg-white rounded-2xl shadow-card p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Pricing & Stock</h2>
          <div className="grid grid-cols-3 gap-4">
            <Field label="Selling Price (₹) *">
              <Input name="price" type="number" min="0" step="0.01" required placeholder="0" />
            </Field>
            <Field label="MRP (₹)">
              <Input name="mrp" type="number" min="0" step="0.01" placeholder="0" />
            </Field>
            <Field label="Stock Qty *">
              <Input name="stock" type="number" min="0" required placeholder="0" />
            </Field>
          </div>
          <Field label="Low Stock Threshold" className="max-w-xs">
            <Input name="lowStockThreshold" type="number" min="0" />
          </Field>
        </div>

        {/* Flags */}
        <div className="bg-white rounded-2xl shadow-card p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Product Flags</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { key: 'isActive', label: 'Active' },
              { key: 'isFeatured', label: 'Featured' },
              { key: 'isBestSeller', label: 'Best Seller' },
              { key: 'isNewArrival', label: 'New Arrival' },
              { key: 'isOnSale', label: 'On Sale' },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form[key]} onChange={(e) => set(key, e.target.checked)}
                  className="w-4 h-4 text-primary-500 rounded" />
                <span className="text-sm text-gray-700">{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Plant Info */}
        <div className="bg-white rounded-2xl shadow-card p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Plant Information (optional)</h2>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Sunlight Requirement">
              <select value={form.plantInfo.sunlightRequirement} onChange={(e) => setPI('sunlightRequirement', e.target.value)} className="input">
                {SUNLIGHT_OPTIONS.map((o) => <option key={o}>{o}</option>)}
              </select>
            </Field>
            <Field label="Watering Frequency">
              <select value={form.plantInfo.wateringFrequency} onChange={(e) => setPI('wateringFrequency', e.target.value)} className="input">
                {WATER_OPTIONS.map((o) => <option key={o}>{o}</option>)}
              </select>
            </Field>
            <Field label="Care Level">
              <select value={form.plantInfo.careLevel} onChange={(e) => setPI('careLevel', e.target.value)} className="input">
                {CARE_OPTIONS.map((o) => <option key={o}>{o}</option>)}
              </select>
            </Field>
            <Field label="Indoor / Outdoor">
              <select value={form.plantInfo.indoorOutdoor} onChange={(e) => setPI('indoorOutdoor', e.target.value)} className="input">
                {PLACE_OPTIONS.map((o) => <option key={o}>{o}</option>)}
              </select>
            </Field>
            <Field label="Height (e.g. 30-60 cm)">
              <PIInput name="height" placeholder="30-60 cm" />
            </Field>
            <Field label="Pot Size (e.g. 4 inch)">
              <PIInput name="potSize" placeholder="4 inch" />
            </Field>
            <Field label="Flowering Season">
              <PIInput name="season" placeholder="Spring-Summer" />
            </Field>
          </div>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.plantInfo.petFriendly}
                onChange={(e) => setPI('petFriendly', e.target.checked)} className="w-4 h-4 text-primary-500 rounded" />
              <span className="text-sm text-gray-700">Pet Friendly</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.plantInfo.airPurifying}
                onChange={(e) => setPI('airPurifying', e.target.checked)} className="w-4 h-4 text-primary-500 rounded" />
              <span className="text-sm text-gray-700">Air Purifying</span>
            </label>
          </div>
          <Field label="Care Instructions">
            <textarea value={form.plantInfo.careInstructions} onChange={(e) => setPI('careInstructions', e.target.value)}
              className="input resize-none" rows={3} placeholder="Detailed care guide for customers" />
          </Field>
        </div>

        {/* Images */}
        <div className="bg-white rounded-2xl shadow-card p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Product Images</h2>
          <input type="file" accept="image/*" multiple onChange={(e) => setImageFiles(Array.from(e.target.files))}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 file:cursor-pointer" />
          {imageFiles.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {imageFiles.map((f, i) => (
                <div key={i} className="relative">
                  <img src={URL.createObjectURL(f)} alt="" className="w-16 h-16 object-cover rounded-lg" />
                </div>
              ))}
            </div>
          )}
          <p className="text-xs text-gray-400 mt-2">Max 5 images, 5MB each. JPEG, PNG or WebP.</p>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button type="submit" disabled={saving || imageLoading} className="btn-primary py-3 px-8">
            {saving || imageLoading ? 'Saving...' : isEdit ? 'Update Product' : 'Create Product'}
          </button>
          <Link to="/admin/products" className="btn-ghost py-3">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
