import { useCallback, useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import FloatingCart from '../components/FloatingCart';
import SideNav from '../components/SideNav2';

const KEY = 'thottam.storefrontSidebar';

export default function MainLayout() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem(KEY) === '1');
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => { localStorage.setItem(KEY, collapsed ? '1' : '0'); }, [collapsed]);
  useEffect(() => { close(); }, [location.pathname, location.search, close]);
  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 1024) setOpen(false); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const toggle = () => {
    if (window.innerWidth >= 1024) setCollapsed((v) => !v);
    else setOpen((v) => !v);
  };

  return (
    <div className="storefront-bg flex min-h-screen">
      <SideNav open={open} collapsed={collapsed} onClose={close} onToggle={toggle} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar onToggleSidebar={toggle} sidebarCollapsed={collapsed} />
        <main className="flex-1"><Outlet /></main>
        <Footer />
      </div>
      <FloatingCart />
    </div>
  );
}
