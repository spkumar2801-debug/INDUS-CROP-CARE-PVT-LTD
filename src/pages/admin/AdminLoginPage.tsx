import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, AlertCircle, ArrowLeft, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AdminLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { user, login } = useAuth();
  const navigate = useNavigate();

  // If already authenticated, redirect immediately to dashboard
  useEffect(() => {
    if (user) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Form validation
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError('Please enter your administrator email address.');
      return;
    }
    if (!password) {
      setError('Please enter your secure password.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      await login(trimmedEmail, password);
      navigate('/admin/dashboard', { replace: true });
    } catch (err: any) {
      console.error('Login error:', err);
      // Clean readable Firebase auth errors
      const msg = err?.message || '';
      if (msg.includes('user-not-found') || msg.includes('wrong-password') || msg.includes('invalid-credential')) {
        setError('Invalid administrator email or password. Please verify credentials.');
      } else if (msg.includes('too-many-requests')) {
        setError('Too many failed attempts. Access temporarily restricted. Try again later.');
      } else {
        setError(msg || 'Authentication failed. Please check your network and credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-wrapper">
      <div className="admin-login-card" role="region" aria-label="Administrator Authentication">
        
        {/* Brand Header */}
        <div className="admin-login-header">
          <div className="admin-login-logo-box">
            <img 
              src="/images/branding/indus/indus-logo.png" 
              alt="Indus Crop Care Pvt Ltd" 
              className="admin-login-logo-img"
            />
          </div>
          <h1 className="admin-login-title">
            Administrator Login
          </h1>
          <p className="admin-login-subtitle">
            Authorized management portal for Indus Crop Care Pvt. Ltd.
          </p>
        </div>

        {/* Validation / Auth Error Box */}
        {error && (
          <div className="admin-auth-error" role="alert" aria-live="polite">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} noValidate>
          
          {/* Email Field */}
          <div className="admin-form-group">
            <label className="admin-form-label" htmlFor="admin-email">
              Administrator Email <span className="req">*</span>
            </label>
            <div className="admin-input-wrap">
              <Mail size={18} className="admin-input-icon" aria-hidden="true" />
              <input 
                type="email" 
                id="admin-email"
                name="email"
                className="admin-form-input"
                placeholder="admin@indasagriseeds.com"
                value={email}
                onChange={e => {
                  setEmail(e.target.value);
                  if (error) setError(null);
                }}
                required
                autoComplete="email"
                autoFocus
                disabled={loading}
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="admin-form-group">
            <label className="admin-form-label" htmlFor="admin-password">
              Secure Password <span className="req">*</span>
            </label>
            <div className="admin-input-wrap">
              <Lock size={18} className="admin-input-icon" aria-hidden="true" />
              <input 
                type={showPassword ? 'text' : 'password'} 
                id="admin-password"
                name="password"
                className="admin-form-input has-toggle"
                placeholder="Enter password"
                value={password}
                onChange={e => {
                  setPassword(e.target.value);
                  if (error) setError(null);
                }}
                required
                autoComplete="current-password"
                disabled={loading}
              />
              <button 
                type="button" 
                className="admin-password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            className="btn-admin-login"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="spinner" />
                <span>Verifying Credentials...</span>
              </>
            ) : (
              <>
                <Lock size={18} />
                <span>Sign In to Admin Portal</span>
              </>
            )}
          </button>

        </form>

        {/* Back Link */}
        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <Link 
            to="/" 
            style={{ 
              fontSize: '0.88rem', 
              color: '#0E6B38', 
              fontWeight: 600, 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '6px',
              textDecoration: 'none'
            }}
          >
            <ArrowLeft size={16} />
            <span>Return to Public Website</span>
          </Link>
        </div>

      </div>
    </div>
  );
};
