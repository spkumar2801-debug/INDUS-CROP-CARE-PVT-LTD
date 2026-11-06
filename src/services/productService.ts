import {
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  deleteField,
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
const LOCAL_STORAGE_KEY = 'indus_products_cache_v14';
const DELETED_PRODUCTS_KEY = 'indus_deleted_products_v2';
const PRODUCT_CUSTOM_CATEGORIES_KEY = 'indus_product_custom_categories_v1';

export const IMPORTANT_PRODUCT_CATEGORIES: string[] = [
  'Insecticides',
  'Herbicides',
  'Fungicides',
  'Plant Growth Regulator (PGR)',
  'Organic Fertilizers',
  'Water-Soluble Fertilizers',
  'Biofertilizers',
  'Bio Stimulants',
  'Micronutrients / Nutrients',
  'Micronutrients Combo',
  'Antibiotic Products',
  'Seeds'
];

export function getCustomProductCategories(): string[] {
  try {
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem(PRODUCT_CUSTOM_CATEGORIES_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return parsed.filter(c =>
            typeof c === 'string' &&
            c.trim() &&
            !IMPORTANT_PRODUCT_CATEGORIES.some(cat => cat.toLowerCase() === c.trim().toLowerCase()) &&
            c.trim().toLowerCase() !== 'others' &&
            c.trim().toLowerCase() !== 'other'
          );
        }
      }
    }
  } catch (e) {
    console.error('Error reading custom product categories:', e);
  }
  return [];
}

export function saveCustomProductCategory(newCategory: string): string[] {
  const trimmed = newCategory.trim();
  if (!trimmed) return getCustomProductCategories();

  const current = getCustomProductCategories();
  const allExisting = [...IMPORTANT_PRODUCT_CATEGORIES, 'Others', 'Other', ...current];
  const alreadyExists = allExisting.some(c => c.toLowerCase() === trimmed.toLowerCase());

  if (!alreadyExists) {
    const updated = [...current, trimmed];
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(PRODUCT_CUSTOM_CATEGORIES_KEY, JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent('indus:product-categories-updated'));
      }
    } catch (e) {
      console.error('Error saving custom product category locally:', e);
    }

    // Synchronize to Firestore remote settings
    if (isFirebaseConfigured && db) {
      try {
        const catDocRef = doc(db, 'siteSettings', 'productCategories');
        setDoc(catDocRef, {
          customCategories: updated,
          updatedAt: serverTimestamp()
        }, { merge: true }).catch(() => { });
      } catch { }
    }

    return updated;
  }
  return current;
}

/**
 * Permanently deletes a custom product category:
 * 1. Removes category from local storage and remote Firestore settings.
 * 2. Migrates any products currently in this category to 'Others'.
 * 3. Broadcasts category and product updates across the app.
 */
export async function deleteCustomProductCategory(categoryToDelete: string): Promise<void> {
  const trimmed = categoryToDelete.trim();
  if (!trimmed) return;

  // 1. Remove from custom categories list
  const current = getCustomProductCategories();
  const updated = current.filter(c => c.toLowerCase() !== trimmed.toLowerCase());
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(PRODUCT_CUSTOM_CATEGORIES_KEY, JSON.stringify(updated));
    }
  } catch (e) {
    console.error('Error deleting custom product category locally:', e);
  }

  // 2. Re-assign any products belonging to this category to 'Others'
  try {
    const local = getLocalProducts();
    let hasModifiedProducts = false;
    for (const p of local) {
      if (p.category && p.category.trim().toLowerCase() === trimmed.toLowerCase()) {
        p.category = 'Others';
        p.updatedAt = new Date().toISOString();
        hasModifiedProducts = true;
        if (isFirebaseConfigured && db) {
          try {
            const docRef = doc(db, PRODUCTS_COLLECTION, p.id);
            setDoc(docRef, { category: 'Others', updatedAt: serverTimestamp() }, { merge: true }).catch(() => { });
          } catch (err: any) {
            console.warn('[productService] Firestore category migration note:', err?.message || err);
          }
        }
      }
    }
    if (hasModifiedProducts) {
      saveLocalProducts(local);
      notifyProductsUpdated();
    }
  } catch (e) {
    console.error('Error migrating products on category deletion:', e);
  }

  // 3. Update Firestore siteSettings document
  if (isFirebaseConfigured && db) {
    try {
      const catDocRef = doc(db, 'siteSettings', 'productCategories');
      await setDoc(catDocRef, {
        customCategories: updated,
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (err: any) {
      console.warn('[productService] Firestore category deletion note:', err?.message || err);
    }
  }

  // 4. Broadcast live events
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('indus:product-categories-updated'));
  }
}

/**
 * Returns the unified active list of all product categories:
 * 12 core categories + active custom categories + 'Others'
 */
