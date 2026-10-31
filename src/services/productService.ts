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
  arrayUnion,
  onSnapshot
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../lib/firebase';
import { Product } from '../types/product';
import { INITIAL_PRODUCTS } from '../data/initialProducts';

const PRODUCTS_COLLECTION = 'products';
const LOCAL_STORAGE_KEY = 'indus_products_cache_v13';
const DELETED_PRODUCTS_KEY = 'indus_deleted_products_v2';

// In-memory event bus for live website reactivity without full page reload
type ProductsListener = () => void;
const listeners = new Set<ProductsListener>();

export function subscribeToProducts(listener: ProductsListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function notifyProductsUpdated(): void {
  listeners.forEach(fn => {
    try {
      fn();
    } catch (e) {
      console.error('[productService] Listener callback error:', e);
    }
  });

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('indus:products-updated'));
  }
}

// Cross-tab synchronization via storage events
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === LOCAL_STORAGE_KEY || e.key === DELETED_PRODUCTS_KEY) {
      notifyProductsUpdated();
    }
  });
}

// Optional Firestore live listener for real-time multi-client updates
let isLiveListenerAttached = false;
function initFirestoreLiveListener(): void {
  if (isLiveListenerAttached || !isFirebaseConfigured || !db) return;
  try {
    const q = query(
      collection(db, PRODUCTS_COLLECTION),
      where('isPublished', '==', true)
    );
    onSnapshot(q, () => {
      notifyProductsUpdated();
    }, (err) => {
      // Non-blocking snapshot warning (e.g. offline/rules)
      console.info('[productService] Real-time snapshot info:', err?.message || err);
    });
    isLiveListenerAttached = true;
  } catch {
    // Graceful fallback
  }
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Strips undefined values so Firestore never rejects payloads with:
 * "Unsupported field value: undefined"
 */
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

function deduplicateProducts(list: Product[]): Product[] {
  const map = new Map<string, Product>();
  list.forEach(p => {
    if (p && p.id) {
      map.set(p.id, p);
    }
  });
  return Array.from(map.values());
}

export function getDeletedProductIds(): Set<string> {
  try {
    const raw = localStorage.getItem(DELETED_PRODUCTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return new Set(parsed);
      }
    }
  } catch (e) {
    console.error('Error reading deleted products:', e);
  }
  return new Set<string>();
}

export function recordDeletedProductId(id: string): void {
  const set = getDeletedProductIds();
  set.add(id);
  try {
    localStorage.setItem(DELETED_PRODUCTS_KEY, JSON.stringify(Array.from(set)));
  } catch { }
}

export function removeDeletedProductId(id: string): void {
  const set = getDeletedProductIds();
  if (set.delete(id)) {
    try {
      localStorage.setItem(DELETED_PRODUCTS_KEY, JSON.stringify(Array.from(set)));
    } catch { }
  }
}

function getLocalProducts(): Product[] {
  const deletedIds = getDeletedProductIds();
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return deduplicateProducts(parsed.filter(p => !deletedIds.has(p.id)));
      }
    }
  } catch (e) {
    console.error('Error reading local products cache:', e);
  }

  // Initialize with full updated products catalogue minus any deleted items
  const initial = deduplicateProducts(INITIAL_PRODUCTS.filter(p => !deletedIds.has(p.id)));
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initial));
  } catch { }
  return initial;
}

function saveLocalProducts(products: Product[]): void {
  try {
    const deletedIds = getDeletedProductIds();
    const clean = deduplicateProducts(products.filter(p => !deletedIds.has(p.id)));
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(clean));
  } catch (e) {
    console.error('Error saving local products:', e);
  }
}

/**
 * Fetches all published products for public display.
 * Robustly merges remote Firestore published items with base catalog items,
 * respecting publication status and persistent deletions.
 */
