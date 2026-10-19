import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import { formatPrice } from '../../utils/helpers';
import { ArrowLeftIcon, BuildingStorefrontIcon, CurrencyRupeeIcon, ShoppingBagIcon, CubeIcon } from '@heroicons/react/24/outline';

function InfoRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex gap-3 py-2 border-b border-gray-50 last:border-0">
      <span className="text-xs text-gray-400 w-28 flex-shrink-0 pt-0.5">{label}</span>
      <span className="text-sm text-gray-800 font-medium">{value}</span>
    </div>
  );
}

export default function AdminSellerDetail() {
  const { id }  = useParams();
  const [data,  setData]  = useState(null);

  useEffect(() => { adminAPI.getSeller(id).then((res) => setData(res.data)); }, [id]);

  if (!data) return (
    <div className="space-y-4">
      <div className="h-8 skeleton rounded-xl w-48" />
      <div className="h-36 skeleton rounded-[14px]" />
      <div className="h-64 skeleton rounded-[14px]" />
    </div>
  );

  const { seller, products, performance } = data;

  const STATUS_COLOR = {
    approved:  'badge-green',
    pending:   'badge-orange',
    rejected:  'badge-red',
    suspended: 'badge-gray',
  };

  return (
    <div className="space-y-5 max-w-4xl animate-fade-in">

      <Link to="/admin/sellers" className="inline-flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-700">
        <ArrowLeftIcon className="w-4 h-4" /> Back to Sellers
      </Link>

      {/* ── Header ───────────────────────────────────────── */}
      <div className="card p-5 flex flex-wrap items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0">
          <BuildingStorefrontIcon className="w-6 h-6 text-primary-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="page-title">{seller.name}</h1>
            <span className={`badge ${STATUS_COLOR[seller.status] || 'badge-gray'} capitalize`}>{seller.status}</span>
          </div>
          <p className="text-sm text-gray-500 mt-0.5">
            {seller.ownerName} · {seller.email} · {seller.phone}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {[seller.address?.line1, seller.address?.city, seller.address?.state, seller.address?.postalCode].filter(Boolean).join(', ')}
          </p>
        </div>
      </div>

      {/* ── Performance + details ────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-5 flex flex-col gap-2">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
            <CurrencyRupeeIcon className="w-4.5 h-4.5 text-emerald-600" />
          </div>
          <p className="text-xl font-bold text-gray-900 mt-1">{formatPrice(performance?.sales || 0)}</p>
          <p className="text-xs text-gray-500">Paid Sales</p>
        </div>
        <div className="card p-5 flex flex-col gap-2">
          <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
            <ShoppingBagIcon className="w-4.5 h-4.5 text-blue-600" />
          </div>
          <p className="text-xl font-bold text-gray-900 mt-1">{performance?.orders || 0}</p>
          <p className="text-xs text-gray-500">Total Orders</p>
        </div>
        <div className="card p-5 flex flex-col gap-2">
          <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center">
            <CubeIcon className="w-4.5 h-4.5 text-purple-600" />
          </div>
          <p className="text-xl font-bold text-gray-900 mt-1">{products?.length || 0}</p>
          <p className="text-xs text-gray-500">Products Listed</p>
        </div>
      </div>

      {/* ── Products table ───────────────────────────────── */}
      <div className="card overflow-hidden">
        <div className="panel-header">
          <p className="panel-title">Products</p>
          <span className="text-xs text-gray-400">{products?.length} listed</span>
        </div>
        {!products?.length ? (
          <div className="empty-state py-12">
            <p className="text-sm text-gray-400">No products listed yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Approval</th>
                  <th>Live</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p._id}>
                    <td className="font-medium text-gray-900">{p.name}</td>
                    <td className="font-semibold text-gray-900">{formatPrice(p.price)}</td>
                    <td>
                      <span className={`font-semibold text-sm ${p.stock === 0 ? 'text-red-600' : p.stock <= 5 ? 'text-amber-600' : 'text-gray-700'}`}>
                        {p.stock}
                      </span>
                    </td>
                    <td>
                      <span className={`badge text-xs ${
                        p.approvalStatus === 'approved' ? 'badge-green'
                        : p.approvalStatus === 'rejected' ? 'badge-red'
                        : 'badge-orange'
                      }`}>
                        {p.approvalStatus || 'pending'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge text-xs ${p.isActive ? 'badge-green' : 'badge-gray'}`}>
                        {p.isActive ? 'Live' : 'Hidden'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
