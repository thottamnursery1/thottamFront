import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { PlusIcon } from '@heroicons/react/24/outline';
import { plantAPI } from '../../services/api';
import ConfirmDialog from '../../components/ConfirmDialog';
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
  const [pendingRemove, setPendingRemove] = useState(null);

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
    <div className="container-custom py-6 sm:py-10">
      <div className="mb-5 flex flex-col gap-4 sm:mb-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-700">Plant exchange</p>
          <h1 className="mt-1 font-display text-3xl text-primary-900">My Plant Activities</h1>
          <p className="mt-1 max-w-md text-sm text-muted">Adoptions, exchanges, and the plants you have listed.</p>
        </div>
        <Link to="/plants/new" className="btn-primary h-11 w-full shrink-0 justify-center whitespace-nowrap px-4 sm:w-auto">
          <PlusIcon className="h-4 w-4" />
          List a plant
        </Link>
      </div>
      <div className="mb-5 grid grid-cols-2 gap-1 rounded-[1.2rem] bg-white p-1.5 shadow-card sm:flex" role="tablist" aria-label="Plant activities">
        {TABS.map((item) => {
          const active = tab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setParams({ tab: item.id })}
              className={`min-h-11 rounded-xl px-3 py-2 text-center text-xs font-semibold leading-tight sm:flex-1 sm:text-sm ${
                item.id === 'alerts' ? 'col-span-2 sm:col-span-1' : ''
              } ${active ? 'bg-primary-700 text-white shadow-sm' : 'text-ink/70 hover:bg-[#F3F1E8]'}`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      {tab === 'listings' && (
        <div className="space-y-3">
          {listings.length === 0 && (
            <div className="rounded-[1.4rem] bg-white px-6 py-12 text-center shadow-card">
              <p className="font-display text-2xl text-primary-900">No plants listed yet</p>
              <p className="mx-auto mt-2 max-w-sm text-sm text-muted">List a plant when you are ready to offer it for adoption or exchange.</p>
              <Link to="/plants/new" className="btn-primary mt-5 h-11 whitespace-nowrap px-5">List a plant</Link>
            </div>
          )}
          {listings.map((listing) => (
            <div key={listing._id} className="rounded-[1.2rem] bg-white p-4 shadow-card">
              <p className="font-medium text-ink">{listing.name}</p>
              <p className="mt-1 text-sm text-muted">{typeBadge(listing.listingType)} · {listing.status} · {priceText(listing)} · {when(listing.createdAt)}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link className="btn-outline h-10 whitespace-nowrap px-3" to={`/plants/${listing._id}`}>View</Link>
                {listing.status === 'Active' && <button type="button" className="btn-outline h-10 whitespace-nowrap px-3" onClick={() => act(() => plantAPI.pause(listing._id))}>Pause</button>}
                {listing.status === 'Paused' && <button type="button" className="btn-outline h-10 whitespace-nowrap px-3" onClick={() => act(() => plantAPI.pause(listing._id))}>Resume</button>}
                {listing.status !== 'Reserved' && <button type="button" className="btn-outline h-10 whitespace-nowrap px-3" onClick={() => setPendingRemove(listing)}>Remove</button>}
              </div>
            </div>
          ))}
        </div>
      )}
      {tab === 'incoming' && (
        <div className="space-y-3">
          {incoming.length === 0 && (data.enquiries || []).length === 0 && (
            <div className="rounded-[1.4rem] bg-white px-6 py-12 text-center shadow-card">
              <p className="font-display text-2xl text-primary-900">No requests yet</p>
              <p className="mx-auto mt-2 max-w-sm text-sm text-muted">Adoption and exchange requests for your plants will show up here.</p>
            </div>
          )}
          {incoming.map((item) => (
            <div key={item._id} className="card p-4 space-y-2">
              <p className="font-medium">{item.kind === 'adoption' ? item.listing?.name : `${item.offeredListing?.name || 'A plant'} for ${item.requestedListing?.name || 'your plant'}`}</p>
              <p className="text-sm text-muted">{item.status} · {when(item.createdAt)} · {item.message}</p>
              {item.counterNote && <p className="text-sm">Counter: {item.counterNote}</p>}
              {item.kind === 'adoption' && item.status === 'Pending' && (
                <div className="flex flex-wrap gap-2">
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
                <div className="flex flex-wrap gap-2">
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
          {mine.length === 0 && (
            <div className="rounded-[1.4rem] bg-white px-6 py-12 text-center shadow-card">
              <p className="font-display text-2xl text-primary-900">No requests sent</p>
              <p className="mx-auto mt-2 max-w-sm text-sm text-muted">Requests you send for adoption or exchange will show up here.</p>
            </div>
          )}
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
          {completedListings.length === 0 && mine.filter((item) => item.status === 'Completed').length === 0 && (
            <div className="rounded-[1.4rem] bg-white px-6 py-12 text-center shadow-card">
              <p className="font-display text-2xl text-primary-900">Nothing completed yet</p>
              <p className="mx-auto mt-2 max-w-sm text-sm text-muted">Finished adoptions and exchanges will be kept here.</p>
            </div>
          )}
          {completedListings.map((listing) => <p key={listing._id} className="card p-4">{listing.name} · {typeBadge(listing.listingType)} · given</p>)}
          {mine.filter((item) => item.status === 'Completed').map((item) => <p key={item._id} className="card p-4">{item.kind} completed · {when(item.completedAt)}</p>)}
        </div>
      )}
      {tab === 'alerts' && (
        <div className="space-y-2">
          {(data.notifications || []).length === 0 && (
            <div className="rounded-[1.4rem] bg-white px-6 py-12 text-center shadow-card">
              <p className="font-display text-2xl text-primary-900">No notifications</p>
              <p className="mx-auto mt-2 max-w-sm text-sm text-muted">Updates about your listings and requests will appear here.</p>
            </div>
          )}
          {(data.notifications || []).map((item) => (
            <Link key={item._id} to={item.link || '/account/plants'} className="card p-4 block">
              <p className="font-medium">{item.title}</p>
              <p className="text-sm text-muted">{item.body} · {when(item.createdAt)}</p>
            </Link>
          ))}
        </div>
      )}
      <ConfirmDialog
        open={Boolean(pendingRemove)}
        title={pendingRemove ? `Remove ${pendingRemove.name}?` : 'Remove this listing?'}
        message="This listing will leave your plant activities."
        confirmLabel="Remove"
        onClose={() => setPendingRemove(null)}
        onConfirm={() => {
          const listing = pendingRemove;
          setPendingRemove(null);
          if (listing) act(() => plantAPI.remove(listing._id));
        }}
      />
    </div>
  );
}
