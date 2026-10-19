import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  MagnifyingGlassIcon, HeartIcon, ShoppingBagIcon, UserIcon, Bars3Icon, XMarkIcon,
  ClipboardDocumentListIcon, Cog6ToothIcon, ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';
import Logo from './Logo';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { nurseryAPI } from '../services/api';

const LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Shop', to: '/products' },
  { label: 'Indoor', to: '/products?category=indoor-plants' },
  { label: 'Outdoor', to: '/products?category=outdoor-plants' },
  { label: 'Flowering', to: '/products?category=flowering-plants' },
  { label: 'Succulents', to: '/products?category=succulents' },
  { label: 'Herbs', to: '/products?category=herbs' },
  { label: 'Trees', to: '/products?category=trees' },
  { label: 'Pots', to: '/products?category=pots-planters' },
  { label: 'Plant Care', to: '/plant-care' },
];

export default function Navbar() {
  const { isAuthenticated, user, nursery, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [accountMenu, setAccountMenu] = useState(false);
  const [search, setSearch] = useState('');
  const accountRef = useRef(null);
  const [announcement, setAnnouncement] = useState('Free delivery on orders above ₹999.');
  const [pulse, setPulse] = useState(false);

  useEffect(() => { setOpen(false); }, [location.pathname, location.search]);
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
  // Close account dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (accountRef.current && !accountRef.current.contains(e.target)) {
        setAccountMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const submitSearch = (event) => {
    event.preventDefault();
    if (!search.trim()) return;
    navigate(`/products?search=${encodeURIComponent(search.trim())}&sort=relevance`);
    setSearch('');
    setOpen(false);
  };

  const initial = (user?.name || user?.email || '').trim().charAt(0).toUpperCase();

  const accountTo = !isAuthenticated
    ? '/login'
    : user?.role === 'admin' || user?.role === 'super_admin'
      ? '/admin'
      : user?.role === 'shop_assistant'
        ? (nursery?.status === 'approved' ? '/product-admin' : '/seller/pending')
        : user?.role === 'seller' || user?.role === 'shop_admin'
          ? (nursery?.status === 'approved' ? '/seller' : '/seller/pending')
          : '/account';

  return (
    <header className="sticky top-0 z-40">
      <div className="bg-primary-700 text-mint text-center text-xs sm:text-sm py-2 px-4">
        {announcement}
      </div>
      <div className="glass border-b border-white/50">
      <div className="container-custom">
        <div className="flex items-center gap-3 h-[72px]">
          <button className="xl:hidden p-2 -ml-2" aria-label="Open menu" onClick={() => setOpen(true)}>
            <Bars3Icon className="w-6 h-6" />
          </button>
            <Link to="/" className="flex-shrink-0" aria-label="Thottam home">
            <Logo />
          </Link>
          <nav className="hidden xl:flex items-center gap-4 ml-4" aria-label="Primary">
            {LINKS.slice(1, 7).map((link) => (
              <Link key={link.label} to={link.to} className="text-sm font-medium text-ink/80 hover:text-primary-700">
                {link.label}
              </Link>
            ))}
          </nav>
          <form onSubmit={submitSearch} className="hidden md:flex flex-1 max-w-md ml-auto relative">
            <label htmlFor="nav-search" className="sr-only">Search plants</label>
            <input id="nav-search" value={search} onChange={(e) => setSearch(e.target.value)} className="input py-2 pr-10" placeholder="Search plants, nurseries, pots" />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted" aria-label="Search">
              <MagnifyingGlassIcon className="w-5 h-5" />
            </button>
          </form>
          <div className="flex items-center gap-1 ml-auto md:ml-2">
            <Link to="/wishlist" className="p-2" aria-label="Wishlist"><HeartIcon className="w-6 h-6" /></Link>
            <Link to="/cart" className="p-2 relative" aria-label={`Cart, ${itemCount} items`}>
              <ShoppingBagIcon className="w-6 h-6" />
              {itemCount > 0 && (
                <span className={`absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-terracotta-500 text-white text-[10px] font-bold flex items-center justify-center ${pulse ? 'scale-110' : ''} transition-transform`}>
                  {itemCount}
                </span>
              )}
            </Link>
            {isAuthenticated && user?.role === 'customer' ? (
              <div className="relative" ref={accountRef}>
                <button
                  onClick={() => setAccountMenu((v) => !v)}
                  className="p-2 flex items-center"
                  aria-label={`Account menu for ${user?.name || 'signed in user'}`}
                  aria-expanded={accountMenu}
                  aria-haspopup="true"
                >
                  <span className="w-7 h-7 rounded-full bg-primary-700 text-white text-xs font-semibold flex items-center justify-center">
                    {initial}
                  </span>
                </button>
                {accountMenu && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 z-50" role="menu">
                    <div className="px-4 py-2 border-b border-gray-100 mb-1">
                      <p className="text-xs font-semibold text-gray-800 truncate">{user?.name}</p>
                      <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                    </div>
                    <Link to="/orders" onClick={() => setAccountMenu(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      role="menuitem">
                      <ClipboardDocumentListIcon className="w-4 h-4 text-gray-400" />
                      My Orders
                    </Link>
                    <Link to="/account" onClick={() => setAccountMenu(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      role="menuitem">
                      <Cog6ToothIcon className="w-4 h-4 text-gray-400" />
                      My Account
                    </Link>
                    <button
                      onClick={() => { setAccountMenu(false); logout(); navigate('/'); }}
                      className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors border-t border-gray-100 mt-1"
                      role="menuitem">
                      <ArrowRightOnRectangleIcon className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to={accountTo} className="p-2" aria-label={isAuthenticated ? `Account, ${user?.name || 'signed in'}` : 'Account'}>
                {isAuthenticated && initial ? (
                  <span className="w-7 h-7 rounded-full bg-primary-700 text-white text-xs font-semibold flex items-center justify-center">{initial}</span>
                ) : (
                  <UserIcon className="w-6 h-6" />
                )}
              </Link>
            )}
          </div>
        </div>
      </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 xl:hidden">
          <button className="absolute inset-0 bg-ink/40" aria-label="Close menu" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-[min(100%,320px)] glass-panel p-5 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <Logo />
              <button onClick={() => setOpen(false)} aria-label="Close"><XMarkIcon className="w-6 h-6" /></button>
            </div>
            <form onSubmit={submitSearch} className="mb-6">
              <input value={search} onChange={(e) => setSearch(e.target.value)} className="input" placeholder="Search plants" aria-label="Search plants" />
            </form>
            <nav className="flex flex-col gap-1" aria-label="Mobile">
              {LINKS.map((link) => (
                <Link key={link.label} to={link.to} className="px-2 py-3 text-base border-b border-line">{link.label}</Link>
              ))}
              <Link to="/nurseries" className="px-2 py-3 text-base border-b border-line">Nurseries</Link>
              {(!isAuthenticated || user?.role === 'customer') && (
                <Link to="/sell" className="px-2 py-3 text-base">Sell on Root & Bloom</Link>
              )}
            </nav>
            {isAuthenticated && (
              <div className="mt-6 border-t border-line pt-4 space-y-1">
                <div className="flex items-center gap-3 px-2 py-2 mb-2">
                  <span className="w-8 h-8 rounded-full bg-primary-700 text-white text-sm font-semibold flex items-center justify-center flex-shrink-0">{initial}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{user?.name}</p>
                    <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                  </div>
                </div>
                {user?.role === 'customer' && (
                  <Link to="/orders" className="flex items-center gap-2.5 px-2 py-3 text-sm border-b border-line">
                    <ClipboardDocumentListIcon className="w-4 h-4 text-gray-400" /> My Orders
                  </Link>
                )}
                <Link to={accountTo} className="flex items-center gap-2.5 px-2 py-3 text-sm border-b border-line">
                  <Cog6ToothIcon className="w-4 h-4 text-gray-400" /> My Account
                </Link>
                <button onClick={() => { logout(); navigate('/'); }}
                  className="flex items-center gap-2.5 w-full px-2 py-3 text-sm text-red-500">
                  <ArrowRightOnRectangleIcon className="w-4 h-4" /> Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
