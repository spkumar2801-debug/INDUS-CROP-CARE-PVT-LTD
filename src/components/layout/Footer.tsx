import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, ShieldCheck, MapPin, Lock, MessageSquareShare, Phone, ArrowUpRight } from 'lucide-react';
import { useSiteSettings } from '../../context/SettingsContext';

interface FooterProps {
  onOpenQuoteModal?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenQuoteModal: _onOpenQuoteModal }) => {
  const { customerCareNumber, displayFormattedNumber, handleCustomerCareWhatsApp } = useSiteSettings();

  return (
    <footer style={{ backgroundColor: 'var(--color-forest-950)', color: 'var(--color-sage-200)', paddingTop: 'clamp(56px, 7vw, 80px)', paddingBottom: 'calc(48px + env(safe-area-inset-bottom, 0px))', marginTop: 'auto', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
      <div className="container">
        
        {/* Main 4-Column Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))', gap: 'clamp(28px, 4vw, 44px)', marginBottom: '50px' }}>
          
          {/* Column 1: Brand & Legacy */}
          <div>
            <div style={{ background: '#FFFFFF', padding: '6px 16px', borderRadius: '10px', display: 'inline-block', marginBottom: '20px', boxShadow: '0 4px 14px rgba(0,0,0,0.2)' }}>
              <img 
                src="/images/branding/indus/indus-logo.png" 
                alt="Indus Crop Care Pvt. Ltd." 
                style={{ height: '44px', width: 'auto', display: 'block' }}
                loading="lazy"
              />
            </div>
            
            <p style={{ fontSize: '0.9rem', lineHeight: '1.65', color: 'var(--color-sage-300)', marginBottom: '18px' }}>
              Indus Crop Care Pvt. Ltd. is a renowned agri-input enterprise with an established track record of over 15 years in agricultural science — empowering farmers with high-potency crop protection and plant nutrition.
            </p>

            <div style={{ padding: '8px 14px', background: 'rgba(255, 224, 130, 0.08)', borderRadius: '6px', borderLeft: '3px solid var(--color-gold-400)', display: 'inline-block', marginBottom: '16px' }}>
              <span className="telugu-quote" style={{ color: '#FFE082', fontSize: '0.92rem' }}>
                రైతన్నకు భరోసా.. ఇండస్ ఉత్పాదనలు
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-sage-300)', fontSize: '0.84rem' }}>
              <ShieldCheck size={18} style={{ color: 'var(--color-action-green)' }} />
              <span>ISO 9001:2015 Certified Manufacturing</span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 style={{ color: '#FFFFFF', fontSize: '1.05rem', fontWeight: 700, marginBottom: '20px', letterSpacing: '0.02em' }}>
              Quick Navigation
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '11px', fontSize: '0.9rem', padding: 0 }}>
              <li>
                <Link to="/" style={{ color: 'var(--color-sage-300)', display: 'inline-flex', alignItems: 'center', gap: '6px', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = '#FFFFFF'} onMouseOut={e => e.currentTarget.style.color = 'var(--color-sage-300)'}>
                  <span>Home</span>
                </Link>
              </li>
              <li>
                <Link to="/about" style={{ color: 'var(--color-sage-300)', display: 'inline-flex', alignItems: 'center', gap: '6px', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = '#FFFFFF'} onMouseOut={e => e.currentTarget.style.color = 'var(--color-sage-300)'}>
                  <span>About Us & Leadership</span>
                </Link>
              </li>
              <li>
                <Link to="/products" style={{ color: 'var(--color-sage-300)', display: 'inline-flex', alignItems: 'center', gap: '6px', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = '#FFFFFF'} onMouseOut={e => e.currentTarget.style.color = 'var(--color-sage-300)'}>
                  <span>Complete Product Catalogue (105+)</span>
                </Link>
              </li>
              <li>
                <Link to="/gallery" style={{ color: 'var(--color-sage-300)', display: 'inline-flex', alignItems: 'center', gap: '6px', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = '#FFFFFF'} onMouseOut={e => e.currentTarget.style.color = 'var(--color-sage-300)'}>
                  <span>Field Trials & Gallery</span>
                </Link>
              </li>
              <li>
                <Link to="/contact" style={{ color: 'var(--color-sage-300)', display: 'inline-flex', alignItems: 'center', gap: '6px', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = '#FFFFFF'} onMouseOut={e => e.currentTarget.style.color = 'var(--color-sage-300)'}>
                  <span>Contact & Dealership Network</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Product Categories */}
          <div>
            <h4 style={{ color: '#FFFFFF', fontSize: '1.05rem', fontWeight: 700, marginBottom: '20px', letterSpacing: '0.02em' }}>
              Catalogue Spectrum
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px' }}>
              {[
                'Insecticides', 
                'Herbicides', 
                'Fungicides', 
                'Organic Fertilizers', 
                'Water-Soluble Fertilizers', 
                'Biofertilizers', 
                'Micronutrients / Nutrients', 
                'Biostimulants', 
                'Seeds', 
                'Antibiotic Products', 
                'PGR (Plant Growth Regulators)'
              ].map((cat, idx) => (
                <Link 
                  key={idx} 
                  to={`/products?category=${encodeURIComponent(cat)}`}
                  style={{ 
                    fontSize: '0.78rem', 
                    padding: '5px 11px', 
                    background: 'rgba(255, 255, 255, 0.05)', 
                    borderRadius: 'var(--radius-pill)',
                    color: 'var(--color-sage-200)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseOver={e => {
                    e.currentTarget.style.backgroundColor = 'rgba(37, 211, 102, 0.15)';
                    e.currentTarget.style.borderColor = 'rgba(37, 211, 102, 0.35)';
                    e.currentTarget.style.color = '#FFFFFF';
                  }}
                  onMouseOut={e => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                    e.currentTarget.style.color = 'var(--color-sage-200)';
                  }}
                >
                  {cat}
                </Link>
              ))}
            </div>
          </div>

          {/* Column 4: Contact & Statutory Desks */}
          <div>
            <h4 style={{ color: '#FFFFFF', fontSize: '1.05rem', fontWeight: 700, marginBottom: '20px', letterSpacing: '0.02em' }}>
              Official Communication
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.88rem' }}>
              
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <MapPin size={17} style={{ color: 'var(--color-gold-400)', flexShrink: 0, marginTop: '3px' }} />
                <div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--color-sage-400)', fontWeight: 700, textTransform: 'uppercase' }}>Corporate Office</div>
                  <span style={{ color: 'var(--color-sage-200)', fontSize: '0.84rem', lineHeight: '1.45' }}>
                    Apple Avenues, Plot No. 50, Peddaamberpet, Near ORR–Vijayawada Highway, Beside Indian Oil Petrol Pump, Pincode 501505
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <Phone size={17} style={{ color: 'var(--color-gold-400)', flexShrink: 0, marginTop: '3px' }} />
                <div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--color-sage-400)', fontWeight: 700, textTransform: 'uppercase' }}>Telephone & Mobile</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginTop: '2px' }}>
                    <a href="tel:04024110478" style={{ color: '#FFFFFF', fontWeight: 700 }}>
                      040-24110478
                    </a>
                    <a href={`tel:+${customerCareNumber || '918886069143'}`} style={{ color: '#FFFFFF', fontWeight: 700 }}>
                      {displayFormattedNumber || '+91 88860 69143'}
                    </a>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <Mail size={17} style={{ color: 'var(--color-gold-400)', flexShrink: 0, marginTop: '3px' }} />
                <div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--color-sage-400)', fontWeight: 700, textTransform: 'uppercase' }}>Official Email</div>
                  <a 
                    href="mailto:info@induscropcare.com" 
                    style={{ color: '#FFFFFF', textDecoration: 'underline' }}
                  >
                    info@induscropcare.com
                  </a>
                </div>
              </div>

              <button 
                type="button" 
                className="btn btn-whatsapp btn-sm" 
                style={{ marginTop: '6px', alignSelf: 'flex-start' }}
                onClick={() => handleCustomerCareWhatsApp()}
              >
                <MessageSquareShare size={15} />
                <span>WhatsApp Customer Care</span>
              </button>
            </div>
          </div>

        </div>

        {/* Certifications Bar Ribbon */}
        <div style={{ background: '#FFFFFF', borderRadius: '12px', padding: '14px 20px', marginBottom: '36px', display: 'flex', justifyContent: 'center', alignItems: 'center', overflowX: 'auto', boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}>
          <img 
            src="/images/branding/indus/certifications-bar.png" 
            alt="FCO Registered, Central CIB Registered, Certified ISO 9001:2015, PMMA, BIPA" 
            style={{ maxHeight: '42px', width: 'auto', maxWidth: '100%', objectFit: 'contain' }}
            loading="lazy"
          />
        </div>

        {/* Bottom Bar: Copyright & Admin Portal */}
        <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '22px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px', fontSize: '0.84rem', color: 'var(--color-sage-400)' }}>
          <div>
            © 2026 Indus Crop Care Pvt. Ltd. All rights reserved. | <a href="https://www.induscropcare.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-sage-200)', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>www.induscropcare.com <ArrowUpRight size={13} /></a>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--color-sage-300)' }}>
              <ShieldCheck size={15} style={{ color: 'var(--color-action-green)' }} />
              Science For Sustainability
            </span>
            <Link 
              to="/admin/login" 
              style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: 'var(--color-sage-400)', transition: 'color 0.2s' }}
              onMouseOver={e => e.currentTarget.style.color = '#FFFFFF'}
              onMouseOut={e => e.currentTarget.style.color = 'var(--color-sage-400)'}
              title="Admin Portal Login"
            >
              <Lock size={13} />
              <span>Admin Portal</span>
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
};
