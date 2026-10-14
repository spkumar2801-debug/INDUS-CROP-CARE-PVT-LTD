import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Sprout, 
  PlusCircle, 
  Image as ImageIcon, 
  Inbox, 
  Settings, 
  LogOut, 
  ExternalLink,
  Menu,
  X,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AdminNav: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/products', icon: Sprout, label: 'All Products' },
    { to: '/admin/products/new', icon: PlusCircle, label: 'Add New Product' },
    { to: '/admin/gallery', icon: ImageIcon, label: 'Image Gallery' },
    { to: '/admin/enquiries', icon: Inbox, label: 'Customer Enquiries' },
    { to: '/admin/settings', icon: Settings, label: 'Site Settings' },
  ];

  return (
    <>
      {/* 1. Mobile Header (Compact 58px top bar, visible only on < 992px) */}
      <header className="admin-mobile-header" aria-label="Admin Navigation Header">
        <div className="admin-mobile-header-brand">
          <div className="admin-mobile-logo-frame">
            <img 
              src="/images/branding/indus/indus-emblem-transparent.png" 
              alt="Indus Crop Care Logo" 
              className="admin-mobile-logo-img"
            />
          </div>
          <span className="admin-mobile-header-title">Indus Crop Care Portal</span>
        </div>

        <div className="admin-mobile-header-actions">
          <Link 
            to="/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="admin-mobile-icon-btn"
            title="View Public Website"
            aria-label="View Public Website"
          >
            <ExternalLink size={18} />
          </Link>

          <button 
            type="button" 
            className="admin-mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      {/* 2. Mobile Drawer Backdrop & Drawer (< 992px) */}
      {mobileMenuOpen && (
        <div 
          className="admin-drawer-overlay" 
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      <div className={`admin-mobile-drawer ${mobileMenuOpen ? 'open' : ''}`} role="dialog" aria-modal="true" aria-label="Admin Navigation Menu">
        <div className="admin-drawer-header">
          <div className="admin-drawer-user-badge">
            <div className="admin-drawer-avatar">
              <ShieldCheck size={18} />
            </div>
            <div>
              <div className="admin-drawer-user-email">{user?.email || 'Administrator'}</div>
              <div className="admin-drawer-user-role">
                {user?.role === 'superadmin' ? 'Super Administrator' : 'Portal Manager'}
              </div>
            </div>
          </div>
          <button 
            type="button" 
            className="admin-drawer-close-btn"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close Navigation Menu"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="admin-drawer-nav" aria-label="Admin Drawer Links">
          {navLinks.map(({ to, icon: Icon, label }) => (
            <Link 
              key={to}
              to={to} 
              className={`admin-nav-item ${isActive(to) ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <Icon size={18} />
              <span>{label}</span>
            </Link>
          ))}
        </nav>

        <div className="admin-drawer-footer">
          <Link 
            to="/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="admin-drawer-link-site"
            onClick={() => setMobileMenuOpen(false)}
          >
            <ExternalLink size={16} />
            <span>View Public Website</span>
          </Link>

          <button 
            type="button" 
            className="admin-logout-btn"
            onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* 3. Desktop Sidebar (Sticky left navigation, visible only on >= 992px) */}
      <aside className="admin-sidebar" aria-label="Desktop Admin Sidebar">
        <div className="admin-brand">
          <div className="admin-brand-logo-frame">
            <img 
              src="/images/branding/indus/indus-emblem-transparent.png" 
              alt="Indus Crop Care" 
            />
          </div>
          <div>
            <h2>Indus Admin</h2>
            <span className="admin-brand-sub">
              {user?.role === 'superadmin' ? 'Super Administrator' : 'Portal Manager'}
            </span>
          </div>
        </div>

        <nav className="admin-nav" aria-label="Admin Navigation Links">
          {navLinks.map(({ to, icon: Icon, label }) => (
            <Link 
              key={to}
              to={to} 
              className={`admin-nav-item ${isActive(to) ? 'active' : ''}`}
            >
              <Icon size={18} />
              <span>{label}</span>
            </Link>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <Link 
            to="/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="admin-sidebar-ext-link"
          >
            <ExternalLink size={16} />
            <span>View Public Site</span>
          </Link>

          <button 
            type="button" 
            className="admin-logout-btn"
            onClick={handleLogout}
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
