import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { sellerAPI } from '../../services/api';
import { formatPrice } from '../../utils/helpers';
import {
  CurrencyRupeeIcon, ShoppingBagIcon, CubeIcon,
  ExclamationTriangleIcon, ArrowTrendingUpIcon, PlusIcon, ArrowRightIcon,
} from '@heroicons/react/24/outline';

function StatCard({ title, value, icon: Icon, lightBg, lightColor, sub }) {
  return (
    <div className="card p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: lightBg }}>
          <Icon className="w-5 h-5" style={{ color: lightColor }} />
        </div>
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900 tracking-tight">{value}</p>
        <p className="text-sm font-medium text-gray-500 mt-0.5">{title}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function PeriodCard({ label, report }) {
  return (
    <div className="card p-4 flex flex-col gap-1.5">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
      <p className="text-xl font-bold text-gray-900">{formatPrice(report?.sales || 0)}</p>
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <span>{report?.orders || 0} order{report?.orders !== 1 ? 's' : ''}</span>
        <span className="text-gray-200">·</span>
        <span>Commission {formatPrice(report?.commission || 0)}</span>
      </div>
    </div>
  );
}

function SalesChart({ data }) {
  if (!data?.length) return (
    <div className="flex items-center justify-center h-28 text-sm text-gray-400">No paid orders in this window</div>
  );
  const max = Math.max(...data.map((d) => d.sales), 1);
  return (
    <div className="flex items-end gap-1.5 h-28">
      {data.map((d) => {
        const pct = (d.sales / max) * 100;
        return (
          <div key={d._id} className="flex-1 flex flex-col items-center gap-1.5 group">
            <div
              className="relative w-full rounded-t-lg"
              style={{
                height: `${Math.max(pct, 4)}%`,
                background: pct > 60
                  ? 'linear-gradient(180deg,#287A55,#173F35)'
                  : pct > 30
                    ? 'linear-gradient(180deg,#6FB592,#3E946C)'
                    : '#CDE8D5',
              }}
              title={`${d._id}: ${formatPrice(d.sales)}`}
            >
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block z-10">
                <div className="bg-gray-900 text-white text-[10px] rounded px-1.5 py-0.5 whitespace-nowrap">
                  {formatPrice(d.sales)}
                </div>
              </div>
            </div>
            <span className="text-[10px] text-gray-400">{d._id?.slice(5)}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function SellerDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    sellerAPI.dashboard()
      .then((res) => setData(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Could not load the dashboard.'));
  }, []);

  if (error) return (
    <div className="card p-6 text-center">
      <p className="text-red-600 text-sm font-medium">{error}</p>
    </div>
  );

  if (!data) return (
    <div className="space-y-6">
      <div className="h-10 skeleton rounded-xl w-48" />
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-28 skeleton rounded-[14px]" />)}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── Page header ──────────────────────────────────── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">{data.nursery?.name}</h1>
          <p className="page-subtitle">Seller dashboard · your store at a glance</p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/seller/products/new" className="btn-primary gap-2">
            <PlusIcon className="w-4 h-4" /> Add Product
          </Link>
        </div>
      </div>

      {data.paymentSetupSatisfied === false && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Configure at least one valid payment method before publishing products. The shop can sell only after super admin approval and that payment setup.
          {' '}<Link to="/seller/profile" className="font-medium underline">Update payment methods</Link>
        </div>
      )}

      {/* ── Period summary ───────────────────────────────── */}
      {data.reports && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <PeriodCard label="Today"      report={data.reports.day}   />
          <PeriodCard label="This Week"  report={data.reports.week}  />
          <PeriodCard label="This Month" report={data.reports.month} />
        </div>
      )}

      {/* ── Stat cards ───────────────────────────────────── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Total Sales"     value={formatPrice(data.stats.sales)}
          icon={CurrencyRupeeIcon} lightBg="#F0FDF4" lightColor="#16a34a"
        />
        <StatCard
          title="Total Orders"   value={data.stats.orders}
          icon={ShoppingBagIcon}   lightBg="#EFF6FF" lightColor="#2563eb"
        />
        <StatCard
          title="Products"       value={data.stats.products}
          icon={CubeIcon}          lightBg="#F5F3FF" lightColor="#7c3aed"
        />
        <StatCard
          title="Low Stock"      value={data.stats.lowStock}
          icon={ExclamationTriangleIcon} lightBg="#FFFBEB" lightColor="#d97706"
          sub={data.stats.lowStock > 0 ? 'Needs attention' : 'All good'}
        />
      </div>

      {/* ── Chart + low stock ────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="panel-title">Revenue — Last 7 Days</p>
              <p className="text-xs text-gray-400 mt-0.5">Based on paid orders</p>
            </div>
          </div>
          <SalesChart data={data.salesChart} />
        </div>

        <div className="card overflow-hidden">
          <div className="panel-header">
            <p className="panel-title">Low Stock Alert</p>
            <Link to="/seller/products" className="text-xs text-primary-600 font-medium hover:text-primary-700 flex items-center gap-1">
              All <ArrowRightIcon className="w-3 h-3" />
            </Link>
          </div>
          {!data.lowStock?.length ? (
            <div className="empty-state py-10">
              <span className="text-2xl mb-2">🌿</span>
              <p className="text-sm text-gray-500">Inventory is healthy</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-50">
              {data.lowStock.map((item) => (
                <li key={item._id} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50/70 transition-colors">
                  <p className="text-sm font-medium text-gray-800 truncate">{item.name}</p>
                  <span className={`text-xs font-semibold ml-2 flex-shrink-0 ${item.stock === 0 ? 'text-red-500' : 'text-amber-600'}`}>
                    {item.stock === 0 ? 'Out of stock' : `${item.stock} left`}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* ── Recent orders + bestsellers ──────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">

        {/* Recent orders */}
        <div className="card overflow-hidden">
          <div className="panel-header">
            <p className="panel-title">Recent Orders</p>
            <Link to="/seller/orders" className="text-xs text-primary-600 font-medium hover:text-primary-700 flex items-center gap-1">
              All <ArrowRightIcon className="w-3 h-3" />
            </Link>
          </div>
          {!data.recentOrders?.length ? (
            <div className="empty-state py-10">
              <p className="text-sm text-gray-400">Paid orders will show here</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-50">
              {data.recentOrders.map((order) => (
                <li key={order._id} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50/70 transition-colors">
                  <div>
                    <Link to={`/seller/orders/${order._id}`} className="text-sm font-semibold text-primary-700 hover:text-primary-800 font-mono">
                      {order.orderNumber}
                    </Link>
                    <p className="text-xs text-gray-400 mt-0.5">{order.customer?.name}</p>
                  </div>
                  <span className="text-xs font-medium text-gray-500 capitalize">
                    {order.fulfillment?.fulfillmentStatus?.replace(/_/g, ' ')}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Bestsellers */}
        <div className="card overflow-hidden">
          <div className="panel-header">
            <p className="panel-title">Bestsellers</p>
          </div>
          {!data.bestsellers?.length ? (
            <div className="empty-state py-10">
              <p className="text-sm text-gray-400">Sales data will appear here</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-50">
              {data.bestsellers.map((product, i) => (
                <li key={product._id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50/70 transition-colors">
                  <span
                    className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold"
                    style={{
                      background: i === 0 ? '#FEF3C7' : i === 1 ? '#F3F4F6' : '#F9FAF8',
                      color: i === 0 ? '#D97706' : '#6B7280',
                    }}
                  >
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{product.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{product.soldCount} sold · {product.stock} in stock</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

    </div>
  );
}
