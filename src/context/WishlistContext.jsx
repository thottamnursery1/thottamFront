import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { userAPI } from '../services/api';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    if (isAuthenticated) {
      userAPI.getWishlist()
        .then((res) => setWishlist(res.data.wishlist || []))
        .catch(() => {});
    } else {
      setWishlist([]);
    }
  }, [isAuthenticated]);

  const toggleWishlist = useCallback(async (productId) => {
    const res = await userAPI.toggleWishlist(productId);
    if (res.data.added) {
      toast.success('Added to wishlist!');
    } else {
      toast.success('Removed from wishlist.');
    }
    // Refresh wishlist
    const wRes = await userAPI.getWishlist();
    setWishlist(wRes.data.wishlist || []);
    return res.data.added;
  }, []);

  const isInWishlist = useCallback((productId) => {
    return wishlist.some((item) => {
      const id = item._id || item;
      return id.toString() === productId.toString();
    });
  }, [wishlist]);

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
};
