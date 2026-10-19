import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartAPI } from '../services/api';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState({ items: [] });
  const [summary, setSummary] = useState({ subtotal: 0, shippingCharge: 0, taxAmount: 0, couponDiscount: 0, totalAmount: 0, itemCount: 0 });
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) { setCart({ items: [] }); return; }
    try {
      setLoading(true);
      const res = await cartAPI.get();
      setCart(res.data.cart);
      setSummary(res.data.summary);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const addToCart = useCallback(async (productId, quantity = 1, variantId = null) => {
    const res = await cartAPI.addItem({ productId, quantity, variantId });
    setCart(res.data.cart);
    setSummary(res.data.summary);
    toast.success('Added to cart!');
    return res.data;
  }, []);

  const updateItem = useCallback(async (itemId, quantity) => {
    const res = await cartAPI.updateItem(itemId, quantity);
    setCart(res.data.cart);
    setSummary(res.data.summary);
  }, []);

  const removeItem = useCallback(async (itemId) => {
    const res = await cartAPI.removeItem(itemId);
    setCart(res.data.cart);
    setSummary(res.data.summary);
    toast.success('Item removed from cart.');
  }, []);

  const applyCoupon = useCallback(async (code) => {
    const res = await cartAPI.applyCoupon(code);
    setCart(res.data.cart);
    setSummary(res.data.summary);
    toast.success(res.data.message);
  }, []);

  const removeCoupon = useCallback(async () => {
    const res = await cartAPI.removeCoupon();
    setCart(res.data.cart);
    setSummary(res.data.summary);
  }, []);

  const clearCart = useCallback(async () => {
    await cartAPI.clear();
    setCart({ items: [] });
    setSummary({ subtotal: 0, shippingCharge: 0, taxAmount: 0, couponDiscount: 0, totalAmount: 0, itemCount: 0 });
  }, []);

  const itemCount = summary.itemCount || cart.items?.reduce((s, i) => s + i.quantity, 0) || 0;

  return (
    <CartContext.Provider value={{ cart, summary, loading, itemCount, fetchCart, addToCart, updateItem, removeItem, applyCoupon, removeCoupon, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
