import { useEffect, useState } from 'react';
import { nurseryAPI, sellerAPI } from '../../services/api';
import toast from 'react-hot-toast';
import {
  BuildingStorefrontIcon, MapPinIcon, PhoneIcon, ClockIcon,
  PhotoIcon, CurrencyRupeeIcon, GlobeAltIcon,
} from '@heroicons/react/24/outline';
import ChoiceSelect from '../../components/ChoiceSelect';
import ShopPaymentMethods, { PAYMENT_REQUIRED_MESSAGE, paymentPayload, paymentReady, paymentsFromNursery } from '../../components/ShopPaymentMethods';

const STATES = [
  'Andhra Pradesh','Assam','Bihar','Chhattisgarh','Delhi','Goa','Gujarat','Haryana',
  'Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra',
  'Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim',
  'Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal',
];

function Field({ label, children, col2 }) {
  return (
    <div className={`field ${col2 ? 'sm:col-span-2' : ''}`}>
      <label className="label">{label}</label>
      {children}
    </div>
  );
}

function SectionCard({ icon: Icon, title, subtitle, children }) {
  return (
    <div className="card p-5 space-y-4">
      <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
        <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">
          <Icon className="w-4 h-4 text-primary-600" />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">{title}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

export default function SellerProfile() {
  const [form,   setForm]   = useState(null);
  const [saving, setSaving] = useState(false);
  const [payments, setPayments] = useState(null);
  const [savingPayments, setSavingPayments] = useState(false);

  useEffect(() => {
    nurseryAPI.myApplication().then((res) => {
      const n = res.data.nursery;
      setForm({
        sellerCode:      n.sellerCode,
        name:            n.name,
        status:          n.status,
        description:     n.description || '',
        phone:           n.phone || '',
        logo:            n.logo || '',
        coverImage:      n.coverImage || '',
        serviceablePins: (n.serviceablePins || []).join(', '),
        line1:           n.address?.line1 || '',
        line2:           n.address?.line2 || '',
        city:            n.address?.city || '',
        state:           n.address?.state || '',
        postalCode:      n.address?.postalCode || '',
        businessHours:   n.businessHours || '9:00–18:00',
        deliveryCharge:  n.deliveryCharge || 0,
        shopOpen:        n.shopOpen !== false,
      });
      setPayments(paymentsFromNursery(n.paymentMethods));
    });
  }, []);

  if (!form) return (
    <div className="space-y-4">
      <div className="h-10 skeleton rounded-xl w-48" />
      <div className="h-44 skeleton rounded-[14px]" />
      <div className="h-56 skeleton rounded-[14px]" />
    </div>
  );

  const set  = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));
  const bind = (key) => ({ value: form[key], onChange: (e) => set(key, e.target.value) });

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await sellerAPI.updateProfile(form);
      toast.success('Nursery profile saved.');
    } finally {
      setSaving(false);
    }
  };

  const statusColor = {
    approved: 'bg-emerald-100 text-emerald-800',
    pending:  'bg-amber-100 text-amber-800',
    rejected: 'bg-red-100 text-red-700',
  }[form.status] || 'bg-gray-100 text-gray-600';

  const savePayments = async (event) => {
    event.preventDefault();
    if (!paymentReady(payments).any) return;
    setSavingPayments(true);
    try {
      await nurseryAPI.updatePaymentMethods(paymentPayload(payments));
      toast.success('Payment methods saved.');
    } finally {
      setSavingPayments(false);
    }
  };

  return (
    <div className="space-y-5 max-w-3xl animate-fade-in">
    <form onSubmit={save} className="space-y-5">

      {/* ── Page header ──────────────────────────────────── */}
      <div className="page-header">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="page-title">{form.name}</h1>
            <span className={`badge text-xs ${statusColor}`}>{form.status}</span>
          </div>
          <p className="page-subtitle">
            Seller ID: <span className="font-mono font-semibold text-gray-700">{form.sellerCode || 'Pending assignment'}</span>
          </p>
        </div>
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? 'Saving…' : 'Save Profile'}
        </button>
      </div>

      {/* ── About ────────────────────────────────────────── */}
      <SectionCard icon={BuildingStorefrontIcon} title="About the Nursery" subtitle="Shown on your public shop page">
        <Field label="Description">
          <textarea className="input min-h-[110px] resize-y" {...bind('description')} placeholder="Tell customers about your nursery…" />
        </Field>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Phone">
            <div className="relative">
              <PhoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input className="input pl-9" type="tel" {...bind('phone')} placeholder="10-digit mobile" />
            </div>
          </Field>
          <Field label="Serviceable PIN Codes">
            <input className="input" {...bind('serviceablePins')} placeholder="560001, 560038, 560044" />
          </Field>
        </div>
      </SectionCard>

      {/* ── Media ────────────────────────────────────────── */}
      <SectionCard icon={PhotoIcon} title="Media" subtitle="Logo and cover image URLs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Logo URL">
            <input className="input" type="url" {...bind('logo')} placeholder="https://…" />
          </Field>
          <Field label="Cover Image URL">
            <input className="input" type="url" {...bind('coverImage')} placeholder="https://…" />
          </Field>
        </div>
        {/* Preview strip */}
        {(form.logo || form.coverImage) && (
          <div className="flex items-center gap-3 mt-1">
            {form.logo && (
              <img src={form.logo} alt="Logo preview"
                className="w-12 h-12 rounded-lg object-cover border border-gray-100"
                onError={(e) => { e.target.style.display = 'none'; }} />
            )}
            {form.coverImage && (
              <img src={form.coverImage} alt="Cover preview"
                className="h-12 w-24 rounded-lg object-cover border border-gray-100"
                onError={(e) => { e.target.style.display = 'none'; }} />
            )}
          </div>
        )}
      </SectionCard>

      {/* ── Address ──────────────────────────────────────── */}
      <SectionCard icon={MapPinIcon} title="Address" subtitle="Physical nursery location">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Address Line 1" col2>
            <input className="input" {...bind('line1')} placeholder="Street / building" />
          </Field>
          <Field label="Address Line 2 (optional)" col2>
            <input className="input" {...bind('line2')} placeholder="Landmark, floor, etc." />
          </Field>
          <Field label="City">
            <input className="input" {...bind('city')} />
          </Field>
          <Field label="State">
            <ChoiceSelect
              value={form.state}
              placeholder="Select State"
              options={STATES}
              onChange={(e) => set('state', e.target.value)}
            />
          </Field>
          <Field label="PIN Code">
            <input className="input" {...bind('postalCode')} placeholder="6-digit PIN" maxLength={6} />
          </Field>
        </div>
      </SectionCard>

      {/* ── Operations ───────────────────────────────────── */}
      <SectionCard icon={ClockIcon} title="Operations" subtitle="Hours and delivery settings">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Business Hours">
            <input className="input" {...bind('businessHours')} placeholder="9:00–18:00" />
          </Field>
          <Field label="Delivery Charge (₹)">
            <div className="relative">
              <CurrencyRupeeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input className="input pl-9" type="number" min="0"
                value={form.deliveryCharge}
                onChange={(e) => set('deliveryCharge', Number(e.target.value))}
              />
            </div>
          </Field>
        </div>
        {/* Shop open toggle */}
        <label className="flex items-center gap-3 cursor-pointer mt-1 select-none">
          <div
            className="relative w-10 h-6 rounded-full transition-colors duration-200 flex-shrink-0"
            style={{ background: form.shopOpen ? '#287A55' : '#D1D5DB' }}
            onClick={() => set('shopOpen', !form.shopOpen)}
          >
            <div
              className="absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200"
              style={{ transform: form.shopOpen ? 'translateX(20px)' : 'translateX(4px)' }}
            />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-800">
              {form.shopOpen ? 'Shop is open for orders' : 'Shop is temporarily closed'}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {form.shopOpen ? 'Customers can browse and purchase your products' : 'Products are hidden from buyers'}
            </p>
          </div>
        </label>
      </SectionCard>

      {/* ── Save (bottom) ────────────────────────────────── */}
      <div className="flex justify-end">
        <button type="submit" disabled={saving} className="btn-primary px-8">
          {saving ? 'Saving…' : 'Save Profile'}
        </button>
      </div>

    </form>
    {payments && (
      <form onSubmit={savePayments} className="card p-5 space-y-4">
        <ShopPaymentMethods value={payments} onChange={setPayments} />
        {!paymentReady(payments).any && (
          <p className="text-sm text-red-600" role="alert">{PAYMENT_REQUIRED_MESSAGE}</p>
        )}
        <button type="submit" className="btn-primary" disabled={savingPayments || !paymentReady(payments).any}>
          {savingPayments ? 'Saving…' : 'Save payment methods'}
        </button>
      </form>
    )}
    </div>
  );
}
