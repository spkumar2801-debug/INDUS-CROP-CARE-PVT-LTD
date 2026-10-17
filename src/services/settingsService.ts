import { doc, getDoc, setDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../lib/firebase';
import { SiteSettings, HeroSettings } from '../types/settings';
import { INITIAL_SETTINGS } from '../data/initialProducts';

const SETTINGS_COLLECTION = 'siteSettings';
const SETTINGS_DOC_ID = 'general';
const LOCAL_STORAGE_KEY = 'indus_settings_cache_v3';

/**
 * Sanitizes hero media settings to ensure that browser-session-local blob: URLs
 * are never used in place of canonical persistent media assets.
 */
export function sanitizeHeroSettings(hero?: Partial<HeroSettings>): HeroSettings {
  const base = INITIAL_SETTINGS.hero || {
    mediaType: 'image' as const,
    imageUrl: '/assets/indus-crop-hero.webp',
    imageMobileUrl: '/assets/indus-crop-hero-mobile.webp',
    imagePositionDesktop: 'center 36%',
    imagePositionMobile: 'center center',
    imageFit: 'cover' as const,
    videoUrl: '/videos/hero-cinematic.mp4',
    videoPosterUrl: '/assets/indus-crop-hero.webp',
    videoLoop: true,
    videoMuted: true,
    overlayDarkness: 0.65,
    gradientStrength: 0.8,
    heroHeightPreset: 'standard' as const
  };

  const merged = { ...base, ...(hero || {}) };

  // Never allow temporary blob: URLs to persist as active public media
  if (!merged.imageUrl || merged.imageUrl.startsWith('blob:')) {
    merged.imageUrl = base.imageUrl;
  }
  if (merged.imageMobileUrl && merged.imageMobileUrl.startsWith('blob:')) {
    merged.imageMobileUrl = base.imageMobileUrl;
  }
  if (!merged.videoUrl || merged.videoUrl.startsWith('blob:')) {
    merged.videoUrl = base.videoUrl;
  }
  if (!merged.videoPosterUrl || merged.videoPosterUrl.startsWith('blob:')) {
    merged.videoPosterUrl = merged.imageUrl || base.videoPosterUrl;
  }

  // Ensure mediaType is strictly 'image' or 'video'
  if (merged.mediaType !== 'video') {
    merged.mediaType = 'image';
  }

  return merged as HeroSettings;
}

export function getLocalSettings(): SiteSettings {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const unified = parsed.customerCareWhatsAppNumber || parsed.whatsappNumber || '';
      return {
        ...INITIAL_SETTINGS,
        ...parsed,
        hero: sanitizeHeroSettings(parsed.hero),
        customerCareWhatsAppNumber: unified,
        whatsappNumber: unified
      };
    }
  } catch (e) {
    console.error('Error reading settings cache:', e);
  }

  // Fallback to initial settings or env variables
  const configuredNumber = import.meta.env.VITE_CUSTOMER_CARE_WHATSAPP_NUMBER ||
                           import.meta.env.VITE_WHATSAPP_NUMBER ||
                           INITIAL_SETTINGS.customerCareWhatsAppNumber ||
                           INITIAL_SETTINGS.whatsappNumber || '';

  const settings: SiteSettings = {
    ...INITIAL_SETTINGS,
    email: import.meta.env.VITE_COMPANY_EMAIL || INITIAL_SETTINGS.email,
    customerCareWhatsAppNumber: configuredNumber,
    whatsappNumber: configuredNumber,
    hero: sanitizeHeroSettings(INITIAL_SETTINGS.hero)
  };
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(settings));
  return settings;
}

function saveLocalSettings(settings: SiteSettings): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Error saving settings cache:', e);
  }
}

export async function getSiteSettings(): Promise<SiteSettings> {
  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        const data = snapshot.data() as SiteSettings;
        const unified = data.customerCareWhatsAppNumber || data.whatsappNumber || '';
        const merged: SiteSettings = {
          ...INITIAL_SETTINGS,
          ...data,
          hero: sanitizeHeroSettings(data.hero),
          customerCareWhatsAppNumber: unified,
          whatsappNumber: unified
        };
        saveLocalSettings(merged);
        return merged;
      }
    } catch (error) {
      console.warn('[settingsService] Firestore get failed, using local cache:', error);
    }
  }

  return getLocalSettings();
}

/**
 * Subscribes to real-time site settings changes from Firestore.
 * Ensures instant cross-device and cross-tab synchronization.
 */
export function subscribeToSiteSettings(callback: (settings: SiteSettings) => void): () => void {
  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);
      const unsubscribe = onSnapshot(
        docRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data() as SiteSettings;
            const unified = data.customerCareWhatsAppNumber || data.whatsappNumber || '';
            const merged: SiteSettings = {
              ...INITIAL_SETTINGS,
              ...data,
              hero: sanitizeHeroSettings(data.hero),
              customerCareWhatsAppNumber: unified,
              whatsappNumber: unified
            };
            saveLocalSettings(merged);
            callback(merged);
          } else {
            callback(getLocalSettings());
          }
        },
        (error) => {
          console.warn('[settingsService] Real-time settings listener warning:', error);
          callback(getLocalSettings());
        }
      );
      return unsubscribe;
    } catch (err) {
      console.warn('[settingsService] Could not attach real-time listener:', err);
    }
  }

  callback(getLocalSettings());
  return () => {};
}

export async function updateSiteSettings(settings: Partial<SiteSettings>): Promise<void> {
  const current = getLocalSettings();
  const unified = settings.customerCareWhatsAppNumber !== undefined 
    ? settings.customerCareWhatsAppNumber 
    : (settings.whatsappNumber !== undefined ? settings.whatsappNumber : current.customerCareWhatsAppNumber);

  // Validate hero media URLs to prevent saving temporary blob: URLs
  if (settings.hero) {
    if (settings.hero.videoUrl?.startsWith('blob:')) {
      throw new Error('Cannot save temporary blob: URL. Please wait for the video upload to complete.');
    }
    if (settings.hero.imageUrl?.startsWith('blob:')) {
      throw new Error('Cannot save temporary blob: URL. Please wait for the image upload to complete.');
    }
    if (settings.hero.videoPosterUrl?.startsWith('blob:')) {
      throw new Error('Cannot save temporary blob: URL. Please wait for the poster upload to complete.');
    }
  }

  const updatedHero = settings.hero ? sanitizeHeroSettings(settings.hero) : current.hero;

  const updated: SiteSettings = {
    ...current,
    ...settings,
    hero: updatedHero,
    customerCareWhatsAppNumber: unified,
    whatsappNumber: unified,
    updatedAt: new Date().toISOString()
  };

  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);
      await setDoc(docRef, {
        ...updated,
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (error: any) {
      console.error('[settingsService] Firestore update failed:', error);
      // Re-throw so caller knows cloud save failed and can notify admin
      throw new Error(error?.message || 'Failed to persist settings to cloud database.');
    }
  }

  saveLocalSettings(updated);
}

