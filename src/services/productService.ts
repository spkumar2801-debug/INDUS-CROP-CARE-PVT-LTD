import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  serverTimestamp 
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../lib/firebase';
import { Product } from '../types/product';
import { INITIAL_PRODUCTS } from '../data/initialProducts';

const PRODUCTS_COLLECTION = 'products';
const LOCAL_STORAGE_KEY = 'indus_products_cache_v5';

function deduplicateProducts(list: Product[]): Product[] {
  const map = new Map<string, Product>();
  list.forEach(p => {
    if (p && p.id) {
      map.set(p.id, p);
    }
  });
  return Array.from(map.values());
}

function getLocalProducts(): Product[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return deduplicateProducts(parsed);
      }
    }
  } catch (e) {
    console.error('Error reading local products cache:', e);
  }
  // Initialize with the 4 authentic products from client spec sheets
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_PRODUCTS));
  return INITIAL_PRODUCTS;
}

function saveLocalProducts(products: Product[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(deduplicateProducts(products)));
  } catch (e) {
    console.error('Error saving local products:', e);
  }
}

export async function getPublishedProducts(): Promise<Product[]> {
  if (isFirebaseConfigured && db) {
    try {
      const q = query(
        collection(db, PRODUCTS_COLLECTION),
        where('isPublished', '==', true)
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Product));
        return deduplicateProducts(list).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
      }
    } catch (error) {
      console.warn('[productService] Firestore query failed, using local seed:', error);
    }
  }

  // Fallback to local products that are published
  const local = getLocalProducts();
  return deduplicateProducts(local.filter(p => p.isPublished)).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
}

export async function getAllProductsAdmin(): Promise<Product[]> {
  if (isFirebaseConfigured && db) {
    try {
      const q = query(collection(db, PRODUCTS_COLLECTION));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Product));
        return deduplicateProducts(list).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
      }
    } catch (error) {
      console.warn('[productService] Firestore admin query failed, using local store:', error);
    }
  }

  return deduplicateProducts(getLocalProducts()).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
}

export async function getProductById(id: string): Promise<Product | null> {
  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, PRODUCTS_COLLECTION, id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Product;
      }
    } catch (error) {
      console.warn('[productService] Firestore getDoc failed, falling back to local:', error);
    }
  }

  const local = getLocalProducts();
  return local.find(p => p.id === id || p.slug === id) || null;
}

export async function saveProduct(productData: Partial<Product>, id?: string): Promise<string> {
  const now = new Date().toISOString();
  
  if (isFirebaseConfigured && db) {
    try {
      if (id) {
        const docRef = doc(db, PRODUCTS_COLLECTION, id);
        await updateDoc(docRef, {
          ...productData,
          updatedAt: serverTimestamp()
        });
        updateLocalCopy({ ...productData, id, updatedAt: now } as Product);
        return id;
      } else {
        const docRef = await addDoc(collection(db, PRODUCTS_COLLECTION), {
          ...productData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        updateLocalCopy({ ...productData, id: docRef.id, createdAt: now, updatedAt: now } as Product);
        return docRef.id;
      }
    } catch (error) {
      console.warn('[productService] Firestore write failed, saving locally:', error);
    }
  }

  // Local fallback save
  const local = getLocalProducts();
  if (id) {
    const idx = local.findIndex(p => p.id === id);
    if (idx >= 0) {
      local[idx] = { ...local[idx], ...productData, updatedAt: now } as Product;
      saveLocalProducts(local);
      return id;
    }
  }

  const newId = id || `indas-prod-${Date.now()}`;
  const newProduct: Product = {
    id: newId,
    name: productData.name || '',
    code: productData.code || '',
    slug: productData.slug || `prod-${Date.now()}`,
    category: productData.category || 'Vegetable',
    shortDescription: productData.shortDescription || '',
    description: productData.description || '',
    features: productData.features || [],
    specifications: productData.specifications || [],
    imageUrl: productData.imageUrl || '/images/products/ias-405.jpg',
    isPublished: productData.isPublished ?? true,
    sortOrder: productData.sortOrder ?? (local.length + 1),
    createdAt: now,
    updatedAt: now,
    ...productData
  } as Product;

  local.push(newProduct);
  saveLocalProducts(local);
  return newId;
}

function updateLocalCopy(product: Product): void {
  const local = getLocalProducts();
  const idx = local.findIndex(p => p.id === product.id);
  if (idx >= 0) {
    local[idx] = { ...local[idx], ...product };
  } else {
    local.push(product);
  }
  saveLocalProducts(local);
}

export async function deleteProduct(id: string): Promise<void> {
  if (isFirebaseConfigured && db) {
    try {
      await deleteDoc(doc(db, PRODUCTS_COLLECTION, id));
    } catch (error) {
      console.warn('[productService] Firestore deleteDoc failed:', error);
    }
  }

  const local = getLocalProducts().filter(p => p.id !== id);
  saveLocalProducts(local);
}
