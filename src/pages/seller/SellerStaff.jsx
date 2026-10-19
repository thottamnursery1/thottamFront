import { useEffect, useState } from 'react';
import { shopAdminAPI, authAPI } from '../../services/api';
import { EMAIL_TAKEN_MESSAGE, normalizeEmail } from '../../utils/helpers';
import { UserGroupIcon, UserPlusIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function SellerStaff() {
  const [staff,      setStaff]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [form,       setForm]       = useState({ name: '', email: '', password: '' });
  const [emailError, setEmailError] = useState('');
  const [saving,     setSaving]     = useState(false);

  const load = () => {
    setLoading(true);
    shopAdminAPI.staff()
      .then((res) => setStaff(res.data.staff || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const invite = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const email = normalizeEmail(form.email);
      const check = await authAPI.checkEmail(email);
      if (!check.data.available) {
        setEmailError(check.data.message || EMAIL_TAKEN_MESSAGE);
        return;
      }
      setEmailError('');
      const res = await shopAdminAPI.inviteStaff({ ...form, email });
      toast.success(res.data.message);
      setForm({ name: '', email: '', password: '' });
      load();
    } finally { setSaving(false); }
  };

  const AVATAR_COLORS = ['#EFF6FF', '#F0FDF4', '#FFF7ED', '#F5F3FF', '#FFF1F2', '#ECFDF5'];
  const AVATAR_TEXT   = ['#2563eb', '#16a34a', '#ea580c', '#9333ea', '#e11d48', '#059669'];

  return (
    <div className="space-y-5 max-w-2xl animate-fade-in">

      <div className="page-header">
        <div>
          <h1 className="page-title">Product Managers</h1>
          <p className="page-subtitle">Invite staff to manage your shop's catalog</p>
        </div>
      </div>

      {/* Info banner */}
      <div className="card p-4 bg-primary-50 border border-primary-100 text-sm text-primary-800 rounded-[14px]">
        Product managers have access to your catalog only — they can add, edit, and update stock. They cannot change shop settings or view orders.
      </div>

      {/* Invite form */}
      <div className="card p-5 space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
          <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center">
            <UserPlusIcon className="w-4 h-4 text-primary-600" />
          </div>
          <p className="text-sm font-semibold text-gray-900">Invite Product Manager</p>
        </div>
        <form onSubmit={invite} className="space-y-3">
          <div className="field">
            <label className="label">Full Name</label>
            <input
              className="input"
              placeholder="Jane Doe"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div className="field">
            <label className="label">Email</label>
            <div className="relative">
              <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                className={`input pl-9 ${emailError ? 'input-error' : ''}`}
                placeholder="manager@example.com"
                value={form.email}
                onChange={(e) => { setEmailError(''); setForm({ ...form, email: e.target.value }); }}
                required
              />
            </div>
            {emailError && <p className="text-xs text-red-600 mt-1">{emailError}</p>}
          </div>
          <div className="field">
            <label className="label">Temporary Password</label>
            <input
              type="password"
              className="input"
              placeholder="Min 8 characters"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              minLength={8}
            />
          </div>
          <button type="submit" disabled={saving} className="btn-primary w-full gap-2">
            <UserPlusIcon className="w-4 h-4" />
            {saving ? 'Inviting…' : 'Invite Product Manager'}
          </button>
        </form>
      </div>

      {/* Staff list */}
      <div className="card overflow-hidden">
        <div className="panel-header">
          <p className="panel-title flex items-center gap-2">
            <UserGroupIcon className="w-4 h-4 text-primary-500" /> Current Managers
          </p>
          <span className="text-xs text-gray-400">{staff.length} member{staff.length !== 1 ? 's' : ''}</span>
        </div>
        {loading ? (
          <div className="p-4 space-y-2">
            {[...Array(3)].map((_, i) => <div key={i} className="h-12 skeleton rounded-xl" />)}
          </div>
        ) : staff.length === 0 ? (
          <div className="empty-state py-10">
            <p className="text-sm text-gray-400">No product managers yet. Invite one above.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-50">
            {staff.map((person, i) => {
              const bg    = AVATAR_COLORS[i % AVATAR_COLORS.length];
              const color = AVATAR_TEXT[i % AVATAR_TEXT.length];
              return (
                <li key={person._id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50/70 transition-colors">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ background: bg, color }}
                  >
                    {person.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{person.name}</p>
                    <p className="text-xs text-gray-400 truncate">{person.email}</p>
                  </div>
                  <span className="badge badge-green text-xs">Active</span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
