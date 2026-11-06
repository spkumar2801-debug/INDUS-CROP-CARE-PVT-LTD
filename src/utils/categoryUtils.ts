import { Product } from '../types/product';
import { IMPORTANT_PRODUCT_CATEGORIES, getCustomProductCategories } from '../services/productService';

export const MAIN_CATEGORIES = [
  'All Products',
  ...IMPORTANT_PRODUCT_CATEGORIES,
  'Others'
] as const;

export type MainCategory = string;

/**
 * Normalizes any category string (from URL query param, legacy link, or product data)
 * to one of the canonical categories or an active custom category.
 */
export function normalizeCategory(raw?: string | null): string {
  if (!raw) return 'All Products';
  const clean = raw.trim();
  const lower = clean.toLowerCase().replace(/[\s_\-/]+/g, '');

  if (
    clean === 'All' || 
    clean === 'All Products' || 
    clean === 'All Formulations' ||
    lower === 'all' || 
    lower === 'allproducts' ||
    lower === 'allformulations'
  ) {
    return 'All Products';
  }

  if (lower === 'others' || lower === 'other') {
    return 'Others';
  }

  // Check active custom product categories
  const custom = getCustomProductCategories();
  const matchedCustom = custom.find(c => c.toLowerCase() === clean.toLowerCase());
  if (matchedCustom) {
    return matchedCustom;
  }

  if (lower === 'insecticides' || lower === 'insecticide') {
    return 'Insecticides';
  }

  if (lower === 'herbicides' || lower === 'herbicide') {
    return 'Herbicides';
  }

  if (lower === 'fungicides' || lower === 'fungicide') {
    return 'Fungicides';
  }

  if (lower === 'organicfertilizers' || lower === 'organicfertilizer') {
    return 'Organic Fertilizers';
  }

  if (lower === 'watersolublefertilizers' || lower === 'watersolublefertilizer') {
    return 'Water-Soluble Fertilizers';
  }

  if (lower === 'biofertilizers' || lower === 'biofertilizer' || lower === 'biologicals') {
    return 'Biofertilizers';
  }

  if (
    lower === 'micronutrientscombo' || 
    lower === 'micronutrientcombo' || 
    lower === 'microcombo' ||
    lower.includes('micronutrientcombo') ||
    lower.includes('micronutrientscombo')
  ) {
    return 'Micronutrients Combo';
  }

  if (
    lower.includes('micro') || 
    lower.includes('nutrient') || 
    lower === 'micronutrientsnutrients'
  ) {
    return 'Micronutrients / Nutrients';
  }

  if (lower === 'biostimulants' || lower === 'biostimulant' || clean === 'Bio Stimulants') {
    return 'Bio Stimulants';
  }

  if (lower === 'pgr' || lower.includes('growthregulator') || lower === 'pgrplantgrowthregulators') {
    return 'Plant Growth Regulator (PGR)';
  }

  if (lower.includes('antibiotic')) {
    return 'Antibiotic Products';
  }

  if (
    lower === 'seeds' || 
    lower === 'hybridseeds' || 
    ['bittergourd', 'cucumber', 'okra', 'chilli', 'tomato', 'marigold', 'brinjal', 'ridgegourd', 'bottlegourd', 'watermelon'].includes(lower)
  ) {
    return 'Seeds';
  }

  // Fallback: check if exact match exists in IMPORTANT_PRODUCT_CATEGORIES
  const exactMatch = IMPORTANT_PRODUCT_CATEGORIES.find(c => c.toLowerCase() === clean.toLowerCase());
  if (exactMatch) return exactMatch;

  return clean || 'All Products';
}

/**
 * Assigns a product to its verified canonical or custom category.
 */
