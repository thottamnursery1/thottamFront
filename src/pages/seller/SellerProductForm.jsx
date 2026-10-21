import { Children, useEffect, useId, useRef, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { sellerAPI, categoryAPI } from '../../services/api';
import toast from 'react-hot-toast';
import {
  CloudArrowUpIcon, XMarkIcon, ArrowLeftIcon,
  PhotoIcon, CheckCircleIcon, ChevronDownIcon,
} from '@heroicons/react/24/outline';

/* ─── constants ─────────────────────────────────────────────── */
const SUNLIGHT = ['Full Sun', 'Partial Sun', 'Shade', 'Indirect Light', 'N/A'];
const WATERING = ['Daily', 'Every 2-3 Days', 'Weekly', 'Bi-weekly', 'Monthly', 'N/A'];
const CARE_LVL = ['Easy', 'Moderate', 'Expert', 'N/A'];
const IN_OUT   = ['Indoor', 'Outdoor', 'Both', 'N/A'];

const empty = {
  name: '', description: '', shortDescription: '', category: '', price: '',
  discountPrice: '', sku: '', stock: 0, plantType: 'foliage',
  beginnerFriendly: false, seasonalCollection: '',
  deliveryAvailability: 'Delivered by this nursery.',
  listingStatus: 'pending',
  plantInfo: {
    sunlightRequirement: 'Indirect Light', wateringFrequency: 'Weekly',
    careLevel: 'Easy', indoorOutdoor: 'Indoor',
    height: '', potSize: '', soil: '', maintenance: '', careInstructions: '',
  },
  imageUrls: '',
};

/* ─── primitives — defined at module level, never inside a render ─── */

function SectionCard({ title, subtitle, children }) {
  return (
    <div className="bg-white rounded-[1.4rem] shadow-sm border border-gray-100 p-6 space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        {subtitle && <p className="text-xs text-muted mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

/**
 * Field — wraps a form control with a label, hint, and error message.
 * IMPORTANT: uses a <div> as the outer wrapper (NOT a <label>) so that
 * re-renders never trigger the browser's implicit label–click behavior,
 * which would steal focus from the input on every keystroke.
 */
function Field({ id, label, required, error, hint, children }) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      {children}
      {hint && !error && <p className="text-xs text-muted">{hint}</p>}
      {error && (
        <p className="text-xs text-red-600 flex items-center gap-1">
          <span aria-hidden="true">⚠</span>{error}
        </p>
      )}
    </div>
  );
}

function FormInput({ id, error, ...props }) {
  return (
    <input
      id={id}
      {...props}
      className={[
        'w-full px-3.5 py-2.5 rounded-xl border text-sm bg-white',
        'transition-colors focus:outline-none focus:ring-2',
        'focus:ring-primary-400/30 focus:border-primary-500',
        error
          ? 'border-red-400 bg-red-50/40'
          : 'border-gray-200 hover:border-gray-300',
      ].join(' ')}
    />
  );
}

function FormTextarea({ id, error, ...props }) {
  return (
    <textarea
      id={id}
      {...props}
      className={[
        'w-full px-3.5 py-2.5 rounded-xl border text-sm bg-white resize-none',
        'transition-colors focus:outline-none focus:ring-2',
        'focus:ring-primary-400/30 focus:border-primary-500',
        error
          ? 'border-red-400 bg-red-50/40'
          : 'border-gray-200 hover:border-gray-300',
      ].join(' ')}
    />
  );
}

function choiceOptions(children) {
  return Children.toArray(children)
    .filter((child) => child?.props)
    .map((child) => {
      const label = child.props.children ?? '';
      const value = child.props.value != null && child.props.value !== ''
        ? String(child.props.value)
        : String(label);
      return { value, label: String(label) };
    });
}

function FormSelect({ id, error, value, onChange, children }) {
  const listId = useId();
  const [open, setOpen] = useState(false);
  const options = choiceOptions(children);
  const selected = options.find((option) => option.value === String(value ?? ''));
  const placeholder = options.find((option) => option.value === '')?.label || 'Choose one';
  const choices = options.filter((option) => option.value !== '');

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => { if (event.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [open]);

  const choose = (next) => {
    onChange?.({ target: { value: next } });
    setOpen(false);
  };

  return (
    <>
      <button
        id={id}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen(true)}
        className={[
          'flex w-full items-center justify-between gap-3 rounded-xl border bg-white px-3.5 py-2.5 text-left text-sm',
          'transition-colors focus:outline-none focus:ring-2 focus:ring-primary-400/30 focus:border-primary-500',
          error ? 'border-red-400 bg-red-50/40' : 'border-gray-200 hover:border-gray-300',
        ].join(' ')}
      >
        <span className={selected && selected.value !== '' ? 'text-ink' : 'text-gray-400'}>
          {selected && selected.value !== '' ? selected.label : placeholder}
        </span>
        <ChevronDownIcon className="h-4 w-4 shrink-0 text-gray-400" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
          <button type="button" className="absolute inset-0 bg-primary-950/45" aria-label="Close choices" onClick={() => setOpen(false)} />
          <div className="relative flex max-h-[80vh] w-full flex-col rounded-t-3xl bg-[#F8F6EF] shadow-2xl sm:max-w-md sm:rounded-3xl">
            <div className="flex items-center justify-between px-5 pb-3 pt-5">
              <h3 className="font-display text-2xl text-primary-800">{placeholder}</h3>
              <button type="button" onClick={() => setOpen(false)} className="rounded-full p-2 text-muted hover:bg-white" aria-label="Close">
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <ul id={listId} role="listbox" className="space-y-1 overflow-y-auto px-3 pb-5">
              {choices.map((option) => {
                const active = option.value === String(value ?? '');
                return (
                  <li key={option.value}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={active}
                      onClick={() => choose(option.value)}
                      className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm ${
                        active ? 'bg-white text-primary-800 shadow-sm' : 'text-ink hover:bg-white/70'
                      }`}
                    >
                      <span className="font-medium">{option.label}</span>
                      {active && <CheckCircleIcon className="h-5 w-5 text-primary-600" />}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}

function ImageThumb({ src, onRemove, isPrimary }) {
  return (
    <div className="relative group">
      <img
        src={src}
        alt=""
        className="w-20 h-20 object-cover rounded-xl border border-gray-200"
      />
      {isPrimary && (
        <span className="absolute bottom-1 left-1 bg-primary-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md leading-none">
          PRIMARY
        </span>
      )}
      <button
        type="button"
        onClick={onRemove}
        aria-label="Remove image"
        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full
          flex items-center justify-center opacity-0 group-hover:opacity-100
          transition-opacity shadow"
      >
        <XMarkIcon className="w-3 h-3" />
      </button>
    </div>
  );
}

/* ─── main component ─────────────────────────────────────────── */
export default function SellerProductForm({ client = sellerAPI, basePath = '/seller/products' }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const fileInputRef = useRef(null);

  const [form, setForm]         = useState(empty);
  const [categories, setCats]   = useState([]);
  const [errors, setErrors]     = useState({});
  const [saving, setSaving]     = useState(false);
  const [files, setFiles]       = useState([]);
  const [previews, setPreviews] = useState([]);

  /* clean up blob URLs on unmount */
  useEffect(() => {
    return () => {
      previews.forEach((p) => { if (p.isBlob) URL.revokeObjectURL(p.url); });
    };
  }, [previews]);

  useEffect(() => {
    categoryAPI.getAll().then((res) => setCats(res.data.categories || []));
    if (id) {
      client.getProduct(id).then((res) => {
        const p = res.data.product;
        setForm({
          ...empty, ...p,
          category:      p.category?._id || p.category,
          price:         p.mrp && p.mrp > p.price ? p.mrp : p.price,
          discountPrice: p.mrp && p.mrp > p.price ? p.price : '',
          plantInfo:     { ...empty.plantInfo, ...p.plantInfo },
          imageUrls:     (p.images || []).map((img) => img.url).join('\n'),
          listingStatus: p.listingStatus || 'pending',
        });
        if (p.images?.length) {
          setPreviews(p.images.map((img) => ({ url: img.url, isBlob: false })));
        }
      });
    }
  }, [id]);

  const setField = (key, val) => setForm((f) => ({ ...f, [key]: val }));
  const setCare  = (key, val) => setForm((f) => ({ ...f, plantInfo: { ...f.plantInfo, [key]: val } }));

  const handleFiles = (picked) => {
    const next = [...files, ...picked].slice(0, 5);
    setFiles(next);
    const remote = previews.filter((p) => !p.isBlob);
    const blobs  = next.map((file) => ({ url: URL.createObjectURL(file), isBlob: true }));
    setPreviews([...remote, ...blobs]);
  };

  const removePreview = (index) => {
    const p = previews[index];
    if (p.isBlob) {
      URL.revokeObjectURL(p.url);
      const blobsBefore = previews.slice(0, index).filter((x) => x.isBlob).length;
      setFiles((prev) => prev.filter((_, i) => i !== blobsBefore));
    }
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim())        e.name        = 'Product name is required';
    if (!form.description.trim()) e.description = 'Description is required';
    if (!form.category)           e.category    = 'Choose a category';
    if (form.price === '' || Number(form.price) < 0)
      e.price = 'Enter a valid price';
    if (form.discountPrice !== '' && Number(form.discountPrice) >= Number(form.price))
      e.price = 'Discount price must be lower than the list price';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const save = async (e, intent) => {
    e.preventDefault();
    if (!validate()) { window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    setSaving(true);
    const urls      = String(form.imageUrls || '').split('\n').map((u) => u.trim()).filter(Boolean);
    const listPrice = Number(form.price);
    const discount  = form.discountPrice === '' ? null : Number(form.discountPrice);
    const payload   = {
      ...form,
      price:         discount != null ? discount : listPrice,
      mrp:           listPrice,
      stock:         Number(form.stock) || 0,
      images:        urls.map((url) => ({ url, alt: form.name })),
      listingStatus: intent,
    };
    delete payload.imageUrls;
    delete payload.discountPrice;
    try {
      let productId = id;
      if (id) {
        await client.updateProduct(id, payload);
      } else {
        const created = await client.createProduct(payload);
        productId = created.data.product._id;
      }
      if (files.length && productId) {
        const fd = new FormData();
        files.forEach((f) => fd.append('images', f));
        await client.uploadImages(productId, fd);
      }
      toast.success(
        intent === 'draft' ? 'Draft saved.'
        : intent === 'keep' ? 'Changes saved.'
        : 'Product added successfully!'
      );
      navigate(basePath);
    } finally {
      setSaving(false);
    }
  };

  const isLive       = form.listingStatus === 'published' || form.listingStatus === 'out_of_stock';
  const submitIntent = isLive ? 'keep' : 'pending';
  const submitLabel  = saving ? 'Saving…'
    : isEdit ? (isLive ? 'Save changes' : 'Update product')
    : 'Add product';

  const discountPct =
    form.discountPrice && Number(form.discountPrice) > 0 &&
    Number(form.price) > 0 &&
    Number(form.discountPrice) < Number(form.price)
      ? Math.round(((Number(form.price) - Number(form.discountPrice)) / Number(form.price)) * 100)
      : 0;

  return (
    <div className="min-h-screen bg-[#f7f6f2]">

      {/* ── sticky top bar ── */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-100
        px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            to={basePath}
            className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors flex-shrink-0"
          >
            <ArrowLeftIcon className="w-4 h-4" />
          </Link>
          <div className="min-w-0">
            <h1 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
              {isEdit ? 'Edit product' : 'Add product'}
            </h1>
            {isEdit && (
              <p className="text-xs text-muted hidden sm:block">
                Status: <span className="capitalize">{form.listingStatus?.replace('_', ' ')}</span>
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            type="button"
            disabled={saving}
            onClick={(e) => save(e, 'draft')}
            className="px-4 py-2 rounded-xl border border-gray-300 text-sm font-medium
              text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Save draft
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={(e) => save(e, submitIntent)}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-primary-700
              text-white text-sm font-semibold hover:bg-primary-800 active:bg-primary-900
              transition-colors disabled:opacity-50 shadow-sm"
          >
            {saving
              ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              : <CheckCircleIcon className="w-4 h-4" />
            }
            {submitLabel}
          </button>
        </div>
      </div>

      {/* ── page body ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid lg:grid-cols-[1fr_360px] gap-6 items-start">

          {/* ── LEFT COLUMN ── */}
          <div className="space-y-5">

            {/* Basic information */}
            <SectionCard title="Basic information" subtitle="How customers will find and understand your product.">
              <Field id="f-name" label="Product name" required error={errors.name}>
                <FormInput
                  id="f-name"
                  value={form.name}
                  onChange={(e) => setField('name', e.target.value)}
                  placeholder="e.g. Jasmine (Mogra)"
                  error={errors.name}
                />
              </Field>

              <Field id="f-short" label="Short description" hint="One line shown on product cards.">
                <FormInput
                  id="f-short"
                  value={form.shortDescription}
                  onChange={(e) => setField('shortDescription', e.target.value)}
                  placeholder="e.g. Fragrant white flowering vine"
                />
              </Field>

              <Field id="f-desc" label="Description" required error={errors.description}>
                <FormTextarea
                  id="f-desc"
                  rows={5}
                  value={form.description}
                  onChange={(e) => setField('description', e.target.value)}
                  placeholder="Describe the plant — origin, benefits, appearance, ideal settings…"
                  error={errors.description}
                />
              </Field>

              <Field id="f-cat" label="Category" required error={errors.category}>
                <FormSelect
                  id="f-cat"
                  value={form.category}
                  onChange={(e) => setField('category', e.target.value)}
                  error={errors.category}
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </FormSelect>
              </Field>
            </SectionCard>

            {/* Price & inventory */}
            <SectionCard title="Price & inventory" subtitle="Set your pricing and available stock.">
              <div className="grid sm:grid-cols-2 gap-4">
                <Field id="f-price" label="List price (₹)" required error={errors.price}>
                  <FormInput
                    id="f-price"
                    type="number" min="0" step="0.01"
                    value={form.price}
                    onChange={(e) => setField('price', e.target.value)}
                    placeholder="0"
                    error={errors.price}
                  />
                </Field>

                <Field id="f-disc" label="Discount price (₹)" hint="Optional. Must be lower than list price.">
                  <FormInput
                    id="f-disc"
                    type="number" min="0" step="0.01"
                    value={form.discountPrice}
                    onChange={(e) => setField('discountPrice', e.target.value)}
                    placeholder="Leave blank if no discount"
                  />
                </Field>

                <Field id="f-sku" label="SKU" hint="Your internal product code.">
                  <FormInput
                    id="f-sku"
                    value={form.sku}
                    onChange={(e) => setField('sku', e.target.value)}
                    placeholder="e.g. PLT-001"
                  />
                </Field>

                <Field id="f-stock" label="Available stock">
                  <FormInput
                    id="f-stock"
                    type="number" min="0"
                    value={form.stock}
                    onChange={(e) => setField('stock', e.target.value)}
                    placeholder="0"
                  />
                </Field>
              </div>

              {discountPct > 0 && (
                <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50
                  border border-emerald-200 rounded-xl px-3 py-2">
                  <CheckCircleIcon className="w-4 h-4 flex-shrink-0" />
                  <span>
                    {discountPct}% discount applied. Customers pay{' '}
                    ₹{Number(form.discountPrice).toLocaleString('en-IN')}.
                  </span>
                </div>
              )}
            </SectionCard>

            {/* Plant care */}
            <SectionCard title="Plant care" subtitle="Help customers understand how to care for this plant.">
              <div className="grid sm:grid-cols-2 gap-4">
                <Field id="f-height" label="Plant height / size">
                  <FormInput
                    id="f-height"
                    value={form.plantInfo.height}
                    onChange={(e) => setCare('height', e.target.value)}
                    placeholder="e.g. 30–60 cm"
                  />
                </Field>

                <Field id="f-pot" label="Pot size">
                  <FormInput
                    id="f-pot"
                    value={form.plantInfo.potSize}
                    onChange={(e) => setCare('potSize', e.target.value)}
                    placeholder="e.g. 6 inch"
                  />
                </Field>

                <Field id="f-sun" label="Sunlight requirement">
                  <FormSelect
                    id="f-sun"
                    value={form.plantInfo.sunlightRequirement}
                    onChange={(e) => setCare('sunlightRequirement', e.target.value)}
                  >
                    {SUNLIGHT.map((v) => <option key={v}>{v}</option>)}
                  </FormSelect>
                </Field>

                <Field id="f-water" label="Watering frequency">
                  <FormSelect
                    id="f-water"
                    value={form.plantInfo.wateringFrequency}
                    onChange={(e) => setCare('wateringFrequency', e.target.value)}
                  >
                    {WATERING.map((v) => <option key={v}>{v}</option>)}
                  </FormSelect>
                </Field>

                <Field id="f-care" label="Care level">
                  <FormSelect
                    id="f-care"
                    value={form.plantInfo.careLevel}
                    onChange={(e) => setCare('careLevel', e.target.value)}
                  >
                    {CARE_LVL.map((v) => <option key={v}>{v}</option>)}
                  </FormSelect>
                </Field>

                <Field id="f-inout" label="Indoor / Outdoor">
                  <FormSelect
                    id="f-inout"
                    value={form.plantInfo.indoorOutdoor}
                    onChange={(e) => setCare('indoorOutdoor', e.target.value)}
                  >
                    {IN_OUT.map((v) => <option key={v}>{v}</option>)}
                  </FormSelect>
                </Field>

                <Field id="f-soil" label="Soil type">
                  <FormInput
                    id="f-soil"
                    value={form.plantInfo.soil}
                    onChange={(e) => setCare('soil', e.target.value)}
                    placeholder="e.g. Well-draining potting mix"
                  />
                </Field>

                <Field id="f-maint" label="Maintenance">
                  <FormInput
                    id="f-maint"
                    value={form.plantInfo.maintenance}
                    onChange={(e) => setCare('maintenance', e.target.value)}
                    placeholder="e.g. Prune monthly"
                  />
                </Field>
              </div>

              <Field id="f-careinstr" label="Care instructions" hint="Detailed guidance shown on the product page.">
                <FormTextarea
                  id="f-careinstr"
                  rows={3}
                  value={form.plantInfo.careInstructions}
                  onChange={(e) => setCare('careInstructions', e.target.value)}
                  placeholder="Step-by-step care guide…"
                />
              </Field>

              {/* Toggle — plain checkbox to avoid label-click focus issues */}
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  role="switch"
                  aria-checked={form.beginnerFriendly}
                  onClick={() => setField('beginnerFriendly', !form.beginnerFriendly)}
                  className={[
                    'w-10 h-6 rounded-full transition-colors flex items-center px-0.5 flex-shrink-0',
                    form.beginnerFriendly ? 'bg-primary-600' : 'bg-gray-200',
                  ].join(' ')}
                >
                  <span className={[
                    'w-5 h-5 bg-white rounded-full shadow-sm transition-transform',
                    form.beginnerFriendly ? 'translate-x-4' : 'translate-x-0',
                  ].join(' ')} />
                </button>
                <span className="text-sm text-gray-700 select-none">Suitable for beginners</span>
              </div>
            </SectionCard>

            {/* Delivery */}
            <SectionCard title="Delivery & availability" subtitle="Shown to customers at checkout.">
              <Field id="f-delivery" label="Delivery availability note">
                <FormInput
                  id="f-delivery"
                  value={form.deliveryAvailability}
                  onChange={(e) => setField('deliveryAvailability', e.target.value)}
                  placeholder="e.g. Delivered by this nursery within 3–5 days"
                />
              </Field>
            </SectionCard>
          </div>

          {/* ── RIGHT COLUMN ── */}
          <div className="space-y-5 lg:sticky lg:top-[72px]">

            {/* Images */}
            <SectionCard title="Product images" subtitle="Up to 5 images. First image is the primary.">
              <div
                role="button"
                tabIndex={0}
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const dropped = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith('image/'));
                  if (dropped.length) handleFiles(dropped);
                }}
                className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center
                  cursor-pointer hover:border-primary-400 hover:bg-primary-50/30 transition-colors group"
              >
                {previews.length === 0 ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-gray-100 group-hover:bg-primary-100
                      flex items-center justify-center transition-colors">
                      <PhotoIcon className="w-6 h-6 text-gray-400 group-hover:text-primary-600" />
                    </div>
                    <p className="text-sm font-medium text-gray-700">Click or drag images here</p>
                    <p className="text-xs text-muted">JPEG, PNG, WebP · max 5 images</p>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 justify-center">
                    <CloudArrowUpIcon className="w-4 h-4 text-primary-600" />
                    <span className="text-sm text-primary-700 font-medium">Add more images</span>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="sr-only"
                  onChange={(e) => {
                    const picked = Array.from(e.target.files || []);
                    if (picked.length) handleFiles(picked);
                    e.target.value = '';
                  }}
                />
              </div>

              {previews.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {previews.map((p, i) => (
                    <ImageThumb
                      key={p.url}
                      src={p.url}
                      isPrimary={i === 0}
                      onRemove={() => removePreview(i)}
                    />
                  ))}
                </div>
              )}

              <details>
                <summary className="text-xs text-primary-700 font-medium cursor-pointer
                  select-none hover:underline list-none">
                  + Add by URL instead
                </summary>
                <div className="mt-2 space-y-1">
                  <FormTextarea
                    rows={3}
                    value={form.imageUrls}
                    onChange={(e) => {
                      setField('imageUrls', e.target.value);
                      const firstUrl = e.target.value.split('\n')[0].trim();
                      if (firstUrl && !previews.some((p) => p.url === firstUrl)) {
                        setPreviews((prev) => [
                          { url: firstUrl, isBlob: false },
                          ...prev.filter((p) => p.isBlob),
                        ]);
                      }
                    }}
                    placeholder="https://example.com/plant.jpg"
                  />
                  <p className="text-xs text-muted">One URL per line.</p>
                </div>
              </details>
            </SectionCard>

            {/* Pricing preview */}
            {form.price !== '' && (
              <div className="bg-white rounded-[1.4rem] shadow-sm border border-gray-100 p-5 space-y-2">
                <p className="text-sm font-semibold text-gray-700">Pricing preview</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-gray-900">
                    ₹{(form.discountPrice ? Number(form.discountPrice) : Number(form.price)).toLocaleString('en-IN')}
                  </span>
                  {form.discountPrice && Number(form.discountPrice) < Number(form.price) && (
                    <span className="text-sm text-muted line-through">
                      ₹{Number(form.price).toLocaleString('en-IN')}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted">{Number(form.stock) || 0} units in stock</p>
              </div>
            )}

            {/* Mobile action buttons */}
            <div className="lg:hidden flex flex-col gap-2 pt-2">
              <button
                type="button"
                disabled={saving}
                onClick={(e) => save(e, submitIntent)}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl
                  bg-primary-700 text-white text-sm font-semibold hover:bg-primary-800
                  transition-colors disabled:opacity-50 shadow-sm"
              >
                {saving
                  ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  : <CheckCircleIcon className="w-4 h-4" />
                }
                {submitLabel}
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={(e) => save(e, 'draft')}
                className="w-full px-5 py-3 rounded-xl border border-gray-300 text-sm font-medium
                  text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Save draft
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
