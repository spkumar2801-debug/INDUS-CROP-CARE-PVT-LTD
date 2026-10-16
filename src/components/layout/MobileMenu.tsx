import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  X, 
  Home, 
  Info, 
  Sprout, 
  Image as ImageIcon, 
  Phone, 
  MessageSquareShare, 
  ShieldCheck, 
  Lock,
  ChevronRight
} from 'lucide-react';
import { useSiteSettings } from '../../context/SettingsContext';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenQuoteModal: () => void;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose, onOpenQuoteModal }) => {
  const location = useLocation();
  const { customerCareNumber, displayFormattedNumber } = useSiteSettings();

  // Lock background scrolling when menu is open & handle Escape key
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      document.body.classList.add('mobile-menu-open');

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };

      window.addEventListener('keydown', handleKeyDown);

      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.classList.remove('mobile-menu-open');
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, onClose]);

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const navLinks = [
    { to: '/', label: 'Home', icon: <Home size={19} /> },
    { to: '/about', label: 'About Us', icon: <Info size={19} /> },
    { to: '/products', label: 'Product Portfolio', icon: <Sprout size={19} /> },
    { to: '/gallery', label: 'Field Gallery', icon: <ImageIcon size={19} /> },
    { to: '/contact', label: 'Contact & Network', icon: <Phone size={19} /> },
  ];

  return (
    <div 
      className={`mobile-menu-overlay ${isOpen ? 'is-open' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label="Mobile Navigation Menu"
    >
      {/* Backdrop blur click target */}
      <div className="mobile-menu-backdrop" onClick={onClose} aria-hidden="true" />

      {/* Drawer Container with safe-area insets */}
      <div className="mobile-menu-container">
        
        {/* Drawer Header */}
        <div className="mobile-menu-header">
          <Link to="/" onClick={onClose} className="mobile-brand-link">
            <div className="brand-logo-frame">
              <img 
                src="/images/branding/indus/indus-logo.png" 
                alt="Indus Crop Care Logo" 
                style={{ height: '36px', width: 'auto', objectFit: 'contain', display: 'block' }}
              />
            </div>
          </Link>

          <button 
            type="button" 
            onClick={onClose} 
            className="mobile-close-btn"
            aria-label="Close navigation menu"
          >
            <X size={22} />
          </button>
        </div>

        {/* Telugu Brand Motto Banner */}
        <div className="mobile-menu-telugu-banner">
          <span>రైతన్నకు భరోసా.. ఇండస్ ఉత్పాదనలు</span>
        </div>

        {/* Staggered Navigation Links */}
        <nav className="mobile-menu-nav" aria-label="Mobile Links">
          {navLinks.map((link, idx) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={onClose}
              className={`mobile-nav-item ${isActive(link.to) ? 'active' : ''} stagger-${idx + 1}`}
            >
              <div className="mobile-nav-item-icon">
                {link.icon}
              </div>
              <span className="mobile-nav-item-label">{link.label}</span>
              <ChevronRight size={16} className="mobile-nav-item-arrow" />
            </Link>
          ))}
        </nav>

        {/* Contact & Advisory Desk Actions */}
        <div className="mobile-menu-footer">
          <a 
            href={`tel:+${customerCareNumber || '918886069143'}`}
            className="mobile-call-action"
          >
            <div className="mobile-call-icon">
              <Phone size={16} />
            </div>
            <div>
              <div className="mobile-call-sub">Direct Customer Support</div>
              <div className="mobile-call-num">{displayFormattedNumber || '+91 88860 69143'}</div>
            </div>
          </a>

          <button 
            type="button" 
            className="btn btn-whatsapp" 
            style={{ width: '100%', minHeight: '48px' }}
            onClick={onOpenQuoteModal}
          >
            <MessageSquareShare size={18} />
            <span>WhatsApp Agronomy Desk</span>
          </button>

          {/* Trust Footnote & Admin Link */}
          <div className="mobile-menu-sublinks">
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--color-sage-300)' }}>
              <ShieldCheck size={14} style={{ color: 'var(--color-action-green)' }} />
              <span>ISO 9001:2015 Certified &bull; 15+ Years</span>
            </div>

            <Link 
              to="/admin/login" 
              onClick={onClose}
              className="mobile-admin-link"
              title="Admin Portal Login"
            >
              <Lock size={12} />
              <span>Admin Portal</span>
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
};
