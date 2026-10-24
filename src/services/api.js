import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT from localStorage on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
}, (error) => Promise.reject(error));

// Global response error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || 'Something went wrong. Please try again.';
    const status = error.response?.status;

    if (status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('nursery');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }

    if (status === 403 && message === 'Your account is inactive. Please contact the administrator.') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('nursery');
      sessionStorage.setItem('authNotice', message);
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }

    // Don't show toast for 401 (handled by redirect), silent requests, or auth check on page load
    const isSilent = error.config?._silent;
    if (status !== 401 && !isSilent) {
      toast.error(message);
    }

    return Promise.reject(error);
  }
);

// ─── Auth ──────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  checkEmail: (email) => api.post('/auth/check-email', { email }),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.put(`/auth/reset-password/${token}`, { password }),
  changePassword: (data) => api.put('/auth/change-password', data),
};

// ─── Products ─────────────────────────────────────────────────────────────────
export const productAPI = {
  getAll: (params) => api.get('/products', { params }),
  getFeatured: () => api.get('/products/featured'),
  getOne: (id) => api.get(`/products/${id}`),
};

// ─── Categories ───────────────────────────────────────────────────────────────
export const categoryAPI = {
  getAll: () => api.get('/categories'),
  getOne: (slug) => api.get(`/categories/${slug}`),
};

// ─── Cart ─────────────────────────────────────────────────────────────────────
export const cartAPI = {
  get: () => api.get('/cart'),
  addItem: (data) => api.post('/cart', data),
  updateItem: (itemId, quantity) => api.put(`/cart/${itemId}`, { quantity }),
  removeItem: (itemId) => api.delete(`/cart/${itemId}`),
  applyCoupon: (code) => api.post('/cart/coupon', { code }),
  removeCoupon: () => api.delete('/cart/coupon'),
  clear: () => api.delete('/cart/clear'),
};

// ─── Orders ───────────────────────────────────────────────────────────────────
export const orderAPI = {
  getMyOrders: (params) => api.get('/orders/my-orders', { params }),
  getOne: (id) => api.get(`/orders/${id}`),
  create: (data) => api.post('/orders', data),
  cancel: (id, reason) => api.post(`/orders/${id}/cancel`, { reason }),
};

// ─── Payments ─────────────────────────────────────────────────────────────────
export const paymentAPI = {
  createOrder: (data) => api.post('/payments/create-order', data),
  verify: (data) => api.post('/payments/verify', data),
};

// ─── Reviews ──────────────────────────────────────────────────────────────────
export const reviewAPI = {
  getRecent: () => api.get('/reviews/recent'),
  getByProduct: (productId, params) => api.get(`/reviews/${productId}`, { params }),
  add: (productId, data) => api.post(`/reviews/${productId}`, data),
  delete: (id) => api.delete(`/reviews/${id}`),
};

// ─── Coupons ──────────────────────────────────────────────────────────────────
export const couponAPI = {
  validate: (code, cartSubtotal) => api.post('/coupons/validate', { code, cartSubtotal }),
};

// ─── User ─────────────────────────────────────────────────────────────────────
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  addAddress: (data) => api.post('/users/addresses', data),
  updateAddress: (id, data) => api.put(`/users/addresses/${id}`, data),
  deleteAddress: (id) => api.delete(`/users/addresses/${id}`),
  getWishlist: () => api.get('/users/wishlist'),
  toggleWishlist: (productId) => api.post(`/users/wishlist/${productId}`),
};

