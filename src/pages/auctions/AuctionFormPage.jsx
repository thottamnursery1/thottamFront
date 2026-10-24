import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { auctionAPI, plantAPI } from '../../services/api';

export default function AuctionFormPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', description: '', startingBid: '', minIncrement: '', endsAt: '', razorpayAccountId: '',
  });
  const [images, setImages] = useState([]);
  const [saving, setSaving] = useState(false);

  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const upload = async (event) => {
    const files = [...event.target.files || []];
    event.target.value = '';
    if (!files.length) return;
    const body = new FormData();
    files.slice(0, 6).forEach((file) => body.append('images', file));
    try {
      const res = await plantAPI.upload(body);
      setImages((current) => [...current, ...(res.data.images || [])].slice(0, 6));
    } catch {
      toast.error('The image could not be uploaded.');
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const res = await auctionAPI.create({ ...form, images });
      toast.success('Your auction is live.');
      navigate(`/auctions/${res.data.auction._id}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container-custom py-6 sm:py-10">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-700">Donor listing</p>
      <h1 className="mt-1 font-display text-3xl text-primary-900">Auction a plant</h1>
      <p className="mt-1 max-w-xl text-sm text-muted">This stays out of the nursery catalog. When the auction ends, the winner pays through Razorpay and the amount is split 80% to you and 20% to Thottam.</p>
      <form onSubmit={submit} className="mt-6 max-w-2xl space-y-4 rounded-[1.4rem] bg-white p-5 shadow-card sm:p-6">
        <label className="block">
          <span className="label">Plant name</span>
          <input className="input" value={form.name} onChange={(e) => set('name', e.target.value)} required />
        </label>
        <label className="block">
          <span className="label">Description</span>
          <textarea className="input min-h-28" value={form.description} onChange={(e) => set('description', e.target.value)} required />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="label">Starting bid (₹)</span>
            <input className="input" type="number" min="1" step="1" value={form.startingBid} onChange={(e) => set('startingBid', e.target.value)} required />
          </label>
          <label className="block">
            <span className="label">Minimum increment (₹)</span>
            <input className="input" type="number" min="1" step="1" value={form.minIncrement} onChange={(e) => set('minIncrement', e.target.value)} required />
          </label>
        </div>
        <label className="block">
          <span className="label">Auction ends</span>
          <input className="input" type="datetime-local" value={form.endsAt} onChange={(e) => set('endsAt', e.target.value)} required />
        </label>
        <label className="block">
          <span className="label">Images</span>
          <input className="input" type="file" accept="image/*" multiple onChange={upload} />
          {images.length > 0 && (
            <div className="mt-3 flex gap-2 overflow-x-auto">
              {images.map((image) => (
                <img key={image.url} src={image.url} alt="" className="h-20 w-20 rounded-xl object-cover" />
              ))}
            </div>
          )}
        </label>
        <label className="block">
          <span className="label">Razorpay Route account</span>
          <input className="input" value={form.razorpayAccountId} onChange={(e) => set('razorpayAccountId', e.target.value)} placeholder="acc_ optional" />
          <p className="mt-1 text-xs text-muted">Add this when your Razorpay linked account is ready. Thottam still records the 80/20 split if it is left blank.</p>
        </label>
        <button type="submit" className="btn-primary h-11 w-full justify-center sm:w-auto" disabled={saving || images.length === 0}>
          {saving ? 'Publishing…' : 'Publish auction'}
        </button>
      </form>
    </div>
  );
}
