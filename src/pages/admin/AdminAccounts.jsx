import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI, authAPI } from '../../services/api';
import { formatDate, ROLE_LABELS, normalizeEmail, EMAIL_TAKEN_MESSAGE } from '../../utils/helpers';
import Pagination from '../../components/Pagination';
import { PageSpinner } from '../../components/Spinner';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { ChevronDownIcon, CheckIcon, BuildingStorefrontIcon, UsersIcon, ShieldCheckIcon, UserPlusIcon } from '@heroicons/react/24/outline';

const emptyProductAdmin = { name: '', email: '', password: '', shopId: '' };
const emptySuperAdmin   = { name: '', email: '', password: '' };

/* ── Custom shop selector ───────────────────────────────────── */
function ShopSelect({ shops, value, onChange, required, placeholder = 'Select shop' }) {
  const [open, setOpen] = useState(false);
  const ref             = useRef(null);
  const selected        = shops.find((s) => s._id === value);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`input w-full flex items-center justify-between gap-3 text-left ${!selected ? 'text-gray-400' : 'text-gray-900'}`}
      >
        <span className="flex items-center gap-2.5 min-w-0">
          {selected ? (
            <>
              <BuildingStorefrontIcon className="w-4 h-4 text-primary-600 flex-shrink-0" />
              <span className="truncate text-sm font-medium">{selected.name}</span>
            </>
          ) : (
            <span className="text-sm">{placeholder}</span>
          )}
        </span>
        <ChevronDownIcon className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full card shadow-popover overflow-hidden animate-fade-in">
          {shops.length === 0 ? (
            <p className="px-4 py-3 text-sm text-gray-400 text-center">No approved shops available</p>
          ) : (
            <ul className="py-1 max-h-52 overflow-y-auto scrollbar-thin">
              {shops.map((shop) => (
                <li key={shop._id}>
                  <button
                    type="button"
                    onClick={() => { onChange(shop._id); setOpen(false); }}
                    className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-primary-50 transition-colors ${value === shop._id ? 'bg-primary-50 text-primary-800' : 'text-gray-700'}`}
                  >
                    <BuildingStorefrontIcon className="w-4 h-4 text-primary-500 flex-shrink-0" />
                    <span className="flex-1 text-left font-medium truncate">{shop.name}</span>
                    {value === shop._id && <CheckIcon className="w-4 h-4 text-primary-600 flex-shrink-0" />}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <select className="sr-only" value={value} onChange={(e) => onChange(e.target.value)} required={required} tabIndex={-1} aria-hidden="true">
        <option value="" />
        {shops.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
      </select>
    </div>
  );
}

/* ── Page ───────────────────────────────────────────────────── */
export default function AdminAccounts() {
  const { user } = useAuth();

  const [accounts,          setAccounts]          = useState([]);
  const [shops,             setShops]             = useState([]);
  const [pagination,        setPagination]        = useState({ page: 1, pages: 1, total: 0 });
  const [loading,           setLoading]           = useState(true);
  const [page,              setPage]              = useState(1);
  const [search,            setSearch]            = useState('');
  const [role,              setRole]              = useState('');
  const [accountStatus,     setAccountStatus]     = useState('');
  const [shopApprovalStatus,setShopApprovalStatus]= useState('');
  const [pending,           setPending]           = useState(null);
  const [reason,            setReason]            = useState('');
  const [assigning,         setAssigning]         = useState(null);
  const [shopId,            setShopId]            = useState('');
  const [productAdmin,      setProductAdmin]      = useState(emptyProductAdmin);
  const [superAdmin,        setSuperAdmin]        = useState(emptySuperAdmin);
  const [formError,         setFormError]         = useState('');

  const load = async (nextPage = page) => {
    setLoading(true);
    try {
      const res = await adminAPI.getAccounts({
        page: nextPage, limit: 20,
        search:            search.trim() || undefined,
        role:              role           || undefined,
        accountStatus:     accountStatus  || undefined,
        shopApprovalStatus: shopApprovalStatus || undefined,
      });
      setAccounts(res.data.accounts || []);
      setPagination(res.data.pagination || { page: 1, pages: 1, total: 0 });
    } finally { setLoading(false); }
  };

  useEffect(() => { load(page); }, [page, role, accountStatus, shopApprovalStatus]); // eslint-disable-line
  useEffect(() => { adminAPI.getSellers().then((r) => setShops(r.data.sellers || [])).catch(() => {}); }, []);

  const confirm = async () => {
    if (!pending) return;
    try {
      if (pending.kind === 'status') await adminAPI.setAccountStatus(pending.id, pending.accountStatus);
      else await adminAPI.reviewSeller(pending.shopId, { action: pending.action, reason });
      toast.success('Account updated.');
      setPending(null); setReason(''); load();
    } catch { /* interceptor handles */ }
  };

  const assignShop = async (e) => {
    e.preventDefault();
    await adminAPI.assignProductAdmin(assigning._id, shopId);
    toast.success('Shop assigned.');
    setAssigning(null); setShopId(''); load();
  };

  const checkEmail = async (email) => {
    const res = await authAPI.checkEmail(normalizeEmail(email));
    if (!res.data.available) { setFormError(res.data.message || EMAIL_TAKEN_MESSAGE); return false; }
    return true;
  };

  const createProductAdmin = async (e) => {
    e.preventDefault(); setFormError('');
    const email = normalizeEmail(productAdmin.email);
    if (!(await checkEmail(email))) return;
    const res = await adminAPI.createAccount({ ...productAdmin, email, role: 'product_admin' });
    toast.success(res.data.message); setProductAdmin(emptyProductAdmin); load();
  };

  const createSuperAdmin = async (e) => {
    e.preventDefault(); setFormError('');
    const email = normalizeEmail(superAdmin.email);
    if (!(await checkEmail(email))) return;
    const res = await adminAPI.createAccount({ ...superAdmin, email, role: 'super_admin' });
    toast.success(res.data.message); setSuperAdmin(emptySuperAdmin); load();
  };

  const approvedShops = shops.filter((s) => s.status === 'approved');

  const ROLE_BADGE = { super_admin: 'bg-purple-100 text-purple-700', shop_admin: 'bg-blue-100 text-blue-700', shop_assistant: 'bg-sky-100 text-sky-700', customer: 'bg-gray-100 text-gray-600' };

  return (
    <div className="space-y-5 animate-fade-in">

      <div className="page-header">
        <div>
          <h1 className="page-title">Accounts</h1>
          <p className="page-subtitle">Shop approval and account status are managed independently</p>
        </div>
      </div>

      {/* ── Filters ──────────────────────────────────────── */}
      <form
        onSubmit={(e) => { e.preventDefault(); setPage(1); load(1); }}
        className="card p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3"
      >
        <input className="input sm:col-span-2" placeholder="Search name or email…" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="input" value={role} onChange={(e) => { setRole(e.target.value); setPage(1); }}>
          <option value="">All Roles</option>
          <option value="customer">Customer</option>
          <option value="shop_admin">Shop Admin</option>
          <option value="shop_assistant">Shop Assistant</option>
          <option value="super_admin">Super Admin</option>
        </select>
        <select className="input" value={accountStatus} onChange={(e) => { setAccountStatus(e.target.value); setPage(1); }}>
          <option value="">Account Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <select className="input" value={shopApprovalStatus} onChange={(e) => { setShopApprovalStatus(e.target.value); setPage(1); }}>
          <option value="">Shop Approval</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="suspended">Suspended</option>
        </select>
        <button className="btn-primary sm:col-span-2 lg:col-span-5 w-fit" type="submit">Search</button>
      </form>

      {/* ── Table ────────────────────────────────────────── */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="py-16"><PageSpinner /></div>
        ) : accounts.length === 0 ? (
          <div className="empty-state py-14">
            <UsersIcon className="w-10 h-10 text-gray-300 mb-3" />
            <p className="text-sm text-gray-500">No accounts match these filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Shop</th>
                  <th>Account</th>
                  <th>Shop Approval</th>
                  <th>Registered</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((account) => {
                  const isSelf      = account._id === user?._id;
                  const nextStatus  = account.accountStatus === 'active' ? 'inactive' : 'active';
                  return (
                    <tr key={account._id}>
                      <td className="font-medium text-gray-900">{account.name}</td>
                      <td className="text-gray-500 text-xs">{account.email}</td>
                      <td>
                        <span className={`badge text-xs ${ROLE_BADGE[account.role] || 'bg-gray-100 text-gray-600'}`}>
                          {ROLE_LABELS[account.role] || account.role}
                        </span>
                      </td>
                      <td className="text-gray-500">{account.shop?.name || '—'}</td>
                      <td>
                        <span className={`badge text-xs ${account.accountStatus === 'active' ? 'badge-green' : 'badge-red'}`}>
                          {account.accountStatus}
                        </span>
                      </td>
                      <td className="text-gray-500 capitalize">{account.shopApprovalStatus || '—'}</td>
                      <td className="text-xs text-gray-400 whitespace-nowrap">{formatDate(account.createdAt)}</td>
                      <td>
                        <div className="flex flex-wrap gap-1.5">
                          <button
                            className="text-xs font-medium text-primary-600 hover:text-primary-700 disabled:opacity-40"
                            disabled={isSelf && account.accountStatus === 'active'}
                            onClick={() => setPending({ kind: 'status', id: account._id, name: account.name, accountStatus: nextStatus })}
                          >
                            {account.accountStatus === 'active' ? 'Deactivate' : 'Activate'}
                          </button>
                          {account.role === 'product_admin' && (
                            <button className="text-xs font-medium text-blue-600 hover:text-blue-700"
                              onClick={() => { setAssigning(account); setShopId(account.shop?._id || ''); }}>
                              Assign shop
                            </button>
                          )}
                          {account.shop?.status === 'pending' && (
                            <>
                              <Link className="text-xs font-medium text-emerald-600 hover:text-emerald-700" to={`/admin/sellers/${account.shop._id}`}>
                                Review shop
                              </Link>
                              <button className="text-xs font-medium text-red-500 hover:text-red-600"
                                onClick={() => setPending({ kind: 'shop', shopId: account.shop._id, action: 'reject', name: account.shop.name })}>
                                Reject shop
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {!loading && <Pagination page={pagination.page} pages={pagination.pages} onPageChange={setPage} />}

      {/* ── Create account forms ─────────────────────────── */}
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="card p-5 space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <UserPlusIcon className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Assign Product Admin</p>
              <p className="text-xs text-gray-400 mt-0.5">Manages one shop's catalog only</p>
            </div>
          </div>
          <form onSubmit={createProductAdmin} className="space-y-3">
            <input className="input" placeholder="Full name" value={productAdmin.name} onChange={(e) => setProductAdmin({ ...productAdmin, name: e.target.value })} required />
            <input className="input" type="email" placeholder="Email" value={productAdmin.email} onChange={(e) => setProductAdmin({ ...productAdmin, email: e.target.value })} required />
            <input className="input" type="password" placeholder="Temporary password" value={productAdmin.password} onChange={(e) => setProductAdmin({ ...productAdmin, password: e.target.value })} required minLength={8} />
            <ShopSelect shops={approvedShops} value={productAdmin.shopId} onChange={(id) => setProductAdmin({ ...productAdmin, shopId: id })} required />
            <button className="btn-primary w-full" type="submit">Create Product Admin</button>
          </form>
        </div>

        <div className="card p-5 space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
            <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
              <ShieldCheckIcon className="w-4 h-4 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Create Super Admin</p>
              <p className="text-xs text-gray-400 mt-0.5">Full platform access — use with care</p>
            </div>
          </div>
          <form onSubmit={createSuperAdmin} className="space-y-3">
            <input className="input" placeholder="Full name" value={superAdmin.name} onChange={(e) => setSuperAdmin({ ...superAdmin, name: e.target.value })} required />
            <input className="input" type="email" placeholder="Email" value={superAdmin.email} onChange={(e) => setSuperAdmin({ ...superAdmin, email: e.target.value })} required />
            <input className="input" type="password" placeholder="Password" value={superAdmin.password} onChange={(e) => setSuperAdmin({ ...superAdmin, password: e.target.value })} required minLength={8} />
            <button className="btn-primary w-full" type="submit">Create Super Admin</button>
          </form>
        </div>
      </div>
      {formError && <p className="text-sm text-red-600 mt-1">{formError}</p>}

      {/* ── Confirm modal ────────────────────────────────── */}
      {pending && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => { setPending(null); setReason(''); }} />
          <div className="relative card p-6 max-w-md w-full animate-fade-in-up" role="dialog">
            <h2 className="text-sm font-semibold text-gray-900 mb-1">
              {pending.kind === 'status'
                ? `${pending.accountStatus === 'active' ? 'Activate' : 'Deactivate'} "${pending.name}"?`
                : `${pending.action === 'approve' ? 'Approve' : 'Reject'} shop "${pending.name}"?`}
            </h2>
            <p className="text-xs text-gray-500 mb-4">
              {pending.kind === 'status'
                ? 'This only affects login access — shop approval is unchanged.'
                : pending.action === 'approve'
                  ? 'This unlocks the Shop Admin and Product Admin workspaces.'
                  : 'Please provide a reason for rejection.'}
            </p>
            {pending.action === 'reject' && (
              <textarea className="input mb-4 resize-none" placeholder="Rejection reason" rows={2} value={reason} onChange={(e) => setReason(e.target.value)} />
            )}
            <div className="flex gap-3">
              <button onClick={confirm} className="btn-primary flex-1">Confirm</button>
              <button onClick={() => { setPending(null); setReason(''); }} className="btn-ghost flex-1">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Assign shop modal ────────────────────────────── */}
      {assigning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setAssigning(null)} />
          <form onSubmit={assignShop} className="relative card p-6 max-w-sm w-full space-y-4 animate-fade-in-up" role="dialog">
            <p className="text-sm font-semibold text-gray-900">Assign shop for {assigning.name}</p>
            <ShopSelect shops={approvedShops} value={shopId} onChange={setShopId} required />
            <div className="flex gap-3">
              <button type="submit" className="btn-primary flex-1">Assign</button>
              <button type="button" onClick={() => setAssigning(null)} className="btn-ghost flex-1">Cancel</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