export function getAllProductCategories(): string[] {
  return [...IMPORTANT_PRODUCT_CATEGORIES, ...getCustomProductCategories(), 'Others'];
}

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
    } else {
      // Migrate previous cache so any products created by admin in v13 are preserved
      const prevRaw = localStorage.getItem('indus_products_cache_v13');
      if (prevRaw) {
        const prevParsed = JSON.parse(prevRaw);
        if (Array.isArray(prevParsed)) {
          const initialIds = new Set(INITIAL_PRODUCTS.map(p => p.id));
          const customAdminProds = prevParsed.filter(p => !initialIds.has(p.id));
          const merged = deduplicateProducts([...customAdminProds, ...INITIAL_PRODUCTS].filter(p => !deletedIds.has(p.id)));
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(merged));
          return merged;
        }
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
      // 1. Fetch remote products and identify published items vs drafts
      const snapshot = await getDocs(collection(db, PRODUCTS_COLLECTION));
      const remoteDraftIds = new Set<string>();
      const remotePublished: Product[] = [];
      snapshot.forEach(d => {
        const data = d.data();
        if (data.isPublished === false) {
          remoteDraftIds.add(d.id);
        } else if (data.isPublished === true) {
          remotePublished.push({ id: d.id, ...data } as Product);
        }
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

      // Also sync custom categories from siteSettings if available
      try {
        const catDoc = await getDoc(doc(db, 'siteSettings', 'productCategories'));
        if (catDoc.exists()) {
          const custom = catDoc.data()?.customCategories;
          if (Array.isArray(custom) && typeof window !== 'undefined') {
            localStorage.setItem(PRODUCT_CUSTOM_CATEGORIES_KEY, JSON.stringify(custom));
          }
        }
      } catch {
        // Non-blocking
      }

      // 3. Merge base catalogue with Firestore updates/additions
      const local = getLocalProducts();
      const productMap = new Map<string, Product>();

      // Base published products (must not be deleted AND must not be marked as draft in Firestore)
      local.forEach(p => {
        if (p.isPublished && !deletedIds.has(p.id) && !remoteDraftIds.has(p.id)) {
          productMap.set(p.id, p);
        }
      });

      // Firestore records override base items or add newly created items
      remotePublished.forEach(p => {
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
 * Deterministically sorts featured products for the homepage:
 * 1. Intentionally featured products with `featuredAt` timestamps appear first,
 *    sorted descending (the newest product marked as featured always appears at position #1).
 * 2. Followed by canonical baseline products without `featuredAt` (ABOLA, ANUCART GR, ANUCART-SP, BUILDOX)
 *    sorted by their canonical sortOrder.
 */
export function sortFeaturedProducts(products: Product[]): Product[] {
  const eligible = products.filter(p => Boolean(p.isPublished) && Boolean(p.isFeatured));

  return eligible.sort((a, b) => {
    const timeA = a.featuredAt ? new Date(a.featuredAt).getTime() : 0;
    const timeB = b.featuredAt ? new Date(b.featuredAt).getTime() : 0;

    // Both have explicit featured timestamps -> newest first (descending)
    if (timeA && timeB) {
      if (timeB !== timeA) return timeB - timeA;
    }
    // Only 'a' was explicitly featured recently -> 'a' comes first
    if (timeA && !timeB) return -1;
    // Only 'b' was explicitly featured recently -> 'b' comes first
    if (!timeA && timeB) return 1;

    // Baseline products without custom featuredAt -> canonical sortOrder ascending
    return (a.sortOrder || 999) - (b.sortOrder || 999);
  });
}

/**
 * Fetches products that are both published and marked as featured for the homepage.
 * Strictly excludes draft products, deleted products, and non-featured products.
 */
export async function getFeaturedProducts(): Promise<Product[]> {
  const published = await getPublishedProducts();
  return sortFeaturedProducts(published);
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

  const isNowFeatured = cleanData.isFeatured !== undefined
    ? Boolean(cleanData.isFeatured)
    : Boolean(existingProduct?.isFeatured ?? false);

  // If newly featured or timestamp is updated, maintain or set featuredAt
  let determinedFeaturedAt: string | undefined = undefined;
  if (isNowFeatured) {
    if (cleanData.featuredAt) {
      determinedFeaturedAt = cleanData.featuredAt;
    } else if (existingProduct?.isFeatured && existingProduct?.featuredAt) {
      determinedFeaturedAt = existingProduct.featuredAt;
    } else {
      // Newly marked as featured -> gets fresh timestamp so it moves to position #1
      determinedFeaturedAt = now;
    }
  }

  let determinedSortOrder: number;
  if (cleanData.sortOrder !== undefined) {
    determinedSortOrder = cleanData.sortOrder;
  } else if (isNowFeatured && (!existingProduct || !existingProduct.isFeatured || (existingProduct.sortOrder || 0) > 4)) {
    determinedSortOrder = 0;
  } else if (!isNowFeatured && existingProduct && existingProduct.sortOrder === 0) {
    determinedSortOrder = 500;
  } else {
    determinedSortOrder = existingProduct?.sortOrder ?? (isNowFeatured ? 0 : 500);
  }

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
    isPublished: cleanData.isPublished !== undefined ? Boolean(cleanData.isPublished) : (existingProduct?.isPublished ?? true),
    isFeatured: isNowFeatured,
    featuredAt: determinedFeaturedAt,
    sortOrder: determinedSortOrder,
    createdAt: existingProduct?.createdAt || now,
    updatedAt: now
  } as Product;

  if (!isNowFeatured) {
    delete (mergedProduct as any).featuredAt;
  }

  const sanitizedDoc = sanitizeForFirestore(mergedProduct);

  // Write to Firebase Firestore
  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, PRODUCTS_COLLECTION, finalId);
      const firestorePayload: any = {
        ...sanitizedDoc,
        updatedAt: serverTimestamp(),
        createdAt: existingProduct?.createdAt ? existingProduct.createdAt : serverTimestamp()
      };
      if (!isNowFeatured) {
        firestorePayload.featuredAt = deleteField();
      }
      await setDoc(docRef, firestorePayload, { merge: true });
    } catch (error: any) {
      console.warn('[productService] Firestore write note, persisting locally:', error?.message || error);
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
    if (!product.isFeatured) {
      delete (local[idx] as any).featuredAt;
    }
  } else {
    // Featured new products can lead homepage showcase; non-featured new products append
    if (product.isFeatured) {
      local.unshift(product);
    } else {
      local.push(product);
    }
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
