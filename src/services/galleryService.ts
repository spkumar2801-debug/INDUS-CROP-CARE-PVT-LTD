import { 
  collection, 
  getDocs, 
  doc, 
  getDoc,
  setDoc,
  deleteDoc, 
  query, 
  where, 
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db, auth, isFirebaseConfigured } from '../lib/firebase';
import { GalleryItem } from '../types/gallery';
import { INITIAL_GALLERY_ITEMS } from '../data/initialProducts';

const GALLERY_COLLECTION = 'gallery';
const LOCAL_STORAGE_KEY = 'indas_gallery_cache_v8';

type GalleryListener = () => void;
const listeners = new Set<GalleryListener>();

export function subscribeToGallery(listener: GalleryListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function notifyGalleryUpdated(): void {
  listeners.forEach(fn => {
    try {
      fn();
    } catch (e) {
      console.error('[galleryService] Listener callback error:', e);
    }
  });

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('indus:gallery-updated'));
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === LOCAL_STORAGE_KEY) {
      notifyGalleryUpdated();
    }
  });
}

function sanitizeForFirestore<T extends Record<string, any>>(obj: T): Partial<T> {
  const result: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined) {
      continue;
    }
    if (value !== null && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
      if (typeof (value as any)._methodName === 'string') {
        result[key] = value;
      } else {
        result[key] = sanitizeForFirestore(value);
      }
    } else {
      result[key] = value;
    }
  }
  return result;
}

function deduplicateGalleryItems(list: GalleryItem[]): GalleryItem[] {
  const map = new Map<string, GalleryItem>();
  list.forEach(i => {
    // Exclude legacy seed-related items
    if (i && i.id && !i.id.startsWith('gallery-ias-')) {
      map.set(i.id, i);
    }
  });
  return Array.from(map.values());
}

export function getLocalGallery(): GalleryItem[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const clean = deduplicateGalleryItems(parsed);
        if (clean.length > 0 && !clean.some(item => item.id.startsWith('gallery-ias-'))) {
          return clean;
        }
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
  const localItems = deduplicateGalleryItems(getLocalGallery().filter(i => i.isPublished))
    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

  if (isFirebaseConfigured && db) {
    try {
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Firestore timeout')), 1800)
      );
      const q = query(
        collection(db, GALLERY_COLLECTION),
        where('isPublished', '==', true)
      );
      const snapshot = await Promise.race([getDocs(q), timeoutPromise]) as any;
      if (snapshot && !snapshot.empty) {
        const list = snapshot.docs.map((d: any) => ({ id: d.id, ...d.data() } as GalleryItem));
        const map = new Map<string, GalleryItem>();
        localItems.forEach((item: GalleryItem) => map.set(item.id, item));
        list.forEach((item: GalleryItem) => map.set(item.id, item));
        return deduplicateGalleryItems(Array.from(map.values())).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
      }
    } catch (error) {
      console.warn('[galleryService] Firestore query note, using seed:', error);
    }
  }

  return localItems;
}

export async function getAllGalleryItemsAdmin(): Promise<GalleryItem[]> {
  const localItems = deduplicateGalleryItems(getLocalGallery())
    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

  if (isFirebaseConfigured && db) {
    try {
      if (auth?.currentUser) {
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Firestore timeout')), 1800)
        );
        const q = query(collection(db, GALLERY_COLLECTION));
        const snapshot = await Promise.race([getDocs(q), timeoutPromise]) as any;
        if (snapshot && !snapshot.empty) {
          const list = snapshot.docs.map((d: any) => ({ id: d.id, ...d.data() } as GalleryItem));
          const map = new Map<string, GalleryItem>();
          localItems.forEach((item: GalleryItem) => map.set(item.id, item));
          list.forEach((item: GalleryItem) => map.set(item.id, item));
          return deduplicateGalleryItems(Array.from(map.values())).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
        }
      }
    } catch (error: any) {
      console.warn('[galleryService] Firestore admin query note:', error?.message || error);
    }
  }

  return localItems;
}

export async function getGalleryItemById(id: string): Promise<GalleryItem | null> {
  const local = getLocalGallery();
  const localMatch = local.find(i => i.id === id);
  if (localMatch) return localMatch;

  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, GALLERY_COLLECTION, id);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return { id: snap.id, ...snap.data() } as GalleryItem;
      }
    } catch (e) {
      console.warn('[galleryService] getGalleryItemById notice:', e);
    }
  }
  return null;
}

