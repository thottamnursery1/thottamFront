import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { plantAPI } from '../../services/api';

const TYPES = [
  { id: 'all', label: 'All' },
  { id: 'FreeAdoption', label: 'Free Adoption' },
  { id: 'Exchange', label: 'Plant Exchange' },
  { id: 'Sale', label: 'For Sale' },
];
const CATEGORIES = ['herb', 'indoor', 'outdoor', 'seedling', 'flowering', 'succulent', 'gardening'];
const DISTANCES = [5, 10, 25, 50];

export function typeBadge(type) {
  if (type === 'FreeAdoption') return 'Free Adoption';
  if (type === 'Exchange') return 'Exchange';
  return 'For Sale';
}

export function priceText(listing) {
  if (listing.listingType === 'FreeAdoption') return 'Free Adoption';
  if (listing.listingType === 'Exchange') return 'Exchange';
  return `₹${listing.price}`;
}

function badgeClass(type) {
  if (type === 'FreeAdoption') return 'bg-emerald-100 text-emerald-800';
  if (type === 'Exchange') return 'bg-amber-100 text-amber-800';
  return 'bg-primary-100 text-primary-800';
}

export function PlantCard({ listing }) {
  const cta = listing.listingType === 'FreeAdoption' ? 'Adopt Plant' : listing.listingType === 'Exchange' ? 'Propose Exchange' : 'View & Buy';
  const to = listing.listingType === 'Sale' && listing.product ? `/products/${listing.product}` : `/plants/${listing._id}`;
  return (
    <article className="card overflow-hidden flex flex-col">
      <Link to={`/plants/${listing._id}`} className="aspect-[4/5] bg-primary-50 block">
        {listing.images?.[0]?.url ? (
          <img src={listing.images[0].url} alt={listing.name} className="w-full h-full object-cover" />
        ) : <div className="w-full h-full" />}
      </Link>
      <div className="p-4 flex flex-col gap-2 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${badgeClass(listing.listingType)}`}>{typeBadge(listing.listingType)}</span>
          <span className="text-xs text-muted">{listing.status}</span>
        </div>
        <h3 className="font-semibold text-ink">{listing.name}</h3>
        <p className="text-sm text-muted line-clamp-2">{listing.description}</p>
        <p className="text-sm font-medium">{priceText(listing)}</p>
        <p className="text-xs text-muted">
          {listing.ownerName} · {listing.condition} · {listing.size || 'size not set'}
          {listing.distanceKm != null ? ` · ${listing.distanceKm} km` : ''}
        </p>
        <p className="text-xs text-muted">{listing.city} {listing.postalCode} · Qty {listing.quantity} · {new Date(listing.createdAt).toLocaleDateString()}</p>
        <Link to={to} className="btn-primary mt-auto text-center">{cta}</Link>
      </div>
    </article>
  );
}

export default function PlantExchangePage() {
  const [params, setParams] = useSearchParams();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState(() => {
    try { return JSON.parse(localStorage.getItem('plantBrowseLocation') || '{}'); } catch { return {}; }
  });

  const filters = {
    type: params.get('type') || 'all',
    q: params.get('q') || '',
    category: params.get('category') || '',
    city: params.get('city') || location.city || '',
    postalCode: params.get('postalCode') || '',
    distance: params.get('distance') || '',
    sort: params.get('sort') || 'newest',
  };

  useEffect(() => {
    const query = { ...filters };
    if (location.lat && location.lng) {
      query.lat = location.lat;
      query.lng = location.lng;
    }
    if (!query.distance) delete query.distance;
    setLoading(true);
    plantAPI.list(query).then((res) => setListings(res.data.listings || [])).catch(() => setListings([])).finally(() => setLoading(false));
  }, [params, location.lat, location.lng]);

  const update = (patch) => {
    const next = new URLSearchParams(params);
    Object.entries(patch).forEach(([key, value]) => {
      if (value) next.set(key, value); else next.delete(key);
    });
    setParams(next);
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      const next = { ...location, lat: pos.coords.latitude, lng: pos.coords.longitude, label: 'Current location' };
      setLocation(next);
      localStorage.setItem('plantBrowseLocation', JSON.stringify(next));
      update({ sort: 'nearest' });
    });
  };

  return (
    <div>
      <section className="bg-gradient-to-br from-primary-800 via-primary-700 to-emerald-700 text-white">
        <div className="container-custom py-16 sm:py-20">
          <p className="text-xs uppercase tracking-[0.2em] text-white/70">Thottam community</p>
          <h1 className="text-4xl sm:text-6xl font-display mt-3 max-w-2xl">Give Plants a New Home.</h1>
          <p className="mt-4 text-lg text-white/85 max-w-xl">Adopt, exchange, or share the joy of growing.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#plants" className="btn-primary bg-white text-primary-800">Explore Plants</a>
            <Link to="/plants/new" className="btn-outline border-white text-white">List a Plant</Link>
          </div>
        </div>
      </section>
      <div id="plants" className="container-custom py-8 space-y-5">
        <div className="flex gap-2 overflow-x-auto">
          {TYPES.map((type) => (
            <button key={type.id} onClick={() => update({ type: type.id === 'all' ? '' : type.id })} className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${filters.type === type.id ? 'bg-primary-700 text-white' : 'bg-white border'}`}>{type.label}</button>
          ))}
        </div>
        <div className="grid md:grid-cols-6 gap-3">
          <input className="input md:col-span-2" placeholder="Search plant name" value={filters.q} onChange={(e) => update({ q: e.target.value })} />
          <select className="input" value={filters.category} onChange={(e) => update({ category: e.target.value })}>
            <option value="">Category</option>
            {CATEGORIES.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <input className="input" placeholder="City" value={filters.city} onChange={(e) => update({ city: e.target.value })} />
          <input className="input" placeholder="PIN code" value={filters.postalCode} onChange={(e) => update({ postalCode: e.target.value })} />
          <select className="input" value={filters.sort} onChange={(e) => update({ sort: e.target.value })}>
            <option value="newest">Newest</option>
            <option value="nearest">Nearest</option>
            <option value="price_asc">Price low to high</option>
            <option value="price_desc">Price high to low</option>
          </select>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          {DISTANCES.map((km) => (
            <button key={km} onClick={() => update({ distance: filters.distance === String(km) ? '' : String(km) })} className={`px-3 py-1 rounded-full text-xs border ${filters.distance === String(km) ? 'bg-primary-700 text-white' : 'bg-white'}`}>{km} km</button>
          ))}
          <button type="button" onClick={useCurrentLocation} className="text-sm text-primary-700">Use current location</button>
          <span className="text-xs text-muted">Location is optional. Exact addresses stay private.</span>
        </div>
        {loading ? <div className="h-40 skeleton rounded-2xl" /> : listings.length === 0 ? (
          <div className="card p-10 text-center">
            <h2 className="text-xl">No plants match these filters</h2>
            <p className="text-muted mt-2">Try another city, or list a plant for a neighbour to adopt.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {listings.map((listing) => <PlantCard key={listing._id} listing={listing} />)}
          </div>
        )}
      </div>
    </div>
  );
}
