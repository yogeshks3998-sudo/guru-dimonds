import type { Product } from '../../src/types';
import { SILVER_COLLECTION_PRODUCTS } from '../../src/data/silverCollectionProducts';
import { INITIAL_CATEGORIES } from '../../src/data/mockData';
import { isSameSupplierProduct } from '../../src/utils/supplierProducts';
import { toProductCreateData } from '../../backend/src/utils/serializers';

export function planSilverImport(existing: Product[]) {
  const seen = [...existing];
  const create: Product[] = [];
  const skip: { sku: string; existingId: string; reason: string }[] = [];
  for (const product of SILVER_COLLECTION_PRODUCTS) {
    const match = seen.find((p) => isSameSupplierProduct(p, product));
    if (match) skip.push({ sku: product.sku, existingId: match.id, reason: 'Identity, content or specification match; existing record preserved for manual review.' });
    else { create.push(product); seen.push(product); }
  }
  return { create, skip };
}

export async function applySilverImport(tx: any) {
  // Caller owns serializable transaction. All duplicate checks occur before writes.
  const existing = await tx.product.findMany({ include: { variants: true } });
  const plan = planSilverImport(existing);
  const created: string[] = [];
  for (const product of plan.create) {
    let category = await tx.category.findFirst({ where: { name: { equals: product.category, mode: 'insensitive' } } });
    if (!category) {
      const initial = INITIAL_CATEGORIES.find((c) => c.name === product.category)!;
      const { enabled, ...categoryData } = initial;
      category = await tx.category.create({ data: { ...categoryData, subcategories: [...new Set([...initial.subcategories, product.subcategory])] } });
    } else {
      const subs: string[] = Array.isArray(category.subcategories) ? category.subcategories : [];
      if (!subs.includes(product.subcategory)) await tx.category.update({ where: { id: category.id }, data: { subcategories: [...subs, product.subcategory] } });
    }
    await tx.product.create({ data: {
      ...toProductCreateData(product),
      inventoryItems: { create: [{ sku: product.sku, quantity: 0 }] },
    } });
    created.push(product.sku);
  }
  return { created, skipped: plan.skip };
}
