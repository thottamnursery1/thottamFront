/**
 * DashboardLayout — shared premium sidebar + main content layout
 *
 * Props:
 *  navItems      [{to, label, icon, end, section?}]  — navigation links
 *  brand         { name, subtitle, avatar? }          — top logo area
 *  user          { name, email, role }                — bottom user strip
 *  onLogout      () => void
 *  role          'admin' | 'seller' | 'product-admin'  — accent colour
 *  extraFooter   ReactNode                            — extra items above user strip
 */

import { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Bars3Icon, XMarkIcon, ArrowRightOnRectangleIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import Logo from './Logo';

// Accent ring colours per role
const ACCENT = {
  admin: '#3E946C',
  seller: '#287A55',
  'product-admin': '#287A55',
};

function itemMatches(item, pathname) {
  if (item.end) return pathname === item.to;
  return pathname === item.to || pathname.startsWith(`${item.to}/`);
}

function NavItem({ item, collapsed, active }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      end={item.end}
      className={() => `sidebar-nav-item ${active ? 'active' : ''}`}
    >
      {/* Icon */}
      <span className="nav-icon flex-shrink-0">
        <Icon className="w-[18px] h-[18px]" />
      </span>

      {/* Label — hidden when collapsed */}
      {!collapsed && (
        <span className="nav-label flex-1 text-sm leading-tight">{item.label}</span>
      )}

      {/* Tooltip — only shown in collapsed mode */}
      {collapsed && (
        <span className="sidebar-tooltip">{item.label}</span>
      )}
    </NavLink>
  );
}

