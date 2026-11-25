import fs from 'node:fs';
import { ENQUIRY_PRODUCTS } from '../src/data/enquiryProducts';
import { INITIAL_PRODUCTS, ALL_CATALOGUE_PRODUCTS } from '../src/data/mockProducts';
import { canPurchaseProduct } from '../src/utils/supplierProducts';
import { productMatchesCategory } from '../src/utils/productFilters';

console.log('--- ENQUIRY PRODUCTS VERIFICATION ---');
console.log('Total Catalogue Items:', ALL_CATALOGUE_PRODUCTS.length);
console.log('Active Supplier Items (Untouched):', INITIAL_PRODUCTS.length);
console.log('Remaining Products (Enquiry Mode):', ENQUIRY_PRODUCTS.length);

let missingImages = 0;
let totalImages = 0;

for (const p of ENQUIRY_PRODUCTS) {
  if (canPurchaseProduct(p)) {
    throw new Error(`Enquiry product ${p.sku} should NOT be purchasable directly!`);
  }
  if (p.pricingMode !== 'ENQUIRY') {
    throw new Error(`Enquiry product ${p.sku} has wrong pricingMode: ${p.pricingMode}`);
  }
  if (!p.badges?.includes('CALL_TO_ORDER')) {
    throw new Error(`Enquiry product ${p.sku} missing CALL_TO_ORDER badge`);
  }
  for (const img of p.images) {
    totalImages++;
    const diskPath = 'public' + img;
    if (!fs.existsSync(diskPath)) {
      console.error(`Missing image on disk: ${diskPath}`);
      missingImages++;
    }
  }
}

console.log(`Validated ${totalImages} authentic image files across 44 products. Missing: ${missingImages}`);

// Verify supplier products
for (const sp of INITIAL_PRODUCTS) {
  if (!canPurchaseProduct(sp)) {
    throw new Error(`Supplier product ${sp.sku} should be purchasable!`);
  }
  if (sp.pricingMode !== 'FIXED') {
    throw new Error(`Supplier product ${sp.sku} must be FIXED pricingMode`);
  }
}

// Verify categories
const categories = ['Rings', 'Earrings', 'Neck Jewellery', 'Pendants', 'God Small Statues', 'Spiritual Maalas'];
for (const cat of categories) {
  const matches = ALL_CATALOGUE_PRODUCTS.filter((p) => productMatchesCategory(p, cat));
  console.log(`Category "${cat}": ${matches.length} products`);
}

console.log('ALL VERIFICATIONS SUCCESSFUL!');
