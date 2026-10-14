import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { X, Home, Info, Sprout, Image, Phone, MessageSquareShare } from 'lucide-react';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenQuoteModal: () => void;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose, onOpenQuoteModal }) => {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <>
      <div 
        className={`mobile-drawer-overlay ${isOpen ? 'open' : ''}`} 
        onClick={onClose}
        aria-hidden="true"
      />
      <div className={`mobile-drawer ${isOpen ? 'open' : ''}`} role="dialog" aria-modal="true" aria-label="Mobile Navigation">
        <div className="mobile-drawer-header">
          <div className="brand-logo-frame" style={{ padding: '4px 10px', background: '#FFFFFF', borderRadius: '8px' }}>
            <img 
              src="/images/branding/indus/indus-logo.png" 
              alt="Indus Crop Care Logo" 
              style={{ height: '36px', width: 'auto', objectFit: 'contain', display: 'block' }}
            />
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="modal-close-btn"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="mobile-nav-links">
          <Link 
            to="/" 
            className={`mobile-nav-link ${isActive('/') ? 'active' : ''}`}
            onClick={onClose}
          >
            <Home size={18} />
            <span>Home</span>
          </Link>
          <Link 
            to="/about" 
            className={`mobile-nav-link ${isActive('/about') ? 'active' : ''}`}
            onClick={onClose}
          >
            <Info size={18} />
            <span>About Us</span>
          </Link>
          <Link 
            to="/products" 
            className={`mobile-nav-link ${isActive('/products') ? 'active' : ''}`}
            onClick={onClose}
          >
            <Sprout size={18} />
            <span>Products</span>
          </Link>
          <Link 
            to="/gallery" 
            className={`mobile-nav-link ${isActive('/gallery') ? 'active' : ''}`}
            onClick={onClose}
          >
            <Image size={18} />
            <span>Gallery</span>
          </Link>
          <Link 
            to="/contact" 
            className={`mobile-nav-link ${isActive('/contact') ? 'active' : ''}`}
            onClick={onClose}
          >
            <Phone size={18} />
            <span>Contact</span>
          </Link>
        </nav>

        <div className="mobile-drawer-footer">
          <button 
            type="button" 
            className="btn btn-whatsapp" 
            style={{ width: '100%' }}
            onClick={onOpenQuoteModal}
          >
            <MessageSquareShare size={18} />
            <span>Customer Care & WhatsApp</span>
          </button>
          
          <div style={{ textAlign: 'center', marginTop: '10px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
              Indus Crop Care Pvt. Ltd. (15+ Years)
            </span>
          </div>
        </div>
      </div>
    </>
  );
};
