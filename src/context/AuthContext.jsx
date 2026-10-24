import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';
import { isProductManagerRole } from '../utils/helpers';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

const storeSession = (token, user, nursery) => {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
  if (nursery) localStorage.setItem('nursery', JSON.stringify(nursery));
  else localStorage.removeItem('nursery');
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
  });
  const [nursery, setNursery] = useState(() => {
    try { return JSON.parse(localStorage.getItem('nursery')); } catch { return null; }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { setLoading(false); return; }
    // Use native fetch to bypass the global axios error-toast interceptor —
    // a stale/expired token on page load should fail silently.
    const base = import.meta.env.VITE_API_URL || '/api';
    fetch(`${base}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
      .then((data) => {
        setUser(data.user);
        setNursery(data.nursery || null);
        storeSession(token, data.user, data.nursery);
      })
      .catch(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('nursery');
        setUser(null);
        setNursery(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await authAPI.login({ email, password });
    localStorage.setItem('token', res.data.token);
    const me = await authAPI.getMe();
    storeSession(res.data.token, me.data.user, me.data.nursery);
    setUser(me.data.user);
    setNursery(me.data.nursery || null);
    return { ...me.data.user, nursery: me.data.nursery };
  }, []);

  const register = useCallback(async (data) => {
    const res = await authAPI.register(data);
    storeSession(res.data.token, res.data.user, null);
    setUser(res.data.user);
    setNursery(null);
    return res.data.user;
  }, []);

  const acceptSellerSession = useCallback((token, nextUser, nextNursery) => {
    storeSession(token, nextUser, nextNursery);
    setUser(nextUser);
    setNursery(nextNursery);
  }, []);

  const updateNursery = useCallback((nextNursery) => {
    setNursery(nextNursery || null);
    if (nextNursery) localStorage.setItem('nursery', JSON.stringify(nextNursery));
    else localStorage.removeItem('nursery');
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('nursery');
    setUser(null);
    setNursery(null);
    toast.success('Signed out.');
  }, []);

  const updateUser = useCallback((updated) => {
    setUser(updated);
    localStorage.setItem('user', JSON.stringify(updated));
  }, []);

  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';
  const isShopAdmin = user?.role === 'seller' || user?.role === 'shop_admin';
  const isProductAdmin = isProductManagerRole(user?.role);
  const isSeller = isShopAdmin;
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, nursery, loading, isAuthenticated, isAdmin, isSeller, isShopAdmin, isProductAdmin, login, register, logout, updateUser, updateNursery, acceptSellerSession }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
