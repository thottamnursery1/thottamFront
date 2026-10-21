import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { plantAPI } from '../../services/api';
import { priceText, typeBadge } from './PlantExchangePage';

const TABS = [
  { id: 'listings', label: 'My Listings' },
  { id: 'incoming', label: 'Incoming Requests' },
  { id: 'mine', label: 'My Requests' },
  { id: 'completed', label: 'Completed Activities' },
  { id: 'alerts', label: 'Notifications' },
];

function when(value) {
  return value ? new Date(value).toLocaleString() : '';
}

export default function PlantActivitiesPage() {
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') || 'listings';
  const [data, setData] = useState(null);
  const [reason, setReason] = useState('');

  const load = () => plantAPI.activities().then((res) => setData(res.data)).catch(() => setData({ listings: [] }));
  useEffect(() => { load(); }, []);
  useEffect(() => {
    if (tab === 'alerts') plantAPI.readNotifications().catch(() => {});
  }, [tab]);

  if (!data) return <div className="container-custom py-10"><div className="h-40 skeleton rounded-2xl" /></div>;

  const act = async (fn) => {
    try { await fn(); toast.success('Updated.'); load(); } catch (err) { toast.error(err.response?.data?.message || 'That action could not be completed.'); }
  };

  const listings = data.listings || [];
  const completedListings = listings.filter((item) => ['Completed'].includes(item.status));
  const incoming = [...(data.incomingAdoptions || []).map((item) => ({ ...item, kind: 'adoption' })), ...(data.incomingExchanges || []).map((item) => ({ ...item, kind: 'exchange' }))];
  const mine = [...(data.myAdoptions || []).map((item) => ({ ...item, kind: 'adoption' })), ...(data.myExchanges || []).map((item) => ({ ...item, kind: 'exchange' }))];

  return (
    <div className="container-custom py-8">
      <div className="flex items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="page-title">My Plant Activities</h1>
          <p className="page-subtitle">Adoptions, exchanges, and the plants you have listed.</p>
        </div>
        <Link to="/plants/new" className="btn-primary">List a plant</Link>
      </div>
      <div className="flex gap-2 overflow-x-auto mb-6">
        {TABS.map((item) => (
          <button key={item.id} onClick={() => setParams({ tab: item.id })} className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${tab === item.id ? 'bg-primary-700 text-white' : 'bg-white border'}`}>{item.label}</button>
        ))}
      </div>
      {tab === 'listings' && (
        <div className="space-y-3">
          {listings.length === 0 && <p className="card p-6">You have not listed a plant yet.</p>}
          {listings.map((listing) => (
            <div key={listing._id} className="card p-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-medium">{listing.name}</p>
                <p className="text-sm text-muted">{typeBadge(listing.listingType)} · {listing.status} · {priceText(listing)} · {when(listing.createdAt)}</p>
              </div>
              <div className="flex gap-2">
                <Link className="btn-outline" to={`/plants/${listing._id}`}>View</Link>
                {listing.status === 'Active' && <button className="btn-outline" onClick={() => act(() => plantAPI.pause(listing._id))}>Pause</button>}
                {listing.status === 'Paused' && <button className="btn-outline" onClick={() => act(() => plantAPI.pause(listing._id))}>Resume</button>}
                {listing.status !== 'Reserved' && <button className="btn-outline" onClick={() => window.confirm('Remove this listing?') && act(() => plantAPI.remove(listing._id))}>Remove</button>}
              </div>
            </div>
          ))}
        </div>
      )}
      {tab === 'incoming' && (
        <div className="space-y-3">
          {incoming.length === 0 && (data.enquiries || []).length === 0 && <p className="card p-6">No requests yet.</p>}
          {incoming.map((item) => (
            <div key={item._id} className="card p-4 space-y-2">
              <p className="font-medium">{item.kind === 'adoption' ? item.listing?.name : `${item.offeredListing?.name || 'A plant'} for ${item.requestedListing?.name || 'your plant'}`}</p>
              <p className="text-sm text-muted">{item.status} · {when(item.createdAt)} · {item.message}</p>
              {item.counterNote && <p className="text-sm">Counter: {item.counterNote}</p>}
              {item.kind === 'adoption' && item.status === 'Pending' && (
                <div className="flex gap-2">
                  <button className="btn-primary" onClick={() => act(() => plantAPI.respondAdoption(item._id, { action: 'accept' }))}>Accept</button>
                  <button className="btn-outline" onClick={() => act(() => plantAPI.respondAdoption(item._id, { action: 'reject', reason }))}>Reject</button>
                </div>
              )}
              {item.kind === 'exchange' && item.status === 'Pending' && (
                <div className="flex flex-wrap gap-2">
                  <button className="btn-primary" onClick={() => act(() => plantAPI.respondExchange(item._id, { action: 'accept' }))}>Accept</button>
                  <button className="btn-outline" onClick={() => act(() => plantAPI.respondExchange(item._id, { action: 'counter', note: reason || 'Could we look at another plant?' }))}>Negotiate</button>
                  <button className="btn-outline" onClick={() => act(() => plantAPI.respondExchange(item._id, { action: 'reject', reason }))}>Reject</button>
                </div>
              )}
              {item.status === 'AwaitingHandover' && (
                <div className="flex gap-2">
                  <button className="btn-primary" onClick={() => act(() => (item.kind === 'adoption' ? plantAPI.confirmAdoption(item._id) : plantAPI.confirmExchange(item._id)))}>Confirm handover</button>
                  <button className="btn-outline" onClick={() => act(() => (item.kind === 'adoption' ? plantAPI.cancelAdoption(item._id, { reason: reason || 'Unable to complete pickup' }) : plantAPI.cancelExchange(item._id, { reason: reason || 'Unable to complete pickup' })))}>Cancel</button>
                </div>
              )}
              <input className="input" placeholder="Reason, if you reject or cancel" value={reason} onChange={(e) => setReason(e.target.value)} />
            </div>
          ))}
          {(data.enquiries || []).filter((item) => item.enquiryStatus === 'open').map((item) => (
            <div key={item._id} className="card p-4">
              <p className="font-medium">Sale question</p>
              <p className="text-sm">{item.note}</p>
              <button className="btn-outline mt-2" onClick={() => act(() => plantAPI.closeEnquiry(item._id))}>Close</button>
            </div>
          ))}
        </div>
      )}
      {tab === 'mine' && (
        <div className="space-y-3">
          {mine.length === 0 && <p className="card p-6">You have not sent a request yet.</p>}
          {mine.map((item) => (
            <div key={item._id} className="card p-4 space-y-2">
              <p className="font-medium">{item.kind === 'adoption' ? item.listing?.name : item.requestedListing?.name}</p>
              <p className="text-sm text-muted">{item.status} · {when(item.createdAt)}</p>
              {['Pending', 'CounterProposed'].includes(item.status) && <button className="btn-outline" onClick={() => act(() => (item.kind === 'adoption' ? plantAPI.withdrawAdoption(item._id) : plantAPI.withdrawExchange(item._id)))}>Withdraw</button>}
              {item.kind === 'exchange' && item.status === 'CounterProposed' && (
                <button className="btn-primary" onClick={() => act(() => plantAPI.respondExchange(item._id, { action: 'accept' }))}>Accept counter offer</button>
              )}
              {item.status === 'AwaitingHandover' && <button className="btn-primary" onClick={() => act(() => (item.kind === 'adoption' ? plantAPI.confirmAdoption(item._id) : plantAPI.confirmExchange(item._id)))}>Confirm handover</button>}
            </div>
          ))}
        </div>
      )}
      {tab === 'completed' && (
        <div className="space-y-3">
          {completedListings.length === 0 && mine.filter((item) => item.status === 'Completed').length === 0 && <p className="card p-6">Completed adoptions and exchanges will appear here.</p>}
          {completedListings.map((listing) => <p key={listing._id} className="card p-4">{listing.name} · {typeBadge(listing.listingType)} · given</p>)}
          {mine.filter((item) => item.status === 'Completed').map((item) => <p key={item._id} className="card p-4">{item.kind} completed · {when(item.completedAt)}</p>)}
        </div>
      )}
      {tab === 'alerts' && (
        <div className="space-y-2">
          {(data.notifications || []).length === 0 && <p className="card p-6">No plant notifications yet.</p>}
          {(data.notifications || []).map((item) => (
            <Link key={item._id} to={item.link || '/account/plants'} className="card p-4 block">
              <p className="font-medium">{item.title}</p>
              <p className="text-sm text-muted">{item.body} · {when(item.createdAt)}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
