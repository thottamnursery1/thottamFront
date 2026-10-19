import { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { EMAIL_TAKEN_MESSAGE, normalizeEmail } from '../utils/helpers';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validateField = useCallback((name, value, allValues) => {
    switch (name) {
      case 'name':
        if (!value.trim()) return 'Name is required';
        if (value.trim().length < 2) return 'Name must be at least 2 characters';
        break;
      case 'email':
        if (!value) return 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(value))) return 'Enter a valid email address';
        break;
      case 'phone':
        if (value && !/^[6-9]\d{9}$/.test(value)) return 'Enter a valid 10-digit mobile number';
        break;
      case 'password':
        if (!value) return 'Password is required';
        if (value.length < 8) return 'Password must be at least 8 characters';
        if (!/(?=.*[a-z])/.test(value)) return 'Password must contain at least one lowercase letter';
        if (!/(?=.*[A-Z])/.test(value)) return 'Password must contain at least one uppercase letter';
        if (!/(?=.*\d)/.test(value)) return 'Password must contain at least one number';
        break;
      case 'confirm':
        if (!value) return 'Please confirm your password';
        if (value !== allValues.password) return 'Passwords do not match';
        break;
      default:
        return null;
    }
    return null;
  }, []);

  const handleChange = useCallback((name, value) => {
    setForm(prev => ({ ...prev, [name]: value }));
    
    // Validate field on change if it has been touched
    if (touched[name]) {
      const error = validateField(name, value, { ...form, [name]: value });
      setErrors(prev => {
        const newErrors = { ...prev };
        if (error) {
          newErrors[name] = error;
        } else {
          delete newErrors[name];
        }
        
        // Re-validate confirm password if password changed
        if (name === 'password' && touched.confirm) {
          const confirmError = validateField('confirm', form.confirm, { ...form, password: value });
          if (confirmError) {
            newErrors.confirm = confirmError;
          } else {
            delete newErrors.confirm;
          }
        }
        
        return newErrors;
      });
    }
  }, [form, touched, validateField]);

  const handleBlur = useCallback((name) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, form[name], form);
    setErrors(prev => {
      const newErrors = { ...prev };
      if (error) {
        newErrors[name] = error;
      } else {
        delete newErrors[name];
      }
      return newErrors;
    });
    if (name === 'email' && !error) {
      authAPI.checkEmail(normalizeEmail(form.email)).then((res) => {
        if (!res.data.available) {
          setErrors((prev) => ({ ...prev, email: res.data.message || EMAIL_TAKEN_MESSAGE }));
        }
      }).catch(() => {});
    }
  }, [form, validateField]);

  const validate = () => {
    const errs = {};
    Object.keys(form).forEach(key => {
      const error = validateField(key, form[key], form);
      if (error) errs[key] = error;
    });
    setErrors(errs);
    setTouched({ name: true, email: true, phone: true, password: true, confirm: true });
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Please fix the errors before submitting');
      return;
    }
    setLoading(true);
    try {
      const user = await register({ 
        name: form.name.trim(), 
        email: normalizeEmail(form.email), 
        phone: form.phone.trim(), 
        password: form.password 
      });
      toast.success(`Welcome to Green Roots, ${user.name}!`);
      navigate('/');
    } catch (err) {
      const message = err.response?.data?.message;
      if (message) setErrors((prev) => ({ ...prev, email: message }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">GR</div>
          <h1 className="text-3xl font-display font-bold text-gray-900">Create Account</h1>
          <p className="text-gray-500 mt-2">Join Green Roots and start growing</p>
        </div>

        <div className="bg-white rounded-2xl shadow-card p-8">
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Full Name */}
            <div>
              <label htmlFor="name" className="label">Full Name</label>
              <input 
                id="name"
                type="text" 
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
                onBlur={() => handleBlur('name')}
                className={`input ${errors.name ? 'input-error' : ''}`}
                placeholder="Your name" 
                autoComplete="name"
              />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>

            {/* Email Address */}
            <div>
              <label htmlFor="email" className="label">Email Address</label>
              <input 
                id="email"
                type="email" 
                value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
                onBlur={() => handleBlur('email')}
                className={`input ${errors.email ? 'input-error' : ''}`}
                placeholder="you@example.com" 
                autoComplete="email"
              />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>

            {/* Mobile Number */}
            <div>
              <label htmlFor="phone" className="label">Mobile Number <span className="text-gray-400 font-normal">(optional)</span></label>
              <input 
                id="phone"
                type="tel" 
                value={form.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                onBlur={() => handleBlur('phone')}
                className={`input ${errors.phone ? 'input-error' : ''}`}
                placeholder="10-digit number" 
                autoComplete="tel"
              />
              {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="label">Password</label>
              <div className="relative">
                <input 
                  id="password"
                  type={showPass ? 'text' : 'password'} 
                  value={form.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  onBlur={() => handleBlur('password')}
                  className={`input pr-10 ${errors.password ? 'input-error' : ''}`}
                  placeholder="Min 8 chars, upper+lower+number" 
                  autoComplete="new-password"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  {showPass ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirm" className="label">Confirm Password</label>
              <div className="relative">
                <input 
                  id="confirm"
                  type={showConfirmPass ? 'text' : 'password'} 
                  value={form.confirm}
                  onChange={(e) => handleChange('confirm', e.target.value)}
                  onBlur={() => handleBlur('confirm')}
                  className={`input pr-10 ${errors.confirm ? 'input-error' : ''}`}
                  placeholder="Re-enter password" 
                  autoComplete="new-password"
                />
                <button 
                  type="button" 
                  onClick={() => setShowConfirmPass(!showConfirmPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  {showConfirmPass ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                </button>
              </div>
              {errors.confirm && <p className="text-xs text-red-500 mt-1">{errors.confirm}</p>}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-6">
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 font-medium hover:underline">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
