import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { plantAPI } from '../../services/api';

export default function AdminPlants() {
  const [metrics, setMetrics] = useState(null);
  const [listings, setListings] = useState([]);
  const [reports, setReports] = useState([]);
  const [requests, setRequests] = useState({ adoptions: [], exchanges: [] });
  const [logs, setLogs] = useState([]);
  const [policy, setPolicy] = useState({ plantListingExpiryDays: 30, plantRequestExpiryHours: 72, plantMaxActiveListings: 12, plantRequireModeration: false });
  const [userId, setUserId] = useState('');

  const load = () => {
    plantAPI.metrics().then((res) => setMetrics(res.data)).catch(() => setMetrics({ byType: [], byStatus: [] }));
    plantAPI.adminListings().then((res) => setListings(res.data.listings || []));
    plantAPI.adminReports().then((res) => setReports(res.data.reports || []));
    plantAPI.adminRequests().then((res) => setRequests(res.data));
    plantAPI.audit().then((res) => setLogs(res.data.logs || []));
  };
  useEffect(() => { load(); }, []);

  const moderate = async (id, action) => {
    await plantAPI.moderate(id, { action });
    toast.success('Listing updated.');
    load();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Plant Adoption & Exchange</h1>
        <p className="page-subtitle">Counts come from live listing, request, and report records.</p>
      </div>
      {!metrics ? <div className="h-24 skeleton rounded-2xl" /> : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-3">
          {(metrics.byType || []).map((row) => <div key={row._id} className="card p-4"><p className="text-xs text-muted">{row._id}</p><p className="text-2xl">{row.count}</p></div>)}
          {(metrics.byStatus || []).map((row) => <div key={row._id} className="card p-4"><p className="text-xs text-muted">{row._id}</p><p className="text-2xl">{row.count}</p></div>)}
          <div className="card p-4"><p className="text-xs text-muted">Adoption requests</p><p className="text-2xl">{metrics.requests || 0}</p></div>
          <div className="card p-4"><p className="text-xs text-muted">Exchange proposals</p><p className="text-2xl">{metrics.proposals || 0}</p></div>
          <div className="card p-4"><p className="text-xs text-muted">Open reports</p><p className="text-2xl">{metrics.openReports || 0}</p></div>
        </div>
      )}
      <form className="card p-4 grid sm:grid-cols-4 gap-3" onSubmit={async (e) => { e.preventDefault(); await plantAPI.policy(policy); toast.success('Policy saved.'); }}>
        <label className="text-sm">Listing expiry days<input className="input" type="number" value={policy.plantListingExpiryDays} onChange={(e) => setPolicy({ ...policy, plantListingExpiryDays: Number(e.target.value) })} /></label>
        <label className="text-sm">Request expiry hours<input className="input" type="number" value={policy.plantRequestExpiryHours} onChange={(e) => setPolicy({ ...policy, plantRequestExpiryHours: Number(e.target.value) })} /></label>
        <label className="text-sm">Max open listings<input className="input" type="number" value={policy.plantMaxActiveListings} onChange={(e) => setPolicy({ ...policy, plantMaxActiveListings: Number(e.target.value) })} /></label>
        <label className="text-sm flex items-center gap-2 mt-6"><input type="checkbox" checked={policy.plantRequireModeration} onChange={(e) => setPolicy({ ...policy, plantRequireModeration: e.target.checked })} /> Require moderation</label>
        <button className="btn-primary sm:col-span-4">Save policy</button>
      </form>
      <div className="card p-4 flex gap-2">
        <input className="input" placeholder="User id to suspend from plant exchange" value={userId} onChange={(e) => setUserId(e.target.value)} />
        <button className="btn-outline" onClick={() => plantAPI.restrict(userId, { action: 'suspend' }).then(() => toast.success('User suspended from plant exchange.'))}>Suspend</button>
        <button className="btn-outline" onClick={() => plantAPI.restrict(userId, { action: 'reinstate' }).then(() => toast.success('User reinstated.'))}>Reinstate</button>
      </div>
      <section className="space-y-2">
        <h2 className="font-semibold">Listings</h2>
        {listings.map((listing) => (
          <div key={listing._id} className="card p-3 flex flex-wrap justify-between gap-2">
            <p>{listing.name} · {listing.listingType} · {listing.status}</p>
            <div className="flex gap-2">
              <button className="btn-outline" onClick={() => moderate(listing._id, 'approve')}>Approve</button>
              <button className="btn-outline" onClick={() => moderate(listing._id, 'remove')}>Remove</button>
              <button className="btn-outline" onClick={() => moderate(listing._id, 'restore')}>Restore</button>
            </div>
          </div>
        ))}
      </section>
      <section className="space-y-2">
        <h2 className="font-semibold">Requests</h2>
        {(requests.adoptions || []).slice(0, 10).map((item) => <p key={item._id} className="text-sm">Adoption · {item.listing?.name} · {item.status}</p>)}
        {(requests.exchanges || []).slice(0, 10).map((item) => <p key={item._id} className="text-sm">Exchange · {item.requestedListing?.name} · {item.status}</p>)}
      </section>
      <section className="space-y-2">
        <h2 className="font-semibold">Reports</h2>
        {reports.map((report) => (
          <div key={report._id} className="card p-3 flex justify-between gap-2">
            <p className="text-sm">{report.plantListing?.name} · {report.reason} · {report.status}<br />{report.details}</p>
            <button className="btn-outline" onClick={() => plantAPI.resolveReport(report._id, { status: 'resolved', resolution: 'Reviewed' }).then(load)}>Resolve</button>
          </div>
        ))}
      </section>
      <section>
        <h2 className="font-semibold mb-2">Audit</h2>
        {logs.map((log) => <p key={log._id} className="text-sm text-muted">{log.action} · {log.performedBy?.name || 'Admin'} · {new Date(log.createdAt).toLocaleString()}</p>)}
      </section>
    </div>
  );
}
