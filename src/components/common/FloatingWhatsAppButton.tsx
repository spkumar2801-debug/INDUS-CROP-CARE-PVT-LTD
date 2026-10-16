import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useSiteSettings } from '../../context/SettingsContext';

export const FloatingWhatsAppButton: React.FC = () => {
  const location = useLocation();
  const { customerCareNumber } = useSiteSettings();
  const [isVisible, setIsVisible] = useState(false);

  // Clean target number (India: 918886069143)
  const phone = customerCareNumber || '918886069143';
  const cleanPhone = phone.replace(/\D/g, '');
  const finalPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

  // Staggered entrance after page load to avoid competing with hero entrance
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  // Do not render on protected admin dashboard screens
  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  const defaultMessage = encodeURIComponent(
    'Hello Indus Crop Care, I would like to enquire about your agricultural products and formulations.'
  );
  const whatsappUrl = `https://wa.me/${finalPhone}?text=${defaultMessage}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`floating-whatsapp-btn ${isVisible ? 'is-visible' : ''}`}
      aria-label="Chat with Indus Crop Care on WhatsApp"
      title="Chat with Indus Crop Care on WhatsApp"
    >
      <span className="floating-whatsapp-ripple" aria-hidden="true" />
      {/* Official WhatsApp Brand Icon SVG */}
      <svg
        viewBox="0 0 32 32"
        width="27"
        height="27"
        fill="#FFFFFF"
        aria-hidden="true"
        className="floating-whatsapp-icon"
      >
        <path d="M16.02 2C8.28 2 2 8.28 2 16.02c0 2.6.7 5.04 1.93 7.15L2 30l7.04-1.85a13.97 13.97 0 0 0 6.98 1.87h.01c7.74 0 14.02-6.28 14.02-14.02 0-3.75-1.46-7.27-4.11-9.92A13.93 13.93 0 0 0 16.02 2zm0 25.68c-2.22 0-4.39-.6-6.28-1.72l-.45-.27-4.66 1.22 1.25-4.54-.29-.47a11.66 11.66 0 0 1-1.78-6.18c0-6.45 5.25-11.7 11.71-11.7 3.13 0 6.07 1.22 8.28 3.44 2.22 2.21 3.44 5.16 3.44 8.28 0 6.46-5.25 11.68-11.72 11.68zm6.42-8.77c-.35-.18-2.08-1.03-2.4-1.15-.33-.12-.56-.18-.8.18-.23.35-.91 1.15-1.12 1.39-.21.23-.42.26-.77.09-.35-.18-1.49-.55-2.84-1.75-1.05-.93-1.75-2.09-1.96-2.44-.21-.35-.02-.54.15-.71.16-.16.35-.42.53-.63.18-.21.23-.35.35-.59.12-.23.06-.44-.03-.62-.09-.18-.8-1.93-1.1-2.64-.29-.7-.59-.6-.8-.61-.21-.01-.44-.01-.67-.01-.24 0-.62.09-.94.44-.33.35-1.25 1.22-1.25 2.98s1.28 3.46 1.46 3.7c.18.23 2.52 3.85 6.1 5.4 3.59 1.55 3.59 1.03 4.24.97.65-.06 2.08-.85 2.38-1.67.29-.83.29-1.53.21-1.68-.09-.14-.32-.23-.68-.4z" />
      </svg>
    </a>
  );
};