export async function saveGalleryItem(itemData: Partial<GalleryItem>, id?: string): Promise<string> {
  const now = new Date().toISOString();
  const cleanData = sanitizeForFirestore(itemData);

  // 1. Resolve existing item so imageUrl, sortOrder, createdAt, etc. are never lost
  const targetId = id || itemData.id;
  let existingItem: GalleryItem | null = null;
  if (targetId) {
    existingItem = await getGalleryItemById(targetId);
  }

  const finalId = targetId || `gallery-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`;

  // 2. Build complete merged item with explicit fallback to preserve existing data
  const mergedItem: GalleryItem = {
    ...(existingItem || {}),
    ...cleanData,
    id: finalId,
    title: cleanData.title !== undefined ? cleanData.title : (existingItem?.title || ''),
    category: cleanData.category || existingItem?.category || 'Corporate Events',
    imageUrl: cleanData.imageUrl || existingItem?.imageUrl || '/images/products/ias-405.jpg',
    imagePublicId: cleanData.imagePublicId !== undefined ? cleanData.imagePublicId : (existingItem?.imagePublicId || undefined),
    altText: cleanData.altText !== undefined ? cleanData.altText : (existingItem?.altText || cleanData.title || existingItem?.title || ''),
    caption: cleanData.caption !== undefined ? cleanData.caption : (existingItem?.caption || ''),
    description: cleanData.description !== undefined ? cleanData.description : (existingItem?.description || ''),
    isPublished: cleanData.isPublished !== undefined ? cleanData.isPublished : (existingItem?.isPublished ?? true),
    sortOrder: cleanData.sortOrder !== undefined ? cleanData.sortOrder : (existingItem?.sortOrder ?? (getLocalGallery().length + 1)),
    createdAt: existingItem?.createdAt || now,
    updatedAt: now
  } as GalleryItem;

  // 3. Persist to Firebase Firestore with setDoc + merge: true
  // This guarantees creating new records or updating existing records without failing
  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, GALLERY_COLLECTION, finalId);
      const sanitizedDoc = sanitizeForFirestore({
        ...mergedItem,
        updatedAt: serverTimestamp(),
        createdAt: existingItem?.createdAt ? existingItem.createdAt : serverTimestamp()
      });
      await setDoc(docRef, sanitizedDoc, { merge: true });
    } catch (error: any) {
      console.warn('[galleryService] Firestore save notice, persisting locally:', error?.message || error);
    }
  }

  // 4. Update local cache and guarantee localStorage write
  updateLocalGalleryCopy(mergedItem);

  // 5. Broadcast change to public gallery and all open tabs
  notifyGalleryUpdated();

  return finalId;
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
    } catch (error: any) {
      console.error('[galleryService] Firestore delete failed:', error);
      throw new Error(`Database delete failed: ${error?.message || 'Permission denied or network unreachable'}`);
    }
  }

  const local = getLocalGallery().filter(i => i.id !== id);
  saveLocalGallery(local);
  notifyGalleryUpdated();
}

export async function replaceGalleryImage(
  id: string,
  newImageUrl: string,
  newImagePublicId?: string
): Promise<void> {
  const updateData: Partial<GalleryItem> = {
    imageUrl: newImageUrl,
    imagePublicId: newImagePublicId,
    updatedAt: new Date().toISOString()
  };
  await saveGalleryItem(updateData, id);
}

export async function reorderGalleryItems(
  orderedItems: { id: string; sortOrder: number }[]
): Promise<void> {
  const now = new Date().toISOString();

  if (isFirebaseConfigured && db) {
    const firestoreDb = db;
    try {
      // Chunk batch writes by 450 (Firestore limit is 500)
      const chunkSize = 450;
      for (let i = 0; i < orderedItems.length; i += chunkSize) {
        const chunk = orderedItems.slice(i, i + chunkSize);
        const batch = writeBatch(firestoreDb);
        chunk.forEach(item => {
          const docRef = doc(firestoreDb, GALLERY_COLLECTION, item.id);
          batch.update(docRef, {
            sortOrder: item.sortOrder,
            updatedAt: serverTimestamp()
          });
        });
        await batch.commit();
      }
    } catch (error: any) {
      console.warn('[galleryService] Firestore batch reorder note:', error?.message || error);
    }
  }

  // Always update local cache
  const local = getLocalGallery();
  const orderMap = new Map<string, number>();
  orderedItems.forEach(it => orderMap.set(it.id, it.sortOrder));

  local.forEach(item => {
    if (orderMap.has(item.id)) {
      item.sortOrder = orderMap.get(item.id)!;
      item.updatedAt = now;
    }
  });

  local.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  saveLocalGallery(local);
  notifyGalleryUpdated();
}

export async function saveMultipleGalleryItems(
  items: Array<Partial<GalleryItem>>
): Promise<string[]> {
  const savedIds: string[] = [];
  const local = getLocalGallery();
  let nextSort = local.length > 0 ? Math.max(...local.map(i => i.sortOrder || 0)) + 1 : 1;

  for (const it of items) {
    const itemToSave = {
      ...it,
      sortOrder: it.sortOrder ?? nextSort++
    };
    const id = await saveGalleryItem(itemToSave);
    savedIds.push(id);
  }

  return savedIds;
}
