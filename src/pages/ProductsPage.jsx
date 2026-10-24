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
    sellerType: getParam('sellerType'),
    deliveryMethod: getParam('deliveryMethod'),
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
    filters.sellerType, filters.deliveryMethod,
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
            className="input min-w-0 flex-1 py-2 text-sm" min="0" />
          <span className="shrink-0 text-gray-400">–</span>
          <input type="number" placeholder="Max" value={filters.maxPrice}
            onChange={(e) => setFilter('maxPrice', e.target.value)}
            className="input min-w-0 flex-1 py-2 text-sm" min="0" />
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
        <h4 className="font-semibold text-gray-800 mb-3 text-sm">Seller</h4>
        <div className="flex flex-wrap gap-2">
          {[['nursery', 'Nursery'], ['community', 'Community'], ['home_gardener', 'Home gardener'], ['plant_enthusiast', 'Enthusiast'], ['small_grower', 'Small grower']].map(([value, label]) => (
            <button key={value} type="button" onClick={() => setFilter('sellerType', filters.sellerType === value ? '' : value)}
              className={`px-3 py-1 rounded-full text-xs font-medium border ${filters.sellerType === value ? 'bg-primary-500 text-white border-primary-500' : 'border-gray-200 text-gray-600'}`}>
              {label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <h4 className="font-semibold text-gray-800 mb-3 text-sm">Delivery method</h4>
        <div className="flex flex-wrap gap-2">
          {[['pickup', 'Pickup'], ['local_delivery', 'Local'], ['courier', 'Courier']].map(([value, label]) => (
            <button key={value} type="button" onClick={() => setFilter('deliveryMethod', filters.deliveryMethod === value ? '' : value)}
              className={`px-3 py-1 rounded-full text-xs font-medium border ${filters.deliveryMethod === value ? 'bg-primary-500 text-white border-primary-500' : 'border-gray-200 text-gray-600'}`}>
              {label}
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
    <div className="container-custom py-6 sm:py-8">
      <div className="grid items-start gap-6 lg:grid-cols-[16rem_minmax(0,1fr)]">
        {/* Desktop Filters — same top edge as the heading */}
        <aside className="hidden lg:block">
          <div className="sticky top-[7rem] rounded-2xl bg-white p-5 shadow-card">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Filters</h3>
              {activeFilterCount > 0 && (
                <button onClick={clearAll} className="text-xs text-red-500 hover:text-red-600">Clear all</button>
              )}
            </div>
            <FilterPanel />
          </div>
        </aside>

        <div className="min-w-0">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <h1 className="text-3xl leading-tight text-gray-900 sm:text-4xl">
                {filters.search ? `Results for "${filters.search}"` : filters.category
                  ? categories.find((c) => c.slug === filters.category)?.name || 'Products'
                  : 'All Products'}
              </h1>
              {!loading && <p className="mt-1 text-sm text-gray-500">{pagination.total} products found</p>}
            </div>
            <div className="flex w-full items-center gap-2 sm:w-auto sm:gap-3">
              <label htmlFor="product-sort" className="sr-only">Sort products</label>
              <select id="product-sort" value={filters.sort} onChange={(e) => setFilter('sort', e.target.value)}
                className="input min-w-0 flex-1 py-2 text-sm sm:w-52 sm:flex-none">
                {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <button type="button" onClick={() => setFiltersOpen(true)}
                className="btn-outline shrink-0 py-2 text-sm lg:hidden">
                <AdjustmentsHorizontalIcon className="h-4 w-4" />
                Filters {activeFilterCount > 0 && <span className="badge bg-primary-500 text-white">{activeFilterCount}</span>}
              </button>
            </div>
          </div>

          {filtersOpen && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div className="absolute inset-0 bg-black/50" onClick={() => setFiltersOpen(false)} />
              <div className="absolute right-0 top-0 h-full w-full max-w-sm overflow-y-auto bg-white p-5 shadow-2xl">
                <div className="mb-5 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Filters</h3>
                  <button onClick={() => setFiltersOpen(false)}><XMarkIcon className="w-5 h-5 text-gray-500" /></button>
                </div>
                <FilterPanel />
              </div>
            </div>
          )}

          {loading ? (
            <PageSpinner />
          ) : products.length === 0 ? (
            <div className="py-20 text-center">
              <div className="mb-4 text-5xl">🪴</div>
              <h3 className="mb-2 text-lg font-semibold text-gray-700">No products found</h3>
              <p className="mb-4 text-sm text-gray-500">Try adjusting your filters or search term.</p>
              <button onClick={clearAll} className="btn-primary py-2 text-sm">Clear Filters</button>
            </div>
          ) : (
            <>
              <div className="catalog-grid">
                {products.map((p) => <ProductCard key={p._id} product={p} />)}
              </div>
              <div className="mt-8">
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
