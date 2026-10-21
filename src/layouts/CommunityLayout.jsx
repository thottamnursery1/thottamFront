import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import {
  ChartBarIcon, CubeIcon, ShoppingBagIcon, BanknotesIcon, UserCircleIcon,
} from '@heroicons/react/24/outline';

const navItems = [
  { to: '/community', label: 'Overview', icon: ChartBarIcon, end: true, section: 'Selling' },
  { to: '/community/products', label: 'Listings', icon: CubeIcon, section: 'Selling' },
  { to: '/community/orders', label: 'Orders', icon: ShoppingBagIcon, section: 'Selling' },
  { to: '/community/earnings', label: 'Earnings', icon: BanknotesIcon, section: 'Finance' },
  { to: '/community/profile', label: 'Seller profile', icon: UserCircleIcon, section: 'Account' },
];

export default function CommunityLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  return (
    <DashboardLayout
      role="seller"
      navItems={navItems}
      brand={{ name: 'Community seller', subtitle: 'Your plants on Thottam' }}
      user={user}
      onLogout={() => { logout(); navigate('/login'); }}
    />
  );
}