// ─── Admin ────────────────────────────────────────────────────────────────────
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  // Products
  createProduct: (data) => api.post('/admin/products', data),
  updateProduct: (id, data) => api.put(`/admin/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/admin/products/${id}`),
  uploadImages: (id, formData) => api.post(`/admin/products/${id}/images`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteImage: (id, imageId) => api.delete(`/admin/products/${id}/images/${imageId}`),
  // Categories
  createCategory: (data) => api.post('/admin/categories', data),
  updateCategory: (id, data) => api.put(`/admin/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/admin/categories/${id}`),
  // Orders
  getOrders: (params) => api.get('/admin/orders', { params }),
  updateOrderStatus: (id, data) => api.put(`/admin/orders/${id}/status`, data),
  initiateRefund: (id, data) => api.post(`/admin/orders/${id}/refund`, data),
  // Customers
  getCustomers: (params) => api.get('/admin/customers', { params }),
  getAccounts: (params) => api.get('/admin/accounts', { params }),
  createAccount: (data) => api.post('/admin/accounts', data),
  setAccountStatus: (id, accountStatus) => api.patch(`/admin/accounts/${id}/status`, { accountStatus }),
  assignProductAdmin: (id, shopId) => api.patch(`/admin/accounts/${id}/shop`, { shopId }),
  // Inventory
  getInventory: (params) => api.get('/admin/inventory', { params }),
  adjustInventory: (data) => api.post('/admin/inventory/adjust', data),
  // Coupons
  getCoupons: () => api.get('/admin/coupons'),
  createCoupon: (data) => api.post('/admin/coupons', data),
  updateCoupon: (id, data) => api.put(`/admin/coupons/${id}`, data),
  deleteCoupon: (id) => api.delete(`/admin/coupons/${id}`),
  // Audit
  getAuditLogs: (params) => api.get('/admin/audit-logs', { params }),
  getPlatform: () => api.get('/admin/platform'),
  getSellers: (params) => api.get('/admin/sellers', { params }),
  getSeller: (id) => api.get(`/admin/sellers/${id}`),
  reviewSeller: (id, data) => api.post(`/admin/sellers/${id}/review`, data),
  getCatalog: (params) => api.get('/admin/catalog', { params }),
  moderateProduct: (id, data) => api.patch(`/admin/catalog/${id}`, data),
  getSettings: () => api.get('/admin/settings'),
  updateSettings: (data) => api.put('/admin/settings', data),
  getSettlements: (params) => api.get('/admin/settlements', { params }),
  markSettlementPaid: (id) => api.post(`/admin/settlements/${id}/paid`),
};

export const enquiryAPI = {
  create: (data) => api.post('/enquiries', data),
};

export const nurseryAPI = {
  list: () => api.get('/nurseries'),
  getOne: (slug) => api.get(`/nurseries/${slug}`),
  register: (data) => api.post('/nurseries/register', data),
  checkPin: (data) => api.post('/nurseries/check-pin', data),
  publicSettings: () => api.get('/nurseries/settings/public'),
  subscribe: (email) => api.post('/nurseries/newsletter', { email }),
  myApplication: () => api.get('/seller/application'),
  updateApplication: (data) => api.put('/seller/application', data),
};