export default function DashboardLayout({ navItems = [], brand, user, onLogout, role = 'admin', extraFooter }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const sidebarRef = useRef(null);
  const accent = ACCENT[role] || ACCENT.admin;

  // Close mobile drawer on resize to desktop
  useEffect(() => {
    const handler = () => { if (window.innerWidth >= 1024) setMobileOpen(false); };
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  // Group items by section
  const sections = navItems.reduce((acc, item) => {
    const key = item.section || '__default__';
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  const sidebarWidth = collapsed ? 68 : 240;

  const { pathname } = useLocation();
  const activeTo = navItems
    .filter((item) => itemMatches(item, pathname))
    .sort((a, b) => b.to.length - a.to.length)[0]?.to;

  const SidebarContent = ({ isMobile = false }) => (
    <div
      className="flex flex-col h-full"
      style={{ background: 'linear-gradient(180deg, #0F2820 0%, #0C1F18 100%)' }}
    >
      {/* ── Brand / Logo area ─────────────────────────────── */}
      <div
        className="flex items-center gap-3 px-4 border-b"
        style={{
          minHeight: 60,
          borderColor: 'rgba(255,255,255,0.07)',
          overflow: 'hidden',
        }}
      >
        <div
          className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white"
          style={{ background: accent }}
        >
          {brand?.avatar ?? (brand?.name?.charAt(0) ?? 'T')}
        </div>
        {(!collapsed || isMobile) && (
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate leading-tight">{brand?.name ?? 'Thottam'}</p>
            {brand?.subtitle && (
              <p className="text-[11px] truncate" style={{ color: 'rgba(255,255,255,0.42)' }}>{brand.subtitle}</p>
            )}
          </div>
        )}
        {/* Desktop collapse toggle — only on sidebar itself */}
        {!isMobile && (
          <button
            onClick={() => setCollapsed((v) => !v)}
            className="flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center transition-colors"
            style={{ color: 'rgba(255,255,255,0.38)', marginLeft: collapsed ? 'auto' : 0 }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.38)'; }}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed
              ? <ChevronRightIcon className="w-3.5 h-3.5" />
              : <ChevronLeftIcon  className="w-3.5 h-3.5" />
            }
          </button>
        )}
        {/* Mobile close */}
        {isMobile && (
          <button
            onClick={() => setMobileOpen(false)}
            className="flex-shrink-0 w-7 h-7 rounded-md flex items-center justify-center"
            style={{ color: 'rgba(255,255,255,0.5)', marginLeft: 'auto' }}
            aria-label="Close menu"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* ── Navigation ────────────────────────────────────── */}
      <nav
        className="flex-1 overflow-y-auto scrollbar-gloss py-3"
        style={{ paddingLeft: 8, paddingRight: 8 }}
      >
        {Object.entries(sections).map(([section, items]) => (
          <div key={section} className="mb-4">
            {/* Section label — hidden when collapsed */}
            {section !== '__default__' && !collapsed && (
              <p className="sidebar-section-label mb-2 mt-1 px-2">{section}</p>
            )}
            {section !== '__default__' && collapsed && (
              <div
                style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '6px 10px 8px' }}
              />
            )}
            <div className="space-y-0.5">
              {items.map((item) => (
                <div
                  key={item.to}
                  onClick={() => isMobile && setMobileOpen(false)}
                >
                  <NavItem item={item} collapsed={collapsed && !isMobile} active={item.to === activeTo} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* ── Extra footer slot ─────────────────────────────── */}
      {extraFooter && (
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', padding: '8px' }}>
          {extraFooter}
        </div>
      )}

      {/* ── User strip ────────────────────────────────────── */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', padding: '8px' }}>
        {(!collapsed || isMobile) ? (
          <div className="flex items-center gap-2.5 px-2 py-2 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.05)' }}>
            <div
              className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-white"
              style={{ background: accent }}
            >
              {user?.name?.charAt(0)?.toUpperCase() ?? '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user?.name}</p>
              <p className="text-[10px] truncate" style={{ color: 'rgba(255,255,255,0.38)' }}>{user?.email}</p>
            </div>
            <button
              onClick={onLogout}
              className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
              style={{ color: 'rgba(255,255,255,0.4)' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.15)'; e.currentTarget.style.color = '#f87171'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; }}
              aria-label="Sign out"
              title="Sign out"
            >
              <ArrowRightOnRectangleIcon className="w-4 h-4" />
            </button>
          </div>
        ) : (
          /* Collapsed: just avatar + logout icon */
          <div className="flex flex-col items-center gap-1">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
              style={{ background: accent }}
              title={user?.name}
            >
              {user?.name?.charAt(0)?.toUpperCase() ?? '?'}
            </div>
            <button
              onClick={onLogout}
              className="w-8 h-7 flex items-center justify-center rounded-lg transition-colors"
              style={{ color: 'rgba(255,255,255,0.38)' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#f87171'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.38)'; }}
              aria-label="Sign out"
              title="Sign out"
            >
              <ArrowRightOnRectangleIcon className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="dashboard-layout">

      {/* ── Desktop sidebar ─────────────────────────────── */}
      <aside
        ref={sidebarRef}
        className="sidebar-root hidden lg:flex lg:flex-col"
        style={{ width: sidebarWidth }}
        aria-label="Sidebar navigation"
      >
        <SidebarContent />
      </aside>

      {/* ── Mobile drawer overlay ────────────────────────── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <button
            className="absolute inset-0 w-full h-full"
            style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(2px)' }}
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation"
          />
          {/* Drawer */}
          <aside
            className="absolute left-0 top-0 h-full flex flex-col animate-slide-in-left"
            style={{ width: 260, zIndex: 1 }}
          >
            <SidebarContent isMobile />
          </aside>
        </div>
      )}

      {/* ── Main area ────────────────────────────────────── */}
      <div className="dashboard-main">
        {/* Mobile topbar */}
        <header
          className="lg:hidden flex items-center gap-3 px-4 border-b bg-white"
          style={{ height: 56, borderColor: 'rgba(0,0,0,0.07)', flexShrink: 0 }}
        >
          <button
            onClick={() => setMobileOpen(true)}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
            aria-label="Open navigation"
          >
            <Bars3Icon className="w-5 h-5" />
          </button>
          <Logo compact />
          <div className="flex-1" />
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
            style={{ background: accent }}
          >
            {user?.name?.charAt(0)?.toUpperCase() ?? '?'}
          </div>
        </header>

        {/* Page content */}
        <div className="dashboard-content scrollbar-thin">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
