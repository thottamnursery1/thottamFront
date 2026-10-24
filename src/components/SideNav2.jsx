import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  HomeIcon,
  ShoppingBagIcon,
  BuildingStorefrontIcon,
  ArrowsRightLeftIcon,
  SparklesIcon,
  BookOpenIcon,
  XMarkIcon,
  ChevronLeftIcon,
} from '@heroicons/react/24/outline';
import Logo from './Logo';

const groups = [
  {
    label: 'Discover',
    items: [
      { to: '/', label: 'Home', icon: HomeIcon, end: true },
      { to: '/products', label: 'Shop', icon: ShoppingBagIcon },
      { to: '/nurseries', label: 'Nurseries', icon: BuildingStorefrontIcon },
    ],
  },
  {
    label: 'Community',
    items: [
      { to: '/plants', label: 'Adopt & exchange', icon: ArrowsRightLeftIcon },
      { to: '/auctions', label: 'Auctions', icon: SparklesIcon },
    ],
  },
  {
    label: 'Guides',
    items: [
      { to: '/plant-care', label: 'Plant care', icon: BookOpenIcon },
    ],
  },
];

function useDesktopNav() {
  const [desktop, setDesktop] = useState(() => window.matchMedia('(min-width: 1024px)').matches);

  useEffect(() => {
    const media = window.matchMedia('(min-width: 1024px)');
    const onChange = () => setDesktop(media.matches);
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  return desktop;
}

export default function SideNav({ open, collapsed, onClose, onToggle }) {
  const desktop = useDesktopNav();
  const shown = desktop ? !collapsed : open;
  const dismiss = () => (desktop ? onToggle() : onClose());

  return (
    <>
      {open && !desktop && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-[#071511]/40 backdrop-blur-[2px] lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`store-sidebar fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col transition-transform duration-300 ease-out lg:sticky lg:top-0 lg:z-30 lg:h-screen lg:shrink-0 ${shown ? 'translate-x-0' : '-translate-x-full'} ${collapsed ? 'lg:hidden' : 'lg:translate-x-0'}`}
        hidden={!shown}
        aria-label="Store navigation"
      >
        <div className="flex items-start justify-between gap-3 px-5 pb-4 pt-5">
          <div className="min-w-0">
            <Logo />
            <p className="mt-2 text-[11px] font-medium uppercase tracking-[0.18em] text-muted">Bring the nursery home</p>
          </div>
          <button
            type="button"
            onClick={dismiss}
            className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-primary-900/10 bg-white/70 text-primary-800 shadow-sm transition hover:bg-white"
            aria-label="Close navigation"
          >
            <XMarkIcon className="h-4 w-4 lg:hidden" />
            <ChevronLeftIcon className="hidden h-4 w-4 lg:block" />
          </button>
        </div>

        <div className="mx-5 h-px bg-gradient-to-r from-transparent via-primary-700/20 to-transparent" />

        <nav className="scrollbar-thin flex-1 space-y-6 overflow-y-auto px-3 py-5">
          {groups.map((group) => (
            <div key={group.label}>
              <p className="mb-2 px-3 font-display text-[13px] italic tracking-wide text-primary-800/55">{group.label}</p>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink key={item.to} to={item.to} end={item.end} className="store-nav-link">
                      <span className="store-nav-icon">
                        <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
                      </span>
                      <span className="min-w-0 flex-1 truncate">{item.label}</span>
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-4">
          <div className="rounded-2xl border border-primary-900/10 bg-white/65 px-4 py-3.5 shadow-sm">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-terracotta-600">This season</p>
            <p className="mt-1 font-display text-[15px] leading-snug text-primary-800">Free delivery above ₹999</p>
            <p className="mt-1 text-xs leading-relaxed text-muted">Plants, pots, and soil from independent growers.</p>
          </div>
        </div>
      </aside>
    </>
  );
}
