import { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';
import { formatDate } from '../../utils/helpers';
import Pagination from '../../components/Pagination';
import { PageSpinner } from '../../components/Spinner';
import { MagnifyingGlassIcon, UsersIcon } from '@heroicons/react/24/outline';

export default function AdminCustomers() {
  const [customers,  setCustomers]  = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');
  const [page,       setPage]       = useState(1);

  const fetchCustomers = async (p = 1, q = search) => {
    setLoading(true);
    try {
      const res = await adminAPI.getCustomers({ page: p, limit: 20, search: q || undefined });
      setCustomers(res.data.customers);
      setPagination(res.data.pagination);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCustomers(page); }, [page]); // eslint-disable-line

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchCustomers(1, search);
  };

  const AVATAR_COLORS = [
    ['#EFF6FF','#2563eb'], ['#F0FDF4','#16a34a'], ['#FFF7ED','#ea580c'],
    ['#FDF4FF','#9333ea'], ['#FFF1F2','#e11d48'], ['#ECFDF5','#059669'],
  ];
  const avatarColor = (name) => AVATAR_COLORS[(name?.charCodeAt(0) || 0) % AVATAR_COLORS.length];

  return (
    <div className="space-y-5 animate-fade-in">

      <div className="page-header">
        <div>
          <h1 className="page-title">Customers</h1>
          <p className="page-subtitle">{pagination.total} registered</p>
        </div>
      </div>

      <div className="card overflow-hidden">
        {/* Search bar */}
        <div className="filter-bar">
          <form onSubmit={handleSearch} className="flex gap-2 flex-1 max-w-sm">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, email or phone…"
                className="input pl-9 text-sm"
              />
            </div>
            <button type="submit" className="btn-primary text-sm px-4">Search</button>
          </form>
        </div>

        {loading ? (
          <div className="py-16"><PageSpinner /></div>
        ) : customers.length === 0 ? (
          <div className="empty-state py-16">
            <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mb-3">
              <UsersIcon className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-sm text-gray-500">No customers match your search</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Registered</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => {
                  const [bg, color] = avatarColor(c.name);
                  return (
                    <tr key={c._id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                            style={{ background: bg, color }}
                          >
                            {c.name?.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-gray-900">{c.name}</span>
                        </div>
                      </td>
                      <td className="text-gray-500">{c.email}</td>
                      <td className="text-gray-500">{c.phone || '—'}</td>
                      <td className="text-xs text-gray-400 whitespace-nowrap">{formatDate(c.createdAt)}</td>
                      <td>
                        <span className={`badge ${c.isActive ? 'badge-green' : 'badge-red'}`}>
                          {c.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {!loading && (
        <Pagination page={pagination.page} pages={pagination.pages} onPageChange={setPage} />
      )}
    </div>
  );
}
