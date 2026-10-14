import { 
  collection, 
  getDocs, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  serverTimestamp 
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../lib/firebase';
import { GalleryItem } from '../types/gallery';
import { INITIAL_GALLERY_ITEMS } from '../data/initialProducts';

const GALLERY_COLLECTION = 'gallery';
const LOCAL_STORAGE_KEY = 'indas_gallery_cache_v5';

function deduplicateGalleryItems(list: GalleryItem[]): GalleryItem[] {
  const map = new Map<string, GalleryItem>();
  list.forEach(i => {
    if (i && i.id) {
      map.set(i.id, i);
    }
  });
  return Array.from(map.values());
}

function getLocalGallery(): GalleryItem[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return deduplicateGalleryItems(parsed);
      }
    }
  } catch (e) {
    console.error('Error reading gallery cache:', e);
  }
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_GALLERY_ITEMS));
  return INITIAL_GALLERY_ITEMS;
}

function saveLocalGallery(items: GalleryItem[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(deduplicateGalleryItems(items)));
  } catch (e) {
    console.error('Error saving gallery cache:', e);
  }
}

export async function getPublishedGalleryItems(): Promise<GalleryItem[]> {
  if (isFirebaseConfigured && db) {
    try {
      const q = query(
        collection(db, GALLERY_COLLECTION),
        where('isPublished', '==', true)
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as GalleryItem));
        return deduplicateGalleryItems(list).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
      }
    } catch (error) {
      console.warn('[galleryService] Firestore query failed, using local seed:', error);
    }
  }

  return deduplicateGalleryItems(getLocalGallery().filter(i => i.isPublished)).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
}

export async function getAllGalleryItemsAdmin(): Promise<GalleryItem[]> {
  if (isFirebaseConfigured && db) {
    try {
      const q = query(collection(db, GALLERY_COLLECTION));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as GalleryItem));
        return deduplicateGalleryItems(list).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
      }
    } catch (error) {
      console.warn('[galleryService] Firestore admin query failed, using local store:', error);
    }
  }

  return deduplicateGalleryItems(getLocalGallery()).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
}

export async function saveGalleryItem(itemData: Partial<GalleryItem>, id?: string): Promise<string> {
  const now = new Date().toISOString();

  if (isFirebaseConfigured && db) {
    try {
      if (id) {
        const docRef = doc(db, GALLERY_COLLECTION, id);
        await updateDoc(docRef, {
          ...itemData,
          updatedAt: serverTimestamp()
        });
        updateLocalGalleryCopy({ ...itemData, id, updatedAt: now } as GalleryItem);
        return id;
      } else {
        const docRef = await addDoc(collection(db, GALLERY_COLLECTION), {
          ...itemData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        updateLocalGalleryCopy({ ...itemData, id: docRef.id, createdAt: now, updatedAt: now } as GalleryItem);
        return docRef.id;
      }
    } catch (error) {
      console.warn('[galleryService] Firestore write failed:', error);
    }
  }

  const local = getLocalGallery();
  if (id) {
    const idx = local.findIndex(i => i.id === id);
    if (idx >= 0) {
      local[idx] = { ...local[idx], ...itemData, updatedAt: now } as GalleryItem;
      saveLocalGallery(local);
      return id;
    }
  }

  const newId = id || `gallery-${Date.now()}`;
  const newItem: GalleryItem = {
    id: newId,
    title: itemData.title || '',
    category: itemData.category || 'Field Trials',
    imageUrl: itemData.imageUrl || '/images/products/ias-405.jpg',
    altText: itemData.altText || itemData.title || '',
    isPublished: itemData.isPublished ?? true,
    sortOrder: itemData.sortOrder ?? (local.length + 1),
    createdAt: now,
    updatedAt: now,
    ...itemData
  } as GalleryItem;

  local.push(newItem);
  saveLocalGallery(local);
  return newId;
}

function updateLocalGalleryCopy(item: GalleryItem): void {
  const local = getLocalGallery();
  const idx = local.findIndex(i => i.id === item.id);
  if (idx >= 0) {
    local[idx] = { ...local[idx], ...item };
  } else {
    local.push(item);
  }
  saveLocalGallery(local);
}

export async function deleteGalleryItem(id: string): Promise<void> {
  if (isFirebaseConfigured && db) {
    try {
      await deleteDoc(doc(db, GALLERY_COLLECTION, id));
    } catch (error) {
      console.warn('[galleryService] Firestore delete failed:', error);
    }
  }

  const local = getLocalGallery().filter(i => i.id !== id);
  saveLocalGallery(local);
}
