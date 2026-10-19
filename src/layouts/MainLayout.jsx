import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import FloatingCart from '../components/FloatingCart';

export default function MainLayout() {
  return (
    <div className="flex flex-col min-h-screen storefront-bg">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <FloatingCart />
    </div>
  );
}
