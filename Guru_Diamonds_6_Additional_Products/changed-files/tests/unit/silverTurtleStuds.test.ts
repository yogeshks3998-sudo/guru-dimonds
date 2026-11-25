import { SILVER_TURTLE_AND_STUD_PRODUCTS as batch } from '../../src/data/silverTurtleAndStudProducts';
import { SUPPLIER_PRODUCT_DRAFTS } from '../../src/data/supplierProductBatches';
import { INITIAL_PRODUCTS } from '../../src/data/mockProducts';
import { planSilverImport, applySilverImport } from '../../scripts/lib/import-silver-products';
import { canPurchaseProduct, mergeMissingSupplierProducts } from '../../src/utils/supplierProducts';
import { isProductActive } from '../../src/utils/productFilters';
import { toProductCreateData, toProductResponse } from '../../backend/src/utils/serializers';

const source = [
 [5.5,6.5,1100,400,74,1574], [5,5.110,1000,700,344,2044], [8,9,1600,1020,980,3600],
 [3.260,4.260,652,400,650,1702], [3.760,4.760,752,500,652,1904], [3.2,4.410,640,720,404,1764],
];

describe('Six additional silver supplier products', () => {
 test('adds exactly six distinct products while keeping both same-named supplier entries separate',()=>{
  expect(batch).toHaveLength(6); expect(SUPPLIER_PRODUCT_DRAFTS).toHaveLength(16);
  expect(INITIAL_PRODUCTS).toHaveLength(72);
  for (const field of ['id','sku','slug'] as const) expect(new Set(INITIAL_PRODUCTS.map(p=>p[field])).size).toBe(INITIAL_PRODUCTS.length);
  expect(batch.filter(p=>p.supplierReview.raw.originalName==='silver stones tops')).toHaveLength(2);
  expect(planSilverImport(INITIAL_PRODUCTS.filter(p=>!p.supplierReview),batch).create).toHaveLength(6);
 });
 test.each(batch.map((p,i)=>[p.sku,p,source[i]] as const))('%s preserves all pricing and supplier values without approving purchase',(_sku,p,values)=>{
  const r=p.supplierReview!;
  expect([p.netWeightGrams,p.grossWeightGrams,r.pricing.suppliedMetalValue,r.pricing.stoneOrBeadValue,r.pricing.makingCharges,r.pricing.suppliedSellingPrice]).toEqual(values);
  expect(r.pricing.calculatedMetalValue).toBe(r.pricing.suppliedMetalValue);
  expect(r.pricing.suppliedComponentSubtotal).toBe(r.pricing.suppliedSellingPrice);
  expect(r.raw.metalPuritySupplied).toBe('92');expect(p.metalPurity).toBe('UNVERIFIED');
  expect(p.images).toEqual([]);expect(p.variants).toEqual([]);expect(p.variantAttributes).toEqual([]);
  expect(p.status).toBe('DRAFT');expect(p.enabled).toBe(false);expect(p.totalStock).toBe(0);
  expect(p.certified).toBe(false);expect(p.hallmarked).toBe(false);expect(p.badges).toEqual([]);
  expect(r.raw.stoneCertificationSupplied).toBeNull();expect(r.raw.warrantyAvailableSupplied).toBeNull();
  expect(r.pricing.gstBasis).toBe('UNKNOWN');expect(p.fixedPrice).toBeUndefined();
  expect(p.rating).toBe(0);expect(p.reviewCount).toBe(0);
  expect(isProductActive({...p,status:'ACTIVE',enabled:true})).toBe(false);
  expect(canPurchaseProduct({...p,status:'ACTIVE',enabled:true})).toBe(false);
  expect(toProductResponse({...p,...toProductCreateData(p)} as any).supplierReview).toEqual(r);
  expect(p.shortDescription.split(/\s+/).length).toBeGreaterThanOrEqual(20);
  expect(p.shortDescription.split(/\s+/).length).toBeLessThanOrEqual(35);
  expect(p.description.split(/\s+/).length).toBeGreaterThanOrEqual(90);
  expect(p.description.split(/\s+/).length).toBeLessThanOrEqual(150);
  expect(p.seoDescription.length).toBeLessThanOrEqual(160);
 });
 test('does not infer ambiguous stone units, pair quantities, natural gemstones or ring sizes for earrings',()=>{
  expect(batch[1].supplierReview.raw.totalStoneWeightOriginal).toBe('0.110mili');
  expect(batch[1].supplierReview.specifications['Total stone weight']).toContain('unit unclear');
  expect(batch[2].supplierReview.raw.ringSizeSupplied).toBe('customised sizes');
  expect(batch[3].supplierReview.specifications.Stones).toContain('classification');
  expect(batch[4].name).toContain('Synthetic Ruby');expect(batch[5].name).toContain('Synthetic Emerald');
  for(const p of batch.slice(1)){
   expect(p.category).toBe('Earrings');expect(p.subcategory).toBe('Studs');
   expect(p.supplierReview.specifications['Package quantity']).toContain('requires confirmation');
  }
 });
 test('repeat local merge and import skip previously edited products without changes',async()=>{
  const records:any[]=[];const categories:any[]=[];
  const tx={product:{findMany:async()=>records,create:async({data}:any)=>{records.push({...data,variants:[]});return data;}},category:{findFirst:async({where}:any)=>categories.find(c=>c.name===where.name.equals),create:async({data}:any)=>{categories.push(data);return data;},update:async({where,data}:any)=>Object.assign(categories.find(c=>c.id===where.id),data)}};
  expect((await applySilverImport(tx,batch)).created).toHaveLength(6);
  records[0].name='Seller edited title';records[0].inventoryItems={quantity:42};records[1].images=['/actual.jpg'];
  const snapshot=JSON.stringify(records);
  expect((await applySilverImport(tx,batch)).created).toHaveLength(0);
  expect(JSON.stringify(records)).toBe(snapshot);
  expect(mergeMissingSupplierProducts(records,batch)).toEqual(records);
 });
});
