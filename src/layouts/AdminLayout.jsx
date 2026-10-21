import { useNavigate, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import {
  ChartBarIcon, CubeIcon, ShoppingBagIcon, UsersIcon,
  TagIcon, ArchiveBoxIcon, Squares2X2Icon,
  BuildingStorefrontIcon, Cog6ToothIcon, BanknotesIcon,
  ShieldCheckIcon, UserGroupIcon, SparklesIcon,
} from '@heroicons/react/24/outline';

const navItems = [
  { to: '/admin',             label: 'Dashboard',   icon: ChartBarIcon,          end: true,  section: 'Overview' },
  { to: '/admin/orders',      label: 'Orders',      icon: ShoppingBagIcon,                   section: 'Commerce' },
  { to: '/admin/products',    label: 'Products',    icon: CubeIcon,                          section: 'Commerce' },
  { to: '/admin/categories',  label: 'Categories',  icon: Squares2X2Icon,                    section: 'Commerce' },
  { to: '/admin/inventory',   label: 'Inventory',   icon: ArchiveBoxIcon,                    section: 'Commerce' },
  { to: '/admin/coupons',     label: 'Coupons',     icon: TagIcon,                           section: 'Commerce' },
  { to: '/admin/customers',   label: 'Customers',   icon: UsersIcon,                         section: 'People' },
  { to: '/admin/accounts',    label: 'Accounts',    icon: ShieldCheckIcon,                   section: 'People' },
  { to: '/admin/sellers',     label: 'Nurseries',   icon: BuildingStorefrontIcon,             section: 'People' },
  { to: '/admin/community',   label: 'Community',   icon: UserGroupIcon,                     section: 'People' },
  { to: '/admin/plants',      label: 'Plant exchange', icon: SparklesIcon,                   section: 'People' },
  { to: '/admin/settlements', label: 'Settlements', icon: BanknotesIcon,                     section: 'Finance' },
  { to: '/admin/settings',    label: 'Settings',    icon: Cog6ToothIcon,                     section: 'System' },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <DashboardLayout
      role="admin"
      navItems={navItems}
      brand={{ name: 'Thottam Admin', subtitle: 'Platform management' }}
      user={user}
      onLogout={() => { logout(); navigate('/login'); }}
    />
  );
}
