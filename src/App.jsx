import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import ScrollToTop from './components/ScrollToTop';

// Customer Pages
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import AccountPage from './pages/AccountPage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';
import WishlistPage from './pages/WishlistPage';
import NotFoundPage from './pages/NotFoundPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminProductForm from './pages/admin/AdminProductForm';
import AdminOrders from './pages/admin/AdminOrders';
import AdminOrderDetail from './pages/admin/AdminOrderDetail';
import AdminCustomers from './pages/admin/AdminCustomers';
import AdminCoupons from './pages/admin/AdminCoupons';
import AdminInventory from './pages/admin/AdminInventory';
import AdminCategories from './pages/admin/AdminCategories';
import SellerRoute from './components/SellerRoute';
import SellerLayout from './layouts/SellerLayout';
import NurseriesPage from './pages/NurseriesPage';
import NurseryDetailPage from './pages/NurseryDetailPage';
import PlantCarePage from './pages/PlantCarePage';
import PolicyPage from './pages/PolicyPage';
import SellerRegisterPage from './pages/SellerRegisterPage';
import SellerPendingPage from './pages/SellerPendingPage';
import SellerDashboard from './pages/seller/SellerDashboard';
import SellerProducts from './pages/seller/SellerProducts';
import SellerProductForm from './pages/seller/SellerProductForm';
import SellerOrders from './pages/seller/SellerOrders';
import SellerOrderDetail from './pages/seller/SellerOrderDetail';
import SellerEnquiries from './pages/seller/SellerEnquiries';
import SellerProfile from './pages/seller/SellerProfile';
import SellerStaff from './pages/seller/SellerStaff';
import SellerInventory from './pages/seller/SellerInventory';
import ProductRoute from './components/ProductRoute';
import ProductAdminLayout from './layouts/ProductAdminLayout';
import ProductAdminHome from './pages/product-admin/ProductAdminHome';
import ProductAdminProducts from './pages/product-admin/ProductAdminProducts';
import ProductAdminProductForm from './pages/product-admin/ProductAdminProductForm';
import AdminSellers from './pages/admin/AdminSellers';
import AdminSellerDetail from './pages/admin/AdminSellerDetail';
import AdminSettings from './pages/admin/AdminSettings';
import AdminSettlements from './pages/admin/AdminSettlements';
import AdminAccounts from './pages/admin/AdminAccounts';
import CommunityApplyPage from './pages/CommunityApplyPage';
import CommunitySellerPage from './pages/CommunitySellerPage';
import CommunityRoute from './components/CommunityRoute';
import CommunityLayout from './layouts/CommunityLayout';
import CommunityHome from './pages/community/CommunityHome';
import CommunityProducts from './pages/community/CommunityProducts';
import CommunityProductForm from './pages/community/CommunityProductForm';
import CommunityOrders from './pages/community/CommunityOrders';
import CommunityEarnings from './pages/community/CommunityEarnings';
import CommunityProfile from './pages/community/CommunityProfile';
import AdminCommunity from './pages/admin/AdminCommunity';
import PlantExchangePage from './pages/plants/PlantExchangePage';
import PlantDetailPage from './pages/plants/PlantDetailPage';
import PlantFormPage from './pages/plants/PlantFormPage';
import PlantActivitiesPage from './pages/plants/PlantActivitiesPage';
import AdminPlants from './pages/admin/AdminPlants';

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Customer Routes */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

          {/* Protected Customer Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/order-success/:id" element={<OrderSuccessPage />} />
            <Route path="/account" element={<AccountPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/orders/:id" element={<OrderDetailPage />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/plants/new" element={<PlantFormPage />} />
            <Route path="/plants/:id/edit" element={<PlantFormPage />} />
            <Route path="/account/plants" element={<PlantActivitiesPage />} />
          </Route>
          <Route path="/nurseries" element={<NurseriesPage />} />
          <Route path="/nurseries/:slug" element={<NurseryDetailPage />} />
          <Route path="/plant-care" element={<PlantCarePage />} />
          <Route path="/policies/:topic" element={<PolicyPage />} />
          <Route path="/sell" element={<SellerRegisterPage />} />
          <Route path="/community/apply" element={<CommunityApplyPage />} />
          <Route path="/community/sellers/:id" element={<CommunitySellerPage />} />
          <Route path="/plants" element={<PlantExchangePage />} />
          <Route path="/plants/:id" element={<PlantDetailPage />} />
          
          {/* Seller Pending Route with MainLayout */}
          <Route element={<SellerRoute allowPending />}>
            <Route path="/seller/pending" element={<SellerPendingPage />} />
          </Route>
        </Route>
        <Route element={<SellerRoute />}>
          <Route element={<SellerLayout />}>
            <Route path="/seller" element={<SellerDashboard />} />
            <Route path="/seller/products" element={<SellerProducts />} />
            <Route path="/seller/inventory" element={<SellerInventory />} />
            <Route path="/seller/products/new" element={<SellerProductForm />} />
            <Route path="/seller/products/:id/edit" element={<SellerProductForm />} />
            <Route path="/seller/orders" element={<SellerOrders />} />
            <Route path="/seller/orders/:id" element={<SellerOrderDetail />} />
            <Route path="/seller/enquiries" element={<SellerEnquiries />} />
            <Route path="/seller/profile" element={<SellerProfile />} />
            <Route path="/seller/staff" element={<SellerStaff />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<CommunityRoute />}>
            <Route element={<CommunityLayout />}>
              <Route path="/community" element={<CommunityHome />} />
              <Route path="/community/products" element={<CommunityProducts />} />
              <Route path="/community/products/new" element={<CommunityProductForm />} />
              <Route path="/community/products/:id/edit" element={<CommunityProductForm />} />
              <Route path="/community/orders" element={<CommunityOrders />} />
              <Route path="/community/earnings" element={<CommunityEarnings />} />
              <Route path="/community/profile" element={<CommunityProfile />} />
            </Route>
          </Route>
        </Route>

        <Route element={<ProductRoute />}>
          <Route element={<ProductAdminLayout />}>
            <Route path="/product-admin" element={<ProductAdminHome />} />
            <Route path="/product-admin/products" element={<ProductAdminProducts />} />
            <Route path="/product-admin/products/new" element={<ProductAdminProductForm />} />
            <Route path="/product-admin/products/:id/edit" element={<ProductAdminProductForm />} />
          </Route>
        </Route>

        {/* Admin Routes */}
        <Route element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/products" element={<AdminProducts />} />
            <Route path="/admin/products/new" element={<AdminProductForm />} />
            <Route path="/admin/products/:id/edit" element={<AdminProductForm />} />
            <Route path="/admin/orders" element={<AdminOrders />} />
            <Route path="/admin/orders/:id" element={<AdminOrderDetail />} />
            <Route path="/admin/customers" element={<AdminCustomers />} />
            <Route path="/admin/accounts" element={<AdminAccounts />} />
            <Route path="/admin/coupons" element={<AdminCoupons />} />
            <Route path="/admin/inventory" element={<AdminInventory />} />
            <Route path="/admin/categories" element={<AdminCategories />} />
            <Route path="/admin/sellers" element={<AdminSellers />} />
            <Route path="/admin/sellers/:id" element={<AdminSellerDetail />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
            <Route path="/admin/settlements" element={<AdminSettlements />} />
            <Route path="/admin/community" element={<AdminCommunity />} />
            <Route path="/admin/plants" element={<AdminPlants />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}
