import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import {
  ChartBarIcon, CubeIcon, ShoppingBagIcon, ChatBubbleLeftRightIcon,
  UserGroupIcon, PlusCircleIcon, BuildingStorefrontIcon, ArrowTopRightOnSquareIcon,
  ArchiveBoxIcon,
} from '@heroicons/react/24/outline';

const getNavItems = () => [
  { to: '/seller',            label: 'Overview',         icon: ChartBarIcon,              end: true,  section: 'Dashboard' },
  { to: '/seller/orders',     label: 'Orders',           icon: ShoppingBagIcon,                       section: 'Store' },
  { to: '/seller/products',   label: 'Products',         icon: CubeIcon,                              section: 'Store' },
  { to: '/seller/inventory',  label: 'Inventory',        icon: ArchiveBoxIcon,                        section: 'Store' },
  { to: '/seller/enquiries',label: 'Enquiries',       icon: ChatBubbleLeftRightIcon,               section: 'Store' },
  { to: '/seller/staff',    label: 'Product Managers',icon: UserGroupIcon,                         section: 'Team' },
  { to: '/product-admin',   label: 'Product Admin',   icon: PlusCircleIcon,                        section: 'Team' },
  { to: '/seller/profile',  label: 'Shop Profile',    icon: BuildingStorefrontIcon,                section: 'Settings' },
];

export default function SellerLayout() {
  const { user, nursery, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = getNavItems();

  // Extra footer: "View Shop" link
  const extraFooter = (
    <a
      href="/"
      target="_blank"
      rel="noreferrer"
      className="sidebar-nav-item"
      style={{ textDecoration: 'none', display: 'flex' }}
    >
      <ArrowTopRightOnSquareIcon className="nav-icon w-[18px] h-[18px] flex-shrink-0" />
      <span className="nav-label text-sm">View Shop</span>
    </a>
  );

  return (
    <DashboardLayout
      role="seller"
      navItems={navItems}
      brand={{
        name: nursery?.name ?? 'Your Nursery',
        subtitle: nursery?.status
          ? `${nursery.status.charAt(0).toUpperCase()}${nursery.status.slice(1)} · ${nursery.sellerCode ?? ''}`
          : 'Seller Dashboard',
      }}
      user={user}
      onLogout={() => { logout(); navigate('/login'); }}
      extraFooter={extraFooter}
    />
  );
}
