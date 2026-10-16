export interface SiteSettings {
  companyName: string;
  tagline: string;
  teluguTagline: string;
  parentCompany: string;
  establishedYear: string;
  launchDate: string;
  email: string;
  /**
   * Centralized official company phone & WhatsApp number.
   * Managed via Admin Dashboard -> Site Settings -> Customer Care & WhatsApp Number.
   * Powers all WhatsApp and telephone actions across header, footer, contact section, and product cards.
   */
  customerCareWhatsAppNumber: string;
  whatsappNumber?: string; // Backwards-compatibility alias
  phoneSecondary?: string;
  telephone?: string;
  corporateOfficeAddress?: string;
  registeredOfficeAddress?: string;
  headOfficeAddress?: string;
  websiteUrl?: string;
  isoCertification?: string;
  operationalStates?: string[];
  logoUrl: string;
  hero?: HeroSettings;
  updatedAt?: string;
  updatedBy?: string;
}

export interface HeroSettings {
  mediaType: 'image' | 'video';
  imageUrl: string;
  imageMobileUrl?: string;
  imagePositionDesktop?: string;
  imagePositionMobile?: string;
  imageFit?: 'cover' | 'contain';
  videoUrl?: string;
  videoMobileUrl?: string;
  videoPosterUrl?: string;
  videoLoop?: boolean;
  videoMuted?: boolean;
  overlayDarkness?: number;
  gradientStrength?: number;
  heroHeightPreset?: 'compact' | 'standard' | 'tall' | 'fullscreen';
  badgeText?: string;
  titleLine1?: string;
  titleLine2?: string;
  teluguMotto?: string;
  description?: string;
  primaryCtaText?: string;
  primaryCtaLink?: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  publishedAt?: string;
  publishedBy?: string;
}

export interface AdminUser {
  uid: string;
  email: string;
  displayName: string;
  role: 'admin' | 'superadmin' | 'editor';
  createdAt?: string;
  lastLoginAt?: string;
}
