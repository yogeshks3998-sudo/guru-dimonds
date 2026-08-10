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
  if (category === selected || subcategory === selected) return true;

  // Synonyms & Fuzzy Category Matching for the official 9 Categories
  if (selected.includes('ring')) {
    return category.includes('ring') || subcategory.includes('ring');
  }

  if (selected.includes('earring') || selected.includes('jhumka')) {
    return category.includes('earring') || subcategory.includes('earring') || subcategory.includes('jhumka');
  }

  if (selected.includes('neck') || selected.includes('chain') || selected.includes('necklace')) {
    return category.includes('neck') || category.includes('chain') || subcategory.includes('chain') || subcategory.includes('necklace');
  }

  if (selected.includes('pendant')) {
    return category.includes('pendant') || subcategory.includes('pendant');
  }

  if (selected.includes('bracelet') || selected.includes('bangle') || selected.includes('kada')) {
    return (
      category.includes('bracelet') ||
      category.includes('bangle') ||
      subcategory.includes('bracelet') ||
      subcategory.includes('bangle') ||
      subcategory.includes('kada')
    );
  }

  if (selected.includes('gemstone')) {
    return isGemstoneProduct(product) || category.includes('gemstone');
  }

  if (selected.includes('maala') || selected.includes('mala')) {
    return category.includes('maala') || subcategory.includes('maala') || category.includes('mala');
  }

  if (selected.includes('rudraksha')) {
    return category.includes('rudraksha') || subcategory.includes('rudraksha');
  }

  if (selected.includes('statue') || selected.includes('idol') || selected.includes('god')) {
    return category.includes('statue') || category.includes('idol') || subcategory.includes('statue') || subcategory.includes('idol');
  }

  return category.includes(selected) || subcategory.includes(selected);
}
