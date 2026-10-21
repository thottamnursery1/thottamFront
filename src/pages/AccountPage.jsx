import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userAPI, authAPI } from '../services/api';
import toast from 'react-hot-toast';
import { useNavigate, Link } from 'react-router-dom';
import { PlusIcon, PencilIcon, TrashIcon, CheckIcon, ArrowRightOnRectangleIcon, ClipboardDocumentListIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const STATES = ['Andhra Pradesh','Assam','Bihar','Chhattisgarh','Delhi','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal'];
const emptyAddr = { label: 'Home', fullName: '', phone: '', line1: '', line2: '', city: '', state: '', postalCode: '', country: 'India', isDefault: false };

export default function AccountPage() {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('profile');
  const [profile, setProfile] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [profLoading, setProfLoading] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [addrForm, setAddrForm] = useState(null); // null=hidden, object=editing
  const [addrLoading, setAddrLoading] = useState(false);
  const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [passLoading, setPassLoading] = useState(false);

  useEffect(() => {
    userAPI.getProfile().then((r) => {
      setAddresses(r.data.user?.addresses || []);
    }).catch(() => {});
  }, []);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfLoading(true);
    try {
      const res = await userAPI.updateProfile(profile);
      updateUser(res.data.user);
      toast.success('Profile updated!');
    } finally {
      setProfLoading(false);
    }
  };

  const handleAddrSave = async (e) => {
    e.preventDefault();
    setAddrLoading(true);
    try {
      let res;
      if (addrForm._id) {
        res = await userAPI.updateAddress(addrForm._id, addrForm);
      } else {
        res = await userAPI.addAddress(addrForm);
      }
      setAddresses(res.data.addresses);
      setAddrForm(null);
      toast.success('Address saved!');
    } finally {
      setAddrLoading(false);
    }
  };

  const handleAddrDelete = async (id) => {
    const res = await userAPI.deleteAddress(id);
    setAddresses(res.data.addresses);
    toast.success('Address deleted.');
  };

  const handlePassChange = async (e) => {
    e.preventDefault();
    if (passForm.newPassword !== passForm.confirm) { toast.error('Passwords do not match.'); return; }
    setPassLoading(true);
    try {
      await authAPI.changePassword({ currentPassword: passForm.currentPassword, newPassword: passForm.newPassword });
      toast.success('Password changed!');
      setPassForm({ currentPassword: '', newPassword: '', confirm: '' });
    } finally {
      setPassLoading(false);
    }
  };

  const TABS = [
    { id: 'profile', label: 'Profile' },
    { id: 'addresses', label: 'Addresses' },
    { id: 'password', label: 'Change Password' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="container-custom py-8 max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-display font-bold text-gray-900">My Account</h1>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
        >
          <ArrowRightOnRectangleIcon className="w-5 h-5" />
          Logout
        </button>
      </div>

      {/* Quick links */}
      <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Link to="/orders"
          className="flex items-center gap-3 bg-white rounded-2xl shadow-card p-4 hover:shadow-md transition-shadow group">
          <span className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0 group-hover:bg-primary-100 transition-colors">
            <ClipboardDocumentListIcon className="w-5 h-5 text-primary-600" />
          </span>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 text-sm">My Orders</p>
            <p className="text-xs text-gray-500">Track and manage your orders</p>
          </div>
          <ChevronRightIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
        </Link>
        <Link to="/account/plants"
          className="flex items-center gap-3 bg-white rounded-2xl shadow-card p-4 hover:shadow-md transition-shadow">
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 text-sm">My Plant Activities</p>
            <p className="text-xs text-gray-500">Adoptions, exchanges, and plants you have listed</p>
          </div>
          <ChevronRightIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
        </Link>
        <Link to="/community/apply"
          className="flex items-center gap-3 bg-white rounded-2xl shadow-card p-4 hover:shadow-md transition-shadow">
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 text-sm">Sell your plants</p>
            <p className="text-xs text-gray-500">Apply as a community seller with this account</p>
          </div>
          <ChevronRightIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-8 overflow-x-auto scrollbar-hide">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-5 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              tab === t.id ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Profile */}
      {tab === 'profile' && (
        <div className="bg-white rounded-2xl shadow-card p-6">
          <h2 className="font-semibold text-gray-900 mb-5">Personal Information</h2>
          <form onSubmit={handleProfileSave} className="space-y-4 max-w-md">
            <div>
              <label className="label">Full Name</label>
              <input className="input" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} required />
            </div>
            <div>
              <label className="label">Email Address</label>
              <input className="input bg-gray-50 cursor-not-allowed" value={user?.email} readOnly />
              <p className="text-xs text-gray-400 mt-1">Email cannot be changed.</p>
            </div>
            <div>
              <label className="label">Mobile Number</label>
              <input className="input" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                placeholder="10-digit mobile" type="tel" />
            </div>
            <button type="submit" disabled={profLoading} className="btn-primary py-2 text-sm">
              {profLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      )}

      {/* Addresses */}
      {tab === 'addresses' && (
        <div className="space-y-4">
          {addresses.map((addr) => (
            <div key={addr._id} className="bg-white rounded-2xl shadow-card p-5 flex gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-gray-900 text-sm">{addr.fullName}</span>
                  <span className="badge badge-green text-xs">{addr.label}</span>
                  {addr.isDefault && <span className="badge bg-primary-100 text-primary-700 text-xs flex items-center gap-0.5"><CheckIcon className="w-3 h-3" /> Default</span>}
                </div>
                <p className="text-sm text-gray-600">{addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}</p>
                <p className="text-sm text-gray-600">{addr.city}, {addr.state} – {addr.postalCode}</p>
                <p className="text-sm text-gray-500 mt-1">📞 {addr.phone}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setAddrForm({ ...addr })} className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                  <PencilIcon className="w-4 h-4" />
                </button>
                <button onClick={() => handleAddrDelete(addr._id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          <button onClick={() => setAddrForm({ ...emptyAddr })}
            className="flex items-center gap-2 w-full p-5 bg-white rounded-2xl shadow-card border-2 border-dashed border-gray-200 text-gray-600 hover:border-primary-400 hover:text-primary-600 transition-colors text-sm font-medium">
            <PlusIcon className="w-5 h-5" /> Add New Address
          </button>

          {/* Address form modal */}
          {addrForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/50" onClick={() => setAddrForm(null)} />
              <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
                <h3 className="font-display font-semibold text-gray-900 mb-5">{addrForm._id ? 'Edit Address' : 'Add Address'}</h3>
                <form onSubmit={handleAddrSave} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="label">Label</label>
                      <select className="input" value={addrForm.label} onChange={(e) => setAddrForm({ ...addrForm, label: e.target.value })}>
                        {['Home', 'Work', 'Other'].map((l) => <option key={l}>{l}</option>)}
                      </select>
                    </div>
                    <div className="flex items-end pb-1">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={addrForm.isDefault}
                          onChange={(e) => setAddrForm({ ...addrForm, isDefault: e.target.checked })} />
                        <span className="text-sm text-gray-700">Set as default</span>
                      </label>
                    </div>
                  </div>
                  {[
                    { label: 'Full Name', name: 'fullName', required: true },
                    { label: 'Phone', name: 'phone', required: true },
                    { label: 'Address Line 1', name: 'line1', required: true },
                    { label: 'Address Line 2 (optional)', name: 'line2' },
                    { label: 'City', name: 'city', required: true },
                    { label: 'PIN Code', name: 'postalCode', required: true },
                  ].map(({ label, name, required }) => (
                    <div key={name}>
                      <label className="label">{label}</label>
                      <input className="input" value={addrForm[name] || ''} required={required}
                        onChange={(e) => setAddrForm({ ...addrForm, [name]: e.target.value })} />
                    </div>
                  ))}
                  <div>
                    <label className="label">State</label>
                    <select className="input" value={addrForm.state} onChange={(e) => setAddrForm({ ...addrForm, state: e.target.value })} required>
                      <option value="">Select State</option>
                      {STATES.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button type="submit" disabled={addrLoading} className="btn-primary flex-1 py-2 text-sm">
                      {addrLoading ? 'Saving...' : 'Save Address'}
                    </button>
                    <button type="button" onClick={() => setAddrForm(null)} className="btn-ghost flex-1 py-2 text-sm">Cancel</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Change Password */}
      {tab === 'password' && (
        <div className="bg-white rounded-2xl shadow-card p-6">
          <h2 className="font-semibold text-gray-900 mb-5">Change Password</h2>
          <form onSubmit={handlePassChange} className="space-y-4 max-w-md">
            {[
              { label: 'Current Password', name: 'currentPassword' },
              { label: 'New Password', name: 'newPassword' },
              { label: 'Confirm New Password', name: 'confirm' },
            ].map(({ label, name }) => (
              <div key={name}>
                <label className="label">{label}</label>
                <input type="password" className="input" value={passForm[name]}
                  onChange={(e) => setPassForm({ ...passForm, [name]: e.target.value })} required />
              </div>
            ))}
            <button type="submit" disabled={passLoading} className="btn-primary py-2 text-sm">
              {passLoading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