export async function getPublishedProducts(): Promise<Product[]> {
  initFirestoreLiveListener();
  const deletedIds = getDeletedProductIds();

  if (isFirebaseConfigured && db) {
    try {
      // 1. Query Firestore for published products
      const q = query(
        collection(db, PRODUCTS_COLLECTION),
        where('isPublished', '==', true)
      );
      const snapshot = await getDocs(q);
      const remoteProducts: Product[] = [];
      snapshot.forEach(d => {
        remoteProducts.push({ id: d.id, ...d.data() } as Product);
      });

      // 2. Fetch catalog deletions register if present in siteSettings
      try {
        const delDoc = await getDoc(doc(db, 'siteSettings', 'catalogDeletions'));
        if (delDoc.exists()) {
          const list = delDoc.data()?.deletedIds;
          if (Array.isArray(list)) {
            list.forEach(id => {
              deletedIds.add(id);
              recordDeletedProductId(id);
            });
          }
        }
      } catch {
        // Non-blocking
      }

      // 3. Merge base catalogue with Firestore updates/additions
      const local = getLocalProducts();
      const productMap = new Map<string, Product>();

      // Base published products
      local.forEach(p => {
        if (p.isPublished && !deletedIds.has(p.id)) {
          productMap.set(p.id, p);
        }
      });

      // Firestore records override base items or add newly created items
      remoteProducts.forEach(p => {
        if (!deletedIds.has(p.id) && (p as any).isDeleted !== true) {
          productMap.set(p.id, p);
        } else {
          productMap.delete(p.id);
        }
      });

      const merged = Array.from(productMap.values()).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
      return merged;
    } catch (error) {
      console.warn('[productService] Firestore query failed, falling back to local catalogue:', error);
    }
  }

  // Fallback to local products that are published and not deleted
  const local = getLocalProducts();
  return deduplicateProducts(local.filter(p => p.isPublished && !deletedIds.has(p.id)))
    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
}

/**
 * Fetches all products (both published and drafts) for admin management.
 */
export async function getAllProductsAdmin(): Promise<Product[]> {
  initFirestoreLiveListener();
  const deletedIds = getDeletedProductIds();

  if (isFirebaseConfigured && db) {
    try {
      // Fetch all products in Firestore
      const snapshot = await getDocs(collection(db, PRODUCTS_COLLECTION));
      const remoteProducts: Product[] = [];
      snapshot.forEach(d => {
        remoteProducts.push({ id: d.id, ...d.data() } as Product);
      });

      // Check remote deletions register
      try {
        const delDoc = await getDoc(doc(db, 'siteSettings', 'catalogDeletions'));
        if (delDoc.exists()) {
          const list = delDoc.data()?.deletedIds;
          if (Array.isArray(list)) {
            list.forEach(id => {
              deletedIds.add(id);
              recordDeletedProductId(id);
            });
          }
        }
      } catch { }

      const local = getLocalProducts();
      const productMap = new Map<string, Product>();

      // Base items
      local.forEach(p => {
        if (!deletedIds.has(p.id)) {
          productMap.set(p.id, p);
        }
      });

      // Remote items override or append
      remoteProducts.forEach(p => {
        if (!deletedIds.has(p.id) && (p as any).isDeleted !== true) {
          productMap.set(p.id, p);
        } else {
          productMap.delete(p.id);
        }
      });

      const merged = Array.from(productMap.values()).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
      saveLocalProducts(merged);
      return merged;
    } catch (error: any) {
      console.warn('[productService] Firestore admin query note:', error?.message || error);
    }
  }

  return deduplicateProducts(getLocalProducts().filter(p => !deletedIds.has(p.id)))
    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
}

/**
 * Retrieves a single product by ID or slug.
 */
export async function getProductById(id: string): Promise<Product | null> {
  const deletedIds = getDeletedProductIds();
  if (deletedIds.has(id)) {
    return null;
  }

  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, PRODUCTS_COLLECTION, id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        if ((data as any).isDeleted === true) {
          return null;
        }
        return { id: docSnap.id, ...data } as Product;
      }
    } catch (error) {
      console.warn('[productService] Firestore getDoc failed, falling back to local:', error);
    }
  }

  const local = getLocalProducts();
  const found = local.find(p => (p.id === id || p.slug === id) && !deletedIds.has(p.id));
  return found || null;
}

/**
 * Creates or updates a product.
 * - Uses setDoc with merge: true so pre-seeded catalog products can be edited directly.
 * - Preserves existing product images, specifications, features, and descriptions.
 * - Sanitizes payload to remove undefined fields.
 * - Explicitly throws on database errors so failures are never reported as successes.
 * - Broadcasts change to update the website immediately.
 */
