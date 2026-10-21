import { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';
import {
  CurrencyRupeeIcon, TruckIcon, MegaphoneIcon,
  PhoneIcon, EnvelopeIcon, DocumentTextIcon, Cog6ToothIcon,
} from '@heroicons/react/24/outline';

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

function Field({ label, hint, children }) {
  return (
    <div className="field">
      <label className="label">{label}</label>
      {children}
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

export default function AdminSettings() {
  const [form,   setForm]   = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminAPI.getSettings().then((res) => {
      setForm({
        ...res.data.settings,
        serviceablePins: (res.data.settings.serviceablePins || []).join(', '),
      });
    });
  }, []);

  if (!form) return (
    <div className="space-y-4">
      <div className="h-8 skeleton rounded-xl w-48" />
      {[...Array(4)].map((_, i) => <div key={i} className="h-36 skeleton rounded-[14px]" />)}
    </div>
  );

  const set  = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));
  const bind = (key) => ({ value: form[key] ?? '', onChange: (e) => set(key, e.target.value) });

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await adminAPI.updateSettings({
        ...form,
        commissionPercent:    Number(form.commissionPercent),
        communityCommissionPercent: Number(form.communityCommissionPercent || 10),
        communityLocalDeliveryFee: Number(form.communityLocalDeliveryFee || 0),
        communityReturnWindowHours: Number(form.communityReturnWindowHours || 48),
        deliveryCharge: 40,
        freeDeliveryThreshold: Number(form.freeDeliveryThreshold),
        taxPercent:           Number(form.taxPercent),
        serviceablePins:      String(form.serviceablePins || '').split(/[\s,]+/).filter(Boolean),
      });
      toast.success('Settings saved.');
    } finally { setSaving(false); }
  };

  return (
    <form onSubmit={save} className="space-y-5 max-w-3xl animate-fade-in">

      <div className="page-header">
        <div>
          <h1 className="page-title">Platform Settings</h1>
          <p className="page-subtitle">Commission, delivery, policies, and integrations</p>
        </div>
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? 'Saving…' : 'Save Settings'}
        </button>
      </div>

      {/* ── Commerce ──────────────────────────────────────── */}
      <SectionCard icon={CurrencyRupeeIcon} title="Commerce" subtitle="Fees and delivery pricing">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Field label="Nursery commission %" hint="Recorded for manual settlement">
            <input type="number" step="0.01" min="0" max="100" className="input" {...bind('commissionPercent')} />
          </Field>
          <Field label="Community commission %" hint="Percent of community plant price">
            <input type="number" step="0.01" min="0" max="40" className="input" {...bind('communityCommissionPercent')} />
          </Field>
          <Field label="Community delivery (₹)" hint="Default local delivery fee">
            <input type="number" step="0.01" min="0" className="input" {...bind('communityLocalDeliveryFee')} />
          </Field>
          <Field label="Delivery (₹)" hint="₹40 once per order. Distance does not change this fee.">
            <input type="number" className="input" value={40} readOnly />
          </Field>
          <Field label="Free Delivery Above (₹)">
            <input type="number" step="0.01" min="0" className="input" {...bind('freeDeliveryThreshold')} />
          </Field>
          <Field label="Tax %">
            <input type="number" step="0.01" min="0" max="100" className="input" {...bind('taxPercent')} />
          </Field>
        </div>
      </SectionCard>

      {/* ── Delivery ──────────────────────────────────────── */}
      <SectionCard icon={TruckIcon} title="Delivery" subtitle="Serviceable PIN codes and coverage">
        <Field label="Serviceable PIN Codes" hint="Comma-separated 6-digit codes. Leave empty to allow all.">
          <input className="input" {...bind('serviceablePins')} placeholder="560001, 560038, 600005" />
        </Field>
        <label className="flex items-center gap-3 cursor-pointer select-none">
          <div
            onClick={() => set('allowUnlistedPins', !form.allowUnlistedPins)}
            className="relative w-10 h-6 rounded-full transition-colors duration-200 flex-shrink-0"
            style={{ background: form.allowUnlistedPins ? '#287A55' : '#D1D5DB' }}
          >
            <div
              className="absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200"
              style={{ transform: form.allowUnlistedPins ? 'translateX(20px)' : 'translateX(4px)' }}
            />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-800">Allow unlisted PIN codes</p>
            <p className="text-xs text-gray-400 mt-0.5">Accept orders from PINs not on the platform list</p>
          </div>
        </label>
      </SectionCard>

      {/* ── Communications ────────────────────────────────── */}
      <SectionCard icon={MegaphoneIcon} title="Communications" subtitle="Announcement banner and contact details">
        <Field label="Announcement Banner">
          <input className="input" {...bind('announcement')} placeholder="Free delivery on orders above ₹999…" />
        </Field>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Support Email">
            <div className="relative">
              <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="email" className="input pl-9" {...bind('supportEmail')} placeholder="support@thottam.in" />
            </div>
          </Field>
          <Field label="Support Phone">
            <div className="relative">
              <PhoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="tel" className="input pl-9" {...bind('supportPhone')} placeholder="+91 99999 99999" />
            </div>
          </Field>
        </div>
      </SectionCard>

      {/* ── Policies ──────────────────────────────────────── */}
      <SectionCard icon={DocumentTextIcon} title="Policies" subtitle="Customer-facing policy text">
        <Field label="Return Policy">
          <textarea className="input min-h-[80px] resize-y" {...bind('returnPolicy')} placeholder="Describe the return policy…" />
        </Field>
        <Field label="Cancellation Policy">
          <textarea className="input min-h-[80px] resize-y" {...bind('cancellationPolicy')} placeholder="Describe the cancellation policy…" />
        </Field>
      </SectionCard>

      {/* ── System ────────────────────────────────────────── */}
      <SectionCard icon={Cog6ToothIcon} title="System" subtitle="Debug and development flags">
        <label className="flex items-center gap-3 cursor-pointer select-none">
          <div
            onClick={() => set('demoMode', !form.demoMode)}
            className="relative w-10 h-6 rounded-full transition-colors duration-200 flex-shrink-0"
            style={{ background: form.demoMode ? '#d97706' : '#D1D5DB' }}
          >
            <div
              className="absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200"
              style={{ transform: form.demoMode ? 'translateX(20px)' : 'translateX(4px)' }}
            />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-800">Demo Mode</p>
            <p className="text-xs text-gray-400 mt-0.5">Shows the development-catalog notice to all visitors</p>
          </div>
        </label>
      </SectionCard>

      <div className="flex justify-end">
        <button type="submit" disabled={saving} className="btn-primary px-8">
          {saving ? 'Saving…' : 'Save Settings'}
        </button>
      </div>
    </form>
  );
}
