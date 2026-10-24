import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { nurseryAPI, authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { EMAIL_TAKEN_MESSAGE, normalizeEmail } from '../utils/helpers';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import ShopPaymentMethods, { emptyPayments, PAYMENT_REQUIRED_MESSAGE, paymentPayload, paymentReady } from '../components/ShopPaymentMethods';

const initial = {
  nurseryName: '', ownerName: '', email: '', phone: '', password: '',
  line1: '', city: '', state: '', postalCode: '', serviceablePins: '',
  gstin: '', businessType: 'proprietorship', description: '', logo: '', documentLabel: 'Licence', documentUrl: '',
};

const GSTIN = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
const URL_RE = /^https?:\/\/\S+$/i;

const FIELD_ORDER = [
  'nurseryName', 'ownerName', 'phone', 'email', 'password',
  'line1', 'city', 'state', 'postalCode', 'serviceablePins', 'gstin', 'logo', 'documentLabel', 'documentUrl',
];

function validateField(name, form) {
  const value = String(form[name] ?? '').trim();
  switch (name) {
    case 'nurseryName':
      if (!value) return 'Nursery name is required';
      if (value.length < 2) return 'Use at least 2 characters';
      if (value.length > 80) return 'Nursery name cannot exceed 80 characters';
      return '';
    case 'ownerName':
      if (!value) return 'Owner name is required';
      if (value.length > 60) return 'Owner name cannot exceed 60 characters';
      return '';
    case 'email':
      if (!value) return 'Email is required';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(value))) return 'Enter a valid email address';
      return '';
    case 'phone':
      if (!value) return 'Phone number is required';
      if (!/^[6-9]\d{9}$/.test(value)) return 'Enter a 10-digit mobile number starting with 6–9';
      return '';
    case 'password':
      if (!value) return 'Password is required';
      if (value.length < 8) return 'Use at least 8 characters';
      if (!/[a-z]/.test(value) || !/[A-Z]/.test(value) || !/\d/.test(value)) {
        return 'Include an uppercase letter, a lowercase letter, and a number';
      }
      return '';
    case 'line1':
      if (!value) return 'Street address is required';
      return '';
    case 'city':
      if (!value) return 'City is required';
      return '';
    case 'state':
      if (!value) return 'State is required';
      return '';
    case 'postalCode':
      if (!value) return 'PIN code is required';
      if (!/^\d{6}$/.test(value)) return 'Enter a 6-digit PIN code';
      return '';
    case 'serviceablePins': {
      if (!value) return '';
      const pins = value.split(/[\s,]+/).filter(Boolean);
      if (pins.some((pin) => !/^\d{6}$/.test(pin))) return 'Each PIN code must be 6 digits, separated by commas';
      return '';
    }
    case 'gstin':
      if (!value) return '';
      if (!GSTIN.test(value.toUpperCase())) return 'Enter a valid 15-character GSTIN';
      return '';
    case 'logo':
    case 'documentUrl':
      if (!value) return '';
      if (!URL_RE.test(value)) return 'Enter a full URL starting with https://';
      return '';
    case 'documentLabel':
      if (String(form.documentUrl || '').trim() && !value) return 'Add a name for this document';
      return '';
    default:
      return '';
  }
}

function collectErrors(form) {
  return FIELD_ORDER.reduce((errors, name) => {
    const message = validateField(name, form);
    if (message) errors[name] = message;
    return errors;
  }, {});
}

function Field({ id, label, error, hint, required, children }) {
  return (
    <div>
      <label htmlFor={id} className="label">
        {label}{required && <span className="text-red-500"> *</span>}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-xs text-red-600 mt-1" role="alert">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted mt-1">{hint}</p>
      ) : null}
    </div>
  );
}

