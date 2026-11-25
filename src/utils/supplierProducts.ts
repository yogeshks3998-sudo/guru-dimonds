import type { Product } from '../types';
import { SUPPLIER_PRODUCT_DRAFTS } from '../data/supplierProductBatches';

export const RETAINED_SUPPLIER_IDS = new Set(SUPPLIER_PRODUCT_DRAFTS.map((p) => p.id));
export const RETAINED_SUPPLIER_SKUS = new Set(SUPPLIER_PRODUCT_DRAFTS.map((p) => p.sku));
export const RETAINED_SUPPLIER_SLUGS = new Set(SUPPLIER_PRODUCT_DRAFTS.map((p) => p.slug));

export const DEMO_PRODUCT_SLUGS = new Set<string>();

export function isDemoProduct(productOrIdentifier: Product | string | { id?: string; sku?: string; slug?: string }): boolean {
  if (typeof productOrIdentifier === 'string') {
    const s = productOrIdentifier.trim();
    if (s.startsWith('prod-enquiry-') || s.startsWith('GURU-ENQ-')) {
      return false;
    }
    if (RETAINED_SUPPLIER_IDS.has(s) || RETAINED_SUPPLIER_SKUS.has(s) || RETAINED_SUPPLIER_SLUGS.has(s)) {
      return false;
    }
    if (/^prod-(ring|earring|pendant|neck|statue)-\d+$/i.test(s) || /^GURU-(RNG|EAR|PND|NCK|STA)-/i.test(s)) {
      return true;
    }
    return DEMO_PRODUCT_SLUGS.has(s.toLowerCase());
  }

  const p = productOrIdentifier;
  if (p.id?.startsWith('prod-enquiry-') || p.sku?.startsWith('GURU-ENQ-')) {
    return false;
  }
  if ((p.id && RETAINED_SUPPLIER_IDS.has(p.id)) || (p.sku && RETAINED_SUPPLIER_SKUS.has(p.sku)) || (p.slug && RETAINED_SUPPLIER_SLUGS.has(p.slug))) {
    return false;
  }

  if (p.id && isDemoProduct(p.id)) return true;
  if (p.sku && isDemoProduct(p.sku)) return true;
  if (p.slug && isDemoProduct(p.slug)) return true;

  return false;
}

export function filterRetainedProducts(products: Product[]): Product[] {
  return products.filter((p) => !isDemoProduct(p));
}

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
    && product.pricingMode !== 'ENQUIRY'
    && !supplierPublicationError(product) && product.supplierReview?.purchaseMode !== 'ENQUIRY';
}
