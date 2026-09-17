import type { Product } from '../types';

const normalize = (value?: string | null) =>
  (value || '')
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ');

/**
 * Maps any category name, slug, or search term to one of the 9 canonical category keys.
 * Note: 'earrings' is checked before 'rings' so that the substring 'ring' never matches earrings.
 */
export function getCanonicalCategory(categoryOrSlug?: string | null): string {
  const norm = normalize(categoryOrSlug);
  if (!norm) return '';

  // 1. Earrings (must check before rings to avoid substring collision)
  if (norm.includes('earring') || norm.includes('jhumka') || norm.includes('stud') || norm.includes('chandbali')) {
    return 'earrings';
  }

  // 2. Rings (strictly ring/rings, not earrings)
  if (/\brings?\b/.test(norm) || norm === 'cat rings' || norm === 'rings' || norm === 'ring') {
    return 'rings';
  }

  // 3. Neck Jewellery
  if (
    norm.includes('neck') ||
    norm.includes('chain') ||
    norm.includes('choker') ||
    norm.includes('necklace') ||
    norm === 'cat neck jewellery'
  ) {
    return 'neck-jewellery';
  }

  // 4. Pendants
  if (norm.includes('pendant') || norm.includes('kavach') || norm.includes('locket') || norm === 'cat pendants') {
    return 'pendants';
  }

  // 5. Bracelets & Bangles
  if (
    norm.includes('bracelet') ||
    norm.includes('bangle') ||
    norm.includes('kada') ||
    norm === 'cat bracelets bangles'
  ) {
    return 'bracelets-bangles';
  }

  // 6. Gemstones (astrological stones, loose gemstones)
  if (norm.includes('gemstone') || norm === 'cat gemstones') {
    return 'gemstones';
  }

  // 7. Spiritual Maalas
  if (norm.includes('maala') || norm.includes('mala') || norm === 'cat spiritual maalas') {
    return 'spiritual-maalas';
  }

  // 8. Rudraksha
  if (norm.includes('rudraksha') || norm.includes('mukhi') || norm === 'cat rudraksha') {
    return 'rudraksha';
  }

  // 9. God Small Statues
  if (
    norm.includes('statue') ||
    norm.includes('idol') ||
    norm.includes('god') ||
    norm.includes('murti') ||
    norm === 'cat god statues'
  ) {
    return 'god-small-statues';
  }

  return norm;
}

export function isGemstoneProduct(product: Product): boolean {
  const catKey = getCanonicalCategory(product.category);
  if (catKey === 'gemstones') return true;
  const subKey = getCanonicalCategory(product.subcategory);
  return subKey === 'gemstones';
}

export function productMatchesCategory(product: Product, selectedCategory: string): boolean {
  if (!selectedCategory || selectedCategory === 'ALL' || selectedCategory === 'all') return true;

  const targetCanonical = getCanonicalCategory(selectedCategory);
  const productCategoryCanonical = getCanonicalCategory(product.category);

  // Exact canonical match on product primary category
  if (targetCanonical && productCategoryCanonical && targetCanonical === productCategoryCanonical) {
    return true;
  }

  // Check subcategory
  const productSubcategoryCanonical = getCanonicalCategory(product.subcategory);
  if (targetCanonical && productSubcategoryCanonical && targetCanonical === productSubcategoryCanonical) {
    return true;
  }

  // Direct string match fallback
  const normSelected = normalize(selectedCategory);
  const normCat = normalize(product.category);
  const normSub = normalize(product.subcategory);

  if (normCat === normSelected || normSub === normSelected) {
    return true;
  }

  return false;
}

export function isProductActive(product?: Product | null): boolean {
  if (!product) return false;
  if (product.enabled === false) return false;
  if (product.status === 'HIDDEN' || product.status === 'DRAFT' || product.status === 'ARCHIVED') return false;
  return true;
}