export async function saveProduct(productData: Partial<Product>, id?: string): Promise<string> {
  const now = new Date().toISOString();
  const cleanData = sanitizeForFirestore(productData);

  // Preserve existing product fields when editing
  let existingProduct: Product | null = null;
  const targetId = id || productData.id;
  if (targetId) {
    existingProduct = await getProductById(targetId);
  }

  const finalId = targetId || `indus-${slugify(productData.name || 'product')}-${Date.now().toString(36)}`;

  const mergedProduct: Product = {
    ...(existingProduct || {}),
    ...cleanData,
    id: finalId,
    name: cleanData.name !== undefined ? cleanData.name : (existingProduct?.name || ''),
    code: cleanData.code !== undefined ? cleanData.code : (existingProduct?.code || ''),
    slug: cleanData.slug || existingProduct?.slug || slugify(`${cleanData.name || 'prod'}-${cleanData.code || ''}`),
    category: cleanData.category || existingProduct?.category || 'Insecticides',
    shortDescription: cleanData.shortDescription !== undefined ? cleanData.shortDescription : (existingProduct?.shortDescription || ''),
    description: cleanData.description !== undefined ? cleanData.description : (existingProduct?.description || ''),
    features: cleanData.features !== undefined ? cleanData.features : (existingProduct?.features || []),
    specifications: cleanData.specifications !== undefined ? cleanData.specifications : (existingProduct?.specifications || []),
    imageUrl: cleanData.imageUrl || existingProduct?.imageUrl || '/images/products/ias-405.jpg',
    isPublished: cleanData.isPublished !== undefined ? cleanData.isPublished : (existingProduct?.isPublished ?? true),
    sortOrder: cleanData.sortOrder !== undefined ? cleanData.sortOrder : (existingProduct?.sortOrder ?? 1),
    createdAt: existingProduct?.createdAt || now,
    updatedAt: now
  } as Product;

  const sanitizedDoc = sanitizeForFirestore(mergedProduct);

  // Write to Firebase Firestore
  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, PRODUCTS_COLLECTION, finalId);
      await setDoc(docRef, {
        ...sanitizedDoc,
        updatedAt: serverTimestamp(),
        createdAt: existingProduct?.createdAt ? existingProduct.createdAt : serverTimestamp()
      }, { merge: true });
    } catch (error: any) {
      console.error('[productService] Firestore write failed:', error);
      throw new Error(`Database save failed: ${error?.message || 'Permission denied or network unreachable'}`);
    }
  }

  // Update local cache
  updateLocalCopy(mergedProduct);

  // Unmark deletion if reusing ID
  removeDeletedProductId(finalId);

  // Broadcast live website update
  notifyProductsUpdated();

  return finalId;
}

function updateLocalCopy(product: Product): void {
  const local = getLocalProducts();
  const idx = local.findIndex(p => p.id === product.id);
  if (idx >= 0) {
    local[idx] = { ...local[idx], ...product };
  } else {
    local.unshift(product);
  }
  saveLocalProducts(local);
}

/**
 * Deletes a product from the database and removes it permanently from the website.
 * - Deletes the document from Firestore.
 * - Registers the deletion in siteSettings/catalogDeletions so initial catalog products stay deleted.
 * - Removes from local cache and broadcasts live website update.
 * - Throws on database failure so errors are handled properly.
 */
export async function deleteProduct(id: string): Promise<void> {
  if (isFirebaseConfigured && db) {
    try {
      // 1. Delete document from Firestore
      await deleteDoc(doc(db, PRODUCTS_COLLECTION, id));

      // 2. Also register in persistent catalogDeletions doc so base items stay deleted
      try {
        const deletionsRef = doc(db, 'siteSettings', 'catalogDeletions');
        await setDoc(deletionsRef, {
          deletedIds: arrayUnion(id),
          updatedAt: serverTimestamp()
        }, { merge: true });
      } catch (e) {
        console.warn('[productService] Note: Could not sync deletion to catalogDeletions doc:', e);
      }
    } catch (error: any) {
      console.error('[productService] Firestore deleteDoc failed:', error);
      throw new Error(`Database delete failed: ${error?.message || 'Permission denied or network unreachable'}`);
    }
  }

  // Record deletion locally
  recordDeletedProductId(id);

  // Remove from local cache
  const local = getLocalProducts().filter(p => p.id !== id);
  saveLocalProducts(local);

  // Broadcast live website update
  notifyProductsUpdated();
}
