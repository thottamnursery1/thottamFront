import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import {
  ArchiveBoxIcon, CubeIcon, PlusIcon, BuildingStorefrontIcon,
} from '@heroicons/react/24/outline';

export default function ProductAdminLayout() {
  const { user, nursery, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { to: '/product-admin',             label: 'Inventory',     icon: ArchiveBoxIcon,         end: true,  section: 'Products' },
    { to: '/product-admin/products',    label: 'All Products',  icon: CubeIcon,                           section: 'Products' },
    { to: '/product-admin/products/new',label: 'Add Product',   icon: PlusIcon,                           section: 'Products' },
    ...(user?.role !== 'shop_assistant'
      ? [{ to: '/seller', label: 'Shop Admin', icon: BuildingStorefrontIcon, section: 'Navigation' }]
      : []),
  ];

  return (
    <DashboardLayout
      role="product-admin"
      navItems={navItems}
      brand={{
        name: nursery?.name ?? 'Shop',
        subtitle: 'Product Administration',
      }}
      user={user}
      onLogout={() => { logout(); navigate('/'); }}
    />
  );
}
