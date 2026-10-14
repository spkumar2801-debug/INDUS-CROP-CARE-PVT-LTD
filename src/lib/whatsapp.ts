import { QuoteFormData } from '../types/product';

export function normalizePhoneNumber(rawNumber: string): string {
  // Strip non-digits
  const digits = rawNumber.replace(/\D/g, '');
  if (!digits) return '';

  // If 10 digits (India domestic format), prepend 91
  if (digits.length === 10) {
    return `91${digits}`;
  }

  // If starts with 0 and 11 digits, replace leading 0 with 91
  if (digits.length === 11 && digits.startsWith('0')) {
    return `91${digits.slice(1)}`;
  }

  return digits;
}

/**
 * Direct WhatsApp Message for Instant 1-Click Product Enquiry (No form required)
 */
export function buildDirectProductWhatsAppMessage(product: { name: string; code?: string; formulation?: string; category?: string }): string {
  const formulationText = product.formulation ? ` [${product.formulation}]` : '';
  const productIdentifier = `${product.name}${formulationText}`;

  const parts: string[] = [
    'Hello Indus Crop Care Pvt. Ltd.,',
    '',
    `I am interested in ${productIdentifier}${product.category ? ` (${product.category})` : ''}.`,
    '',
    'Please share the current product availability, packaging sizes, and quotation details.',
    '',
    'Thank you.'
  ];
  return parts.join('\n');
}

export interface DirectWhatsAppResult {
  hasNumber: boolean;
  url?: string;
  messageText: string;
  businessNumber?: string;
  error?: string;
}

/**
 * Generates direct wa.me link for immediate 1-click WhatsApp opening.
 */
export function getDirectProductWhatsAppUrl(
  product: { name: string; code: string; formulation?: string; category?: string },
  configuredBusinessNumber?: string
): DirectWhatsAppResult {
  const messageText = buildDirectProductWhatsAppMessage(product);
  const rawNumber = configuredBusinessNumber || 
                    import.meta.env.VITE_CUSTOMER_CARE_WHATSAPP_NUMBER || 
                    import.meta.env.VITE_WHATSAPP_NUMBER || '';
  const cleanNumber = normalizePhoneNumber(rawNumber);

  if (!cleanNumber) {
    return {
      hasNumber: false,
      messageText,
      error: 'Official Customer Care & WhatsApp number is pending configuration in Admin Settings.'
    };
  }

  const encodedText = encodeURIComponent(messageText);
  return {
    hasNumber: true,
    url: `https://wa.me/${cleanNumber}?text=${encodedText}`,
    messageText,
    businessNumber: cleanNumber
  };
}

/**
 * Detailed WhatsApp Message when submitting through the quotation form
 */
export function buildWhatsAppQuoteMessage(data: QuoteFormData): string {
  const parts: string[] = [
    'Hello Indus Crop Care Pvt. Ltd.,',
    '',
    'I am interested in the following product enquiry:',
    `Product: ${data.productName} (${data.productCode})`
  ];

  if (data.quantity && data.quantity.trim()) {
    parts.push(`Quantity required: ${data.quantity.trim()}`);
  }

  parts.push(`Name: ${data.customerName.trim()}`);
  parts.push(`Contact: ${data.phone.trim()}`);

  const locationParts: string[] = [];
  if (data.district && data.district.trim()) locationParts.push(data.district.trim());
  if (data.state && data.state.trim()) locationParts.push(data.state.trim());
  
  if (locationParts.length > 0) {
    parts.push(`Location: ${locationParts.join(', ')}`);
  }

  if (data.message && data.message.trim()) {
    parts.push(`Additional requirements: ${data.message.trim()}`);
  }

  parts.push('');
  parts.push('Please share the product availability, technical guidance, and quotation details.');
  parts.push('Thank you.');

  return parts.join('\n');
}

export interface WhatsAppHandoffResult {
  success: boolean;
  url?: string;
  messageText: string;
  hasConfiguredNumber: boolean;
  businessNumber?: string;
  error?: string;
}

export function generateWhatsAppHandoffUrl(
  data: QuoteFormData,
  configuredBusinessNumber?: string
): WhatsAppHandoffResult {
  const messageText = buildWhatsAppQuoteMessage(data);
  const encodedText = encodeURIComponent(messageText);

  // Retrieve number from parameter or environment
  const rawNumber = configuredBusinessNumber || import.meta.env.VITE_WHATSAPP_NUMBER || '';
  const cleanNumber = normalizePhoneNumber(rawNumber);

  if (!cleanNumber) {
    return {
      success: false,
      messageText,
      hasConfiguredNumber: false,
      error: 'Official WhatsApp business number is pending configuration in Admin Settings.'
    };
  }

  // Official wa.me click-to-chat format
  const url = `https://wa.me/${cleanNumber}?text=${encodedText}`;

  return {
    success: true,
    url,
    messageText,
    hasConfiguredNumber: true,
    businessNumber: cleanNumber
  };
}
