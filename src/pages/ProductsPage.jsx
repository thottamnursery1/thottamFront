import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productAPI, categoryAPI } from '../services/api';
import ProductCard from '../components/ProductCard';
import Pagination from '../components/Pagination';
import { PageSpinner } from '../components/Spinner';
import { AdjustmentsHorizontalIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { debounce } from '../utils/helpers';

  const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'newest', label: 'Newest' },
  { value: 'popularity', label: 'Popularity' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
];

const SUNLIGHT = ['Full Sun', 'Partial Sun', 'Indirect Light', 'Shade'];
const CARE = ['Easy', 'Moderate', 'Expert'];
const PLACE = ['Indoor', 'Outdoor', 'Both'];

export default function ProductsPage() {
  const [params, setParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const getParam = (key, def = '') => params.get(key) || def;

  const filters = {
    search: getParam('search'),
    category: getParam('category'),
    minPrice: getParam('minPrice'),
    maxPrice: getParam('maxPrice'),
    sunlight: getParam('sunlight'),
    careLevel: getParam('careLevel'),
    indoorOutdoor: getParam('indoorOutdoor'),
    nursery: getParam('nursery'),
    availability: getParam('availability'),
    deliveryPin: getParam('deliveryPin'),
    beginner: getParam('beginner'),
    plantType: getParam('plantType'),
    sort: getParam('sort', 'newest'),
    page: Number(getParam('page', '1')),
    isFeatured: getParam('isFeatured'),
    isBestSeller: getParam('isBestSeller'),
    isNewArrival: getParam('isNewArrival'),
    isOnSale: getParam('isOnSale'),
  };

  const setFilter = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value); else next.delete(key);
    next.set('page', '1');
    setParams(next);
  };

  const clearAll = () => setParams(new URLSearchParams());

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const query = {};
      Object.entries(filters).forEach(([k, v]) => { if (v) query[k] = v; });
      const res = await productAPI.getAll({ ...query, limit: 12 });
      setProducts(res.data.products);
      setPagination(res.data.pagination);
    } finally {
      setLoading(false);
    }
  }, [params.toString()]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);
  useEffect(() => { categoryAPI.getAll().then((r) => setCategories(r.data.categories || [])); }, []);

  const activeFilterCount = [
    filters.category, filters.minPrice, filters.maxPrice,
    filters.sunlight, filters.careLevel, filters.indoorOutdoor,
    filters.nursery, filters.availability, filters.deliveryPin, filters.beginner, filters.plantType,
  ].filter(Boolean).length;

  const FilterPanel = () => (
    <div className="space-y-6">
      {/* Category */}
      <div>
        <h4 className="font-semibold text-gray-800 mb-3 text-sm">Category</h4>
        <div className="space-y-2">
          {categories.map((cat) => (
            <label key={cat._id} className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="category" value={cat.slug}
                checked={filters.category === cat.slug}
                onChange={() => setFilter('category', cat.slug)}
                className="text-primary-500 focus:ring-primary-400" />
              <span className="text-sm text-gray-600">{cat.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h4 className="font-semibold text-gray-800 mb-3 text-sm">Price Range</h4>
        <div className="flex items-center gap-2">
          <input type="number" placeholder="Min" value={filters.minPrice}
            onChange={(e) => setFilter('minPrice', e.target.value)}
            className="input py-2 text-sm w-24" min="0" />
          <span className="text-gray-400">–</span>
          <input type="number" placeholder="Max" value={filters.maxPrice}
            onChange={(e) => setFilter('maxPrice', e.target.value)}
            className="input py-2 text-sm w-24" min="0" />
        </div>
      </div>

      {/* Sunlight */}
      <div>
        <h4 className="font-semibold text-gray-800 mb-3 text-sm">Sunlight</h4>
        {SUNLIGHT.map((s) => (
          <label key={s} className="flex items-center gap-2 cursor-pointer mb-2">
            <input type="radio" name="sunlight" value={s}
              checked={filters.sunlight === s}
              onChange={() => setFilter('sunlight', s)}
              className="text-primary-500" />
            <span className="text-sm text-gray-600">{s}</span>
          </label>
        ))}
      </div>

      {/* Care Level */}
      <div>
        <h4 className="font-semibold text-gray-800 mb-3 text-sm">Care Level</h4>
        <div className="flex flex-wrap gap-2">
          {CARE.map((c) => (
            <button key={c} onClick={() => setFilter('careLevel', filters.careLevel === c ? '' : c)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                filters.careLevel === c ? 'bg-primary-500 text-white border-primary-500' : 'border-gray-200 text-gray-600 hover:border-primary-300'
              }`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Indoor/Outdoor */}
      <div>
        <h4 className="font-semibold text-gray-800 mb-3 text-sm">Placement</h4>
        <div className="flex flex-wrap gap-2">
          {PLACE.map((p) => (
            <button key={p} onClick={() => setFilter('indoorOutdoor', filters.indoorOutdoor === p ? '' : p)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                filters.indoorOutdoor === p ? 'bg-primary-500 text-white border-primary-500' : 'border-gray-200 text-gray-600 hover:border-primary-300'
              }`}>
              {p}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="font-semibold text-gray-800 mb-3 text-sm">Availability</h4>
        <div className="flex flex-wrap gap-2">
          {[['in', 'In stock'], ['out', 'Unavailable']].map(([value, label]) => (
            <button key={value} type="button" onClick={() => setFilter('availability', filters.availability === value ? '' : value)}
              className={`px-3 py-1 rounded-full text-xs font-medium border ${filters.availability === value ? 'bg-primary-500 text-white border-primary-500' : 'border-gray-200 text-gray-600'}`}>
              {label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <h4 className="font-semibold text-gray-800 mb-3 text-sm">Delivery PIN</h4>
        <input className="input py-2 text-sm" inputMode="numeric" placeholder="560001" value={filters.deliveryPin}
          onChange={(e) => setFilter('deliveryPin', e.target.value.replace(/\D/g, '').slice(0, 6))} />
      </div>
      <button type="button" onClick={() => setFilter('beginner', filters.beginner === 'true' ? '' : 'true')}
        className={`px-3 py-1 rounded-full text-xs font-medium border ${filters.beginner === 'true' ? 'bg-primary-500 text-white border-primary-500' : 'border-gray-200 text-gray-600'}`}>
        Beginner friendly
      </button>

      {activeFilterCount > 0 && (
        <button onClick={clearAll} className="text-sm text-red-500 hover:text-red-600 font-medium flex items-center gap-1">
          <XMarkIcon className="w-4 h-4" /> Clear all filters
        </button>
      )}
    </div>
  );

  return (
    <div className="container-custom py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-semibold text-gray-900">
            {filters.search ? `Results for "${filters.search}"` : filters.category
              ? categories.find((c) => c.slug === filters.category)?.name || 'Products'
              : 'All Products'}
          </h1>
          {!loading && <p className="text-sm text-gray-500 mt-1">{pagination.total} products found</p>}
        </div>
        <div className="flex items-center gap-3">
          {/* Sort */}
          <select value={filters.sort} onChange={(e) => setFilter('sort', e.target.value)}
            className="input py-2 text-sm w-auto">
            {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          {/* Mobile filter toggle */}
          <button onClick={() => setFiltersOpen(true)}
            className="lg:hidden flex items-center gap-2 btn-outline py-2 text-sm">
            <AdjustmentsHorizontalIcon className="w-4 h-4" />
            Filters {activeFilterCount > 0 && <span className="badge bg-primary-500 text-white">{activeFilterCount}</span>}
          </button>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Desktop Filters */}
        <aside className="hidden lg:block w-56 flex-shrink-0">
          <div className="bg-white rounded-2xl shadow-card p-5 sticky top-24">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-gray-900">Filters</h3>
              {activeFilterCount > 0 && (
                <button onClick={clearAll} className="text-xs text-red-500 hover:text-red-600">Clear all</button>
              )}
            </div>
            <FilterPanel />
          </div>
        </aside>

        {/* Mobile Filters Drawer */}
        {filtersOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/50" onClick={() => setFiltersOpen(false)} />
            <div className="absolute right-0 top-0 h-full w-72 bg-white shadow-2xl overflow-y-auto p-5">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-semibold text-gray-900">Filters</h3>
                <button onClick={() => setFiltersOpen(false)}><XMarkIcon className="w-5 h-5 text-gray-500" /></button>
              </div>
              <FilterPanel />
            </div>
          </div>
        )}

        {/* Products grid */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <PageSpinner />
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">🪴</div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No products found</h3>
              <p className="text-gray-500 text-sm mb-4">Try adjusting your filters or search term.</p>
              <button onClick={clearAll} className="btn-primary text-sm py-2">Clear Filters</button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                {products.map((p) => <ProductCard key={p._id} product={p} />)}
              </div>
              <div className="mt-10">
                <Pagination page={pagination.page} pages={pagination.pages}
                  onPageChange={(p) => setFilter('page', String(p))} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
