import type { Product } from '../types';

const normalize = (value?: string | null) => (value || '').trim().toLowerCase();

export function isGemstoneProduct(product: Product): boolean {
  const searchableText = [
    product.category,
    product.subcategory,
    product.collection,
    product.name,
    product.shortDescription,
    product.description,
    ...product.tags,
    ...product.gemstones.map((gemstone) => gemstone.type),
  ]
    .map(normalize)
    .join(' ');

  return /\bgemstone(s)?\b/.test(searchableText) || /\bstone(s)?\b/.test(searchableText);
}

export function productMatchesCategory(product: Product, selectedCategory: string): boolean {
  const selected = normalize(selectedCategory);
  const category = normalize(product.category);
  const subcategory = normalize(product.subcategory);

  if (!selected) return true;
  if (category === selected) return true;
  if (selected === 'gemstones') return isGemstoneProduct(product);

  return category.includes(selected) || subcategory.includes(selected);
}