export function getProductMainCategory(product: Product): string {
  const cat = (product.category || '').trim();
  const lowerCat = cat.toLowerCase();

  // 0. Explicit Others
  if (lowerCat === 'others' || lowerCat === 'other') {
    return 'Others';
  }

  // 0.1 Check custom categories
  const custom = getCustomProductCategories();
  const matchedCustom = custom.find(c => c.toLowerCase() === lowerCat);
  if (matchedCustom) {
    return matchedCustom;
  }

  // 1. Seeds
  if (
    product.broadGroup === 'Seeds' ||
    cat === 'Seeds' ||
    cat === 'Hybrid Seeds' ||
    product.id.startsWith('ias-') ||
    ['Bitter Gourd', 'Cucumber', 'Okra', 'Chilli', 'Tomato', 'Marigold', 'Brinjal', 'Ridge Gourd', 'Bottle Gourd', 'Watermelon'].includes(cat)
  ) {
    return 'Seeds';
  }

  // 2. PGR (Plant Growth Regulators)
  if (
    product.broadGroup === 'PGR' ||
    cat === 'Plant Growth Regulator (PGR)' ||
    cat === 'Plant Growth Regulator' ||
    cat === 'PGR (Plant Growth Regulators)' ||
    cat === 'PGR' ||
    product.id === 'indus-gabbarking'
  ) {
    return 'Plant Growth Regulator (PGR)';
  }

  // 3. Antibiotic Products
  if (
    cat === 'Antibiotic Products' ||
    cat === 'Antibiotics' ||
    product.broadGroup === 'Antibiotic Products' ||
    product.broadGroup === 'Antibiotics' ||
    product.id === 'indus-bactin' ||
    product.id === 'indus-activ8'
  ) {
    return 'Antibiotic Products';
  }

  // 4. Bio Stimulants
  if (
    product.broadGroup === 'Biostimulants' ||
    cat === 'Bio Stimulants' ||
    cat === 'Biostimulants'
  ) {
    return 'Bio Stimulants';
  }

  // 5. Biofertilizers (distinguished from Organic Fertilizers)
  if (
    (cat === 'Biofertilizers' ||
     cat === 'Bio Fertilizers' ||
     product.broadGroup === 'Biofertilizers' ||
     product.broadGroup === 'Bio Fertilizers') &&
    cat !== 'Organic Fertilizers'
  ) {
    return 'Biofertilizers';
  }

  // 6. Organic Fertilizers
  if (
    cat === 'Organic Fertilizers' ||
    product.broadGroup === 'Organic Fertilizers'
  ) {
    return 'Organic Fertilizers';
  }

  // 7. Water-Soluble Fertilizers
  if (
    cat === 'Water-Soluble Fertilizers' ||
    cat === 'Water Soluble Fertilizers' ||
    product.broadGroup === 'Water-Soluble Fertilizers'
  ) {
    return 'Water-Soluble Fertilizers';
  }

  // 8. Micronutrients Combo
  if (
    cat === 'Micronutrients Combo' ||
    cat === 'Micronutrient Combo' ||
    product.broadGroup === 'Micronutrients Combo' ||
    product.broadGroup === 'Micronutrient Combo'
  ) {
    return 'Micronutrients Combo';
  }

  // 9. Micronutrients / Nutrients
  if (
    cat === 'Micronutrients / Nutrients' ||
    cat === 'Micro Nutrient' ||
    cat === 'Micro Nutrients' ||
    cat === 'Micronutrients' ||
    product.broadGroup === 'Micronutrients / Nutrients' ||
    product.broadGroup === 'Nutrients' ||
    product.broadGroup === 'Micronutrients'
  ) {
    return 'Micronutrients / Nutrients';
  }

  // 10. Fungicides
  if (
    cat === 'Fungicides' ||
    product.broadGroup === 'Fungicides'
  ) {
    return 'Fungicides';
  }

  // 11. Herbicides
  if (
    cat === 'Herbicides' ||
    product.broadGroup === 'Herbicides'
  ) {
    return 'Herbicides';
  }

  // 12. Insecticides
  if (
    cat === 'Insecticides' ||
    product.broadGroup === 'Insecticides'
  ) {
    return 'Insecticides';
  }

  // Safe fallback: If non-empty, keep category; otherwise 'Others'
  return cat || 'Others';
}

/**
 * Checks whether a product matches the selected category filter.
 */
export function matchesCategory(product: Product, category: string): boolean {
  const normalizedTarget = normalizeCategory(category);
  if (normalizedTarget === 'All Products') {
    return true;
  }
  const prodCat = getProductMainCategory(product);
  if (normalizedTarget.toLowerCase() === 'others') {
    return prodCat.toLowerCase() === 'others' || prodCat.toLowerCase() === 'other';
  }
  return prodCat.toLowerCase() === normalizedTarget.toLowerCase();
}

/**
 * Performs deep multi-field search against product name, code, active ingredients,
 * formulations, composition, specifications, and descriptions.
 */
export function matchesProductSearch(product: Product, rawQuery: string): boolean {
  if (!rawQuery) return true;
  const q = rawQuery.toLowerCase().trim();
  if (!q) return true;

  // Name match
  if (product.name && product.name.toLowerCase().includes(q)) return true;

  // Code match (e.g. "ICC-001", "IAS 405", ignoring spaces and hyphens)
  if (product.code) {
    const normCode = product.code.toLowerCase().replace(/[\s-]+/g, '');
    const normQ = q.replace(/[\s-]+/g, '');
    if (normCode.includes(normQ)) return true;
  }

  // Formulation match (active technical ingredients e.g., "Diafenthiuron 50% WP")
  if (product.formulation && product.formulation.toLowerCase().includes(q)) return true;

  // Composition match
  if (product.composition && product.composition.toLowerCase().includes(q)) return true;

  // Category name or Telugu category match
  if (product.category && product.category.toLowerCase().includes(q)) return true;
  if (product.categoryTelugu && product.categoryTelugu.toLowerCase().includes(q)) return true;

  // Description and short description match
  if (product.shortDescription && product.shortDescription.toLowerCase().includes(q)) return true;
  if (product.description && product.description.toLowerCase().includes(q)) return true;

  // Specifications match (labels and values like "Technical Composition")
  if (product.specifications && Array.isArray(product.specifications)) {
    for (const spec of product.specifications) {
      if (spec.label && spec.label.toLowerCase().includes(q)) return true;
      if (spec.value && spec.value.toLowerCase().includes(q)) return true;
    }
  }

  // Features list match
  if (product.features && Array.isArray(product.features)) {
    for (const feature of product.features) {
      if (feature && feature.toLowerCase().includes(q)) return true;
    }
  }

  return false;
}

/**
 * Computes exact product counts across all active categories.
 */
export function computeCategoryCounts(products: Product[], allCategories?: string[]): Record<string, number> {
  const categoriesToCount = (allCategories && allCategories.length > 0)
    ? allCategories
    : ['All Products', ...IMPORTANT_PRODUCT_CATEGORIES, ...getCustomProductCategories(), 'Others'];

  const counts: Record<string, number> = {
    'All Products': products.length
  };
  categoriesToCount.forEach(cat => {
    counts[cat] = 0;
  });

  for (const product of products) {
    const mainCat = getProductMainCategory(product);
    const key = categoriesToCount.find(c => c.toLowerCase() === mainCat.toLowerCase());
    if (key && counts[key] !== undefined) {
      counts[key]++;
    } else if (counts['Others'] !== undefined) {
      counts['Others']++;
    }
  }

  return counts;
}
