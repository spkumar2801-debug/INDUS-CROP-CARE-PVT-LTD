import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../lib/firebase';
import { SiteSettings, HeroSettings } from '../types/settings';
import { INITIAL_SETTINGS } from '../data/initialProducts';

const SETTINGS_COLLECTION = 'siteSettings';
const SETTINGS_DOC_ID = 'general';
const LOCAL_STORAGE_KEY = 'indus_settings_cache_v3';

function getLocalSettings(): SiteSettings {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const unified = parsed.customerCareWhatsAppNumber || parsed.whatsappNumber || '';
      return {
        ...INITIAL_SETTINGS,
        ...parsed,
        hero: ({
          ...INITIAL_SETTINGS.hero,
          ...(parsed.hero || {})
        } as HeroSettings),
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
    whatsappNumber: configuredNumber
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
          hero: ({
            ...INITIAL_SETTINGS.hero,
            ...(data.hero || {})
          } as HeroSettings),
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

export async function updateSiteSettings(settings: Partial<SiteSettings>): Promise<void> {
  const current = getLocalSettings();
  const unified = settings.customerCareWhatsAppNumber !== undefined 
    ? settings.customerCareWhatsAppNumber 
    : (settings.whatsappNumber !== undefined ? settings.whatsappNumber : current.customerCareWhatsAppNumber);

  const updated: SiteSettings = {
    ...current,
    ...settings,
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
    } catch (error) {
      console.warn('[settingsService] Firestore update failed, saved locally:', error);
    }
  }

  saveLocalSettings(updated);
}
