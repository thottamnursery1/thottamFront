import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProductRoute() {
  const { isAuthenticated, isShopAdmin, isProductAdmin, user, nursery, loading } = useAuth();
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-primary-700 border-t-transparent rounded-full animate-spin" /></div>;
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.accountStatus === 'inactive' || user?.isActive === false) return <Navigate to="/login" replace />;
  if (!isShopAdmin && !isProductAdmin) return <Navigate to="/" replace />;
  if (isProductAdmin && !user?.shop && !nursery) return <Navigate to="/seller/pending" replace />;
  if (nursery && nursery.status !== 'approved') return <Navigate to="/seller/pending" replace />;
  return <Outlet />;
}
