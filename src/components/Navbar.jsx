import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  MagnifyingGlassIcon, HeartIcon, ShoppingBagIcon, UserIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';
import Logo from './Logo';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { nurseryAPI } from '../services/api';
import { isProductManagerRole } from '../utils/helpers';

export default function Navbar({ onToggleSidebar, sidebarCollapsed = false }) {
  const { isAuthenticated, user, nursery, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [announcement, setAnnouncement] = useState('Free delivery on orders above ₹999.');
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    nurseryAPI.publicSettings().then((res) => {
      if (res.data.settings?.announcement) setAnnouncement(res.data.settings.announcement);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    setPulse(true);
    const timer = setTimeout(() => setPulse(false), 350);
    return () => clearTimeout(timer);
  }, [itemCount]);

  const submitSearch = (event) => {
    event.preventDefault();
    if (!search.trim()) return;
    navigate(`/products?search=${encodeURIComponent(search.trim())}&sort=relevance`);
    setSearch('');
    setSearchOpen(false);
  };

  const initial = (user?.name || user?.email || '').trim().charAt(0).toUpperCase();
  const accountTo = !isAuthenticated
    ? '/login'
    : user?.role === 'admin' || user?.role === 'super_admin'
      ? '/admin'
      : isProductManagerRole(user?.role)
        ? (nursery?.status === 'approved' ? '/product-admin' : '/seller/pending')
        : user?.role === 'seller' || user?.role === 'shop_admin'
          ? (nursery?.status === 'approved' ? '/seller' : '/seller/pending')
          : '/account';

  return (
    <header className="sticky top-0 z-40">
      <div className="bg-primary-700 px-4 py-2 text-center text-xs text-mint sm:text-sm">
        {announcement}
      </div>
      <div className="glass border-b border-white/50">
        <div className="flex h-[72px] items-center gap-3 px-4 sm:px-6">
          <button
            type="button"
            className={`rounded-lg px-2 py-1 text-sm font-medium text-primary-800 ${sidebarCollapsed ? '' : 'lg:hidden'}`}
            aria-label="Open menu"
            onClick={onToggleSidebar}
          >
            Menu
          </button>
          <Link to="/" className={`flex-shrink-0 ${sidebarCollapsed ? '' : 'lg:hidden'}`} aria-label="Thottam home">
            <Logo />
          </Link>
          <form onSubmit={submitSearch} className="relative ml-auto hidden max-w-md flex-1 md:flex">
            <label htmlFor="nav-search" className="sr-only">Search plants</label>
            <input id="nav-search" value={search} onChange={(e) => setSearch(e.target.value)} className="input py-2 pr-10" placeholder="Search plants, nurseries, pots" />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted" aria-label="Search">
              <MagnifyingGlassIcon className="h-5 w-5" />
            </button>
          </form>
          <div className="ml-auto flex items-center gap-1 md:ml-2">
            <button
              type="button"
              className="rounded-lg p-2 text-ink/80 hover:bg-primary-50 md:hidden"
              aria-label="Search"
              aria-expanded={searchOpen}
              onClick={() => setSearchOpen((open) => !open)}
            >
              <MagnifyingGlassIcon className="h-6 w-6" />
            </button>
            <Link to="/wishlist" className="rounded-lg p-2 hover:bg-primary-50" aria-label="Wishlist"><HeartIcon className="h-6 w-6" /></Link>
            <Link to="/cart" className="relative rounded-lg p-2 hover:bg-primary-50" aria-label={`Cart, ${itemCount} items`}>
              <ShoppingBagIcon className="h-6 w-6" />
              {itemCount > 0 && (
                <span className={`absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-terracotta-500 px-1 text-[10px] font-bold text-white transition-transform ${pulse ? 'scale-110' : ''}`}>
                  {itemCount}
                </span>
              )}
            </Link>
            <Link to={accountTo} className="rounded-lg p-2 hover:bg-primary-50" aria-label={isAuthenticated ? `Account, ${user?.name || 'signed in'}` : 'Account'}>
              {isAuthenticated && initial ? (
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-700 text-xs font-semibold text-white">{initial}</span>
              ) : (
                <UserIcon className="h-6 w-6" />
              )}
            </Link>
            {isAuthenticated && (
              <button
                type="button"
                className="rounded-lg p-2 text-ink/70 hover:bg-red-50 hover:text-red-600"
                aria-label="Sign out"
                onClick={() => { logout(); navigate('/'); }}
              >
                <ArrowRightOnRectangleIcon className="h-6 w-6" />
              </button>
            )}
          </div>
        </div>
        {searchOpen && (
          <form onSubmit={submitSearch} className="border-t border-line px-4 py-3 md:hidden">
            <label htmlFor="nav-search-mobile" className="sr-only">Search plants</label>
            <input id="nav-search-mobile" value={search} onChange={(e) => setSearch(e.target.value)} className="input" placeholder="Search plants, nurseries, pots" />
          </form>
        )}
      </div>
    </header>
  );
}