export default function SellerRegisterPage() {
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [payments, setPayments] = useState(emptyPayments);
  const paymentsOk = paymentReady(payments).any;
  const { acceptSellerSession } = useAuth();
  const navigate = useNavigate();

  const visibleError = (name) => ((touched[name] || submitted) ? errors[name] : '');

  const set = (key, value) => {
    const nextForm = { ...form, [key]: value };
    setForm(nextForm);
    if (touched[key] || submitted) {
      const message = validateField(key, nextForm);
      setErrors((prev) => {
        const next = { ...prev };
        if (message) next[key] = message;
        else delete next[key];
        if (key === 'documentUrl') {
          const labelMessage = validateField('documentLabel', nextForm);
          if (labelMessage) next.documentLabel = labelMessage;
          else delete next.documentLabel;
        }
        return next;
      });
    }
  };

  const blur = async (name) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    const message = validateField(name, form);
    setErrors((prev) => {
      const next = { ...prev };
      if (message) next[name] = message;
      else delete next[name];
      return next;
    });
    if (name === 'email' && !message) {
      try {
        const check = await authAPI.checkEmail(normalizeEmail(form.email));
        if (!check.data.available) {
          setErrors((prev) => ({ ...prev, email: check.data.message || EMAIL_TAKEN_MESSAGE }));
        }
      } catch {
        // The submit request repeats this check.
      }
    }
  };

  const inputProps = (name, extra = {}) => ({
    id: name,
    value: form[name],
    onChange: (event) => set(name, extra.digits
      ? event.target.value.replace(/\D/g, '').slice(0, extra.max || 10)
      : event.target.value),
    onBlur: () => blur(name),
    'aria-invalid': visibleError(name) ? 'true' : 'false',
    'aria-describedby': visibleError(name) ? `${name}-error` : undefined,
    className: `input mt-1 ${visibleError(name) ? 'input-error' : ''}`,
  });

  const submit = async (event) => {
    event.preventDefault();
    setSubmitted(true);
    setFormError('');
    const next = collectErrors(form);
    setErrors(next);
    if (Object.keys(next).length || !paymentReady(payments).any) {
      if (Object.keys(next).length) {
        const first = FIELD_ORDER.find((name) => next[name]);
        document.getElementById(first)?.focus();
      }
      return;
    }
    const email = normalizeEmail(form.email);
    setLoading(true);
    try {
      const check = await authAPI.checkEmail(email);
      if (!check.data.available) {
        setErrors((prev) => ({ ...prev, email: check.data.message || EMAIL_TAKEN_MESSAGE }));
        document.getElementById('email')?.focus();
        return;
      }
      const res = await nurseryAPI.register({
        ...form,
        nurseryName: form.nurseryName.trim(),
        ownerName: form.ownerName.trim(),
        email,
        gstin: form.gstin.trim().toUpperCase(),
        documents: form.documentUrl.trim() ? [{ label: form.documentLabel.trim() || 'Document', url: form.documentUrl.trim() }] : [],
        paymentMethods: paymentPayload(payments),
      });
      acceptSellerSession(res.data.token, res.data.user, res.data.nursery);
      toast.success(res.data.message);
      navigate('/seller/pending');
    } catch (err) {
      setFormError(err.response?.data?.message || 'The application could not be submitted. Check the fields and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-custom py-12 max-w-2xl">
      <p className="text-xs uppercase tracking-[0.18em] text-muted">Sell with us</p>
      <h1 className="text-4xl sm:text-5xl mt-2">Register your nursery</h1>
      <p className="text-muted mt-3 mb-8">Applications stay pending until a platform admin approves them. You will not be able to publish to the shop before that.</p>
      <form onSubmit={submit} noValidate className="glass-panel rounded-[1.8rem] p-6 sm:p-8 space-y-8">
        {formError && (
          <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{formError}</p>
        )}

        <section className="space-y-4">
          <h2 className="text-lg font-display">Shop</h2>
          <Field id="nurseryName" label="Nursery name" required error={visibleError('nurseryName')}>
            <input {...inputProps('nurseryName')} autoComplete="organization" />
          </Field>
          <Field id="description" label="About the nursery" hint="Optional. Tell buyers what you grow.">
            <textarea id="description" className="input mt-1 min-h-24" value={form.description} onChange={(e) => set('description', e.target.value)} />
          </Field>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-display">Owner account</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field id="ownerName" label="Owner name" required error={visibleError('ownerName')}>
              <input {...inputProps('ownerName')} autoComplete="name" />
            </Field>
            <Field id="phone" label="Phone" required error={visibleError('phone')}>
              <input {...inputProps('phone', { digits: true, max: 10 })} inputMode="numeric" autoComplete="tel" placeholder="9876543210" />
            </Field>
            <Field id="email" label="Email" required error={visibleError('email')}>
              <input {...inputProps('email')} type="email" autoComplete="email" />
            </Field>
            <Field id="password" label="Password" required error={visibleError('password')} hint={visibleError('password') ? '' : 'At least 8 characters, with upper, lower, and a number'}>
              <div className="relative">
                <input {...inputProps('password')} type={showPass ? 'text' : 'password'} autoComplete="new-password" className={`input mt-1 pr-10 ${visibleError('password') ? 'input-error' : ''}`} />
                <button type="button" onClick={() => setShowPass((open) => !open)} className="absolute right-3 top-[calc(50%+2px)] -translate-y-1/2 text-muted" aria-label={showPass ? 'Hide password' : 'Show password'}>
                  {showPass ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                </button>
              </div>
            </Field>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-display">Address</h2>
          <Field id="line1" label="Street address" required error={visibleError('line1')}>
            <input {...inputProps('line1')} autoComplete="address-line1" />
          </Field>
          <div className="grid sm:grid-cols-3 gap-4">
            <Field id="city" label="City" required error={visibleError('city')}>
              <input {...inputProps('city')} autoComplete="address-level2" />
            </Field>
            <Field id="state" label="State" required error={visibleError('state')}>
              <input {...inputProps('state')} autoComplete="address-level1" />
            </Field>
            <Field id="postalCode" label="PIN code" required error={visibleError('postalCode')}>
              <input {...inputProps('postalCode', { digits: true, max: 6 })} inputMode="numeric" autoComplete="postal-code" placeholder="560001" />
            </Field>
          </div>
          <Field id="serviceablePins" label="Serviceable PIN codes" error={visibleError('serviceablePins')} hint="Optional. Separate codes with commas, for example 560001, 560038.">
            <input {...inputProps('serviceablePins')} placeholder="560001, 560038" />
          </Field>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-display">Business details</h2>
          <p className="text-sm text-muted -mt-2">Optional. Add these if you already have them.</p>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field id="gstin" label="GSTIN" error={visibleError('gstin')}>
              <input {...inputProps('gstin')} className={`input mt-1 uppercase ${visibleError('gstin') ? 'input-error' : ''}`} maxLength={15} />
            </Field>
            <Field id="businessType" label="Business type">
              <select id="businessType" className="input mt-1" value={form.businessType} onChange={(e) => set('businessType', e.target.value)}>
                <option value="proprietorship">Proprietorship</option>
                <option value="partnership">Partnership</option>
                <option value="private_limited">Private limited</option>
                <option value="other">Other</option>
              </select>
            </Field>
          </div>
          <Field id="logo" label="Logo URL" error={visibleError('logo')}>
            <input {...inputProps('logo')} placeholder="https://" />
          </Field>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field id="documentLabel" label="Document name" error={visibleError('documentLabel')}>
              <input {...inputProps('documentLabel')} />
            </Field>
            <Field id="documentUrl" label="Document URL" error={visibleError('documentUrl')}>
              <input {...inputProps('documentUrl')} placeholder="https://" />
            </Field>
          </div>
        </section>

        <section>
          <ShopPaymentMethods value={payments} onChange={setPayments} />
        </section>

        {!paymentsOk && (
          <p className="text-sm text-red-600" role="alert">{PAYMENT_REQUIRED_MESSAGE}</p>
        )}
        <button className="btn-primary w-full sm:w-auto" disabled={loading || !paymentsOk}>{loading ? 'Submitting…' : 'Submit for Approval'}</button>
      </form>
    </div>
  );
}
