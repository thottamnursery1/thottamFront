import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productAdminAPI } from '../../services/api';
import toast from 'react-hot-toast';
import {
  CubeIcon, CheckCircleIcon, ExclamationTriangleIcon, XCircleIcon,
  ArrowDownTrayIcon, ArrowUpTrayIcon, PlusIcon,
} from '@heroicons/react/24/outline';

function StatCard({ title, value, icon: Icon, lightBg, lightColor, note }) {
  return (
    <div className="card p-5 flex flex-col gap-3">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: lightBg }}>
        <Icon className="w-5 h-5" style={{ color: lightColor }} />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900 tracking-tight">{value}</p>
        <p className="text-sm font-medium text-gray-500 mt-0.5">{title}</p>
        {note && <p className="text-xs mt-1" style={{ color: lightColor }}>{note}</p>}
      </div>
    </div>
  );
}

export default function ProductAdminHome() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [importing, setImporting] = useState('');
  const [importLoading, setImportLoading] = useState(false);

  useEffect(() => {
    productAdminAPI.stats()
      .then((res) => setData(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Could not load product admin.'));
  }, []);

  const handleExport = async () => {
    try {
      const res = await productAdminAPI.exportProducts();
      const url = URL.createObjectURL(res.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'thottam-products.csv';
      link.click();
      URL.revokeObjectURL(url);
      toast.success('Products exported.');
    } catch {
      /* error toast handled by interceptor */
    }
  };

  const handleImport = async () => {
    let products;
    try { products = JSON.parse(importing); } catch {
      toast.error('Invalid JSON — paste a valid array of product objects.');
      return;
    }
    if (!Array.isArray(products) || products.length === 0) {
      toast.error('JSON must be a non-empty array.');
      return;
    }
    setImportLoading(true);
    try {
      const res = await productAdminAPI.importProducts(products);
      toast.success(`${res.data.imported} products submitted for approval.`);
      setImporting('');
    } finally {
      setImportLoading(false);
    }
  };

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
          <h1 className="page-title">{data.shop?.name}</h1>
          <p className="page-subtitle">Product administration · inventory overview</p>
        </div>
        <Link to="/product-admin/products/new" className="btn-primary gap-2">
          <PlusIcon className="w-4 h-4" /> Add Product
        </Link>
      </div>

      {/* ── Stat cards ───────────────────────────────────── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Total Products"   value={data.stats.total}
          icon={CubeIcon}           lightBg="#F5F3FF" lightColor="#7c3aed"
        />
        <StatCard
          title="Active"           value={data.stats.active}
          icon={CheckCircleIcon}    lightBg="#F0FDF4" lightColor="#16a34a"
        />
        <StatCard
          title="Low Stock"        value={data.stats.lowStock}
          icon={ExclamationTriangleIcon} lightBg="#FFFBEB" lightColor="#d97706"
          note={data.stats.lowStock > 0 ? 'Needs restocking' : undefined}
        />
        <StatCard
          title="Out of Stock"     value={data.stats.outOfStock}
          icon={XCircleIcon}        lightBg="#FFF1F2" lightColor="#e11d48"
          note={data.stats.outOfStock > 0 ? 'Unavailable to buyers' : undefined}
        />
      </div>

      {/* ── Quick actions ────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">

        {/* Export */}
        <div className="card p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
              <ArrowDownTrayIcon className="w-4.5 h-4.5 text-primary-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Export Products</p>
              <p className="text-xs text-gray-400 mt-0.5">Download all products as a CSV file</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleExport}
            className="btn-outline gap-2 w-full sm:w-auto"
          >
            <ArrowDownTrayIcon className="w-4 h-4" /> Export CSV
          </button>
        </div>

        {/* Import */}
        <div className="card p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
              <ArrowUpTrayIcon className="w-4.5 h-4.5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Import Products</p>
              <p className="text-xs text-gray-400 mt-0.5">Paste a JSON array of product objects</p>
            </div>
          </div>
          <div className="space-y-2">
            <textarea
              className="input text-xs font-mono min-h-[100px] resize-y"
              value={importing}
              onChange={(e) => setImporting(e.target.value)}
              placeholder={`[{"name":"Fern","description":"A shade fern.","category":"indoor-plants","price":299,"stock":8}]`}
            />
            <button
              type="button"
              onClick={handleImport}
              disabled={importLoading || !importing.trim()}
              className="btn-primary gap-2 w-full sm:w-auto"
            >
              <ArrowUpTrayIcon className="w-4 h-4" />
              {importLoading ? 'Importing…' : 'Import Products'}
            </button>
          </div>
        </div>
      </div>

      {/* ── Quick nav ────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Link
          to="/product-admin/products"
          className="card p-4 flex items-center gap-3 hover:shadow-card-hover transition-shadow group"
        >
          <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0">
            <CubeIcon className="w-4.5 h-4.5 text-primary-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900">Manage Products</p>
            <p className="text-xs text-gray-400 mt-0.5">Edit, update stock, toggle visibility</p>
          </div>
          <span className="text-gray-300 group-hover:text-primary-500 transition-colors text-lg">→</span>
        </Link>
        <Link
          to="/product-admin/products/new"
          className="card p-4 flex items-center gap-3 hover:shadow-card-hover transition-shadow group"
        >
          <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
            <PlusIcon className="w-4.5 h-4.5 text-primary-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900">Add New Product</p>
            <p className="text-xs text-gray-400 mt-0.5">Create and submit for approval</p>
          </div>
          <span className="text-gray-300 group-hover:text-primary-500 transition-colors text-lg">→</span>
        </Link>
      </div>

    </div>
  );
}
