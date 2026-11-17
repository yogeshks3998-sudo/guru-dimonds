import type { Product } from '../types';
import { SUPPLIER_PRODUCT_DRAFTS } from '../data/supplierProductBatches';

export const RETAINED_SUPPLIER_IDS = new Set(SUPPLIER_PRODUCT_DRAFTS.map((p) => p.id));
export const RETAINED_SUPPLIER_SKUS = new Set(SUPPLIER_PRODUCT_DRAFTS.map((p) => p.sku));
export const RETAINED_SUPPLIER_SLUGS = new Set(SUPPLIER_PRODUCT_DRAFTS.map((p) => p.slug));

export const DEMO_PRODUCT_SLUGS = new Set([
  'royal-gomedhika-gemstone-ring',
  'imperial-emerald-cut-925-silver-ring',
  'solitaire-diamond-illusion-setting-band',
  'classic-floral-diamond-cluster-silver-ring',
  'princess-cut-statement-silver-ring',
  'vintage-filigree-navarathna-cocktail-ring',
  'oval-cut-royal-blue-sapphire-silver-band',
  'men-s-bold-onyx-diamond-silver-signet-ring',
  'delicate-twin-heart-pav-diamond-ring',
  'crown-imperial-halo-diamond-silver-ring',
  'infinity-twist-pav-sterling-silver-ring',
  'regal-ruby-diamond-silver-cocktail-ring',
  'pear-cut-tear-drop-solitaire-silver-ring',
  'artisan-textured-dual-tone-silver-ring',
  'traditional-temple-navarathna-drop-earrings',
  'sparkling-diamond-halo-stud-earrings',
  'royal-jhumki-with-hanging-pearl-bells',
  'classic-round-brilliant-solitaire-studs',
  'grand-chandbali-filigree-silver-earrings',
  'modern-geometric-drop-dangle-earrings',
  'floral-cluster-diamond-chandelier-earrings',
  'emerald-diamond-tiered-drop-earrings',
  'antique-oxidized-heritage-silver-jhumkas',
  'delicate-heart-drop-diamond-huggies',
  'starburst-pav-diamond-silver-studs',
  'contemporary-loop-huggie-silver-earrings',
  'sacred-shree-ganesha-silver-temple-pendant',
  'divine-omkara-diamond-studded-silver-pendant',
  'royal-emerald-halo-solitaire-silver-pendant',
  'veera-hanuman-kavach-silver-sacred-amulet',
  'navarathna-cosmic-mandala-silver-locket',
  'brilliant-solitaire-diamond-illusion-pendant',
  'peacock-motif-enamel-925-silver-pendant',
  'sacred-trishul-damru-silver-mahadev-pendant',
  'classic-tear-drop-diamond-halo-silver-pendant',
  'lord-shiva-medallion-temple-silver-pendant',
  'blossom-floral-cluster-silver-diamond-pendant',
  'infinity-heart-duo-diamond-silver-pendant',
  'astrological-ruby-sun-surya-yantra-pendant',
  'vintage-filigree-oval-locket-silver-pendant',
  'grand-bridal-diamond-gemstone-silver-choker',
  'solid-925-sterling-silver-royal-link-chain',
  'traditional-antique-temple-nakshi-long-haram',
  'cascading-pav-diamond-silver-statement-necklace',
  'heavy-franco-curb-silver-men-s-link-chain',
  'contemporary-layered-diamond-y-drop-necklace',
  'regal-navarathna-silver-statement-collar',
  'divine-lord-ganesha-idol-handcrafted-silver-finish',
  'sacred-goddess-lakshmi-idol-wealth-prosperity',
  'radha-krishna-eternal-divine-brass-silver-idol',
  'lord-shiva-in-dhyana-mudra-meditation-statue',
  'lord-venkateshwara-balaji-sacred-pooja-vigraha',
  'sacred-kamadhenu-cow-calf-prosperity-idol',
  'panchamukhi-veera-hanuman-powerful-idol',
  'goddess-saraswati-idol-wisdom-fine-arts',
  'sacred-shivling-with-nandi-shrine-temple-idol',
]);

export function isDemoProduct(productOrIdentifier: Product | string | { id?: string; sku?: string; slug?: string }): boolean {
  if (typeof productOrIdentifier === 'string') {
    const s = productOrIdentifier.trim();
    if (RETAINED_SUPPLIER_IDS.has(s) || RETAINED_SUPPLIER_SKUS.has(s) || RETAINED_SUPPLIER_SLUGS.has(s)) {
      return false;
    }
    if (/^prod-(ring|earring|pendant|neck|statue)-\d+$/i.test(s) || /^GURU-(RNG|EAR|PND|NCK|STA)-/i.test(s)) {
      return true;
    }
    return DEMO_PRODUCT_SLUGS.has(s.toLowerCase());
  }

  const p = productOrIdentifier;
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
    && !supplierPublicationError(product) && product.supplierReview?.purchaseMode !== 'ENQUIRY';
}
