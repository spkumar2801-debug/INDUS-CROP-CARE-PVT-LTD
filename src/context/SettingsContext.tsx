import React, { createContext, useContext, useEffect, useState } from 'react';
import { SiteSettings } from '../types/settings';
import { getSiteSettings } from '../services/settingsService';
import { normalizePhoneNumber, getDirectProductWhatsAppUrl } from '../lib/whatsapp';
import { Product } from '../types/product';

interface SettingsContextType {
  settings: SiteSettings | null;
  customerCareNumber: string;
  isNumberConfigured: boolean;
  displayFormattedNumber: string;
  handleCustomerCareWhatsApp: (product?: Product | null, customText?: string) => void;
  handleCustomerCareCall: () => void;
  refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  const loadSettings = async () => {
    try {
      const data = await getSiteSettings();
      setSettings(data);
    } catch (e) {
      console.error('Failed to load site settings:', e);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const rawNumber = settings?.customerCareWhatsAppNumber || settings?.whatsappNumber || '';
  const cleanNumber = normalizePhoneNumber(rawNumber);
  const isNumberConfigured = Boolean(cleanNumber && cleanNumber.length >= 10);

  // International display format, e.g. +91 94401 70453 or +<digits>
  const displayFormattedNumber = isNumberConfigured
    ? cleanNumber.startsWith('91') && cleanNumber.length === 12
      ? `+91 ${cleanNumber.slice(2, 7)} ${cleanNumber.slice(7)}`
      : `+${cleanNumber}`
    : '';

  // 1-Click Direct WhatsApp Action (Phase 4 & Phase 5)
  const handleCustomerCareWhatsApp = (product?: Product | null, customText?: string) => {
    if (isNumberConfigured) {
      if (product) {
        const res = getDirectProductWhatsAppUrl(product, cleanNumber);
        if (res.url) {
          window.open(res.url, '_blank', 'noopener,noreferrer');
          return;
        }
      }
      const defaultText = customText || 'Hello Indus Crop Care Pvt. Ltd.,\n\nI would like to inquire about your agricultural products, formulations, pricing, and availability.\n\nThank you.';
      window.open(`https://wa.me/${cleanNumber}?text=${encodeURIComponent(defaultText)}`, '_blank', 'noopener,noreferrer');
    } else {
      // Clear fallback: smoothly scroll to Product Enquiry section with pre-filled product
      const el = document.getElementById('product-enquiry-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  // Direct Phone Call Action
  const handleCustomerCareCall = () => {
    if (isNumberConfigured) {
      window.location.href = `tel:+${cleanNumber}`;
    } else {
      const el = document.getElementById('product-enquiry-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        customerCareNumber: cleanNumber,
        isNumberConfigured,
        displayFormattedNumber,
        handleCustomerCareWhatsApp,
        handleCustomerCareCall,
        refreshSettings: loadSettings
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export function useSiteSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error('useSiteSettings must be used within a SettingsProvider');
  }
  return ctx;
}
