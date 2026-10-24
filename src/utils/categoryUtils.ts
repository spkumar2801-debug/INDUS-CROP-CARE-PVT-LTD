import { Product } from '../types/product';

export const MAIN_CATEGORIES = [
  'All Products',
  'Insecticides',
  'Herbicides',
  'Fungicides',
  'Organic Fertilizers',
  'Water-Soluble Fertilizers',
  'Biofertilizers',
  'Micronutrients / Nutrients',
  'Micronutrients Combo',
  'Biostimulants',
  'Seeds',
  'Antibiotic Products',
  'PGR (Plant Growth Regulators)'
] as const;

export type MainCategory = typeof MAIN_CATEGORIES[number];

/**
 * Normalizes any category string (from URL query param, legacy link, or product data)
 * to one of the canonical 12 MAIN_CATEGORIES.
 */
export function normalizeCategory(raw?: string | null): MainCategory {
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

  if (lower === 'biostimulants' || lower === 'biostimulant' || lower === 'biostimulants') {
    return 'Biostimulants';
  }

  if (lower === 'pgr' || lower.includes('growthregulator') || lower === 'pgrplantgrowthregulators') {
    return 'PGR (Plant Growth Regulators)';
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

  // Fallback: check if exact match exists in MAIN_CATEGORIES
  const exactMatch = MAIN_CATEGORIES.find(c => c.toLowerCase() === clean.toLowerCase());
  if (exactMatch) return exactMatch;

  return 'All Products';
}

/**
 * Assigns a product to its verified canonical main category.
 */
export function getProductMainCategory(product: Product): Exclude<MainCategory, 'All Products'> {
  // 1. Seeds
  if (
    product.broadGroup === 'Seeds' ||
    product.category === 'Seeds' ||
    product.category === 'Hybrid Seeds' ||
    product.id.startsWith('ias-') ||
    ['Bitter Gourd', 'Cucumber', 'Okra', 'Chilli', 'Tomato', 'Marigold', 'Brinjal', 'Ridge Gourd', 'Bottle Gourd', 'Watermelon'].includes(product.category)
  ) {
    return 'Seeds';
  }

  // 2. PGR (Plant Growth Regulators)
  if (
    product.broadGroup === 'PGR' ||
    product.category === 'Plant Growth Regulator' ||
    product.category === 'PGR (Plant Growth Regulators)' ||
    product.category === 'PGR' ||
    product.id === 'indus-gabbarking'
  ) {
    return 'PGR (Plant Growth Regulators)';
  }

  // 3. Antibiotic Products
  if (
    product.category === 'Antibiotic Products' ||
    product.category === 'Antibiotics' ||
    product.broadGroup === 'Antibiotic Products' ||
    product.broadGroup === 'Antibiotics' ||
    product.id === 'indus-bactin' ||
    product.id === 'indus-activ8'
  ) {
    return 'Antibiotic Products';
  }

  // 4. Biostimulants
  if (
    product.broadGroup === 'Biostimulants' ||
    product.category === 'Bio Stimulants' ||
    product.category === 'Biostimulants'
  ) {
    return 'Biostimulants';
  }

  // 5. Biofertilizers (distinguished from Organic Fertilizers)
  if (
    (product.category === 'Biofertilizers' ||
     product.category === 'Bio Fertilizers' ||
     product.broadGroup === 'Biofertilizers' ||
     product.broadGroup === 'Bio Fertilizers') &&
    product.category !== 'Organic Fertilizers'
  ) {
    return 'Biofertilizers';
  }

  // 6. Organic Fertilizers
  if (
    product.category === 'Organic Fertilizers' ||
    product.broadGroup === 'Organic Fertilizers'
  ) {
    return 'Organic Fertilizers';
  }

  // 7. Water-Soluble Fertilizers
  if (
    product.category === 'Water-Soluble Fertilizers' ||
    product.category === 'Water Soluble Fertilizers' ||
    product.broadGroup === 'Water-Soluble Fertilizers'
  ) {
    return 'Water-Soluble Fertilizers';
  }

  // 8. Micronutrients Combo
  if (
    product.category === 'Micronutrients Combo' ||
    product.category === 'Micronutrient Combo' ||
    product.broadGroup === 'Micronutrients Combo' ||
    product.broadGroup === 'Micronutrient Combo'
  ) {
    return 'Micronutrients Combo';
  }

  // 9. Micronutrients / Nutrients
  if (
    product.category === 'Micronutrients / Nutrients' ||
    product.category === 'Micro Nutrient' ||
    product.category === 'Micro Nutrients' ||
    product.category === 'Micronutrients' ||
    product.broadGroup === 'Micronutrients / Nutrients' ||
    product.broadGroup === 'Nutrients' ||
    product.broadGroup === 'Micronutrients'
  ) {
    return 'Micronutrients / Nutrients';
  }

  // 9. Fungicides
  if (
    product.category === 'Fungicides' ||
    product.broadGroup === 'Fungicides'
  ) {
    return 'Fungicides';
  }

  // 10. Herbicides
  if (
    product.category === 'Herbicides' ||
    product.broadGroup === 'Herbicides'
  ) {
    return 'Herbicides';
  }

  // 11. Insecticides
  if (
    product.category === 'Insecticides' ||
    product.broadGroup === 'Insecticides'
  ) {
    return 'Insecticides';
  }

  return 'Insecticides'; // Default safe fallback
}

/**
 * Checks whether a product matches the selected category filter.
 */
export function matchesCategory(product: Product, category: MainCategory | string): boolean {
  const normalizedTarget = normalizeCategory(category);
  if (normalizedTarget === 'All Products') {
    return true;
  }
  return getProductMainCategory(product) === normalizedTarget;
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
 * Computes exact product counts for all main categories.
 */
export function computeCategoryCounts(products: Product[]): Record<MainCategory, number> {
  const counts: Record<MainCategory, number> = {
    'All Products': products.length,
    'Insecticides': 0,
    'Herbicides': 0,
    'Fungicides': 0,
    'Organic Fertilizers': 0,
    'Water-Soluble Fertilizers': 0,
    'Biofertilizers': 0,
    'Micronutrients / Nutrients': 0,
    'Micronutrients Combo': 0,
    'Biostimulants': 0,
    'Seeds': 0,
    'Antibiotic Products': 0,
    'PGR (Plant Growth Regulators)': 0
  };

  for (const product of products) {
    const mainCat = getProductMainCategory(product);
    if (counts[mainCat] !== undefined) {
      counts[mainCat]++;
    }
  }

  return counts;
}
