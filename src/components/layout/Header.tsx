import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, MessageSquareShare } from 'lucide-react';
import { MobileMenu } from './MobileMenu';
import { useSiteSettings } from '../../context/SettingsContext';

interface HeaderProps {
  onOpenQuoteModal?: () => void;
}

export const Header: React.FC<HeaderProps> = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { handleCustomerCareWhatsApp } = useSiteSettings();

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
      <header className="site-header">
        <div className="container header-container">
          {/* Brand Logo */}
          <Link to="/" className="brand-logo-link" aria-label="Indus Crop Care Home">
            <div className="brand-logo-frame">
              <img 
                src="/images/branding/indus/indus-logo.png" 
                alt="Indus Crop Care Pvt. Ltd. Logo" 
                className="brand-logo-img"
                width={84}
                height={38}
                loading="eager"
                decoding="async"
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="nav-desktop" aria-label="Main Navigation">
            <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
              Home
            </Link>
            <Link to="/about" className={`nav-link ${isActive('/about') ? 'active' : ''}`}>
              About Us
            </Link>
            <Link to="/products" className={`nav-link ${isActive('/products') ? 'active' : ''}`}>
              Products
            </Link>
            <Link to="/gallery" className={`nav-link ${isActive('/gallery') ? 'active' : ''}`}>
              Gallery
            </Link>
            <Link to="/contact" className={`nav-link ${isActive('/contact') ? 'active' : ''}`}>
              Contact
            </Link>
          </nav>

          {/* Action CTAs */}
          <div className="header-actions">
            {/* Desktop Customer Care */}
            <button 
              type="button" 
              className="btn btn-nav-quote"
              onClick={handleContactAction}
              title="Official Customer Care & WhatsApp Desk"
            >
              <MessageSquareShare size={18} />
              <span>Customer Care</span>
            </button>

            {/* Mobile Compact Contact Action */}
            <button 
              type="button" 
              className="mobile-contact-action"
              onClick={handleContactAction}
              aria-label="Official Customer Care & WhatsApp"
              title="Customer Care"
            >
              <MessageSquareShare size={19} />
            </button>

            {/* Mobile Menu Toggle Button */}
            <button 
              type="button" 
              className="mobile-menu-toggle"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open mobile navigation menu"
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </header>

      {/* Fixed header layout spacer preventing any content shift or overlap */}
      <div className="site-header-spacer" aria-hidden="true" />

      {/* Mobile Drawer */}
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
