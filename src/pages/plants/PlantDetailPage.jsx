import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { plantAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { priceText, typeBadge } from './PlantExchangePage';

export default function PlantDetailPage() {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [message, setMessage] = useState('');
  const [offerings, setOfferings] = useState([]);
  const [offered, setOffered] = useState('');
  const [reason, setReason] = useState('suspicious');
  const [details, setDetails] = useState('');

  const load = () => plantAPI.get(id).then((res) => {
    setListing(res.data.listing);
    setReviews(res.data.reviews || []);
  }).catch(() => setListing(false));

  useEffect(() => { load(); }, [id]);
  useEffect(() => {
    if (isAuthenticated && listing?.listingType === 'Exchange' && !listing.isOwner) {
      plantAPI.offerings().then((res) => setOfferings(res.data.listings || [])).catch(() => {});
    }
  }, [isAuthenticated, listing?._id]);

  if (listing === null) return <div className="container-custom py-10"><div className="h-64 skeleton rounded-2xl" /></div>;
  if (!listing) return <div className="container-custom py-16">This plant is no longer listed.</div>;

  const requireAuth = () => {
    if (!isAuthenticated) { navigate('/login'); return false; }
    return true;
  };

  const adopt = async () => {
    if (!requireAuth()) return;
    await plantAPI.adopt(listing._id, { message });
    toast.success('Adoption request sent. No payment is needed.');
    setMessage('');
  };
  const exchange = async () => {
    if (!requireAuth() || !offered) return toast.error('Choose one of your plants to offer.');
    await plantAPI.exchange(listing._id, { offeredListing: offered, message });
    toast.success('Exchange proposal sent. No payment is needed.');
  };
  const enquire = async () => {
    if (!requireAuth()) return;
    await plantAPI.enquiry(listing._id, { message });
    toast.success('Your question was sent to the seller.');
  };
  const report = async () => {
    if (!requireAuth()) return;
    await plantAPI.report(listing._id, { reason, details });
    toast.success('Report sent to the super admin.');
    setDetails('');
  };

  return (
    <div className="container-custom py-8 grid lg:grid-cols-5 gap-8">
      <div className="lg:col-span-3 space-y-3">
        <div className="grid sm:grid-cols-2 gap-3">
          {(listing.images || []).map((image) => (
            <img key={image.url} src={image.url} alt={listing.name} className="rounded-2xl w-full aspect-square object-cover" />
          ))}
        </div>
      </div>
      <div className="lg:col-span-2 space-y-4">
        <span className="badge">{typeBadge(listing.listingType)}</span>
        <h1 className="text-4xl font-display">{listing.name}</h1>
        <p className="text-lg">{priceText(listing)}</p>
        <p className="text-muted">{listing.description}</p>
        <p className="text-sm">Shared by {listing.ownerName} · {listing.city} {listing.postalCode}{listing.area ? ` · ${listing.area}` : ''}</p>
        <p className="text-sm">{listing.condition} · {listing.size || 'Unspecified size'} · {listing.potSize || 'Pot size not set'} · Qty {listing.quantity}</p>
        {listing.careInstructions && <p className="text-sm">Care: {listing.careInstructions}</p>}
        {listing.listingType === 'Exchange' && <p className="text-sm">Looking for: {listing.desiredPlants || 'Open to suitable plants'}.</p>}
        {listing.collectionInstructions && <p className="text-sm card p-3">Collection: {listing.collectionInstructions}</p>}
        <p className="text-xs text-muted">Do not list or exchange prohibited, invasive, or restricted plants.</p>
        {listing.isOwner ? <Link to={`/plants/${listing._id}/edit`} className="btn-outline">Edit listing</Link> : (
          <div className="space-y-3">
            <textarea className="input min-h-24" placeholder="Optional message" value={message} onChange={(e) => setMessage(e.target.value)} />
            {listing.listingType === 'FreeAdoption' && listing.status === 'Active' && <button className="btn-primary w-full" onClick={adopt}>Adopt Plant</button>}
            {listing.listingType === 'Exchange' && listing.status === 'Active' && (
              <>
                <select className="input" value={offered} onChange={(e) => setOffered(e.target.value)}>
                  <option value="">Offer one of your plants</option>
                  {offerings.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}
                </select>
                <button className="btn-primary w-full" onClick={exchange}>Propose Exchange</button>
              </>
            )}
            {listing.listingType === 'Sale' && (
              <>
                <Link className="btn-primary w-full text-center" to={listing.product ? `/products/${listing.product}` : '/community/apply'}>View & Buy</Link>
                <button className="btn-outline w-full" onClick={enquire}>Ask the seller</button>
              </>
            )}
          </div>
        )}
        <div className="card p-4 space-y-2">
          <p className="font-medium">Report this listing</p>
          <select className="input" value={reason} onChange={(e) => setReason(e.target.value)}>
            {['suspicious', 'scam', 'unsafe', 'inappropriate', 'restricted_species', 'other'].map((item) => <option key={item} value={item}>{item.replaceAll('_', ' ')}</option>)}
          </select>
          <textarea className="input" value={details} onChange={(e) => setDetails(e.target.value)} placeholder="What should an admin review?" />
          <button className="btn-outline" onClick={report}>Submit report</button>
        </div>
        <div>
          <h2 className="font-semibold mb-2">Reviews</h2>
          {reviews.length === 0 && <p className="text-sm text-muted">Reviews appear after a completed adoption or exchange.</p>}
          {reviews.map((review) => (
            <p key={review._id} className="text-sm py-2 border-t">{review.rating}/5 · {review.comment}</p>
          ))}
        </div>
      </div>
    </div>
  );
}
