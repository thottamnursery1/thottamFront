import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { communityAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const TYPES = [
  { id: 'home_gardener', label: 'Home gardener' },
  { id: 'plant_enthusiast', label: 'Plant enthusiast' },
  { id: 'small_grower', label: 'Small plant grower' },
];

const empty = {
  fullName: '', phone: '', displayName: '', sellerType: 'home_gardener', bio: '',
  line1: '', line2: '', city: '', state: '', postalCode: '', pins: '',
  policiesAccepted: false,
  accountHolder: '', bankName: '', ifsc: '', accountNumber: '',
};

export default function CommunityApplyPage() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(empty);
  const [profile, setProfile] = useState(undefined);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    communityAPI.me().then((res) => {
      setProfile(res.data.profile);
      if (res.data.profile?.status === 'approved') navigate('/community');
    }).catch(() => setProfile(null));
  }, [isAuthenticated, navigate]);

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const submit = async (event) => {
    event.preventDefault();
    if (!isAuthenticated) { navigate('/login'); return; }
    if (!form.policiesAccepted) { toast.error('Accept the seller policies to continue.'); return; }
    setSaving(true);
    try {
      const payload = {
        fullName: form.fullName || user?.name,
        phone: form.phone || user?.phone,
        displayName: form.displayName,
        sellerType: form.sellerType,
        bio: form.bio,
        pickupAddress: {
          line1: form.line1, line2: form.line2, city: form.city, state: form.state, postalCode: form.postalCode,
        },
        serviceablePins: form.pins.split(/[\s,]+/).filter(Boolean),
        policiesAccepted: true,
      };
      if (form.accountNumber) {
        payload.accountHolder = form.accountHolder;
        payload.bankName = form.bankName;
        payload.ifsc = form.ifsc;
        payload.accountNumber = form.accountNumber;
      }
      const res = await communityAPI.apply(payload);
      setProfile(res.data.profile);
      toast.success('Application submitted. You can sell after approval.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container-custom py-10 max-w-3xl">
      <p className="text-sm uppercase tracking-[0.16em] text-primary-700">Community marketplace</p>
      <h1 className="text-3xl font-display mt-2 mb-3">Sell plants from your existing account</h1>
      <p className="text-muted mb-8">Home gardeners can list herbs, seedlings, cuttings, and houseplants beside Thottam nurseries. No second login is required.</p>

      {profile?.status === 'pending' && (
        <div className="card p-5 mb-6">
          <h2 className="font-semibold">Application pending</h2>
          <p className="text-sm text-muted mt-1">A super admin will review {profile.displayName}. You can browse and buy as usual until then.</p>
        </div>
      )}
      {profile?.status === 'rejected' && (
        <div className="card p-5 mb-6">
          <h2 className="font-semibold">Application needs changes</h2>
          <p className="text-sm text-muted mt-1">{profile.rejectionReason || 'Update the details below and submit again.'}</p>
        </div>
      )}
      {profile?.status === 'suspended' && (
        <div className="card p-5 mb-6">
          <h2 className="font-semibold">Seller profile suspended</h2>
          <p className="text-sm text-muted mt-1">New listings and orders stay paused until the marketplace reactivates this profile.</p>
        </div>
      )}

      {profile?.status !== 'pending' && profile?.status !== 'suspended' && (
        <form onSubmit={submit} className="card p-6 space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <label className="block text-sm">Full name
              <input id="seller-name" className="input mt-1" value={form.fullName} onChange={(e) => set('fullName', e.target.value)} required />
            </label>
            <label className="block text-sm">Mobile
              <input id="seller-phone" className="input mt-1" value={form.phone} onChange={(e) => set('phone', e.target.value)} inputMode="numeric" required />
            </label>
            <label className="block text-sm sm:col-span-2">Display name
              <input id="seller-display" className="input mt-1" value={form.displayName} onChange={(e) => set('displayName', e.target.value)} placeholder="Shown on your listings" />
            </label>
          </div>
          <fieldset>
            <legend className="text-sm font-medium mb-2">Seller type</legend>
            <div className="flex flex-wrap gap-2">
              {TYPES.map((type) => (
                <label key={type.id} className={`px-3 py-2 rounded-full border text-sm cursor-pointer ${form.sellerType === type.id ? 'bg-primary-700 text-white border-primary-700' : 'border-line'}`}>
                  <input className="sr-only" type="radio" name="sellerType" value={type.id} checked={form.sellerType === type.id} onChange={() => set('sellerType', type.id)} />
                  {type.label}
                </label>
              ))}
            </div>
          </fieldset>
          <label className="block text-sm">Pickup address
            <input id="seller-line1" className="input mt-1" value={form.line1} onChange={(e) => set('line1', e.target.value)} required />
          </label>
          <div className="grid sm:grid-cols-3 gap-4">
            <label className="block text-sm">City
              <input id="seller-city" className="input mt-1" value={form.city} onChange={(e) => set('city', e.target.value)} required />
            </label>
            <label className="block text-sm">State
              <input id="seller-state" className="input mt-1" value={form.state} onChange={(e) => set('state', e.target.value)} required />
            </label>
            <label className="block text-sm">PIN
              <input id="seller-pin" className="input mt-1" value={form.postalCode} onChange={(e) => set('postalCode', e.target.value)} inputMode="numeric" required />
            </label>
          </div>
          <label className="block text-sm">Serviceable PIN codes
            <input id="seller-pins" className="input mt-1" value={form.pins} onChange={(e) => set('pins', e.target.value)} placeholder="560001, 560038" required />
          </label>
          <label className="block text-sm">About your plants
            <textarea id="seller-bio" className="input mt-1 min-h-24" value={form.bio} onChange={(e) => set('bio', e.target.value)} />
          </label>
          <div className="border border-line rounded-2xl p-4 space-y-3">
            <p className="text-sm font-medium">Payout details, when you are ready</p>
            <p className="text-xs text-muted">Account numbers are encrypted. Only the last four digits are shown after saving. Thottam does not store card or UPI PIN data.</p>
            <div className="grid sm:grid-cols-2 gap-3">
              <input className="input" placeholder="Account holder" value={form.accountHolder} onChange={(e) => set('accountHolder', e.target.value)} aria-label="Account holder" />
              <input className="input" placeholder="Bank name" value={form.bankName} onChange={(e) => set('bankName', e.target.value)} aria-label="Bank name" />
              <input className="input" placeholder="IFSC" value={form.ifsc} onChange={(e) => set('ifsc', e.target.value)} aria-label="IFSC" />
              <input className="input" placeholder="Account number" value={form.accountNumber} onChange={(e) => set('accountNumber', e.target.value)} aria-label="Account number" autoComplete="off" />
            </div>
          </div>
          <label className="flex items-start gap-2 text-sm">
            <input type="checkbox" checked={form.policiesAccepted} onChange={(e) => set('policiesAccepted', e.target.checked)} />
            <span>I accept the marketplace terms, seller policies, and the commission shown in platform settings. Customer payments are collected by Thottam and settled after delivery.</span>
          </label>
          <button className="btn-primary" disabled={saving}>{saving ? 'Submitting…' : isAuthenticated ? 'Submit application' : 'Log in to apply'}</button>
          <p className="text-xs text-muted">Nursery shops continue to register separately at <Link className="text-primary-700" to="/sell">Sell as a nursery</Link>.</p>
        </form>
      )}
    </div>
  );
}
