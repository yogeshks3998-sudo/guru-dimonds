import type { Product } from '../types';

const normalise = (s: string) => s.toLowerCase().replace(/navarathna|navratna/g, 'navaratna').replace(/[^a-z0-9]/g, '');
export function isSameSupplierProduct(a: Product, b: Product): boolean {
  return a.id === b.id || normalise(a.sku) === normalise(b.sku) || normalise(a.slug) === normalise(b.slug)
    || (normalise(a.name) === normalise(b.name))
    || (a.description === b.description)
    || (a.category === b.category && a.metalType === b.metalType
      && a.netWeightGrams === b.netWeightGrams && a.grossWeightGrams === b.grossWeightGrams
      && a.makingChargeValue === b.makingChargeValue);
}
export function mergeMissingSupplierProducts(existing: Product[], incoming: Product[]): Product[] {
  const result = [...existing];
  for (const product of incoming) {
    if (!result.some((saved) => isSameSupplierProduct(saved, product))) result.push(product);
  }
  return result;
}
export function supplierPublicationError(product: Product): string | null {
  if (!product.supplierReview) return null;
  if (product.supplierReview.state !== 'APPROVED' || product.supplierReview.issues.length
    || product.supplierReview.pendingFields.length || !product.supplierReview.resolutionNotes.trim()
    || product.supplierReview.pricing.gstBasis === 'UNKNOWN'
    || product.supplierReview.pricing.gstPercentage === null
    || product.supplierReview.pricing.gstAmount === null
    || product.metalPurity === 'UNVERIFIED' || product.metalColor === 'UNVERIFIED' || !product.images.length
    || product.pricingMode !== 'FIXED' || !Number.isFinite(product.fixedPrice) || !(product.fixedPrice! > 0)
    || product.gstPercentage !== product.supplierReview.pricing.gstPercentage) {
    return 'Supplier review incomplete: verify images, purity, specifications, price and GST before publication.';
  }
  return null;
}
export function canPurchaseProduct(product: Product): boolean {
  return product.status === 'ACTIVE' && product.enabled !== false
    && !supplierPublicationError(product) && product.supplierReview?.purchaseMode !== 'ENQUIRY';
}
