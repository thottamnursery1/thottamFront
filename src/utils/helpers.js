// Format currency in INR
export const formatPrice = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

// Format date
export const formatDate = (date, options = {}) =>
  new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric', ...options,
  });

// Truncate text
export const truncate = (str, n = 80) =>
  str && str.length > n ? str.slice(0, n - 3) + '...' : str;

// Get order status color classes
export const getOrderStatusColor = (status) => {
  const map = {
    pending_payment: 'badge-orange',
    confirmed: 'badge-blue',
    processing: 'badge-blue',
    shipped: 'badge-blue',
    delivered: 'badge-green',
    cancelled: 'badge-red',
    return_requested: 'badge-orange',
    returned: 'badge-red',
  };
  return map[status] || 'badge-orange';
};

export const getPaymentStatusColor = (status) => {
  const map = {
    pending: 'badge-orange',
    paid: 'badge-green',
    failed: 'badge-red',
    refunded: 'badge-blue',
    partially_refunded: 'badge-blue',
  };
  return map[status] || 'badge-orange';
};

export const orderStatusLabel = (status) => {
  const map = {
    pending_payment: 'Awaiting Payment',
    confirmed: 'Confirmed',
    processing: 'Processing',
    shipped: 'Shipped',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
    return_requested: 'Return Requested',
    returned: 'Returned',
  };
  return map[status] || status;
};

// Generate star rating display
export const getStarArray = (rating) => {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return { full, half, empty };
};

// Debounce
export const debounce = (fn, delay) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

// Scroll to top
export const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

export const EMAIL_TAKEN_MESSAGE = 'This email is already registered. Please use a different email address.';

export const normalizeEmail = (email) => String(email || '').trim().toLowerCase();

export const ROLE_LABELS = {
  customer: 'Customer',
  seller: 'Shop admin',
  shop_admin: 'Shop admin',
  product_admin: 'Shop assistant',
  shop_assistant: 'Shop assistant',
  admin: 'Super admin',
  super_admin: 'Super admin',
};