export const productAdminAPI = {
  stats: () => api.get('/product-admin/stats'),
  products: (params) => api.get('/product-admin/products', { params }),
  getProduct: (id) => api.get(`/product-admin/products/${id}`),
  createProduct: (data) => api.post('/product-admin/products', data),
  updateProduct: (id, data) => api.put(`/product-admin/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/product-admin/products/${id}`),
  uploadImages: (id, formData) => api.post(`/product-admin/products/${id}/images`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  exportProducts: () => api.get('/product-admin/products/export', { responseType: 'blob' }),
  importProducts: (products) => api.post('/product-admin/products/import', { products }),
  createSubcategory: (data) => api.post('/product-admin/categories', data),
};

export const shopAdminAPI = {
  staff: () => api.get('/seller/staff'),
  inviteStaff: (data) => api.post('/seller/staff', data),
};

export const sellerAPI = {
  dashboard: () => api.get('/seller/dashboard'),
  products: (params) => api.get('/seller/products', { params }),
  getProduct: (id) => api.get(`/seller/products/${id}`),
  createProduct: (data) => api.post('/seller/products', data),
  updateProduct: (id, data) => api.put(`/seller/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/seller/products/${id}`),
  updateProfile: (data) => api.put('/seller/profile', data),
  enquiries: () => api.get('/seller/enquiries'),
  replyEnquiry: (id, data) => api.patch(`/seller/enquiries/${id}`, data),
  uploadImages: (id, formData) => api.post(`/seller/products/${id}/images`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  orders: (params) => api.get('/seller/orders', { params }),
  getOrder: (id) => api.get(`/seller/orders/${id}`),
  fulfill: (id, data) => api.put(`/seller/orders/${id}/fulfillment`, data),
  inventory: (params) => api.get('/seller/inventory', { params }),
  adjustInventory: (data) => api.post('/seller/inventory/adjust', data),
};

export const communityAPI = {
  me: () => api.get('/community/me'),
  apply: (data) => api.post('/community/apply', data),
  updateProfile: (data) => api.put('/community/profile', data),
  updatePayout: (data) => api.put('/community/payout', data),
  products: () => api.get('/community/products'),
  createProduct: (data) => api.post('/community/products', data),
  updateProduct: (id, data) => api.put(`/community/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/community/products/${id}`),
  orders: () => api.get('/community/orders'),
  getOrder: (id) => api.get(`/community/orders/${id}`),
  fulfill: (id, data) => api.put(`/community/orders/${id}/fulfillment`, data),
  earnings: () => api.get('/community/earnings'),
  seller: (id) => api.get(`/community/sellers/${id}`),
  report: (data) => api.post('/community/reports', data),
  adminSellers: (params) => api.get('/community/admin/sellers', { params }),
  reviewSeller: (id, data) => api.post(`/community/admin/sellers/${id}/review`, data),
  adminListings: (params) => api.get('/community/admin/listings', { params }),
  moderateListing: (id, data) => api.post(`/community/admin/listings/${id}/moderate`, data),
  adminReports: () => api.get('/community/admin/reports'),
  resolveReport: (id, data) => api.patch(`/community/admin/reports/${id}`, data),
  metrics: () => api.get('/community/admin/metrics'),
  settlements: (params) => api.get('/community/admin/settlements', { params }),
  settlementAction: (id, data) => api.post(`/community/admin/settlements/${id}`, data),
  audit: () => api.get('/community/admin/audit'),
};

export const plantAPI = {
  list: (params) => api.get('/plants', { params }),
  get: (id) => api.get(`/plants/${id}`),
  create: (data) => api.post('/plants', data),
  update: (id, data) => api.put(`/plants/${id}`, data),
  remove: (id) => api.delete(`/plants/${id}`),
  pause: (id) => api.post(`/plants/${id}/pause`),
  adopt: (id, data) => api.post(`/plants/${id}/adopt`, data),
  exchange: (id, data) => api.post(`/plants/${id}/exchange`, data),
  enquiry: (id, data) => api.post(`/plants/${id}/enquiry`, data),
  report: (id, data) => api.post(`/plants/${id}/report`, data),
  review: (id, data) => api.post(`/plants/${id}/reviews`, data),
  offerings: () => api.get('/plants/me/offerings'),
  activities: () => api.get('/plants/me/activities'),
  readNotifications: () => api.post('/plants/me/notifications/read'),
  upload: (formData) => api.post('/plants/uploads', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  respondAdoption: (id, data) => api.post(`/plants/adoptions/${id}/respond`, data),
  withdrawAdoption: (id) => api.post(`/plants/adoptions/${id}/withdraw`),
  cancelAdoption: (id, data) => api.post(`/plants/adoptions/${id}/cancel`, data),
  confirmAdoption: (id) => api.post(`/plants/adoptions/${id}/confirm`),
  respondExchange: (id, data) => api.post(`/plants/exchanges/${id}/respond`, data),
  withdrawExchange: (id) => api.post(`/plants/exchanges/${id}/withdraw`),
  cancelExchange: (id, data) => api.post(`/plants/exchanges/${id}/cancel`, data),
  confirmExchange: (id) => api.post(`/plants/exchanges/${id}/confirm`),
  dispute: (id, data) => api.post(`/plants/activities/${id}/dispute`, data),
  closeEnquiry: (id) => api.post(`/plants/enquiries/${id}/close`),
  metrics: () => api.get('/plants/admin/metrics'),
  adminListings: (params) => api.get('/plants/admin/listings', { params }),
  moderate: (id, data) => api.post(`/plants/admin/listings/${id}/moderate`, data),
  adminRequests: () => api.get('/plants/admin/requests'),
  adminReports: () => api.get('/plants/admin/reports'),
  resolveReport: (id, data) => api.patch(`/plants/admin/reports/${id}`, data),
  restrict: (id, data) => api.post(`/plants/admin/users/${id}/restriction`, data),
  policy: (data) => api.put('/plants/admin/policy', data),
  audit: () => api.get('/plants/admin/audit'),
};

export const auctionAPI = {
  list: (params) => api.get('/auctions', { params }),
  get: (id) => api.get(`/auctions/${id}`),
  create: (data) => api.post('/auctions', data),
  bid: (id, data) => api.post(`/auctions/${id}/bids`, data),
  checkout: (id) => api.get(`/auctions/${id}/checkout`),
  pay: (id) => api.post(`/auctions/${id}/pay`),
  verify: (id, data) => api.post(`/auctions/${id}/verify`, data),
  mine: () => api.get('/auctions/me/history'),
  adminPayments: () => api.get('/auctions/admin/payments'),
  refund: (id, data) => api.post(`/auctions/admin/payments/${id}/refund`, data),
};

export default api;
