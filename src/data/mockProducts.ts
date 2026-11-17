import { Product } from '../types';
import { SUPPLIER_PRODUCT_DRAFTS } from './supplierProductBatches';

/**
 * Guru Diamonds Catalogue
 * Contains strictly the 16 supplier product drafts from the two verified batches:
 * - Batch 1 (10 items): Ayyappa Mala and 9 Silver & Gemstone Rings
 * - Batch 2 (6 items): Silver Turtle Ring and 5 Stud Earrings
 *
 * All demo jewellery products (56 items) have been safely removed.
 * Full backup of demo products is preserved at:
 * backups/catalog-cleanup-20261117/demo-products-backup-20261117.json
 */
export const INITIAL_PRODUCTS: Product[] = [...SUPPLIER_PRODUCT_DRAFTS];
export const mockProducts = INITIAL_PRODUCTS;
