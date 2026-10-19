import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { normalizeEmail } from '../utils/helpers';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const notice = sessionStorage.getItem('authNotice');
    if (!notice) return;
    toast.error(notice);
    sessionStorage.removeItem('authNotice');
  }, []);

  const validate = () => {
    const errs = {};
    if (!form.email) errs.email = 'Email is required';
    if (!form.password) errs.password = 'Password is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const user = await login(normalizeEmail(form.email), form.password);
      toast.success(`Welcome back, ${user.name}!`);
      if (from !== '/') navigate(from, { replace: true });
      else if (user.role === 'admin' || user.role === 'super_admin') navigate('/admin', { replace: true });
      else if (user.role === 'shop_assistant') navigate(user.nursery?.status === 'approved' && (user.shop || user.nursery) ? '/product-admin' : '/seller/pending', { replace: true });
      else if (user.role === 'seller' || user.role === 'shop_admin') navigate(user.nursery?.status === 'approved' ? '/seller' : '/seller/pending', { replace: true });
      else navigate('/', { replace: true });
    } catch {
      // Error toast handled by API interceptor
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-display text-xl">R</span>
          </div>
          <h1 className="text-3xl font-display text-gray-900">Welcome back</h1>
          <p className="text-gray-500 mt-2">Sign in to Root & Bloom</p>
        </div>

        <div className="bg-white rounded-2xl shadow-card p-8">
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label className="label">Email address</label>
              <input type="email" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={`input ${errors.email ? 'input-error' : ''}`}
                placeholder="you@example.com" autoComplete="email" />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="label mb-0">Password</label>
                <Link to="/forgot-password" className="text-xs text-primary-600 hover:underline">Forgot password?</Link>
              </div>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className={`input pr-10 ${errors.password ? 'input-error' : ''}`}
                  placeholder="••••••••" autoComplete="current-password" />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPass ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-600 font-medium hover:underline">Create one</Link>
          </div>
        </div>

        {/* Demo credentials */}
        <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-700">
          <p className="font-semibold mb-1">Demo Credentials</p>
          <p>Customer: customer@test.com / Customer@123</p>
          <p>Admin: admin@greenroots.com / Admin@123</p>
        </div>
      </div>
    </div>
  );
}
