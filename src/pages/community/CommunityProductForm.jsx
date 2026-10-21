import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { categoryAPI, communityAPI } from '../../services/api';
import toast from 'react-hot-toast';

const empty = {
  name: '', category: '', price: '', mrp: '', stock: 1, plantType: 'herb', plantForm: 'mature',
  description: '', careInstructions: '', height: '', potSize: '', dispatchPrepHours: 24,
  localDeliveryFee: 40, imageUrls: '', pickup: true, local: true, courier: false,
};

export default function CommunityProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(empty);
  const [categories, setCategories] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    categoryAPI.getAll().then((res) => setCategories(res.data.categories || [])).catch(() => {});
    if (!id) return;
    communityAPI.products().then((res) => {
      const product = (res.data.products || []).find((item) => item._id === id);
      if (!product) return;
      setForm({
        name: product.name,
        category: product.category?._id || product.category,
        price: product.price,
        mrp: product.mrp || '',
        stock: product.stock,
        plantType: product.plantType || 'herb',
        plantForm: product.plantForm || 'mature',
        description: product.description,
        careInstructions: product.plantInfo?.careInstructions || '',
        height: product.plantInfo?.height || '',
        potSize: product.plantInfo?.potSize || '',
        dispatchPrepHours: product.dispatchPrepHours || 24,
        localDeliveryFee: product.localDeliveryFee ?? 40,
        imageUrls: (product.images || []).map((img) => img.url).join('\n'),
        pickup: product.fulfillmentOptions?.includes('pickup') ?? true,
        local: product.fulfillmentOptions?.includes('local_delivery') ?? true,
        courier: product.fulfillmentOptions?.includes('courier') || false,
      });
    });
  }, [id]);

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const submit = async (event) => {
    event.preventDefault();
    const fulfillmentOptions = [
      form.pickup && 'pickup',
      form.local && 'local_delivery',
      form.courier && 'courier',
    ].filter(Boolean);
    const payload = {
      ...form,
      price: Number(form.price),
      mrp: form.mrp === '' ? undefined : Number(form.mrp),
      stock: Number(form.stock),
      dispatchPrepHours: Number(form.dispatchPrepHours),
      localDeliveryFee: Number(form.localDeliveryFee),
      fulfillmentOptions,
      plantInfo: { height: form.height, potSize: form.potSize, careInstructions: form.careInstructions, indoorOutdoor: 'Both', careLevel: 'Easy' },
    };
    setSaving(true);
    try {
      if (id) await communityAPI.updateProduct(id, payload);
      else await communityAPI.createProduct(payload);
      toast.success(id ? 'Listing updated.' : 'Listing published.');
      navigate('/community/products');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="max-w-3xl space-y-5">
      <div>
        <h1 className="page-title">{id ? 'Edit listing' : 'List a plant'}</h1>
        <p className="page-subtitle">Use a photo of the actual plant. Care notes help buyers keep it alive.</p>
      </div>
      <div className="card p-5 grid sm:grid-cols-2 gap-4">
        <label className="text-sm sm:col-span-2">Name
          <input id="plant-name" className="input mt-1" value={form.name} onChange={(e) => set('name', e.target.value)} required />
        </label>
        <label className="text-sm">Category
          <select id="plant-category" className="input mt-1" value={form.category} onChange={(e) => set('category', e.target.value)} required>
            <option value="">Select</option>
            {categories.map((category) => <option key={category._id} value={category._id}>{category.name}</option>)}
          </select>
        </label>
        <label className="text-sm">Form
          <select id="plant-form" className="input mt-1" value={form.plantForm} onChange={(e) => set('plantForm', e.target.value)}>
            {['seedling', 'cutting', 'propagated', 'mature', 'supply'].map((formName) => <option key={formName} value={formName}>{formName}</option>)}
          </select>
        </label>
        <label className="text-sm">Price (₹)
          <input id="plant-price" type="number" min="1" className="input mt-1" value={form.price} onChange={(e) => set('price', e.target.value)} required />
        </label>
        <label className="text-sm">MRP (₹)
          <input id="plant-mrp" type="number" min="0" className="input mt-1" value={form.mrp} onChange={(e) => set('mrp', e.target.value)} />
        </label>
        <label className="text-sm">Stock
          <input id="plant-stock" type="number" min="0" className="input mt-1" value={form.stock} onChange={(e) => set('stock', e.target.value)} required />
        </label>
        <label className="text-sm">Type
          <select id="plant-type" className="input mt-1" value={form.plantType} onChange={(e) => set('plantType', e.target.value)}>
            {['herb', 'foliage', 'flowering', 'succulent', 'fruit', 'seed', 'other'].map((type) => <option key={type} value={type}>{type}</option>)}
          </select>
        </label>
        <label className="text-sm sm:col-span-2">Description
          <textarea id="plant-description" className="input mt-1 min-h-24" value={form.description} onChange={(e) => set('description', e.target.value)} required />
        </label>
        <label className="text-sm sm:col-span-2">Care instructions
          <textarea id="plant-care" className="input mt-1 min-h-20" value={form.careInstructions} onChange={(e) => set('careInstructions', e.target.value)} required />
        </label>
        <label className="text-sm">Plant size
          <input id="plant-height" className="input mt-1" value={form.height} onChange={(e) => set('height', e.target.value)} placeholder="20–30 cm" />
        </label>
        <label className="text-sm">Pot size
          <input id="plant-pot" className="input mt-1" value={form.potSize} onChange={(e) => set('potSize', e.target.value)} placeholder="4 inch" />
        </label>
        <label className="text-sm">Prep time (hours)
          <input id="plant-prep" type="number" min="0" className="input mt-1" value={form.dispatchPrepHours} onChange={(e) => set('dispatchPrepHours', e.target.value)} />
        </label>
        <label className="text-sm">Local delivery fee (₹)
          <input id="plant-fee" type="number" min="0" className="input mt-1" value={form.localDeliveryFee} onChange={(e) => set('localDeliveryFee', e.target.value)} />
        </label>
        <div className="sm:col-span-2 flex flex-wrap gap-4 text-sm">
          <label><input type="checkbox" checked={form.pickup} onChange={(e) => set('pickup', e.target.checked)} /> Customer pickup</label>
          <label><input type="checkbox" checked={form.local} onChange={(e) => set('local', e.target.checked)} /> Local delivery</label>
          <label><input type="checkbox" checked={form.courier} onChange={(e) => set('courier', e.target.checked)} /> Courier</label>
        </div>
        <label className="text-sm sm:col-span-2">Image URLs, one https link per line
          <textarea id="plant-images" className="input mt-1 min-h-24" value={form.imageUrls} onChange={(e) => set('imageUrls', e.target.value)} required />
        </label>
      </div>
      <button className="btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save listing'}</button>
    </form>
  );
}
