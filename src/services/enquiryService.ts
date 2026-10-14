import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../lib/firebase';

export interface CustomerEnquiry {
  id?: string;
  fullName: string;
  phone: string;
  state?: string;
  district?: string;
  interestedProduct?: string;
  quantity?: string;
  message?: string;
  status: 'new' | 'contacted' | 'quoted' | 'resolved';
  createdAt: any;
  updatedAt?: any;
}

const ENQUIRIES_COLLECTION = 'enquiries';
const LOCAL_STORAGE_KEY = 'indas_enquiries_cache_v1';

function getLocalEnquiries(): CustomerEnquiry[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading local enquiries cache:', e);
  }
  return [];
}

function saveLocalEnquiries(list: CustomerEnquiry[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.error('Error saving local enquiries cache:', e);
  }
}

/**
 * Public visitor submits an enquiry.
 * Validates inputs, adds server timestamp & initial 'new' status.
 */
export async function submitCustomerEnquiry(
  data: Omit<CustomerEnquiry, 'id' | 'status' | 'createdAt'>
): Promise<{ success: boolean; id?: string; error?: string }> {
  // 1. Validation
  const trimmedName = data.fullName.trim();
  const trimmedPhone = data.phone.trim().replace(/\D/g, '');

  if (!trimmedName || trimmedName.length < 2) {
    return { success: false, error: 'Please provide a valid full name.' };
  }

  if (!trimmedPhone || trimmedPhone.length < 10) {
    return { success: false, error: 'Please enter a valid 10-digit mobile number.' };
  }

  const payload: Omit<CustomerEnquiry, 'id'> = {
    fullName: trimmedName,
    phone: trimmedPhone,
    state: data.state?.trim() || '',
    district: data.district?.trim() || '',
    interestedProduct: data.interestedProduct?.trim() || 'General Hybrid Seeds Enquiry',
    quantity: data.quantity?.trim() || '',
    message: data.message?.trim() || '',
    status: 'new',
    createdAt: isFirebaseConfigured && db ? serverTimestamp() : new Date().toISOString()
  };

  // 2. Submit to Firestore if connected
  if (isFirebaseConfigured && db) {
    try {
      const docRef = await addDoc(collection(db, ENQUIRIES_COLLECTION), {
        ...payload,
        // Match firestore.rules validation fields
        customerName: trimmedName,
        phone: trimmedPhone
      });
      
      // Also cache locally for dev visibility
      const localList = getLocalEnquiries();
      localList.unshift({ id: docRef.id, ...payload, createdAt: new Date().toISOString() });
      saveLocalEnquiries(localList);

      return { success: true, id: docRef.id };
    } catch (error: any) {
      console.error('[enquiryService] Firestore submission failed:', error);
      // Fallback to local storage persistence
      const fallbackId = `enq_${Date.now()}`;
      const localList = getLocalEnquiries();
      localList.unshift({ id: fallbackId, ...payload, createdAt: new Date().toISOString() });
      saveLocalEnquiries(localList);
      return { success: true, id: fallbackId };
    }
  }

  // 3. Dev / Offline Mode Persistence
  const localId = `enq_${Date.now()}`;
  const localList = getLocalEnquiries();
  localList.unshift({ id: localId, ...payload, createdAt: new Date().toISOString() });
  saveLocalEnquiries(localList);

  return { success: true, id: localId };
}

/**
 * Authenticated Admin retrieves all enquiries.
 */
export async function getAllEnquiriesAdmin(): Promise<CustomerEnquiry[]> {
  if (isFirebaseConfigured && db) {
    try {
      const q = query(collection(db, ENQUIRIES_COLLECTION), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        return snapshot.docs.map(d => {
          const item = d.data();
          return {
            id: d.id,
            fullName: item.fullName || item.customerName || 'Anonymous Farmer',
            phone: item.phone || '',
            state: item.state || '',
            district: item.district || '',
            interestedProduct: item.interestedProduct || item.productName || 'General Enquiry',
            quantity: item.quantity || '',
            message: item.message || '',
            status: item.status || 'new',
            createdAt: item.createdAt?.toDate ? item.createdAt.toDate().toISOString() : (item.createdAt || new Date().toISOString()),
            updatedAt: item.updatedAt?.toDate ? item.updatedAt.toDate().toISOString() : item.updatedAt
          } as CustomerEnquiry;
        });
      }
    } catch (error) {
      console.warn('[enquiryService] Firestore admin query error:', error);
    }
  }

  return getLocalEnquiries();
}

/**
 * Admin updates enquiry processing status.
 */
export async function updateEnquiryStatus(
  enquiryId: string, 
  status: CustomerEnquiry['status']
): Promise<boolean> {
  if (isFirebaseConfigured && db) {
    try {
      const ref = doc(db, ENQUIRIES_COLLECTION, enquiryId);
      await updateDoc(ref, {
        status,
        updatedAt: serverTimestamp()
      });
    } catch (e) {
      console.error('Error updating enquiry status in Firestore:', e);
    }
  }

  // Update local cache
  const list = getLocalEnquiries();
  const index = list.findIndex(i => i.id === enquiryId);
  if (index !== -1) {
    list[index].status = status;
    list[index].updatedAt = new Date().toISOString();
    saveLocalEnquiries(list);
  }
  return true;
}

/**
 * Admin deletes an enquiry.
 */
export async function deleteEnquiry(enquiryId: string): Promise<boolean> {
  if (isFirebaseConfigured && db) {
    try {
      const ref = doc(db, ENQUIRIES_COLLECTION, enquiryId);
      await deleteDoc(ref);
    } catch (e) {
      console.error('Error deleting enquiry in Firestore:', e);
    }
  }

  const list = getLocalEnquiries().filter(i => i.id !== enquiryId);
  saveLocalEnquiries(list);
  return true;
}
