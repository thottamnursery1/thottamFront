import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import { formatPrice, formatDate, getOrderStatusColor, orderStatusLabel } from '../../utils/helpers';
import { PageSpinner } from '../../components/Spinner';
import {
  ShoppingBagIcon, CurrencyRupeeIcon, UsersIcon,
  ExclamationTriangleIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon,
  ArrowRightIcon, EllipsisHorizontalIcon,
} from '@heroicons/react/24/outline';

/* ─── Stat Card ──────────────────────────────────────────────── */
function StatCard({ title, value, sub, icon: Icon, trend, accent = '#173F35', lightBg = '#F3F8F5', lightColor = '#173F35' }) {
  const isUp = Number(trend) >= 0;
  return (
    <div className="card p-5 flex flex-col gap-4 animate-fade-in-up">
      <div className="flex items-start justify-between">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: lightBg }}
        >
          <Icon className="w-5 h-5" style={{ color: lightColor }} />
        </div>
        {trend !== undefined && (
          <span
            className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{
              background: isUp ? 'rgba(16,185,129,0.10)' : 'rgba(239,68,68,0.10)',
              color: isUp ? '#059669' : '#dc2626',
            }}
          >
            {isUp ? <ArrowTrendingUpIcon className="w-3 h-3" /> : <ArrowTrendingDownIcon className="w-3 h-3" />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900 tracking-tight">{value}</p>
        <p className="text-sm font-medium text-gray-500 mt-0.5">{title}</p>
        {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
      </div>
    </div>
  );
}

/* ─── Mini bar chart ─────────────────────────────────────────── */
function SalesChart({ data }) {
  if (!data?.length) return null;
  const max = Math.max(...data.map((d) => d.sales), 1);
  return (
    <div className="flex items-end gap-1.5 h-28">
      {data.map((d) => {
        const pct = (d.sales / max) * 100;
        return (
          <div key={d._id} className="flex-1 flex flex-col items-center gap-1.5 group">
            <div
              className="relative w-full rounded-t-lg transition-all duration-300"
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
              {/* tooltip on hover */}
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

/* ─── Page ───────────────────────────────────────────────────── */
export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getDashboard().then((r) => setData(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <PageSpinner />;

  const { stats, lowStockProducts, recentOrders, salesChart } = data;

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── Page header ──────────────────────────────────── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Platform overview · live data</p>
        </div>
        <Link to="/admin/orders" className="btn-primary gap-2">
          <ShoppingBagIcon className="w-4 h-4" /> View Orders
        </Link>
      </div>

      {/* ── Stat cards ───────────────────────────────────── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Total Revenue"
          value={formatPrice(stats.totalRevenue)}
          sub={`${formatPrice(stats.monthRevenue)} this month`}
          icon={CurrencyRupeeIcon}
          lightBg="#F0FDF4" lightColor="#16a34a"
        />
        <StatCard
          title="Total Orders"
          value={stats.totalOrders.toLocaleString()}
          sub={`${stats.monthOrders} this month`}
          icon={ShoppingBagIcon}
          trend={stats.orderGrowth}
          lightBg="#EFF6FF" lightColor="#2563eb"
        />
        <StatCard
          title="Pending Orders"
          value={stats.pendingOrders}
          sub="Awaiting processing"
          icon={ExclamationTriangleIcon}
          lightBg="#FFFBEB" lightColor="#d97706"
        />
        <StatCard
          title="Customers"
          value={stats.totalCustomers.toLocaleString()}
          icon={UsersIcon}
          lightBg="#F5F3FF" lightColor="#7c3aed"
        />
      </div>

      {/* ── Sales chart + low stock side-by-side ─────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

        {/* Sales chart */}
        <div className="xl:col-span-2 card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="panel-title">Revenue — Last 7 Days</p>
              <p className="text-xs text-gray-400 mt-0.5">Based on paid orders</p>
            </div>
          </div>
          {salesChart?.length > 0
            ? <SalesChart data={salesChart} />
            : <div className="flex items-center justify-center h-28 text-sm text-gray-400">No sales data yet</div>
          }
        </div>

        {/* Low stock */}
        <div className="card overflow-hidden">
          <div className="panel-header">
            <p className="panel-title">Low Stock</p>
            <Link
              to="/admin/inventory?lowStock=true"
              className="text-xs text-primary-600 font-medium hover:text-primary-700 flex items-center gap-1"
            >
              All <ArrowRightIcon className="w-3 h-3" />
            </Link>
          </div>
          {!lowStockProducts?.length ? (
            <div className="empty-state py-10">
              <span className="text-2xl mb-2">🎉</span>
              <p className="text-sm text-gray-500">All stock levels OK</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-50">
              {lowStockProducts.map((p) => (
                <li key={p._id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50/70 transition-colors">
                  <img
                    src={p.images?.[0]?.url || 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=40'}
                    alt={p.name}
                    className="w-9 h-9 object-cover rounded-lg flex-shrink-0"
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=40'; }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{p.name}</p>
                    <p className={`text-xs font-semibold mt-0.5 ${p.stock === 0 ? 'text-red-500' : 'text-amber-600'}`}>
                      {p.stock === 0 ? 'Out of stock' : `${p.stock} remaining`}
                    </p>
                  </div>
                  <Link
                    to={`/admin/products/${p._id}/edit`}
                    className="text-xs text-primary-600 font-medium hover:text-primary-700 flex-shrink-0"
                  >
                    Edit
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* ── Recent orders table ───────────────────────────── */}
      <div className="card overflow-hidden">
        <div className="panel-header">
          <p className="panel-title">Recent Orders</p>
          <Link
            to="/admin/orders"
            className="text-xs text-primary-600 font-medium hover:text-primary-700 flex items-center gap-1"
          >
            View all <ArrowRightIcon className="w-3 h-3" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {recentOrders?.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-gray-400 text-sm">No orders yet</td>
                </tr>
              )}
              {recentOrders?.map((o) => (
                <tr key={o._id}>
                  <td>
                    <span className="font-semibold text-gray-900 text-xs font-mono">{o.orderNumber}</span>
                  </td>
                  <td>
                    <p className="font-medium text-gray-800">{o.user?.name || '—'}</p>
                    <p className="text-xs text-gray-400">{o.user?.email}</p>
                  </td>
                  <td className="font-semibold text-gray-900">{formatPrice(o.pricing?.totalAmount)}</td>
                  <td><span className={getOrderStatusColor(o.orderStatus)}>{orderStatusLabel(o.orderStatus)}</span></td>
                  <td className="text-xs text-gray-400 whitespace-nowrap">{formatDate(o.createdAt)}</td>
                  <td>
                    <Link
                      to={`/admin/orders/${o._id}`}
                      className="text-xs text-primary-600 font-medium hover:text-primary-700"
                    >
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
