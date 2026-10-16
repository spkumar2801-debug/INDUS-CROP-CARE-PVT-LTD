import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Phone, MessageSquareShare } from 'lucide-react';
import { MobileMenu } from './MobileMenu';
import { useSiteSettings } from '../../context/SettingsContext';

interface HeaderProps {
  onOpenQuoteModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenQuoteModal: _onOpenQuoteModal }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const { customerCareNumber, displayFormattedNumber, handleCustomerCareWhatsApp } = useSiteSettings();

  // Detect scroll to add slight elevation / compact state
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu whenever route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const handleContactAction = () => {
    handleCustomerCareWhatsApp();
  };

  return (
    <>
      <header className={`site-header-wrapper ${isScrolled ? 'is-scrolled' : ''}`}>
        <div className="site-header-pill">
          
          {/* Brand Logo */}
          <Link to="/" className="brand-logo-link" aria-label="Indus Crop Care Home">
            <div className="brand-logo-frame">
              <img 
                src="/images/branding/indus/indus-logo.png" 
                alt="Indus Crop Care Pvt. Ltd." 
                className="brand-logo-img"
                width={92}
                height={40}
                loading="eager"
                decoding="async"
              />
            </div>
          </Link>

          {/* Desktop Navigation with Animated Indicators */}
          <nav className="nav-desktop" aria-label="Main Navigation">
            <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
              <span>Home</span>
              {isActive('/') && <span className="nav-link-indicator" />}
            </Link>
            <Link to="/about" className={`nav-link ${isActive('/about') ? 'active' : ''}`}>
              <span>About Us</span>
              {isActive('/about') && <span className="nav-link-indicator" />}
            </Link>
            <Link to="/products" className={`nav-link ${isActive('/products') ? 'active' : ''}`}>
              <span>Products</span>
              {isActive('/products') && <span className="nav-link-indicator" />}
            </Link>
            <Link to="/gallery" className={`nav-link ${isActive('/gallery') ? 'active' : ''}`}>
              <span>Gallery</span>
              {isActive('/gallery') && <span className="nav-link-indicator" />}
            </Link>
            <Link to="/contact" className={`nav-link ${isActive('/contact') ? 'active' : ''}`}>
              <span>Contact</span>
              {isActive('/contact') && <span className="nav-link-indicator" />}
            </Link>
          </nav>

          {/* Desktop Action Desks */}
          <div className="header-actions-desktop">
            <a 
              href={`tel:+${customerCareNumber || '918886069143'}`} 
              className="btn-header-call"
              aria-label={`Call Indus Crop Care at ${displayFormattedNumber || '+91 88860 69143'}`}
            >
              <Phone size={15} />
              <span>{displayFormattedNumber || '+91 88860 69143'}</span>
            </a>

            <button 
              type="button" 
              className="btn btn-whatsapp btn-sm header-quote-btn"
              onClick={handleContactAction}
              title="Official Customer Care & WhatsApp Desk"
            >
              <MessageSquareShare size={16} />
              <span>WhatsApp Desk</span>
            </button>
          </div>

          {/* Mobile Right Controls: Phone Call + 3-Line Animated Hamburger */}
          <div className="header-actions-mobile">
            <a 
              href={`tel:+${customerCareNumber || '918886069143'}`}
              className="mobile-phone-btn"
              aria-label="Call Indus Crop Care Support"
              title="Call Official Desk"
            >
              <Phone size={17} />
            </a>

            {/* Custom 3-Line Morphing Hamburger Button */}
            <button 
              type="button" 
              className={`hamburger-button ${isMobileMenuOpen ? 'is-active' : ''}`}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-expanded={isMobileMenuOpen}
              aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            >
              <span className="hamburger-line line-1" />
              <span className="hamburger-line line-2" />
              <span className="hamburger-line line-3" />
            </button>
          </div>

        </div>
      </header>

      {/* Matching Document Flow Spacer to Prevent Content Shifts on Subpages */}
      {location.pathname !== '/' && (
        <div className="site-header-spacer" aria-hidden="true" />
      )}

      {/* Mobile Drawer / Overlay Navigation */}
      <MobileMenu 
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        onOpenQuoteModal={() => {
          setIsMobileMenuOpen(false);
          handleContactAction();
        }}
      />
    </>
  );
};
