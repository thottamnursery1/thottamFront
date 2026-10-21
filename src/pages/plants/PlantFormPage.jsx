import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { plantAPI } from '../../services/api';

const CATEGORIES = ['herb', 'indoor', 'outdoor', 'seedling', 'flowering', 'succulent', 'gardening'];
const empty = {
  name: '', listingType: 'FreeAdoption', category: 'herb', description: '', careInstructions: '',
  condition: 'healthy', size: 'medium', potSize: '', quantity: 1, reason: '', pickupAvailability: '',
  collectionInstructions: '', desiredPlants: '', exchangeCategories: [], exchangeNotes: '',
  price: '', mrp: '', fulfillment: ['pickup'], city: '', postalCode: '', area: '', lat: '', lng: '',
};

export default function PlantFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(empty);
  const [images, setImages] = useState([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    plantAPI.get(id).then((res) => {
      const listing = res.data.listing;
      setForm({ ...empty, ...listing, price: listing.price || '', mrp: listing.mrp || '' });
      setImages((listing.images || []).map((image) => ({ url: image.url, preview: image.url })));
    }).catch(() => setError('This listing could not be loaded.'));
  }, [id]);

  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const addFiles = async (fileList) => {
    const files = [...fileList].slice(0, 6 - images.length);
    const previews = files.map((file) => ({ file, preview: URL.createObjectURL(file), url: '', error: '' }));
    setImages((current) => [...current, ...previews]);
    const body = new FormData();
    files.forEach((file) => body.append('images', file));
    try {
      const res = await plantAPI.upload(body);
      setImages((current) => {
        const next = [...current];
        const start = next.length - files.length;
        res.data.images.forEach((image, index) => {
          if (next[start + index]) next[start + index] = { ...next[start + index], url: image.url, publicId: image.publicId };
        });
        return next;
      });
    } catch (err) {
      setImages((current) => current.map((image) => (image.file && !image.url ? { ...image, error: 'Upload failed. You can remove it and try again.' } : image)));
      setError(err.response?.data?.message || 'Image upload failed. Your other details are still here.');
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    if (form.name.trim().length < 2 || form.description.trim().length < 10) {
      setError('Add a plant name and a description of at least 10 characters.');
      return;
    }
    if (!/^\d{6}$/.test(form.postalCode)) { setError('Enter a 6-digit PIN code.'); return; }
    const ready = images.filter((image) => image.url);
    if (!ready.length) { setError('Add a photo of the actual plant.'); return; }
    setSaving(true);
    try {
      const payload = { ...form, images: ready.map((image) => ({ url: image.url, publicId: image.publicId })), publish: true };
      const res = id ? await plantAPI.update(id, payload) : await plantAPI.create(payload);
      toast.success('Plant listing saved.');
      navigate(`/plants/${res.data.listing._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'The listing could not be saved.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="container-custom py-8 max-w-3xl space-y-5">
      <div>
        <h1 className="page-title">{id ? 'Edit plant' : 'List a plant'}</h1>
        <p className="page-subtitle">Adoption and exchange are free. Selling uses the existing community checkout after seller approval.</p>
      </div>
      {error && <p className="text-red-600 text-sm" role="alert">{error}</p>}
      <div className="card p-5 grid sm:grid-cols-2 gap-4">
        <label className="text-sm">Plant name<input className="input mt-1" value={form.name} onChange={(e) => set('name', e.target.value)} /></label>
        <label className="text-sm">Listing type
          <select className="input mt-1" value={form.listingType} disabled={Boolean(id)} onChange={(e) => set('listingType', e.target.value)}>
            <option value="FreeAdoption">Free adoption</option>
            <option value="Exchange">Plant exchange</option>
            <option value="Sale">For sale</option>
          </select>
        </label>
        <label className="text-sm">Category
          <select className="input mt-1" value={form.category} onChange={(e) => set('category', e.target.value)}>
            {CATEGORIES.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>
        <label className="text-sm">Condition
          <select className="input mt-1" value={form.condition} onChange={(e) => set('condition', e.target.value)}>
            <option value="healthy">Healthy</option>
            <option value="fair">Fair</option>
            <option value="needs_care">Needs care</option>
          </select>
        </label>
        <label className="text-sm sm:col-span-2">Description<textarea className="input mt-1 min-h-28" value={form.description} onChange={(e) => set('description', e.target.value)} /></label>
        <label className="text-sm sm:col-span-2">Care instructions<textarea className="input mt-1" value={form.careInstructions} onChange={(e) => set('careInstructions', e.target.value)} /></label>
        <label className="text-sm">Size
          <select className="input mt-1" value={form.size} onChange={(e) => set('size', e.target.value)}>
            <option value="small">Small</option><option value="medium">Medium</option><option value="large">Large</option>
          </select>
        </label>
        <label className="text-sm">Pot size<input className="input mt-1" value={form.potSize} onChange={(e) => set('potSize', e.target.value)} /></label>
        <label className="text-sm">Quantity<input className="input mt-1" type="number" min="1" value={form.quantity} onChange={(e) => set('quantity', Number(e.target.value))} /></label>
      </div>
      {form.listingType === 'FreeAdoption' && (
        <div className="card p-5 grid gap-3">
          <input className="input" placeholder="Reason for giving it away (optional)" value={form.reason} onChange={(e) => set('reason', e.target.value)} />
          <input className="input" placeholder="Pickup availability" value={form.pickupAvailability} onChange={(e) => set('pickupAvailability', e.target.value)} />
          <textarea className="input" placeholder="Collection instructions, shared only after acceptance" value={form.collectionInstructions} onChange={(e) => set('collectionInstructions', e.target.value)} />
        </div>
      )}
      {form.listingType === 'Exchange' && (
        <div className="card p-5 grid gap-3">
          <input className="input" placeholder="Plants you would like in return" value={form.desiredPlants} onChange={(e) => set('desiredPlants', e.target.value)} />
          <textarea className="input" placeholder="Exchange preferences" value={form.exchangeNotes} onChange={(e) => set('exchangeNotes', e.target.value)} />
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((item) => (
              <label key={item} className="text-sm flex items-center gap-1">
                <input type="checkbox" checked={form.exchangeCategories.includes(item)} onChange={(e) => set('exchangeCategories', e.target.checked ? [...form.exchangeCategories, item] : form.exchangeCategories.filter((value) => value !== item))} />
                {item}
              </label>
            ))}
          </div>
        </div>
      )}
      {form.listingType === 'Sale' && (
        <div className="card p-5 grid sm:grid-cols-2 gap-3">
          <input className="input" type="number" placeholder="Selling price" value={form.price} onChange={(e) => set('price', e.target.value)} />
          <input className="input" type="number" placeholder="Original price, optional" value={form.mrp} onChange={(e) => set('mrp', e.target.value)} />
          <p className="text-sm text-muted sm:col-span-2">Paid plants go through the existing Razorpay checkout. You need an approved community seller profile.</p>
        </div>
      )}
      <div className="card p-5 grid sm:grid-cols-2 gap-3">
        <input className="input" placeholder="City" value={form.city} onChange={(e) => set('city', e.target.value)} />
        <input className="input" placeholder="PIN code" value={form.postalCode} onChange={(e) => set('postalCode', e.target.value)} />
        <input className="input sm:col-span-2" placeholder="Approximate pickup area, not your full address" value={form.area} onChange={(e) => set('area', e.target.value)} />
        <button type="button" className="btn-outline sm:col-span-2" onClick={() => {
          if (!navigator.geolocation) { setError('This browser cannot read your location. City and PIN are enough.'); return; }
          navigator.geolocation.getCurrentPosition((pos) => {
            setForm((current) => ({ ...current, lat: pos.coords.latitude, lng: pos.coords.longitude }));
          }, () => setError('Location permission was denied. You can still publish with city and PIN.'));
        }}>Use my approximate location</button>
        {form.lat && <p className="text-xs text-muted sm:col-span-2">Approximate location saved for distance search. It is not shown as an address.</p>}
        <p className="text-xs text-muted sm:col-span-2">Do not list prohibited, invasive, or restricted species. Your street address is not shown publicly.</p>
      </div>
      <div className="card p-5">
        <label className="btn-outline inline-block cursor-pointer">
          Add photos
          <input className="hidden" type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(e) => { addFiles(e.target.files); e.target.value = ''; }} />
        </label>
        <div className="grid grid-cols-3 gap-3 mt-4">
          {images.map((image, index) => (
            <div key={image.preview} className="relative">
              <img src={image.preview} alt="" className="h-28 w-full object-cover rounded-xl" />
              {image.error && <p className="text-xs text-red-600">{image.error}</p>}
              <button type="button" className="text-xs mt-1" onClick={() => setImages((current) => current.filter((_, item) => item !== index))}>Remove</button>
            </div>
          ))}
        </div>
      </div>
      <button className="btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Publish listing'}</button>
    </form>
  );
}
