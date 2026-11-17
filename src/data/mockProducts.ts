import { Product } from '../types';
import { SUPPLIER_PRODUCT_DRAFTS } from './supplierProductBatches';
import { PRODUCT_MEDIA_MAP } from './productMediaMap';

/**
 * Guru Diamonds Active Catalogue
 * Contains the 16 supplier products configured with authentic photography and catalogue pricing:
 * - Batch 1 (10 items): Ayyappa Mala and 9 Silver & Gemstone Rings
 * - Batch 2 (6 items): Silver Turtle Ring and 5 Stud Earrings
 */
export const INITIAL_PRODUCTS: Product[] = SUPPLIER_PRODUCT_DRAFTS.map((p) => {
  const media = PRODUCT_MEDIA_MAP[p.id];
  if (!media) return p;

  const price = media.price;
  const images = media.images;

  return {
    ...p,
    images,
    status: 'ACTIVE',
    enabled: true,
    metalColor: 'White',
    metalPurity: '925',
    hallmarked: true,
    totalStock: 5,
    readyToShip: true,
    dispatchDays: 3,
    pricingMode: 'FIXED',
    fixedPrice: price,
    gstPercentage: 3,
    variants:
      p.variants && p.variants.length > 0
        ? p.variants.map((v) => ({ ...v, price, stock: 5, images, enabled: true }))
        : [
            {
              id: `${p.id}-var-std`,
              sku: `${p.sku}-STD`,
              barcode: `${p.sku}-STD`,
              attributes: { Standard: 'Default' },
              price,
              compareAtPrice: Math.round(price * 1.15),
              netWeightGrams: p.netWeightGrams,
              grossWeightGrams: p.grossWeightGrams,
              stock: 5,
              images,
              enabled: true,
              dispatchTimeDays: 3,
            },
          ],
    supplierReview: p.supplierReview
      ? ({
          ...p.supplierReview,
          state: 'APPROVED',
          issues: [],
          pendingFields: [],
          resolutionNotes: 'Approved by administrator with authentic product photography and catalogue pricing.',
          purchaseMode: 'STANDARD',
          pricing: {
            ...(p.supplierReview.pricing || {}),
            gstBasis: 'INCLUSIVE',
            gstPercentage: 3,
            gstAmount: Math.round((price * 0.03) / 1.03),
            suppliedSellingPrice: price,
          },
        } as unknown as Product['supplierReview'])
      : undefined,
  };
});

export const mockProducts = INITIAL_PRODUCTS;
