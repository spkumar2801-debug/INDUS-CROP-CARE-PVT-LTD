import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, ShieldCheck, MapPin, Lock, MessageSquareShare, Phone } from 'lucide-react';
import { useSiteSettings } from '../../context/SettingsContext';

interface FooterProps {
  onOpenQuoteModal?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenQuoteModal: _onOpenQuoteModal }) => {
  const { customerCareNumber, displayFormattedNumber, handleCustomerCareWhatsApp } = useSiteSettings();

  return (
    <footer style={{ backgroundColor: '#071F11', color: '#D2E3D5', paddingTop: '70px', paddingBottom: '30px', marginTop: 'auto', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: '40px', marginBottom: '50px' }}>
          
          {/* Column 1: Brand & Legacy */}
          <div>
            <div style={{ background: '#FFFFFF', padding: '6px 14px', borderRadius: '8px', display: 'inline-block', marginBottom: '18px' }}>
              <img 
                src="/images/branding/indus/indus-logo.png" 
                alt="Indus Crop Care Pvt. Ltd." 
                style={{ height: '46px', width: 'auto', display: 'block' }}
              />
            </div>
            <p style={{ fontSize: '0.9rem', lineHeight: '1.6', color: '#B5CEB9', marginBottom: '16px' }}>
              Indus Crop Care Pvt. Ltd. is a renowned agri-input company with a proven track record of over 15 years in the agricultural industry. Empowering farmers to optimize yields, reduce costs, and improve livelihoods.
            </p>
            <div style={{ padding: '8px 12px', background: 'rgba(255, 255, 255, 0.06)', borderRadius: '6px', borderLeft: '3px solid var(--color-harvest-gold)', display: 'inline-block', marginBottom: '14px' }}>
              <span className="telugu-quote" style={{ color: '#FFE082', fontSize: '0.95rem' }}>
                రైతన్నకు భరోసా.. ఇండస్ ఉత్పాదనలు
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#A3C2A7', fontSize: '0.85rem' }}>
              <ShieldCheck size={18} style={{ color: 'var(--color-sprout-green)' }} />
              <span>ISO 9001:2015 Certified Company</span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 style={{ color: '#FFFFFF', fontSize: '1.1rem', marginBottom: '20px', letterSpacing: '0.03em' }}>
              Quick Links
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem', padding: 0 }}>
              <li>
                <Link to="/" style={{ color: '#B5CEB9', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = '#FFFFFF'} onMouseOut={e => e.currentTarget.style.color = '#B5CEB9'}>
                  › Home
                </Link>
              </li>
              <li>
                <Link to="/about" style={{ color: '#B5CEB9', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = '#FFFFFF'} onMouseOut={e => e.currentTarget.style.color = '#B5CEB9'}>
                  › About Us & Leadership
                </Link>
              </li>
              <li>
                <Link to="/products" style={{ color: '#B5CEB9', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = '#FFFFFF'} onMouseOut={e => e.currentTarget.style.color = '#B5CEB9'}>
                  › Complete Product Catalogue
                </Link>
              </li>
              <li>
                <Link to="/gallery" style={{ color: '#B5CEB9', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = '#FFFFFF'} onMouseOut={e => e.currentTarget.style.color = '#B5CEB9'}>
                  › Field Gallery & Demonstrations
                </Link>
              </li>
              <li>
                <Link to="/contact" style={{ color: '#B5CEB9', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = '#FFFFFF'} onMouseOut={e => e.currentTarget.style.color = '#B5CEB9'}>
                  › Contact & Dealer Network
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Product Categories */}
          <div>
            <h4 style={{ color: '#FFFFFF', fontSize: '1.1rem', marginBottom: '20px', letterSpacing: '0.03em' }}>
              Catalogue Categories
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {[
                'Insecticides', 
                'Herbicides', 
                'Fungicides', 
                'Plant Growth Regulator (PGR)', 
                'Organic Fertilizers', 
                'Micro Nutrients', 
                'Water Soluble Fertilizers', 
                'Bio Fertilizers', 
                'Bio Stimulants', 
                'Antibiotic Products', 
                'Micronutrients Combo',
                'Hybrid Seeds'
              ].map((cat, idx) => (
                <span 
                  key={idx} 
                  style={{ 
                    fontSize: '0.78rem', 
                    padding: '4px 10px', 
                    background: 'rgba(255, 255, 255, 0.08)', 
                    borderRadius: '4px',
                    color: '#C6DEC9',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}
                >
                  {cat}
                </span>
              ))}
            </div>
          </div>

          {/* Column 4: Contact & Offices */}
          <div>
            <h4 style={{ color: '#FFFFFF', fontSize: '1.1rem', marginBottom: '20px', letterSpacing: '0.03em' }}>
              Official Contact
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.88rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <MapPin size={18} style={{ color: 'var(--color-harvest-gold)', flexShrink: 0, marginTop: '3px' }} />
                <div>
                  <div style={{ fontSize: '0.78rem', color: '#88A88E', fontWeight: 600 }}>Corporate Office</div>
                  <span style={{ color: '#DCE7DE', fontSize: '0.84rem', lineHeight: '1.4' }}>
                    Apple Avenues, Plot No. 50, Peddaamberpet, Near ORR–Vijayawada Highway, Beside Indian Oil Petrol Pump, Pincode 501505
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <MapPin size={18} style={{ color: 'var(--color-harvest-gold)', flexShrink: 0, marginTop: '3px' }} />
                <div>
                  <div style={{ fontSize: '0.78rem', color: '#88A88E', fontWeight: 600 }}>Registered Office</div>
                  <span style={{ color: '#DCE7DE', fontSize: '0.84rem', lineHeight: '1.4' }}>
                    Sy. No. 627/E1, D. No. 17-88/3, Narayanagiri Road, Bhoodhan Pochampally (V&M), Yadadri, Bhuvanagiri Dist, Telangana – 508284
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <Phone size={18} style={{ color: 'var(--color-harvest-gold)', flexShrink: 0, marginTop: '3px' }} />
                <div>
                  <div style={{ fontSize: '0.78rem', color: '#88A88E', fontWeight: 600 }}>Telephone & Mobile</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <a href="tel:04024110478" style={{ color: '#FFFFFF', fontWeight: 600 }}>
                      040-24110478
                    </a>
                    <a href={`tel:+${customerCareNumber || '918886069143'}`} style={{ color: '#FFFFFF', fontWeight: 600 }}>
                      {displayFormattedNumber || '+91 88860 69143'}
                    </a>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <Mail size={18} style={{ color: 'var(--color-harvest-gold)', flexShrink: 0, marginTop: '3px' }} />
                <div>
                  <div style={{ fontSize: '0.78rem', color: '#88A88E', fontWeight: 600 }}>Official Email</div>
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
                style={{ marginTop: '8px', alignSelf: 'flex-start' }}
                onClick={() => handleCustomerCareWhatsApp()}
              >
                <MessageSquareShare size={16} />
                <span>WhatsApp Customer Care</span>
              </button>
            </div>
          </div>

        </div>

        {/* Certifications Bar */}
        <div style={{ background: '#FFFFFF', borderRadius: '12px', padding: '16px 20px', marginBottom: '35px', display: 'flex', justifyContent: 'center', alignItems: 'center', overflowX: 'auto' }}>
          <img 
            src="/images/branding/indus/certifications-bar.png" 
            alt="FCO Registered, Central CIB Registered, Certified ISO 9001:2015, PMMA, BIPA Bioagri Input Producers Association" 
            style={{ maxHeight: '48px', width: 'auto', maxWidth: '100%', objectFit: 'contain' }}
          />
        </div>

        {/* Bottom Bar */}
        <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.12)', paddingTop: '24px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px', fontSize: '0.85rem', color: '#8CAE93' }}>
          <div>
            © 2026 Indus Crop Care Pvt. Ltd. All rights reserved. | <a href="https://www.induscropcare.com" target="_blank" rel="noopener noreferrer" style={{ color: '#A3C2A7' }}>www.induscropcare.com</a>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={16} style={{ color: 'var(--color-sprout-green)' }} />
              Science For Sustainability
            </span>
            <Link 
              to="/admin/login" 
              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#7E9F85' }}
              title="Admin Content Management Portal"
            >
              <Lock size={14} />
              <span>Admin Portal</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
