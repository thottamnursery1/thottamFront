import { useEffect, useState } from 'react';
import { communityAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function CommunityProfile() {
  const [profile, setProfile] = useState(null);
  const [pins, setPins] = useState('');
  const [payout, setPayout] = useState({ accountHolder: '', bankName: '', ifsc: '', accountNumber: '' });

  useEffect(() => {
    communityAPI.me().then((res) => {
      setProfile(res.data.profile);
      setPins((res.data.profile?.serviceablePins || []).join(', '));
    });
  }, []);

  if (!profile) return <div className="h-40 skeleton rounded-2xl" />;

  const save = async (event) => {
    event.preventDefault();
    const res = await communityAPI.updateProfile({
      displayName: profile.displayName,
      bio: profile.bio,
      phone: profile.phone,
      pickupAddress: profile.pickupAddress,
      serviceablePins: pins.split(/[\s,]+/).filter(Boolean),
    });
    setProfile(res.data.profile);
    toast.success('Seller profile saved.');
  };

  const savePayout = async (event) => {
    event.preventDefault();
    const res = await communityAPI.updatePayout(payout);
    setProfile((prev) => ({ ...prev, payout: res.data.payout }));
    setPayout({ accountHolder: '', bankName: '', ifsc: '', accountNumber: '' });
    toast.success('Payout details saved for verification.');
  };

  return (
    <div className="grid lg:grid-cols-2 gap-5 max-w-5xl">
      <form onSubmit={save} className="card p-5 space-y-3">
        <h1 className="text-xl font-semibold">Seller profile</h1>
        <p className="text-sm text-muted capitalize">{profile.sellerType?.replaceAll('_', ' ')} · {profile.status}</p>
        <label className="text-sm block">Display name
          <input className="input mt-1" value={profile.displayName} onChange={(e) => setProfile({ ...profile, displayName: e.target.value })} />
        </label>
        <label className="text-sm block">Phone
          <input className="input mt-1" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
        </label>
        <label className="text-sm block">Bio
          <textarea className="input mt-1 min-h-24" value={profile.bio || ''} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} />
        </label>
        <label className="text-sm block">Serviceable PINs
          <input className="input mt-1" value={pins} onChange={(e) => setPins(e.target.value)} />
        </label>
        <button className="btn-primary">Save profile</button>
      </form>
      <form onSubmit={savePayout} className="card p-5 space-y-3">
        <h2 className="text-xl font-semibold">Payout account</h2>
        <p className="text-sm text-muted">Verification: {profile.payout?.verificationStatus || 'unverified'}{profile.payout?.accountLast4 ? ` · ending ${profile.payout.accountLast4}` : ''}</p>
        <input className="input" placeholder="Account holder" aria-label="Account holder" value={payout.accountHolder} onChange={(e) => setPayout({ ...payout, accountHolder: e.target.value })} required />
        <input className="input" placeholder="Bank name" aria-label="Bank name" value={payout.bankName} onChange={(e) => setPayout({ ...payout, bankName: e.target.value })} required />
        <input className="input" placeholder="IFSC" aria-label="IFSC" value={payout.ifsc} onChange={(e) => setPayout({ ...payout, ifsc: e.target.value })} required />
        <input className="input" placeholder="Account number" aria-label="Account number" autoComplete="off" value={payout.accountNumber} onChange={(e) => setPayout({ ...payout, accountNumber: e.target.value })} required />
        <button className="btn-primary">Submit for verification</button>
      </form>
    </div>
  );
}
